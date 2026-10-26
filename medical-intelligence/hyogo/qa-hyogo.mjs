#!/usr/bin/env node
/* Hyogo Medical Intelligence QA — Node 22, no npm dependencies. */
import assert from "node:assert/strict";
import {readFileSync,statSync,mkdirSync,writeFileSync,mkdtempSync,rmSync} from "node:fs";
import {spawn,spawnSync} from "node:child_process";
import {join,resolve,dirname,extname,sep} from "node:path";
import {tmpdir} from "node:os";
import {fileURLToPath} from "node:url";
import {createServer} from "node:http";
const dir=dirname(fileURLToPath(import.meta.url)),root=resolve(dir,"../..");
const read=name=>readFileSync(join(dir,name),"utf8");
const html=read("index.html"),css=read("assets/style.css"),script=read("assets/app.js"),fscript=read("assets/facilities.js");
const facilities=JSON.parse(read("data/facilities.json")),regions=JSON.parse(read("data/regions.json")).regions;
const fn=key=>facilities.areas.reduce((s,z)=>s+z[key],0);
assert.equal(facilities.areas.length,8);
assert.equal(facilities.associations.length,44);
assert.equal(facilities.areas.reduce((s,z)=>s+z.municipalities.length,0),49);
assert.equal(fn("clinics2023"),5196);assert.equal(fn("hospitals2023"),344);assert.equal(fn("dentalClinics2022"),2960);
for(const z of facilities.areas){for(const n of ["clinics2023","hospitals2023"])assert.equal(z.municipalities.reduce((a,x)=>a+x[n],0),z[n]);assert.ok(html.includes('id="area-'+z.id+'"'))}
const targets=[...html.matchAll(/href="#([^"]+)"/g)].map(z=>z[1]),ids=[...html.matchAll(/id="([^"]+)"/g)].map(z=>z[1]);
assert.equal(new Set(ids).size,ids.length,"HTML duplicate ids");
for(const target of targets)assert.ok(ids.includes(target),"Missing static anchor: "+target);
for(let i=1;i<=27;i++)assert.ok(html.includes('<b>［S'+i+'］'),"Missing source S"+i);
assert.ok(html.includes("地理院タイル"));assert.ok(html.includes("2023年"));assert.ok(html.includes("医師会の会員医療機関数では"));
assert.equal((html.match(/医師会情報<\/a>/g)||[]).length,44,"Medical associations missing in fallback HTML");
assert.ok(html.includes('id="medical-map"')&&html.includes('class="geo-svg"'));
assert.ok(html.includes('id="main-nav"')&&html.includes('class="nav-toggle"'));
assert.ok(css.includes("@media(max-width:700px)")&&css.includes(".scroll-associations"));
for(const f of ["assets/app.js","assets/facilities.js"]){const p=spawnSync("node",["--check",join(dir,f)],{encoding:"utf8"});assert.equal(p.status,0,"Syntax error "+f+": "+p.stderr)}
assert.ok(!html.includes("CMSC")&&!html.includes("顧客単位の営業情報"),"Private terms in public page");
console.log("HYOGO STATIC QA PASS: 8 areas, 49 municipalities, 44 listed items, 27 source citations, map/chart/anchors.");

