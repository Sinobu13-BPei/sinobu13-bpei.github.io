
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {readFileSync,statSync,mkdirSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const home=dirname(fileURLToPath(import.meta.url)),root=resolve(home,'../..'),shotDir=join(home,'qa-artifacts');
mkdirSync(shotDir,{recursive:true});
const sleep=n=>new Promise(r=>setTimeout(r,n));
const server=createServer((req,res)=>{try{const wanted=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file=resolve(root,'.'+wanted);if(file!==root&&!file.startsWith(root+sep))throw Error('Forbidden');if(statSync(file).isDirectory())file=join(file,'index.html');const type={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json'}[extname(file)]||'application/octet-stream';res.writeHead(200,{'Content-Type':type+'; charset=utf-8'});res.end(readFileSync(file))}catch(e){res.writeHead(404);res.end('Not found')}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const cb=['chromium','google-chrome','chromium-browser','google-chrome-stable'].map(s=>{const r=spawnSync('which',[s],{encoding:'utf8'});return r.status===0?r.stdout.trim():null}).find(Boolean);
assert(cb,'Chrome binary missing');
const profile=mkdtempSync(join(tmpdir(),'miyazaki-ui-')),debug=29417;
const chrome=spawn(cb,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--disable-extensions','--no-first-run','--remote-debugging-port='+debug,'--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
let ws,id=1;const pending=new Map(),results=[];
const send=(method,params={})=>new Promise((resolve,reject)=>{const n=id++,timer=setTimeout(()=>{pending.delete(n);reject(Error('Timeout '+method))},25000);pending.set(n,{resolve,reject,timer});ws.send(JSON.stringify({id:n,method,params}))});
const evalCode=async code=>{const r=await send('Runtime.evaluate',{expression:code,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
try{
 let tab;
 for(let n=0;n<100;n++){try{const r=await fetch('http://127.0.0.1:'+debug+'/json');if(r.ok){tab=(await r.json()).find(t=>t.type==='page'&&t.webSocketDebuggerUrl);if(tab)break}}catch(e){}await sleep(160)}
 assert(tab?.webSocketDebuggerUrl,'Missing browser debug target');ws=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
 ws.addEventListener('message',event=>{const x=JSON.parse(event.data);if(!x.id)return;const p=pending.get(x.id);if(!p)return;clearTimeout(p.timer);pending.delete(x.id);x.error?p.reject(Error(JSON.stringify(x.error))):p.resolve(x.result||{})});
 await send('Page.enable');await send('Runtime.enable');
 for(const [width,height,label]of [[1440,900,'desktop'],[820,980,'tablet'],[390,844,'mobile']]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<700});
  await send('Page.navigate',{url:'http://127.0.0.1:'+port+'/medical-intelligence/miyazaki/'});
  for(let i=0;i<100;i++){const ok=await evalCode("document.querySelectorAll('.v-tile').length===9&&document.querySelectorAll('.v-cell').length===35").catch(()=>false);if(ok)break;await sleep(240)}
  const x=await evalCode("(()=>{const rect=id=>{const r=document.getElementById(id)?.getBoundingClientRect();return r?{w:r.width,h:r.height,left:r.left,right:r.right}:null};return{window:innerWidth,page:document.documentElement.scrollWidth,tiles:document.querySelectorAll('.v-tile').length,cells:document.querySelectorAll('.v-cell').length,pictos:document.querySelectorAll('.v-humanfield span').length,sources:document.querySelectorAll('#sourcesList li').length,map:rect('visual-layer-map'),bubble:rect('v-bubble'),hero:rect('visual-hero'),visualCSS:[...document.styleSheets].some(s=>s.href?.includes('visuals.css'))}})()");
  assert.equal(x.tiles,9,'nine modality icons');assert.equal(x.cells,35,'seven by five score heatmap');
  assert.equal(x.pictos,200,'two 100-person pictogram series');assert.ok(x.visualCSS,'visual styles');
  assert.ok(x.page<=width+3,'horizontal overflow '+JSON.stringify(x));
  assert.ok(x.map?.w>200&&x.map.h>=300&&x.map.h<=500,'map dimensions');
  assert.ok(x.bubble?.w>200&&x.hero?.w>200,'bubble/hero dimensions');
  assert.ok(x.sources>=20,'source references');
  await evalCode("window.scrollTo({top:document.getElementById('visual-heatmap').offsetTop-90,behavior:'instant'})");await sleep(300);
  const image=await send('Page.captureScreenshot',{format:'png',fromSurface:true});
  writeFileSync(join(shotDir,'miyazaki-'+label+'.png'),Buffer.from(image.data,'base64'));
  results.push({label,...x});
 }
 console.log(JSON.stringify({result:'PASS',screenshots:results.map(x=>'miyazaki-'+x.label+'.png'),viewports:results},null,2));
}catch(err){console.error('Miyazaki visual browser QA failed',err);process.exitCode=1}
finally{ws?.close();chrome.kill('SIGTERM');server.close();await sleep(150);rmSync(profile,{recursive:true,force:true})}
