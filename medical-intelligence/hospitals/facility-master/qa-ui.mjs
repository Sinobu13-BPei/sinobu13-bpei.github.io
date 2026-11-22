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
new vm.Script(readFileSync(join(dir,"official-website-links.js"),"utf8"),{filename:"facility-master/official-website-links.js"});
new vm.Script(readFileSync(join(root,"medical-intelligence/hospitals/assets/legacy-official-websites-rev12.js"),"utf8"),{filename:"hospitals/assets/legacy-official-websites-rev12.js"});
const legacyHTML=readFileSync(join(root,"medical-intelligence/hospitals/index.html"),"utf8");
assert.equal((legacyHTML.match(/<tr data-text=/g)||[]).length,8019,"Legacy hospital original rows changed");
assert.ok(legacyHTML.includes('legacy-official-websites-rev12.js'),"Legacy official website script not linked");
assert.ok(legacyHTML.includes('legacy-official-websites-rev12.css'),"Legacy official website CSS not linked");
for(const file of ["legacy-official-site-links-20260601.csv","remaining-website-review-20260601.csv","remaining-website-review-audit-20260601.json"]){
 assert.ok(existsSync(join(dir,"data",file)),"Missing official website bridge/review evidence "+file);
}
assert.ok(html.includes('src="./official-website-links.js"'),"Missing hospital website link overlay JS");
assert.ok(html.includes('href="./official-websites.css"'),"Missing website link styles");
assert.ok(html.includes("data/official-websites-navi-20260601.csv"),"Missing website source CSV download");
const websiteAuditFile=join(dir,"data/official-websites-audit-20260601.json");
const websiteCSVFile=join(dir,"data/official-websites-navi-20260601.csv");
assert.ok(existsSync(websiteAuditFile)&&existsSync(websiteCSVFile),"Missing source-pinned official website overlay");
const websiteAudit=JSON.parse(readFileSync(websiteAuditFile,"utf8"));
assert.ok(websiteAudit.website_rows_published>1000&&websiteAudit.website_rows_published<=3453,"Website counts out of range");
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,"duplicate HTML ids");
for(const id of ["q","pref","clear","records","previous","next","n","page","k-all","k-prefs"])assert.ok(ids.includes(id),"missing "+id);
assert.ok(html.includes("legacy-hospitals-20261122.csv"));
for(const name of ["identity-risk-audit-20260601.json","identity-conflict-review-20260601.csv","identity-unmatched-triage-20260601.csv"]){
  assert.ok(html.includes("data/"+name),"Missing audit download link "+name);
  assert.ok(existsSync(join(dir,"data",name)),"Missing audit output file "+name);
}

