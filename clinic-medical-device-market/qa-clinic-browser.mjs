#!/usr/bin/env node
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {readFileSync,existsSync,mkdtempSync,rmSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {tmpdir} from 'node:os';
const root=process.cwd();
const mimes={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const server=createServer((req,res)=>{
 try{
  const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const final=p.endsWith('/')?p+'index.html':p;
  const file=resolve(root,'.'+final);
  if(!file.startsWith(root+'/')||!existsSync(file)){res.writeHead(404);return res.end('missing')}
  let body=readFileSync(file);
  if(p==='/clinic-medical-device-market/'||p==='/clinic-medical-device-market/index.html'){
   body=Buffer.from(body.toString('utf8').replaceAll('https://sinobu13-bpei.github.io/medical-intelligence/assets/','/medical-intelligence/assets/'));
  }
  res.writeHead(200,{'Content-Type':mimes[extname(file)]||'application/octet-stream'});
  res.end(body);
 }catch(e){res.writeHead(500);res.end(String(e))}
});
const sleep=n=>new Promise(r=>setTimeout(r,n));
let browser,ws,profile,serial=0;const waiting=new Map();
function send(method,params={}){
 return new Promise((ok,fail)=>{const id=++serial,timer=setTimeout(()=>{waiting.delete(id);fail(Error('CDP timeout '+method))},15000);
 waiting.set(id,{ok,fail,timer});ws.send(JSON.stringify({id,method,params}))});
}
async function evaluate(expression){
 const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));
 return r.result?.value;
}
function auditPage(){
 if(typeof window.JMContrastAudit!=='function')return {error:'Shared UI unavailable',state:document.readyState,scripts:[...document.scripts].map(x=>x.src),bodyClass:document.body.className,explorerLoaded:!!window.filteredRows,html:document.documentElement.outerHTML.slice(-400)};
 const contrast=window.JMContrastAudit(),ids=['summary','clinic-2026-policy','visual','covid','mizuho','explorer','heat','pareto','bubbles','map','tree','pref-master','detail','sources'];
 const initRows=document.querySelectorAll('#prefTable tr').length,initData=window.filteredRows?.length??0;
 const year=document.getElementById('yearSel'),region=document.getElementById('regionSel'),initial=document.getElementById('fTam').textContent;
 region.value='関東';region.dispatchEvent(new Event('change',{bubbles:true}));
 const regionalRows=document.querySelectorAll('#prefTable tr').length,regionalCells=window.filteredRows?.length??0;
 document.getElementById('resetBtn').click();
 const resetRows=document.querySelectorAll('#prefTable tr').length,resetCells=window.filteredRows?.length??0;
 year.value='2030';year.dispatchEvent(new Event('change',{bubbles:true}));const afterYear=document.getElementById('fTam').textContent;
 document.getElementById('resetBtn').click();
 const beforePage=document.getElementById('detailPageStatus').textContent;
 document.getElementById('nextPageBtn').click();const afterPage=document.getElementById('detailPageStatus').textContent;
 document.getElementById('prevPageBtn').click();
 const map=document.getElementById('leafletMap');
 const checks={sections:ids.every(x=>!!document.getElementById(x)),pref47:initRows===47,cells3807:initData===3807,regionFilter:regionalRows>0&&regionalRows<47&&regionalCells<3807,reset:resetRows===47&&resetCells===3807,year:initial!==afterYear,page:beforePage!==afterPage,heat:document.getElementById('heatmap').children.length>40,tree:document.getElementById('treemap').children.length>0,map:map.children.length>0||map.textContent.trim().length>0};
 const rgb=x=>{const m=x?.match(/^rgba?\(([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[, /]+([\d.]+))?\)$/i);return m?[+m[1],+m[2],+m[3],m[4]===undefined?1:+m[4]]:null};
 const mix=(a,b)=>[0,1,2].map(i=>a[i]*a[3]+b[i]*(1-a[3])).concat([1]);
 const lum=x=>{const t=x.slice(0,3).map(y=>{y/=255;return y<=.04045?y/12.92:((y+.055)/1.055)**2.4});return .2126*t[0]+.7152*t[1]+.0722*t[2]};
 const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
 const background=el=>{const arr=[];for(let n=el;n&&n.nodeType===1;n=n.parentElement)arr.push(n);let out=[255,255,255,1];for(let i=arr.length-1;i>=0;i--){const c=rgb(getComputedStyle(arr[i]).backgroundColor);if(c)out=mix(c,out)}return out};
 let checked=0;const bad=[];
 for(const el of document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,small,strong,b,a,button,label,summary,li,th,td,div,input,select')){
  if(el.closest('svg,canvas,template,[hidden],[aria-hidden="true"]'))continue;
  if(!el.matches('input,select')&&![...el.childNodes].some(n=>n.nodeType===3&&n.nodeValue.trim()))continue;
  const st=getComputedStyle(el),r=el.getBoundingClientRect();if(st.display==='none'||st.visibility!=='visible'||st.opacity==='0'||r.width<2||r.height<2)continue;
  const fg=rgb(st.color);if(!fg)continue;const bg=background(el),v=ratio(mix(fg,bg),bg);const large=parseFloat(st.fontSize)>=24||(parseFloat(st.fontSize)>=18.66&&Number(st.fontWeight)>=700);checked++;
  if(v+.05<(large?3:4.5)&&bad.length<25)bad.push({text:(el.textContent||'').trim().slice(0,50),contrast:+v.toFixed(2),tag:el.tagName,color:st.color});
 }
 return {width:innerWidth,documentWidth:document.documentElement.scrollWidth,checked,bad,checks,repairs:contrast.repaired};
}
const widths=[320,375,768,1280],report=[];
try{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const candidates=['google-chrome','chromium'].map(x=>spawnSync('which',[x],{encoding:'utf8'})).filter(x=>x.status===0);
 assert.ok(candidates.length,'Chromium not installed');
 const bin=candidates[0].stdout.trim(),port=29537;
 profile=mkdtempSync(tmpdir()+'/hub-contrast-');
 browser=spawn(bin,['--headless=new','--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu','--disable-extensions','--no-first-run','--no-default-browser-check','--remote-allow-origins=*','--remote-debugging-port='+port,'--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe']});
 let stderr='';browser.stderr.on('data',chunk=>{stderr+=String(chunk).slice(0,5000)});
 let target;
 for(let i=0;i<110;i++){try{const r=await fetch('http://127.0.0.1:'+port+'/json');if(r.ok){target=(await r.json()).find(x=>x.type==='page'&&x.webSocketDebuggerUrl);if(target)break}}catch(e){}await sleep(100)}
 assert.ok(target,'Chrome CDP unavailable; binary='+bin+' exit='+browser.exitCode+' stderr='+stderr.slice(-2000));
 ws=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((ok,fail)=>{ws.addEventListener('open',ok,{once:true});ws.addEventListener('error',fail,{once:true})});
 ws.addEventListener('message',event=>{const data=JSON.parse(event.data),pending=waiting.get(data.id);if(!pending)return;clearTimeout(pending.timer);waiting.delete(data.id);data.error?pending.fail(Error(JSON.stringify(data.error))):pending.ok(data.result||{})});
 await send('Page.enable');await send('Runtime.enable');
 const url='http://127.0.0.1:'+server.address().port+'/clinic-medical-device-market/';
 for(const width of widths){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<700});
  await send('Page.navigate',{url});
  await sleep(2400);
  const result=await evaluate('('+auditPage.toString()+')()');
  assert.ok(!result.error,JSON.stringify(result));
  assert.ok(Object.values(result.checks).every(Boolean),'Functional checks '+JSON.stringify(result));
  assert.ok(result.documentWidth<=width+3,'horizontal overflow: '+JSON.stringify(result));
  assert.deepEqual(result.bad,[],'text contrast problems');
  report.push({width,checked:result.checked,contrastProblems:result.bad.length,checks:result.checks,repairs:result.repairs});
 }
 console.log(JSON.stringify({result:'PASS',viewports:report},null,2));
}catch(e){console.error('Clinic market QA FAILED:',e.message);process.exitCode=1}
finally{
 try{ws?.close()}catch(e){}try{browser?.kill()}catch(e){}await sleep(100);
 try{if(profile)rmSync(profile,{recursive:true,force:true})}catch(e){}
 await new Promise(ok=>server.close(ok))
}
