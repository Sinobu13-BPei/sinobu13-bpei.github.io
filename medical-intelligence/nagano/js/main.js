
(function(){
"use strict";
var areas=[
["佐久","東信",200454,180353,33.2,13,628,22,36.25,138.48],
["上小","東信",185834,166815,32.4,14,379,18,36.40,138.25],
["諏訪","南信",183946,160523,34.2,11,503,38,36.04,138.12],
["上伊那","南信",172253,152409,32.4,9,317,26,35.84,137.96],
["飯伊","南信",144354,125437,35.3,9,321,42,35.52,137.84],
["木曽","中信",22377,16509,44.8,1,45,3,35.84,137.70],
["松本","中信",410887,381639,30.1,26,1507,63,36.24,137.97],
["大北","中信",53241,41915,37.7,2,125,8,36.50,137.85],
["長野","北信",508963,456765,32.0,32,1284,53,36.65,138.18],
["北信","北信",76040,61018,38.3,3,209,7,36.76,138.38]
];
var locations=[
["信州大学医学部附属病院","松本","松本市",36.252,137.974,"大学病院／高度診療／医学教育","https://wwwhp.md.shinshu-u.ac.jp/"],
["相澤病院","松本","松本市",36.225,137.98,"急性期・広域連携の重要病院","https://aizawahospital.jp/"],
["まつもと医療センター","松本","松本市",36.204,137.961,"地域診療・紹介連携","https://mmccenta.jp/"],
["安曇野赤十字病院","松本","安曇野市",36.303,137.906,"地域急性期・救急","https://www.azumino.jrc.or.jp/"],
["長野県立こども病院","松本","安曇野市",36.327,137.894,"小児・周産期専門","https://nagano-child.jp/"],
["松本協立病院","松本","松本市",36.236,137.972,"地域外来・入院","https://www.chushin-miniren.gr.jp/"],
["丸の内病院","松本","松本市",36.26,137.967,"地域急性期・専門診療","https://www.marunouchi.or.jp/"],
["松本市立病院","松本","松本市",36.215,137.914,"市立病院・地域医療","https://www.mt-hsp.jp/"],
["長野赤十字病院","長野","長野市",36.627,138.193,"急性期・救急・広域医療","https://www.nagano-med.jrc.or.jp/"],
["長野市民病院","長野","長野市",36.676,138.224,"がん・地域急性期","https://www.hospital.nagano.nagano.jp/"],
["篠ノ井総合病院","長野","長野市",36.574,138.138,"地域中核","https://shinonoi-ghp.jp/"],
["長野松代総合病院","長野","長野市",36.559,138.201,"地域中核","https://www.nagano-matsushiro.or.jp/"],
["佐久医療センター","佐久","佐久市",36.226,138.482,"高度急性期・東信の拠点","https://www.sakuhp.or.jp/center/"],
["佐久総合病院","佐久","佐久市",36.171,138.483,"地域医療・総合診療","https://www.sakuhp.or.jp/"],
["浅間南麓こもろ医療センター","佐久","小諸市",36.324,138.421,"東信地域急性期","https://komoro-mc.com/"],
["浅間総合病院","佐久","佐久市",36.272,138.467,"市立・地域病院","https://www.asamaghp.jp/"],
["信州上田医療センター","上小","上田市",36.401,138.248,"上小地域の急性期","https://shinshuueda.hosp.go.jp/"],
["丸子中央病院","上小","上田市",36.347,138.284,"地域外来・入院","https://maruko-hp.jp/"],
["諏訪赤十字病院","諏訪","諏訪市",36.034,138.111,"南信・急性期重要病院","https://www.suwa.jrc.or.jp/"],
["諏訪中央病院","諏訪","茅野市",35.993,138.174,"在宅・地域連携","https://www.suwachuo.jp/"],
["岡谷市民病院","諏訪","岡谷市",36.069,138.052,"諏訪圏地域中核","https://www.okaya-hosp.jp/"],
["伊那中央病院","上伊那","伊那市",35.842,137.957,"上伊那の中核","https://www.inahp.jp/"],
["昭和伊南総合病院","上伊那","駒ヶ根市",35.723,137.932,"上伊那南部地域","https://sihp.jp/"],
["飯田市立病院","飯伊","飯田市",35.509,137.82,"南信州中核・急性期","https://imh.jp/"],
["長野県立阿南病院","飯伊","阿南町",35.321,137.816,"南信州山間地域医療","https://anan-hosp.jp/"],
["長野県立木曽病院","木曽","木曽町",35.847,137.697,"木曽地域中核","https://kiso-hosp.jp/"],
["市立大町総合病院","大北","大町市",36.501,137.853,"大北の地域中核","https://www.omachi-hospital.jp/"],
["北アルプス医療センターあづみ病院","大北","池田町",36.422,137.879,"大北・安曇野連携","https://www.azumi-ghp.jp/"],
["北信総合病院","北信","中野市",36.743,138.367,"北信地域中核","https://www.hokushin-hosp.jp/"],
["飯山赤十字病院","北信","飯山市",36.852,138.365,"北信北部の急性期","https://www.iiyama.jrc.or.jp/"]
];
function fmt(n){return Math.round(n).toLocaleString("ja-JP")}function mapurl(n){return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(n+" 長野県")}function gsiurl(lat,lng){return "https://maps.gsi.go.jp/#13/"+lat.toFixed(4)+"/"+lng.toFixed(4)+"/&base=std&ls=std&disp=1";}
function safe(s){var t=document.createElement("span");t.textContent=s;return t.innerHTML;}
var active="すべて";

function drawScatter(subset){
var svg=document.getElementById("scatterChart");if(!svg)return;
var NS="http://www.w3.org/2000/svg";while(svg.firstChild)svg.removeChild(svg.firstChild);
function add(tag,attrs,txt,parent){var e=document.createElementNS(NS,tag);Object.keys(attrs).forEach(function(k){e.setAttribute(k,attrs[k])});if(txt!==null)e.textContent=txt;(parent||svg).appendChild(e);return e}
var minAge=28,maxAge=47,minDoc=50,maxDoc=400;
var left=67,right=712,top=25,bottom=302;
var x=function(v){return left+(v-minAge)/(maxAge-minAge)*(right-left)};
var y=function(v){return bottom-(v-minDoc)/(maxDoc-minDoc)*(bottom-top)};
for(var age=30;age<=45;age+=5){add("line",{x1:x(age),y1:top,x2:x(age),y2:bottom,stroke:"#e0e9f3","stroke-dasharray":"4 5"},null);add("text",{x:x(age),y:bottom+19,"text-anchor":"middle",fill:"#6f8195","font-size":11},age+"%",null);}
for(var docs=100;docs<=400;docs+=100){add("line",{x1:left,y1:y(docs),x2:right,y2:y(docs),stroke:"#e0e9f3","stroke-dasharray":"4 5"},null);add("text",{x:left-11,y:y(docs)+3,"text-anchor":"end",fill:"#6f8195","font-size":11},String(docs),null);}
add("text",{x:(left+right)/2,y:346,"text-anchor":"middle",fill:"#365777","font-size":13,"font-weight":750},"高齢化率（65歳以上）",null);
add("text",{x:14,y:160,transform:"rotate(-90 14 160)","text-anchor":"middle",fill:"#365777","font-size":12},"医師数 / 10万人",null);
var cols={"北信":"#2361a1","東信":"#43a39b","中信":"#d99e52","南信":"#c96972"};
var l={};
subset.forEach(function(a){var xx=x(a[4]), yy=y(a[6]/a[2]*100000);var rr=5+Math.sqrt(a[2]/510000)*14;var c=add("circle",{cx:xx,cy:yy,r:rr,fill:cols[a[1]],"fill-opacity":".73",stroke:"#fff","stroke-width":2,tabindex:0,role:"button","aria-label":a[0]+" 高齢化率"+a[4]+"%、人口10万人あたり医師"+Math.round(a[6]/a[2]*100000)+"人"},null);var inf=a[0]+"医療圏｜2026年人口 "+fmt(a[2])+"人｜高齢化率 "+a[4]+"%｜医師 "+Math.round(a[6]/a[2]*100000)+"人/10万人";
function choose(){document.getElementById("scatterInfo").textContent=inf;}
c.addEventListener("click",choose);c.addEventListener("focus",choose);c.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();choose()}});
l[a[0]]=true;
var name=add("text",{x:xx+rr+3,y:yy-2,fill:"#25455e","font-size":11,"font-weight":850},a[0],null);
});
add("text",{x:706,y:17,"text-anchor":"end",fill:"#8192a4","font-size":10},"丸の大きさ＝人口",null);
}
function drawBlockPopulation(){
var c=document.getElementById("blockPopulation");if(!c)return;
var bnames=["北信","東信","中信","南信"], col={"北信":"#2361a1","東信":"#43a39b","中信":"#d99e52","南信":"#c96972"};
var groups=bnames.map(function(name){var items=areas.filter(function(a){return a[1]===name});return {name:name,cur:items.reduce(function(t,a){return t+a[2]},0),next:items.reduce(function(t,a){return t+a[3]},0)}});
var maxi=Math.max.apply(null,groups.map(function(z){return z.cur}));
c.innerHTML=groups.map(function(g){return '<div class="blockLine"><strong>'+g.name+'</strong><div class="lines"><i style="width:'+(g.cur/maxi*100).toFixed(1)+'%;--c:'+col[g.name]+'"></i><i class="next" style="width:'+(g.next/maxi*100).toFixed(1)+'%;--c:'+col[g.name]+'"></i></div><span class="n">'+(g.cur/10000).toFixed(1)+'万 → '+(g.next/10000).toFixed(1)+'万</span></div>'}).join("");
}

