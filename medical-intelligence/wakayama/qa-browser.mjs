import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const here=path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot=path.resolve(here,'../..');
const output=path.join(here,'qa-screenshots');
fs.mkdirSync(output,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer((request,response)=>{
  try {
    const loc=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    let full=path.resolve(repositoryRoot,'.'+loc);
    if(!full.startsWith(repositoryRoot+path.sep)){response.writeHead(403).end();return;}
    if(fs.existsSync(full)&&fs.statSync(full).isDirectory())full=path.join(full,'index.html');
    if(!fs.existsSync(full)){response.writeHead(404).end('Not found');return;}
    response.writeHead(200,{'Content-Type':types[path.extname(full)]||'text/plain'});
    fs.createReadStream(full).pipe(response);
  }catch(e){response.writeHead(500).end('Invalid request');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const results=[];
try {
 for(const width of [375,768,1440]){
  const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
  await page.route('https://cyberjapandata.gsi.go.jp/**',route=>route.abort());
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.goto('http://127.0.0.1:'+port+'/medical-intelligence/wakayama/',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>document.querySelectorAll('#regionTable tbody tr').length===7,null,{timeout:35000});
  await page.waitForTimeout(900);
  const measures=await page.evaluate(()=>{
   const root=document.documentElement;
   const ids=[...document.querySelectorAll('[id]')].map(n=>n.id);
   return {
    viewport:window.innerWidth,overflow:root.scrollWidth-window.innerWidth,
    cards:document.querySelectorAll('#regionQuickCards button').length,
    regions:document.querySelectorAll('#regionTable tbody tr').length,
    facilityCards:document.querySelectorAll('#facilityList article.facility').length,
    refs:document.querySelectorAll('#sourcesList li').length,
    universityRows:document.querySelectorAll('#universityDoctorsTable tbody tr').length,
    regionalMeetings:document.querySelectorAll('#regionalMeetingTable tbody tr').length,
    agingSpotlight:!!document.querySelector('#town-aging'),
    regionalPopulationCells:[...document.querySelectorAll('#municipalityFacilityTable tbody tr')].filter(tr=>tr.children.length===9).length,
    areaFacilityRows:document.querySelectorAll('#facilityAreaTable tbody tr').length,
    associationRows:document.querySelectorAll('#associationStatsTable tbody tr').length,
    municipalityRows:document.querySelectorAll('#municipalityFacilityTable tbody tr').length,
    associationCountText:document.querySelector('#assocClinicTotal')?.textContent?.trim(),
    heatRows:document.querySelectorAll('#priorityMatrix tbody tr').length,
    graphicCount:document.querySelectorAll('svg').length,
    canvases:document.querySelectorAll('canvas').length,
    svgWidth:document.querySelector('.healthcare-landscape')?.getBoundingClientRect().width,
    pathwayOverflow:getComputedStyle(document.querySelector('.pathway-scroll')).overflowX,
    duplicateIds:ids.filter((x,i)=>ids.indexOf(x)!==i),
    missingLocalAnchors:[...document.querySelectorAll('a[href^="#"]')].map(a=>a.hash.slice(1)).filter(id=>id&&!document.getElementById(id)),
    chartsReady:typeof window.Chart==='function'?['bedDonutChart','physicianIndexChart','populationChart','bedChart','deviceChart','deviceDistributionChart','scoreChart','clinics2022Chart','areaFacilityTypesChart','associationClinicChart','universityDoctorsChart'].filter(id=>window.Chart.getChart(id)).length:null,
    mapReady:typeof window.L==='object'&&!!document.querySelector('.leaflet-container'),
    leafletMarkers:document.querySelectorAll('#areaMap .leaflet-interactive').length,
    offenders:[...document.querySelectorAll('main *')].filter(e=>{
      const r=e.getBoundingClientRect();if(!r.width||r.right<=innerWidth+2)return false;
      let parent=e.parentElement;
      while(parent&&parent!==document.body){
        const p=getComputedStyle(parent).overflowX;
        if(['auto','scroll','hidden','clip'].includes(p))return false;
        parent=parent.parentElement;
      }
      return true;
    }).slice(0,6).map(e=>({tag:e.tagName,id:e.id,className:typeof e.className==='string'?e.className:'',right:Math.round(e.getBoundingClientRect().right)}))
   };
  });
  assert(measures.overflow<=2,'Horizontal overflow: '+JSON.stringify(measures));
  assert.equal(measures.regions,7,'All seven medical areas render');
  assert.equal(measures.cards,7,'Quick area buttons present');
  assert.equal(measures.facilityCards,37,'17 hospitals/admin + 9 health centers + 11 medical associations');
  assert.equal(measures.refs,36,'All 36 public source entries');
  assert.equal(measures.universityRows,8,'All seven university doctor placement rows plus total');
  assert.equal(measures.regionalMeetings,7,'Seven regional medical planning meetings');
  assert(measures.agingSpotlight,'2026 aging report present');
  assert.equal(measures.regionalPopulationCells,30,'30 towns have aligned aged-population and clinic columns');
  assert.equal(measures.areaFacilityRows,8,'Seven areas plus one total facility row');
  assert.equal(measures.associationRows,12,'Eleven medical associations plus one total row');
  assert.equal(measures.municipalityRows,30,'All 30 town/city facility rows');
  assert.equal(measures.associationCountText,'850','Association territorial clinic count 850');
  assert.equal(measures.heatRows,7,'Seven score matrix rows');
  assert(measures.graphicCount>=15,'Inline diagrams and pictograms');
  assert.equal(measures.canvases,11,'Eleven charts declared');
  assert.deepEqual(measures.duplicateIds,[],'Unique element IDs');
  assert.deepEqual(measures.missingLocalAnchors,[],'All internal links valid');
  assert.deepEqual(pageErrors,[],'No browser script exceptions');
  assert.equal(measures.offenders.length,0,'No uncontained overflow');
  assert.equal(measures.chartsReady,11,'Chart.js renders all eleven interactive charts');
  assert(measures.mapReady,'Interactive GSI map initializes');
  assert(measures.leafletMarkers>=7,'Seven medical-area map points');
  await page.locator('#areaSearch').fill('新宮');
  assert.equal(await page.locator('#regionTable tbody tr').count(),1,'Area filtering works');
  await page.locator('#areaSearch').fill('');
  assert.equal(await page.locator('#regionTable tbody tr').count(),7,'Area filter reset works');
  await page.locator('#townFilter').fill('みなべ');
  assert.equal(await page.locator('#municipalityFacilityTable tbody tr').count(),1,'Medical association town search works');
  assert((await page.locator('#municipalityFacilityTable tbody').innerText()).includes('日高医師会'),'Minabe town assigned to Hidaka association');
  await page.locator('#townFilter').fill('');
  await page.locator('#facilitySearch').fill('和歌山市医師会');
  assert((await page.locator('#facilityList article.facility').count())>=1,'Facility search returns relevant entries');
  assert((await page.locator('#facilityList article.facility').allTextContents()).every(t=>t.includes('和歌山市医師会')),'Every returned facility is a genuine name match');
  await page.locator('#facilitySearch').fill('');
  await page.locator('#regionQuickCards button').first().click();
  assert((await page.locator('#areaSearch').inputValue()).length>0,'Area quick-select works');
  await page.locator('#areaSearch').fill('');
  await page.screenshot({path:path.join(output,'wakayama-'+width+'.png'),fullPage:true,animations:'disabled'});
  console.log('Wakayama viewport PASS',width,JSON.stringify(measures));
  results.push({width,measures,interaction:'PASS',pageErrors:0});
  await page.close();
 }
 console.log(JSON.stringify({result:'PASS',reports:results.map(r=>({width:r.width,charts:r.measures.chartsReady,map:r.measures.mapReady,overflow:r.measures.overflow}))},null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
