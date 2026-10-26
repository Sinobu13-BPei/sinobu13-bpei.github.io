/* Oita: JMAP medical facility and medical association geographic context | 2026-10-27 */
"use strict";
(()=>{
const $=s=>document.querySelector(s);
const n=v=>Number(v||0).toLocaleString("ja-JP");
const safe=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const href=(url,title)=>{try{const u=new URL(url);if(!["https:","http:"].includes(u.protocol))return safe(title);return '<a href="'+safe(u.href)+'" target="_blank" rel="noopener noreferrer">'+safe(title)+'</a>'}catch{return safe(title)}};
const areaNames={center:"中部",east:"東部",north:"北部",west:"西部",south:"南部",hohi:"豊肥"};
const count=(arr,key)=>arr.reduce((s,x)=>s+Number(x[key]||0),0);
const fmtOrDash=v=>v===null||v===undefined?"—":n(v);
const numberCell=(v)=>'<td class="fac-num">'+fmtOrDash(v)+'</td>';
function render(d){
 if(!d||!Array.isArray(d.areas)||d.areas.length!==6||!Array.isArray(d.physicianAssociations))throw new Error("facility data incomplete");
 const areas=d.areas;
 const K=areas.map(a=>a.facilityCounts);
 const categories=[["clinics","一般診療所","施設"],["hospitals","病院","施設"],["dental","歯科診療所","施設"],["pharmacies","薬局","施設"],["homeCareClinics","在宅療養支援診療所","施設（内数）"]];
 const kpi=$("#facilityKpis");
 if(kpi)kpi.innerHTML=categories.map(([key,label,unit])=>'<article class="facility-kpi"><span>'+safe(label)+'</span><b>'+n(count(K,key))+'</b><small>'+safe(unit)+'</small></article>').join("");
 const areaTable=$("#medicalAreaFacilityTable");
 const cls=a=>a.facilityCounts;
 if(areaTable){
   areaTable.querySelector("tbody").innerHTML=areas.map(a=>{
     const x=cls(a);const rate=(x.clinics/x.population2020*100000).toFixed(1);
     return '<tr><th scope="row">'+safe(a.name)+'</th>'+numberCell(x.clinics)+numberCell(x.hospitals)+numberCell(x.dental)+numberCell(x.pharmacies)+numberCell(x.homeCareClinics)+'<td class="fac-num">'+rate+'</td><td>'+href(x.source,"JMAP原典")+'</td></tr>';
   }).join("");
   const popTotal=areas.reduce((s,a)=>s+a.facilityCounts.population2020,0);
   areaTable.querySelector("tfoot").innerHTML='<tr><th scope="row">県内6医療圏合計</th>'+["clinics","hospitals","dental","pharmacies","homeCareClinics"].map(key=>numberCell(count(K,key))).join("")+'<td class="fac-num">'+(count(K,"clinics")/popTotal*100000).toFixed(1)+'</td><td>人口：2020国勢調査</td></tr>';
 }
 function renderMunicipalities(){
   const selected=$("#facilityAreaFilter")?.value||"all";
   const items=d.municipalFacilities.filter(c=>selected==="all"||c.area===selected);
   const tb=$("#municipalityFacilityTable tbody");
   if(tb)tb.innerHTML=items.map(c=>'<tr><th scope="row">'+safe(c.name)+'</th><td>'+safe(areaNames[c.area]||c.area)+'</td>'+numberCell(c.clinics)+numberCell(c.hospitals)+numberCell(c.dental)+'<td>'+href(c.source,"JMAP市町村")+'</td></tr>').join("")+
   '<tr class="fac-subtotal"><th scope="row">表示中の合計</th><td>'+items.length+'市町村</td>'+numberCell(count(items,"clinics"))+numberCell(count(items,"hospitals"))+numberCell(count(items,"dental"))+'<td>所在施設・参考値</td></tr>';
   const status=$("#facilityCountStatus");if(status)status.textContent=items.length+"市町村を表示";
 }
 $("#facilityAreaFilter")?.addEventListener("change",renderMunicipalities);
 renderMunicipalities();
 function renderAssociations(){
   const filter=$("#associationAreaFilter")?.value||"all";
   const items=d.physicianAssociations.filter(a=>filter==="all"||a.area===filter);
   const tb=$("#associationFacilityTable tbody");
   if(tb){
     tb.innerHTML=items.map(a=>{
       const refs=a.localFacilityReference;const cities=a.municipalities.length?a.municipalities.join("・"):"地域対応なし";
       const duplicate=a.municipalities.length===1&&a.municipalities[0]==="大分市";
       const info=duplicate?"<small class='fac-caution'>大分市全域の参考値／医師会別ではない</small>":a.municipalities.length===0?"<small class='fac-caution'>算出対象なし</small>":"<small class='fac-note-mini'>地域所在の参考値</small>";
       const sourceLinks=a.municipalities.map(m=>d.municipalFacilities.find(c=>c.name===m)).filter(Boolean);
       const official=href(a.associationUrl,"医師会情報");const source=sourceLinks.length?'<span class="assoc-source-links">'+sourceLinks.map(c=>href(c.source,c.name+"JMAP")).join("・")+'</span>':"—";
       return '<tr><th scope="row">'+safe(a.name)+'</th><td>'+safe(cities)+'<small class="fac-note-mini">'+safe(areaNames[a.area]||a.area)+'</small></td><td class="fac-num">'+fmtOrDash(refs.clinics)+info+'</td>'+numberCell(refs.hospitals)+numberCell(refs.dental)+'<td class="fac-status">未照合<span>会員診療所数ではありません</span></td><td>'+official+'<br>'+source+'</td></tr>';
     }).join("");
   }
   const status=$("#associationCountStatus");if(status)status.textContent=items.length+"医師会を表示（施設数は地域参考値）";
 }
 $("#associationAreaFilter")?.addEventListener("change",renderAssociations);
 renderAssociations();
 if(window.Chart){
  const title=(text)=>({display:true,text,color:"#3c5d6f",font:{size:11}});
  const opts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>n(c.parsed.x)+"施設"}}},indexAxis:"y",scales:{x:{beginAtZero:true,title:title("JMAP掲載施設数")},y:{grid:{display:false}}}};
  try{
   const c1=$("#facilityClinicChart");
   if(c1)new Chart(c1,{type:"bar",data:{labels:areas.map(a=>a.name),datasets:[{label:"一般診療所",data:areas.map(a=>a.facilityCounts.clinics),backgroundColor:areas.map(a=>a.name==="中部"?"#087b91":"#69b3bf"),borderRadius:5,barThickness:19}]},options:opts});
   const c2=$("#facilityMixChart");
   if(c2)new Chart(c2,{type:"bar",data:{labels:areas.map(a=>a.name),datasets:[["clinics","一般診療所","#087b91"],["hospitals","病院","#e6aa5e"],["dental","歯科","#52a49e"],["pharmacies","薬局","#95aac3"]].map(([key,label,color])=>({label,data:areas.map(a=>a.facilityCounts[key]),backgroundColor:color,barThickness:17}))},options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{usePointStyle:true,font:{size:11}}},tooltip:{callbacks:{label:c=>c.dataset.label+" "+n(c.parsed.x)+"施設"}}},scales:{x:{stacked:true,beginAtZero:true},y:{stacked:true,grid:{display:false}}}}});
  }catch(e){console.warn("Facility charts unavailable",e)}
 }else document.querySelectorAll(".fac-chart").forEach(x=>{const p=document.createElement("p");p.className="fac-note";p.textContent="Chart.jsの読み込みに失敗しました。数値は直下の表に記載しています。";x.append(p)});
}
fetch("./data/data.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(render).catch(e=>{console.error("Facility data fetch error",e);const root=$("#facilityKpis");if(root)root.textContent="施設数データを読み込めませんでした。出典JMAPをご参照ください。";});
})();