function renderAreas(){
var subset=areas.filter(function(x){return active==="すべて"||x[1]===active});
var max=Math.max.apply(null,areas.map(function(x){return x[2]}));
document.getElementById("areaBars").innerHTML=subset.slice().sort(function(a,b){return b[2]-a[2]}).map(function(x){
return '<div class="compRow"><strong>'+x[0]+'</strong><div class="compTracks">'+
'<div class="btrack"><span class="bval" style="width:'+(x[2]/max*100).toFixed(2)+'%"></span></div>'+
'<div class="btrack"><span class="bval future" style="width:'+(x[3]/max*100).toFixed(2)+'%"></span></div></div>'+
'<div class="compValues"><span>26年 '+fmt(x[2])+'</span><span>40年 '+fmt(x[3])+'</span></div></div>';
}).join("");
document.getElementById("ageBars").innerHTML=subset.slice().sort(function(a,b){return b[4]-a[4]}).map(function(x){return '<div class="brow"><b>'+x[0]+'</b><div class="btrack"><span class="bval gold" style="width:'+(x[4]/50*100)+'%"></span></div><b class="num">'+x[4].toFixed(1)+'%</b></div>'}).join("");
document.getElementById("areaTable").innerHTML=subset.map(function(x){return '<tr><td><b>'+x[0]+'</b></td><td>'+x[1]+'</td><td class="num">'+fmt(x[2])+'</td><td class="num">'+fmt(x[3])+'</td><td class="num">'+((x[3]/x[2]-1)*100).toFixed(1)+'%</td><td class="num">'+x[4].toFixed(1)+'%</td><td class="num">'+x[5]+'</td><td class="num">'+fmt(x[6])+'</td><td class="num">'+x[7]+'</td></tr>'}).join("");
drawScatter(subset);
}
document.querySelectorAll("#areaTabs button").forEach(function(btn){btn.addEventListener("click",function(){active=btn.dataset.block;document.querySelectorAll("#areaTabs button").forEach(function(x){x.classList.toggle("active",x===btn)});renderAreas()})});renderAreas();drawBlockPopulation();
document.getElementById("doctorBars").innerHTML=areas.slice().sort(function(a,b){return b[6]/b[2]-a[6]/a[2]}).map(function(x){return '<div class="brow"><b>'+x[0]+'</b><div class="btrack"><span class="bval" style="width:'+(x[6]/x[2]*100000/400*100)+'%"></span></div><b class="num">'+Math.round(x[6]/x[2]*100000)+'</b></div>'}).join("");
var t26=1959494,t40=1743383;document.getElementById("totalBars").innerHTML='<div class="brow"><b>2026年</b><div class="btrack"><span class="bval" style="width:100%"></span></div><b class="num">195.9万</b></div><div class="brow"><b>2040年</b><div class="btrack"><span class="bval gold" style="width:'+(t40/t26*100)+'%"></span></div><b class="num">174.3万</b></div>';
var select=document.getElementById("areaSelect");areas.forEach(function(a){select.innerHTML+='<option value="'+a[0]+'">'+a[0]+'</option>'});
function cards(){
var q=document.getElementById("q").value.trim().toLowerCase(),a=select.value;
var dat=locations.filter(function(x){return (!a||x[1]===a)&&(!q||(x[0]+" "+x[1]+" "+x[2]+" "+x[5]).toLowerCase().includes(q))});
document.getElementById("hits").textContent=dat.length+"件 / "+locations.length+"施設";
document.getElementById("facilityGrid").innerHTML=dat.map(function(x){return '<article class="fcard"><h4>🏥 <a class="hospitalOfficial" href="'+x[6]+'" target="_blank" rel="noopener noreferrer" title="公式ホームページを開く">'+safe(x[0])+' <span aria-hidden="true">↗</span></a></h4><div class="sub"><span class="pill">'+x[1]+'医療圏</span>　'+x[2]+'</div><div style="font-size:12px;color:#516b80;margin-bottom:10px">'+x[5]+'</div><div class="links"><a class="officialAction" href="'+x[6]+'" target="_blank" rel="noopener noreferrer">🏥 公式ホームページ ↗</a><a href="'+mapurl(x[0])+'" target="_blank" rel="noopener">📍 Googleマップ ↗</a><a href="'+gsiurl(x[3],x[4])+'" target="_blank" rel="noopener">⛰ 地理院地図 ↗</a></div></article>'}).join("")||'<p>該当する施設はありません。</p>';
}
document.getElementById("q").addEventListener("input",cards);select.addEventListener("change",cards);cards();
var menuBtn=document.getElementById("mobileNavToggle"),navRoot=document.querySelector(".navwrap");
if(menuBtn&&navRoot){
menuBtn.addEventListener("click",function(){var open=navRoot.classList.toggle("open");menuBtn.setAttribute("aria-expanded",String(open));document.getElementById("navToggleSymbol").textContent=open?"−":"＋";});
navRoot.querySelectorAll(".navscroll a").forEach(function(a){a.addEventListener("click",function(){navRoot.classList.remove("open");menuBtn.setAttribute("aria-expanded","false");document.getElementById("navToggleSymbol").textContent="＋";})});
}

