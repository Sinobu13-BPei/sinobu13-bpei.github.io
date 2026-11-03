
/* Ehime public MKT regression checks - Node.js 22, no additional packages. */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const load=name=>fs.readFileSync(path.join(root,name),'utf8');
const html=load('index.html'),css=load('style.css'),js=load('app.js');
const data=JSON.parse(load('data/ehime.json'));
const inline=html.match(/<script type="application\/json" id="ehime-embedded-data">([\s\S]*?)<\/script>/);
assert(inline,'Missing safe embedded data for offline rendering');
const embedded=JSON.parse(inline[1]);
assert.deepEqual(embedded,data,'Embedded dataset and export JSON diverged');

const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const idSet=new Set(ids);
assert.equal(idSet.size,ids.length,'Duplicate HTML ids');
assert([...html.matchAll(/href="#([^"]+)"/g)].every(m=>idSet.has(m[1])),'Broken internal anchor');
assert([...html.matchAll(/href="#(S\d\d)"/g)].every(m=>data.sources.some(x=>x[0]===m[1])),'Unknown source reference');
assert.equal(data.sources.length,48,'Source registry count changed unexpectedly');
assert.equal(data.regions.length,6,'Expected 6 medical areas');
assert.equal(data.regions.reduce((sum,r)=>sum+r.total,0),17006,'Medical area reported bed total mismatch');
assert.equal(data.additionalEvidence.clinic2023.clinics,1175,'Clinic benchmark mismatch');

for(const section of ['summary','population','beds','providers','radiologists','radiology-technologists','university','devices','local-market','dealer-share','subsidies','funding-donations','evidence','channels','external','strategy','sources']){
  assert(idSet.has(section),'Missing section: '+section);
  assert(html.includes('href="#'+section+'"'),'Missing navigation link: '+section);
}
for(const table of ['regionTable','legalBeds','facilityTable','officeTable','associationTable']){
  const exp=new RegExp('<table[^>]*id="'+table+'"[^>]*>[\\s\\S]*?<tbody>([\\s\\S]*?)<\\/tbody>');
  const match=html.match(exp);
  assert(match,'Missing static table: '+table);
  assert(match[1].includes('<tr>'),'Empty static table: '+table);
}
const sources=html.match(/<ol class="sources" id="sourceList">([\s\S]*?)<\/ol>/);
assert(sources,'Missing pre-rendered source list');
for(const src of data.sources)assert(sources[1].includes('id="'+src[0]+'"'),'Missing source anchor '+src[0]);

for(const chart of ['populationChart','bedsChart','clinicDistributionChart','scoresChart']){
  assert(html.includes('id="'+chart+'"'),'Missing canvas '+chart);
  assert(html.includes('id="'+chart+'-box"'),'Missing chart holder '+chart);
}
assert.equal((html.match(/class="chart-fallback"/g)||[]).length,4,'Expected 4 accessible SVG fallbacks');
assert.equal((html.match(/<svg /g)||[]).length,4,'SVG fallbacks invalid');
assert(html.includes('class="map-fallback"'),'Map fallback missing');
assert(html.includes('地理院タイル'),'GSI tile attribution missing');
assert(html.includes('id="subsidyMap"'),'Missing subsidy regional map');
assert(html.includes('class="subsidy-map-fallback"'),'Missing offline subsidy map links');
assert(html.includes('id="cityMarketChart"') && html.includes('id="dealerShareChart"'),'New market canvases missing');
const ext=JSON.parse(load('data/market-subsidy-2026.json'));
const extInline=html.match(/<script type="application\/json" id="ehime-market-data">([\s\S]*?)<\/script>/);
assert(extInline,'Embedded 2026 market supplement missing');
assert.deepEqual(JSON.parse(extInline[1]),ext,'Market extension JSON mismatch');
assert.equal(ext.cityMarket.year,2020,'Market by city must be labelled 2020');
assert.equal(ext.dealers.year,2024,'Dealer figures must be labelled 2024');
assert.equal(ext.subsidies.length,7,'Expected 7 subsidy programs');
assert.equal(ext.markers.length,9,'Expected 9 policy map markers');
assert(html.includes('2026年度募集の協議書期限終了'),'Uwajima deadline must be clearly marked');
const finance=JSON.parse(load('data/funding-donations-2026.json'));
const financeInline=html.match(/<script type="application\/json" id="ehime-funding-data">([\s\S]*?)<\/script>/);
assert(financeInline,'Embedded grants & donation registry missing');
assert.deepEqual(JSON.parse(financeInline[1]),finance,'Embedded funding data differs from JSON');
assert.equal(finance.records.length,18,'Expected 18 curated grants and donation resources');
assert.equal(new Set(finance.records.map(x=>x.id)).size,18,'Duplicate funding resource IDs');
assert(finance.records.every(x=>x.url.startsWith('https://')),'Funding entries must have official secure source URL');
assert(finance.records.every(x=>data.sources.some(s=>s[0]===x.source)),'Funding record missing source register reference');
assert(html.includes('id="fundingSearch"')&&html.includes('id="fundingCategory"')&&html.includes('id="fundingStatus"'),'Funding filter inputs missing');
assert(html.includes('id="fundingEmpty"'),'Funding empty state missing');
assert(html.includes('寄附')&&html.includes('2026年11月3日'),'Funding publication date or donation title missing');
assert.equal((html.match(/class="resource-card"/g)||[]).length,18,'Expected 18 HTML funding cards');
const radiology=JSON.parse(load('data/radiology-physicians-2026.json'));
const radiologyInline=html.match(/<script type="application\/json" id="ehime-radiology-data">([\s\S]*?)<\/script>/);
assert(radiologyInline,'Radiologist embedded JSON missing');
assert.deepEqual(JSON.parse(radiologyInline[1]),radiology,'Radiology embedded and stored dataset mismatch');
assert.equal(radiology.prefecture.radiologists,127,'Ehime physician count mismatch');
assert.equal(radiology.regions.reduce((total,x)=>total+x.count,0),127,'Region headcount does not sum to 127');
assert.equal(radiology.nationalAge2024.groups.reduce((total,x)=>total+x[1],0),7533,'National radiology age bands mismatch');
assert.equal(radiology.facilities.length,8,'Expected 8 hospitals / institutions');
assert.equal(radiology.sources.length,17,'Expected 17 radiology sources');
for(const s of radiology.sources)assert(html.includes('id="'+s[0]+'"'),'Radiology source anchor missing '+s[0]);
assert.equal((html.match(/class="rd-bar"/g)||[]).length,12,'Expected 12 static bars for regions / nationwide age groups');
assert.equal((html.match(/class="rd-map-fallback"/g)||[]).length,1,'Radiology no-JS map missing');
assert(html.includes('id="radiologyRegionChart"')&&html.includes('id="radiologyAgeChart"'),'Radiologist charts missing');
assert(html.includes('愛媛県の年齢構成ではありません'),'Must not conflate nationwide ages with Ehime');
assert(html.includes('医局の在籍数')&&html.includes('常勤数'),'Hospital and department count definitions missing');

const technologists=JSON.parse(load('data/radiology-technologists-2026.json'));
const techInline=html.match(/<script type="application\/json" id="ehime-technologist-data">([\s\S]*?)<\/script>/);
assert(techInline,'Technologist embedded data missing');
assert.deepEqual(JSON.parse(techInline[1]),technologists,'Technologist JSON embedded data differs from source');
assert.equal(technologists.prefecture.totalFTE,637.0,'Expected 637.0 Ehime technologist FTE');
assert.equal(technologists.prefecture.hospitalFTE,547.2,'Expected 547.2 hospital FTE');
assert.equal(technologists.radiologyFacilities.allListCount,111,'Expected 111 directory records');
assert.equal(technologists.radiologyFacilities.hospitalListCount,63,'Expected 63 hospital directory records');
assert.equal(technologists.facilities.length,7,'Expected seven facility staffing observations');
assert.equal(technologists.sources.length,11,'Expected 11 unique technologist source references');
assert.equal(new Set(technologists.facilities.map(x=>x.name)).size,7,'Duplicate technologist facility names');
for(const src of technologists.sources)assert(html.includes('id="'+src[0]+'"'),'Technologist source anchor missing '+src[0]);
assert(html.includes('id="rtSectorChart"')&&html.includes('id="rtShikokuChart"'),'Technologist canvases missing');
assert(html.includes('id="rtFacilityMap"')&&html.includes('class="rt-map-fallback"'),'Technologist fallback map missing');
assert.equal((html.match(/class="rt-bar"/g)||[]).length,6,'Expected six technologist static bar rows');
assert(html.includes('差を診療所数と解釈しません'),'Different directories must not be subtracted into outpatient counts');
assert(html.includes('id="facilityEmpty"'),'Search no-result feedback missing');
assert(html.includes('id="clearFacilitySearch"'),'Search clear control missing');
assert(html.includes('id="readingProgress"'),'Reading progress indicator missing');
assert(html.includes('id="backToTop"'),'Back to top control missing');
assert(html.includes('編纂：日野富子'),'Editor credit missing');
assert(css.includes('@media(max-width:640px)'),'Mobile responsive styling missing');
assert(css.includes('.chart-fallback svg'),'SVG presentation missing');
assert(css.includes(':focus-visible'),'Keyboard focus indicator missing');
assert(!/<a\b[^>]*>\s*<a\b/i.test(html),'Nested anchor tags');
new vm.Script(js,{filename:'app.js'});
assert(!/CMSC|販社同席率|社内目標|社外秘/.test(html),'Confidential company-specific content found');

const siteIndex=load('../index.html');
assert(siteIndex.includes('medical-intelligence/ehime/'),'Missing prefecture hub link');
console.log(JSON.stringify({result:'PASS',sections:17,regions:data.regions.length,
  hospitals:data.facilities.length,sourceCount:data.sources.length,svgFallbacks:4,
  editor:'日野富子',responsive:true,jsSyntax:'PASS'},null,2));
