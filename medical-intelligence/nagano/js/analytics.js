"use strict";
document.addEventListener("DOMContentLoaded",async function(){
const pick=(id)=>document.getElementById(id);
let a,b;
try{const rs=await Promise.all([fetch("./data/areas.json"),fetch("./data/benchmarks.json")]);if(rs.some(r=>!r.ok))throw Error("fetch failed");a=await rs[0].json();b=await rs[1].json();}catch(e){console.warn("公開JSONを取得できません。静的情報をご参照ください。",e);return;}
if(typeof Chart==="undefined"){console.warn("Chart.js unavailable");return;}
Chart.defaults.font.family='"Meiryo UI",Meiryo,sans-serif';Chart.defaults.font.size=11;Chart.defaults.color="#536680";
const colors=["#4f91c6","#f0a965","#46a89f","#9e82c2"];
function chart(id,type,labels,datasets,opts={}){
const c=pick(id);if(!c)return;
return new Chart(c,{type,data:{labels,datasets},options:Object.assign({responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"},tooltip:{enabled:true}},scales:{y:{beginAtZero:true}}},opts)});
}
const functionTypes=["高度急性期","急性期","回復期","慢性期"];
chart("bedActualChart","bar",functionTypes,[{label:"2025年度報告病床（床）",data:[1865,8942,3519,3445],backgroundColor:colors}],{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}});
chart("bedNeedChart","bar",functionTypes,[{label:"必要病床数推計（床）",data:[1907,6551,5121,3260],backgroundColor:colors}],{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}});
chart("deviceBenchChart","bar",b.devicesHistorical.map(r=>r.name),[{label:"長野県（当時）",data:b.devicesHistorical.map(r=>r.nagano),backgroundColor:"#2475a6"},{label:"全国（当時）",data:b.devicesHistorical.map(r=>r.national),backgroundColor:"#efa85d"}],{indexAxis:"y",responsive:true,maintainAspectRatio:false});
chart("doctorIndexChart","bar",b.physicianMaldistribution2026.map(r=>r[0]),[{label:"医師偏在指標（2026年）",data:b.physicianMaldistribution2026.map(r=>r[1]),backgroundColor:b.physicianMaldistribution2026.map(r=>r[0]==="長野"?"#da5354":"#5687b6")}],{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}});
const areas=a.areas;
const scales=[
areas.map(x=>x.pop2026),
areas.map(x=>x.age65Pct2026),
areas.map(x=>x.physicianMaldistributionIndex2026),
areas.map(x=>x.hospital2026)
];
function norm(value,arr,invert=false){let lo=Math.min(...arr),hi=Math.max(...arr);let z=hi===lo?3:1+4*(value-lo)/(hi-lo);return invert?6-z:z;}
const rankings=areas.map(x=>{
const score=25*norm(x.pop2026,scales[0])/5+20*norm(x.age65Pct2026,scales[1])/5+20*norm(x.physicianMaldistributionIndex2026,scales[2],true)/5+20*norm(x.hospital2026,scales[3])/5+15*x.geoAccessJudgement1to5/5;
return{name:x.name,score:+score.toFixed(1)}}).sort((a,b)=>b.score-a.score);
chart("priorityChart","bar",rankings.map(x=>x.name),[{label:"分析優先度（100点換算）",data:rankings.map(x=>x.score),backgroundColor:rankings.map((x,i)=>i<3?"#d95453":i<6?"#dcac61":"#407caa")}],{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,max:100}}});
});
