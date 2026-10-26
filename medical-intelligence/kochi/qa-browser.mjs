import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const shots=path.join(here,'qa-screenshots');
fs.mkdirSync(shots,{recursive:true});
const contentType={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json'};
const server=http.createServer((req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404).end('Not Found');return}
  res.writeHead(200,{'Content-Type':contentType[path.extname(file)]||'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
 }catch(e){res.writeHead(500).end('Server error')}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const port=server.address().port;
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const report=[];
try{
 for(const width of [375,768,1440]){
  const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://cyberjapandata.gsi.go.jp/**',route=>route.abort());
  await page.goto('http://127.0.0.1:'+port+'/medical-intelligence/kochi/',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>document.querySelectorAll('#facilityTable tbody tr').length===14,{timeout:35000}).catch(async()=>await page.waitForTimeout(1000));
  await page.waitForTimeout(1400);
  const state=await page.evaluate(()=>{
   const all=[...document.querySelectorAll('[id]')].map(e=>e.id);
   const checks=['populationChart','bedChart','equipmentChart','scoreChart','vAreaChart','vBedGapChart','vDeviceShareChart','vBubbleChart'];
   const escaped=e=>{
    let p=e.parentElement;
    while(p&&p!==document.body){
     if(['hidden','clip','scroll','auto'].includes(getComputedStyle(p).overflowX))return true;
     p=p.parentElement;
    }
    return false;
   };
   return {
    width:innerWidth,
    pageOverflow:document.documentElement.scrollWidth-innerWidth,
    chartsReady:window.Chart?checks.filter(id=>!!window.Chart.getChart(document.getElementById(id))).length:0,
    refs:document.querySelectorAll('#sourceList li').length,
    regionCards:document.querySelectorAll('#areaCards article').length,
    popRows:document.querySelectorAll('#visPopulationShare .v-shareline').length,
    bedRows:document.querySelectorAll('#vBedMix .v-bed-row').length,
    facilities:document.querySelectorAll('#facilityTable tbody tr').length,
    svg:document.querySelectorAll('svg').length,
    canvases:document.querySelectorAll('canvas').length,
    mapReady:!!window.KOCHI_MAP&&!!document.querySelector('.leaflet-container'),
    mapMetricControls:document.querySelectorAll('#vMapTools button[data-mode]').length,
    missingAnchors:[...document.querySelectorAll('a[href^="#"]')].map(a=>a.hash.slice(1)).filter(id=>id&&!document.getElementById(id)),
    duplicateIds:all.filter((x,i)=>all.indexOf(x)!==i),
    overflowCandidates:[...document.querySelectorAll('main *')].filter(e=>{const b=e.getBoundingClientRect();return b.width>0&&b.right>innerWidth+3&&!escaped(e)}).slice(0,6).map(e=>({tag:e.tagName,id:e.id,right:Math.round(e.getBoundingClientRect().right)}))
   };
  });
  assert.deepEqual(errors,[],'Browser script errors');
  assert(state.pageOverflow<=2,'Horizontal page overflow: '+JSON.stringify(state));
  assert(state.svg>=14,'Pictograms and schematic SVGs are present');
  assert(state.canvases>=8,'All eight charts declared');
  assert.equal(state.chartsReady,8,'All eight Chart.js charts rendered');
  assert.equal(state.regionCards,4,'Four region cards');
  assert.equal(state.popRows,4,'Four region population bars');
  assert.equal(state.bedRows,4,'Four hospital-function bars');
  assert.equal(state.facilities,14,'All linked public facilities');
  assert(state.refs>=19,'Source provenance retained');
  assert(state.mapReady,'GSI/Leaflet map instantiated');
  assert.equal(state.mapMetricControls,3,'CT/MRI map switching controls');
  assert.deepEqual(state.duplicateIds,[],'No duplicate IDs');
  assert.deepEqual(state.missingAnchors,[],'All internal anchors exist');
  assert.deepEqual(state.overflowCandidates,[],'No uncontained overflows');
  await page.getByRole('button',{name:'CT台数バブル'}).click();
  assert.equal(await page.getByRole('button',{name:'CT台数バブル'}).getAttribute('aria-pressed'),'true','CT map toggle works');
  await page.getByRole('button',{name:'MRI台数バブル'}).click();
  assert.equal(await page.getByRole('button',{name:'MRI台数バブル'}).getAttribute('aria-pressed'),'true','MRI map toggle works');
  await page.locator('#facilityFilter').selectOption('保健所');
  assert(await page.locator('#facilityTable tbody tr').count()>=5,'Health center filter works');
  await page.locator('#facilityFilter').selectOption('all');
  assert.equal(await page.locator('#facilityTable tbody tr').count(),14,'Facility filter reset works');
  if(width<1050){
   await page.locator('#menuBtn').click();
   assert.equal(await page.locator('#menuBtn').getAttribute('aria-expanded'),'true','Mobile navigation opens');
   await page.locator('#nav a[href="#devices"]').click();
   assert.equal(await page.locator('#menuBtn').getAttribute('aria-expanded'),'false','Mobile navigation closes');
  }
  await page.screenshot({path:path.join(shots,'kochi-'+width+'.png'),fullPage:true,animations:'disabled'});
  report.push({width,pass:true,charts:state.chartsReady,map:state.mapReady,overflow:state.pageOverflow,svg:state.svg});
  console.log('Kochi visual QA PASS',JSON.stringify(report.at(-1)));
  await page.close();
 }
 console.log(JSON.stringify({result:'PASS',report},null,2));
}finally{await browser.close();await new Promise(ok=>server.close(ok))}
