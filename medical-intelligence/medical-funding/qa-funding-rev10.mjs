#!/usr/bin/env node
/* Funding Rev10 browser QA using Chrome CDP, Node 22, no npm dependency */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync,mkdirSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {spawn,spawnSync} from 'node:child_process';
import {resolve,join,dirname,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {createServer} from 'node:http';
const dir=dirname(fileURLToPath(import.meta.url)),root=resolve(dir,'../..'),html=readFileSync(join(dir,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert.equal(scripts.length,4);
const raw=scripts[0],db=JSON.parse(raw.slice(9,raw.indexOf(';const AGENCY_CONTACTS=')));
assert.equal(db.programs.length,132);assert.equal(db.prefectures.length,47);
assert.equal(new Set(db.programs.map(x=>x.ID)).size,132);
for(const x of scripts)new Function(x);
const body=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const ids=[...body.matchAll(/\bid=["']([^"']+)["']/g)].map(x=>x[1]);
assert.equal(ids.length,new Set(ids).size,'Static ID duplication');
for(const ref of body.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(ref[1]),'Missing anchor '+ref[1]);
assert.ok(html.includes('ui-rev10.css?v=20261113'));
console.log('FUNDING STATIC QA PASS: 132 records / 47 prefectures / links and JavaScript.');
if(!process.argv.includes('--browser'))process.exit(0);
const sleep=n=>new Promise(ok=>setTimeout(ok,n)),artifacts=join(dir,'qa-artifacts');
mkdirSync(artifacts,{recursive:true});
const srv=createServer((req,res)=>{try{const u=new URL(req.url,'http://127.0.0.1'),f0=resolve(root,'.'+decodeURIComponent(u.pathname));if(f0!==root&&!f0.startsWith(root+sep))throw Error('forbidden');const f=statSync(f0).isDirectory()?join(f0,'index.html'):f0,mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'}[extname(f)]||'text/plain';res.writeHead(200,{'Content-Type':mime+'; charset=utf-8'});res.end(readFileSync(f))}catch{res.writeHead(404);res.end('Not found')}});
await new Promise(ok=>srv.listen(0,'127.0.0.1',ok));
const bin=['google-chrome','chromium','chromium-browser'].map(n=>{const x=spawnSync('which',[n],{encoding:'utf8'});return x.status===0?x.stdout.trim():null}).find(Boolean);
assert.ok(bin,'Chrome unavailable');
const profile=mkdtempSync(join(tmpdir(),'funding-qa-')),chrome=spawn(bin,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--remote-debugging-port=0','--remote-allow-origins=*','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
let port=0,ws,seq=0;const pending=new Map();
const send=(method,params={})=>new Promise((yes,no)=>{const id=++seq,t=setTimeout(()=>{pending.delete(id);no(Error('Timeout '+method))},25000);pending.set(id,{yes,no,t});ws.send(JSON.stringify({id,method,params}))});
const ev=async code=>{let r=await send('Runtime.evaluate',{expression:code,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result?.value};
const results=[];
try{
 let tab;
 for(let i=0;i<130;i++){try{if(!port&&existsSync(join(profile,'DevToolsActivePort')))port=Number(readFileSync(join(profile,'DevToolsActivePort'),'utf8').split('\n')[0]);if(port){const r=await fetch('http://127.0.0.1:'+port+'/json');if(r.ok){tab=(await r.json()).find(x=>x.type==='page'&&x.webSocketDebuggerUrl);if(tab)break}}}catch{}await sleep(100)}
 assert.ok(tab,'CDP target unavailable');
 ws=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((yes,no)=>{ws.addEventListener('open',yes,{once:true});ws.addEventListener('error',no,{once:true})});
 ws.addEventListener('message',e=>{let a=JSON.parse(e.data);if(!a.id)return;const p=pending.get(a.id);if(!p)return;clearTimeout(p.t);pending.delete(a.id);a.error?p.no(Error(JSON.stringify(a.error))):p.yes(a.result)});
 await send('Runtime.enable');await send('Page.enable');
 const stateCode="(()=>({metrics:document.querySelectorAll('#metrics .metric').length,tiles:document.querySelectorAll('#jpMap .cell').length,rows:document.querySelectorAll('#tableBody tr').length,mobiles:document.querySelectorAll('#mobileResults .mobile-card').length,prefs:document.querySelectorAll('#prefContactDirectory .pref-contact-item').length,issuers:document.querySelectorAll('.institution-link').length,google:document.querySelectorAll('a[href*=\"google.com/maps\"]').length,css:[...document.styleSheets].some(x=>x.href&&x.href.includes('ui-rev10.css')),bodyW:document.body.scrollWidth,docW:document.documentElement.scrollWidth,vw:innerWidth,naN:document.body.innerText.includes('NaN万円'),count:document.querySelector('#resultCount')?.textContent}))()";
 const filterCode="(()=>{const p=document.querySelector('#prefFilter');p.value='東京都';p.dispatchEvent(new Event('change',{bubbles:true}));const tokyo=document.querySelector('#resultCount').textContent;document.querySelector('#resetFilters').click();document.querySelector('#onlyVerified').click();const verified=document.querySelector('#resultCount').textContent;document.querySelector('#resetFilters').click();return {tokyo,verified,reset:document.querySelector('#resultCount').textContent}})()";
 for(const [w,h,label] of [[1440,900,'desktop'],[820,1024,'tablet'],[390,844,'mobile'],[360,780,'small-mobile']]){
  await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:w<=700});
  await send('Page.navigate',{url:'http://127.0.0.1:'+srv.address().port+'/medical-intelligence/medical-funding/'});
  let z;
  for(let i=0;i<65;i++){await sleep(150);z=await ev(stateCode);if(z.metrics===5&&z.tiles===47&&z.rows===132&&z.prefs===47)break}
  assert.equal(z.metrics,5,JSON.stringify(z));assert.equal(z.tiles,47,JSON.stringify(z));assert.equal(z.rows,132,JSON.stringify(z));assert.equal(z.prefs,47,JSON.stringify(z));
  assert.ok(z.mobiles===12&&z.issuers>0&&z.google>=47&&z.css&&!z.naN,JSON.stringify(z));
  assert.ok(z.docW<=w+4&&z.bodyW<=w+4,'Page width overflow '+JSON.stringify(z));
  let f=await ev(filterCode);
  assert.ok(f.tokyo.includes('52')&&f.verified.includes('37')&&f.reset.includes('132'),JSON.stringify(f));
  const png=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
  writeFileSync(join(artifacts,'funding-'+label+'.png'),Buffer.from(png.data,'base64'));
  results.push({size:label,...z,filter:f})
 }
 console.log('FUNDING BROWSER QA PASS\n'+JSON.stringify(results,null,2));
}catch(e){console.error('FUNDING BROWSER QA FAILURE',String(e));process.exitCode=1}
finally{try{ws?.close()}catch{}chrome.kill('SIGTERM');await sleep(200);srv.close();try{rmSync(profile,{recursive:true,force:true})}catch{}}
