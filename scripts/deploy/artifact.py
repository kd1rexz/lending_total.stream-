#!/usr/bin/env python3
"""Seal/verify an already checked dist; this does not run the build or approve content."""
import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import shutil
import sys
from urllib.parse import unquote, urlsplit

ALLOWED = {".html", ".css", ".js", ".mjs", ".json", ".xml", ".txt", ".svg", ".png", ".jpg", ".jpeg", ".webp", ".avif", ".ico", ".woff", ".woff2", ".gif", ".mp4", ".webm"}


def digest(file):
    checksum = hashlib.sha256()
    with file.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            checksum.update(chunk)
    return checksum.hexdigest()


def site_url(value):
    url = urlsplit(value)
    if url.scheme != "https" or not url.hostname or url.username or url.password or url.port or url.path not in ("", "/") or url.query or url.fragment:
        raise ValueError("site-url must be a canonical HTTPS origin")
    return value.rstrip("/")


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.robots, self.canonicals, self.urls = [], [], []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta" and attrs.get("name", "").lower() == "robots":
            self.robots.append(attrs.get("content", "").lower())
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs.get("href"))
        for key in ("src", "href", "poster"):
            if attrs.get(key):
                self.urls.append(attrs[key])
        if attrs.get("srcset"):
            self.urls.extend(item.strip().split()[0] for item in attrs["srcset"].split(",") if item.strip())


def inventory(dist):
    if dist.is_symlink() or not dist.is_dir():
        raise ValueError("dist must be a regular directory")
    files = {}
    for file in sorted(dist.rglob("*")):
        relative = file.relative_to(dist)
        if file.is_symlink() or any(part.startswith(".") for part in relative.parts):
            raise ValueError(f"Hidden or symlink entry rejected: {relative}")
        if file.is_dir():
            continue
        if not file.is_file() or file.suffix.lower() not in ALLOWED:
            raise ValueError(f"Non-static file rejected: {relative}")
        if file.suffix == ".html" and relative.as_posix() not in ("index.html", "404.html"):
            raise ValueError(f"Unexpected page for the single-page release: {relative}")
        if any(part in ("tests", "fixtures", "__components", "node_modules", "src") for part in relative.parts):
            raise ValueError(f"Development content rejected: {relative}")
        if relative.parts[0] == "_astro" and not re.search(r"\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9]+$", file.name):
            raise ValueError(f"_astro file has no expected content hash: {relative}")
        files[relative.as_posix()] = digest(file)
    for required in ("index.html", "404.html", "robots.txt"):
        if required not in files:
            raise ValueError(f"Missing {required}")
    return files


def check_dist(dist, context, url):
    files = inventory(dist)
    document = Document((dist / "index.html").read_text())
    noindex = any(re.search(r"\b(noindex|none)\b", value) for value in document.robots)
    if context == "preview" and not noindex:
        raise ValueError("Preview HTML must contain noindex")
    if context == "production":
        site_url(url)
        if noindex or document.canonicals != [url + "/"]:
            raise ValueError("Production requires one correct canonical and no noindex")
        if "sitemap.xml" not in files or url + "/" not in (dist / "sitemap.xml").read_text():
            raise ValueError("Production sitemap missing or does not use site-url")
        if re.search(r"Disallow:\s*/\s*$", (dist / "robots.txt").read_text(), re.M):
            raise ValueError("Production robots.txt blocks the site")
    for name in files:
        file = dist / name
        urls = []
        if file.suffix == ".html":
            urls = Document(file.read_text()).urls
        elif file.suffix == ".css":
            urls = re.findall(r"url\(\s*['\"]?([^'\")]+)", file.read_text())
        for resource in urls:
            parsed = urlsplit(resource.strip())
            if parsed.scheme or parsed.netloc or not parsed.path:
                continue
            relative = unquote(parsed.path)
            target = dist / relative.lstrip("/") if relative.startswith("/") else file.parent / relative
            resolved = target.resolve()
            if not resolved.is_relative_to(dist.resolve()):
                raise ValueError(f"Resource escapes dist: {name}: {resource}")
            if resolved.is_dir():
                resolved /= "index.html"
            if not resolved.is_file():
                raise ValueError(f"Missing resource: {name}: {resource}")
    return files


def verify(artifact, expected_context, expected_url, expected_manifest_hash):
    manifest_file = artifact / "manifest.json"
    if artifact.is_symlink() or manifest_file.is_symlink() or not re.fullmatch(r"[a-f0-9]{64}", expected_manifest_hash):
        raise ValueError("Invalid artifact or expected manifest SHA256")
    if digest(manifest_file) != expected_manifest_hash:
        raise ValueError("Manifest SHA256 mismatch")
    manifest = json.loads(manifest_file.read_text())
    if manifest.get("schema") != 1 or manifest.get("context") != expected_context or manifest.get("siteUrl") != expected_url:
        raise ValueError("Artifact environment mismatch")
    if not re.fullmatch(r"[a-f0-9]{40}", manifest.get("commit", "")):
        raise ValueError("Full source commit required")
    if check_dist(artifact / "dist", expected_context, expected_url) != manifest.get("files"):
        raise ValueError("Artifact contents/checksums differ from manifest")
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("dist", type=Path)
    parser.add_argument("output", type=Path, help="New directory only")
    parser.add_argument("--context", choices=("preview", "production"), required=True)
    parser.add_argument("--site-url", default="")
    parser.add_argument("--commit", required=True, help="Full SHA of the clean checkout used for this build")
    parser.add_argument("--node-version", required=True)
    parser.add_argument("--pnpm-version", required=True)
    args = parser.parse_args()
    url = site_url(args.site_url) if args.site_url else ""
    if not re.fullmatch(r"[a-f0-9]{40}", args.commit):
        raise ValueError("commit must be a full 40-character SHA")
    if any(not re.fullmatch(r"v?\d+\.\d+\.\d+(?:[-+].+)?", value) for value in (args.node_version, args.pnpm_version)):
        raise ValueError("Provide actual Node and pnpm versions")
    # Inspect before writing; output must be outside the source directory.
    if args.dist.is_symlink():
        raise ValueError("dist cannot be a symlink")
    source = args.dist.resolve()
    if args.output.resolve().is_relative_to(source):
        raise ValueError("Output must be outside dist")
    before = check_dist(source, args.context, url)
    args.output.mkdir(parents=True, exist_ok=False)
    shutil.copytree(source, args.output / "dist")
    after = check_dist(args.output / "dist", args.context, url)
    if before != after:
        raise ValueError("dist changed while copying; output is incomplete, do not deploy")
    manifest = {"schema": 1, "context": args.context, "siteUrl": url, "commit": args.commit,
                "nodeVersion": args.node_version, "pnpmVersion": args.pnpm_version, "files": after}
    manifest_file = args.output / "manifest.json"
    manifest_file.write_text(json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2) + "\n")
    print(f"Artifact: {args.output}\nManifest SHA256: {digest(manifest_file)}")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
