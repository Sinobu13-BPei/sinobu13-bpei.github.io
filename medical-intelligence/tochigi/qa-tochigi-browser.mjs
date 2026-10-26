#!/usr/bin/env node
/**
 * Browser-level layout test against the checked-out GitHub Pages site.
 * Uses Chrome DevTools Protocol over Node 22 WebSocket (no npm dependencies).
 */
import assert from 'node:assert/strict';
import {spawn, spawnSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const artifactDir=join(root,'qa-artifacts');mkdirSync(artifactDir,{recursive:true});
const sleep=n=>new Promise(r=>setTimeout(r,n));
function locateChrome(){for(const bin of ['google-chrome','google-chrome-stable','chromium','chromium-browser']){const p=spawnSync('which',[bin],{encoding:'utf8'});if(p.status===0)return p.stdout.trim()}throw Error('Chromium/Chrome binary missing')}
const binary=locateChrome(),profile=mkdtempSync(join(tmpdir(),'tochigi-cdp-')),port=29219;
const chrome=spawn(binary,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-extensions','--remote-debugging-port='+port,'--user-data-dir='+profile,'--window-size=1500,900','about:blank'],{stdio:'ignore'});
const debuggerUrl='http://127.0.0.1:'+port;
let socket,seq=1;const waiters=new Map();
function send(method,params={}){return new Promise((resolve,reject)=>{const id=seq++;const timer=setTimeout(()=>{waiters.delete(id);reject(Error('CDP timeout '+method))},20000);waiters.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}))})}
async function evalJS(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.error||r.exceptionDetails)throw Error(JSON.stringify(r));return r.result?.value}
async function untilReady(){for(let i=0;i<120;i++){try{const r=await evalJS('document.readyState');if(r==='complete'||(i>30&&r==='interactive'))return}catch(e){}await sleep(200)}throw Error('Page load timed out')}
const url=pathToFileURL(resolve(root,'index.html')).href;
const results=[];
async function checkViewport(width,height){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<700});
await send('Page.navigate',{url});await untilReady();await sleep(1100);
const res=await evalJS(`(function(){
 const map=document.querySelector('#map'),rect=map.getBoundingClientRect();
 const probe=document.createElement('div');probe.className='leaflet-pane';map.appendChild(probe);
 const tile=document.createElement('img');tile.className='leaflet-tile';map.appendChild(tile);
 const panePos=getComputedStyle(probe).position,tilePos=getComputedStyle(tile).position;
 probe.remove();tile.remove();
 const overflow=getComputedStyle(map).overflow;
 const charts=[...document.querySelectorAll('.chartWrap')].map(el=>({w:el.getBoundingClientRect().width,overflow:getComputedStyle(el).overflow}));
 return {width:innerWidth,docWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,
 map:{left:rect.left,right:rect.right,width:rect.width,height:rect.height,overflow,panePos,tilePos},
 cards:document.querySelectorAll('#areaCards .area-card').length,charts,href:location.href,
 localCSS:[...document.styleSheets].some(sheet=>sheet.href&&sheet.href.includes('leaflet-1.9.4.css'))};
})()`);
assert.ok(res.width>0,'viewport width');
assert.ok(res.docWidth<=res.width+2,`document overflows horizontally: ${JSON.stringify(res)}`);
assert.ok(res.bodyWidth<=res.width+2,'body horizontal overflow');
assert.ok(res.map.width>0&&res.map.right<=res.width+2&&res.map.left>=-2,'map clipped to viewport');
assert.ok(res.map.panePos==='absolute'&&res.map.tilePos==='absolute','Leaflet CSS positioning works without external stylesheet');
assert.ok(res.map.overflow==='hidden','map overflow hidden');
assert.ok(res.map.height>250&&res.map.height<650,'map has bounded height');
assert.ok(res.localCSS,'vendored Leaflet CSS applied');
assert.equal(res.cards,6,'six readable medical-area cards');
assert.ok(res.charts.length>=4&&res.charts.every(x=>x.w>100&&x.overflow==='hidden'),'chart containers bounded');
await evalJS(`(function(){const m=document.querySelector('#map');window.scrollTo({top:m.getBoundingClientRect().top+window.scrollY-110,behavior:'instant'});return true})()`);
await sleep(220);
const ss=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
const label=width<700?'mobile':'desktop';writeFileSync(join(artifactDir,'tochigi-'+label+'.png'),Buffer.from(ss.data,'base64'));
results.push({label,...res});}
try{
 let target;for(let i=0;i<120;i++){try{const r=await fetch(debuggerUrl+'/json');if(r.ok){const tabs=await r.json();target=tabs.find(t=>t.type==='page'&&t.webSocketDebuggerUrl);if(target)break}}catch(e){}await sleep(150)}
 assert.ok(target?.webSocketDebuggerUrl,'Chrome debug target');
 socket=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
 socket.addEventListener('message',event=>{const msg=JSON.parse(event.data);if(!msg.id)return;const p=waiters.get(msg.id);if(!p)return;clearTimeout(p.timer);waiters.delete(msg.id);if(msg.error)p.reject(Error(JSON.stringify(msg.error)));else p.resolve(msg.result||{})});
 await send('Page.enable');await send('Runtime.enable');
 for(const [w,h] of [[1440,900],[820,950],[390,844]])await checkViewport(w,h);
 console.log(JSON.stringify({result:'PASS',browser:binary,viewports:results,screenshots:['tochigi-desktop.png','tochigi-mobile.png']},null,2));
}catch(err){console.error('Browser QA FAIL:',err);process.exitCode=1}
finally{try{socket?.close()}catch(e){}chrome.kill('SIGTERM');await sleep(200);try{rmSync(profile,{recursive:true,force:true})}catch(e){}}
