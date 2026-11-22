#!/usr/bin/env python3
"""Non-mutating offline integrity test for legacy site links and 4,921 review queue."""
import json
from pathlib import Path
import pandas as pd
from build_legacy_site_bridge import BRIDGE, QUEUE, AUDIT, read, PRIO
from build_official_websites import normalize_url

def validate():
    master=read("legacy-hospitals-20261122.csv")
    identity=read("identity-navi-20260601.csv")
    published=read("official-websites-navi-20260601.csv")
    links=read(BRIDGE)
    remaining=read(QUEUE)
    audit=json.loads((Path(__file__).resolve().parent/"data"/AUDIT).read_text(encoding="utf-8"))
    assert len(master)==len(identity)==8019
    assert len(published)==len(links)==3098
    assert len(remaining)==4921 and audit["unlinked_review_queue_rows"]==4921
    assert links.facility_uid.is_unique and remaining.facility_uid.is_unique
    assert links.source_row_no.is_unique
    assert set(links.facility_uid).isdisjoint(remaining.facility_uid)
    assert set(links.facility_uid)|set(remaining.facility_uid)==set(master.facility_uid)
    original=master.set_index("facility_uid")
    matched=identity.set_index("facility_uid")
    official_web=published.set_index("facility_uid")
    for x in links.itertuples(index=False):
        p=original.loc[x.facility_uid]
        d=official_web.loc[x.facility_uid]
        idrow=matched.loc[x.facility_uid]
        assert x.source_row_no==p.source_row_no
        assert (x.prefecture,x.facility_name,x.address)==(p.prefecture,p.facility_name,p.address)
        assert x.website_url==d.website_url
        assert x.navi_facility_id_confirmed==d.navi_facility_id_confirmed
        assert idrow.match_status=="確定一致"
        assert idrow.navi_facility_id_confirmed==x.navi_facility_id_confirmed
        assert normalize_url(x.website_url)==(x.website_url,"")
    for x in remaining.itertuples(index=False):
        p=original.loc[x.facility_uid]
        i=matched.loc[x.facility_uid]
        assert (x.source_row_no,x.prefecture,x.facility_name,x.address)==(
            p.source_row_no,p.prefecture,p.facility_name,p.address)
        assert x.identity_match_status==i.match_status and x.match_method==i.match_method
        assert x.review_status=="未検証・自動リンク禁止"
        assert x.review_priority==str(PRIO.get(x.website_review_bucket,9))
        if x.candidate_official_homepage:
            assert normalize_url(x.candidate_official_homepage)==(
                x.candidate_official_homepage,"")
    assert remaining.identity_match_status.value_counts().to_dict()=={
        "要確認":3435,"未一致":1131,"確定一致":355}
    assert audit["pending_with_syntactically_valid_source_url"]==3037
    assert audit["review_by_bucket"]==remaining.website_review_bucket.value_counts().to_dict()
    assert audit["review_candidate_urls_not_clickable"] is True
    print("REV12_REVIEW_INTEGRITY_PASS original=8019 linked=3098 unlinked=4921 pending_valid_candidates=3037")
if __name__=="__main__":
    validate()
