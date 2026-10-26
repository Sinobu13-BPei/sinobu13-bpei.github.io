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
  fetch("./data/data.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error("data HTTP "+r.status);return r.json()}).then(render)
  .catch(e=>{console.error("Oita evidence charts unavailable",e);const t=$("#regionEvidenceTable tbody");if(t)t.innerHTML='<tr><td colspan="9">追加調査データを読み込めません。社人研の原典へのリンクをご確認ください。</td></tr>'});
})();