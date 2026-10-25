"use strict";
(function(){
const D=window.KANAGAWA_DATA,V=window.KANAGAWA_VERIFIED;if(!D||!V)return;
const fmt=n=>Number(n).toLocaleString("ja-JP");
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const G=(name,address)=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(name+" "+(address||"神奈川県"));
const J=(lat,lon)=>"https://maps.gsi.go.jp/#15/"+lat+"/"+lon+"/";
const alink=(url,label)=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer" class="geo-btn">'+esc(label)+'</a>';
const ref=(url,text)=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(text)+'</a>';
const last=V.beds.values, lookup=Object.fromEntries(D.areas.map(a=>[a.n,a]));
const sum=k=>last.reduce((n,x)=>n+x[k],0);
const tbody=document.getElementById("bedVerifiedRows");
if(tbody)tbody.innerHTML=last.map(b=>{let a=lookup[b.name];let p=a?a.r:0;return '<tr><th scope="row">'+esc(b.name)+'</th><td>'+fmt(b.reported)+'</td><td>'+fmt(b.advanced)+'</td><td>'+fmt(b.acute)+'</td><td>'+fmt(b.recovery)+'</td><td>'+fmt(b.chronic)+'</td><td>'+fmt(p)+'</td></tr>'}).join("")+'<tr class="total"><th scope="row">県合計</th><td>'+fmt(sum("reported"))+'</td><td>'+fmt(sum("advanced"))+'</td><td>'+fmt(sum("acute"))+'</td><td>'+fmt(sum("recovery"))+'</td><td>'+fmt(sum("chronic"))+'</td><td>72,410</td></tr>';
document.getElementById("bedsTimestamp")?.replaceChildren(document.createTextNode(V.beds.basis));
function chart(id,conf){const el=document.getElementById(id);if(el&&window.Chart)new Chart(el,conf)}
const names=last.map(a=>a.name);
const axis={ticks:{color:"#48627c"},grid:{color:"#e2eaf3"}};
chart("bedChart",{type:"bar",data:{labels:names,datasets:[{label:"高度急性期",data:last.map(a=>a.advanced),backgroundColor:"#3267a5"},{label:"急性期",data:last.map(a=>a.acute),backgroundColor:"#4c91b5"},{label:"回復期",data:last.map(a=>a.recovery),backgroundColor:"#55a6a0"},{label:"慢性期",data:last.map(a=>a.chronic),backgroundColor:"#b7a06e"}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}},scales:{x:{stacked:true,ticks:{autoSkip:false,maxRotation:45,minRotation:40}},y:{stacked:true,beginAtZero:true,title:{display:true,text:"床"},...axis}}}});
chart("popChart",{type:"bar",data:{labels:D.areas.map(a=>a.n),datasets:[{label:"2025年人口",backgroundColor:"#378ec0",data:D.areas.map(a=>a.p)},{label:"2040年推計",backgroundColor:"#58b7ae",data:D.areas.map(a=>a.f)}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}},scales:{x:{ticks:{autoSkip:false,maxRotation:45,minRotation:40}},y:{beginAtZero:true,title:{display:true,text:"人"}}}}});
chart("doctorChart",{type:"bar",data:{labels:V.physicianComparison.items.map(a=>a[0]),datasets:[{label:"人口10万対医療施設従事医師数（2024）",backgroundColor:["#237c98","#6a9fc1","#a3b6ca","#acbcca"],data:V.physicianComparison.items.map(a=>a[1])}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,max:300,title:{display:true,text:"人 / 人口10万人"}},y:{grid:{display:false}}}}});
const universities=document.getElementById("uniCards");
if(universities)universities.innerHTML=V.universities.map(u=>'<div class="mini"><h3>'+ref(u.url,u.name)+'</h3><p>'+esc(u.hospital)+'</p><p class="fine">'+esc(u.loc)+' / '+esc(u.region)+'</p><div class="geos">'+alink(G(u.name,u.loc),"Googleマップ")+alink(J(u.lat,u.lon),"地理院地図・概略")+'</div></div>').join("");
const off=document.getElementById("officeCards");
if(off)off.innerHTML=V.extraOrganizations.map(o=>'<div class="mini"><h3>'+ref(o.url,o.name)+'</h3><p>'+esc(o.loc)+'</p><div class="geos">'+alink(G(o.name,o.loc),"Googleマップ")+alink(J(o.lat,o.lon),"地理院地図・概略")+'</div></div>').join("");
const officialSources=document.getElementById("verifiedSources");
if(officialSources)officialSources.innerHTML=V.sourceURLs.map((s,i)=>'<div class="source"><b>P'+(i+1)+'</b>'+ref(s[2],s[0])+'<p class="fine">'+esc(s[1])+'</p></div>').join("");
const rawScores={};const maxPop=Math.max(...D.areas.map(a=>a.p));
function clamp(x){return Math.min(5,Math.max(1,x))}
D.areas.forEach(a=>{const bed=last.find(b=>b.name===a.n);const z={
volume:clamp(1+4*Math.sqrt(a.p/maxPop)),
gap:clamp(1+4*(((a.r||0)/bed.reported)-0.85)/0.55),
access:a.n==="横浜"?5:a.n.includes("川崎")?5:a.n==="県西"?2:a.n==="横須賀・三浦"?3:4,
continuity:a.n==="県西"?5:a.n==="横須賀・三浦"?5:a.n==="相模原"?4:a.n==="湘南西部"?4:3,
population:clamp(1+4*((a.f/a.p-1)+.2)/.26)};
const w=V.scoreWeights||{population:25,need:25,access:15,resilience:20,growth:15};
const score=(z.volume*w.population+z.gap*w.need+z.access*w.access+z.continuity*w.resilience+z.population*w.growth)/100;
rawScores[a.n]={score,items:z};
});
const sorted=D.areas.slice().sort((a,b)=>rawScores[b.n].score-rawScores[a.n].score);
const scoresBody=document.getElementById("scoreRows");
if(scoresBody)scoresBody.innerHTML=sorted.map((a,i)=>{const o=rawScores[a.n];return '<tr><td>'+String(i+1)+'</td><th>'+esc(a.n)+'</th><td><b>'+o.score.toFixed(2)+'</b> /5</td><td>'+o.items.volume.toFixed(1)+'</td><td>'+o.items.gap.toFixed(1)+'</td><td>'+o.items.access.toFixed(1)+'</td><td>'+o.items.continuity.toFixed(1)+'</td><td>'+o.items.population.toFixed(1)+'</td></tr>'}).join("");
const points={};
const areaMap=D.areas.map(a=>({name:a.n,lat:a.center[0],lon:a.center[1],pop:a.p}));
if(window.L&&document.getElementById("verifiedMap")){const map=L.map("verifiedMap",{scrollWheelZoom:false}).setView([35.44,139.43],9);L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",{maxZoom:18,attribution:'&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">国土地理院 地理院タイル</a>'}).addTo(map);const ag=L.layerGroup().addTo(map),hg=L.layerGroup();areaMap.forEach(o=>L.circleMarker([o.lat,o.lon],{radius:8,color:"#126a99",weight:2,fillColor:"#4eaac1",fillOpacity:.86}).addTo(ag).bindPopup('<b>'+esc(o.name)+'</b><p>代表点（医療圏境界ではありません）</p>'+alink(J(o.lat,o.lon),"地理院地図")));Object.keys(V.facilityCoords).forEach(n=>{const v=V.facilityCoords[n];L.circleMarker([v[0],v[1]],{radius:5,color:"#a05c38",weight:1,fillColor:"#e09c53",fillOpacity:.8}).addTo(hg).bindPopup('<b>'+esc(n)+'</b><p>概略位置・要現地照合</p>'+alink(G(n,v[2]),"Googleマップ")+" "+alink(J(v[0],v[1]),"地理院地図"))});L.control.layers({"医療圏代表点":ag},{"重点病院・概略点":hg},{collapsed:false}).addTo(map);setTimeout(()=>map.invalidateSize(),350)}
// 既存の各病院名の後ろに、Googleマップ（住所または地域）、地理院地図（概略地点）へのリンクを併記
function hospitalMaps(){document.querySelectorAll("#areaGrid .area").forEach(card=>{const title=card.querySelector("h3")?.textContent||"";const a=lookup[title];if(!a)return;card.querySelectorAll(".hosp").forEach(item=>{if(item.dataset.mapsReady)return;const name=item.querySelector("span>a")?.textContent||"";const pos=V.facilityCoords[name]||[a.center[0],a.center[1],a.town];const addr=pos[2]||a.town;const box=document.createElement("span");box.className="geos";box.innerHTML=alink(G(name,addr),"Google")+alink(J(pos[0],pos[1]),V.facilityCoords[name]?"地理院・概略":"地理院・圏域代表点");item.appendChild(box);item.dataset.mapsReady="1"})})}
const observer=new MutationObserver(hospitalMaps);const target=document.getElementById("areaGrid");if(target){observer.observe(target,{childList:true,subtree:false});hospitalMaps()}
const wardSoc=document.getElementById("socGeoRows");if(wardSoc)wardSoc.innerHTML=D.associations.map((name,i)=>{const a=D.areas[[0,1,3,4,4,5,5,6,6,7,7,7,7,8,8,4,4,6][i]];return '<tr><td>'+esc(name)+'</td><td>'+esc(a.n)+'</td><td>'+alink("https://www.yokohama.kanagawa.med.or.jp/link/","公式一覧")+'</td><td>'+alink(G(name,a.town),"Google")+alink(J(a.center[0],a.center[1]),"地理院・圏域代表")+'</td></tr>'}).join("");
})();
