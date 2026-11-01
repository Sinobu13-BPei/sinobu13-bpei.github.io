/* Rev6 hospitals release static QA. Run: node medical-intelligence/hospitals/qa-hospitals-rev6.mjs */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const root='medical-intelligence/hospitals/';
const html=fs.readFileSync(root+'index.html','utf8');
const js=fs.readFileSync(root+'assets/hospital-research-rev6.js','utf8');
const css=fs.readFileSync(root+'assets/hospital-research-rev6.css','utf8');
const errors=[];
const check=(condition,reason)=>{try{assert.ok(condition,reason)}catch(e){errors.push(reason)}};
check((html.match(/<tr data-text=/g)||[]).length===8019,'all 8019 hospital source records preserved');
check(html.includes('window.__hospitalResearch=dataset'),'dataset bridge present');
check(html.includes('hospital-research-rev6.js'),'research JS linked');
check(html.includes('hospital-research-rev6.css'),'research CSS linked');
check(js.includes('医師数')&&js.includes('診療科目')&&js.includes('未確認'),'research evidence fields present');
check(js.includes('1141')&&js.includes('1,685'),'2026 DPC reference explicitly shown');
check(js.includes('MutationObserver'),'pagination enhancements handled');
check(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),'mobile two-column metric panels');
const parsed=spawnSync(process.execPath,['--check',root+'assets/hospital-research-rev6.js'],{encoding:'utf8'});
check(parsed.status===0,'hospital research JS syntax check failed: '+parsed.stderr);
const sourceScript=html.match(/<script>\s*'use strict';\s*\(\(\) => \{([\s\S]*?)<\/script>/);
check(Boolean(sourceScript),'original inline hospital controller present');
if(sourceScript){const src='/tmp/hospital-original-controller-'+process.pid+'.js';fs.writeFileSync(src,"'use strict';\n(()=>{"+sourceScript[1]);const result=spawnSync(process.execPath,['--check',src],{encoding:'utf8'});check(result.status===0,'original inline JS syntax: '+result.stderr);fs.unlinkSync(src)}
console.log(JSON.stringify({records:(html.match(/<tr data-text=/g)||[]).length,checks:10,errors},null,2));
if(errors.length)process.exit(1);