var m=document.getElementById("map");
if(typeof L!=="undefined"){
var mp=L.map("map",{scrollWheelZoom:false}).setView([36.15,138.01],8);
var gsiAttr='<a href="https://maps.gsi.go.jp/" target="_blank">地理院タイル</a> © 国土地理院';
var standardLayer=L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",{maxZoom:17,attribution:gsiAttr}).addTo(mp);
var paleLayer=L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",{maxZoom:17,attribution:gsiAttr});
var regionLayer=L.layerGroup();
areas.forEach(function(a){L.circleMarker([a[8],a[9]],{radius:6+Math.sqrt(a[2]/510000)*35,color:"#a34d4b",weight:2,fillColor:"#efb76a",fillOpacity:.26})
.bindPopup("<b>"+a[0]+"医療圏</b><br>人口 "+fmt(a[2])+"人（2026年）<br>高齢化率 "+a[4]+"%<br>概略中心点").addTo(regionLayer);});
var standardButton=document.getElementById("mapStandard"),paleButton=document.getElementById("mapPale"),bubbleButton=document.getElementById("mapBubble");
function setTile(mode){if(mode==="pale"){mp.removeLayer(standardLayer);paleLayer.addTo(mp)}else{mp.removeLayer(paleLayer);standardLayer.addTo(mp)}standardButton.setAttribute("aria-pressed",String(mode!=="pale"));paleButton.setAttribute("aria-pressed",String(mode==="pale"));}
standardButton.addEventListener("click",function(){setTile("std")});paleButton.addEventListener("click",function(){setTile("pale")});
bubbleButton.addEventListener("click",function(){var on=bubbleButton.getAttribute("aria-pressed")==="true";if(on){mp.removeLayer(regionLayer)}else{regionLayer.addTo(mp)}bubbleButton.setAttribute("aria-pressed",String(!on));});

var icons={};locations.forEach(function(x){var marker=L.circleMarker([x[3],x[4]],{radius:7,color:"#fff",weight:2,fillColor:x[1]==="長野"?"#dc514e":x[1]==="松本"?"#e3a949":"#2c77b5",fillOpacity:.93}).addTo(mp);marker.bindPopup('<b><a class="hospitalOfficial" href="'+x[6]+'" target="_blank" rel="noopener noreferrer">'+safe(x[0])+' ↗</a></b><br>'+x[1]+'医療圏・'+x[2]+'<br><a href="'+mapurl(x[0])+'" target="_blank" rel="noopener">Googleマップで実際の場所を確認 ↗</a>');});
}else{m.innerHTML='<div style="padding:40px;text-align:center">地図タイルを表示できません。下の施設一覧からGoogleマップ・地理院地図へ移動できます。</div>';}
})();

