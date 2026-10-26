/* Kochi Medical Market: Visual dashboard – 2026-10-27
   All numeric inputs: KOCHI_DATA, prefectural 2022 bed-function report and 2025 plan targets.
   This script runs after data.js and app.js and never fetches protected data. */
(()=>{
"use strict";
const D=window.KOCHI_DATA;
if(!D||!D.areas||!D.areas.length)return;
const $=(q)=>document.querySelector(q);
const n=(v)=>Number(v).toLocaleString("ja-JP");
const colors=["#327ba5","#0a877d","#d99855","#71849f"];
const cById={aki:"#327ba5",chuo:"#0a877d",koban:"#d99855",hata:"#71849f"};
const areas=D.areas;
const central=areas.find(a=>a.id==="chuo");
const sum=(key)=>areas.reduce((t,a)=>t+Number(a[key]||0),0);
const pct=(v,total)=>total>0?(100*v/total):0;
const pct1=(v,total)=>pct(v,total).toFixed(1);
const populationTotal=sum("population2020");
const areaTotal=sum("areaKm2");
const limit=(a,b,c)=>Math.max(b,Math.min(c,a));
function make(id,html){const el=$(id);if(el)el.innerHTML=html}
function hEsc(v){return String(v).replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));}
function fallback(chartId,msg){const el=$(chartId);if(!el)return;const block=document.createElement("p");block.className="v-caption";block.textContent=msg||"グラフの読み込みに失敗しました。本文の表・説明をご利用ください。";el.replaceWith(block);}
const popSorted=[...areas].sort((a,b)=>b.population2020-a.population2020);
make("#visPopulationShare",popSorted.map(a=>{
 const p=pct1(a.population2020,populationTotal);
 return '<div class="v-shareline"><strong>'+hEsc(a.name)+'</strong><div class="v-track"><div class="v-fill" style="width:'+p+'%;background:'+cById[a.id]+'"></div></div><b>'+p+'%</b></div>'
}).join(""));
make("#visPopulationStack",popSorted.map(a=>{
 const p=pct1(a.population2020,populationTotal);
 const label=(Number(p)>12)?hEsc(a.name):"";
 return '<span title="'+hEsc(a.name)+': '+p+'%" style="width:'+p+'%;background:'+cById[a.id]+'">'+label+'</span>'
}).join(""));
make("#visPopulationLegend",popSorted.map(a=>'<span><i style="--legend-color:'+cById[a.id]+'"></i>'+hEsc(a.name)+' '+n(a.population2020)+'人</span>').join(""));
function bedFuncTotal(a){return a.high+a.acute+a.recovery+a.chronic;}
const bedTypes=[["high","高度急性期","#126e96"],["acute","急性期","#24958b"],["recovery","回復期","#e5a253"],["chronic","慢性期","#788aa1"]];
make("#vBedMix",areas.map(a=>{
 const total=bedFuncTotal(a);
 const bars=bedTypes.map(([k,label,color])=>'<span title="'+label+' '+n(a[k])+'床 ('+pct1(a[k],total)+'%)" style="width:'+pct(a[k],total)+'%;background:'+color+'"></span>').join("");
 return '<div class="v-bed-row"><b>'+hEsc(a.name)+'</b><div class="v-bed-bars" role="img" aria-label="'+hEsc(a.name)+'医療圏の4機能報告病床に占める構成比">'+bars+'</div><b>'+n(total)+'床</b></div>'
}).join(""));
function setMainShares(id,valueId,progressId){
 const total=sum(id),centralValue=central[id];
 const percentage=pct1(centralValue,total);
 const value=$(valueId),progress=$(progressId);
 if(value)value.innerHTML=percentage+'<small>% ／ '+n(centralValue)+'台</small>';
 if(progress)progress.style.width=percentage+'%';
}
setMainShares("ct","#vCtShare","#vCtProgress");
setMainShares("mri","#vMriShare","#vMriProgress");
const popData={
labels:areas.map(a=>a.name),
datasets:[
 {label:"医療圏の面積（km²）",data:areas.map(a=>a.areaKm2),backgroundColor:areas.map(a=>cById[a.id]),borderRadius:5,yAxisID:"y"},
 {type:"line",label:"人口密度（人/km²）",data:areas.map(a=>a.density2020),borderColor:"#d78b3e",backgroundColor:"#d78b3e",pointBackgroundColor:"#fff",pointBorderWidth:3,pointRadius:5,tension:0.2,yAxisID:"density"}
]};
const chartDefaults={
responsive:true,
maintainAspectRatio:false,
animation:{duration:250},
plugins:{legend:{position:"bottom",labels:{boxWidth:11,padding:10,font:{size:11}}},tooltip:{mode:"nearest",intersect:false}},
layout:{padding:5}
};
function addChart(id,type,chartData,extra={}){
 const canvas=$(id);if(!canvas)return;
 if(!window.Chart){fallback(id);return}
 try{
 new Chart(canvas,{type,data:chartData,options:{...chartDefaults,...extra}});
 }catch(err){fallback(id,"図表の描画に失敗しました。原資料・表をご参照ください。")}
}
addChart("#vAreaChart","bar",popData,{
 scales:{
  x:{ticks:{color:"#527181",font:{size:11}},grid:{display:false}},
  y:{position:"left",beginAtZero:true,title:{display:true,text:"面積 km²",color:"#537487"},ticks:{color:"#6b8091"},grid:{color:"#eaf0f1"}},
  density:{position:"right",beginAtZero:true,title:{display:true,text:"人口密度 人/km²",color:"#d78b3e"},grid:{drawOnChartArea:false},ticks:{color:"#ad773f"}}
 }
});
const actual=[1031,4491,2090,5172];
const target=[840,2860,3286,4266];
addChart("#vBedGapChart","bar",{
labels:["高度急性期","急性期","回復期","慢性期"],
datasets:[
 {label:"2022年報告",data:actual,backgroundColor:"#1a8881",borderRadius:3},
 {label:"2025年必要推計",data:target,backgroundColor:"#e1a269",borderRadius:3}
]},{
indexAxis:"y",
scales:{x:{beginAtZero:true,grid:{color:"#e8eff0"}},y:{grid:{display:false},ticks:{font:{size:11}}}},
plugins:{...chartDefaults.plugins,tooltip:{callbacks:{label:(ctx)=>ctx.dataset.label+": "+n(ctx.raw)+"床"}}}
});
const groups=[{label:"人口（2020年）",key:"population2020"},{label:"CT設置台数",key:"ct"},{label:"MRI設置台数",key:"mri"}];
addChart("#vDeviceShareChart","bar",{
 labels:groups.map(x=>x.label),
 datasets:areas.map(a=>({
  label:a.name,
  data:groups.map(g=>Number(pct(a[g.key],sum(g.key)).toFixed(2))),
  backgroundColor:cById[a.id],
  borderColor:"#fff",borderWidth:1
 }))
},{
 indexAxis:"y",
 scales:{x:{stacked:true,min:0,max:100,title:{display:true,text:"構成比 (%)"},ticks:{callback:v=>v+"%"}},y:{stacked:true,grid:{display:false}}},
 plugins:{...chartDefaults.plugins,tooltip:{callbacks:{label:(ctx)=>ctx.dataset.label+": "+ctx.raw.toFixed(1)+"%"}}}
});
addChart("#vBubbleChart","bubble",{
 datasets:areas.map(a=>({
  label:a.name,data:[{x:a.ct,y:a.mri,r:limit(Math.sqrt(a.population2020)/36,6,20)}],
  backgroundColor:cById[a.id]+"bb",borderColor:cById[a.id],borderWidth:2
 }))
},{
 scales:{
 x:{min:0,max:135,title:{display:true,text:"CT 設置台数（台）"}},
 y:{min:0,max:66,title:{display:true,text:"MRI 設置台数（台）"}}
 },
 plugins:{...chartDefaults.plugins,tooltip:{callbacks:{label:(ctx)=>ctx.dataset.label+"：CT "+ctx.raw.x+"台 / MRI "+ctx.raw.y+"台（円径は2020年人口規模）"}}}
});
/* Map overlays are optional: never interfere with the base GSI/Leaflet map on failure. */
function setupMapOverlays(){
 const tools=$("#vMapTools"),map=window.KOCHI_MAP;
 if(!tools)return;
 const buttons=[...tools.querySelectorAll("button[data-mode]")];
 if(!map||!window.L){
  tools.insertAdjacentHTML("beforeend",'<span class="v-map-state">地図操作を使用できません。施設一覧の地図リンクをご利用ください。</span>');
  buttons.forEach(b=>b.disabled=true);
  return;
 }
 const layer=L.layerGroup().addTo(map);
 const state=$("#vMapState");
 const setMode=(mode)=>{
  layer.clearLayers();
  buttons.forEach(btn=>btn.setAttribute("aria-pressed",String(btn.dataset.mode===mode)));
  if(mode==="none"){if(state)state.textContent="施設と地域の参考位置。地理院タイルを表示";return;}
  let total=sum(mode);
  for(const a of areas){
   const value=a[mode];
   const color=(mode==="ct"?"#115fa1":"#bd6532");
   const rad=6+Math.sqrt(value)*2.0;
   const circle=L.circleMarker([a.lat,a.lng],{radius:rad,color:"#fff",weight:2,fillColor:color,fillOpacity:.6,interactive:true});
   circle.bindPopup('<b>'+hEsc(a.name)+'医療圏</b><br>'+mode.toUpperCase()+'：'+n(value)+'台<br><small>第8期外来医療計画［S2］の医療圏総数。設置場所ではありません。</small>');
   circle.addTo(layer);
  }
  if(state)state.textContent=(mode==="ct"?"CT":"MRI")+"：県内計 "+n(total)+"台。円の大きさは医療圏別合計（実際の設置地点ではありません）";
 };
 buttons.forEach(btn=>btn.addEventListener("click",()=>setMode(btn.dataset.mode)));
 setMode("none");
}
setupMapOverlays();
})();