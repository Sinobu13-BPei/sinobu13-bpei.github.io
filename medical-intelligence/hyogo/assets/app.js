"use strict";
const SOURCE={bed:"https://web.pref.hyogo.lg.jp/kf15/documents/3iryoukousou.pdf",doctor:"https://web.pref.hyogo.lg.jp/kk05/documents/r7kuniteian-zentaiban.pdf",population:"https://web.pref.hyogo.lg.jp/kk11/jinkou-tochitoukei/suikeijinnkou.html"};
const POI=[
["神戸大学医学部附属病院","神戸市中央区楠町7丁目5-2","大学・特定機能","神戸",34.691,135.175,"https://www.hosp.kobe-u.ac.jp/"],
["兵庫医科大学病院","西宮市武庫川町1-1","大学・特定機能","阪神",34.718,135.378,"https://www.hosp.hyo-med.ac.jp/"],
["県立西宮総合医療センター","西宮市津門大塚町11-62","救命救急・新病院","阪神",34.738,135.357,"https://nishinomiya-gmc.hyogo.jp/"],
["県立尼崎総合医療センター","尼崎市東難波町2-17-77","県立・急性期","阪神",34.732,135.417,"https://agmc.hyogo.jp/"],
["県立はりま姫路総合医療センター","姫路市神屋町3-264","県立・急性期","播磨姫路",34.832,134.710,"https://hgmc.hyogo.jp/"],
["県立加古川医療センター","加古川市神野町神野203","県立・急性期","東播磨",34.774,134.882,"https://www.kenkako.jp/"],
["県立丹波医療センター","丹波市氷上町石生2002-7","県立・地域拠点","丹波",35.166,135.021,"https://tmc.hyogo.jp/"],
["県立淡路医療センター","洲本市塩屋1-1-137","県立・島しょ救急","淡路",34.345,134.901,"https://www.awajimc.jp/"],
["公立豊岡病院","豊岡市戸牧1094","北部・救急","但馬",35.526,134.817,"https://www.toyookahp-kumiai.or.jp/"],
["北播磨総合医療センター","小野市市場町926-250","広域・急性期","北播磨",34.842,134.933,"https://www.kitahari-mc.jp/"],
["神戸市立医療センター中央市民病院","神戸市中央区港島南町2-1-1","救急・高度医療","神戸",34.664,135.211,"https://chuo.kcho.jp/"],
["兵庫県立がんセンター","明石市北王子町13-70","がん診療","東播磨",34.651,134.973,"https://hyogo-cc.jp/"],
["姫路赤十字病院","姫路市下手野1-12-1","赤十字・地域医療","播磨姫路",34.853,134.655,"https://himeji.jrc.or.jp/"],
["兵庫県庁","神戸市中央区下山手通5-10-1","行政","神戸",34.692,135.183,"https://web.pref.hyogo.lg.jp/"],
["兵庫県医師会","神戸市中央区磯上通6丁目1-11","医師会","神戸",34.695,135.200,"https://hyogo.med.or.jp/"],
["神戸市医師会","神戸市中央区橘通4-1-20","地域医師会","神戸",34.681,135.177,"https://www.kobe-med.or.jp/"],
["丹波健康福祉事務所","丹波市柏原町柏原688","保健所","丹波",35.126,135.078,"https://web.pref.hyogo.lg.jp/kf14/shokuhineigyou/kenkoufukushijimusho_address.html"]
];
function h(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function maplink(n,a){return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(n+" "+a)}
function gsilink(lat,lon){return "https://maps.gsi.go.jp/#15/"+lat+"/"+lon+"/&base=std&ls=std&disp=1"}
let R=[];
function score(r){const w=[30,25,20,15,10];return Math.round(r.axis.reduce((a,x,i)=>a+x*w[i]/5,0))}
function format(n){return Number(n).toLocaleString("ja-JP")}
function siteCard(p){const [n,addr,type,reg,lat,lon,url]=p;return '<article class="site-item"><strong>'+h(n)+'</strong><small>'+h(type)+' / '+h(reg)+'｜'+h(addr)+'</small><div class="links"><a target="_blank" rel="noopener noreferrer" href="'+h(url)+'">公式サイト</a><a target="_blank" rel="noopener noreferrer" href="'+maplink(n,addr)+'">Googleマップ</a><a target="_blank" rel="noopener noreferrer" title="自治体・施設周辺の概略地点" href="'+gsilink(lat,lon)+'">地理院地図（概略）</a></div></article>'}
function addChart(id,type,labels,datasets,opts){const node=document.getElementById(id);if(!node||typeof Chart==="undefined")return;new Chart(node,{type,data:{labels,datasets},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"},tooltip:{mode:"index",intersect:false}},scales:opts?.scales||{y:{beginAtZero:true}},...opts}})}
function initRegions(){
document.getElementById("regioncards").innerHTML=R.map(r=>'<article class="region" id="area-'+r.id+'"><h3>'+h(r.name)+' <span><span class="tag est">独自評価</span> '+score(r)+' /100</span></h3><div><span class="tag">中心：'+h(r.center)+'</span> <span class="tag">医師偏在指標 '+r.doctor+'</span></div><p><strong>需要ドライバー：</strong>'+h(r.drivers)+'</p><p><strong>課題：</strong>'+h(r.issues)+'</p><p><strong>主要施設：</strong>'+h(r.facilities)+'</p><p><strong>3〜5年の検討機会：</strong>'+h(r.chance)+'</p><div class="links"><a href="'+maplink(r.name+" 二次医療圏",r.center)+'" target="_blank" rel="noopener noreferrer">Googleマップ</a><a href="'+gsilink(r.lat,r.lon)+'" target="_blank" rel="noopener noreferrer">地理院地図（代表点）</a></div></article>').join("");
document.getElementById("bedrows").innerHTML=R.map(r=>'<tr><td><a href="#area-'+r.id+'">'+h(r.name)+'</a></td>'+r.bed.map(x=>'<td>'+format(x)+'</td>').join('')+'<td><strong>'+format(r.bed.reduce((a,b)=>a+b,0))+'</strong></td><td>'+format(r.reported.reduce((a,b)=>a+b,0))+'</td><td><span class="tag est">'+(r.bed[2]-r.reported[2]>0?'+':'')+format(r.bed[2]-r.reported[2])+'</span></td></tr>').join('');
document.getElementById("scorerows").innerHTML=R.map(r=>'<tr><td>'+h(r.name)+'</td>'+r.axis.map(n=>'<td>'+n+'/5</td>').join('')+'<td><strong>'+score(r)+'</strong></td></tr>').join('');}
function drawCharts(){const names=R.map(r=>r.name);
addChart("doctorChart","bar",names,[{label:"医師偏在指標",data:R.map(r=>r.doctor),backgroundColor:"#27859a"},{type:"line",label:"全国基準 266.8",data:R.map(()=>266.8),borderColor:"#b74354",backgroundColor:"#b74354",pointRadius:0,borderDash:[4,4]}],{scales:{y:{beginAtZero:true,title:{display:true,text:"医師偏在指標（単位なし）"}}}});
addChart("bedChart","bar",names,[{label:"2025年必要病床（推計）",data:R.map(r=>r.bed.reduce((a,b)=>a+b,0)),backgroundColor:"#16798b"},{label:"2021年病床機能報告",data:R.map(r=>r.reported.reduce((a,b)=>a+b,0)),backgroundColor:"#e2a75a"}]);
addChart("rehabChart","bar",names,[{label:"回復期・2025年必要病床（推計）",data:R.map(r=>r.bed[2]),backgroundColor:"#1a8194"},{label:"回復期・2021年報告",data:R.map(r=>r.reported[2]),backgroundColor:"#d69a57"}]);
addChart("scoreChart","bar",names,[{label:"重点度スコア（独自推計）",data:R.map(score),backgroundColor:"#198374"}],{indexAxis:"y",scales:{x:{min:0,max:100},y:{}}});
addChart("bedMixChart","doughnut",["高度急性期","急性期","回復期","慢性期"],[{label:"2025年必要病床",data:[5901,18257,16532,11765],backgroundColor:["#194c70","#2592ac","#3d9d7e","#e6ae62"]}],{scales:{},cutout:"53%"});
addChart("popChart","line",["2020実績","2026年9月実績","2050推計"],[{label:"県人口（万人・異なるデータ基準）",data:[546.5,529.2593,436],fill:true,backgroundColor:"#2e92a91c",borderColor:"#1a7f92",tension:.2}],{scales:{y:{min:400,max:560,title:{display:true,text:"万人"}}}});
}
function initMap(){const node=document.getElementById("medical-map");if(!node)return;if(typeof L==="undefined"){node.innerHTML='<p style="padding:30px">地図を読み込めませんでした。下のGoogleマップ・地理院地図リンクをご利用ください。</p>';return;}const map=L.map(node,{scrollWheelZoom:false}).setView([34.78,134.92],8);L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",{attribution:'地理院タイル © 国土地理院',maxZoom:18}).addTo(map);R.forEach(r=>{L.circleMarker([r.lat,r.lon],{radius:8,color:"#fff",weight:2,fillColor:"#0e6f81",fillOpacity:.9}).addTo(map).bindPopup('<strong>'+h(r.name)+'</strong><br>代表地点（医療圏境界ではありません）<br><a href="#area-'+r.id+'">医療圏分析へ</a>')});POI.slice(0,13).forEach(p=>{L.circleMarker([p[4],p[5]],{radius:4,color:"#cb8736",fillColor:"#edb562",fillOpacity:.8,weight:1}).addTo(map).bindPopup('<strong>'+h(p[0])+'</strong><br>概略位置。正確な場所は<a target="_blank" href="'+maplink(p[0],p[1])+'">Googleマップ</a>で検索')});}
async function init(){try{const res=await fetch("./data/regions.json");if(!res.ok)throw Error(res.status);const model=await res.json();R=model.regions;initRegions();drawCharts();initMap();document.getElementById("sites").innerHTML=POI.map(siteCard).join("");document.getElementById("sitefilter").addEventListener("change",e=>{const f=e.target.value;document.getElementById("sites").innerHTML=POI.filter(p=>f==="全件"||p[3]===f).map(siteCard).join("")});}catch(err){document.getElementById("regioncards").textContent="データの読み込みに失敗しました。ページを更新してください。";console.error(err)}}
document.addEventListener("DOMContentLoaded",init);