(function(){var zoomButtons=document.querySelectorAll('[data-zoom]');if(!zoomButtons.length)return;var modal=document.createElement('div');modal.className='mapModal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','医療関連地図の拡大表示');modal.innerHTML='<button type="button" aria-label="拡大表示を閉じる">×</button><div class="zoomWrap"><img alt="拡大した医療関連地図"></div>';document.body.appendChild(modal);var img=modal.querySelector('img'),close=modal.querySelector('button'),lastFocused=null;function hide(){modal.classList.remove('open');img.removeAttribute('src');if(lastFocused)lastFocused.focus();}zoomButtons.forEach(function(b){b.addEventListener('click',function(){var src=document.getElementById(b.getAttribute('data-zoom'));if(!src)return;lastFocused=b;img.src=src.currentSrc||src.src;img.alt=src.alt||'医療関連地図';modal.classList.add('open');close.focus();})});close.addEventListener('click',hide);modal.addEventListener('click',function(e){if(e.target===modal)hide();});document.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal.classList.contains('open'))hide();});})();

(function(){
var opener=document.getElementById("heroMapZoom"),heroImg=document.querySelector(".heroBedMapImage");
if(!opener||!heroImg)return;
var modal=document.createElement("div");modal.className="heroLightbox";modal.setAttribute("role","dialog");modal.setAttribute("aria-label","必要病床数の地図を拡大して表示");modal.setAttribute("aria-modal","true");
modal.innerHTML='<button type="button" aria-label="閉じる">×</button><figure><img alt="2025年長野県必要病床数の推計地図を拡大した画像"><figcaption>2025年の必要病床数の推計／県地域医療構想の原資料を参照</figcaption></figure>';
document.body.appendChild(modal);
var close=modal.querySelector("button"),zoomImg=modal.querySelector("img");
function hide(){modal.classList.remove("open");zoomImg.removeAttribute("src");opener.focus();}
opener.addEventListener("click",function(){zoomImg.src=heroImg.currentSrc||heroImg.src;modal.classList.add("open");close.focus();});
close.addEventListener("click",hide);
modal.addEventListener("click",function(e){if(e.target===modal)hide();});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&modal.classList.contains("open"))hide();});
})();

(function(){
var select=document.getElementById("instRegion"),reset=document.getElementById("instReset");
if(!select||!reset)return;
function filter(){
var area=select.value;
document.querySelectorAll("#institutionGrid .institutionArea").forEach(function(card){
card.hidden=area!=="all"&&card.getAttribute("data-region")!==area;
});
}
select.addEventListener("change",filter);
reset.addEventListener("click",function(){select.value="all";filter();});
})();
