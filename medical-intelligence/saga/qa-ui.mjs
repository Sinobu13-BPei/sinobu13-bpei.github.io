/* Saga UI browser smoke test. Run with Playwright and local HTTP server. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
const url=process.env.SAGA_TEST_URL||'http://127.0.0.1:8765/';
const output=process.env.SAGA_TEST_OUTPUT||path.resolve('qa-output');
fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true}),results=[];
async function test(viewport,name){
 const page=await browser.newPage({viewport,deviceScaleFactor:1}),errors=[];
 page.on('pageerror',e=>errors.push(String(e.message)));
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
 await page.waitForFunction(()=>window.SAGA_QA&&window.SAGA_UI_QA&&window.SAGA_SUPPLEMENT_QA,{timeout:30000});
 await page.waitForTimeout(1200);
 const v=await page.evaluate(()=>({
  h1:document.querySelectorAll('h1').length,
  sections:document.querySelectorAll('section[id]').length,
  charts:document.querySelectorAll('canvas').length,
  horizontalOverflow:document.documentElement.scrollWidth-window.innerWidth,
  qa:window.SAGA_QA,supp:window.SAGA_SUPPLEMENT_QA,ui:window.SAGA_UI_QA,
  sourceLinks:document.querySelectorAll('#sourcesList a').length
 }));
 assert.equal(v.h1,1,'Unique primary page title');
 assert.equal(v.sections,13,'13 sections');
 assert.equal(v.charts,13,'13 canvas visualizations');
 assert.ok(v.horizontalOverflow<=2,'No horizontal viewport overflow: '+v.horizontalOverflow);
 assert.equal(v.qa.integrity,true,'Facility and area totals');
 assert.equal(v.supp.sampleSize,587,'Historic clinic sample count');
 assert.equal(v.supp.marketTotal,223,'Market rounded amount');
 assert.ok(v.sourceLinks>=18,'Source index links');
 const details=page.locator('#municipal-details');
 await details.locator('summary').click();
 assert.ok((await details.getAttribute('open'))!==null,'Municipality disclosure opens');
 await details.locator('summary').click();
 assert.ok((await details.getAttribute('open'))===null,'Municipality disclosure closes');
 await page.locator('#areaFilter').selectOption('東部');
 assert.equal(await page.locator('#areaCards .area-card').count(),1,'Area filter selected');
 await page.locator('#areaFilter').selectOption('all');
 assert.equal(await page.locator('#areaCards .area-card').count(),5,'Area filter reset');
 await page.locator('#locFilter').selectOption('保健所');
 assert.equal(await page.locator('#locations .loc-item').count(),5,'Health office filter');
 await page.locator('#locFilter').selectOption('all');
 if(v.ui.mapControls){
  for(const layer of ['hospitals','public','regions']){
   await page.locator('[data-map-layer="'+layer+'"]').click();
   assert.equal(await page.locator('[data-map-layer="'+layer+'"]').getAttribute('aria-pressed'),'true','Map filter '+layer);
  }
 }
 if(viewport.width<=700){
  const menu=page.locator('#navtoggle');await menu.click();
  assert.equal(await menu.getAttribute('aria-expanded'),'true','Mobile menu open');
  await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'false','Mobile menu close');
 }
 await page.screenshot({path:path.join(output,name+'.png'),fullPage:true,animations:'disabled'});
 assert.equal(errors.length,0,'Browser exceptions: '+errors.join(' | '));
 results.push({name,viewport,qa:v});
 await page.close();
}
try{
 await test({width:1440,height:900},'desktop');
 await test({width:768,height:1024},'tablet');
 await test({width:390,height:844},'mobile');
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify({status:'PASS',viewports:results.map(x=>x.name),charts:13,sections:13,clinicSample:587}));
}finally{await browser.close()}
