#!/usr/bin/env python3
"""Render only; never install a config or touch Nginx."""
import argparse
import hashlib
import re
from pathlib import Path


def domain(value):
    value = value.lower()
    labels = value.split(".")
    if len(labels) < 2 or len(value) > 253 or any(
        not re.fullmatch(r"[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?", part)
        for part in labels
    ) or any(value == d or value.endswith("." + d) for d in (
        "example.com", "example.org", "example.net", "invalid", "localhost", "test"
    )) or "placeholder" in value:
        raise ValueError("Provide the real domain (no URL, wildcard or placeholder)")
    return value


def path(value):
    if not value or not re.fullmatch(r"/[A-Za-z0-9_./-]+", value) or ".." in Path(value).parts or value in ("/", "/etc", "/var") or any(
        mark in value.lower() for mark in ("placeholder", "changeme", "replace_me", "your-domain")
    ):
        raise ValueError("Provide an absolute, non-placeholder path without whitespace")
    return value.rstrip("/")


def render(args):
    name = domain(args.domain)
    aliases = [domain(alias) for alias in args.alias]
    if name in aliases or len(aliases) != len(set(aliases)):
        raise ValueError("Duplicate domain names")
    staging = args.environment == "staging"
    values = {
        "DOMAIN": name, "NAMES": " ".join([name] + aliases),
        "ACME_ROOT": path(args.acme_root),
        "ROBOTS": 'add_header X-Robots-Tag "noindex, nofollow" always;' if staging else "",
    }
    template_dir = Path(__file__).resolve().parents[2] / "infra/nginx"
    body = (template_dir / "http.conf.template").read_text()
    if args.phase == "https":
        values.update({
            "ROOT": path(args.root), "CERT": path(args.cert), "CERT_KEY": path(args.cert_key),
            "KEY": hashlib.sha256(name.encode()).hexdigest()[:12],
            "HTML_CACHE": "no-store" if staging else "no-cache",
            "PUBLIC_CACHE": "no-store" if staging else "public, max-age=300",
            "AUTH": f'auth_basic "Total Stream staging";\n    auth_basic_user_file {path(args.auth_file)};' if staging else "",
            "ALIAS_SERVER": "",
        })
        if aliases:
            values["ALIAS_SERVER"] = """server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name %s;
    ssl_certificate %s;
    ssl_certificate_key %s;
    ssl_protocols TLSv1.2 TLSv1.3;
    server_tokens off;
    # Explicitly override inherited request logging on redirects and ACME too.
    access_log off;
    error_log /dev/null crit;
    add_header X-Content-Type-Options nosniff always;
    %s
    add_header Cache-Control no-store always;
    return 308 https://%s$request_uri;
}
""" % (" ".join(aliases), values["CERT"], values["CERT_KEY"], values["ROBOTS"], name)
        body += "\n" + (template_dir / "https.conf.template").read_text()
    for key, value in values.items():
        body = body.replace("@@" + key + "@@", value)
    if "@@" in body:
        raise ValueError("Unresolved template token")
    return body


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--phase", choices=("bootstrap", "https"), required=True)
    parser.add_argument("--environment", choices=("production", "staging"), required=True)
    parser.add_argument("--domain", required=True)
    parser.add_argument("--alias", action="append", default=[])
    parser.add_argument("--acme-root", default="/var/www/acme")
    for flag in ("root", "cert", "cert-key", "auth-file"):
        parser.add_argument("--" + flag, default="")
    try:
        print(render(parser.parse_args()), end="")
    except ValueError as exc:
        parser.error(str(exc))
