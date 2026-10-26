#!/usr/bin/env node
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {readFileSync,existsSync,mkdirSync,mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {resolve,dirname,join,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
const dir=dirname(fileURLToPath(import.meta.url)),base=resolve(dir,'../..');
const artifacts=join(dir,'qa-artifacts');mkdirSync(artifacts,{recursive:true});
const mimes={'.html':'text/html; charset=utf-8','.json':'application/json','.js':'text/javascript','.css':'text/css'};
const server=createServer((req,res)=>{try{let u=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(u.endsWith('/'))u+='index.html';const f=resolve(base,'.'+u);if(!f.startsWith(base+'/')||!existsSync(f)){res.writeHead(404);return res.end('missing')}res.writeHead(200,{'Content-Type':mimes[extname(f)]||'application/octet-stream'});res.end(readFileSync(f))}catch(e){res.writeHead(500);res.end('error')}});
const sleep=n=>new Promise(r=>setTimeout(r,n));
let chrome,socket,profile;let serial=0;const waiting=new Map(),report=[];
function send(method,params={}){return new Promise((yes,no)=>{let id=++serial,timer=setTimeout(()=>{waiting.delete(id);no(Error('CDP timeout: '+method))},22000);waiting.set(id,{yes,no,timer});socket.send(JSON.stringify({id,method,params}))})}
async function ev(expression){const z=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(z.exceptionDetails)throw Error(JSON.stringify(z.exceptionDetails));return z.result?.value}
const readState="(()=>({ready:document.readyState,view:innerWidth,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth,map:document.querySelector('#facilityMap')?.getBoundingClientRect().height,heat:document.querySelectorAll('#visualHeatmap .v-hm-cell').length,priority:document.querySelectorAll('#visualPriorityMatrix .v-p-cell').length,icons:document.querySelectorAll('.v-modality-grid use').length,charts:[...document.querySelectorAll('.v-chart')].map(x=>x.getBoundingClientRect().width),cards:document.querySelectorAll('#facilityList .facility').length,area:document.querySelector('#visualAreaDetail')?.innerText||''}))()";
async function runViewport(w,h,url){
 await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:w<700});await send('Page.navigate',{url});await sleep(1900);
 let state;for(let i=0;i<30;i++){state=await ev(readState);if(state.heat===15&&state.priority===15&&state.cards>0)break;await sleep(250)}
 assert.equal(state.heat,15,'heatmap 5x3');assert.equal(state.priority,15,'priority 5x3');assert.equal(state.icons,9,'nine icon elements');
 assert.equal(state.charts.length,4,'additional chart slots');assert.ok(state.charts.every(x=>x>180&&x<=w),'chart sizes');
 assert.ok(state.scroll<=w+2,'horizontal overflow '+JSON.stringify(state));assert.ok(state.body<=w+2,'body overflow');
 assert.ok(state.map>=250&&state.map<=700,'map bounded');assert.ok(state.area.includes('東部'),'default area');
 const changed=await ev("(()=>{document.querySelector('[data-visual-area=\"west\"]').click();return document.querySelector('#visualAreaDetail').innerText.includes('西部')&&document.querySelector('[data-visual-area=\"west\"]').getAttribute('aria-pressed')==='true'})()");
 assert.ok(changed,'interactive region toggle');
 await ev("(()=>{const t=document.querySelector('#visual-atlas');scrollTo(0,t.offsetTop);return true})()");await sleep(220);
 const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
 const label=w<700?'mobile':w<1200?'tablet':'desktop';
 writeFileSync(join(artifacts,'kagawa-'+label+'.png'),Buffer.from(shot.data,'base64'));
 report.push({viewport:w+'x'+h,heatmapCells:state.heat,priorityCells:state.priority,icons:state.icons,chartSlots:state.charts.length,scrollWidth:state.scroll,screenshot:'kagawa-'+label+'.png'});
}
try{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const c=spawnSync('which',['chromium'],{encoding:'utf8'}),d=spawnSync('which',['google-chrome'],{encoding:'utf8'});const bin=c.status===0?c.stdout.trim():d.status===0?d.stdout.trim():'';assert.ok(bin,'browser binary');
 profile=mkdtempSync(join(tmpdir(),'kagawa-cdp-'));const port=29353;
 chrome=spawn(bin,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-extensions','--remote-debugging-port='+port,'--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
 let target;for(let i=0;i<130;i++){try{const r=await fetch('http://127.0.0.1:'+port+'/json');if(r.ok){target=(await r.json()).find(x=>x.type==='page'&&x.webSocketDebuggerUrl);if(target)break}}catch(e){}await sleep(100)}
 assert.ok(target,'browser debugger');socket=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((ok,no)=>{socket.addEventListener('open',ok,{once:true});socket.addEventListener('error',no,{once:true})});
 socket.addEventListener('message',e=>{let m=JSON.parse(e.data),w=waiting.get(m.id);if(!w)return;clearTimeout(w.timer);waiting.delete(m.id);if(m.error)w.no(Error(JSON.stringify(m.error)));else w.yes(m.result||{})});
 await send('Page.enable');await send('Runtime.enable');
 const url='http://127.0.0.1:'+server.address().port+'/medical-intelligence/kagawa/';
 for(const [w,h] of [[1440,900],[820,950],[390,844]])await runViewport(w,h,url);
 console.log(JSON.stringify({result:'PASS',viewports:report},null,2));
}catch(e){console.error('Kagawa browser QA FAIL:',e);process.exitCode=1}
finally{try{socket?.close()}catch(e){}try{chrome?.kill()}catch(e){}await sleep(200);try{profile&&rmSync(profile,{recursive:true,force:true})}catch(e){}await new Promise(ok=>server.close(ok))}
