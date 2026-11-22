#!/usr/bin/env python3
"""Facility master v1: reconstruct and QA the unverified 8019-row legacy list.
Usage: python .../build_master.py --check --report /tmp/master-qa.json
Requires pandas. Does NOT create official institution codes or verified DPC data.
"""
import argparse
import html
import json
import re
import unicodedata
from pathlib import Path
import pandas as pd

HERE=Path(__file__).resolve().parent
SOURCE=HERE.parent/"index.html"
BASELINE=HERE/"data/legacy-hospitals-20261122.csv"
SOURCE_URL="https://sinobu13-bpei.github.io/medical-intelligence/hospitals/"
SOURCE_SHA="24aa96b01adea8e14b53e8c415fa1eb7e3aaab74"
COLS=("facility_uid source_row_no legacy_pref_rank facility_type prefecture facility_name address "
"beds_reported_legacy dpc_category_legacy feature_tags_legacy owner_class_legacy "
"group_name_legacy group_evidence_legacy official_medical_institution_code "
"official_corporate_number official_facility_code medical_area_2026_code "
"identity_match_status source_catalog_id source_url source_data_as_of "
"source_retrieved_on source_blob_sha").split()
ROW=re.compile(r'<tr\b(?=[^>]*\bdata-text=)[^>]*>[\s\S]*?</tr>',re.I)
CELL=re.compile(r'<td\b[^>]*>([\s\S]*?)</td>',re.I)
ATTR=re.compile(r'\bdata-([\w-]+)="([^"]*)"',re.I)

def uid(pref,name,address):
    k=unicodedata.normalize("NFKC","|".join((pref,name,address)))
    units=re.sub(r"\s+","",k).upper().encode("utf-16-le")
    h=0xcbf29ce484222325
    for i in range(0,len(units),2):
        h=((h ^ int.from_bytes(units[i:i+2],"little"))*0x100000001b3)&((1<<64)-1)
    return f"LEG-{h:016x}"

def extract(path=SOURCE):
    txt=path.read_text(encoding="utf-8")
    records=[]
    for number,m in enumerate(ROW.finditer(txt),1):
        raw=m.group(0)
        c=[html.unescape(re.sub(r"<[^>]*>","",v)).strip() for v in CELL.findall(raw)]
        if len(c)!=7: raise ValueError(f"row {number}: expected seven cells, found {len(c)}")
        if not re.fullmatch(r"[0-9,]+",c[4]):raise ValueError(f"row {number}: invalid beds")
        attrs={k:html.unescape(v) for k,v in ATTR.findall(raw.split(">",1)[0])}
        records.append([uid(c[0],c[2],c[3]),str(number),c[1],"病院",c[0],c[2],c[3],
            c[4].replace(",",""),c[5],c[6],attrs.get("owner",""),
            attrs.get("group",""),attrs.get("group-evidence",""),
            "","","","","未照合","LEGACY_HOSPITALS_REV6",SOURCE_URL,
            "","2026-11-22",SOURCE_SHA])
    return pd.DataFrame(records,columns=COLS,dtype=str)

def validate(df):
    errors=[]
    def check(condition,message):
        if not condition:errors.append(message)
    check(list(df.columns)==COLS,"wrong column schema")
    if not set(COLS).issubset(df.columns): return errors
    check(len(df)==8019,f"record count changed: {len(df)}")
    check(df.facility_uid.is_unique,"duplicate provisional UID")
    check(df.source_row_no.tolist()==[str(i) for i in range(1,len(df)+1)],"row-number continuity")
    check(df.prefecture.nunique()==47,"47-prefecture coverage")
    for col in ("prefecture","facility_name","address","beds_reported_legacy"):
        check(df[col].ne("").all(),"missing "+col)
    for col in ("official_medical_institution_code","official_corporate_number",
                "official_facility_code","medical_area_2026_code"):
        check(df[col].eq("").all(),"unverified official ID was populated: "+col)
    check(df.identity_match_status.eq("未照合").all(),"verification status misrepresented")
    return errors

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--check",action="store_true")
    ap.add_argument("--source",type=Path,default=SOURCE)
    ap.add_argument("--export",type=Path)
    ap.add_argument("--report",type=Path)
    ap.add_argument("--previous",type=Path)
    args=ap.parse_args()
    fresh=extract(args.source)
    errors=validate(fresh)
    if args.check:
        baseline=pd.read_csv(BASELINE,dtype=str,keep_default_na=False,encoding="utf-8-sig")
        errors+=validate(baseline)
        if list(baseline.columns)==COLS and not baseline.equals(fresh):
            errors.append("baseline does not match existing hospital HTML")
    if args.export:
        args.export.parent.mkdir(parents=True,exist_ok=True)
        fresh.to_csv(args.export,index=False,encoding="utf-8-sig")
    changes=None
    if args.previous:
        old=pd.read_csv(args.previous,dtype=str,keep_default_na=False,encoding="utf-8-sig")
        a=old.set_index("facility_uid").to_dict("index")
        b=fresh.set_index("facility_uid").to_dict("index")
        common=set(a)&set(b)
        changes={"added":len(set(b)-set(a)),"removed":len(set(a)-set(b)),
                 "changed":sum(a[k]!=b[k] for k in common)}
    report={"schema_version":"1.0","source":"LEGACY_HOSPITALS_REV6",
        "source_data_as_of":"未確認","source_retrieved_on":"2026-11-22",
        "records":len(fresh),"prefectures":fresh.prefecture.nunique(),
        "official_ids_verified":0,"issues":errors,"changes":changes}
    if args.report:
        args.report.parent.mkdir(parents=True,exist_ok=True)
        args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(report,ensure_ascii=False,indent=2))
    if errors:raise SystemExit(1)

if __name__=="__main__":main()
