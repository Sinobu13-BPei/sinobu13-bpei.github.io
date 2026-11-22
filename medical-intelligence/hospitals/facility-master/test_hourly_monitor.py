#!/usr/bin/env python3
"""Offline regression tests: a truncated or modified published CSV must fail QA."""
import importlib.util
import tempfile
import threading
import unittest
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("hourly_monitor", HERE / "hourly_monitor.py")
monitor = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(monitor)


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass


class PublicIntegrityTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.repo = Path(self.temp.name) / "repo"
        self.public = Path(self.temp.name) / "public"
        self.repo.mkdir()
        self.public.mkdir()
        self.server = ThreadingHTTPServer(
            ("127.0.0.1", 0), partial(QuietHandler, directory=str(self.public))
        )
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.addCleanup(self.server.server_close)
        self.addCleanup(self.server.shutdown)
        self.url = "http://127.0.0.1:" + str(self.server.server_port) + "/"
        self.path = "medical-intelligence/hospitals/facility-master/data/test.csv"
        self.original = b"name,address\n" + b"Hospital,Example City\n" * 600
        self.put(self.repo, self.original)
        self.put(self.public, self.original)

    def put(self, base, content, path=None):
        f = base / (path or self.path)
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_bytes(content)

    def verify(self, path=None):
        return monitor.check_public_resource(
            path or self.path, base=self.url, root=self.repo, timeout=5
        )

    def test_full_file_exact_match(self):
        passed, detail = self.verify()
        self.assertTrue(passed, detail)
        self.assertIn("SHA256_equal=True", detail)

    def test_identical_prefix_but_modified_suffix_fails(self):
        self.assertGreater(len(self.original), 8192)
        changed = self.original[:-1] + b"!"
        self.assertEqual(len(self.original), len(changed))
        self.assertEqual(self.original[:8192], changed[:8192])
        self.put(self.public, changed)
        passed, detail = self.verify()
        self.assertFalse(passed, detail)
        self.assertIn("SHA256_equal=False", detail)

    def test_truncated_published_file_fails(self):
        self.put(self.public, self.original[:8192])
        passed, detail = self.verify()
        self.assertFalse(passed, detail)
        self.assertIn("public_bytes=8192", detail)

    def test_published_extra_bytes_fails(self):
        self.put(self.public, self.original + b"extra\n")
        passed, detail = self.verify()
        self.assertFalse(passed, detail)
        self.assertIn("exceeds repository bytes", detail)

    def test_published_html_smoke(self):
        path = "medical-intelligence/hospitals/facility-master/"
        content = (
            b'<!doctype html><html><head><title>Facility master</title></head><body>'
            b'identity-navi legacy-hospitals-20261122.csv '
            + b'valid page content ' * 10 + b'</body></html>'
        )
        self.put(self.repo, content, path + "index.html")
        self.put(self.public, content, path + "index.html")
        self.assertTrue(self.verify(path)[0])
        self.put(self.public, b"<html>empty</html>", path + "index.html")
        self.assertFalse(self.verify(path)[0])


if __name__ == "__main__":
    unittest.main()
