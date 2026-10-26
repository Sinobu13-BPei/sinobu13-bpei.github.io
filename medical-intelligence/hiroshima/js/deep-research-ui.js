/* Research visuals for 13 provided Hiroshima sources. No proprietary charts/images replicated. */
(()=>{"use strict";
const S=window.HIROSHIMA_DEEP_RESEARCH;
if(!S)return;
const get=id=>document.getElementById(id);
const el=(tag,v,cl)=>{const e=document.createElement(tag);if(v!=null)e.textContent=String(v);if(cl)e.className=cl;return e};
const number=n=>Number(n).toLocaleString("ja-JP");
const rows=get("deepResearchAreaTable")?.querySelector("tbody");
for(const x of S.area){
 const tr=el("tr");
 const vals=[x.name,number(x.population2020),x.density.toFixed(1),x.habitableShare+"%",x.physicianIndex2024.toFixed(1),x.dpcResidentK.toFixed(1),x.dpcFacilityK.toFixed(1),(x.dpcFacilityK/x.dpcResidentK*100).toFixed(1)+"%"];
 vals.forEach((value,i)=>{const cell=el(i===0?"th":"td",value);if(i===0)cell.scope="row";if(i===7)cell.className="dpc-ratio-cell";tr.append(cell)});
 rows?.append(tr);
}
const cards=get("deepResearchRegions");
if(cards){for(const x of S.area){
 const item=el("article",null,"diagnostic-item");const h=el("h4",x.name);item.append(h,el("p",x.medicalInsight),el("small","医療圏の構造と数値からの独自解釈・2026年版"));cards.append(item);
}}
const table=get("marketFacilitySnapshots")?.querySelector("tbody");
for(const f of S.facilityHistory){
 const tr=el("tr");
 [f.year,number(f.hospitals)+"施設",number(f.clinics)+"施設",f.public?"公的統計":"民間資料・集計"].forEach((v,i)=>{const td=el(i===0?"th":"td",v);if(i===0)td.scope="row";tr.append(td)});
 table?.append(tr);
}
const sources=get("researchSourceLinks");
if(sources){
 const urls={
 "広島":"https://nkgr.co.jp/wp-content/hsa/chugoku/hsa3401-hiroshima-hiroshima.pdf",
 "広島西":"https://nkgr.co.jp/wp-content/hsa/chugoku/hsa3402-hiroshima-hiroshimanishi.pdf",
 "呉":"https://nkgr.co.jp/hsa/hiroshima/",
 "広島中央":"https://nkgr.co.jp/wp-content/hsa/chugoku/hsa3404-hiroshima-hiroshimachuo.pdf",
 "尾三":"https://nkgr.co.jp/wp-content/hsa/chugoku/hsa3405-hiroshima-bisan.pdf",
 "福山・府中":"https://nkgr.co.jp/wp-content/hsa/chugoku/hsa3406-hiroshima-fukuyama-fuchu.pdf",
 "備北":"https://nkgr.co.jp/hsa/hiroshima/"
 };
 for(const area of S.area){
 const link=el("a",area.name+"｜需給総覧 ↗");link.href=urls[area.name];link.target="_blank";link.rel="noopener noreferrer";sources.append(link);
 }
}
// 社人研2023年推計（予測）/ 7二次医療圏の人口・生産年齢・75歳以上人口
const proj=S.populationProjections,projTable=get("regionProjectionTable");
const rate=(current,base)=>((current/base-1)*100);
if(projTable){
 const body=projTable.querySelector("tbody"),foot=projTable.querySelector("tfoot");
 const rowData=(name,total,working,age75)=>{
  const tr=el("tr");
  [name,number(total[0]),number(total[2]),number(total[4]),number(total[6]),rate(total[6],total[0]).toFixed(1)+"%",number(working[6]),number(age75[6]),(rate(age75[6],age75[0])>0?"+":"")+rate(age75[6],age75[0]).toFixed(1)+"%"].forEach((v,i)=>{
   const td=el(i===0?"th":"td",v);if(i===0)td.scope="row";tr.append(td);
  });return tr;
 };
 proj.areas.forEach(a=>body.append(rowData(a.name,a.total,a.working,a.age75)));
 const summed={name:"県計（圏域合算）",total:proj.years.map((_,i)=>proj.areas.reduce((n,a)=>n+a.total[i],0)),working:proj.years.map((_,i)=>proj.areas.reduce((n,a)=>n+a.working[i],0)),age75:proj.years.map((_,i)=>proj.areas.reduce((n,a)=>n+a.age75[i],0))};
 const tr=rowData(summed.name,summed.total,summed.working,summed.age75);tr.className="total-row";foot.append(tr);
}

if(!window.Chart)return;
const Chart=window.Chart;
const cols=["#17788a","#9dbcca","#e3ac58","#718da9","#698a9b","#80aeb2","#3c7b9b"];
const sourceOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{boxWidth:12,usePointStyle:true}},tooltip:{backgroundColor:"#143c52",padding:10}}};
const chart=(id,type,data,options={})=>{
 const c=get(id);if(c)new Chart(c,{type,data,options:{...sourceOpts,...options,plugins:{...sourceOpts.plugins,...(options.plugins||{})}}});
};
const labels=S.area.map(x=>x.name);
chart("historicalPhysicians","bar",{labels,datasets:[{label:"医師偏在指標（旧版・2024年1月）",data:S.area.map(x=>x.physicianIndex2024),backgroundColor:S.area.map(x=>x.physicianIndex2024>=217.6?"#1b8491":"#dbb069"),borderRadius:4}]},{
 indexAxis:"y",plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.parsed.x.toFixed(1)+"（2024年1月版）"}}},scales:{x:{min:0,max:350,title:{display:true,text:"医師偏在指標（旧版）"}},y:{ticks:{autoSkip:false}}}
});
chart("dpcFlowChart","bar",{labels,datasets:[
 {label:"患者住所地（千件）",data:S.area.map(x=>x.dpcResidentK),backgroundColor:"#a3bdca",borderRadius:3},
 {label:"医療機関所在地（千件）",data:S.area.map(x=>x.dpcFacilityK),backgroundColor:"#157988",borderRadius:3}
]},{
 indexAxis:"y",plugins:{legend:{position:"bottom"},tooltip:{callbacks:{label:c=>c.dataset.label+"： "+c.parsed.x.toFixed(1)+"千件",footer:all=>{
 const i=all?.[0]?.dataIndex;const a=S.area[i];
 return a?"所在地/住所地="+(a.dpcFacilityK/a.dpcResidentK*100).toFixed(1)+"% （圏内完結率ではない）":"";
 }}}},scales:{x:{min:0,title:{display:true,text:"2023年度症例数（千件）"}},y:{ticks:{autoSkip:false}}}
});
chart("regionalDensityChart","bar",{labels,datasets:[{label:"人口密度（人/㎢）",data:S.area.map(x=>x.density),backgroundColor:cols,borderRadius:3}]},{
 indexAxis:"y",plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.parsed.x.toFixed(1)+" 人/㎢（2020年）"}}},scales:{x:{beginAtZero:true,title:{display:true,text:"人/㎢"}},y:{ticks:{autoSkip:false}}}
});
chart("habitableChart","bar",{labels,datasets:[{label:"可住地面積割合（2020年）",data:S.area.map(x=>x.habitableShare),backgroundColor:cols,borderRadius:4}]},{
 indexAxis:"y",plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.parsed.x+"% （2020年度）"}}},scales:{x:{min:0,max:55,ticks:{callback:v=>v+"%"}},y:{ticks:{autoSkip:false}}}
});
chart("marketTrendChart","line",{labels:S.privateMarket.years.map(x=>x+"年度"),datasets:[{label:"民間推計・県内末端市場（億円）",data:S.privateMarket.valuesOku,borderColor:"#167984",backgroundColor:"rgba(17,132,150,.10)",pointRadius:6,pointHoverRadius:8,fill:true,tension:.16}]},{
 plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.parsed.y+"億円（民間推計、装置以外含む）"}}},scales:{y:{min:750,max:1000,title:{display:true,text:"億円・民間推計"}},x:{grid:{display:false}}}
});

