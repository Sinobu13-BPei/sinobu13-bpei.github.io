#!/usr/bin/env python3
"""Protect original 8,019 hospital HTML: only three external asset refs may differ.

Git blob SHA after removing those exactly three refs MUST match the pristine
Rev.6 8,019-row original. No hospital data/HTML row is ever rewritten.
"""
import argparse, hashlib, re
from pathlib import Path

TARGET=Path(__file__).resolve().parent.parent/"index.html"
ORIGINAL_BLOB_SHA="24aa96b01adea8e14b53e8c415fa1eb7e3aaab74"
CSS='<link rel="stylesheet" href="./assets/legacy-official-websites-rev12.css">'
JS='<script defer src="./assets/legacy-official-websites-rev12.js"></script>'
MANUAL='<script defer src="/medical-intelligence/hospitals/facility-master/independently-reviewed-websites.js"></script>'

def git_blob_sha(data):
    return hashlib.sha1(b"blob "+str(len(data)).encode()+b"\0"+data).hexdigest()

def original_check(text):
    if text.count('<tr data-text=')!=8019:
        raise ValueError("Legacy hospital original row count changed")
    digest=git_blob_sha(text.encode("utf-8"))
    if digest!=ORIGINAL_BLOB_SHA:
        raise ValueError("Original hospital HTML Git blob changed: "+digest)
    return True

def verify(text, allow_old=False):
    if text.count(CSS)!=1 or text.count(JS)!=1:
        raise ValueError("Rev12 links were removed or duplicated")
    if text.count(MANUAL)!=(0 if allow_old else 1):
        raise ValueError("Rev13 independently reviewed link source is missing/duplicated")
    clean=text.replace(CSS,"",1).replace(JS,"",1)
    if not allow_old:clean=clean.replace(MANUAL,"",1)
    original_check(clean)
    if text.count("</head>")!=1 or text.count("</body>")!=1:
        raise ValueError("Legacy HTML document structure changed")
    if not allow_old and not text.index(JS)<text.index(MANUAL):
        raise ValueError("Manual website layer must load after Rev12 source overlay")
    return True

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--apply",action="store_true")
    parser.add_argument("--check",action="store_true")
    args=parser.parse_args()
    if not (args.apply or args.check):parser.error("Use --apply or --check")
    text=TARGET.read_text(encoding="utf-8")
    if args.apply and MANUAL not in text:
        verify(text,allow_old=True)
        text=text.replace(JS,JS+MANUAL,1)
        verify(text)
        TARGET.write_text(text,encoding="utf-8")
    verify(text)
    print("LEGACY_WEBSITE_BRIDGE_QA_PASS original_blob_sha="+ORIGINAL_BLOB_SHA+" rows=8019 references=3")

if __name__=="__main__":
    main()
