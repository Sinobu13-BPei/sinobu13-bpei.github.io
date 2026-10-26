"use strict";
const $=(s)=>document.querySelector(s), fmt=n=>Number(n).toLocaleString("ja-JP");
const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ext=(u,label)=>'<a target="_blank" rel="noopener noreferrer" href="'+encodeURI(u).replace(/"/g,"%22")+'">'+safe(label)+'</a>';
function mapUrls(x){const search="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(x.name+" "+x.address);const gsi="https://maps.gsi.go.jp/#14/"+x.lat+"/"+x.lon+"/";return '<div class="maplinks">'+ext(search,"Googleマップ")+ext(gsi,"地理院地図")+ext(x.url,"公式情報")+'</div>';}
function getScore(a,d){return a.score.reduce((t,v,i)=>t+(v/5)*d.scores.weights[i],0);}
function render(d){
const weights=d.scores.weights;
$("#areaTable tbody").innerHTML=d.areas.map(a=>'<tr><td><b>'+safe(a.name)+'</b><small style="display:block">'+safe(a.cities)+'</small></td><td>'+safe(a.populationContext)+'</td><td>'+safe(a.challenge)+'</td><td>'+safe(a.opportunity)+'</td><td>'+safe(a.focus)+'</td><td><span class="score-pill">'+getScore(a,d).toFixed(0)+'/100</span><small style="display:block">独自仮説</small></td></tr>').join("");
$("#bedsTable tbody").innerHTML=d.areas.map(a=>'<tr><td>'+safe(a.name)+'</td>'+a.beds.map(n=>'<td>'+fmt(n)+'</td>').join('')+'<td><b>'+fmt(a.beds.reduce((x,y)=>x+y,0))+'</b></td><td>'+fmt(a.needed.reduce((x,y)=>x+y,0))+'</td></tr>').join('')+'<tr><td><b>県合計</b></td>'+["high","acute","recovery","chronic","inactive"].map(k=>'<td><b>'+fmt(d.beds2025[k])+'</b></td>').join('')+'<td><b>'+fmt(d.beds2025.total)+'</b></td><td><b>'+fmt(d.needed.total)+'</b></td></tr>';
$("#facilityTable tbody").innerHTML=d.facilities.map(x=>'<tr><td><b>'+safe(x.name)+'</b></td><td>'+safe(x.kind)+'<br><small>'+safe(x.area)+'</small></td><td>'+safe(x.address)+'</td><td>'+mapUrls(x)+'</td></tr>').join("");
$("#associations").innerHTML=d.associations.map(([n,u])=>ext(u,n)).join("");
$("#sourcesList").innerHTML=d.sources.map(([id,title,year,url])=>'<div class="source"><span class="tag">['+safe(id)+']</span> '+ext(url,title)+'<small>データ年次：'+safe(year)+'</small></div>').join("");
$("#scoreFactors").innerHTML=d.scores.labels.map((name,i)=>'<p><b>'+safe(name)+'</b>　'+weights[i]+'%</p>').join("");
if(window.Chart){const font={family:"system-ui, sans-serif",size:11},opt={responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{font}}},scales:{y:{beginAtZero:true}}};let common=(ctx,type,data,options=opt)=>new Chart(ctx,{type,data,options});
common($("#populationChart"),"bar",{labels:["2020国勢調査","2025国勢速報","2026年9月推計","2030将来推計","2050将来推計"],datasets:[{label:"人口（千人）",data:[d.population.actual2020,d.population.censusPrelim2025,d.population.estimatedSep2026,d.population.projected2030,d.population.projected2050].map(x=>x/1000),backgroundColor:["#296987","#298591","#328b98","#daa457","#daa457"],borderRadius:5}]});
common($("#agingChart"),"bar",{labels:["2020","2050推計"],datasets:[{label:"大分県",data:[d.population.elderly2020,d.population.elderly2050],backgroundColor:"#157b8c"},{label:"全国",data:[d.population.nationalElderly2020,d.population.nationalElderly2050],backgroundColor:"#9bb9c5"}]},opt);
common($("#bedsChart"),"bar",{labels:d.areas.map(a=>a.name),datasets:["高度急性期","急性期","回復期","慢性期","休棟等"].map((label,k)=>({label,data:d.areas.map(a=>a.beds[k]),backgroundColor:["#174f79","#4c96b2","#24a39e","#eab66d","#a1aeba"][k]}))},{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{font}}},scales:{x:{stacked:true},y:{stacked:true,beginAtZero:true}}});
common($("#gapChart"),"bar",{labels:["高度急性期","急性期","回復期","慢性期"],datasets:[{label:"2025年必要量（推計）",data:[d.needed.high,d.needed.acute,d.needed.recovery,d.needed.chronic],backgroundColor:"#b4cbd8"},{label:"2025年7月報告",data:[d.beds2025.high,d.beds2025.acute,d.beds2025.recovery,d.beds2025.chronic],backgroundColor:"#137a91"}]},opt);
common($("#scoreChart"),"bar",{labels:d.areas.map(a=>a.name),datasets:[{label:"独自優先度スコア（100点）",data:d.areas.map(a=>getScore(a,d)),backgroundColor:"#168e98",borderRadius:5}]},{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,max:100}}});
}else{document.querySelectorAll(".chart").forEach(e=>e.insertAdjacentHTML("beforeend",'<p role="status">グラフ配信を読み込めません。数値は表にも掲載しています。</p>'));}
if(window.L){const map=L.map("map",{scrollWheelZoom:false}).setView([33.17,131.48],8);
L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",{attribution:'地理院タイル（国土地理院）',maxZoom:18}).addTo(map);
d.facilities.forEach(x=>L.circleMarker([x.lat,x.lon],{radius:x.kind==="保健所"?5:7,color:"#0c647e",weight:2,fillColor:x.kind==="保健所"?"#ffda83":"#5bbeb5",fillOpacity:.9}).addTo(map).bindPopup("<b>"+safe(x.name)+"</b><br>"+safe(x.address)+"<br>"+mapUrls(x))); setTimeout(()=>map.invalidateSize(),100);
}else{const el=$("#map");el.querySelector(".map-fallback").textContent="地図ライブラリが利用できません。施設一覧の地図リンクをご利用ください。";}
}
$("#menuToggle").addEventListener("click",()=>{const nav=$("#navigation");let open=nav.classList.toggle("open");$("#menuToggle").setAttribute("aria-expanded",String(open));});
$("#navigation").addEventListener("click",e=>{if(e.target.closest("a")){$("#navigation").classList.remove("open");$("#menuToggle").setAttribute("aria-expanded","false");}});
fetch("./data/data.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(render).catch(err=>{console.error("Data unavailable",err);const p=document.createElement("p");p.setAttribute("role","alert");p.textContent="地域別データが読み込めません。最新データは大分県公式ページと出典一覧をご利用ください。";$("#areaTable").before(p);});
