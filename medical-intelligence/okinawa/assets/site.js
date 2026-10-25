
(function(){"use strict";
var data=window.OKINAWA_AREAS;
var $=function(x){return document.getElementById(x)};var fmt=function(n){return n.toLocaleString("ja-JP")};var gs=function(s){return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(s+" 沖縄県")};var map=function(o){return "https://maps.gsi.go.jp/#11/"+o.lat+"/"+o.lon+"/"};
function renderBars(id,key,unit,divisor){var max=Math.max.apply(null,data.map(function(d){return d[key]}));$(id).innerHTML=data.map(function(d){return '<div class="barrow"><b>'+d.id+'</b><div class="track"><div class="fill" style="width:'+(100*d[key]/max)+'%;background:'+d.color+'"></div></div><b class="right">'+((d[key]/divisor).toLocaleString("ja-JP",{maximumFractionDigits:1}))+unit+'</b></div>'}).join("")}
renderBars("populationBars","pop","万人",10000);renderBars("bedBars","beds","床",1);
var total=14120;var vcols=["#1261a0","#1ba6b2","#e5b057","#986bc5","#aeb7c0"];
$("stackBars").innerHTML=data.map(function(d){return '<div class="stackrow"><b>'+d.id+'</b><div class="stack">'+d.values.map(function(x,i){return '<span style="width:'+(100*x/d.beds)+'%;background:'+vcols[i]+'" title="'+["高度急性期","急性期","回復期","慢性期","休棟等"][i]+': '+fmt(x)+'床"></span>'}).join("")+'</div><b class="right">'+fmt(d.beds)+'</b></div>'}).join("");
$("donutLegend").innerHTML=data.slice().sort(function(a,b){return b.beds-a.beds}).map(function(d){return '<span style="width:100%"><i class="swatch" style="background:'+d.color+'"></i>'+d.id+' '+(d.beds/total*100).toFixed(1)+'%</span>'}).join("");
$("areaStats").innerHTML=data.map(function(d){return '<tr><th>'+d.id+'</th><td class="right">'+fmt(d.pop)+'</td><td class="right">'+fmt(d.beds)+'</td>'+d.values.map(function(x){return '<td class="right">'+fmt(x)+'</td>'}).join("")+'</tr>'}).join("")+'<tr><th>合計</th><th class="right">1,467,480</th><th class="right">14,120</th><th class="right">1,455</th><th class="right">5,671</th><th class="right">2,814</th><th class="right">3,880</th><th class="right">300</th></tr>';
$("treemap").innerHTML=data.slice().sort(function(a,b){return b.beds-a.beds}).map(function(d){return '<div class="tree" style="flex:'+d.beds+';background:'+d.color+'" title="'+d.id+' '+fmt(d.beds)+'床">'+d.id+'<br>'+Math.round(d.beds/total*100)+'%</div>'}).join("");
(function(){var arr=data.slice().sort(function(a,b){return b.beds-a.beds}),max=arr[0].beds,run=0;var svg='<line x1="45" y1="268" x2="790" y2="268" stroke="#7f9db0" stroke-width="2"/>';var points=[];arr.forEach(function(d,i){var x=80+i*144,w=69,h=d.beds/max*183,y=268-h;run+=d.beds;var cy=264-(run/total)*188;svg+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+d.color+'" rx="3"/><text x="'+(x+w/2)+'" y="'+(y-9)+'" text-anchor="middle" font-size="16" fill="#1f3752">'+fmt(d.beds)+'</text><text x="'+(x+w/2)+'" y="293" text-anchor="middle" font-size="17" fill="#1f3752">'+d.id+'</text>';points.push((x+w/2)+','+cy);svg+='<circle cx="'+(x+w/2)+'" cy="'+cy+'" r="5" fill="#d4663f"/><text x="'+(x+w/2+8)+'" y="'+(cy-9)+'" font-size="12" fill="#9f4e27">'+(run/total*100).toFixed(1)+'%</text>'});svg+='<polyline points="'+points.join(" ")+'" stroke="#d4663f" stroke-width="3" fill="none"/>';svg+='<text x="45" y="23" font-size="15" fill="#617287">棒：病床数 / 線：累積構成比</text>';$("pareto").innerHTML=svg})();
var areaNames=["すべて","北部","中部","南部","宮古","八重山"];
$("areaPills").innerHTML=areaNames.map(function(s,i){return '<button class="pill" data-area="'+s+'" aria-pressed="'+(i===0)+'">'+s+'</button>'}).join("");
$("areaCards").innerHTML=data.map(function(d,i){return '<article class="card area-card" data-region="'+d.id+'"><div class="areaTitle"><span class="areaNum">'+(i+1)+'</span><h3>'+d.id+'医療圏</h3></div><div class="facts">人口2020：'+fmt(d.pop)+'人 ｜ 病床2025/7：'+fmt(d.beds)+'床</div><b>'+d.headline+'</b><ul>'+d.issues.map(function(z){return '<li>'+z+'</li>'}).join("")+'</ul><p><b>重点調査領域：</b>'+d.focus+'</p><p class="note">主な観察対象：'+d.places+'</p><div class="small-links"><a class="buttonLink secondary" target="_blank" rel="noopener" href="'+gs(d.id)+'">Googleマップ</a><a class="buttonLink secondary" target="_blank" rel="noopener" href="'+map(d)+'">地理院地図</a></div></article>'}).join("");
$("areaPills").addEventListener("click",function(e){var b=e.target.closest("button[data-area]");if(!b)return;var a=b.dataset.area;this.querySelectorAll("button").forEach(function(x){x.setAttribute("aria-pressed",String(x===b))});document.querySelectorAll(".area-card").forEach(function(el){el.classList.toggle("hide",a!=="すべて"&&el.dataset.region!==a)})});
var hospitals=[
["北部","沖縄県立北部病院","救急・統合準備と将来の機能移管","A","https://hokubuweb.hosp.pref.okinawa.jp/"],
["北部","北部地区医師会病院","地域急性期・健診、新センターへの統合","A","https://hokubuishikai.com/doctor/about-us/"],
["北部","公立沖縄北部医療センター（整備計画）","2028年度開院目標、施設整備の公式進捗","A","https://okinawahokubuiryo.jp/new-hospital-information"],
["中部","琉球大学病院","2025年1月に宜野湾市へ移転・高度先進医療","A","https://www.hosp.u-ryukyu.ac.jp/"],
["中部","沖縄県立中部病院","急性期・救急・研修機能","A","https://chubuweb.hosp.pref.okinawa.jp/"],
["中部","中部徳洲会病院","急性期・救急・地域連携","B","https://www.cyutoku.or.jp/"],
["中部","中頭病院","地域の急性期・周産期等","B","https://www.nakagami.or.jp/"],
["南部","那覇市立病院","救急・がん診療・新病院関連の公開情報","A","https://www.nahacity-hospital.jp/"],
["南部","沖縄県立南部医療センター・こども医療センター","周産期・小児・成人高度急性期","A","https://nanbuweb.hosp.pref.okinawa.jp/"],
["南部","友愛医療センター","救急・心血管等の高度医療","A","https://ymc.yuuai.or.jp/"],
["南部","浦添総合病院","救急・地域連携・画像診断","B","https://jin-aikai.com/urasoe/"],
["宮古","沖縄県立宮古病院","離島の急性期・地域搬送","A","https://miyakoweb.hosp.pref.okinawa.jp/"],
["宮古","宮古島徳洲会病院","急性期・在宅との接続","B","https://www.miyatoku.jp/"],
["八重山","沖縄県立八重山病院","離島中核・救急・医師確保","A","https://yaeyamaweb.hosp.pref.okinawa.jp/"],
["八重山","かりゆし病院","回復期・慢性期と地域連携","B","https://www.google.com/search?q="+encodeURIComponent("かりゆし病院 石垣 公式")]
];
$("hospitalRows").innerHTML=hospitals.map(function(x){return '<tr class="facrow" data-region="'+x[0]+'"><th>'+x[0]+'</th><td><a href="'+x[4]+'" target="_blank" rel="noopener">'+x[1]+'</a></td><td>'+x[2]+'</td><td><span class="label">'+x[3]+'</span></td><td><a href="'+gs(x[1])+'" target="_blank" rel="noopener">Googleマップ ↗</a></td></tr>'}).join("");
document.querySelectorAll("[data-hospital-filter]").forEach(function(b){b.addEventListener("click",function(){var t=this.dataset.hospitalFilter;document.querySelectorAll("[data-hospital-filter]").forEach(function(z){z.setAttribute("aria-pressed",String(z===b))});document.querySelectorAll(".facrow").forEach(function(r){r.classList.toggle("hide",t!=="all"&&r.dataset.region!==t)})})});
var heat=[[3,3,2,4,3,3],[4,4,4,4,3,4],[4,4,4,4,4,4],[3,2,2,4,3,3],[3,2,2,4,3,3]];
$("heatmap").innerHTML=heat.map(function(r,i){return '<tr><th>'+data[i].id+'</th>'+r.map(function(v){return '<td class="heat'+v+'">'+v+'</td>'}).join("")+'</tr>'}).join("");
var devices=[
["CT／MRI","急性期・画像診断センター","病床数だけでなく救急・脳卒中・がん診療、装置更新年、空調・搬入・保守体制を評価。"],
["血管撮影／IVR","循環器・脳血管・救急","診療実績・専門医・カテ室環境・ネットワーク・術中放射線安全を確認。"],
["超音波／POCUS","診療所・救急・在宅・周産期","診療科別に実施目的を切り分け、研修・装置共有・プローブ・保守を含める。"],
["XR／FPD","一般撮影・健診・病棟","患者動線・被ばく管理・モバイル運用・PACS連携・検診システムを検討。"],
["PACS／RIS／医療DX","全圏域横断","部門連携、遠隔読影、バックアップ、可用性・災害対応を検討。"],
["在宅／保守・リハビリ","高齢化・周辺離島","保守部品、患者向け装置、代替機、訪問診療、多職種連携を検討。"]
];
$("deviceCards").innerHTML=devices.map(function(x){return '<article class="card"><h3>'+x[0]+'</h3><div class="note"><b>'+x[1]+'</b></div><p>'+x[2]+'</p></article>'}).join("");
var sources=[
["S1 沖縄県 推計人口（2026年9月）","https://www.pref.okinawa.lg.jp/toukeika/estimates/estimates_suikei.html"],
["S2 沖縄県 第8次医療計画","https://www.pref.okinawa.lg.jp/iryokenko/iryo/1005807/1005824/1028660.html"],
["S3 沖縄県 病床機能報告・2025年7月病床","https://www.pref.okinawa.lg.jp/iryokenko/iryo/1005807/1005832.html"],
["S4 北部医療組合 新病院情報","https://okinawahokubuiryo.jp/new-hospital-information"],
["S5 沖縄県 2026年度医療提供体制協議会","https://www.pref.okinawa.lg.jp/iryokenko/iryo/1005280/1029225/1040738.html"],
["S6 2020年国勢調査人口（二次医療圏概況は提供の「医療需給総覧」2026版p.4と照合）","https://www.pref.okinawa.lg.jp/iryokenko/iryo/1005807/1005824/1028660.html"],
["S7 琉球大学病院 2025年西普天間移転","https://www.hosp.u-ryukyu.ac.jp/about/greeting.html"],
["S8 沖縄県 2024年医療施設調査","https://www.pref.okinawa.lg.jp/kensei/tokei/1016416/1016421/1022665/1039873/1039875.html"],
["S9 厚生労働省 病床機能報告オープンデータ","https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/open_data_00020.html"],
["S10 沖縄県医師会・地区医師会一覧","https://www.okinawa.med.or.jp/about/toiawase/"],
["S11 沖縄県産婦人科医会・医療機関一覧","https://okinawa-og.com/hospital-list/"],
["S12 琉球光和・事業情報","https://rkowa.com/business"],
["S13 沖縄メディコ・会社概要","https://okinawa-medico.com/company/"],
["S14 南西医療器・会社概要","https://www.swm-i.co.jp/company/"],
["S15 地理院地図","https://maps.gsi.go.jp/"],
["S16 厚生労働省 2040年に向けた地域医療構想","https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000080850_00019.html"]
];
$("sourceLinks").innerHTML='<h3>公式出典</h3>'+sources.map(function(s){return '<a target="_blank" rel="noopener" href="'+s[1]+'">'+s[0]+' ↗</a>'}).join("");
})();


