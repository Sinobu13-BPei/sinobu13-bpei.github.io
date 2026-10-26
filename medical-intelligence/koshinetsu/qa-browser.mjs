import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const here=path.dirname(fileURLToPath(import.meta.url));
const base=new URL('./index.html',import.meta.url).href;
const screenshots=path.join(here,'qa-screenshots');
fs.mkdirSync(screenshots,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
for(const width of [375,768,1440]){
const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route(/^https?:/,route=>route.abort()); // Externals offline: checks local site robustness and fallback
await page.goto(base,{waitUntil:'load'});await page.waitForTimeout(150);
let m=await page.evaluate(()=>{
const root=document.documentElement;
const overflow=root.scrollWidth-innerWidth;
const overNodes=[...document.body.querySelectorAll('*')].filter(el=>{
const rect=el.getBoundingClientRect();
if(rect.width===0||rect.right<=innerWidth+2)return false;
let a=el.parentElement;
while(a&&a!==document.body){
let cs=getComputedStyle(a);
if(['auto','scroll','hidden','clip'].includes(cs.overflowX))return false;
a=a.parentElement;
}
return true;
}).slice(0,10).map(el=>({tag:el.tagName,id:el.id,text:el.textContent?.trim().slice(0,40)}));
return {overflow,overNodes,facilityRows:document.querySelectorAll('#facilityRows tr').length,associations:document.querySelectorAll('#associationRows tr').length,clinics:document.querySelector('#facilityClinicTotal')?.textContent,hospitals:document.querySelector('#facilityHospitalTotal')?.textContent,total:document.querySelector('#facilityAllTotal')?.textContent,associationTotal:document.querySelector('#associationTotal')?.textContent,sources:document.querySelectorAll('#sourceList li').length,realMap:!!document.querySelector('.leaflet-container'),fallbackMap:document.querySelector('#medicalMap')?.textContent?.includes('地図ライブラリ')};
});
console.log('Viewport',width,JSON.stringify(m));
assert(m.overflow<=2,'viewport overflow '+width+': '+m.overflow+' offenders='+JSON.stringify(m.overNodes));
assert.equal(m.facilityRows,21,'21 secondary medical areas');
assert.equal(m.associations,48,'48 associations');
assert.equal(m.clinics,'3,980');
assert.equal(m.hospitals,'302');
assert.equal(m.total,'4,282');
assert.equal(m.associationTotal,'48団体');
assert(m.sources>=36,'minimum 36 citations');
assert(m.fallbackMap,'map fallback for unavailable Leaflet');
await page.locator('#prefFilter').selectOption('長野県');
assert.equal(await page.locator('#facilityRows tr').count(),10);
assert.equal(await page.locator('#associationRows tr').count(),21);
assert.equal(await page.locator('#facilityClinicTotal').textContent(),'1,599');
await page.locator('#prefFilter').selectOption('新潟県');
assert.equal(await page.locator('#facilityRows tr').count(),7);
assert.equal(await page.locator('#associationRows tr').count(),16);
await page.locator('#prefFilter').selectOption('山梨県');
assert.equal(await page.locator('#facilityRows tr').count(),4);
assert.equal(await page.locator('#associationRows tr').count(),11);
await page.locator('#prefFilter').selectOption('all');
const details=page.locator('details#associations');
await details.locator('summary').click();assert(await details.evaluate(e=>e.open),'association accordion opens');
const shown=await page.locator('#associationRows tr').first().textContent();
assert(shown.includes('医師会'),'association rows visible');
await details.locator('summary').click();assert(!(await details.evaluate(e=>e.open)),'association accordion closes');
assert.equal(errors.length,0,'Javascript runtime errors: '+errors.join(' / '));
await page.evaluate(()=>window.scrollTo({top:0,left:0,behavior:'instant'}));
await page.screenshot({path:path.join(screenshots,'koshinetsu-'+width+'.png'),fullPage:true,animations:'disabled'});
await page.close();
}
console.log('KOSHINETSU UI QA PASS: 375 / 768 / 1440 (external libraries blocked to test fallbacks)');
}finally{await browser.close()}
