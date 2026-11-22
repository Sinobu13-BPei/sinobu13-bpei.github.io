#!/usr/bin/env python3
"""Offline audit: every website overlay UID and Navi ID belongs to a confirmed hospital."""
from pathlib import Path
import json
import pandas as pd
from build_official_websites import (
    DATA, FILE, REPORT, OUTPUT_COLS, normalize_url, AS_OF, OFFICIAL_ZIP_SHA256
)

def check():
    read=lambda name: pd.read_csv(DATA/name,dtype=str,keep_default_na=False,encoding="utf-8-sig")
    base=read("legacy-hospitals-20261122.csv")
    identity=read("identity-navi-20260601.csv")
    links=read(FILE)
    audit=json.loads((DATA/REPORT).read_text(encoding="utf-8"))
    assert len(base)==len(identity)==8019
    assert base.facility_uid.tolist()==identity.facility_uid.tolist()
    assert len(links)==audit["website_rows_published"]
    assert len(links)>=1000 and len(links)<=3453
    assert list(links.columns)==OUTPUT_COLS
    assert links.facility_uid.is_unique and links.navi_facility_id_confirmed.is_unique
    assert identity.match_status.value_counts().get("確定一致")==3453
    assert audit["original_hospital_records_preserved"]==8019
    assert audit["confirmed_identity_rows_unchanged"]==3453
    assert audit["source_zip_sha256"]==OFFICIAL_ZIP_SHA256
    assert audit["source_data_as_of"]==AS_OF
    assert audit["unmatched_and_review_rows_not_linked"] is True
    assert audit["site_urls_not_copied_into_legacy_master"] is True
    allowed=identity.loc[identity.match_status=="確定一致"].set_index("facility_uid")
    for row in links.itertuples(index=False):
        assert row.facility_uid in allowed.index, "Review/unmatched row was linked: "+row.facility_uid
        ref=allowed.loc[row.facility_uid]
        assert ref.navi_facility_id_confirmed==row.navi_facility_id_confirmed
        assert row.legacy_name==ref.legacy_name and row.legacy_prefecture==ref.legacy_prefecture
        assert normalize_url(row.website_url)==(row.website_url,"")
        assert row.source_data_as_of==AS_OF and row.source_zip_sha256==OFFICIAL_ZIP_SHA256
    url_keys=links.website_url.str.rstrip("/").str.casefold()
    assert url_keys.is_unique, "One website URL was reused across several facilities"
    cautions=read("identity-confirmed-caution-20260601.csv")
    conflicts=read("identity-conflict-review-20260601.csv")
    assert not set(links.facility_uid)&set(cautions.facility_uid)
    assert not set(links.navi_facility_id_confirmed)&(set(conflicts.navi_facility_id_candidate)-{""})
    assert len(links)+sum(audit["excluded"].values())==3453
    print(json.dumps({"audit":"PASS","website_rows":len(links),
                      "identity":"exact matched","legacy_rows_preserved":len(base),
                      "excluded":audit["excluded"]},ensure_ascii=False))

if __name__=="__main__":
    check()
