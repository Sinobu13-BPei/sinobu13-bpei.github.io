"use strict";
const $=(s)=>document.querySelector(s); const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Number(n).toLocaleString("ja-JP"); const gm=q=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(q);
const gsi=(lat,lon)=>"https://maps.gsi.go.jp/#15/"+lat+"/"+lon+"/";
const S={"mhlw":"https://www.mhlw.go.jp/toukei/saikin/hw/iryosd/24/dl/11gaikyou06.pdf","ipss":"https://www.ipss.go.jp/pp-shicyoson/j/shicyoson23/t-page.asp"};
const univs=[
["福岡","九州大学病院","福岡市東区馬出3丁目1番1号",33.6093,130.4148],
["福岡","福岡大学病院","福岡市城南区七隈7丁目45番1号",33.5478,130.3649],
["福岡","久留米大学病院","久留米市旭町67",33.3230,130.5077],
["福岡","産業医科大学病院","北九州市八幡西区医生ケ丘1番1号",33.8883,130.7040],
["佐賀","佐賀大学医学部附属病院","佐賀市鍋島5丁目1番1号",33.2770,130.2874],
["長崎","長崎大学病院","長崎市坂本1丁目7番1号",32.7737,129.8715],
["熊本","熊本大学病院","熊本市中央区本荘1丁目1番1号",32.7913,130.7132],
["大分","大分大学医学部附属病院","由布市挾間町医大ヶ丘1丁目1番地",33.2150,131.5320],
["宮崎","宮崎大学医学部附属病院","宮崎市清武町木原5200",31.8316,131.4151],
["鹿児島","鹿児島大学病院","鹿児島市桜ヶ丘8丁目35番1号",31.5508,130.5405]
];
function mapLinks(name,address,lat,lon){return '<span class="links"><a target="_blank" rel="noopener" href="'+gm(name+" "+address)+'">Googleマップ</a><a target="_blank" rel="noopener" href="'+gsi(lat,lon)+'" title="参考位置。現地所在地の精密測位を保証しません">地理院地図（参考位置）</a></span>'}
function table(hdr,rows){return '<div class="scroll"><table class="data-table"><thead><tr>'+hdr.map(x=>'<th scope="col">'+esc(x)+'</th>').join("")+'</tr></thead><tbody>'+rows.join("")+'</tbody></table></div>'}
let D=null;let charts=[];
function render(data){
 D=data;const prefs=data.prefectures;const tot=k=>prefs.reduce((a,p)=>a+p[k],0);
 $("#kpi-pop").textContent=fmt(tot("population_thousand")*1000);
 $("#kpi-hosp").textContent=fmt(tot("hospitals"));
 $("#kpi-clinic").textContent=fmt(tot("clinics"));
 $("#kpi-beds").textContent=fmt(tot("beds"));
 $("#region-count").textContent=data.regions.length;
 $("#pref-table").innerHTML=table(["県","人口（千人）","病院","一般診療所","病院病床","病院/10万人","診療所/10万人","第8次医療計画","県別分析"],prefs.map(p=>'<tr><th scope="row">'+esc(p.name)+'</th><td class="number">'+fmt(p.population_thousand)+'</td><td class="number">'+fmt(p.hospitals)+'</td><td class="number">'+fmt(p.clinics)+'</td><td class="number">'+fmt(p.beds)+'</td><td class="number">'+(p.hospitals/p.population_thousand*100).toFixed(1)+'</td><td class="number">'+(p.clinics/p.population_thousand*100).toFixed(1)+'</td><td><a target="_blank" rel="noopener" href="'+p.plan+'">県庁原典</a></td><td><a href="../'+p.slug+'/">詳細へ</a></td></tr>'));
 $("#univ-table").innerHTML=table(["県","大学附属病院（医学部）","住所","所在地確認"],univs.map(u=>'<tr><td>'+esc(u[0])+'</td><th scope="row">'+esc(u[1])+'</th><td>'+esc(u[2])+'</td><td>'+mapLinks(u[1],u[2],u[3],u[4])+'</td></tr>'));
 $("#assoc-table").innerHTML=table(["県","都道府県医師会","郡市医師会","医師会別診療所数","地図"],prefs.map(p=>'<tr><th scope="row">'+esc(p.name)+'</th><td><a target="_blank" rel="noopener" href="'+p.association+'">'+esc(p.name)+'県医師会</a></td><td><a target="_blank" rel="noopener" href="'+({"佐賀":"https://www.saga.med.or.jp/residents/gunshi/gunshi_list.html","大分":"https://www.oita.med.or.jp/common/%E7%9C%8C%E5%86%85%E3%81%AE%E9%83%A1%E5%B8%82%E5%8C%BB%E5%B8%AB%E4%BC%9A/","鹿児島":"https://www.kagoshima.med.or.jp/gaiyou/","長崎":"https://po.nagasaki.med.or.jp/citizen/about/"}[p.name]||p.association)+'">所属郡市医師会の確認</a></td><td>未掲載（圏域単位と医師会管轄が一致しないため）</td><td>'+mapLinks(p.name+"県医師会",p.name+"県",p.lat,p.lon)+'</td></tr>'));
 const filter=$("#pref-filter"),search=$("#region-search");
 filter.innerHTML='<option value="">九州全県</option>'+prefs.map(p=>'<option value="'+p.name+'">'+p.name+'県</option>').join("");
 const hubs=/福岡・糸島|北九州|久留米|熊本・上益城|鹿児島$|長崎$|中部$|宮崎東諸県|佐世保県北/;
 const norm=(v,max)=>Math.round(v/max*30);
 const rank=data.regions.map(r=>({...r,score:norm(r.clinics_reference,1682)+norm(r.hospitals_reference,122)+(hubs.test(r.name)?20:0)+(r.is_remote?20:0)})).sort((a,b)=>b.score-a.score);
 const renderRegions=()=>{
   const s=search.value.toLowerCase().trim();
   const selected=rank.filter(r=>(!filter.value||r.prefecture===filter.value)&&(!s||(r.prefecture+r.name).toLowerCase().includes(s)));
   $("#region-total").textContent=fmt(selected.length)+"圏域";
   $("#area-table").innerHTML=table(["県","二次医療圏","病院数（参考）","診療所数（参考）","分析スコア（試算）","着眼点","関連地図"],selected.map(r=>'<tr><td>'+esc(r.prefecture)+'</td><th scope="row">'+esc(r.name)+'</th><td class="number">'+fmt(r.hospitals_reference)+'</td><td class="number">'+fmt(r.clinics_reference)+'</td><td><div class="bar"><b>'+r.score+'</b><span class="bar-meter"><i style="width:'+Math.min(100,r.score)+'%"></i></span></div></td><td>'+((r.is_remote?"遠隔・保守・代替輸送":hubs.test(r.name)?"拠点病院・専門診療":"病診連携・更新需要") )+'</td><td><a target="_blank" rel="noopener" href="'+gm(r.prefecture+"県 "+r.name+" 二次医療圏")+'">Google</a></td></tr>'));
 }
 filter.addEventListener("change",renderRegions);search.addEventListener("input",renderRegions); renderRegions();
 $("#sources-dynamic").innerHTML=table(["区分","出典・データ年","原典"],[...data.sources,...prefs.map(p=>({title:p.name+"県 第8次医療計画",year:"2024～",url:p.plan}))].map((s,i)=>'<tr><td>'+String(i+1).padStart(2,"0")+'</td><td>'+esc(s.title)+'（'+esc(s.year)+'）</td><td class="breakword"><a target="_blank" rel="noopener" href="'+s.url+'">'+esc(s.url)+'</a></td></tr>'));
 makeCharts(prefs);makeMap(prefs);
}
function makeCharts(prefs){
 if(!window.Chart){document.querySelectorAll(".chartbox").forEach(el=>el.innerHTML='<p class="small">グラフ表示ライブラリ未読込。上の比較表には同じ数値を掲載しています。</p>');return}
 const labels=prefs.map(p=>p.name);Chart.defaults.font.family='Noto Sans JP, Meiryo, sans-serif';Chart.defaults.color='#33495d';
 const base={responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}},scales:{y:{beginAtZero:true,grid:{color:"#e8edf2"}},x:{grid:{display:false}}}};
 function plot(id,type,datasets,options=base){const ctx=document.getElementById(id);if(ctx){charts.push(new Chart(ctx,{type,data:{labels,datasets},options}));}}
 plot("chart-hosp","bar",[{label:"病院数",data:prefs.map(x=>x.hospitals),backgroundColor:"#166d84"}]);
 plot("chart-clinic","bar",[{label:"一般診療所数",data:prefs.map(x=>x.clinics),backgroundColor:"#32929b"}]);
 plot("chart-dens","bar",[{label:"病院/10万人",data:prefs.map(x=>+(x.hospitals/x.population_thousand*100).toFixed(1)),backgroundColor:"#116482"},{label:"診療所/10万人",data:prefs.map(x=>+(x.clinics/x.population_thousand*100).toFixed(1)),backgroundColor:"#45a3aa"}]);
 plot("chart-bed","bar",[{label:"病院病床/10万人",data:prefs.map(x=>+(x.beds/x.population_thousand*100).toFixed(0)),backgroundColor:"#1b7e86"}]);
}
function makeMap(prefs){const el=$("#map");if(!window.L){el.innerHTML='<div class="map-fallback">地図ライブラリが読み込めません。比較表の県名から公的ページを閲覧できます。</div>';return;}
 const m=L.map(el,{scrollWheelZoom:false}).setView([32.83,130.58],7);
 L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",{attribution:'<a href="https://maps.gsi.go.jp/" target="_blank" rel="noopener">地理院タイル</a>',maxZoom:18}).addTo(m);
 prefs.forEach(p=>L.circleMarker([p.lat,p.lon],{radius:8,color:"#fff",weight:2,fillColor:"#087f86",fillOpacity:1}).addTo(m).bindPopup('<b>'+esc(p.name)+'県</b><p>県庁所在地の概略位置（施設位置ではありません）</p><a href="'+p.plan+'" target="_blank" rel="noopener">第8次医療計画</a> / <a href="'+gm(p.name+"県庁")+'" target="_blank" rel="noopener">Google</a> / <a href="'+gsi(p.lat,p.lon)+'" target="_blank" rel="noopener">地理院</a>'));
}
fetch("./data/regions.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(render).catch(e=>{const x=$("#data-status");if(x)x.textContent="データ読込に失敗しました。再読込するか、ページ内の出典リンクを確認してください。";console.error(e);});