(function(){
"use strict";
function el(id){return document.getElementById(id);}
const areas=window.OKINAWA_AREAS;
const geoFor=function(name){return areas.find(a=>a.id===name)||areas[2]};
const gmap=function(name,address){return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(name+" "+(address||"沖縄県"))};
const gsiArea=function(area){const v=geoFor(area);return "https://maps.gsi.go.jp/#15/"+v.lat+"/"+v.lon+"/"};
const people=[
["沖縄県医師会","南部","沖縄県南風原町字新川218-9","https://www.okinawa.med.or.jp/"],
["北部地区医師会","北部","名護市宇茂佐の森5-2-7 北部会館404号","https://www.okinawa.med.or.jp/about/toiawase/"],
["中部地区医師会","中部","北谷町字宮城1-584","https://www.chubu-ishikai.or.jp/cma_public/"],
["浦添市医師会","南部","浦添市伊祖3-3-1 アルマーレ101","https://www.uraishi.or.jp/"],
["那覇市医師会","南部","那覇市東町26-1","https://sv.nahashi.okinawa.med.or.jp/"],
["南部地区医師会","南部","八重瀬町字友寄891-1","https://www.nanbu.okinawa.med.or.jp/"],
["宮古地区医師会","宮古","宮古島市平良字東仲宗根807-5 2F","https://www.miyakotikuishikai.com/"],
["八重山地区医師会","八重山","石垣市字登野城548-4","https://www.yaeyamaishikai.org/"],
["国療沖縄公務員医師会","中部","宜野湾市我如古3-20-14","https://www.okinawa.med.or.jp/about/toiawase/"],
["琉球大学医師会（県医師会掲載所在地・移転後要確認）","中部","（移転後の住所は要確認）","https://www.okinawa.med.or.jp/about/toiawase/"],
["沖縄県公務員医師会","中部","うるま市宮里281 県立中部病院内","https://www.okinawa.med.or.jp/about/toiawase/"]
];
const gov=[
["沖縄県庁・医療政策課","南部","那覇市泉崎1-2-2","https://www.pref.okinawa.lg.jp/iryokenko/iryo/1005807/1005824/1028660.html",26.212445,127.680922],
["北部保健所","北部","名護市大中2-13-1","https://www.pref.okinawa.lg.jp/kensei/tokei/1016416/1016417.html"],
["中部保健所","中部","沖縄市美原1-6-28","https://www.pref.okinawa.lg.jp/kensei/tokei/1016416/1016417.html"],
["南部保健所","南部","南風原町宮平212","https://www.pref.okinawa.lg.jp/kensei/tokei/1016416/1016417.html"],
["那覇市保健所","南部","那覇市与儀1-3-21","https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/hokenjo/47okinawa.html"],
["宮古保健所","宮古","宮古島市平良字東仲宗根476","https://www.pref.okinawa.lg.jp/kensei/tokei/1016416/1016417.html"],
["八重山保健所","八重山","石垣市字真栄里438","https://www.pref.okinawa.lg.jp/kensei/tokei/1016416/1016417.html"]
];
function row(a){const gsi=(a.length>4?"https://maps.gsi.go.jp/#15/"+a[4]+"/"+a[5]+"/":gsiArea(a[1]));return '<div class="diritem"><strong><a href="'+a[3]+'" target="_blank" rel="noopener">'+a[0]+'</a></strong><div class="meta">'+a[2]+'　/ '+a[1]+'圏域</div><div class="inlineMap"><a href="'+gmap(a[0],a[2])+'" target="_blank" rel="noopener">Googleマップ</a><a href="'+gsi+'" target="_blank" rel="noopener">地理院地図'+(a.length>4?'（地点）':'（圏域中心参考）')+'</a></div></div>'}
if(el("doctorsDirectory"))el("doctorsDirectory").innerHTML=people.map(row).join("");
if(el("publicDirectory"))el("publicDirectory").innerHTML=gov.map(row).join("");
if(el("hospitalRows"))Array.from(el("hospitalRows").querySelectorAll("tr")).forEach(r=>{
 const col=r.querySelector("td:last-child");
 const a=r.dataset.region;
 if(col&&a){const v=geoFor(a);const b=document.createElement("a");b.href="https://maps.gsi.go.jp/#15/"+v.lat+"/"+v.lon+"/";b.target="_blank";b.rel="noopener";b.textContent="｜地理院地図（圏域中心）";col.appendChild(b)}
});
const sources=[
["N1 沖縄県・2025年国勢調査速報","https://www.pref.okinawa.lg.jp/toukeika/pc/2025/R07kokutyou.html"],
["N2 沖縄県・社人研2023年推計と高齢者保健計画","https://www.pref.okinawa.lg.jp/_res/projects/default_project/_page_/001/007/235/00_gaiyou.pdf"],
["N3 沖縄2024年高齢化率24.2%・人口推計二次集計","https://opengov.jp/population/estimates/okinawa/"],
["N4 鹿児島県・2024年高齢化率34.2%と全国29.3%","https://www.pref.kagoshima.jp/ab13/kenko-fukushi/koreisya/koreika/kagoshimakennnokoureisyanogennzyounituite.html"],
["N5 沖縄県・2025年人口移動報告年報","https://www.pref.okinawa.jp/toukeika/estimates/2025/annual/top.html"],
["N6 沖縄県・2025年12月医療提供体制協議会資料2（病床）","https://www.pref.okinawa.lg.jp/_res/projects/default_project/_page_/001/038/428/05siryo2-1.pdf"],
["N7 厚労省2026年医師偏在指標（沖縄県分二次集計）","https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/kinkyu/index.html"],
["N8 沖縄県・がん診療連携拠点病院2025年4月","https://www.pref.okinawa.jp/iryokenko/shippeikansensho/1005229/1006326.html"],
["N9 沖縄県医師会・地区医師会名簿","https://www.okinawa.med.or.jp/about/toiawase/"],
["N10 沖縄県・保健所住所と管轄","https://www.pref.okinawa.lg.jp/kensei/tokei/1016416/1016417.html"],
["N11 沖縄県・在宅医療連携拠点","https://www.pref.okinawa.jp/iryokenko/iryo/1005227/1029577/1036449.html"],
["N12 沖縄県・医療分地域医療介護総合確保基金","https://www.pref.okinawa.jp/iryokenko/iryo/1005807/1005824/1005830.html"],
["N13 沖縄県・2026年度医療提供体制協議会","https://www.pref.okinawa.jp/iryokenko/iryo/1005280/1029225/1040738.html"],
["N14 琉球大学病院位置・地理情報参考","https://mapfan.com/spots/SC3YH%2CJ%2CVR"]
];
if(el("sourceLinks"))el("sourceLinks").insertAdjacentHTML("beforeend","<h3>追加一次資料・二次集計の出典</h3>"+sources.map(s=>'<a href="'+s[1]+'" target="_blank" rel="noopener">'+s[0]+' ↗</a>').join(""));
const scores=[
["北部",3,3,5,5,3],["中部",5,5,3,5,4],["南部",5,5,2,4,5],["宮古",2,2,5,3,2],["八重山",2,2,5,3,2]
];
const weights=[30,25,20,15,10];
scores.forEach(x=>x.push(Math.round(x.slice(1).reduce((n,s,i)=>n+s*weights[i]/5,0))));
if(el("scoreTable"))el("scoreTable").querySelector("tbody").innerHTML=scores.map(r=>'<tr><th>'+r[0]+'</th>'+r.slice(1).map(s=>'<td>'+s+'</td>').join("")+'</tr>').join("");
if(el("mapDistrictButtons"))el("mapDistrictButtons").innerHTML=areas.map(v=>'<a class="buttonLink secondary" href="https://maps.gsi.go.jp/#11/'+v.lat+'/'+v.lon+'/" target="_blank" rel="noopener">'+v.id+' ↗</a>').join("");
function charts(){
 if(!window.Chart)return;
 Chart.defaults.font.family='"Meiryo UI","Meiryo",sans-serif';
 Chart.defaults.color="#38516c";
 const years=["2025","2030","2040","2050"];
 const base={responsive:true,maintainAspectRatio:true,plugins:{legend:{position:"bottom"}}};
 const c=(id,config)=>{const t=el(id);if(t)new Chart(t,config)};
 c("chartFuture",{type:"line",data:{labels:years,datasets:[
 {label:"総人口（万人・社人研）",data:[146.2068,145.8604,143.8171,139.1013],borderColor:"#1261a0",backgroundColor:"#1261a0",tension:.2,yAxisID:"y"},
 {label:"65歳以上（万人・社人研）",data:[36.2595,38.7167,44.2764,46.7696],borderColor:"#e6a341",backgroundColor:"#e6a341",tension:.2,yAxisID:"y"}
 ]},options:base});
 c("chartCompare",{type:"bar",data:{labels:["沖縄県","全国","鹿児島県"],datasets:[{label:"65歳以上割合（%・2024年）",data:[24.2,29.3,34.2],backgroundColor:["#16a3b3","#86b2cc","#e9a947"]}]},options:{...base,scales:{y:{beginAtZero:true,max:40}}}});
 c("chartBedsNeed",{type:"bar",data:{labels:["高度急性期","急性期","回復期","慢性期"],datasets:[{label:"2024実績",data:[1263,6144,2607,3229],backgroundColor:"#1261a0"},{label:"2025必要量（推計）",data:[1831,5428,4674,3348],backgroundColor:"#e9a947"}]},options:base});
 c("chartDoctor",{type:"bar",data:{labels:["北部","中部","南部","宮古","八重山"],datasets:[{label:"医師偏在指標（2026年公表）",data:[245,263.2,339.2,217.1,237.3],backgroundColor:["#1261a0","#16a3b3","#e9a947","#986bc5","#7b899b"]}]},options:base});
 c("chartScores",{type:"bar",data:{labels:scores.map(r=>r[0]),datasets:[{label:"独自優先度スコア（0〜100）",data:scores.map(r=>r[6]),backgroundColor:areas.map(r=>r.color)}]},options:{...base,scales:{y:{beginAtZero:true,max:100}}}});
}
charts();
try{
 if(window.L&&el("okMap")){
  const map=L.map("okMap",{scrollWheelZoom:false,zoomControl:true}).setView([25.70,126.75],7);
  L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",{attribution:'<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',maxZoom:17}).addTo(map);
  areas.forEach(d=>L.circleMarker([d.lat,d.lon],{radius:9,color:"#fff",weight:2,fillColor:d.color,fillOpacity:.9}).addTo(map).bindPopup('<b>'+d.id+'医療圏（代表地点）</b><div>2020年人口：'+d.pop.toLocaleString("ja-JP")+'人</div><div>2025年7月病床：'+d.beds.toLocaleString("ja-JP")+'床</div><div><a href="'+gsiArea(d.id)+'" target="_blank">地理院地図で見る</a></div>'));
 }
}catch(err){if(el("okMap"))el("okMap").textContent="地図の表示に失敗しました。右の地理院地図リンクをご利用ください。";}
})();
