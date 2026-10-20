#!/usr/bin/env python3
"""Portable renderer checks; Linux/Nginx syntax and runtime need separate validation."""
import argparse
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("render_nginx", Path(__file__).with_name("render-nginx.py"))
nginx = importlib.util.module_from_spec(spec)
spec.loader.exec_module(nginx)


class NginxLoggingTest(unittest.TestCase):
    def config(self, **changes):
        values = dict(phase="https", environment="production", domain="totalstream.unit", alias=[],
                      root="/var/www/total-stream", acme_root="/var/www/acme",
                      cert="/etc/letsencrypt/live/totalstream.unit/fullchain.pem",
                      cert_key="/etc/letsencrypt/live/totalstream.unit/privkey.pem", auth_file="")
        values.update(changes)
        return argparse.Namespace(**values)

    def test_visitor_logs_disabled_on_every_virtual_host(self):
        for environment in ("production", "staging"):
            for phase in ("bootstrap", "https"):
                with self.subTest(environment=environment, phase=phase):
                    rendered = nginx.render(self.config(
                        phase=phase, environment=environment,
                        alias=["www.totalstream.unit"],
                        auth_file="/etc/nginx/total-stream.htpasswd",
                    ))
                    servers = rendered.split("server {")[1:]
                    self.assertEqual(len(servers), 1 if phase == "bootstrap" else 3)
                    for server in servers:
                        self.assertEqual(server.count("access_log off;"), 1)
                        self.assertEqual(server.count("error_log /dev/null crit;"), 1)
                        self.assertEqual(server.count("access_log "), 1)
                        self.assertEqual(server.count("error_log "), 1)
                    self.assertNotIn("$remote_addr", rendered)
                    self.assertNotIn("log_format", rendered)
                    self.assertNotIn("/var/log/nginx", rendered)

    def test_routes_and_protection_preserved(self):
        for environment in ("production", "staging"):
            with self.subTest(environment=environment):
                rendered = nginx.render(self.config(environment=environment,
                    alias=["www.totalstream.unit"], auth_file="/etc/nginx/total-stream.htpasswd"))
                for directive in ("error_page 404 /404.html;", "try_files $uri $uri/ =404;",
                                  "try_files $uri =404;", "ssl_protocols TLSv1.2 TLSv1.3;",
                                  "return 308 https://totalstream.unit$request_uri;",
                                  "location ^~ /.well-known/acme-challenge/", "internal;",
                                  "root /var/www/total-stream/shared;"):
                    self.assertIn(directive, rendered)
                self.assertNotIn("@@", rendered)
                self.assertEqual('auth_basic "Total Stream staging";' in rendered, environment == "staging")
                self.assertEqual("X-Robots-Tag" in rendered, environment == "staging")

    def test_unsafe_generator_inputs_still_fail(self):
        for changes in ({"domain": "example.com"}, {"cert": ""},
                        {"root": "/var/www/a; return 200"}, {"environment": "staging", "auth_file": ""}):
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                nginx.render(self.config(**changes))


if __name__ == "__main__":
    unittest.main(verbosity=2)
