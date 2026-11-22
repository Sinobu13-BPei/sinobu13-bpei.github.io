#!/usr/bin/env python3
"""Non-mutating hourly QA for the hospital master and published Pages assets.

A 200 response and an 8 KiB prefix are not sufficient to validate a CSV.
For published CSV/JSON/JS, require the entire byte stream to match the
corresponding checked-out repository file, including size and SHA-256.
"""
import argparse
import csv
import hashlib
import json
import sys
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "https://sinobu13-bpei.github.io/"
REL = "medical-intelligence/hospitals/facility-master/"
PAGES = (
    "medical-intelligence/",
    "medical-intelligence/hospitals/",
    REL,
)
ASSETS = (
    REL + "identity-ui.js",
    REL + "data/legacy-hospitals-20261122.csv",
    REL + "data/quality-baseline.json",
    REL + "data/identity-summary-20260601.json",
    REL + "data/identity-risk-audit-20260601.json",
    REL + "data/identity-navi-20260601.csv",
    REL + "data/identity-review-20260601.csv",
    REL + "data/identity-crosswalk-verified-navi-20260601.csv",
    REL + "data/identity-review-triage-20260601.csv",
    REL + "data/identity-conflict-review-20260601.csv",
    REL + "data/identity-confirmed-caution-20260601.csv",
    REL + "data/identity-unmatched-triage-20260601.csv",
    REL + "data/identity-crosswalk.csv",
)
FILES = PAGES + ASSETS


def digest_file(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as stream:
        for block in iter(lambda: stream.read(256 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def check_public_resource(path, base=BASE, root=ROOT, timeout=12):
    """Return (passed, explanation); streaming full-file comparison for assets."""
    is_html = path.endswith("/")
    expected = root / path / "index.html" if is_html else root / path
    if not expected.is_file():
        return False, "Repository file missing: " + str(expected)
    req = urllib.request.Request(
        base.rstrip("/") + "/" + path,
        headers={
            "User-Agent": "MedicalMKT-HourlyQA/Rev11",
            "Accept-Encoding": "identity",
            "Cache-Control": "no-cache",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as response:
        status = response.status
        if status != 200:
            return False, "HTTP " + str(status)
        if is_html:
            prefix = response.read(16384).lower()
            valid = len(prefix) >= 100 and (b"<html" in prefix or b"<!doctype" in prefix)
            if path == REL:
                valid = valid and b"identity-navi" in prefix and b"legacy-hospitals-20261122.csv" in prefix
            return valid, "HTTP 200; HTML prefix bytes=" + str(len(prefix))
        expected_size = expected.stat().st_size
        expected_sha256 = digest_file(expected)
        size, actual_hash = 0, hashlib.sha256()
        for block in iter(lambda: response.read(256 * 1024), b""):
            size += len(block)
            if size > expected_size:
                return False, (
                    "Public asset exceeds repository bytes; expected="
                    + str(expected_size) + ", received>" + str(expected_size)
                )
            actual_hash.update(block)
        actual_sha256 = actual_hash.hexdigest()
        ok = size == expected_size and actual_sha256 == expected_sha256
        return ok, (
            "HTTP 200; public_bytes=" + str(size)
            + "; repo_bytes=" + str(expected_size)
            + "; SHA256_equal=" + str(actual_sha256 == expected_sha256)
        )


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--public", action="store_true")
    p.add_argument("--report", default="reports/medical-intelligence-hourly-health.json")
    args = p.parse_args()
    checks = []

    def add(name, passed, details=""):
        checks.append({"name": name, "passed": bool(passed), "details": str(details)})

    source = (ROOT / "medical-intelligence/hospitals/index.html").read_text(encoding="utf-8")
    count = source.count("<tr data-text=")
    add("source_8019_rows", count == 8019, count)
    with (ROOT / (REL + "data/legacy-hospitals-20261122.csv")).open(
        encoding="utf-8-sig", newline=""
    ) as fp:
        rows = list(csv.DictReader(fp))
    add("master_8019_records", len(rows) == 8019, len(rows))
    add("master_47_prefectures", len(set(r["prefecture"] for r in rows)) == 47)
    add("master_uid_unique", len(set(r["facility_uid"] for r in rows)) == len(rows))
    code_fields = (
        "official_medical_institution_code", "official_corporate_number",
        "official_facility_code", "medical_area_2026_code",
    )
    add(
        "unverified_codes_still_blank",
        all(not r[field] for r in rows for field in code_fields),
        "Stage 1 baseline: four official code/area columns must stay blank",
    )
    if args.public:
        for path in FILES:
            passed, detail = False, ""
            for attempt in range(3):
                try:
                    passed, detail = check_public_resource(path)
                    if passed:
                        break
                except Exception as exc:
                    detail = type(exc).__name__ + ": " + str(exc)[:160]
                if attempt < 2:
                    time.sleep(2)
            add("public_" + path, passed, detail)

    failures = [x for x in checks if not x["passed"]]
    report = {
        "audit_version": "rev11-hourly-full-file-integrity-v1",
        "checked_at_utc": datetime.now(timezone.utc).isoformat(),
        "public_checked": args.public,
        "public_resource_count": len(FILES) if args.public else 0,
        "published_asset_verification": "whole-file byte count + SHA-256" if args.public else "not run",
        "checks": checks,
        "failures": failures,
    }
    target = Path(args.report)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"checks": len(checks), "failures": len(failures),
                      "public_checked": args.public}, ensure_ascii=False))
    if failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