if(process.argv.includes("--browser")){
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const artifacts=join(dir,"qa-artifacts");mkdirSync(artifacts,{recursive:true});
const srv=createServer((req,res)=>{try{let file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));if(file!==root&&!file.startsWith(root+sep))throw Error("forbidden");if(statSync(file).isDirectory())file=join(file,"index.html");const mime={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml"}[extname(file)]||"text/plain";res.writeHead(200,{"Content-Type":mime+"; charset=utf-8"});res.end(readFileSync(file))}catch{res.writeHead(404);res.end("Not found")}});
await new Promise(ok=>srv.listen(0,"127.0.0.1",ok));
const available=["chromium","google-chrome","chromium-browser","google-chrome-stable"].map(x=>{const p=spawnSync("which",[x],{encoding:"utf8"});return p.status===0?p.stdout.trim():null}).find(Boolean);
assert.ok(available,"Headless Chrome missing");
const profile=mkdtempSync(join(tmpdir(),"hyogo-qa-")),debug=29839,chrome=spawn(available,["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--disable-extensions","--no-first-run","--remote-debugging-port="+debug,"--user-data-dir="+profile,"about:blank"],{stdio:"ignore"});
let ws,seq=0;const pending=new Map();
const send=(method,params={})=>new Promise((yes,no)=>{const id=++seq,t=setTimeout(()=>{pending.delete(id);no(Error("Timeout "+method))},25000);pending.set(id,{yes,no,t});ws.send(JSON.stringify({id,method,params}))});
const ev=async js=>{const r=await send("Runtime.evaluate",{expression:js,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result?.value};
try{
 let tab;
 for(let i=0;i<130;i++){try{const x=await fetch("http://127.0.0.1:"+debug+"/json");if(x.ok){tab=(await x.json()).find(y=>y.type==="page"&&y.webSocketDebuggerUrl);if(tab)break}}catch{}await sleep(150)}
 assert.ok(tab,"Chrome debug target missing");ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((yes,no)=>{ws.addEventListener("open",yes,{once:true});ws.addEventListener("error",no,{once:true})});
 ws.addEventListener("message",evt=>{const x=JSON.parse(evt.data);if(!x.id)return;const z=pending.get(x.id);if(!z)return;clearTimeout(z.t);pending.delete(x.id);x.error?z.no(Error(JSON.stringify(x.error))):z.yes(x.result)});
 await send("Runtime.enable");await send("Page.enable");
 for(const [width,height,label]of [[1440,900,"desktop"],[820,1024,"tablet"],[390,844,"mobile"],[360,780,"mobile-small"]]){
 await send("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:width<700});
 await send("Page.navigate",{url:"http://127.0.0.1:"+srv.address().port+"/medical-intelligence/hyogo/"});
 await sleep(1300);
 let state;
 for(let i=0;i<65;i++){state=await ev('(()=>({ready:document.readyState,areas:document.querySelectorAll("#regioncards .region").length,rows:document.querySelectorAll("#medical-association-rows tr").length,facility:document.querySelectorAll("#facility-area-rows tr").length,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth,view:innerWidth,map:document.querySelector("#medical-map")?.getBoundingClientRect().height,geo:document.querySelector(".geo-svg")?.getBoundingClientRect().width,charts:document.querySelectorAll("canvas").length,menu:document.querySelector(".nav-toggle")?.getBoundingClientRect().width,errors:document.querySelector("#facility-status")?.innerText||""}))()');
 if(state.areas===8&&state.rows===44&&state.facility>=8)break;await sleep(180)}
 assert.equal(state.areas,8,"Medical-area cards "+JSON.stringify(state));
 assert.equal(state.rows,44,"Association rows "+JSON.stringify(state));
 assert.ok(state.facility>=8,"Facility rows");
 assert.ok(state.scroll<=width+2,"Horizontal overflow "+JSON.stringify(state));
 assert.ok(state.body<=width+2,"Body overflow "+JSON.stringify(state));
 assert.ok(state.map>=270&&state.map<=600,"Map geometry "+JSON.stringify(state));
 assert.ok(state.geo>200&&state.geo<=width,"SVG geography must fit viewport "+JSON.stringify(state));
 assert.equal(state.charts,8);
 assert.ok(!state.errors.includes("不整合"),"Facility dataset integrity warning");
 if(width<700){
 const toggled=await ev('(()=>{const b=document.querySelector(".nav-toggle");b.click();return {expanded:b.getAttribute("aria-expanded"),open:document.querySelector("#main-nav").classList.contains("is-open")}})()');
 assert.equal(toggled.expanded,"true");assert.ok(toggled.open);
 const closed=await ev('(()=>{const b=document.querySelector(".nav-toggle");b.click();return {expanded:b.getAttribute("aria-expanded"),open:document.querySelector("#main-nav").classList.contains("is-open")}})()');
 assert.equal(closed.expanded,"false");assert.ok(!closed.open);
 }
 const shot=await send("Page.captureScreenshot",{format:"png",fromSurface:true,captureBeyondViewport:false});
 writeFileSync(join(artifacts,"hyogo-"+label+".png"),Buffer.from(shot.data,"base64"));
 if(label==="desktop"||label==="mobile"){
   await ev('document.querySelector("#facilities")?.scrollIntoView({behavior:"instant",block:"start"})');
   await sleep(180);
   let capture=await send("Page.captureScreenshot",{format:"png",fromSurface:true,captureBeyondViewport:false});
   writeFileSync(join(artifacts,"hyogo-"+label+"-facilities.png"),Buffer.from(capture.data,"base64"));
   await ev('document.querySelector("#map-section")?.scrollIntoView({behavior:"instant",block:"start"})');
   await sleep(180);
   capture=await send("Page.captureScreenshot",{format:"png",fromSurface:true,captureBeyondViewport:false});
   writeFileSync(join(artifacts,"hyogo-"+label+"-map.png"),Buffer.from(capture.data,"base64"));
 }
 console.log("HYOGO BROWSER QA",label,JSON.stringify(state));
 }
 const filtered=await ev('(()=>{const f=document.querySelector("#association-filter");f.value="阪神";f.dispatchEvent(new Event("change",{bubbles:true}));return {rows:document.querySelectorAll("#medical-association-rows tr").length,label:document.querySelector("#association-results").textContent}})()');
 assert.ok(filtered.rows>0&&filtered.rows<44,"Filter broken "+JSON.stringify(filtered));
 console.log("HYOGO BROWSER QA PASS: breakpoints, all 8 regions, 44 associations, scrolling, map and filter.");
}finally{ws?.close();chrome.kill("SIGTERM");srv.close();await sleep(300);rmSync(profile,{recursive:true,force:true})}
}
