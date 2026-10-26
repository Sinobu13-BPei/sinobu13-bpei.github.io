/* Hiroshima visual atlas: public-data charts and concept diagrams, 2026-10-27 */
(()=>{"use strict";
const D=window.HIROSHIMA_DATA;
if(!D)return;
const $=id=>document.getElementById(id);
const nfmt=n=>Number(n).toLocaleString("ja-JP");
const cols=["#155a7a","#2695a9","#e5ae65","#8083b3","#8cbbb9","#5b709d","#39a899"];
const names=["高度急性期","急性期","回復期","慢性期","休棟等"];
const A=D.areas;
document.querySelectorAll(".schema-node[data-region]").forEach(node=>{
 const jump=()=>{
   const card=[...document.querySelectorAll(".region-card")].find(e=>e.querySelector("h4")?.textContent===node.dataset.region);
   if(!card)return;
   card.setAttribute("tabindex","-1");
   card.scrollIntoView({behavior:"smooth",block:"center"});
   card.focus({preventScroll:true});
   card.classList.add("flash-focus");
   setTimeout(()=>card.classList.remove("flash-focus"),1300);
 };
 node.addEventListener("click",jump);
 node.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();jump()}});
});
const map=window.HIROSHIMA_MAP,toggle=$("areaBubbleToggle");
if(map&&window.L&&toggle){
 const pane=map.createPane("bedBubbles");pane.style.zIndex="390";pane.style.pointerEvents="none";
 const layer=L.layerGroup();
 A.forEach((a,i)=>L.circleMarker(a.center,{radius:10+Math.sqrt(a.total)*.185,pane:"bedBubbles",color:cols[i],weight:2,fillColor:cols[i],fillOpacity:.24,interactive:false}).addTo(layer));
 toggle.addEventListener("change",()=>toggle.checked?layer.addTo(map):map.removeLayer(layer));
}
if(!window.Chart){
 for(const c of document.querySelectorAll(".chart canvas")){if(!c.getAttribute("width")){const p=document.createElement("p");p.className="small";p.textContent="グラフの取得に失敗しました。表と出典をご覧ください。";c.parentElement.append(p)}}
 return;
}
const Chart=window.Chart;
const legend={position:"bottom",labels:{boxWidth:10,padding:12,usePointStyle:true,font:{size:11}}};
const common={responsive:true,maintainAspectRatio:false,plugins:{legend}};
const pct=v=>(v*100).toFixed(1)+"%";
function draw(id,type,data,options){
 const c=$(id);if(!c)return null;
 return new Chart(c,{type,data,options:{...common,...options,plugins:{...common.plugins,...(options?.plugins||{})}}});
}
const p=D.population;
draw("ageChart","doughnut",{
 labels:["0〜14歳","15〜64歳","65歳以上"],
 datasets:[{data:[p.children2025,p.working2025,p.elderly2025],backgroundColor:["#87bdc2","#278c9e","#e6ac6b"],borderWidth:3,borderColor:"#fff"}]
},{cutout:"70%",plugins:{legend,tooltip:{callbacks:{label:c=>c.label+"："+nfmt(c.parsed)+"人 / "+pct(c.parsed/p.census2025)}}}});
const muni=[...D.municipalities].sort((x,y)=>y[2]-x[2]);
const selected=[...muni.slice(0,3),...muni.slice(-7).reverse()];
draw("municipalityChangeChart","bar",{
 labels:selected.map(m=>m[0]),
 datasets:[{data:selected.map(m=>m[2]),backgroundColor:selected.map(m=>m[2]>0?"#149095":"#ba8050"),borderRadius:3,barThickness:13}]
},{indexAxis:"y",plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.raw.toFixed(2)+"%"}}},scales:{x:{min:-14,max:4,ticks:{callback:v=>v+"%"}},y:{ticks:{autoSkip:false,font:{size:11}}}}});
const fns=names.map((_,i)=>A.reduce((t,a)=>t+a.beds[i],0));
draw("bedDonutChart","doughnut",{
 labels:names,
 datasets:[{data:fns,backgroundColor:cols.slice(0,5),borderColor:"#fff",borderWidth:3}]
},{cutout:"67%",plugins:{legend,tooltip:{callbacks:{label:c=>c.label+"："+nfmt(c.parsed)+"床 / "+pct(c.parsed/29606)}}}});
const changes=A.map((a,i)=>a.total-D.beds2024.areas[i]);
draw("bedYoYChart","bar",{
 labels:A.map(a=>a.name),
 datasets:[{data:changes,backgroundColor:changes.map(x=>x>=0?"#2695a9":"#b58c5b"),borderRadius:3}]
},{indexAxis:"y",plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>{const i=c.dataIndex;return "2024年 "+nfmt(D.beds2024.areas[i])+"床 → 2025年 "+nfmt(A[i].total)+"床（"+(c.raw>=0?"+":"")+c.raw+"床）"}}}},scales:{x:{ticks:{callback:v=>(v>0?"+":"")+v+"床"}},y:{ticks:{autoSkip:false}}}});
draw("bedRatioChart","bar",{
 labels:A.map(a=>a.name),
 datasets:names.map((name,i)=>({label:name,data:A.map(a=>+(a.beds[i]/a.total*100).toFixed(2)),backgroundColor:cols[i],borderWidth:0}))
},{indexAxis:"y",plugins:{legend,tooltip:{callbacks:{label:c=>c.dataset.label+"："+c.parsed.x.toFixed(1)+"%"}}},scales:{x:{stacked:true,min:0,max:100,ticks:{callback:v=>v+"%"}},y:{stacked:true,ticks:{autoSkip:false}}}});
draw("regionShareChart","doughnut",{
 labels:A.map(a=>a.name),
 datasets:[{data:A.map(a=>a.total),backgroundColor:cols,borderColor:"#fff",borderWidth:3}]
},{cutout:"65%",plugins:{legend,tooltip:{callbacks:{label:c=>c.label+"："+nfmt(c.parsed)+"床 / "+pct(c.parsed/29606)}}}});
const bubbles=A.map(a=>({x:a.total,y:a.score[2],r:8+2.6*a.score[1]}));
const plots=draw("portfolioChart","bubble",{
 datasets:A.map((a,i)=>({label:a.name,data:[bubbles[i]],backgroundColor:cols[i]+"b0",borderColor:cols[i],borderWidth:2}))
},{plugins:{legend:{display:false},tooltip:{callbacks:{title:ctx=>ctx[0]?.dataset.label||"",label:ctx=>{
 const a=A.find(x=>x.name===ctx.dataset.label);
 return ["病床： "+nfmt(a.total)+"床","アクセス課題： "+a.score[2]+"/5（独自評価）","再編・更新： "+a.score[1]+"/5（独自評価）"];
 }}}},scales:{x:{min:0,max:15000,title:{display:true,text:"2025年報告病床数（床）"}},y:{min:.5,max:5.5,title:{display:true,text:"アクセス課題評価 / 5点"},ticks:{stepSize:1}}}});
})();