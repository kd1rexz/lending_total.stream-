#!/usr/bin/env python3
"""Check the actual HTTPS endpoint against a sealed artifact; never follows redirects."""
import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import sys
from urllib.error import HTTPError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener
import uuid
from artifact import site_url


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def fetch(url, auth=None):
    headers = {"User-Agent": "TotalStream-release-smoke/1", "Accept-Encoding": "identity"}
    if auth:
        headers["Authorization"] = auth
    request = Request(url, headers=headers)
    try:
        response = build_opener(NoRedirect).open(request, timeout=20)
    except HTTPError as error:
        response = error
    with response:
        return response.status, response.headers, response.read()


def require(condition, message):
    if not condition:
        raise ValueError(message)


def common(headers, staging):
    require(headers.get("X-Content-Type-Options") == "nosniff", "Missing nosniff")
    if staging:
        require("noindex" in headers.get("X-Robots-Tag", ""), "Staging response missing noindex")
    else:
        require("noindex" not in headers.get("X-Robots-Tag", ""), "Production response has noindex")


def redirect(source, target, staging):
    code, headers, _ = fetch(source)
    require(code in (301, 308) and headers.get("Location") == target, f"Wrong redirect: {source}")
    common(headers, staging)
    print(f"PASS redirect {source}")


def check_file(base, name, expected, auth, staging):
    code, headers, body = fetch(base + "/" + name, auth)
    require(code == 200, f"{name}: expected 200, got {code}")
    common(headers, staging)
    require(hashlib.sha256(body).hexdigest() == expected, f"{name}: response differs from artifact")
    cache = headers.get("Cache-Control", "")
    if name.startswith("_astro/"):
        require("max-age=31536000" in cache and "immutable" in cache, f"{name}: immutable cache missing")
    elif name.endswith(".html"):
        require(("no-store" if staging else "no-cache") in cache, f"{name}: wrong HTML cache")
    elif name in ("favicon.svg", "robots.txt", "sitemap.xml"):
        require(("no-store" if staging else "max-age=300") in cache, f"{name}: wrong public cache")
    mime = headers.get_content_type()
    expected_types = {
        ".js": ("application/javascript", "text/javascript"), ".mjs": ("application/javascript", "text/javascript"),
        ".css": ("text/css",), ".html": ("text/html",), ".woff2": ("font/woff2",), ".woff": ("font/woff",),
        ".svg": ("image/svg+xml",), ".png": ("image/png",), ".jpg": ("image/jpeg",), ".jpeg": ("image/jpeg",),
        ".webp": ("image/webp",), ".avif": ("image/avif",), ".xml": ("application/xml", "text/xml"), ".txt": ("text/plain",),
    }.get(Path(name).suffix)
    if expected_types:
        require(mime in expected_types, f"{name}: unexpected MIME {mime}")
    print(f"PASS /{name} (200, bytes, MIME, cache)")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", required=True)
    parser.add_argument("--environment", choices=("production", "staging"), required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--previous-manifest", type=Path)
    parser.add_argument("--alias", action="append", default=[], help="Alternative HTTPS origin to check")
    args = parser.parse_args()
    base, staging = site_url(args.url), args.environment == "staging"
    manifest = json.loads(args.manifest.read_text())
    require(manifest["siteUrl"] == base, "Manifest siteUrl differs from endpoint")
    require(manifest["context"] == ("preview" if staging else "production"), "Wrong build context for endpoint")
    auth = None
    if staging:
        user, password = os.environ.get("TS_SMOKE_USER"), os.environ.get("TS_SMOKE_PASSWORD")
        require(bool(user and password), "Set TS_SMOKE_USER and TS_SMOKE_PASSWORD for staging")
        auth = "Basic " + base64.b64encode(f"{user}:{password}".encode()).decode()
        protected = ["/"] + ["/" + name for name in manifest["files"] if name.startswith("_astro/")][:1]
        for path in protected:
            code, headers, _ = fetch(base + path)
            require(code == 401 and "Basic" in headers.get("WWW-Authenticate", ""), "Staging must require Basic Auth")
            common(headers, True)
            require("no-store" in headers.get("Cache-Control", ""), "Staging 401 must be no-store")
        print("PASS staging authentication")
    code, headers, body = fetch(base + "/", auth)
    require(code == 200, f"Root expected 200, got {code}")
    require(hashlib.sha256(body).hexdigest() == manifest["files"]["index.html"], "Root serves another release")
    common(headers, staging)
    print("PASS canonical root and TLS")
    for name, expected in manifest["files"].items():
        if name != "404.html":
            check_file(base, name, expected, auth, staging)
    for path in ("/__missing-" + uuid.uuid4().hex, "/_astro/missing.12345678.js", "/.env", "/404.html"):
        code, headers, body = fetch(base + path, auth)
        require(code == 404, f"{path}: expected 404, got {code}")
        common(headers, staging)
        require("no-store" in headers.get("Cache-Control", ""), f"{path}: error must be no-store")
        require(hashlib.sha256(body).hexdigest() == manifest["files"]["404.html"], f"{path}: wrong error page body")
        print(f"PASS {path} (404, no-store)")
    probe = "/__redirect-check?source=smoke"
    redirect("http://" + urlsplit(base).netloc + probe, base + probe, staging)
    for alias in args.alias:
        alias = site_url(alias)
        redirect(alias + probe, base + probe, staging)
        redirect("http://" + urlsplit(alias).netloc + probe, base + probe, staging)
    if args.previous_manifest:
        previous = json.loads(args.previous_manifest.read_text())
        require(previous["siteUrl"] == base and previous["context"] == manifest["context"], "Previous manifest belongs to another environment")
        for name, expected in previous["files"].items():
            if name.startswith("_astro/"):
                check_file(base, name, expected, auth, staging)
        print("PASS assets from previous release")
    print("HTTP smoke passed. Record this result and release ID in the deployment report.")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, KeyError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        sys.exit(1)
