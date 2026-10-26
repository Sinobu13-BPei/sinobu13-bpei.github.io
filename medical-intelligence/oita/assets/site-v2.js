/* Unified data bootstrap: one network request, shared across all four proven modules. */
window.__oitaDataPromise=fetch("./data/data.json",{cache:"no-cache"}).then(res=>{if(!res.ok)throw new Error("Oita data HTTP "+res.status);return res.json();});
window.__oitaDataFetch=()=>window.__oitaDataPromise.then(data=>({ok:true,json:()=>Promise.resolve(data)}));

/* START js/app.js */
"use strict";
const $=(s)=>document.querySelector(s), fmt=n=>Number(n).toLocaleString("ja-JP");
const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ext=(u,label)=>'<a target="_blank" rel="noopener noreferrer" href="'+encodeURI(u).replace(/"/g,"%22")+'">'+safe(label)+'</a>';
function mapUrls(x){const search="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(x.name+" "+x.address);const gsi="https://maps.gsi.go.jp/#14/"+x.lat+"/"+x.lon+"/";return '<div class="maplinks">'+ext(search,"Googleマップ")+ext(gsi,"地理院地図")+ext(x.url,"公式情報")+'</div>';}
function getScore(a,d){return a.score.reduce((t,v,i)=>t+(v/5)*d.scores.weights[i],0);}
function render(d){
const weights=d.scores.weights;
$("#areaTable tbody").innerHTML=d.areas.map(a=>'<tr><td><b>'+safe(a.name)+'</b><small style="display:block">'+safe(a.cities)+'</small></td><td>'+safe(a.populationContext)+'</td><td>'+safe(a.challenge)+'</td><td>'+safe(a.opportunity)+'</td><td>'+safe(a.focus)+'</td><td><span class="score-pill">'+getScore(a,d).toFixed(0)+'/100</span><small style="display:block">独自仮説</small></td></tr>').join("");
$("#bedsTable tbody").innerHTML=d.areas.map(a=>'<tr><td>'+safe(a.name)+'</td>'+a.beds.map(n=>'<td>'+fmt(n)+'</td>').join('')+'<td><b>'+fmt(a.beds.reduce((x,y)=>x+y,0))+'</b></td><td>'+fmt(a.needed.reduce((x,y)=>x+y,0))+'</td></tr>').join('')+'<tr><td><b>県合計</b></td>'+["high","acute","recovery","chronic","inactive"].map(k=>'<td><b>'+fmt(d.beds2025[k])+'</b></td>').join('')+'<td><b>'+fmt(d.beds2025.total)+'</b></td><td><b>'+fmt(d.needed.total)+'</b></td></tr>';
$("#facilityTable tbody").innerHTML=d.facilities.map(x=>'<tr><td><b>'+safe(x.name)+'</b></td><td>'+safe(x.kind)+'<br><small>'+safe(x.area)+'</small></td><td>'+safe(x.address)+'</td><td>'+mapUrls(x)+'</td></tr>').join("");
/* Retired legacy 9-link associations list: detailed 17-association table is the canonical view. */
$("#sourcesList").innerHTML=d.sources.map(([id,title,year,url])=>'<div class="source"><span class="tag">['+safe(id)+']</span> '+ext(url,title)+'<small>データ年次：'+safe(year)+'</small></div>').join("");
$("#scoreFactors").innerHTML=d.scores.labels.map((name,i)=>'<p><b>'+safe(name)+'</b>　'+weights[i]+'%</p>').join("");
if(window.Chart){const font={family:"system-ui, sans-serif",size:11},opt={responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{font}}},scales:{y:{beginAtZero:true}}};let common=(ctx,type,data,options=opt)=>new Chart(ctx,{type,data,options});
common($("#populationChart"),"bar",{labels:["2020国勢調査","2025国勢速報","2026年9月推計","2030将来推計","2050将来推計"],datasets:[{label:"人口（千人）",data:[d.population.actual2020,d.population.censusPrelim2025,d.population.estimatedSep2026,d.population.projected2030,d.population.projected2050].map(x=>x/1000),backgroundColor:["#296987","#298591","#328b98","#daa457","#daa457"],borderRadius:5}]});
common($("#agingChart"),"bar",{labels:["2020","2050推計"],datasets:[{label:"大分県",data:[d.population.elderly2020,d.population.elderly2050],backgroundColor:"#157b8c"},{label:"全国",data:[d.population.nationalElderly2020,d.population.nationalElderly2050],backgroundColor:"#9bb9c5"}]},opt);
common($("#bedsChart"),"bar",{labels:d.areas.map(a=>a.name),datasets:["高度急性期","急性期","回復期","慢性期","休棟等"].map((label,k)=>({label,data:d.areas.map(a=>a.beds[k]),backgroundColor:["#174f79","#4c96b2","#24a39e","#eab66d","#a1aeba"][k]}))},{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{font}}},scales:{x:{stacked:true},y:{stacked:true,beginAtZero:true}}});
common($("#gapChart"),"bar",{labels:["高度急性期","急性期","回復期","慢性期"],datasets:[{label:"2025年必要量（推計）",data:[d.needed.high,d.needed.acute,d.needed.recovery,d.needed.chronic],backgroundColor:"#b4cbd8"},{label:"2025年7月報告",data:[d.beds2025.high,d.beds2025.acute,d.beds2025.recovery,d.beds2025.chronic],backgroundColor:"#137a91"}]},opt);
common($("#scoreChart"),"bar",{labels:d.areas.map(a=>a.name),datasets:[{label:"独自優先度スコア（100点）",data:d.areas.map(a=>getScore(a,d)),backgroundColor:"#168e98",borderRadius:5}]},{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,max:100}}});
}else{document.querySelectorAll(".chart").forEach(e=>e.insertAdjacentHTML("beforeend",'<p role="status">グラフ配信を読み込めません。数値は表にも掲載しています。</p>'));}
if(window.L){const map=L.map("map",{scrollWheelZoom:false}).setView([33.17,131.48],8);
L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",{attribution:'地理院タイル（国土地理院）',maxZoom:18}).addTo(map);
const groups=d.facilities.map(x=>{
const category=x.kind==="保健所"?"health":(x.kind==="行政"||x.kind==="医師会"?"government":"hospital");
const fill=category==="health"?"#ffda83":category==="government"?"#678fd6":"#5bbeb5";
const marker=L.circleMarker([x.lat,x.lon],{radius:category==="health"?5:7,color:"#0c647e",weight:2,fillColor:fill,fillOpacity:.9}).addTo(map).bindPopup("<b>"+safe(x.name)+"</b><br>"+safe(x.address)+"<br>"+mapUrls(x));
return {marker,category};
});
window.oitaMap=map; window.oitaMapGroups=groups;
document.querySelectorAll(".facility-toggle").forEach(el=>el.addEventListener("change",()=>{
const enabled=new Set(Array.from(document.querySelectorAll(".facility-toggle:checked")).map(x=>x.value));
groups.forEach(({marker,category})=>enabled.has(category)?marker.addTo(map):map.removeLayer(marker));
}));
document.querySelector("#fitMap")?.addEventListener("click",()=>map.setView([33.17,131.48],8));
setTimeout(()=>map.invalidateSize(),100);
}else{const el=$("#map");el.querySelector(".map-fallback").textContent="地図ライブラリが利用できません。施設一覧の地図リンクをご利用ください。";}
}
$("#menuToggle").addEventListener("click",()=>{const nav=$("#navigation");let open=nav.classList.toggle("open");$("#menuToggle").setAttribute("aria-expanded",String(open));});
$("#navigation").addEventListener("click",e=>{if(e.target.closest("a")){$("#navigation").classList.remove("open");$("#menuToggle").setAttribute("aria-expanded","false");}});
window.__oitaDataFetch().then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(render).catch(err=>{console.error("Data unavailable",err);const p=document.createElement("p");p.setAttribute("role","alert");p.textContent="地域別データが読み込めません。最新データは大分県公式ページと出典一覧をご利用ください。";$("#areaTable").before(p);});

