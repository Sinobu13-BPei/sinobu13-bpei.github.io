(() => {
"use strict";
const fmt=n=>Number(n).toLocaleString("ja-JP");
const id=x=>document.getElementById(x);
const el=(tag,attrs={},text="")=>{const n=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(k==="class")n.className=v;else n.setAttribute(k,v)}n.textContent=text;return n;};
const ext=(href,label)=>{const a=el("a",{href,target:"_blank",rel:"noopener noreferrer"},label);return a;};
const gmap=f=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(f.name+" "+(f.address.includes("要再確認")||f.address.includes("公式サイト")?"":f.address));
const gsi=f=>"https://maps.gsi.go.jp/#15/"+f.lat.toFixed(4)+"/"+f.lon.toFixed(4)+"/";
const s=(parent,tag,text)=>{parent.appendChild(el(tag,{},text));};
const bands=["高度急性期","急性期","回復期","慢性期","休棟"];
const palette=["#174a67","#3c8a95","#87b7a1","#cc9a63","#aab8c1"];
const weights=[30,25,20,15,10];
let charts=[];
const chart=(node,type,data,options)=>{if(typeof Chart==="undefined"){const p=el("p",{},"グラフの外部ライブラリが読み込めません。下記データ表または出典をご覧ください。");node.parentNode.replaceChild(p,node);return;}charts.push(new Chart(node,{type,data,options}));};
const tick={color:"#526978",font:{size:11}};
fetch("./data/market.json").then(r=>{if(!r.ok)throw new Error("data fetch "+r.status);return r.json()}).then(d=>{
const rg=d.regions;const sourceGrid=id("sourceGrid");d.sources.forEach(q=>{const a=ext(q.url,q.id+"  "+q.title);a.appendChild(el("small",{},q.year+" / 公式・参考ページ"));sourceGrid.appendChild(a)});
const regTable=id("regionTable");rg.forEach(r=>{const tr=el("tr");[r.name,fmt(r.pop2020)+"人",fmt(r.doctors)+"人",r.doctorIndex,r.municipalities].forEach(v=>s(tr,"td",v));regTable.appendChild(tr);for(const select of [id("areaSelect"),id("facilityArea")])select.appendChild(el("option",{value:r.name},r.name))});
const score=r=>Math.round(r.scores.reduce((n,v,i)=>n+v*weights[i]/5,0));
const scoreTable=id("scoreTable");[...rg].sort((a,b)=>score(b)-score(a)).forEach(r=>{const tr=el("tr");[r.name,...r.scores.map((v,i)=>v+"/5"),score(r)+"点"].forEach(v=>s(tr,"td",v));scoreTable.appendChild(tr)});
const bedTable=id("bedTable");rg.forEach(r=>{for(const [lbl,arr] of [["報告2025",r.beds],["必要2025",r.need]]){const tr=el("tr");const vals=lbl==="報告2025"?arr:[...arr,"―"];[r.name,lbl,...vals,arr.reduce((x,y)=>x+y,0)].forEach(v=>s(tr,"td",typeof v==="number"?fmt(v):v));bedTable.appendChild(tr)}});
const cards=id("regionCards");rg.forEach(r=>{const a=el("article",{class:"regioncard"});a.appendChild(el("span",{class:"score"},"独自スコア "+score(r)+"/100"));s(a,"h4",r.name+"医療圏");for(const [k,v] of [["中心",r.hub+"／"+r.key],["需要",r.chance],["課題",r.issue],["運用KPI",r.kpi]]){const dl=el("dl");s(dl,"dt",k);s(dl,"dd",v);a.appendChild(dl)}cards.appendChild(a)});
function links(row,f){const td=el("td"),box=el("div",{class:"maplinks"});for(const [url,label] of [[f.url,"公式"],[gmap(f),"Google Map"],[gsi(f),"地理院地図*"]])box.appendChild(ext(url,label));td.appendChild(box);row.appendChild(td)}
function addFacility(tbody,f,association=false){const tr=el("tr");const n=el("td");n.appendChild(ext(f.url,f.name));tr.appendChild(n);if(!association){s(tr,"td",f.type+" ／ "+f.area);s(tr,"td",f.address)}else{s(tr,"td",f.area)}links(tr,f);tbody.appendChild(tr)}
const ft=id("facilityTable");function drawFacilities(){ft.replaceChildren();d.facilities.filter(f=>(id("facilityType").value==="all"||f.type===id("facilityType").value)&&(id("facilityArea").value==="all"||f.area===id("facilityArea").value)).forEach(f=>addFacility(ft,f))}
id("facilityType").addEventListener("change",drawFacilities);id("facilityArea").addEventListener("change",drawFacilities);drawFacilities();
const at=id("associationTable");d.associations.forEach(a=>addFacility(at,a,true));
const years=d.future.map(p=>p.year+" "+p.kind);chart(id("populationChart"),"line",{labels:years,datasets:[{label:"総人口（万人）",data:d.future.map(p=>+(p.pop/10000).toFixed(2)),borderColor:"#0b7a85",backgroundColor:"#0b7a8516",tension:.2,fill:true,pointRadius:5}]},{maintainAspectRatio:false,responsive:true,plugins:{legend:{display:false},tooltip:{callbacks:{label:x=>x.parsed.y+" 万人"}}},scales:{x:{ticks:{...tick,maxRotation:45,minRotation:0}},y:{ticks:tick,title:{display:true,text:"万人"}}}});
const blabels=[];const bdatasets=bands.map((b,i)=>({label:b,data:[],backgroundColor:palette[i],stack:"beds"}));rg.forEach(r=>{blabels.push(r.name+" 報告",r.name+" 必要");bdatasets.forEach((ds,i)=>ds.data.push(r.beds[i]||0,r.need[i]||0))});chart(id("bedChart"),"bar",{labels:blabels,datasets:bdatasets},{maintainAspectRatio:false,responsive:true,plugins:{legend:{position:"bottom",labels:{boxWidth:12}},tooltip:{callbacks:{label:x=>x.dataset.label+": "+fmt(x.raw)+"床"}}},scales:{x:{stacked:true,ticks:{...tick,autoSkip:false,maxRotation:50,minRotation:30}},y:{stacked:true,ticks:tick,title:{display:true,text:"病床（床）"}}}});
chart(id("doctorChart"),"bar",{labels:d.neighbors.map(n=>n[0]),datasets:[{label:"医師偏在指標",data:d.neighbors.map(n=>n[1]),backgroundColor:d.neighbors.map(n=>n[0]==="岐阜県"?"#c27a38":"#2c8791")}]},{indexAxis:"y",maintainAspectRatio:false,responsive:true,plugins:{legend:{display:false}},scales:{x:{ticks:tick,beginAtZero:true},y:{ticks:tick}}});
chart(id("scoreChart"),"bar",{labels:rg.map(r=>r.name),datasets:[{label:"独自分析点 /100",data:rg.map(score),backgroundColor:rg.map((r,i)=>["#326b86","#59959b","#136e7a","#d39a64","#6f9b7b"][i])}]},{maintainAspectRatio:false,responsive:true,plugins:{legend:{display:false},tooltip:{callbacks:{label:x=>x.raw+" 点（独自仮説）"}}},scales:{y:{beginAtZero:true,max:100,ticks:tick},x:{ticks:tick}}});
if(typeof L!=="undefined"){const map=L.map("map",{scrollWheelZoom:false}).setView([35.63,137.1],8);L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",{attribution:"地理院タイル（国土地理院）",maxZoom:17}).addTo(map);const dots=rg.map(r=>{const m=L.circleMarker([r.lat,r.lon],{radius:10,fillColor:"#096f7d",fillOpacity:.83,color:"#fff",weight:2}).addTo(map).bindPopup("<strong>"+r.name+"医療圏</strong><br>代表地点："+r.hub+"付近<br>2020人口："+fmt(r.pop2020)+"人<br>※市中心の概略点");return {region:r,marker:m}});id("areaSelect").addEventListener("change",()=>{const selected=id("areaSelect").value;dots.forEach(x=>x.marker.setStyle({opacity:selected==="all"||selected===x.region.name?1:.35,fillOpacity:selected==="all"||selected===x.region.name?.83:.18}));if(selected==="all")map.setView([35.63,137.1],8);else{const r=rg.find(z=>z.name===selected);map.setView([r.lat,r.lon],10)}});
// Optional map overlays: markers are city-centre aggregation points, NOT hospital coordinates.
const encode=s=>String(s).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const groupedLayer=(types,color)=>{
  const groups=new Map();
  d.facilities.filter(f=>types.includes(f.type)).forEach(f=>{
    if(!groups.has(f.city))groups.set(f.city,[]);
    groups.get(f.city).push(f);
  });
  const layer=L.layerGroup();
  for(const [city,places]of groups){
    const lat=places[0].lat,lon=places[0].lon;
    const m=L.circleMarker([lat,lon],{radius:Math.min(15,7+places.length*1.2),color:"#fff",weight:2,fillColor:color,fillOpacity:.94});
    const rows=places.map(p=>'<li><a target="_blank" rel="noopener noreferrer" href="'+encode(p.url)+'">'+encode(p.name)+'</a> ／ <a target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&amp;query='+encode(encodeURIComponent(p.name+" "+p.address))+'">Googleマップ</a></li>').join("");
    m.bindPopup('<div style="min-width:190px"><strong>'+encode(city)+'周辺（'+places.length+'施設）</strong><br><small>市区町村中心付近の代表点・正確な施設位置ではありません</small><ul style="padding-left:18px">'+rows+'</ul></div>');
    m.addTo(layer);
  }
  return layer;
};
const hospitals=groupedLayer(["中核病院","大学・特定機能","地域支援","統合新病院"],"#ca8040");
const offices=groupedLayer(["保健所","行政"],"#755ca3");
L.control.layers(null,{"主要病院・大学（自治体代表点）":hospitals,"保健所・行政（自治体代表点）":offices},{collapsed:true,position:"topright"}).addTo(map);
setTimeout(()=>map.invalidateSize(),150);}
else{id("map").textContent="地図サービスを読み込めません。下の医療圏一覧、施設のGoogleマップ・地理院地図リンクをご利用ください。";}
}).catch(e=>{console.error(e);for(const name of ["regionTable","bedTable","scoreTable","sourceGrid","facilityTable","associationTable","regionCards"])id(name).textContent="データ取得に失敗しました。再読み込みしてください。";});
})();