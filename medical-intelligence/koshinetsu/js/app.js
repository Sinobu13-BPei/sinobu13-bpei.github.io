(function(){
'use strict';
const d=window.KOSHINETSU;
if(!d){document.body.insertAdjacentHTML('afterbegin','<p role="alert">市場データの読み込みに失敗しました。ページを再読み込みしてください。</p>');return;}
const $=id=>document.getElementById(id);
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf=x=>new Intl.NumberFormat('ja-JP').format(x);
const pct=(x,y)=>y?((x/y-1)*100).toFixed(1)+'%':'—';
const maps=(name,address,lat,lon)=>'<span class="maplinks"><a target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&amp;query='+encodeURIComponent(name+' '+(address||''))+'">Googleマップ</a><a target="_blank" rel="noopener noreferrer" href="https://maps.gsi.go.jp/#14/'+encodeURIComponent(lat)+'/'+encodeURIComponent(lon)+'/">地理院地図</a></span>';
const link=(url,text)=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(text)+'</a>';
let filtered=d.areas.slice(),scoreChart,doctorChart,populationChart,map,markers;
const weights=[30,25,20,15,10];
const score=a=>Math.round(a[11].reduce((acc,v,i)=>acc+v*weights[i]/5,0));
const yearly=(n)=>nf(n);
const large=(n)=>(n/10000).toFixed(1)+'万人';
function showPopulation(){
const p2025=d.population.reduce((sum,p)=>sum+p.actual2025,0),p2050=d.population.reduce((sum,p)=>sum+p.p2050,0);
$('stat-pop').textContent=(p2025/10000).toFixed(1)+'万人';
$('stat-future').textContent=pct(p2050,p2025);
$('populationRows').innerHTML=d.population.map(p=>'<tr><td><b>'+esc(p.name)+'</b></td><td>'+large(p.actual2025)+'</td><td>'+large(p.p2050)+'</td><td>'+pct(p.p2050,p.p2025)+'</td><td>'+link(p.actualSource,'国勢調査')+' / '+link(p.plan,'医療計画')+' / '+link(p.assoc,'医師会')+'</td></tr>').join('');
if(!window.Chart){showChartFallback('populationChart','人口グラフは外部ライブラリを読み込めないため数表を参照してください。');return;}
const el=$('populationChart');populationChart=new Chart(el,{type:'bar',data:{labels:d.population.map(x=>x.name),datasets:[{label:'2025年（国勢調査確定）',data:d.population.map(x=>+(x.actual2025/10000).toFixed(1)),backgroundColor:'#117d94',borderRadius:4},{label:'2025年（社人研推計）',data:d.population.map(x=>+(x.p2025/10000).toFixed(1)),backgroundColor:'#a8bdd0',borderRadius:4},{label:'2050年（社人研推計）',data:d.population.map(x=>+(x.p2050/10000).toFixed(1)),backgroundColor:'#67bbad',borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:ctx=>ctx.dataset.label+': '+ctx.parsed.y+'万人'}}},scales:{y:{beginAtZero:true,title:{display:true,text:'万人'}}}}});
}
function showChartFallback(canvasId,message){const e=$(canvasId);if(!e)return;e.style.display='none';e.parentNode.insertAdjacentHTML('beforeend','<p class="micro" role="status">'+esc(message)+'</p>');}
function showInstitutions(){
$('schoolCards').innerHTML=d.schools.map(s=>'<div class="place"><b>'+esc(s.name)+'</b><p>'+esc(s.address)+'</p><p>'+esc(s.note)+'</p>'+link(s.url,'大学病院公式サイト')+'　'+maps(s.name,s.address,s.lat,s.lon)+'</div>').join('');
$('institutionCards').innerHTML=d.institutions.map(i=>'<div class="place"><b><span class="pill">'+esc(i.kind)+'</span> '+esc(i.name)+'</b><p>'+esc(i.address)+'</p>'+link(i.url,'公式・所管情報')+'　'+maps(i.name,i.address,i.lat,i.lon)+'</div>').join('');
}
function showDistributors(){
$('distributorRows').innerHTML=d.distributor.map(s=>'<tr><td>'+esc(s[0])+'</td><td><b>'+esc(s[1])+'</b><br><small>'+esc(s[4])+'</small></td><td>'+esc(s[2])+'</td><td>'+link(s[3],'公開名簿')+'</td></tr>').join('');
}
function showSources(){
$('sourceList').innerHTML=d.sources.map(s=>'<li><b>'+esc(s[0])+'</b> '+link(s[3],s[1])+'<small>データ・公開時点：'+esc(s[2])+'</small></li>').join('');
}

function showFacilityCounts(){
const records=filtered.map(a=>d.getFacility(a[0],a[1])).filter(Boolean);
const clinics=records.reduce((sum,r)=>sum+r[2],0),hospitals=records.reduce((sum,r)=>sum+r[3],0);
const associations=d.associationRows.filter(r=>filtered.some(a=>a[0]===r[0]&&a[1]===r[1]));
$('facilityClinicTotal').textContent=nf(clinics);
$('facilityHospitalTotal').textContent=nf(hospitals);
$('facilityAllTotal').textContent=nf(clinics+hospitals);
$('associationTotal').textContent=nf(associations.length)+'団体';
$('facilityRows').innerHTML=filtered.map(a=>{
const fac=d.getFacility(a[0],a[1]),as=d.associationRows.filter(s=>s[0]===a[0]&&s[1]===a[1]);
const region=esc(a[0])+' / '+esc(a[1]);
return '<tr><td><span class="region-tag">'+esc(a[0])+'</span></td><td><strong>'+esc(a[1])+'</strong><small class="cell-note">'+esc(a[2])+' 周辺</small></td><td class="num value-clinic">'+(fac?nf(fac[2]):'—')+'</td><td class="num">'+(fac?nf(fac[3]):'—')+'</td><td class="num value-total">'+(fac?nf(fac[2]+fac[3]):'—')+'</td><td class="association-links">'+as.map(x=>link(x[3],x[2])).join('')+'</td></tr>';
}).join('');
$('associationRows').innerHTML=associations.map(a=>{
const city=a[4],cityFig=city?d.cityFacilities[city]:null,areaFig=d.getFacility(a[0],a[1]),fig=cityFig|| (areaFig?[areaFig[2],areaFig[3]]:null),master=d.facilitySource.associations[a[0]];
const ref=a[3]===master?link(master,'県・地域医師会一覧'):link(a[3],'医師会・公式案内');
return '<tr><td><b>'+esc(a[0])+'</b><small class="cell-note">'+esc(a[1])+'医療圏</small></td><td><b>'+esc(a[2])+'</b><small class="cell-note">'+ref+'</small></td><td>'+esc(city||a[1]+'医療圏全体')+'</td><td class="num">'+(fig?nf(fig[0]):'—')+'</td><td class="num">'+(fig?nf(fig[1]):'—')+'</td><td><small>'+(cityFig?'2023年・自治体内施設（医師会加盟数ではない）':'2023年・医療圏全体（複数の医師会で重複する参考値）')+'</small></td></tr>';
}).join('');
}

function areaRows(){
$('areaRows').innerHTML=filtered.map(a=>'<tr><td>'+esc(a[0])+'<br><b>'+esc(a[1])+'</b></td><td>'+esc(a[2])+'<br><b>'+esc(a[6])+'</b><br>'+maps(a[6],a[2],a[3],a[4])+'</td><td>'+esc(a[7])+'</td><td>'+esc(a[8])+'</td><td>'+esc(a[9])+'</td><td>'+esc(a[10])+'</td><td class="score">'+score(a)+'/100<small style="display:block;font-size:10px;font-weight:500">独自仮説</small></td></tr>').join('');
$('filterCount').textContent=filtered.length+'医療圏を表示';
}
function showBeds(){
$('bedsRows').innerHTML=filtered.map(a=>{
let b=a[12],url=d.population.find(p=>p.name===a[0])?.beds||'#';
return '<tr><td>'+esc(a[0])+'</td><td><b>'+esc(a[1])+'</b></td><td>'+(b?nf(b[0]):'—')+'</td><td>'+(b?nf(b[1]):'—')+'</td><td>'+(b?nf(b[2]):'—')+'</td><td>'+(b?nf(b[3]):'—')+'</td><td>'+(b&&b[4]!=null?nf(b[4]):'—')+'</td><td>'+link(url,'原表')+'</td></tr>';
}).join('');
}
function renderScore(){
if(!window.Chart){showChartFallback('scoreChart','スコアは下の医療圏別の数表で参照できます。');return;}
if(scoreChart)scoreChart.destroy();
let rows=filtered.slice().sort((a,b)=>score(b)-score(a));
scoreChart=new Chart($('scoreChart'),{type:'bar',data:{labels:rows.map(a=>a[1]+' ('+a[0].replace('県','')+')'),datasets:[{label:'調査優先度 / 100（独自仮説）',data:rows.map(score),backgroundColor:rows.map(a=>a[0]==='新潟県'?'#1c7f9a':a[0]==='長野県'?'#2ea995':'#a17eba'),borderRadius:3}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{afterLabel:ctx=>'※ ５軸の独自評価であり公的順位ではありません'}}},scales:{x:{min:0,max:100,ticks:{stepSize:20}},y:{ticks:{font:{size:11}}}}}});
}
function renderDoctor(){
if(!window.Chart){showChartFallback('doctorChart','医師偏在指標は医療圏別の資料 S08 を参照してください。');return;}
if(doctorChart)doctorChart.destroy();
let rows=filtered.slice().sort((a,b)=>b[5]-a[5]);
doctorChart=new Chart($('doctorChart'),{type:'bar',data:{labels:rows.map(a=>a[0].slice(0,2)+' '+a[1]),datasets:[{label:'医師偏在指標（厚労省2026年4月公表）',data:rows.map(a=>a[5]),backgroundColor:rows.map(a=>a[0]==='新潟県'?'#1c7f9a':a[0]==='長野県'?'#2ea995':'#a17eba'),borderRadius:2}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{afterLabel:ctx=>'人数ではなく医師偏在指標'}}},scales:{x:{min:0,title:{display:true,text:'参考：医師偏在指標'}},y:{ticks:{font:{size:10}}}}}});
}
function popup(a){return '<div style="min-width:180px"><b>'+esc(a[0])+'・'+esc(a[1])+'</b><p style="margin:4px 0">代表拠点：'+esc(a[2])+'<br>主要病院：'+esc(a[6])+'</p>'+maps(a[6],a[2],a[3],a[4])+'<p style="font-size:10px">概略中心であり病院座標ではありません</p></div>';}
function showMap(){
if(!window.L){$('medicalMap').textContent='地図ライブラリが読み込めません。下の医療圏別Googleマップ・地理院地図リンクをご利用ください。';return;}
map=L.map('medicalMap',{scrollWheelZoom:false,zoomControl:true}).setView([36.66,138.26],7);
L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{attribution:'出典：<a href="https://maps.gsi.go.jp/" target="_blank">国土地理院「地理院タイル」</a>',maxZoom:18}).addTo(map);
markers=L.layerGroup().addTo(map);
updateMarkers();
setTimeout(()=>map.invalidateSize(),20);
}
function updateMarkers(){
if(!map||!markers)return;markers.clearLayers();let pts=[];
filtered.forEach(a=>{let c=a[0]==='新潟県'?'#1289a8':a[0]==='長野県'?'#098f7e':'#996bae';let mark=L.circleMarker([a[3],a[4]],{radius:7,color:'#fff',weight:2,fillColor:c,fillOpacity:.94});mark.bindPopup(popup(a));mark.addTo(markers);pts.push([a[3],a[4]]);});
if(pts.length){map.fitBounds(L.latLngBounds(pts).pad(.18),{maxZoom:8});}
}
function onFilter(){
let f=$('prefFilter').value;filtered=d.areas.filter(a=>f==='all'||a[0]===f);areaRows();showFacilityCounts();showBeds();renderScore();renderDoctor();updateMarkers();
}
showPopulation();showInstitutions();showDistributors();showSources();showMap();
$('prefFilter').addEventListener('change',onFilter);
for(const id of ['doctors','risks','associations']){
const fold=$(id);if(!fold)continue;
fold.addEventListener('toggle',()=>{
if(!fold.open)return;
if(id==='doctors'&&doctorChart&&doctorChart.resize)doctorChart.resize();
if(id==='risks'&&map&&map.invalidateSize)map.invalidateSize();
});
}
onFilter();
})();