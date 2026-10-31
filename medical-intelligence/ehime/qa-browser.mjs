
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const here=path.dirname(fileURLToPath(import.meta.url));
const pageUrl=new URL('./index.html',import.meta.url).href;
const reports=path.join(here,'qa-screenshots');
fs.mkdirSync(reports,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const results=[];
try{
  for(const width of [375,768,1440]){
    const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    // Test worst-case offline dependency failure. Local HTML/CSS/JS must still work.
    await page.route(/^https?:/,route=>route.abort());
    await page.goto(pageUrl,{waitUntil:'load'});
    await page.waitForTimeout(250);
    const metrics=await page.evaluate(()=>{
      const d=document.documentElement;
      return {
        overflow:d.scrollWidth-window.innerWidth,
        sources:document.querySelectorAll('#sourceList li').length,
        localMarket:!!document.querySelector('#local-market'),
        dealerMarket:!!document.querySelector('#dealer-share'),
        subsidyCards:document.querySelectorAll('#subsidies .fund-card').length,
        subsidyMapFallback:!!document.querySelector('#subsidyMap .subsidy-map-fallback'),
        marketBarCharts:document.querySelectorAll('.market-static-chart').length,
        regionRows:document.querySelectorAll('#regionTable tbody tr').length,
        facilities:document.querySelectorAll('#facilityTable tbody tr').length,
        fallbacks:[...document.querySelectorAll('.chart-fallback')].filter(x=>getComputedStyle(x).display!=='none').length,
        mapFallback:!!document.querySelector('.map-fallback'),
        navMinHeight:Math.round(document.querySelector('.toc a').getBoundingClientRect().height),
        bodySize:getComputedStyle(document.body).fontSize,
        rootSizes:[document.documentElement,document.body,document.querySelector('main'),document.querySelector('.toc'),document.querySelector('#sources')].filter(Boolean).map(x=>({tag:x.tagName,id:x.id,scrollWidth:x.scrollWidth,clientWidth:x.clientWidth,width:Math.round(x.getBoundingClientRect().width),right:Math.round(x.getBoundingClientRect().right)})),
        uncontained:[...document.body.querySelectorAll('*')].filter(x=>{
          let r=x.getBoundingClientRect();
          if(r.right<=window.innerWidth+2||r.width===0)return false;
          let p=x.parentElement;
          while(p&&p!==document.body){
            const pr=p.getBoundingClientRect(),ov=getComputedStyle(p).overflowX;
            if(/^(auto|scroll|hidden|clip)$/.test(ov)&&r.right>pr.right+1)return false;
            p=p.parentElement;
          }
          return true;
        }).slice(0,40).map(x=>({tag:x.tagName,id:x.id,cls:typeof x.className==='string'?x.className.slice(0,40):'',left:Math.round(x.getBoundingClientRect().left),right:Math.round(x.getBoundingClientRect().right),text:x.textContent.trim().slice(0,55)})),
        offenders:[...document.body.querySelectorAll('*')].map(x=>{
          const r=x.getBoundingClientRect();
          return {tag:x.tagName,id:x.id,cls:typeof x.className==='string'?x.className.slice(0,55):'',right:Math.round(r.right),left:Math.round(r.left),width:Math.round(r.width),scrollWidth:x.scrollWidth,clientWidth:x.clientWidth};
        }).filter(x=>x.right>window.innerWidth+2 && x.width>0).slice(0,18)
      };
    });
    console.log('Viewport diagnostics:',width,JSON.stringify(metrics));
    assert(metrics.overflow<=1,'Horizontal viewport overflow at '+width+': '+metrics.overflow+'px');
    assert.equal(metrics.sources,33,'33 citation entries visible');
    assert(metrics.localMarket&&metrics.dealerMarket,'New market sections missing');
    assert.equal(metrics.subsidyCards,7,'Seven policy cards visible');
    assert(metrics.subsidyMapFallback,'Offline region map links missing');
    assert.equal(metrics.marketBarCharts,2,'Two historical market chart fallbacks missing');
    assert.equal(metrics.regionRows,6,'6 region table rows');
    assert.equal(metrics.facilities,17,'17 facility rows');
    assert.equal(metrics.fallbacks,4,'4 static SVG charts available');
    assert(metrics.mapFallback,'Map fallback present');
    assert(metrics.navMinHeight>=44,'Accessible nav tap target');
    assert.equal(errors.length,0,'Browser JavaScript runtime errors: '+errors.join('; '));

    await page.locator('#facilitySearch').fill('愛媛大学');
    assert.equal(await page.locator('#facilityTable tbody tr:visible').count(),1,'Clinic search not working');
    await page.locator('#facilitySearch').fill('該当しない固有文字列98765');
    assert.equal(await page.locator('#facilityTable tbody tr:visible').count(),0,'No-hit search failed');
    assert(await page.locator('#facilityEmpty').isVisible(),'No-hit feedback missing');
    await page.locator('#clearFacilitySearch').click();
    assert.equal(await page.locator('#facilityTable tbody tr:visible').count(),17,'Clear search failed');
    await page.screenshot({path:path.join(reports,'ehime-'+width+'.png'),animations:'disabled'});
    results.push({width,...metrics,search:'PASS',runtimeErrors:0});
    await page.close();
  }
  console.log(JSON.stringify({result:'PASS',mode:'offline CDN failure',results},null,2));
}finally{await browser.close()}
