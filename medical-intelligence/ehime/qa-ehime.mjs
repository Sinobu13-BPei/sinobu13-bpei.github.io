
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
assert.equal(data.sources.length,33,'Source registry count changed unexpectedly');
assert.equal(data.regions.length,6,'Expected 6 medical areas');
assert.equal(data.regions.reduce((sum,r)=>sum+r.total,0),17006,'Medical area reported bed total mismatch');
assert.equal(data.additionalEvidence.clinic2023.clinics,1175,'Clinic benchmark mismatch');

for(const section of ['summary','population','beds','providers','university','devices','local-market','dealer-share','subsidies','evidence','channels','external','strategy','sources']){
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
console.log(JSON.stringify({result:'PASS',sections:14,regions:data.regions.length,
  hospitals:data.facilities.length,sourceCount:data.sources.length,svgFallbacks:4,
  editor:'日野富子',responsive:true,jsSyntax:'PASS'},null,2));