/* END js/app.js */


/* START js/visuals.js */
/* Additional public-data visuals for Oita Medical Intelligence | 2026-10-27 */
"use strict";
(function(){
 const palette=["#245980","#4695b7","#2b9d95","#e0a85c","#b0b8c4"];
 const functions=["高度急性期","急性期","回復期","慢性期","休棟等"];
 const fmt=n=>Number(n).toLocaleString("ja-JP");
 function chart(selector,type,labels,datasets,opts={}){
   const el=document.querySelector(selector);
   if(!el||!window.Chart)return null;
   return new Chart(el,{type,data:{labels,datasets},options:{
     responsive:true,maintainAspectRatio:false,
     interaction:{mode:"nearest",intersect:false},
     plugins:{legend:{position:"bottom",labels:{color:"#355467",usePointStyle:true,pointStyle:"rectRounded",font:{size:11}}},tooltip:{callbacks:{label:opts.tooltip||((c)=>c.dataset.label+": "+fmt(c.parsed.y??c.parsed.x))}}},
     scales: opts.scales||{},indexAxis:opts.horizontal?"y":"x",
     ...opts.extra}});
 }
 function bars(d){
   const actual=d.beds2025;
   chart("#mixChart","doughnut",functions,[{label:"病床",data:[actual.high,actual.acute,actual.recovery,actual.chronic,actual.inactive],backgroundColor:palette,borderColor:"#ffffff",borderWidth:3,hoverOffset:7}],{extra:{cutout:"62%",plugins:{legend:{position:"bottom",labels:{usePointStyle:true,pointStyle:"circle",font:{size:10}}},tooltip:{callbacks:{label:c=>c.label+" "+fmt(c.parsed)+"床（"+(c.parsed/actual.total*100).toFixed(1)+"%）"}}}}});
   const regionNames=d.areas.map(a=>a.name);
   const total=d.beds2025.total;
   chart("#regionsChart","bar",regionNames,[{label:"県内病床比率",data:d.areas.map(a=>a.beds.reduce((x,y)=>x+y,0)/total*100),backgroundColor:d.areas.map((a,i)=>i===1?"#187e8c":"#75b3c0"),borderRadius:6,maxBarThickness:26}],{horizontal:true,tooltip:c=>c.label+" "+c.parsed.x.toFixed(1)+"%",scales:{x:{min:0,max:50,title:{display:true,text:"全県に占める割合（%）"},grid:{color:"#edf2f5"}},y:{grid:{display:false}}},extra:{plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.parsed.x.toFixed(1)+"%（"+fmt(d.areas[c.dataIndex].beds.reduce((x,y)=>x+y,0))+"床）"}}}}});
   chart("#capacityChart","bar",regionNames,[{label:"2025年現状に対する2026年予定の差（床）",data:d.areas.map(a=>a.bedsPlanned2026.reduce((x,y)=>x+y,0)-a.beds.reduce((x,y)=>x+y,0)),backgroundColor:"#bf8460",borderRadius:4,maxBarThickness:27}],{horizontal:true,scales:{x:{max:0,title:{display:true,text:"予定との差分（床）"},grid:{color:"#edf2f5"}},y:{grid:{display:false}}},extra:{plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>"2025年現状に対する2026年予定の差："+fmt(c.parsed.x)+"床（計画値）"}}}}});
   const neigh=d.neighbors;
   chart("#neighborsChart","bar",neigh.map(n=>n.name),[{label:"65歳以上割合（2050年推計）",data:neigh.map(n=>n.elderly2050),backgroundColor:neigh.map(n=>n.name==="大分県"?"#e4a65d":"#6aafba"),borderRadius:7,maxBarThickness:48}],{tooltip:c=>c.label+" "+c.parsed.y+"%",scales:{y:{min:0,max:50,title:{display:true,text:"65歳以上割合（%）"},grid:{color:"#ecf2f5"}},x:{grid:{display:false}}},extra:{plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.parsed.y.toFixed(1)+"%（社人研2050年推計）"}}}}});
   const sets=functions.map((label,k)=>({label,data:d.areas.map(a=>+(a.beds[k]/a.beds.reduce((x,y)=>x+y,0)*100).toFixed(3)),backgroundColor:palette[k],barPercentage:.78,categoryPercentage:.85}));
   chart("#regionMixChart","bar",regionNames,sets,{horizontal:true,scales:{x:{stacked:true,min:0,max:100,ticks:{callback:v=>v+"%"},grid:{color:"#e9f1f2"}},y:{stacked:true,grid:{display:false},ticks:{color:"#34566c"}}},extra:{plugins:{legend:{position:"bottom",labels:{font:{size:10},usePointStyle:true,pointStyle:"rectRounded"}},tooltip:{callbacks:{label:c=>c.dataset.label+" "+c.parsed.x.toFixed(1)+"%"}}}}});
 }
 function regions(d){
   const root=document.querySelector("#regionCards");if(!root)return;
   root.innerHTML="";
   const score=(a)=>a.score.reduce((sum,value,i)=>sum+value*d.scores.weights[i]/5,0);
   d.areas.forEach(a=>{
      const total=a.beds.reduce((x,y)=>x+y,0);
      const item=document.createElement("article");item.className="region-card";
      const head=document.createElement("div");head.className="region-card-head";
      const title=document.createElement("h4");title.textContent=a.name+"医療圏";
      const badge=document.createElement("span");badge.className="score-bubble";badge.textContent="独自評価 "+Math.round(score(a))+"/100";
      head.append(title,badge);item.append(head);
      const kpi=document.createElement("p");kpi.className="region-card-kpi";kpi.innerHTML="<strong>"+fmt(total)+"</strong> 床（2025年7月）";item.append(kpi);
      const sub=document.createElement("small");sub.textContent=a.cities;item.append(sub);
      if(a.facilityCounts){
       const f=document.createElement("div");f.className="region-facility";f.setAttribute("aria-label","JMAP掲載施設数、医療圏内の一般診療所、病院、歯科診療所");
       [["診療所",a.facilityCounts.clinics],["病院",a.facilityCounts.hospitals],["歯科",a.facilityCounts.dental]].forEach(([label,value])=>{
        const el=document.createElement("span");const caption=document.createTextNode(label);const bold=document.createElement("b");bold.textContent=fmt(value);el.append(caption,bold);f.append(el);
       });item.append(f);
      }
      const bar=document.createElement("div");bar.className="region-bar";bar.setAttribute("role","img");bar.setAttribute("aria-label",a.name+"医療圏の病床機能構成比。"+functions.map((f,i)=>f+" "+Math.round(a.beds[i]/total*100)+"%").join("、"));
      a.beds.forEach((n,i)=>{const seg=document.createElement("div");seg.style.background=palette[i];seg.style.width=(n/total*100)+"%";seg.title=functions[i]+" "+fmt(n)+"床";bar.appendChild(seg);});item.append(bar);
      const foot=document.createElement("div");foot.className="region-card-end";
      const text=document.createElement("span");text.textContent="急性期 "+(a.beds[1]/total*100).toFixed(1)+"%";
      const btn=document.createElement("button");btn.type="button";btn.textContent="詳細を見る";
      btn.setAttribute("aria-label",a.name+"医療圏の詳細表に移動");
      btn.addEventListener("click",()=>{
        document.querySelector("#areaTable")?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});
        const index=d.areas.findIndex(v=>v.id===a.id);
        const row=document.querySelectorAll("#areaTable tbody tr")[index];if(row){row.style.outline="3px solid #1899a5";row.style.outlineOffset="-3px";row.tabIndex=-1;row.focus({preventScroll:true});window.setTimeout(()=>{row.style.outline=""},2600);}
      });
      foot.append(text,btn);item.append(foot);root.append(item);
   });
 }
 function enhance(d){
   if(!d||!Array.isArray(d.areas)||d.areas.length!==6)return;
   regions(d);
   if(window.Chart){try{bars(d)}catch(e){console.warn("Extra charts unavailable",e);document.querySelectorAll(".viz-canvas").forEach(n=>{if(!n.querySelector("canvas"))return;const msg=document.createElement("p");msg.className="viz-source";msg.textContent="グラフ描画を確認できません。下の表に元データがあります。";n.append(msg)})}}
   else document.querySelectorAll(".viz-panel, .visual-strip").forEach(n=>{const p=document.createElement("p");p.className="viz-source";p.textContent="グラフ配信に接続できません。数値はデータ表をご確認ください。";n.append(p)});
 }
 window.__oitaDataFetch().then(r=>{if(!r.ok)throw Error("visual data HTTP "+r.status);return r.json()}).then(enhance).catch(err=>{console.warn("Oita visual module data error",err);const card=document.querySelector("#regionCards");if(card)card.textContent="医療圏別の可視化データが読み込めません。下の病床数一覧と出典をご参照ください。";});
})();

