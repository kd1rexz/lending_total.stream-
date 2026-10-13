#!/usr/bin/env python3
"""Local unit checks; not a substitute for a Linux/Nginx release rehearsal."""
import argparse
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from artifact import check_dist, digest, verify
from release import add_assets, release_id

spec = importlib.util.spec_from_file_location("render_nginx", Path(__file__).with_name("render-nginx.py"))
nginx = importlib.util.module_from_spec(spec)
spec.loader.exec_module(nginx)


class ToolsTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.base = Path(self.temp.name).resolve()
        self.dist = self.base / "dist"
        self.dist.mkdir()
        (self.dist / "_astro").mkdir()
        (self.dist / "index.html").write_text('<meta name="robots" content="noindex, nofollow"><link rel="stylesheet" href="/_astro/main.ABCDEFGH.css">')
        (self.dist / "404.html").write_text("<!doctype html><h1>Not found</h1>")
        (self.dist / "robots.txt").write_text("User-agent: *\nDisallow: /\n")
        (self.dist / "_astro/main.ABCDEFGH.css").write_text("body{color:white}")

    def tearDown(self):
        self.temp.cleanup()

    def config(self, **changes):
        values = dict(phase="https", environment="production", domain="totalstream.unit", alias=[], root="/var/www/total-stream", acme_root="/var/www/acme", cert="/etc/letsencrypt/live/totalstream.unit/fullchain.pem", cert_key="/etc/letsencrypt/live/totalstream.unit/privkey.pem", auth_file="")
        values.update(changes)
        return argparse.Namespace(**values)

    def test_https_and_staging_render(self):
        prod = nginx.render(self.config(alias=["www.totalstream.unit"]))
        self.assertNotIn("@@", prod)
        self.assertIn("root /var/www/total-stream/shared;", prod)
        self.assertIn("error_page 404 /404.html;", prod)
        self.assertIn("https://totalstream.unit$request_uri", prod)
        self.assertNotIn("noindex", prod)
        stage = nginx.render(self.config(environment="staging", auth_file="/etc/nginx/total-stream.htpasswd"))
        self.assertIn('auth_basic "Total Stream staging";', stage)
        self.assertEqual(stage.count("X-Content-Type-Options"), stage.count("X-Robots-Tag"))

    def test_generator_rejects_missing_and_unsafe_values(self):
        for changes in ({"domain": ""}, {"domain": "example.com"}, {"cert": ""}, {"root": "/var/www/a; return 200"}, {"environment": "staging", "auth_file": ""}):
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                nginx.render(self.config(**changes))
        bootstrap = nginx.render(self.config(phase="bootstrap", cert="", cert_key=""))
        self.assertNotIn("ssl_certificate", bootstrap)

    def test_preview_and_artifact_integrity(self):
        files = check_dist(self.dist, "preview", "https://totalstream.unit")
        manifest = {"schema": 1, "context": "preview", "siteUrl": "https://totalstream.unit", "commit": "a" * 40, "files": files}
        path = self.base / "manifest.json"
        path.write_text(json.dumps(manifest))
        self.assertEqual(verify(self.base, "preview", manifest["siteUrl"], digest(path)), manifest)
        (self.dist / "_astro/main.ABCDEFGH.css").write_text("changed")
        with self.assertRaisesRegex(ValueError, "checksums"):
            verify(self.base, "preview", manifest["siteUrl"], digest(path))

    def test_packaging_cli_and_no_overwrite(self):
        output = self.base / "artifact"
        command = [sys.executable, str(Path(__file__).with_name("artifact.py")), str(self.dist), str(output),
                   "--context", "preview", "--site-url", "https://totalstream.unit", "--commit", "a" * 40,
                   "--node-version", "v24.0.0", "--pnpm-version", "11.0.0"]
        result = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Manifest SHA256:", result.stdout)
        verify(output, "preview", "https://totalstream.unit", digest(output / "manifest.json"))
        result = subprocess.run(command, capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)

    def test_wrong_context_and_missing_resources_rejected(self):
        with self.assertRaises(ValueError):
            check_dist(self.dist, "production", "https://totalstream.unit")
        (self.dist / "_astro/main.ABCDEFGH.css").unlink()
        with self.assertRaisesRegex(ValueError, "Missing resource"):
            check_dist(self.dist, "preview", "")

    def test_hidden_symlink_and_unhashed_assets_rejected(self):
        for name in (".env", "source.ts", "_astro/main.css", "components.html"):
            file = self.dist / name
            file.write_text("unwanted")
            with self.subTest(name=name), self.assertRaises(ValueError):
                check_dist(self.dist, "preview", "")
            file.unlink()
        (self.dist / "outside.txt").symlink_to(self.base / "outside.txt")
        with self.assertRaises(ValueError):
            check_dist(self.dist, "preview", "")

    def test_production_requires_canonical_sitemap_and_robots(self):
        (self.dist / "index.html").write_text('<link rel="canonical" href="https://totalstream.unit/">')
        (self.dist / "sitemap.xml").write_text('<urlset><url><loc>https://totalstream.unit/</loc></url></urlset>')
        with self.assertRaisesRegex(ValueError, "robots"):
            check_dist(self.dist, "production", "https://totalstream.unit")
        (self.dist / "robots.txt").write_text("User-agent: *\nAllow: /\n")
        check_dist(self.dist, "production", "https://totalstream.unit")

    def test_shared_assets_do_not_overwrite_existing_url(self):
        root = self.base / "site"
        (root / "shared/_astro").mkdir(parents=True)
        manifest = {"files": check_dist(self.dist, "preview", "")}
        add_assets(root, self.dist, manifest)
        target = root / "shared/_astro/main.ABCDEFGH.css"
        self.assertEqual(target.read_bytes(), (self.dist / "_astro/main.ABCDEFGH.css").read_bytes())
        # A second identical publish is harmless; a collision leaves old bytes.
        add_assets(root, self.dist, manifest)
        (self.dist / "_astro/main.ABCDEFGH.css").write_text("different bytes")
        updated = {"files": check_dist(self.dist, "preview", "")}
        with self.assertRaisesRegex(ValueError, "collision"):
            add_assets(root, self.dist, updated)
        self.assertNotEqual(target.read_bytes(), (self.dist / "_astro/main.ABCDEFGH.css").read_bytes())

    def test_release_identifier(self):
        self.assertEqual(release_id("20261013T120000Z-abcdef1"), "20261013T120000Z-abcdef1")
        for value in ("", "../release", "current", "20261013T120000Z-placeholder"):
            with self.assertRaises(ValueError):
                release_id(value)


if __name__ == "__main__":
    unittest.main(verbosity=2)
