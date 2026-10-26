/* Rev.5 UI enhancements · progressive enhancement; original data and charts preserved. */
(()=>{"use strict";
const $=id=>document.getElementById(id);
const format=n=>Number(n).toLocaleString("ja-JP");
const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dashboardCharts=[];
function fallback(id,rows){const n=$(id);if(!n)return;n.classList.add("show");n.innerHTML='<table><tbody>'+rows.map(r=>'<tr>'+r.map(v=>'<td>'+esc(v)+'</td>').join("")+'</tr>').join("")+'</tbody></table>'}
function chart(id,fallbackId,config,rows){const canvas=$(id);if(!canvas)return null;try{if(typeof Chart==="undefined")throw Error("Chart.js unavailable");const c=new Chart(canvas,config);dashboardCharts.push(c);return c}catch(e){canvas.style.display="none";fallback(fallbackId,rows);return null}}
function render(d){const a=d.areas,fa=d.facilityMarket?.regions2023||[],lookup=new Map(fa.map(v=>[v.name,v]));
const palette=["#146d86","#43a99b","#e2ab63","#778db8","#3d9ab5","#a57db0","#78aa93","#cc8d7e"];
const beds=d.beds.functions, names=["高度急性期","急性期","回復期","慢性期"];
chart("bedsDonutChart","bedsDonutFallback",{type:"doughnut",data:{labels:names,datasets:[{data:beds,backgroundColor:[palette[0],palette[1],palette[2],palette[3]],borderColor:"#fff",borderWidth:3,hoverOffset:4}]},options:{responsive:true,maintainAspectRatio:false,cutout:"66%",plugins:{legend:{position:"bottom",labels:{boxWidth:10,padding:10}},tooltip:{callbacks:{label:ctx=>ctx.label+"： "+format(ctx.parsed)+"床（"+(ctx.parsed/beds.reduce((x,y)=>x+y,0)*100).toFixed(1)+"%）"}}}}},names.map((n,i)=>[n,format(beds[i])]));
const regionNames=fa.map(x=>x.name);
chart("facilityMixChart","facilityMixFallback",{type:"bar",data:{labels:regionNames,datasets:[{label:"一般診療所",data:fa.map(x=>x.clinics),backgroundColor:palette[0],maxBarThickness:21},{label:"歯科診療所",data:fa.map(x=>x.dental),backgroundColor:palette[1],maxBarThickness:21},{label:"病院",data:fa.map(x=>x.hospitals),backgroundColor:palette[2],maxBarThickness:21}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:"y",scales:{x:{stacked:true},y:{stacked:true,ticks:{font:{size:11}}}},plugins:{legend:{position:"bottom",labels:{boxWidth:9,padding:9}}}}},fa.map(x=>[x.name,x.clinics,x.dental,x.hospitals]));
const scatterData=a.map(x=>({x:x.physician2026,y:lookup.get(x.name)?.clinics||0,r:6+Math.min(12,(lookup.get(x.name)?.clinics||0)/350),name:x.name,region:x.name}));
chart("areaBubbleChart","areaBubbleFallback",{type:"bubble",data:{datasets:[{label:"8医療圏（点の大きさ：診療所数）",data:scatterData,backgroundColor:scatterData.map((_,i)=>palette[i]+"bf"),borderColor:"#ffffff",borderWidth:1.3}]},options:{responsive:true,maintainAspectRatio:false,scales:{x:{title:{display:true,text:"医師偏在指標（2026年）"},ticks:{font:{size:10}}},y:{beginAtZero:true,title:{display:true,text:"一般診療所数（2023年）"},ticks:{font:{size:10}}}},plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>{const p=ctx.raw;return p.name+"：医師偏在 "+p.x+"／診療所 "+format(p.y)}}}}}},scatterData.map(x=>[x.name,x.x,x.y]));
// Open details when a filter is used, without hiding the controls or making empty space.
const assocRegion=$("assocRegion"),assocSearch=$("assocSearch"),details=$("associationDetails");
const autoOpen=()=>{if(details&&(assocRegion?.value||assocSearch?.value?.trim()))details.open=true};
assocRegion?.addEventListener("change",autoOpen);assocSearch?.addEventListener("input",autoOpen);
const safeDetails=new Set(["associationDetails","wardDetails","networkDetails"]);
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener("click",()=>{const id=a.getAttribute("href")?.slice(1);if(!id)return;const target=$(id);const box=target?.closest("details");if(box&&safeDetails.has(box.id))box.open=true}));
const rail=document.querySelector(".ui-rail");
if(rail&&typeof IntersectionObserver!=="undefined"){const anchors=[...rail.querySelectorAll('a[href^="#"]')];const sections=anchors.map(x=>$(x.getAttribute("href").slice(1))).filter(Boolean);let current="";const obs=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting)current=e.target.id}if(!current)return;for(const link of anchors){if(link.getAttribute("href")==="#"+current)link.setAttribute("aria-current","location");else link.removeAttribute("aria-current")}},{rootMargin:"-21% 0px -69% 0px",threshold:0});for(const s of sections)obs.observe(s)}
// Map popup supports the area filter, but the exact map region boundaries are intentionally not inferred.
const map=$("map");
map?.addEventListener("click",e=>{const control=e.target.closest('button[data-area]');if(!control)return;const selection=$("areaSelect"),name=control.getAttribute("data-area");if(!selection)return;selection.value=name;selection.dispatchEvent(new Event("change",{bubbles:true}));$("areaCards")?.scrollIntoView({behavior:window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"})});
// Accessibility: note that tables are horizontal on mobile; visible only once in page.
document.querySelectorAll(".scroll").forEach(box=>{if(box.querySelector("table")){box.setAttribute("role","region");box.setAttribute("aria-label",box.querySelector("caption")?.textContent?.trim()||"統計比較表");box.setAttribute("tabindex","0")}});
}
fetch("./data/data.json?v=20261027-r5",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(render).catch(err=>{const container=$("bedsDonutFallback");if(container){container.classList.add("show");container.textContent="可視化データを取得できません。元の出典表を参照してください。 "+err.message}});
})();