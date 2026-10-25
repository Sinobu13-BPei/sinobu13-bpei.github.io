import { chromium } from "playwright";
const origin="http://127.0.0.1:8098/medical-intelligence/shiga/";
const browser=await chromium.launch({headless:true});
let failures=[],results=[];
for(const [width,height] of [[375,812],[390,844],[768,1024],[1440,900]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const consoleError=[];page.on("pageerror",e=>consoleError.push(e.message));
 const response=await page.goto(origin,{waitUntil:"domcontentloaded",timeout:30000});
 try{
 await page.waitForFunction(()=>document.querySelector("#loadstate")?.textContent?.includes("読み込みました"),{timeout:18000});
 const links=await page.locator("#regionTabs button").count();
 const diseases=await page.locator("#designationTable tbody tr").count();
 const doctors=await page.locator("#physiciansTable tbody tr").count();
 const beds=await page.locator("#bedPlanTable tbody tr").count();
 const hospital=await page.locator("#hospitalItems .dir-card").count();
 const charts=await page.locator(".chart-box canvas").count();
 const before=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,viewport:window.innerWidth,overflow:document.documentElement.scrollWidth>window.innerWidth+2}));
 await page.locator("#regionTabs button[data-area='甲賀']").click();
 const tab=await page.locator("#regionDetails h3").innerText();
 await page.locator("#hospitalSearch").fill("長浜");
 const visibleHospitals=await page.locator("#hospitalItems .dir-card:visible").count();
 await page.locator("#officeSearch").fill("甲賀");
 const offices=await page.locator("#officeItems .dir-card:visible").count();
 const mapLib=await page.locator(".leaflet-container").count();
 const canvasDrawn=await page.evaluate(()=>[...document.querySelectorAll('.chart-box canvas')].filter(c=>c.getContext('2d')&&c.width>0&&c.height>0).length);
 if(!response?.ok()||links!==7||diseases!==4||doctors!==7||beds!==7||hospital!==23||charts!==8||before.overflow||!tab.includes("甲賀")||visibleHospitals<1||visibleHospitals>=23||offices<1||mapLib!==1||consoleError.length)failures.push({width,response:response?.status(),links,diseases,doctors,beds,hospital,charts,overflow:before,tab,visibleHospitals,offices,mapLib,consoleError});
 results.push({width,response:response.status(),links,diseases,doctors,beds,hospital,charts,overflow:before.overflow,visibleHospitals,offices,mapLib,canvasDrawn,pageErrors:consoleError});
 }catch(e){failures.push({width,error:String(e),consoleError});}
 await page.close();
}
await browser.close();
console.log(JSON.stringify({results,failures},null,2));
if(failures.length)process.exitCode=1;