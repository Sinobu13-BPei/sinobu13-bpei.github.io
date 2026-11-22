#!/usr/bin/env node
/* Rev.10 facility master QA: static JS checks, desktop/mobile browser and functional filters. */
import assert from "node:assert/strict";
import {readFileSync,existsSync,mkdtempSync,rmSync} from "node:fs";
import {spawn,spawnSync} from "node:child_process";
import {createServer} from "node:http";
import {resolve,dirname,join,extname,sep} from "node:path";
import {tmpdir} from "node:os";
import {fileURLToPath} from "node:url";
import vm from "node:vm";
const dir=dirname(fileURLToPath(import.meta.url)),root=resolve(dir,"../../..");
const html=readFileSync(join(dir,"index.html"),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,"inline controller is present");
new vm.Script(script,{filename:"facility-master/index.html"});
new vm.Script(readFileSync(join(dir,"identity-ui.js"),"utf8"),{filename:"facility-master/identity-ui.js"});
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,"duplicate HTML ids");
for(const id of ["q","pref","clear","records","previous","next","n","page","k-all","k-prefs"])assert.ok(ids.includes(id),"missing "+id);
assert.ok(html.includes("legacy-hospitals-20261122.csv"));
assert.ok(html.includes("公式照合前の暫定マスター"));
for(const id of ["im-confirmed","im-review","im-unmatched","im-rate","im-q","im-status","im-pref","im-rows","im-count","im-clear"])assert.ok(ids.includes(id),"Missing Navi UI "+id);
console.log("STAGE1 STATIC QA PASS");
if(process.argv.includes("--browser")){
 const server=createServer((req,res)=>{try{
  let file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(!file.startsWith(root+sep))throw Error("forbidden");
  if(existsSync(file)&&spawnSync("test",["-d",file]).status===0)file=join(file,"index.html");
  const mime={".html":"text/html",".csv":"text/csv",".js":"text/javascript",".json":"application/json"}[extname(file)]||"text/plain";
  const bytes=readFileSync(file);res.writeHead(200,{"Content-Type":mime+"; charset=utf-8"});res.end(bytes);
 }catch{if(!res.headersSent)res.writeHead(404);res.end("Not found")}});
 await new Promise(done=>server.listen(0,"127.0.0.1",done));
 const bin=["google-chrome","google-chrome-stable","chromium","chromium-browser"].map(x=>{const r=spawnSync("which",[x],{encoding:"utf8"});return r.status===0?r.stdout.trim():null}).find(Boolean);
 assert.ok(bin,"Headless Chrome is not installed");
 const profile=mkdtempSync(join(tmpdir(),"stage1-qa-"));const sleep=t=>new Promise(done=>setTimeout(done,t));
 const browser=spawn(bin,["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-extensions","--no-first-run","--remote-debugging-port=0","--user-data-dir="+profile,"about:blank"],{stdio:"ignore"});
 let ws,seq=0;const pending=new Map();
 const send=(method,params={})=>new Promise((yes,no)=>{const id=++seq,t=setTimeout(()=>{pending.delete(id);no(Error("Timeout "+method))},30000);pending.set(id,{yes,no,t});ws.send(JSON.stringify({id,method,params}))});
 const evalJS=async code=>{const r=await send("Runtime.evaluate",{expression:code,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error("Browser exception "+JSON.stringify(r.exceptionDetails));return r.result?.value};
 try{
  let target;
  for(let i=0;i<200;i++){try{
    if(existsSync(join(profile,"DevToolsActivePort"))){
      const port=Number(readFileSync(join(profile,"DevToolsActivePort"),"utf8").split("\n")[0]);
      const r=await fetch("http://127.0.0.1:"+port+"/json");
      if(r.ok){target=(await r.json()).find(x=>x.type==="page"&&x.webSocketDebuggerUrl);if(target)break}
    }
  }catch{}await sleep(100)}
  assert.ok(target,"Chrome debugging socket not available");
  ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((yes,no)=>{ws.addEventListener("open",yes,{once:true});ws.addEventListener("error",no,{once:true})});
  ws.addEventListener("message",event=>{const m=JSON.parse(event.data),task=pending.get(m.id);if(!task)return;clearTimeout(task.t);pending.delete(m.id);m.error?task.no(Error(JSON.stringify(m.error))):task.yes(m.result||{})});
  await send("Page.enable");await send("Runtime.enable");
  for(const width of [1280,390]){
    await send("Emulation.setDeviceMetricsOverride",{width,height:850,deviceScaleFactor:1,mobile:width<600});
    await send("Page.navigate",{url:"http://127.0.0.1:"+server.address().port+"/medical-intelligence/hospitals/facility-master/"});
    let state;
    for(let i=0;i<65;i++){
      state=await evalJS('(()=>({count:document.querySelector("#n")?.textContent||"",rows:document.querySelectorAll("#records tr").length,prefs:document.querySelector("#pref")?.options.length||0,scroll:document.documentElement.scrollWidth,view:innerWidth}))()');
      if(state.rows===50&&state.prefs===48)break;await sleep(200)
    }
    assert.equal(state.rows,50,"50 rows should render: "+JSON.stringify(state));
    assert.equal(state.prefs,48,"47 prefectures + all option");
    assert.ok(state.count.includes("8,019"),"Record count missing");
    assert.ok(state.scroll<=width+3,"Horizontal overflow: "+JSON.stringify(state));
    const filtered=await evalJS('(()=>{const f=document.querySelector("#q");f.value="北海道大学";f.dispatchEvent(new Event("input",{bubbles:true}));return {count:document.querySelector("#n").textContent,rows:document.querySelectorAll("#records tr").length,text:document.querySelector("#records").textContent.slice(0,150)}})()');
    assert.ok(filtered.rows>=1&&filtered.rows<50&&filtered.text.includes("北海道大学"),"Search did not filter "+JSON.stringify(filtered));
    const restored=await evalJS('(()=>{document.querySelector("#clear").click();return document.querySelector("#n").textContent})()');
    assert.ok(restored.includes("8,019"),"Clear did not restore 8019");
    let matchState;
    for(let i=0;i<80;i++){
      matchState=await evalJS('(()=>({confirmed:document.querySelector("#im-confirmed")?.textContent,review:document.querySelector("#im-review")?.textContent,unmatched:document.querySelector("#im-unmatched")?.textContent,rows:document.querySelectorAll("#im-rows tr").length,error:document.querySelector("#im-count")?.textContent}))()');
      if(matchState.confirmed==="3,453"&&matchState.rows===35)break;
      await sleep(200);
    }
    assert.equal(matchState.confirmed,"3,453","Official match status failed "+JSON.stringify(matchState));
    assert.equal(matchState.review,"3,435");assert.equal(matchState.unmatched,"1,131");
    const reviewView=await evalJS('(()=>{const f=document.querySelector("#im-status");f.value="要確認";f.dispatchEvent(new Event("change",{bubbles:true}));return {count:document.querySelector("#im-count").textContent,rows:document.querySelectorAll("#im-rows tr").length}})()');
    assert.ok(reviewView.count.includes("3,435")&&reviewView.rows===35,"Review filter failed "+JSON.stringify(reviewView));
    await evalJS('document.querySelector("#im-clear").click()');
    console.log("STAGE1 BROWSER QA PASS",width,JSON.stringify(state),JSON.stringify(matchState));
  }
 }finally{ws?.close();browser.kill("SIGTERM");await new Promise(done=>{if(browser.exitCode!==null)return done();browser.once("exit",done);setTimeout(done,1500)});server.close();rmSync(profile,{recursive:true,force:true,maxRetries:10,retryDelay:200})}
}
