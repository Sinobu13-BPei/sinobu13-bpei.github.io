/* Fukuoka visual-atlas charts — official figures vs. editorial estimates clearly separated */
(()=>{"use strict";
const d=window.FUKUOKA_DATA;if(!d||!Array.isArray(d.regions))return;
const el=id=>document.getElementById(id);
const fmt=n=>Number(n).toLocaleString("ja-JP");
const sum=d.regions.reduce((s,r)=>s+r.beds[0],0);
const triple=["福岡・糸島","北九州","久留米"];
const three=d.regions.filter(r=>triple.includes(r.name)).reduce((s,r)=>s+r.beds[0],0);
const score=r=>Math.round(r.ratings.reduce((s,x,i)=>s+x/5*d.weights[i],0));
const P=["#246f9d","#35a0a0","#e4ae56","#8b88aa"];
const s=id=>el(id);
function writeStats(){
const k=s("viz-stat-triple");if(k)k.textContent=(three/sum*100).toFixed(1)+"%";
const t=s("viz-stat-beds");if(t)t.textContent=fmt(sum);
const p=s("viz-stat-gap");if(p){const vals=d.regions.map(r=>r.doctorIndex).filter(Number.isFinite);p.textContent=(Math.max(...vals)/Math.min(...vals)).toFixed(2)+"倍"}
const f=s("viz-stat-needs");if(f)f.textContent=fmt(d.bedNeed.total);
const src=s("viz-updated");if(src)src.textContent=d.meta.updated+" 更新";
}
function heatmap(){
const target=s("vizHeatmap");if(!target)return;
const axes=d.indicators;
let html='<caption class="viz-hidden-live">13医療圏ごとの独自定性評価：5指標の1から5点と加重スコア</caption><thead><tr><th scope="col">二次医療圏</th>';
axes.forEach((a,i)=>html+='<th scope="col">'+a+'<br><small>重み'+d.weights[i]+'%</small></th>');
html+='<th scope="col">総合 /100</th></tr></thead><tbody>';
for(const r of [...d.regions].sort((a,b)=>score(b)-score(a))){
html+='<tr><th scope="row">'+r.name+'</th>';
r.ratings.forEach((n,i)=>html+='<td data-score="'+n+'" title="'+r.name+' '+axes[i]+'：'+n+' /5">'+n+'</td>');
html+='<td title="独自推計"> '+score(r)+'</td></tr>';
}html+='</tbody>';target.innerHTML=html;
}
function legend(){const t=s("viz-chart-text");if(!t)return;
const min=[...d.regions].sort((a,b)=>a.doctorIndex-b.doctorIndex).at(0);
const max=[...d.regions].sort((a,b)=>b.doctorIndex-a.doctorIndex).at(0);
t.textContent='指標が最大の圏域 '+max.name+' '+max.doctorIndex+'、最小は '+min.name+' '+min.doctorIndex+'。医師数の直接の実数ではありません。';
}
function chartFallback(canvasId,text){const x=s(canvasId);if(x){x.style.display="none";const p=document.createElement("p");p.className="viz-warning";p.textContent=text;x.parentElement.appendChild(p)}}
function plot(){
const names=d.regions.map(r=>r.name);
if(!window.Chart){chartFallback("vizBeds13","2024年4機能計 "+fmt(sum)+"床。病床別の一覧は下の表で確認できます。");chartFallback("vizDoctor13","医師偏在指標は京築161.6～久留米417.7。");chartFallback("vizScatter","地域別の全数表で病床数と医師偏在指標を確認してください。");chartFallback("vizConcentration","3圏域が県内報告病床の"+(three/sum*100).toFixed(1)+"%を占めます。");chartFallback("vizScores","独自推計スコアはヒートマップの表で確認できます。");chartFallback("vizCityChange","2020→2025年人口：福岡市＋50,401人、北九州市－35,437人。");return}
const font={family:"Noto Sans JP, system-ui, sans-serif"};
const options={responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{font:{...font,size:10},boxWidth:13}},tooltip:{mode:"nearest",intersect:false}},scales:{x:{grid:{color:"#edf2f5"},ticks:{font:{...font,size:10}}},y:{grid:{display:false},ticks:{font:{...font,size:10}}}}};
const id=x=>s(x);
if(id("vizBeds13"))new Chart(id("vizBeds13"),{type:"bar",data:{labels:names,datasets:[{label:"高度急性期",data:d.regions.map(r=>r.beds[1]),backgroundColor:P[0]},{label:"急性期",data:d.regions.map(r=>r.beds[2]),backgroundColor:P[1]},{label:"回復期",data:d.regions.map(r=>r.beds[3]),backgroundColor:P[2]},{label:"慢性期",data:d.regions.map(r=>r.beds[4]),backgroundColor:P[3]}]},options:{...options,indexAxis:"y",scales:{x:{stacked:true,grid:{color:"#edf2f5"},ticks:{callback:v=>fmt(v),font:{size:9}}},y:{stacked:true,grid:{display:false},ticks:{font:{size:10}}}}}});
const ds=[...d.regions].sort((a,b)=>b.doctorIndex-a.doctorIndex);
if(id("vizDoctor13"))new Chart(id("vizDoctor13"),{type:"bar",data:{labels:ds.map(r=>r.name),datasets:[{label:"医師偏在指標（2026）",data:ds.map(r=>r.doctorIndex),backgroundColor:ds.map(r=>r.doctorIndex<200?"#ce8653":r.doctorIndex>350?"#2d8b9b":"#63a6b3"),borderRadius:5}]},options:{...options,indexAxis:"y",plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>"偏在指標："+c.raw.toFixed(1)}}},scales:{x:{beginAtZero:true,max:460,ticks:{font:{size:10}}},y:{grid:{display:false},ticks:{font:{size:10}}}}}});
const points=d.regions.map(r=>({x:r.doctorIndex,y:+((r.beds[3]+r.beds[4])/r.beds[0]*100).toFixed(1),r:5+Math.sqrt(r.beds[0])/17,name:r.name,beds:r.beds[0]}));
if(id("vizScatter"))new Chart(id("vizScatter"),{type:"bubble",data:{datasets:[{label:"13医療圏（円の大きさ＝病床規模）",data:points,backgroundColor:"#198c91ad",borderColor:"#0e6371",borderWidth:1.5}]},options:{...options,plugins:{legend:{display:false},tooltip:{callbacks:{title:arr=>arr[0]?.raw?.name||"",label:c=>"偏在指標 "+c.raw.x+" ｜回復＋慢性期 "+c.raw.y+"% ｜4機能病床 "+fmt(c.raw.beds)+"床"}}},scales:{x:{type:"linear",min:125,max:450,title:{display:true,text:"医師偏在指標（2026）",font:{size:11}},ticks:{font:{size:10}}},y:{min:20,max:85,title:{display:true,text:"回復期＋慢性期の病床割合（2024、％）",font:{size:10}},ticks:{callback:v=>v+"%"}}}}});
if(id("vizConcentration"))new Chart(id("vizConcentration"),{type:"doughnut",data:{labels:["福岡・糸島＋北九州＋久留米","その他10医療圏"],datasets:[{data:[three,sum-three],backgroundColor:["#146b83","#b3d9dc"],borderWidth:4,borderColor:"#fff"}]},options:{responsive:true,maintainAspectRatio:false,cutout:"68%",plugins:{legend:{position:"bottom"},tooltip:{callbacks:{label:c=>c.label+"："+fmt(c.raw)+"床（"+(c.raw/sum*100).toFixed(1)+"%）"}}}}});
const ranks=[...d.regions].sort((a,b)=>score(b)-score(a));
if(id("vizScores"))new Chart(id("vizScores"),{type:"bar",data:{labels:ranks.map(r=>r.name),datasets:[{label:"独自評価スコア／100（推計）",data:ranks.map(score),backgroundColor:ranks.map(r=>r.ratings[1]>=4?"#2d7c94":"#a9bec8"),borderRadius:5}]},options:{...options,indexAxis:"y",plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>"独自評価 "+c.raw+"/100（推計）"}}},scales:{x:{min:0,max:100},y:{grid:{display:false},ticks:{font:{size:10}}}}}});
if(id("vizCityChange"))new Chart(id("vizCityChange"),{type:"bar",data:{labels:["福岡市","北九州市"],datasets:[{label:"2020→2025年 国勢調査間の人口増減（人）",data:[50401,-35437],backgroundColor:["#188c85","#d88b5b"],borderRadius:7}]},options:{...options,indexAxis:"y",plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>(c.raw>0?"+":"")+fmt(c.raw)+"人"}}},scales:{x:{min:-45000,max:65000,ticks:{callback:v=>(v>0?"+":"")+fmt(v),font:{size:10}}},y:{grid:{display:false}}}}});
}
function init(){try{writeStats();heatmap();legend();plot()}catch(e){console.error("Fukuoka visual atlas:",e);const t=s("viz-loading");if(t)t.textContent="一部の図表は読み込めません。下の数値表と出典を参照してください。"}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();