/* END js/visuals.js */


/* START js/facilities.js */
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
window.__oitaDataFetch().then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(render).catch(e=>{console.error("Facility data fetch error",e);const root=$("#facilityKpis");if(root)root.textContent="施設数データを読み込めませんでした。出典JMAPをご参照ください。";});
})();
/* END js/facilities.js */


/* START js/evidence.js */
/* Oita public-demographics (IPSS 2023 / 2020 Census) and healthcare workforce, derived from supplied market analysis + source PDFs */
"use strict";
(()=> {
  const $=(s)=>document.querySelector(s);
  const fmt=(x)=>Number(x).toLocaleString("ja-JP");
  const F=(x)=>Number(x).toFixed(1);
  const color=["#0c6b85","#d6aa69","#159e9b","#709bb5","#9bbdc5","#2f718b"];
  function render(d){
    if(!d?.areas?.every(a=>a.demographicForecast&&a.workforcePer100k))throw Error("regional forecasts not present");
    const a=d.areas;
    const order=["center","east","north","west","south","hohi"].map(id=>a.find(x=>x.id===id)).filter(Boolean);
    const fmtDelta=n=>(n>0?"+":"")+F(n)+"%";
    const table=$("#regionEvidenceTable tbody");
    if(table) {
      table.innerHTML=order.map(x=>{
        const z=x.demographicForecast,w=x.workforcePer100k;
        const cls=(v)=>v>=0?"positive":"negative";
        return '<tr><td>'+x.name+'</td><td>'+fmt(z.p2020)+'</td><td>'+fmt(z.p2050)+'</td><td class="'+cls(z.populationChangePct)+'">'+fmtDelta(z.populationChangePct)+'</td><td>'+F(z.age2050)+'%</td><td class="'+cls(z.workingChange)+'">'+fmtDelta(z.workingChange)+'</td><td class="'+cls(z.elder75Change)+'">'+fmtDelta(z.elder75Change)+'</td><td>'+F(w.physicians)+'</td><td>'+F(w.rehab)+'</td></tr>';
      }).join("");
    }
    if(!window.Chart){
      document.querySelectorAll(".evidence-plot").forEach(node=>{const p=document.createElement("p");p.className="evidence-source";p.textContent="グラフ配信が読み込めません。直下の数値表をご参照ください。";node.append(p)});return;
    }
    const legend={position:"bottom",labels:{usePointStyle:true,pointStyle:"rectRounded",font:{size:11},color:"#365a6a"}};
    const grid={color:"#edf2f5"};
    const make=(id,type,sets,options)=>{
      const el=$("#"+id);
      if(el)new Chart(el,{type,data:{labels:order.map(x=>x.name),datasets:sets},options:{responsive:true,maintainAspectRatio:false,indexAxis:"y",plugins:{legend},...options}});
    };
    const bgA="#2b809b",bgB="#e2aa65";
    make("forecastPopulationChart","bar",[
      {label:"2020年 国勢調査",data:order.map(x=>x.demographicForecast.p2020/1000),backgroundColor:bgA,borderRadius:3,maxBarThickness:18},
      {label:"2050年 社人研推計",data:order.map(x=>x.demographicForecast.p2050/1000),backgroundColor:bgB,borderRadius:3,maxBarThickness:18}
    ],{scales:{x:{beginAtZero:true,grid,title:{display:true,text:"人口（千人）"}},y:{grid:{display:false}}},
      plugins:{legend,tooltip:{callbacks:{label:c=>c.dataset.label+": "+fmt(Math.round(c.parsed.x*1000))+"人"}}}});
    make("forecastElderlyChart","bar",[
      {label:"2020年 実績",data:order.map(x=>+F(x.demographicForecast.age2020)),backgroundColor:bgA,borderRadius:3,maxBarThickness:19},
      {label:"2050年 推計",data:order.map(x=>+F(x.demographicForecast.age2050)),backgroundColor:bgB,borderRadius:3,maxBarThickness:19}
    ],{scales:{x:{min:0,max:60,grid,title:{display:true,text:"65歳以上の人口比率（%）"}},y:{grid:{display:false}}},
      plugins:{legend,tooltip:{callbacks:{label:c=>c.dataset.label+": "+F(c.parsed.x)+"%"}}}});
    make("forecastAgeShiftChart","bar",[
      {label:"15～64歳人口",data:order.map(x=>+F(x.demographicForecast.workingChange)),backgroundColor:"#277f9a",borderRadius:3,maxBarThickness:20},
      {label:"75歳以上人口",data:order.map(x=>+F(x.demographicForecast.elder75Change)),backgroundColor:"#d79a59",borderRadius:3,maxBarThickness:20}
    ],{scales:{x:{min:-70,max:50,grid,title:{display:true,text:"2020年比変化率（%）"}},y:{grid:{display:false}}},
      plugins:{legend,tooltip:{callbacks:{label:c=>c.dataset.label+": "+fmtDelta(c.parsed.x)}}}});
    make("workforceStructureChart","bar",[
      {label:"医師",data:order.map(x=>+F(x.workforcePer100k.physicians)),backgroundColor:"#277f9a",borderRadius:3,maxBarThickness:18},
      {label:"PT/OT/ST合計",data:order.map(x=>+F(x.workforcePer100k.rehab)),backgroundColor:"#5cb4a0",borderRadius:3,maxBarThickness:18}
    ],{scales:{x:{min:0,grid,title:{display:true,text:"人口10万人当たり人数（公表統計の再集計・参考）"}},y:{grid:{display:false}}},
      plugins:{legend,tooltip:{callbacks:{label:c=>c.dataset.label+": "+F(c.parsed.x)+"人／10万人"}}}});
  }
  window.__oitaDataFetch().then(r=>{if(!r.ok)throw Error("data HTTP "+r.status);return r.json()}).then(render)
  .catch(e=>{console.error("Oita evidence charts unavailable",e);const t=$("#regionEvidenceTable tbody");if(t)t.innerHTML='<tr><td colspan="9">追加調査データを読み込めません。社人研の原典へのリンクをご確認ください。</td></tr>'});
})();
/* END js/evidence.js */

