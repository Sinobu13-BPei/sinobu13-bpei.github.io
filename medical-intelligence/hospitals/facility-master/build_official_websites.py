#!/usr/bin/env python3
"""Build a source-pinned, non-mutating website overlay for the legacy hospital master.

Only Navi matches classified as exact unique may receive the hospital self-reported
"案内用ホームページアドレス" field. These are NAVI-listed URLs, not independently
certified as live/official. Ambiguous or duplicated URLs remain unlinked.
"""
from __future__ import annotations
import argparse
import ipaddress
import json
import re
from collections import Counter
from pathlib import Path
from urllib.parse import urlsplit
import pandas as pd

from match_navi_20260601 import (
    AS_OF, DATA, OFFICIAL_PAGE, OFFICIAL_ZIP_SHA256,
    address_key, fetch_zip, name_key, pref, PREF_CODE, value,
)

COLUMN = "案内用ホームページアドレス"
FILE = "official-websites-navi-20260601.csv"
REPORT = "official-websites-audit-20260601.json"
OUTPUT_COLS = [
    "facility_uid", "legacy_prefecture", "legacy_name",
    "navi_facility_id_confirmed", "website_url",
    "website_evidence", "source_data_as_of", "source_url", "source_zip_sha256"
]
# Domains that are not individual hospitals' own homepages.
BLOCKED = {
    "google.com", "www.google.com", "google.co.jp", "www.google.co.jp",
    "facebook.com", "www.facebook.com", "instagram.com", "www.instagram.com",
    "x.com", "twitter.com", "youtube.com", "www.youtube.com",
    "wikipedia.org", "ja.wikipedia.org", "caloo.jp", "www.caloo.jp",
    "byoinnavi.jp", "www.byoinnavi.jp", "map.yahoo.co.jp",
}


def normalize_url(raw):
    raw = value(raw)
    if not raw:
        return "", "empty"
    if len(raw) > 1800 or re.search(r"[\x00-\x20\x7f<>{}\\\"']", raw):
        return "", "invalid_characters"
    try:
        url = urlsplit(raw)
        if url.scheme.lower() not in ("https", "http"):
            return "", "invalid_scheme"
        if not url.hostname or url.username or url.password:
            return "", "invalid_host"
        host = url.hostname.lower().rstrip(".")
        if host in BLOCKED or host.endswith(".local") or host == "localhost":
            return "", "third_party_or_local"
        if "." not in host:
            return "", "invalid_host"
        try:
            addr = ipaddress.ip_address(host)
            if not addr.is_global:
                return "", "nonpublic_ip"
        except ValueError:
            pass
        if url.port is not None and url.port not in (80, 443):
            return "", "nonstandard_port"
        return raw, ""
    except (ValueError, UnicodeError):
        return "", "invalid_url"


