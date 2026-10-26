(()=>{'use strict';
const D=window.ShikokuData;if(!D){document.body.insertAdjacentHTML('afterbegin','<p>データを読み込めませんでした。</p>');return;}
const $=s=>document.querySelector(s),fmt=n=>Number(n).toLocaleString('ja-JP');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const a=(url,label)=>'<a target="_blank" rel="noopener noreferrer" href="'+esc(url)+'">'+esc(label)+'</a>';
const maps=(n,p)=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(n+' '+p+'県');
const gsi=(lat,lon)=>'https://maps.gsi.go.jp/#15/'+lat+'/'+lon+'/';
const doctorIndex=new Map((D.doctorAreas||[]).map(x=>[x[0]+'|'+x[1],x]));
const row=cells=>'<tr>'+cells.map((x,i)=>'<td'+(typeof x==='number'?' class="num"':'')+'>'+(typeof x==='number'?fmt(x):x)+'</td>').join('')+'</tr>';
let pop=D.pref.reduce((x,p)=>x+p[1],0),hos=D.pref.reduce((x,p)=>x+p[3],0),cli=D.pref.reduce((x,p)=>x+p[4],0);
$('#stat-pop').textContent=(pop/10).toFixed(1)+'万人';$('#stat-hosp').textContent=fmt(hos)+'施設';$('#stat-clin').textContent=fmt(cli)+'施設';$('#stat-areas').textContent=D.areas.length+'圏域';
$('#prefrows').innerHTML=D.pref.map(p=>row([esc(p[0]),fmt(p[1])+'千人',p[2]+'%',p[3],p[4],(p[3]/p[1]*100).toFixed(1),a(p[8],'第8次医療計画'),a(p[9],'医師会・郡市医師会')])).join('');

const options=['全県',...D.pref.map(p=>p[0])];
$('#areaFilter').innerHTML=options.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join('');
function fillAreas(){
 let s=$('#areaFilter').value;const term=($('#areaSearch')?.value||'').trim().toLocaleLowerCase();
let areas=D.areas.filter(x=>(s==='全県'||x[0]===s)&&(!term||[...x,doctorIndex.get(x[0]+'|'+x[1])?.[3]||''].join(' ').toLocaleLowerCase().includes(term)));
 $('#areaCount').textContent=areas.length+' / '+D.areas.length+'医療圏';
 $('#arearows').innerHTML=areas.length?areas.map(p=>{const d=doctorIndex.get(p[0]+'|'+p[1]);return row([esc(p[0]),'<b>'+esc(p[1])+'</b>'+(d?'<div class="area-doctor">医師偏在指標 2026：<b>'+d[2].toFixed(1)+'</b></div><div class="mini">'+esc(d[3])+'</div>':'')+'<div class="mini">'+esc(p[2])+'</div>',esc(p[3]),esc(p[4]),esc(p[5]),esc(p[6]),'<span class="score">'+p[7]+'/100</span><div class="mini">独自仮説</div>',a(gsi(p[8],p[9]),'地理院地図')+' '+a(maps(p[1],p[0]),'Google Maps')]);}).join(''):'<tr><td colspan="8" class="empty-row">一致する医療圏はありません。検索語を変更してください。</td></tr>';
 drawScores(areas);
}
$('#areaFilter').addEventListener('change',fillAreas);
$('#areaSearch')?.addEventListener('input',fillAreas);
function renderPlaces(){
const q=($('#institutionSearch')?.value||'').trim().toLocaleLowerCase();
const list=D.places.filter(p=>!q||p.slice(0,3).join(' ').toLocaleLowerCase().includes(q));
$('#institutionCount').textContent=list.length+' / '+D.places.length+'地点';
$('#institutions').innerHTML=list.map(p=>'<div class="place"><strong>'+esc(p[1])+' <span class="mini">'+esc(p[2])+' / '+esc(p[0])+'</span></strong>'+a(maps(p[1],p[0]),'Google マップ')+a(gsi(p[3],p[4]),'地理院地図')+(p[5]?' '+a(p[5],'公式サイト'):'')+'</div>').join('')||'<div class="empty-row">該当する地点がありません。</div>';
$('#dealers').innerHTML=D.dealers.map(p=>row(['<b>'+esc(p[0])+'</b>',esc(p[1]),'<span class="mini">公開事業範囲の整理。地域別売上高・占有率は未検証</span>'])).join('');
}
$('#institutionSearch')?.addEventListener('input',renderPlaces);
renderPlaces();
$('#sourcerows').innerHTML=D.sources.map(p=>row([esc(p[0]),esc(p[1]),esc(p[2]),a(p[3],'一次情報を見る')])).join('');
$('#bedrows').innerHTML=D.kochiBeds.map(p=>row([esc(p[0]),...p.slice(1)])).join('');
let map;try{if(window.L){map=L.map('map',{scrollWheelZoom:false}).setView([33.85,133.72],8);
L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{maxZoom:18,attribution:'<a href="https://maps.gsi.go.jp/" target="_blank" rel="noopener">地理院タイル</a>'}).addTo(map);
D.areas.forEach(p=>L.circleMarker([p[8],p[9]],{radius:5,weight:2,color:'#086681',fillColor:'#2eb9a0',fillOpacity:.7}).bindPopup('<b>'+esc(p[0]+' '+p[1])+'医療圏</b><br>代表地点（行政的境界を示すものではありません）<br>'+a(maps(p[1],p[0]),'Google Maps')).addTo(map));
D.places.forEach(p=>L.circleMarker([p[3],p[4]],{radius:3,color:'#ca6a18',fillOpacity:.7}).bindPopup(esc(p[1])+'<br>'+a(maps(p[1],p[0]),'Google Maps')+'<br>'+a(gsi(p[3],p[4]),'地理院地図')).addTo(map));
}else $('#map').textContent='地図ライブラリの読み込みに失敗しました。名称リンクをご利用ください。';}
catch(e){$('#map').textContent='地図の表示に失敗しました。リスト内のマップリンクをご利用ください。';}
const charts={};function chart(id,type,labels,sets,opts={}){if(!window.Chart)return;let old=charts[id];if(old)old.destroy();let canvas=document.getElementById(id);if(!canvas)return;charts[id]=new Chart(canvas,{type,data:{labels,datasets:sets},options:{responsive:true,maintainAspectRatio:false,indexAxis:opts.indexAxis||'x',plugins:{legend:{display:sets.length>1},tooltip:{mode:'index',intersect:false}},scales:opts.scales||{y:{beginAtZero:true}}}});}
function drawScores(areas){chart('scoreChart','bar',areas.map(p=>p[0]+'・'+p[1]),[{label:'独自優先度（仮説）',data:areas.map(p=>p[7]),backgroundColor:'#11788e',borderRadius:4}],{indexAxis:'y',scales:{x:{min:0,max:100},y:{ticks:{autoSkip:false}}}});}

function drawCharts(){
 chart('facilityChart','bar',D.pref.map(p=>p[0]),[{label:'病院数',data:D.pref.map(p=>p[3]),backgroundColor:'#076c82'},{label:'一般診療所数',data:D.pref.map(p=>p[4]),backgroundColor:'#50ad9d'}]);
 chart('densityChart','bar',D.pref.map(p=>p[0]),[{label:'人口10万人当たり病院数',data:D.pref.map(p=>+(p[3]/p[1]*100).toFixed(1)),backgroundColor:'#218ca2'}]);
 chart('ageChart','line',D.pref.map(p=>p[0]),[{label:'65歳以上人口比率(%)',data:D.pref.map(p=>p[2]),borderColor:'#b66a24',backgroundColor:'#b66a24',tension:.25,fill:false}],{scales:{y:{min:25,max:40}}});
 chart('bedChart','bar',D.kochiBeds.map(p=>p[0]),[
 {label:'高度急性期',data:D.kochiBeds.map(p=>p[2]),backgroundColor:'#0b5982'},
 {label:'急性期',data:D.kochiBeds.map(p=>p[3]),backgroundColor:'#21a39b'},
 {label:'回復期',data:D.kochiBeds.map(p=>p[4]),backgroundColor:'#e0a948'},
 {label:'慢性期',data:D.kochiBeds.map(p=>p[5]),backgroundColor:'#a37cb8'},
 {label:'その他/未分類',data:D.kochiBeds.map(p=>p[6]),backgroundColor:'#c4ced3'}
 ],{scales:{x:{stacked:true},y:{stacked:true,beginAtZero:true}}});}
fillAreas();drawCharts();
if(!window.Chart){document.querySelectorAll('.plot').forEach(e=>e.insertAdjacentHTML('beforeend','<small>グラフライブラリが使用できないため、上部または下部の数表をご参照ください。</small>'));}
const q=[
['データが同一年か','人口・施設数＝2024年、高知病床機能＝2022年報告を明記'],
['機器設置台数と圏域内診療所数','未検証値は非掲載。県医療計画と公開施設DBの突合が必要'],
['転載権利','添付の民間市場調査表・販社シェア・社内施策スライドを公開しない'],
['地図精度','医療圏は代表点、施設は概略地点。公式住所による位置確認が必要'],
['更新日・免責','公開情報の照合・推計区分を表示し、数値の正確性を保証しない']
];const navigation=[...document.querySelectorAll('#siteNav a[href^="#"]')];
if('IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;navigation.forEach(link=>{if(link.getAttribute('href')==='#'+visible.target.id){link.setAttribute('aria-current','location')}else link.removeAttribute('aria-current')})},{rootMargin:'-18% 0px -60% 0px',threshold:[0,.15,.3]});
 document.querySelectorAll('main > section[id]').forEach(section=>observer.observe(section));
}
$('#checklist').innerHTML=q.map(p=>'<li><b>'+esc(p[0])+'：</b>'+esc(p[1])+'</li>').join('');
})();