/* Oita Rev2: UI enhancement, mobile chart navigation, data sources, accessible tables */
(function(){
 "use strict";
 const mobile=window.matchMedia("(max-width: 760px)");
 const items=[
   {selector:"#visual-dashboard .viz-grid",labels:["機能別病床","医療圏の病床","病床数の変化","近隣県・高齢化"]},
   {selector:"#population .charts",labels:["県人口の推移","高齢化率"]},
   {selector:"#future-regions .evidence-plots",labels:["将来人口","高齢化","年齢構造","医療人材"]},
   {selector:"#facilities .fac-charts",labels:["診療所数","医療施設の構成"]},
   {selector:"#care .charts",labels:["病床構成","必要量との比較"]}
 ];
 const galleries=[];
 items.forEach((def,g)=>{
  const grid=document.querySelector(def.selector);
  if(!grid)return;
  const panels=Array.from(grid.children).filter(el=>el.matches(".viz-panel,.panel,.evidence-plot,.fac-chart"));
  if(panels.length<2)return;
  grid.classList.add("is-compact-gallery");
  const tablist=document.createElement("div");tablist.className="gallery-tabs";tablist.setAttribute("role","tablist");
  tablist.setAttribute("aria-label",def.labels[0]+"などのグラフを切り替え");
  const tabs=panels.map((panel,i)=>{
    const id="oita-chart-"+g+"-"+i;panel.id=panel.id||id;panel.classList.add("gallery-panel");
    const t=document.createElement("button");t.type="button";t.className="gallery-tab";t.setAttribute("role","tab");
    t.setAttribute("aria-controls",panel.id);t.textContent=def.labels[i]||"グラフ "+(i+1);
    t.addEventListener("click",()=>activate(i,true));t.addEventListener("keydown",e=>{
     if(!["ArrowRight","ArrowLeft","Home","End"].includes(e.key))return;
     e.preventDefault();let nxt=e.key==="Home"?0:e.key==="End"?tabs.length-1:(i+(e.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length;
     activate(nxt,true);tabs[nxt].focus();
    });
    tablist.append(t);return t;
  });
  function activate(i,scroll){
    panels.forEach((p,j)=>p.classList.toggle("is-active",i===j));
    tabs.forEach((t,j)=>{t.setAttribute("aria-selected",String(i===j));t.tabIndex=i===j?0:-1});
    const current=panels[i];
    if(current&&window.Chart){
      current.querySelectorAll("canvas").forEach(cv=>{
        const chart=window.Chart.getChart?.(cv);
        if(chart)requestAnimationFrame(()=>{chart.resize();chart.update("none")});
      });
    }
    if(scroll&&mobile.matches&&current)current.scrollIntoView({block:"nearest",behavior:"auto"});
  }
  activate(0,false);grid.parentNode.insertBefore(tablist,grid);
  galleries.push({panels,tabs,activate});
 });
 function resizeCharts(){
   if(!window.Chart)return;
   if(!mobile.matches){document.querySelectorAll("canvas").forEach(cv=>{const c=Chart.getChart?.(cv);if(c)c.resize()})}
   else galleries.forEach(gr=>{const index=gr.tabs.findIndex(t=>t.getAttribute("aria-selected")==="true");gr.activate(Math.max(0,index),false)});
 }
 if(mobile.addEventListener)mobile.addEventListener("change",()=>requestAnimationFrame(resizeCharts));
 const nav=document.getElementById("navigation"),toggle=document.getElementById("menuToggle");
 if(nav&&toggle){
   const close=()=>{nav.classList.remove("open");toggle.setAttribute("aria-expanded","false")};
   document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
   document.addEventListener("click",e=>{if(!e.target.closest(".head-inner"))close()});
 }
 document.querySelectorAll(".table-wrap").forEach((wrap,i)=>{
   wrap.tabIndex=0;wrap.setAttribute("role","region");wrap.setAttribute("aria-label","表 "+(i+1)+"、横スクロール可能");
   const help=document.createElement("p");help.className="table-scroll-help";help.textContent="画面が狭い場合は、表を左右にスクロールして確認できます。";wrap.insertAdjacentElement("afterend",help);
 });
 const list=document.getElementById("sourcesList");
 if(list){
   const controls=document.createElement("div");controls.className="source-controls";
   const search=document.createElement("input");search.type="search";search.placeholder="出典番号・資料名・機関名で検索";search.setAttribute("aria-label","出典一覧を検索");
   const button=document.createElement("button");button.type="button";button.textContent="すべての出典を表示";
   const status=document.createElement("small");status.setAttribute("role","status");
   controls.append(search,button,status);list.insertAdjacentElement("beforebegin",controls);
   let allShown=false;let observed=false;
   function render(){
      const entries=Array.from(list.children).filter(el=>el.classList.contains("source"));
      if(!entries.length)return;
      const term=search.value.trim().toLocaleLowerCase("ja-JP");
      const matched=entries.filter(el=>el.textContent.toLocaleLowerCase("ja-JP").includes(term));
      entries.forEach(el=>{const idx=matched.indexOf(el);el.hidden=idx<0||(!term&&!allShown&&idx>=12)});
      status.textContent=term?matched.length+"件／"+entries.length+"件一致":(allShown?entries.length:Math.min(12,entries.length))+"件／"+entries.length+"件表示";
      button.hidden=!!term||entries.length<=12;
      button.textContent=allShown?"最初の12件のみ表示":"すべての出典を表示";
   }
   button.addEventListener("click",()=>{allShown=!allShown;render()});
   search.addEventListener("input",render);
   const ob=new MutationObserver(()=>{if(!observed&&list.children.length){observed=true;render();ob.disconnect()}});
   ob.observe(list,{childList:true});render();
 }
 const mq=window.matchMedia("(max-width: 760px)");
 if(mq.matches)window.addEventListener("load",()=>{window.setTimeout(resizeCharts,100)},{once:true});
})();
