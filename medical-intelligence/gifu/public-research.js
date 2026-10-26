(()=>{
"use strict";
const get=id=>document.getElementById(id);
const elem=(tag,cls="",txt="")=>{const e=document.createElement(tag);if(cls)e.className=cls;e.textContent=txt;return e};
const fmt=n=>Number(n).toLocaleString("ja-JP");
const link=(href,txt)=>{const a=elem("a","",txt);a.href=href;a.target="_blank";a.rel="noopener noreferrer";return a};
const fallback=(root)=>{root?.append(elem("p","annex-desc","追加データを読み込めません。公式公表情報は下記のリンクからご参照ください。"))};
function hospitalTable(d){
const root=get("annexHospitalRows"),sel=get("annexHospitalRegion"),head=get("annexHospitalCount");
if(!root||!sel)return;
const render=()=>{
const region=sel.value,records=d.hospitals.filter(x=>region==="all"||x.area===region).slice().sort((a,b)=>b.beds-a.beds);
root.replaceChildren();if(head)head.textContent=records.length+"施設";
records.forEach((h,i)=>{
const tr=elem("tr");tr.append(elem("td","",h.area));
const title=elem("td","annex-h-name");title.append(link(h.url,h.name));title.append(elem("small","",h.city));tr.append(title);
tr.append(elem("td","annex-h-beds",fmt(h.beds)));
tr.append(elem("td","",h.role));
tr.append(elem("td","",h.asOf));
const note=elem("td","annex-h-note",h.note);tr.append(note);
root.append(tr);
});
};
sel.addEventListener("change",render);render();
}
function events(d){
const root=get("annexEvents");if(!root)return;
d.events.forEach((x,i)=>{
const it=elem("article","annex-event");
const side=elem("div","annex-date",x.date);
side.append(elem("small","",x.area+" ｜ "+x.kind));
const info=elem("div");const h=elem("h4","",x.title);const p=elem("p","",x.desc);
info.append(h,p,link(x.url,"一次資料を確認"));
it.append(side,info);root.append(it);
});
}
function regionalCards(d,main){
const root=get("annexLenses");if(!root)return;
d.lenses.forEach((r,i)=>{
const c=elem("article","annex-lens"),top=elem("div","annex-lens-head");
top.append(elem("span","annex-area","0"+(i+1)+" / "+r.area),elem("h4","",r.title));
c.append(top);
const e=elem("p","",r.evidence),f=elem("p","",r.focus),k=elem("p","annex-caution","要検証："+r.caution);
c.append(e,elem("b","","論点："),f,k);
root.append(c);
});
const pop=new Map(main.regions.map(x=>[x.name,x.pop2020]));
const fc=main.municipalityFacility2025, chartdata=main.regions.map(r=>{
const s=fc.filter(c=>c.area===r.name);
return {x:pop.get(r.name)/10000,y:s.reduce((t,c)=>t+c.clinics,0),hospitals:s.reduce((t,c)=>t+c.hospitals,0),name:r.name};
});
const canvas=get("annexRegionScatter");
if(canvas){
if(typeof Chart!=="undefined")new Chart(canvas,{type:"scatter",data:{datasets:[{label:"5医療圏",data:chartdata.map(x=>({x:x.x,y:x.y,meta:x})),pointRadius:chartdata.map(x=>6+Math.sqrt(x.hospitals)*1.4),pointHoverRadius:13,pointBackgroundColor:["#1b6682","#bc9060","#418a82","#618bb5","#8ba973"],pointBorderColor:"#fff",pointBorderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{title:ctx=>ctx[0]?.raw.meta.name+"医療圏",label:ctx=>"人口 "+ctx.raw.x.toFixed(1)+"万人（2020）／一般診療所"+ctx.raw.y+"施設（2025）／病院"+ctx.raw.meta.hospitals+"施設（2025）"}}},scales:{x:{title:{display:true,text:"2020年の圏域人口（万人）"},min:0,ticks:{color:"#586e78"}},y:{title:{display:true,text:"2025年の一般診療所数（施設）"},min:0,ticks:{color:"#586e78"}}}}});
else {
const list=elem("div","annex-scatter-fallback");chartdata.forEach(x=>list.append(elem("p","",x.name+"：2020人口"+x.x.toFixed(1)+"万人、2025診療所"+x.y+"施設、病院"+x.hospitals+"施設")));canvas.replaceWith(list)
}}
}
function correctionTable(){
const root=get("annexCorrections");if(!root)return;
const items=[
["2023年度・2024年度の医療機器市場推計","502億円／510億円が添付に混在","民間推計。調査年が異なるうえ、再配布・公開許諾を確認できないため公開ダッシュボードには掲載しない。"],
["岐阜市民病院の病床数","添付ランキング565床","厚生労働省医療情報ネットでは555床（一般505＋精神50）。施設比較には555床を採用。"],
["下呂温泉病院の病床数","添付ランキング198床","2026年10月の病院公式沿革では196床。病床変遷を併記。"],
["久美愛厚生病院の病床数","添付ランキング300床","公式概要には285床、2026年6月の沿革には300床／うち15床休床。許可・休床の区分に注意。"],
["地域医療構想の必要病床・病床機能報告","2025年必要病床14,978床／報告16,235床","必要病床は推計、報告病床は2025年7月現況（休棟を含む）。差分を余剰病床とは呼ばない。"],
["医療施設総数","2025年10月 93病院・1,620一般診療所","岐阜県市町村別統計。DPC対象病院数や病床機能報告対象病院数とは異なる母集団。"]
];
items.forEach(([topic,incoming,rule])=>{const tr=elem("tr");[topic,incoming,rule].forEach(s=>tr.append(elem("td","",s)));root.append(tr)});
}
function sources(d){
const root=get("annexSources");if(!root)return;
d.sources.forEach(x=>{const a=link(x.url,x.id+" / "+x.name);root.append(a)});
}
function setup(){
Promise.all([fetch("./data/public-research-2026.json").then(r=>{if(!r.ok)throw Error("supplement HTTP "+r.status);return r.json()}),fetch("./data/market.json").then(r=>{if(!r.ok)throw Error("market HTTP "+r.status);return r.json()})]).then(([data,main])=>{hospitalTable(data);events(data);regionalCards(data,main);correctionTable();sources(data)}).catch(e=>{console.error("Gifu public research supplement",e);fallback(get("annexEvents"));fallback(get("annexHospitalRows"))});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
})();