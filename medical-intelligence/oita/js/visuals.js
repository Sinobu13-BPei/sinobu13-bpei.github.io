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
 fetch("./data/data.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error("visual data HTTP "+r.status);return r.json()}).then(enhance).catch(err=>{console.warn("Oita visual module data error",err);const card=document.querySelector("#regionCards");if(card)card.textContent="医療圏別の可視化データが読み込めません。下の病床数一覧と出典をご参照ください。";});
})();
