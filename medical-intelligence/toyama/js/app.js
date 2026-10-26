/* 富山県医療MKT｜公開用可視化。静的本文・数値表はJavaScriptなしで閲覧可能 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
function chart(id,type,data,overrides={}){
 if(typeof Chart==='undefined'||!$(id))return;
 try{new Chart($(id),{type,data,options:{responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{position:'bottom',labels:{boxWidth:12,font:{size:11}}}},scales:type==='doughnut'?{}:{y:{beginAtZero:true},x:{}},...overrides}});$(id).dataset.chartReady='true'}
 catch(err){console.warn('chart unavailable',id,err)}
}
function graphs(d){
const label=['高度急性期','急性期','回復期','慢性期','休棟等'],colors=['#174f7a','#19a4b2','#6ab87b','#bb8f4f','#a3aec0'];
chart('populationChart','line',{labels:['2025','2030','2040','2050'],datasets:[{label:'社人研2023推計（万人）',data:['2025','2030','2040','2050'].map(y=>d.population.ipss[y]/1e4),borderColor:'#147a9a',backgroundColor:'#147a9a25',fill:true,tension:.2},{label:'2025国勢調査（実績）',data:[d.population.census_2025/1e4,null,null,null],pointRadius:5,borderColor:'#d78b2d'}]},{scales:{y:{beginAtZero:false,title:{display:true,text:'万人'}}}});
chart('bedsChart','bar',{labels:d.areas.map(a=>a.name),datasets:label.map((x,i)=>({label:x,data:d.areas.map(a=>a.beds[i]),backgroundColor:colors[i]}))},{scales:{x:{stacked:true},y:{stacked:true,beginAtZero:true}}});
chart('needChart','bar',{labels:d.areas.map(a=>a.name),datasets:label.slice(0,4).map((x,i)=>({label:x,data:d.areas.map(a=>a.need[i]),backgroundColor:colors[i]}))},{scales:{x:{stacked:true},y:{stacked:true,beginAtZero:true}}});
chart('deviceChart','bar',{labels:d.device_density_100k.map(a=>a.name),datasets:[{label:'全国',data:d.device_density_100k.map(a=>a.jp),backgroundColor:'#a1b4c7'},{label:'富山県',data:d.device_density_100k.map(a=>a.toyama),backgroundColor:'#177b91'}]});
chart('priorityChart','bar',{labels:d.areas.map(a=>a.name),datasets:[{label:'独自スコア（推計）',data:d.areas.map(a=>a.score),backgroundColor:'#177b91'}]},{indexAxis:'y',scales:{x:{beginAtZero:true,max:100}}});
}
function map(d){
let node=$('facilityMap');if(!node||typeof L==='undefined')return;
try{node.replaceChildren();let m=L.map(node,{scrollWheelZoom:false}).setView([36.72,137.18],9);
L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{attribution:'<a href="https://maps.gsi.go.jp/" target="_blank" rel="noopener">地理院タイル（国土地理院）</a>',maxZoom:18}).addTo(m);
let bounds=[];for(const p of d.places){let marker=L.circleMarker([p.lat,p.lng],{radius:7,color:'#075d6e',fillColor:'#1d8b9d',fillOpacity:.95,weight:2}).addTo(m);let popup=document.createElement('div');const nm=document.createElement('strong');nm.textContent=p.name;popup.appendChild(nm);popup.appendChild(document.createElement('br'));for(let [text,url] of [['Googleマップ','https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.name+' 富山県')],['地理院地図','https://maps.gsi.go.jp/#15/'+p.lat+'/'+p.lng]]){let a=document.createElement('a');a.textContent=text;a.href=url;a.target='_blank';a.rel='noopener noreferrer';popup.appendChild(a);popup.appendChild(document.createTextNode('  '))}marker.bindPopup(popup);marker.bindTooltip(p.name);bounds.push([p.lat,p.lng])}
if(bounds.length)m.fitBounds(bounds,{padding:[18,18]});setTimeout(()=>m.invalidateSize(),100)}
catch(err){console.warn('map unavailable',err);node.textContent='地図を表示できません。施設表の地図リンクを利用してください。'}
}
async function start(){try{const r=await fetch('./data/report.json',{cache:'no-cache'});if(!r.ok)throw Error('data status '+r.status);const d=await r.json();graphs(d);map(d)}catch(e){console.warn('interactive charts unavailable; static tables remain',e)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();