def build(legacy, matched, official, digest):
    if digest != OFFICIAL_ZIP_SHA256:
        raise ValueError("Pinned official source SHA mismatch")
    if len(legacy) != 8019 or len(matched) != 8019 or len(official) != 7715:
        raise ValueError("Hospital baseline count changed")
    if COLUMN not in official.columns or len(official.columns) != 65:
        raise ValueError("Official homepage column missing or schema changed")
    if not legacy.facility_uid.is_unique or not matched.facility_uid.is_unique:
        raise ValueError("Legacy identity no longer unique")
    if legacy.facility_uid.tolist() != matched.facility_uid.tolist():
        raise ValueError("Legacy and crosswalk UID/order mismatch")
    if matched.match_status.value_counts().get("確定一致", 0) != 3453:
        raise ValueError("Confirmed matching count has changed")
    confirmed = matched[matched.match_status == "確定一致"]
    if not confirmed.navi_facility_id_confirmed.is_unique:
        raise ValueError("Confirmed Navi ID collision")
    if not matched[matched.match_status != "確定一致"].navi_facility_id_confirmed.eq("").all():
        raise ValueError("Unconfirmed facility has a confirmed Navi ID")

    official_by_id = official.set_index("ID", verify_integrity=True)
    legacy_by_uid = legacy.set_index("facility_uid", verify_integrity=True)
    cautions = pd.read_csv(DATA / "identity-confirmed-caution-20260601.csv",
                          dtype=str, keep_default_na=False, encoding="utf-8-sig")
    conflicts = pd.read_csv(DATA / "identity-conflict-review-20260601.csv",
                           dtype=str, keep_default_na=False, encoding="utf-8-sig")
    held_uids = set(cautions.facility_uid)  # Review name differences before official links
    held_navi_ids = set(conflicts.navi_facility_id_candidate) - {""}
    candidate_urls = []
    excluded = Counter()
    for row in confirmed.itertuples(index=False):
        uid = row.facility_uid
        if uid in held_uids or row.navi_facility_id_confirmed in held_navi_ids:
            excluded["identity_caution_or_conflict"] += 1
            continue
        if row.navi_facility_id_confirmed not in official_by_id.index:
            raise ValueError("Confirmed ID missing from pinned source: " + uid)
        original = official_by_id.loc[row.navi_facility_id_confirmed]
        legacy_row = legacy_by_uid.loc[uid]
        if not (
            pref(legacy_row["prefecture"]) == PREF_CODE[value(original["都道府県コード"])]
            and name_key(legacy_row["facility_name"]) == name_key(original["正式名称"])
            and address_key(legacy_row["address"]) == address_key(original["所在地"])
        ):
            raise ValueError("Pinned official identity differs from exact confirmed baseline: " + uid)
        homepage, error = normalize_url(original[COLUMN])
        if error:
            excluded[error] += 1
            continue
        candidate_urls.append({
            "facility_uid": uid,
            "legacy_prefecture": legacy_row["prefecture"],
            "legacy_name": legacy_row["facility_name"],
            "navi_facility_id_confirmed": row.navi_facility_id_confirmed,
            "website_url": homepage,
            "website_evidence": "医療情報ネット掲載の案内用ホームページ（リンク先の現況未確認）",
            "source_data_as_of": AS_OF,
            "source_url": OFFICIAL_PAGE,
            "source_zip_sha256": digest,
        })

    # If multiple facilities refer to exactly the same URL, it might be a group
    # portal rather than a single hospital. Hold it for later human review.
    counts = Counter(x["website_url"].rstrip("/").casefold() for x in candidate_urls)
    safe = []
    for row in candidate_urls:
        if counts[row["website_url"].rstrip("/").casefold()] > 1:
            excluded["shared_url_manual_review"] += 1
            continue
        safe.append(row)
    if len(safe) < 1000:
        raise ValueError("Unexpectedly few source-provided site URLs; do not publish")
    safe.sort(key=lambda row: row["facility_uid"])
    assert len({row["facility_uid"] for row in safe}) == len(safe)
    assert len({row["navi_facility_id_confirmed"] for row in safe}) == len(safe)
    assert len(safe) <= 3453
    report = {
        "stage": "facility-website-overlay-v1",
        "source_data_as_of": AS_OF,
        "source_zip_sha256": digest,
        "source_url": OFFICIAL_PAGE,
        "source_homepage_column": COLUMN,
        "official_records": len(official),
        "official_homepages_nonblank": int(official[COLUMN].ne("").sum()),
        "original_hospital_records_preserved": 8019,
        "confirmed_identity_rows_unchanged": 3453,
        "website_rows_published": len(safe),
        "excluded": dict(sorted(excluded.items())),
        "verification_level": "Navi published address and exact hospital identity; destination ownership/live status NOT independently verified",
        "unmatched_and_review_rows_not_linked": True,
        "site_urls_not_copied_into_legacy_master": True,
    }
    return pd.DataFrame(safe, columns=OUTPUT_COLS), report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--official-zip", type=Path)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    legacy = pd.read_csv(DATA / "legacy-hospitals-20261122.csv", dtype=str,
                         keep_default_na=False, encoding="utf-8-sig")
    matched = pd.read_csv(DATA / "identity-navi-20260601.csv", dtype=str,
                          keep_default_na=False, encoding="utf-8-sig")
    official, digest = fetch_zip(args.official_zip)
    links, report = build(legacy, matched, official, digest)
    if args.check:
        actual = pd.read_csv(DATA / FILE, dtype=str, keep_default_na=False, encoding="utf-8-sig")
        if not actual.equals(links):
            raise ValueError("Published website overlay differs from pinned source")
        current = json.loads((DATA / REPORT).read_text(encoding="utf-8"))
        if current != report:
            raise ValueError("Published website audit differs from pinned source")
    else:
        links.to_csv(DATA / FILE, index=False, encoding="utf-8-sig")
        (DATA / REPORT).write_text(
            json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
