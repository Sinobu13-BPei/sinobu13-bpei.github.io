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
  if(p==='/medical-intelligence/'||p==='/medical-intelligence/index.html'){
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
 if(typeof window.JMContrastAudit!=='function')return {error:'Contrast audit did not initialize'};
 const repaired=window.JMContrastAudit();
 const regions=document.querySelectorAll('#regionList .region');
 const names=['新潟県','長野県','山梨県','大阪府','兵庫県','熊本県'];
 const buttons=names.map(name=>{
  const row=[...regions].find(el=>el.querySelector('strong')?.textContent===name);
  return {name,links:[...row?.querySelectorAll('a')||[]].map(x=>x.textContent.trim())};
 });
 const rgb=x=>{const m=x?.match(/^rgba?\(([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[, /]+([\d.]+))?\)$/i);return m?[+m[1],+m[2],+m[3],m[4]===undefined?1:+m[4]]:null};
 const mix=(a,b)=>[0,1,2].map(i=>a[i]*a[3]+b[i]*(1-a[3])).concat([1]);
 const luminance=x=>{const s=x.slice(0,3).map(y=>{y/=255;return y<=.04045?y/12.92:((y+.055)/1.055)**2.4});return .2126*s[0]+.7152*s[1]+.0722*s[2]};
 const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
 const background=el=>{
  const nodes=[];for(let n=el;n&&n.nodeType===1;n=n.parentElement)nodes.push(n);
  let b=[255,255,255,1];
  for(let i=nodes.length-1;i>=0;i--){const c=rgb(getComputedStyle(nodes[i]).backgroundColor);if(c)b=mix(c,b)}
  return b;
 };
 const bad=[];let count=0;
 const selector='h1,h2,h3,h4,h5,h6,p,span,small,strong,b,em,i,a,button,label,summary,li,dd,dt,th,td,caption,figcaption,blockquote,output,input,select,textarea,div';
 for(const el of document.querySelectorAll(selector)){
  if(el.closest('svg,canvas,template,[hidden],[aria-hidden="true"]'))continue;
  if(!el.matches('input,select,textarea')&&![...el.childNodes].some(x=>x.nodeType===3&&x.nodeValue.trim()))continue;
  const st=getComputedStyle(el),rc=el.getBoundingClientRect();
  if(st.display==='none'||st.visibility!=='visible'||st.opacity==='0'||rc.width<2||rc.height<2)continue;
  const fg=rgb(st.color);if(!fg)continue;
  const bg=background(el),contrast=ratio(mix(fg,bg),bg);
  const large=parseFloat(st.fontSize)>=24||(parseFloat(st.fontSize)>=18.66&&Number(st.fontWeight)>=700);
  const target=large?3:4.5;count++;
  if(contrast+.05<target&&bad.length<20)bad.push({tag:el.tagName,text:(el.textContent||'').trim().slice(0,65),contrast:Number(contrast.toFixed(2)),color:st.color});
 }
 const footer=document.querySelector('.footer-link-strip');
 const footerLabels=[...footer?.querySelectorAll('a')||[]].map(a=>a.textContent.replace(/[\s\u3000]+/g,' ').trim());
 const contactCount=document.querySelectorAll('.footer-contact-row a[href^="mailto:"]').length;
 const footerWidth=footer?.clientWidth||0;
 return {width:innerWidth,documentWidth:document.documentElement.scrollWidth,regions:regions.length,buttons,checked:count,repairs:repaired.repaired,bad,footerLabels,footerWidth,contactCount};
}
const widths=[375,768,1280],report=[];
try{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const candidates=['google-chrome','chromium'].map(x=>spawnSync('which',[x],{encoding:'utf8'})).filter(x=>x.status===0);
 assert.ok(candidates.length,'Chromium not installed');
 const bin=candidates[0].stdout.trim();let port=0;
 profile=mkdtempSync(tmpdir()+'/hub-contrast-');
 browser=spawn(bin,['--headless=new','--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu','--disable-extensions','--no-first-run','--no-default-browser-check','--remote-allow-origins=*','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe']});
 let stderr='';browser.stderr.on('data',chunk=>{stderr+=String(chunk).slice(0,5000)});
 let target;
 for(let i=0;i<350;i++){try{if(!port&&existsSync(profile+'/DevToolsActivePort'))port=+(readFileSync(profile+'/DevToolsActivePort','utf8').split('\n')[0]);if(port){const r=await fetch('http://127.0.0.1:'+port+'/json');if(r.ok){target=(await r.json()).find(x=>x.type==='page'&&x.webSocketDebuggerUrl);if(target)break}}}catch(e){}await sleep(100)}
 assert.ok(target,'Chrome CDP unavailable; binary='+bin+' exit='+browser.exitCode+' stderr='+stderr.slice(-2000));
 ws=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((ok,fail)=>{ws.addEventListener('open',ok,{once:true});ws.addEventListener('error',fail,{once:true})});
 ws.addEventListener('message',event=>{const data=JSON.parse(event.data),pending=waiting.get(data.id);if(!pending)return;clearTimeout(pending.timer);waiting.delete(data.id);data.error?pending.fail(Error(JSON.stringify(data.error))):pending.ok(data.result||{})});
 await send('Page.enable');await send('Runtime.enable');
 const url='http://127.0.0.1:'+server.address().port+'/medical-intelligence/';
 for(const width of widths){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<700});
  await send('Page.navigate',{url});
  await sleep(2400);
  const result=await evaluate('('+auditPage.toString()+')()');
  assert.ok(!result.error,JSON.stringify(result));
  assert.equal(result.regions,47,'47 prefectures');
  const expectedFooter=['診療所MKT分析 ↗','医師会 ↗','商社・HD ↗','JAHID','CT-MKT分析 ↗','MRI-MKT分析 ↗','学会カレンダー（画像系） ↗','論文調査｜JRS・SMI・MSK ↗','戦略策定 基礎 ↗','戦略策定 立案 ↗','会食に関して ↗','お食事処 ↗','散策場所 ↗'];
  assert.deepEqual(result.footerLabels,expectedFooter,'footer navigation order and deduplication');
  assert.equal(result.contactCount,1,'one contact link in footer');
  assert.ok(result.footerWidth>250,'footer strip is visible');

  for(const b of result.buttons){
   const needed=['新潟県','長野県','山梨県'].includes(b.name)?'甲信越MKT ↗':b.name==='大阪府'?'大阪MKT ↗':b.name==='兵庫県'?'兵庫MKT ↗':'熊本MKT ↗';
   assert.ok(b.links.includes(needed),'missing '+needed+' in '+b.name);
  }
  assert.ok(result.documentWidth<=width+3,'horizontal overflow: '+JSON.stringify(result));
  assert.deepEqual(result.bad,[],'text contrast problems');
  report.push({width,checked:result.checked,contrastRepairs:result.repairs,overflows:result.documentWidth>width+3});
 }
 console.log(JSON.stringify({result:'PASS',viewports:report},null,2));
}catch(e){console.error('Hub contrast QA FAILED:',e.message);process.exitCode=1}
finally{
 try{ws?.close()}catch(e){}try{browser?.kill()}catch(e){}await sleep(100);
 try{if(profile)rmSync(profile,{recursive:true,force:true})}catch(e){}
 await new Promise(ok=>server.close(ok))
}
