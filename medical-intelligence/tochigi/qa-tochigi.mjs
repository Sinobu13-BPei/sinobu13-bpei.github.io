#!/usr/bin/env node
/**
 * Public Tochigi Medical Intelligence regression tests.
 * Run: node medical-intelligence/tochigi/qa-tochigi.mjs
 * No external modules; validates layout dependencies and interactive rendering.
 */
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=dirname(fileURLToPath(import.meta.url));
const rd=f=>readFileSync(join(root,f),'utf8');
const html=rd('index.html'),css=rd('css/style.css'),leafletCss=rd('css/leaflet-1.9.4.css'),datajs=rd('data/tochigi.js'),appjs=rd('js/app.js'),sources=JSON.parse(rd('data/sources.json'));
const check=(cond,msg)=>assert.ok(cond,msg);
check(/<html lang="ja">/.test(html),'Japanese language');
check(/viewport/.test(html),'responsive viewport');
check((html.match(/<h1\b/g)||[]).length===1,'one H1');
check(html.includes('./css/leaflet-1.9.4.css')&&!html.includes('unpkg.com/leaflet@1.9.4/dist/leaflet.css'),'LOCAL leaflet css used');
check(existsSync(join(root,'css/LEAFLET_LICENSE.txt')),'Leaflet license bundled');
check(/\.leaflet-pane[\s\S]*?position: absolute/.test(leafletCss),'Leaflet pane absolute positioning');
check(/\.leaflet-container\s*\{\s*overflow: hidden/.test(leafletCss),'Leaflet container overflow hidden');
check(/#map\s*\{[^}]*overflow:hidden/.test(css),'custom map clip');
check(/#map\s*\{[^}]*isolation:isolate/.test(css),'custom map isolated stacking');
check(/#map\.leaflet-container\{position:relative!important;overflow:hidden!important\}/.test(css),'leaflet map defensive containment');
check(/\.map-grid\{display:grid;grid-template-columns:minmax\(0,1fr\)/.test(css),'map has independent full-width row');
check(/\.table-scroll\{[^}]*overflow-x:auto/.test(css),'tables have own horizontal scroll');
check(/@media\(max-width:560px\)/.test(css),'small-screen breakpoints');
check(!/body\s*\{[^}]*min-width:\s*(?:[4-9]\d\d|\d{4,})px/.test(css),'no forced desktop min-width');
for(const p of ['css/style.css','css/leaflet-1.9.4.css','js/app.js','data/tochigi.js','data/sources.json']) check(existsSync(join(root,p)),p+' exists');
for(const id of ['summary','demography','areas','hospitals','institutions','equipment','distribution','environment','strategy','sources','map'])check(html.includes('id="'+id+'"'),'anchor '+id);
new vm.Script(datajs,{filename:'tochigi.js'});new vm.Script(appjs,{filename:'app.js'});
const window={};
vm.runInNewContext(datajs,{window});
const data=window.TOCHIGI_DATA;
check(data.regions.length===6,'six regions');
check(data.cities.length===25,'25 municipalities');
check(data.sources.length===sources.length&&sources.length>=25,'source ledger complete');
check(data.locations.length>=20,'locations');
check(data.regions.reduce((a,r)=>a+r.current.reduce((s,n)=>s+n,0),0)===16805,'reported bed total stable');
check(data.regions.reduce((a,r)=>a+r.need.reduce((s,n)=>s+n,0),0)===15458,'2025 forecast bed total stable');
check(!/CMSC|キヤノン|営業目標|販社攻略|営業利益率|ペナルティ案件/.test(html+appjs+datajs),'No sales confidential content');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
check(new Set(ids).size===ids.length,'unique DOM IDs');
const requestedIds=[...new Set([...appjs.matchAll(/byId\('([^']+)'\)/g)].map(x=>x[1]))];
requestedIds.forEach(id=>check(ids.includes(id),'JS DOM target '+id));
const elements={};
function E(id){this.id=id;this.value='all';this.innerHTML='';this.parentElement=this;this.events={};this.querySelector=function(q){return this.tbody??(this.tbody=new E(id+'tbody'))};this.addEventListener=function(k,fn){this.events[k]=fn};}
const get=id=>elements[id]??(elements[id]=new E(id));
ids.forEach(get);
const document={getElementById:get,body:{insertAdjacentHTML(){throw Error('Unexpected body fallback')}}};
function run(Chart,L){vm.runInNewContext(appjs,{window,document,Chart,L,encodeURIComponent,console});return elements;}
// CDN blocked fallback test. No runaway tiles or swallowed errors.
run(undefined,undefined);
check((get('areaTable').tbody.innerHTML.match(/<tr>/g)||[]).length===6,'6 region rows');
check((get('cityTable').tbody.innerHTML.match(/<tr>/g)||[]).length===25,'25 city rows');
check((get('facilityList').innerHTML.match(/class="facility"/g)||[]).length===data.locations.length,'facility cards count');
check((get('facilityList').innerHTML.match(/Google地図/g)||[]).length===data.locations.length,'Google map link count');
check((get('facilityList').innerHTML.match(/地理院 周辺図/g)||[]).length===data.locations.length,'GSI map link count');
check((get('associationList').innerHTML.match(/<a /g)||[]).length===data.associations.length,'medical association links');
check((get('sourceList').innerHTML.match(/<article /g)||[]).length===sources.length,'all source links');
check((get('frameworks').innerHTML.match(/<article>/g)||[]).length===7,'7 strategy frameworks');
check((get('swot').innerHTML.match(/<article>/g)||[]).length===4,'SWOT quadrants');
check((get('areaCards').innerHTML.match(/<details>/g)||[]).length===6,'area cards expandable');
check(!get('areaCards').innerHTML.includes('点（独自）'),'duplicate area score removed');
check(get('map').innerHTML.includes('地図ライブラリが利用できません'),'Leaflet fallback message');
// Simulate chart/map available
let charts=0,pins=0,gsiCredit=false;
function Chart(e,c){charts++;check(c.data.labels.length>0,'chart labels')}
Chart.defaults={font:{},color:''};
const mapStub={setView(){return this}};
const L={map(){return mapStub},tileLayer(url,options){gsiCredit=options.attribution.includes('地理院タイル');return {addTo(){}}},circleMarker(){pins++;return{addTo(){return{bindPopup(){}}}}}};
run(Chart,L);
check(charts===5,'five interactive graphs');
check(pins===6,'six GIS markers');
check(gsiCredit,'GSI tile attribution');
check(html.includes('https://sinobu13-bpei.github.io/medical-intelligence/'),'portal footer present');
console.log(JSON.stringify({result:'PASS',regions:6,cities:25,facilityCards:data.locations.length,sources:sources.length,charts,pins,leafletCSS:'LOCAL',fallbacks:'PASS',responsive:'PASS',dupeIds:0,privateContent:'EXCLUDED'},null,2));