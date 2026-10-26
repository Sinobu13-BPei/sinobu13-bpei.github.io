"use strict";
const D=window.MIYAGI_DATA;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const n=v=>Number(v).toLocaleString("ja-JP");
const ref=id=>'<a href="#sources">'+esc(id)+'</a>';
const link=(url,label)=>'<a href="'+encodeURI(url).replace(/"/g,"%22")+'" target="_blank" rel="noopener noreferrer">'+esc(label)+'</a>';
const safeUrl=x=>/^https:\/\//.test(x)?x:"#";
function sourceNote(ids){return '<small class="note">出典：'+ids.map(ref).join("、")+'</small>'}
function init(){if(!D){document.querySelectorAll(".dynamic").forEach(e=>e.textContent="データの読み込みに失敗しました。");return}
const beds=D.regions,weights=D.weights;
const total=ar=>ar.reduce((a,b)=>a+b,0);
const names=D.bedsLabels,cur=names.map((_,i)=>total(beds.map(r=>r.bed.report[i]))),need=names.map((_,i)=>total(beds.map(r=>r.bed.need[i])));
$("regional-rows").innerHTML=beds.map(r=>{const score=Math.round(r.scores.reduce((a,v,i)=>a+v*weights[i],0)/5);return '<tr><th scope="row">'+esc(r.name)+'</th><td>'+n(r.bed.total)+'</td><td>'+r.doctorIndex.toFixed(1)+'</td><td>'+n(r.bed.report[2])+'</td><td>'+n(r.bed.need[2])+'</td><td><b>'+score+'/100</b><br><span class="note">独自評価</span></td></tr>'}).join("");
$("region-cards").innerHTML=beds.map(r=>'<article class="mini"><h3>'+esc(r.name)+' <span class="pill estimate">分析</span></h3><p><b>需要ドライバー：</b>'+esc(r.drive)+'</p><p><b>制約：</b>'+esc(r.risk)+'</p><p><b>Where to Play：</b>'+esc(r.play)+'</p><p><b>How to Win：</b>'+esc(r.win)+'</p><p class="note">'+esc(r.main)+'｜'+ref("P03")+' '+ref("P04")+' '+ref("P06")+'</p></article>').join("");
$("beds-rows").innerHTML=beds.map(r=>'<tr><th scope="row">'+esc(r.name)+'</th>'+r.bed.report.map(x=>'<td>'+n(x)+'</td>').join('')+'<td>'+n(r.bed.total)+'</td></tr>').join('')+'<tr><th scope="row">県全体</th>'+cur.map(x=>'<td><b>'+n(x)+'</b></td>').join('')+'<td><b>19,255</b></td></tr>';
$("need-rows").innerHTML=beds.map(r=>'<tr><th scope="row">'+esc(r.name)+'</th>'+r.bed.need.map(x=>'<td>'+n(x)+'</td>').join('')+'<td>'+n(total(r.bed.need))+'</td></tr>').join('')+'<tr><th scope="row">県全体</th>'+need.map(x=>'<td><b>'+n(x)+'</b></td>').join('')+'<td><b>18,781</b></td></tr>';
$("doctor-rows").innerHTML=beds.map(r=>'<tr><th scope="row">'+esc(r.name)+'</th><td>'+r.doctorIndex.toFixed(1)+'</td><td>'+ (r.doctorIndex>=290?'上位約1/3':r.doctorIndex<193?'下位約1/3':'中位帯')+'</td><td>'+esc(r.risk)+'</td></tr>').join('');
$("assessment").innerHTML=D.weightLabels.map((x,i)=>'<span class="pill">'+esc(x)+' '+weights[i]+'%</span>').join(' ');
$("association-list").innerHTML=D.associations.map(a=>'<li>'+esc(a)+' '+link('https://www.miyagi.med.or.jp/',"県医師会")+' '+link('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(a),"Googleマップ")+' <span class="note">個別公式HP未確認</span></li>').join('');
$("source-list").innerHTML=D.sources.map(s=>'<div class="source" id="'+esc(s[0])+'">'+link(safeUrl(s[3]),esc(s[0])+' '+esc(s[1]))+'<small>基準：'+esc(s[2])+' ｜ '+esc(s[3])+'</small></div>').join('');
$("device-rows").innerHTML=["US（超音波）","CT","MRI","PET・PET/CT","リニアック・放射線治療","血管撮影装置","内視鏡","心電図・生体情報","透析機器"].map(a=>'<tr><th scope="row">'+a+'</th><td>各施設・メーカー混在／県内全数は未検証</td><td>比較不可（機器定義・年次を統一中）</td><td>施設別型式・導入年・共同利用体制・更新予定を収集</td></tr>').join('');
$("census-rows").innerHTML=[["全国",123049524],["宮城県",2227240],["青森県",1140395],["岩手県",1125502],["秋田県",882100],["山形県",993127],["福島県",1711937]].map(([a,b])=>'<tr><th scope="row">'+a+'</th><td>'+n(b)+'</td><td>'+((b/123049524)*100).toFixed(2)+'%</td></tr>').join('');
function renderPlaceList(){
 const word=$('place-search').value.trim(),kind=$('place-kind').value,area=$('place-region').value;
 const arr=D.places.filter(p=>(!word||(p[0]+p[2]).includes(word))&&(!kind||p[1]===kind)&&(!area||p[5]===area));
 $("place-count").textContent=arr.length+"件を表示（全"+D.places.length+"件）";
 $("place-list").innerHTML=arr.length?arr.map(p=>{const gm="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(p[0]+" "+p[2]),gsi="https://maps.gsi.go.jp/#15/"+p[3]+"/"+p[4]+"/";return '<article class="place"><b>'+esc(p[0])+' <span class="pill">'+esc(p[1])+'</span></b><small>'+esc(p[2])+'</small><div class="links">'+link(gm,"Googleマップ")+link(gsi,"地理院地図（概略）")+link(safeUrl(p[6]),"公式・関連HP")+'</div></article>'}).join(''):'<p>条件に一致する施設はありません。</p>';
}
['place-search','place-kind','place-region'].forEach(id=>$(id).addEventListener(id==='place-search'?'input':'change',renderPlaceList));renderPlaceList();
renderCharts(cur,need);renderMap();
}
function renderCharts(cur,need){
function fallback(id,labels,values,max){const o=$(id);o.classList.add('on');o.innerHTML=labels.map((x,i)=>'<div class="barrow"><span>'+esc(x)+'</span><div class="barbg"><i style="width:'+Math.round(values[i]/max*100)+'%"></i></div><b>'+n(values[i])+'</b></div>').join('')}
if(typeof Chart==="undefined"){fallback('bed-fallback',D.bedsLabels,cur,10000);fallback('aging-fallback',["仙台","仙南","大崎・栗原","沿岸"],[26.6,36.9,35.3,41.9],50);return}
try {
new Chart($('bed-chart'),{type:'bar',data:{labels:D.bedsLabels,datasets:[{label:'2025報告病床',data:cur,backgroundColor:'#2074a7'},{label:'2025年必要病床（別定義）',data:need,backgroundColor:'#e7a840'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:c=>c.dataset.label+'：'+n(c.raw)+'床'}}},scales:{y:{beginAtZero:true}}}});
new Chart($('aging-chart'),{type:'bar',data:{labels:["仙台圏域","仙南圏域","大崎圏域","気仙沼・本吉圏域"],datasets:[{label:"高齢化率 % （県調査／広域圏区分）",data:[26.6,36.9,35.3,41.9],backgroundColor:['#18888d','#226c9a','#cb9550','#b65a6b']}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,max:50}}}});
}catch(e){fallback('bed-fallback',D.bedsLabels,cur,10000);fallback('aging-fallback',["仙台","仙南","大崎・栗原","沿岸"],[26.6,36.9,35.3,41.9],50)}
}
function renderMap(){
const el=$("map");if(typeof L==="undefined"){el.innerHTML='<div style="padding:24px">地図サービスが利用できません。下の施設検索から Googleマップ／地理院地図に移動できます。</div>';return}
try{const map=L.map('map',{scrollWheelZoom:false}).setView([38.49,140.98],9);L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{attribution:'地理院タイル（国土地理院）',maxZoom:18}).addTo(map);const colors={'病院':'#1e6ea4','医学部':'#0b8581','医師会':'#9e5a3e','行政':'#69599e','保健所':'#8b5f19'};D.places.forEach(p=>{const pin=L.circleMarker([p[3],p[4]],{radius:p[1]==='病院'?6:5,weight:1,color:'#fff',fillOpacity:.86,fillColor:colors[p[1]]||'#1679a9'}).addTo(map);const gm='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p[0]+' '+p[2]);pin.bindPopup('<b>'+esc(p[0])+'</b><div>'+esc(p[2])+'</div><a target="_blank" rel="noopener" href="'+gm+'">Googleマップで確認</a>')});}
catch(e){el.textContent="地図を表示できません。施設一覧の地図リンクを使用してください。"}
}
document.addEventListener('DOMContentLoaded',init);