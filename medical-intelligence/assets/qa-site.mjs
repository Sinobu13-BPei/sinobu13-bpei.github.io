/* Japan Medical Market Intelligence | static QA
   Run from repository root: node medical-intelligence/assets/qa-site.mjs */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const files=[
  'medical-intelligence/index.html',
  'clinic-medical-device-market/index.html',
  'ct-market-atlas/index.html',
  'mri_market_atlas_2025.html',
  'medical-congress-2027/index.html',
  'medical-device-strategy-handbook/index.html',
  'strategy-handbook/index.html',
  'meeting-compliance/index.html',
  'research-atlas/index.html',
  'akita-medical-mkt/index.html',
  'yamagata-medical-mkt/index.html',
  'tohoku-medical-mkt/index.html',
  'shiga-medical-mkt/index.html',
  'nagano-medical-mkt/index.html',
  'niigata-medical-mkt/index.html',
  'yamanashi-medical-mkt/index.html',
  'shizuoka-medical-atlas/index.html',
  'shizuoka-medical-market-2026/index.html',
  'okinawa_medical_device_market_neutral_2026.html'
];
const unavailable=[
  'research-atlas/jrs.html','research-atlas/smi.html','research-atlas/msk.html',
  'medical-strategy-training/index.html','rizno-one/index.html'
];
const BASE='https://sinobu13-bpei.github.io/medical-intelligence/assets/';
const errors=[],warnings=[],stats=[];
const issue=(arr,file,msg)=>arr.push({file,message:msg});
for(const file of files){
  const full=path.join(root,file);
  if(!fs.existsSync(full)){issue(errors,file,'File missing');continue}
  const html=fs.readFileSync(full,'utf8');
  const head=html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1]||'';
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  const anchors=[...html.matchAll(/href="#([^"]+)"/g)].map(m=>m[1]);
  const duplicates=[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];
  const broken=anchors.filter(id=>!ids.includes(id));
  if(!head.includes(BASE+'site.css'))issue(errors,file,'Common CSS missing in head');
  if(!head.includes(BASE+'site.js'))issue(errors,file,'Common JS missing in head');
  if(!html.includes('id="site-header"')||!html.includes('id="site-footer"'))issue(errors,file,'Header/footer slot missing');
  if(/<style\b/i.test(head))issue(errors,file,'Inline style remains in head');
  if(duplicates.length)issue(errors,file,'Duplicate IDs: '+duplicates.join(','));
  if(broken.length)issue(errors,file,'Invalid anchors: '+broken.join(','));
  if(/<img\b[^>]*\bsrc\s*=\s*["']\s*["']/i.test(html))issue(errors,file,'Empty image src');
  const links=[...html.matchAll(/<a\b([^>]*)>/gi)];
  const noHref=links.filter(m=>!/\bhref\s*=/.test(m[1]));
  if(noHref.length)issue(errors,file,'Anchor without href: '+noHref.length);
  const styles=[...head.matchAll(/href="\.\/(jm-legacy-[^"]+\.css)"/g)].map(m=>m[1]);
  for(const asset of styles){
    if(!fs.existsSync(path.resolve(path.dirname(full),asset)))issue(errors,file,'Legacy CSS not found: '+asset);
  }
  const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  let jsCount=0;
  for(const [i,m] of scripts.entries()){
    if(/\bsrc\s*=|type\s*=\s*["']application\/(?:ld\+)?json["']/i.test(m[1]))continue;
    try{new vm.Script(m[2],{filename:file+'#script'+i});jsCount++}
    catch(e){issue(errors,file,'JavaScript syntax: '+e.message)}
  }
  const tracking=[...html.matchAll(/href="[^"]*[?&](?:v|utm_source)=/gi)].length;
  if(tracking)issue(warnings,file,'Tracking parameters: '+tracking);
  if(!/data-data-year="20\d{2}"/.test(html))issue(warnings,file,'Data baseline year not independently verified');
  stats.push({file,bytes:Buffer.byteLength(html),links:links.length,styles:styles.length,scripts:jsCount});
}
/* Guard the hub's population chart against invisible gradient-only bars. */
{
  const hubPath=path.join(root,'medical-intelligence/index.html');
  const cssPath=path.join(root,'medical-intelligence/jm-legacy-1.css');
  if(fs.existsSync(hubPath)&&fs.existsSync(cssPath)){
    const hub=fs.readFileSync(hubPath,'utf8');
    const css=fs.readFileSync(cssPath,'utf8');
    if(!hub.includes('class="population-chart" role="img"'))
      issue(errors,'medical-intelligence/index.html','Population chart accessibility wrapper missing');
    if(!hub.includes('class="population-chart__bar" style="height:100%"')||
       !hub.includes('class="population-chart__bar" style="height:83%"'))
      issue(errors,'medical-intelligence/index.html','Population chart bars missing');
    if(!/\.population-chart__bar\{[^}]*background:#0E7C86!important/.test(css))
      issue(errors,'medical-intelligence/jm-legacy-1.css','Population chart solid color missing');
  }
}
for(const file of unavailable)issue(warnings,file,'Large original: connector could not retrieve complete text; no source file was overwritten');
console.log(JSON.stringify({
  name:'Japan Medical Market Intelligence',
  audited:stats.length,errorCount:errors.length,warningCount:warnings.length,
  stats,errors,warnings
},null,2));
if(errors.length)process.exitCode=1;
