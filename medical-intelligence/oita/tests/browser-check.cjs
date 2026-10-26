/* Browser smoke tests; require playwright; launch Chromium against a local HTTP server. */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {chromium}=require("playwright");
const base=process.env.OITA_QA_URL||"http://127.0.0.1:8765/medical-intelligence/oita/";
const out=path.resolve(__dirname,"screenshots");
fs.mkdirSync(out,{recursive:true});
async function scenario(browser,label,width,height){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto(base,{waitUntil:"domcontentloaded",timeout:30000});
 await page.locator("#areaTable tbody tr").first().waitFor({timeout:30000});
 await page.locator("#associationFacilityTable tbody tr").first().waitFor({timeout:30000});
 await page.locator("#sourcesList .source").first().waitFor({timeout:30000});
 const summary={
    width,height,
    areaRows:await page.locator("#areaTable tbody tr").count(),
    regionCards:await page.locator("#regionCards .region-card").count(),
    associationRows:await page.locator("#associationFacilityTable tbody tr").count(),
    municipalityRows:await page.locator("#municipalityFacilityTable tbody tr").count(),
    canvases:await page.locator("canvas").count(),
    sources:await page.locator("#sourcesList .source").count(),
    chartLoaded:await page.evaluate(()=>typeof Chart!=="undefined"),
    leafletLoaded:await page.evaluate(()=>typeof L!=="undefined")
 };
 assert.equal(summary.areaRows,6,"area table");
 assert.equal(summary.regionCards,6,"region cards");
 assert.equal(summary.associationRows,17,"association rows");
 assert.equal(summary.municipalityRows,19,"18 city rows plus total");
 assert.equal(summary.canvases,16,"chart canvases retained");
 assert.equal(summary.sources,44,"source registry");
 assert.ok(summary.chartLoaded,"Chart.js CDN loaded");
 const drawCount=await page.evaluate(()=>document.querySelectorAll("canvas").length&&Array.from(document.querySelectorAll("canvas")).filter(x=>Chart.getChart(x)).length);
 assert.equal(drawCount,16,"16 Chart.js instances");
 const overflow=await page.evaluate(()=>({html:document.documentElement.scrollWidth,inner:window.innerWidth,body:document.body.scrollWidth}));
 summary.documentWidth=overflow.html;
 assert.ok(overflow.html<=overflow.inner+4,"horizontal page overflow: "+JSON.stringify(overflow));
 await page.locator("#facilityAreaFilter").selectOption("east");
 assert.equal(await page.locator("#municipalityFacilityTable tbody tr").count(),6,"east 5 cities + total");
 await page.locator("#associationAreaFilter").selectOption("east");
 assert.ok((await page.locator("#associationFacilityTable tbody tr").count())>=2,"filtered association rows");
 await page.locator(".source-controls input").fill("S41");
 assert.ok((await page.locator("#sourcesList .source:not([hidden])").count())>=1,"search source results");
 await page.locator(".source-controls input").fill("");
 if(width<=760){
   await page.locator("#future-regions .gallery-tabs button").nth(1).click();
   assert.ok(await page.locator("#forecastElderlyChart").isVisible(),"mobile chart tab switch");
   const toggle=page.locator("#menuToggle");await toggle.click();assert.equal(await toggle.getAttribute("aria-expanded"),"true","mobile menu opens");
   await page.locator("#navigation a[href='#facilities']").click();
   assert.equal(await toggle.getAttribute("aria-expanded"),"false","mobile menu closes when navigating");
 }
 await page.screenshot({path:path.join(out,label+".png"),fullPage:true,animations:"disabled"});
 summary.pageErrors=errors;
 assert.equal(errors.length,0,"JavaScript page errors");
 await page.close();
 return summary;
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 try{
  const results=[];
  for(const [name,w,h] of [["desktop",1440,900],["tablet",820,1050],["mobile",390,844],["small-mobile",360,780]]){
    results.push(await scenario(browser,name,w,h));
  }
  console.log(JSON.stringify({ok:true,scenarios:results},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error("BROWSER_QA_FAIL",e.stack||e);process.exitCode=1});
