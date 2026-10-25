/* 2026 Mie Medical Market Atlas — published tables and analysis, no proprietary client data */
(()=>{"use strict";
const $=id=>document.getElementById(id);
const esc=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");
const fmt=n=>Number(n).toLocaleString("ja-JP");
const gsi=(lat,lng,zoom=13)=>"https://maps.gsi.go.jp/#"+zoom+"/"+lat+"/"+lng+"/";
const google=q=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(q+" 三重県");
const SCHEMA=["高度急性期","急性期","回復期","慢性期","休棟等"], C=["#b84457","#d88940","#3473b6","#2a8a75","#9faebf"];
function srcLink(url,title="出典"){return '<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(title)+'</a>'}
function linkButtons(name,lat,lng){return '<a class="mi-link" href="'+google(name)+'" target="_blank" rel="noopener noreferrer">Google地図</a><a class="mi-link" href="'+gsi(lat,lng,12)+'" target="_blank" rel="noopener noreferrer">地理院図（都市周辺）</a>'}
function chart(element,config){if(!$(element)||!window.Chart)return; return new Chart($(element),config)}
const options={responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{boxWidth:13,font:{size:11}}},tooltip:{callbacks:{label:x=>x.dataset.label+": "+fmt(x.parsed.y??x.parsed.x)}}},scales:{x:{ticks:{font:{size:11}}},y:{beginAtZero:true,ticks:{font:{size:11}}}}};
const cityCoords={"四日市":[34.965,136.624],"桑名":[35.062,136.683],"鈴鹿":[34.883,136.585],"亀山":[34.855,136.45],"津":[34.718,136.506],"伊賀":[34.768,136.13],"名張":[34.628,136.108],"松阪":[34.578,136.527],"伊勢":[34.488,136.709],"鳥羽":[34.48,136.843],"志摩":[34.336,136.83],"尾鷲":[34.072,136.19],"熊野":[33.889,136.1],"紀南":[33.84,136.04],"御浜":[33.81,136.05],"紀北":[34.22,136.34]};
const anchors=(link,match,text)=>{let matches=match;for(const x of Object.keys(cityCoords)){if(text.includes(x)){matches=cityCoords[x];break;}} return matches}
function addApproxGsi(){for(const id of ["assTable"]){const t=$(id);if(!t)continue;for(const tr of t.tBodies[0].rows){const cell=tr.cells[tr.cells.length-1],name=tr.cells[1]?.textContent||"",city=tr.cells[2]?.textContent||"",coords=anchors(null,[34.718,136.506],city+name);if(!cell.querySelector("[data-gsi]")){const a=document.createElement("a");a.href=gsi(coords[0],coords[1],12);a.target="_blank";a.rel="noopener noreferrer";a.textContent="地理院図（都市周辺）";a.className="mi-link";a.dataset.gsi="1";cell.appendChild(a);}}}
const lookups=[["三重大学医学部附属病院",34.744,136.525],["市立四日市病院",34.98,136.594],["桑名市総合医療センター",35.062,136.683],["鈴鹿中央総合病院",34.883,136.585],["三重中央医療センター",34.708,136.46],["伊勢赤十字病院",34.49,136.705],["松阪中央総合病院",34.59,136.52],["済生会松阪総合病院",34.582,136.524],["尾鷲総合病院",34.072,136.19],["紀南病院",33.82,136.05]];
function addHospitalGsi(){const tb=document.querySelector("#hospitals table");if(!tb)return;for(const tr of tb.tBodies[0].rows){const text=tr.cells[1]?.textContent||"";const found=lookups.find(a=>text.includes(a[0]));const cell=tr.cells[tr.cells.length-1];if(!found||!cell||cell.querySelector("[data-gsi]"))continue;const a=document.createElement("a");a.className="mi-link";a.href=gsi(found[1],found[2],12);a.target="_blank";a.rel="noopener noreferrer";a.dataset.gsi="1";a.textContent="地理院図（都市周辺）";cell.appendChild(a);}}
function fill(data){const b=data.beds.map(x=>({zone:x[0],area:x[1],h:x[2],a:x[3],r:x[4],c:x[5],i:x[6],total:x.slice(2).reduce((a,b)=>a+b,0)}));const totals=b.reduce((o,r)=>{for(const k of ["h","a","r","c","i","total"])o[k]=(o[k]||0)+r[k];return o;},{});
if($("mi-beds-total"))$("mi-beds-total").textContent=fmt(totals.total);
if($("mi-beds-body"))$("mi-beds-body").innerHTML=b.map(r=>'<tr><td>'+esc(r.zone)+'</td><td>'+esc(r.area)+'</td>'+[r.h,r.a,r.r,r.c,r.i,r.total].map(v=>'<td class="right">'+fmt(v)+'</td>').join("")+'</tr>').join("")+'<tr style="font-weight:800;background:#ebf3f9"><td colspan="2">三重県 合計</td>'+[totals.h,totals.a,totals.r,totals.c,totals.i,totals.total].map(v=>'<td class="right">'+fmt(v)+'</td>').join("")+'</tr>';
if(window.Chart){chart("mi-bed-chart",{type:"bar",data:{labels:b.map(x=>x.zone),datasets:SCHEMA.map((s,i)=>({label:s,data:b.map(x=>x[["h","a","r","c","i"][i]]),backgroundColor:C[i]}))},options:{...options,indexAxis:"y",plugins:{...options.plugins,title:{display:false}},scales:{x:{stacked:true,beginAtZero:true},y:{stacked:true,ticks:{font:{size:12}}}}}});
const pop=data.population.filter(x=>x[0]!=="2026-09");chart("mi-pop-chart",{type:"line",data:{labels:pop.map(x=>x[0]),datasets:[{label:"人口（万人）・実績/推計混在につき注記参照",data:pop.map(x=>x[1]/10000),fill:true,borderColor:"#316eb0",backgroundColor:"rgba(52,117,180,.13)",tension:.25,pointRadius:5}]},options:{...options,scales:{x:{},y:{min:120,title:{display:true,text:"万人"}}}}});
chart("mi-phys-chart",{type:"bar",data:{labels:data.doctors.map(x=>x[0]),datasets:[{label:"医師偏在指標・2026公表",data:data.doctors.map(x=>x[2]),backgroundColor:["#b84457","#386bb1","#d48c3e","#298873"]}]},options:{...options,scales:{x:{},y:{min:0,max:320}}}});
}
const w=data.scores.weights,score=x=>Math.round(x.slice(1).reduce((s,v,i)=>s+v*w[i],0)/5);if($("mi-score-body"))$("mi-score-body").innerHTML=data.scores.values.map(row=>'<tr><td><b>'+esc(row[0])+'</b></td>'+row.slice(1).map(v=>'<td class="right">'+v+'</td>').join("")+'<td class="right"><strong>'+score(row)+'/100</strong></td></tr>').join("");
if(window.Chart)chart("mi-score-chart",{type:"bar",data:{labels:data.scores.values.map(x=>x[0]),datasets:[{label:"独自仮説の優先度・満点100",data:data.scores.values.map(score),backgroundColor:["#b84457","#386bb1","#d48c3e","#298873"]}]},options:{...options,scales:{x:{},y:{min:0,max:100}}}});
if($("mi-dealer-diversity"))$("mi-dealer-diversity").textContent="県内で確認対象とする主要商社は20社（医薬品卸を含む調査リスト、すべての認可事業所を網羅するものではありません）。";
if($("mi-dealer-added"))$("mi-dealer-added").innerHTML=data.dealers.map(x=>'<tr><td>'+esc(x[0])+'</td><td>'+esc(x[1])+'</td><td>'+esc(x[2])+'</td><td>'+srcLink(x[3],"公式／協会")+'</td></tr>').join("");
const sourceHtml=Object.entries(data.source).map(x=>'<a class="mi-link" href="'+x[1]+'" target="_blank" rel="noopener noreferrer">'+esc(x[0])+'</a>').join("");if($("mi-linked-sources"))$("mi-linked-sources").innerHTML=sourceHtml;
}
function loadMap(){if(!window.L||!$("mi-leaflet"))return;const map=L.map("mi-leaflet",{scrollWheelZoom:false}).setView([34.55,136.55],9);
L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",{maxZoom:18,attribution:'地図出典：<a href="https://maps.gsi.go.jp/" target="_blank" rel="noopener">国土地理院 地理院タイル</a>'}).addTo(map);
const zones=[["北勢（四日市周辺）",34.965,136.624,"#b84457"],["中勢伊賀（津周辺）",34.718,136.506,"#386bb1"],["南勢志摩（伊勢周辺）",34.488,136.709,"#d48c3e"],["東紀州（尾鷲周辺）",34.072,136.19,"#298873"]];
zones.forEach(z=>L.circleMarker([z[1],z[2]],{radius:11,color:"#fff",weight:2,fillColor:z[3],fillOpacity:.94}).addTo(map).bindPopup('<b>'+z[0]+'</b><br><small>地図位置は代表市街地の概略地点。医療圏境界・施設位置を表しません。</small><p>'+linkButtons(z[0],z[1],z[2])+'</p>'));
}
document.addEventListener("DOMContentLoaded",()=>{addApproxGsi();addHospitalGsi();loadMap();fetch("./data/research.json").then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(fill).catch(e=>{const x=$("mi-error");if(x)x.textContent="統計データの読み込みに失敗しました。出典へのリンクから一次情報をご確認ください。";});});
})();