chart("regionProjectionChart","line",{
 labels:proj.years.map(x=>x+"年"),datasets:proj.areas.map((a,i)=>({label:a.name,data:a.total.map(n=>+(n/10000).toFixed(2)),borderColor:["#165a79","#65a0bb","#a25d69","#43a1a7","#b5a05f","#6c7eac","#60755d"][i],borderWidth:2.4,pointRadius:2,tension:.22}))
},{plugins:{legend:{position:"bottom",labels:{boxWidth:10,usePointStyle:true,font:{size:10}}},tooltip:{callbacks:{label:c=>c.dataset.label+"： "+c.parsed.y.toFixed(2)+"万人（社人研推計）"}}},scales:{y:{beginAtZero:true,title:{display:true,text:"人口（万人）"}},x:{ticks:{font:{size:10}}}}});
chart("age75DeltaChart","bar",{
 labels:proj.areas.map(a=>a.name),datasets:[{label:"75歳以上人口 2020→2050年変化率（社人研推計）",data:proj.areas.map(a=>+rate(a.age75[6],a.age75[0]).toFixed(1)),backgroundColor:proj.areas.map(a=>rate(a.age75[6],a.age75[0])>0?"#1b8f95":"#bc8454"),borderRadius:4}]
},{indexAxis:"y",plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>{const a=proj.areas[c.dataIndex];return [((c.parsed.x>0)?"+":"")+c.parsed.x.toFixed(1)+"%",number(a.age75[0])+"人 → "+number(a.age75[6])+"人（推計）"]}}}},scales:{x:{min:-25,max:50,ticks:{callback:v=>v+"%"}},y:{ticks:{autoSkip:false}}}});
})();