#!/usr/bin/env node
/* 熊本県 医療MKT 公開ページ：統計整合 / レイアウト / UI動作 / 全画面幅QA */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,mkdirSync,writeFileSync,mkdtempSync,rmSync,statSync} from 'node:fs';
import {createServer} from 'node:http';
import {spawn,spawnSync} from 'node:child_process';
import {dirname,join,resolve,sep,extname} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const dir=dirname(fileURLToPath(import.meta.url)),root=resolve(dir,'../..');
const read=n=>readFileSync(join(dir,n),'utf8'),html=read('index.html'),css=read('style.css'),js=read('app.js'),data=JSON.parse(read('data.json'));
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'duplicate DOM id');
for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(id),'broken #anchor: '+id);
for(const id of ['map','regionCards','regionDetail','facilityCountsChart','projectionBody','facilityQuery','facilitySelect','focusRegion','saveFacilityCSV','saveProjectionCSV','saveCSV','sourcesBody'])assert(ids.includes(id),'missing DOM: '+id);
assert.equal(data.regions.length,10);assert.equal(data.populationCohorts.length,10);assert.equal(data.facilityCounts.length,10);
assert.equal(new Set(data.regions.map(x=>x[1])).size,10);
assert.equal(data.facilityCounts.reduce((s,r)=>s+r[1],0),202,'2023 hospital total');
assert.equal(data.facilityCounts.reduce((s,r)=>s+r[2],0),1470,'2023 clinic total');
assert.equal(data.populationCohorts.reduce((s,r)=>s+r[1],0),1738301,'2020 baseline');
assert.equal(data.populationCohorts.reduce((s,r)=>s+r[3],0),1492907,'2040 projection');
for(const row of data.facilityCounts)assert(data.regions.some(r=>r[1]===row[0]),'unknown medical area');
for(const row of data.populationCohorts)assert(data.regions.some(r=>r[1]===row[0]),'unknown population area');
for(const id of ['K01','K04','K09','K20','K21','K22'])assert(data.sources.some(s=>s[0]===id),'source missing: '+id);
new vm.Script(js,{filename:'app.js'});assert(css.includes('@media(max-width:700px)'),'mobile CSS missing');
assert(html.includes('地理院地図')&&html.includes('care-visual')&&html.includes('device-process'),'visual assets missing');
console.log('STATIC PASS: DOM anchors, 10 regions, 2023 counts, cohorts, maps, 22 sources, CSS, JS');
const artifacts=join(dir,'qa-artifacts');mkdirSync(artifacts,{recursive:true});
const mimes={'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json'};
const server=createServer((req,res)=>{try{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname.endsWith('/'))pathname+='index.html';let file=resolve(root,'.'+pathname);if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile())throw Error('Not found');res.writeHead(200,{'Content-Type':(mimes[extname(file)]||'text/plain')+'; charset=utf-8','Cache-Control':'no-store'});res.end(readFileSync(file))}catch(e){res.writeHead(404);res.end('Not found')}});
const sleep=ms=>new Promise(ok=>setTimeout(ok,ms));let chrome,ws,profile,seq=0;const pending=new Map(),reports=[];
function call(method,params={}){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('Chrome timeout '+method))},24000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}))})}
async function evaluate(expression){const x=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(x.exceptionDetails)throw Error(JSON.stringify(x.exceptionDetails));return x.result?.value}
async function check(width,height,label,port){
 await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<700});await call('Page.navigate',{url:'http://127.0.0.1:'+port+'/medical-intelligence/kumamoto/'});
 let ready=false;for(let i=0;i<100;i++){ready=await evaluate("document.querySelectorAll('#regionCards .region-card').length===10&&document.querySelectorAll('#placesBody .place').length===31&&document.querySelectorAll('#projectionBody tr').length===11").catch(()=>false);if(ready)break;await sleep(150)}
 assert(ready,'data-driven components loaded '+label);
 const state=await evaluate("(()=>({width:innerWidth,page:document.documentElement.scrollWidth,body:document.body.scrollWidth,regions:document.querySelectorAll('#regionCards .region-card').length,placeCount:document.querySelectorAll('#placesBody .place').length,projections:document.querySelectorAll('#projectionBody tr').length,sources:document.querySelectorAll('#sourcesBody .source').length,facilityCount:document.querySelector('#facility-counts')?.innerText.includes('1,470'),mapHeight:document.querySelector('#map')?.getBoundingClientRect().height,careSteps:document.querySelectorAll('.care-step').length,deviceSteps:document.querySelectorAll('.device-process article').length,chartFallback:document.querySelectorAll('.chart-fallback').length}))()");
 assert.equal(state.regions,10);assert.equal(state.projections,11);assert.equal(state.sources,data.sources.length);assert.equal(state.careSteps,4);assert.equal(state.deviceSteps,4);
 assert(state.facilityCount,'facility count must be present');
 assert(state.page<=width+3,'horizontal document overflow '+label+': '+JSON.stringify(state));
 assert(state.body<=width+3,'horizontal body overflow '+label+': '+JSON.stringify(state));
 assert(state.mapHeight>=300&&state.mapHeight<=700,'map viewport size '+label);
 const pick=await evaluate("(()=>{const x=document.querySelector('[data-code=\"4311\"]');x.click();return{selected:x.getAttribute('aria-pressed'),info:document.querySelector('#regionDetail').innerText}})()");
 assert.equal(pick.selected,'true');assert(pick.info.includes('天草')&&pick.info.includes('99'),'region-card selection works');
 const search=await evaluate("(()=>{const q=document.querySelector('#facilityQuery');q.value='宇城';q.dispatchEvent(new Event('input',{bubbles:true}));return{count:document.querySelectorAll('#placesBody .place').length,label:document.querySelector('#facilityHitCount').textContent}})()");
 assert(search.count>=1&&search.count<31,'facility search narrows list '+JSON.stringify(search));
 const filtered=await evaluate("(()=>{const s=document.querySelector('#facilitySelect');s.value='office';s.dispatchEvent(new Event('change',{bubbles:true}));return [...document.querySelectorAll('#placesBody .place .kind')].every(x=>['行政','医師会','保健所'].includes(x.textContent))})()");
 assert(filtered,'office-only filter');
 const focus=await evaluate("(()=>{const s=document.querySelector('#focusRegion');s.value='4310';s.dispatchEvent(new Event('change',{bubbles:true}));return document.querySelector('#regionDetail').innerText.includes('球磨')})()");
 assert(focus,'region selector changes detail');
 await evaluate("(()=>{document.querySelector('#facilityQuery').value='';document.querySelector('#facilitySelect').value='all';document.querySelector('#facilitySelect').dispatchEvent(new Event('change'));scrollTo(0,document.querySelector('#facility-counts').offsetTop);return true})()");
 await sleep(200);
 const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
 writeFileSync(join(artifacts,'kumamoto-'+label+'.png'),Buffer.from(shot.data,'base64'));
 reports.push({size:label,width,scrollWidth:state.page,regionalCards:state.regions,facilityCards:state.placeCount,projectionRows:state.projections,mapHeight:state.mapHeight,sourceRefs:state.sources,chartFallbacks:state.chartFallback,screenshot:'kumamoto-'+label+'.png'});
}
try{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));const port=server.address().port;
 const executable=['google-chrome','chromium','chromium-browser','google-chrome-stable'].map(x=>{const r=spawnSync('which',[x],{encoding:'utf8'});return r.status===0?r.stdout.trim():null}).find(Boolean);
 assert(executable,'Chromium not installed; cannot perform visual QA');
 profile=mkdtempSync(join(tmpdir(),'kumamoto-browser-qa-'));const debugPort=29161;
 chrome=spawn(executable,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--disable-extensions','--no-first-run','--no-default-browser-check','--remote-allow-origins=*','--remote-debugging-port='+debugPort,'--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
 let target;
 for(let i=0;i<100;i++){try{const r=await fetch('http://127.0.0.1:'+debugPort+'/json');if(r.ok){target=(await r.json()).find(t=>t.type==='page'&&t.webSocketDebuggerUrl);if(target)break}}catch(e){}await sleep(180)}
 assert(target?.webSocketDebuggerUrl,'Chrome CDP target missing');
 ws=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((yes,no)=>{ws.addEventListener('open',yes,{once:true});ws.addEventListener('error',no,{once:true})});
 ws.addEventListener('message',e=>{const v=JSON.parse(e.data);if(!v.id)return;const p=pending.get(v.id);if(!p)return;clearTimeout(p.timer);pending.delete(v.id);v.error?p.reject(Error(JSON.stringify(v.error))):p.resolve(v.result||{})});
 await call('Runtime.enable');await call('Page.enable');
 for(const [w,h,label]of [[1440,900,'desktop'],[820,950,'tablet'],[390,844,'mobile']])await check(w,h,label,port);
 writeFileSync(join(artifacts,'kumamoto-qa-results.json'),JSON.stringify(reports,null,2));
 console.log('BROWSER PASS '+JSON.stringify(reports));
}catch(e){console.error('KUMAMOTO QA FAILED: '+(e?.stack||e));process.exitCode=1}
finally{try{ws?.close()}catch{};try{chrome?.kill('SIGKILL')}catch{};try{server.close()}catch{};try{profile&&rmSync(profile,{force:true,recursive:true})}catch{}}