assert.ok(html.includes("公式照合前の暫定マスター"));
for(const id of ["im-confirmed","im-review","im-unmatched","im-rate","im-q","im-status","im-pref","im-rows","im-count","im-clear"])assert.ok(ids.includes(id),"Missing Navi UI "+id);
console.log("STAGE1 STATIC QA PASS");
if(process.argv.includes("--browser")){
 const server=createServer((req,res)=>{try{
  let file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(!file.startsWith(root+sep))throw Error("forbidden");
  if(existsSync(file)&&spawnSync("test",["-d",file]).status===0)file=join(file,"index.html");
  const mime={".html":"text/html",".csv":"text/csv",".js":"text/javascript",".json":"application/json",".css":"text/css"}[extname(file)]||"text/plain";
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
    let websiteState;
    for(let i=0;i<45;i++){
      websiteState=await evalJS('(()=>({status:window.__officialWebsiteOverlay||null,linkedRows:document.querySelectorAll("#records .official-site-name-link,#im-rows .official-site-name-link").length}))()');
      if(websiteState.status?.ready)break;
      await sleep(200);
    }
    assert.equal(websiteState.status?.ready,true,"Navi website overlay did not initialize "+JSON.stringify(websiteState));
    assert.equal(websiteState.status.count,websiteAudit.website_rows_published,"Navi website overlay count mismatch");
    assert.ok(websiteState.linkedRows>0,"No actual hospital name links appeared in first pages");
    const example=await evalJS('(()=>{const a=document.querySelector("#records a[data-official-site],#im-rows a[data-official-site]");return a?{text:a.textContent,href:a.href,target:a.target,rel:a.rel}:null})()');
    assert.ok(example?.text&&/^https?:\/\//i.test(example.href)&&example.target==="_blank"&&example.rel.includes("noopener"),"Safe hospital name hyperlink missing");
    const reviewView=await evalJS('(()=>{const f=document.querySelector("#im-status");f.value="要確認";f.dispatchEvent(new Event("change",{bubbles:true}));return {count:document.querySelector("#im-count").textContent,rows:document.querySelectorAll("#im-rows tr").length}})()');
    assert.ok(reviewView.count.includes("3,435")&&reviewView.rows===35,"Review filter failed "+JSON.stringify(reviewView));
    await evalJS('document.querySelector("#im-clear").click()');
    console.log("STAGE1 BROWSER QA PASS",width,JSON.stringify(state),JSON.stringify(matchState));
  }

  // Test the actual original legacy 8,019-row page, including navigation links.
  // Do not mutate source row HTML; this is an isolated browser-only assertion.
  await send("Emulation.setDeviceMetricsOverride",{width:390,height:850,deviceScaleFactor:1,mobile:true});
  await send("Page.navigate",{url:"http://127.0.0.1:"+server.address().port+"/medical-intelligence/hospitals/"});
  let legacyState;
  for(let i=0;i<70;i++){
    legacyState=await evalJS('(()=>({status:window.__legacyOfficialWebsites||null,rows:document.querySelectorAll("tr[data-text]").length,links:document.querySelectorAll("tr[data-text] td:nth-child(3) a[data-navi-web]").length,legend:!!document.querySelector(".rev12-hospital-site-legend"),sample:[...document.querySelectorAll("tr[data-text]")].slice(0,2).map(tr=>[...tr.cells].slice(0,6).map(td=>td.textContent.slice(0,80))),width:document.documentElement?.scrollWidth||0,view:innerWidth}))()');
    if(legacyState.status?.state==="error"||(legacyState.status?.state==="ready"&&legacyState.links>0))break;
    await sleep(250);
  }
  assert.equal(legacyState.status?.state,"ready","Legacy website overlay failed: "+JSON.stringify(legacyState));
  assert.ok(legacyState.rows>=1&&legacyState.rows<=100,"Legacy pagination no longer showing up to 100 rows");
  assert.equal(legacyState.status.detail.totalSourceRows,8019,"Legacy source rows no longer preserved in overlay provenance");
  assert.equal(legacyState.status.detail.confirmedSourceLinks,3098,"Published link baseline changed");
  assert.ok(legacyState.links>0&&legacyState.links<=legacyState.rows,"Displayed first page must link only exact-confirmed hospitals: "+JSON.stringify(legacyState));
  assert.equal(legacyState.status.detail.unlinked,4921,"Other 4,921 hospitals must remain unlinked");
  assert.ok(legacyState.legend,"Source and live-status disclaimer missing");
  const sample=await evalJS('(()=>{const a=document.querySelector("tr[data-text] td:nth-child(3) a[data-navi-web]");return a?{text:a.textContent,url:a.href,target:a.target,rel:a.rel}:null})()');
  assert.ok(sample?.text&&(sample.url.startsWith("http://")||sample.url.startsWith("https://"))&&sample.target==="_blank"&&sample.rel.includes("noopener"),"Unsafe original hospital link");
  // Real pagination regression: the source page keeps only 100 original rows
  // attached to the DOM, while the 8,019-row dataset remains in memory.
  const bridgeCSV=readFileSync(join(dir,"data/legacy-official-site-links-20260601.csv"),"utf8");
  const linkedOriginalRows=bridgeCSV.replace(/^\uFEFF/,"").split(/\r?\n/).slice(1).map(s=>Number(s.match(/^LEG-[^,]+,(\d+),/)?.[1]||0)).filter(Boolean);
  assert.equal(linkedOriginalRows.length,3098,"Safe legacy bridge row-number index was not parsed");
  const expectedFirst=linkedOriginalRows.filter(i=>i>=1&&i<=100).length;
  const expectedSecond=linkedOriginalRows.filter(i=>i>=101&&i<=200).length;
  assert.equal(legacyState.links,expectedFirst,"First page must link exactly the expected source records");
  const searchUnverified=await evalJS('(()=>{const all=[...document.querySelectorAll("#detailTable a.hi-hospital-name")];return {all:all.length,unverified:all.filter(a=>!a.dataset.naviWeb).length,firstMap:!!document.querySelector("#detailTable a.smalllink"),hasSearch:all.some(a=>!a.dataset.naviWeb&&a.href.includes("google.com/search"))}})()');
  assert.ok(searchUnverified.unverified>0&&searchUnverified.firstMap&&searchUnverified.hasSearch,"The unverified hospital search and Map links were changed or lost");
  await evalJS('document.querySelector("#nextPage").click()');
  let secondPage;
  for(let i=0;i<65;i++){
    secondPage=await evalJS('(()=>({page:document.querySelector("#pageLabel")?.textContent||"",rows:document.querySelectorAll("#detailTable tbody tr").length,links:document.querySelectorAll("#detailTable a[data-navi-web]").length,unverified:document.querySelectorAll("#detailTable a.hi-hospital-name:not([data-navi-web])").length}))()');
    if(secondPage.page.startsWith("2 /")&&secondPage.links===expectedSecond)break;
    await sleep(120);
  }
  assert.ok(secondPage.page.startsWith("2 /")&&secondPage.rows===100&&secondPage.links===expectedSecond,"Second-page hospital links were not restored: "+JSON.stringify(secondPage)+" expected="+expectedSecond);
  // Search for a known source-confirmed hospital and verify the name points
  // to its Navi-reported URL, not the original Google search shortcut.
  await evalJS('(()=>{const q=document.querySelector("#q");q.value="函館渡辺病院";q.dispatchEvent(new Event("input",{bubbles:true}));})()');
  let filteredLegacy;
  for(let i=0;i<65;i++){
    filteredLegacy=await evalJS('(()=>({count:document.querySelector("#count")?.textContent||"",rows:document.querySelectorAll("#detailTable tbody tr").length,links:[...document.querySelectorAll("#detailTable a[data-navi-web]")].map(a=>({name:a.textContent,href:a.href})),mapLinks:document.querySelectorAll("#detailTable a.smalllink").length}))()');
    if(filteredLegacy.count.includes("1施設")&&filteredLegacy.links.length===1)break;
    await sleep(120);
  }
  assert.ok(filteredLegacy.count.includes("1施設")&&filteredLegacy.rows===1&&filteredLegacy.links.length===1&&filteredLegacy.links[0].name.includes("函館渡辺病院")&&filteredLegacy.mapLinks>=1,"Confirmed hospital search / mapping failed: "+JSON.stringify(filteredLegacy));
  await evalJS('document.querySelector("#clearFilters").click()');
  let cleared;
  for(let i=0;i<30;i++){
    cleared=await evalJS('(()=>({count:document.querySelector("#count")?.textContent||"",rows:document.querySelectorAll("#detailTable tbody tr").length,links:document.querySelectorAll("#detailTable a[data-navi-web]").length}))()');
    if(cleared.count.includes("8,019")&&cleared.rows===100&&cleared.links===expectedFirst)break;
    await sleep(120);
  }
  assert.ok(cleared.count.includes("8,019")&&cleared.rows===100&&cleared.links===expectedFirst,"Reset filters failed to restore legacy links: "+JSON.stringify(cleared));
  console.log("REV12 LEGACY PAGINATION AND SEARCH QA PASS",JSON.stringify({firstPage:expectedFirst,secondPage:expectedSecond,filteredLegacy,cleared}));
  console.log("REV12 LEGACY OFFICIAL WEBSITE BROWSER QA PASS",JSON.stringify(legacyState));

 }finally{ws?.close();browser.kill("SIGTERM");await new Promise(done=>{if(browser.exitCode!==null)return done();browser.once("exit",done);setTimeout(done,1500)});server.close();try{rmSync(profile,{recursive:true,force:true,maxRetries:10,retryDelay:200})}catch(e){if(["ENOTEMPTY","EBUSY","EPERM","EACCES"].includes(e?.code)){console.warn("CHROME PROFILE CLEANUP WARN",e.code)}else throw e}}
}
