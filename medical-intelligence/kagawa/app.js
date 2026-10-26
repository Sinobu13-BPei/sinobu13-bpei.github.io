'use strict';
(function(){
const $=id=>document.getElementById(id);
const safe=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const nice=n=>Number(n).toLocaleString('ja-JP');
const link=(url,label)=>'<a href="'+safe(url)+'" target="_blank" rel="noopener noreferrer">'+safe(label)+'</a>';
const areas={east:'東部',island:'小豆',west:'西部'};
const getGM=f=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(f.name+' '+f.address);
const getGSI=f=>'https://maps.gsi.go.jp/#15/'+encodeURIComponent(f.lat)+'/'+encodeURIComponent(f.long)+'/';
let leafMap=null,markers=[],facilityData=[];
function showFallback(id){const el=$(id);if(el)el.style.display='block'}
function chart(id,config,fallback){const el=$(id); if(!el||!window.Chart){showFallback(fallback);return}
try{new window.Chart(el,config)}catch(err){console.warn('Chart fallback: '+id,err);el.style.display='none';showFallback(fallback)}}
function makeCharts(d){
const axis={ticks:{color:'#4a6576'},grid:{color:'#e4edf2'}};const noAnim={responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{position:'bottom',labels:{boxWidth:12,color:'#24445a'}}},scales:{y:{beginAtZero:true,...axis},x:{grid:{display:false},ticks:{color:'#4a6576'}}}};
const years=d.population.projections.map(p=>String(p.year));
chart('populationChart',{type:'line',data:{labels:years,datasets:[{label:'社人研2023年推計（2020のみ実績）',data:d.population.projections.map(p=>Math.round(p.pop/10000*10)/10),borderColor:'#087d77',backgroundColor:'#a0e7da55',pointRadius:4,tension:.2,fill:true},{label:'2025年国勢調査速報',data:[null,d.population.census2025prelim/10000,...Array(5).fill(null)],type:'scatter',pointRadius:7,pointBackgroundColor:'#d14e68',pointBorderColor:'#d14e68'}]},options:{...noAnim,scales:{...noAnim.scales,y:{...noAnim.scales.y,title:{display:true,text:'万人'}}}}},'populationFallback');
chart('bedChart',{type:'bar',data:{labels:['高度急性期','急性期','回復期','慢性期'],datasets:[{label:'2024年報告（許可病床）',data:[989,4936,2209,2625],backgroundColor:'#126f9e'},{label:'2025年必要推計',data:[1046,3386,3396,2284],backgroundColor:'#df8f3f'}]},options:noAnim},'bedFallback');
chart('doctorChart',{type:'bar',data:{labels:['全国','香川','徳島','愛媛','高知','岡山'],datasets:[{label:'2026年医師偏在指標',data:[266.8,273.4,293.9,263.6,296,302.7],backgroundColor:['#98aeba','#087d77','#5598bf','#98aeba','#98aeba','#98aeba']}]},options:{...noAnim,plugins:{legend:{display:false}},scales:{...noAnim.scales,y:{min:0,max:350,ticks:{stepSize:70}}}}},'doctorFallback');
chart('deviceChart',{type:'bar',data:{labels:['CT','MRI'],datasets:[{label:'全国平均',data:[11.5,5.7],backgroundColor:'#aec2ce'},{label:'東部',data:[16,8.4],backgroundColor:'#137e9e'},{label:'小豆',data:[8.2,5.8],backgroundColor:'#d98b36'},{label:'西部',data:[16.2,9.9],backgroundColor:'#118774'}]},options:noAnim},'deviceFallback');
const order=[d.regions.find(r=>r.id==='west'),d.regions.find(r=>r.id==='east'),d.regions.find(r=>r.id==='island')];
chart('scoreChart',{type:'bar',data:{labels:order.map(r=>r.name),datasets:[{label:'独自スコア / 100点',data:order.map(r=>score(r.priority)),backgroundColor:['#126f9e','#087d77','#df8f3f']}]},options:{...noAnim,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{min:0,max:100,ticks:{stepSize:20}},y:{grid:{display:false}}}}},'scoreFallback');
}
const weights=[.3,.25,.2,.15,.1];
function score(points){return Math.round(points.reduce((s,v,i)=>s+v*weights[i],0)*20)}
function regions(d){
const root=$('regionCards');if(!root)return;
root.innerHTML=d.regions.map(r=>'<article class="card"><div class="region-name"><h3>'+safe(r.name)+'保健医療圏</h3><span class="pill">'+safe(r.name==='小豆'?'離島型':r.name==='東部'?'集積型':'広域型')+'</span></div><div class="stat">'+nice(r.pop2023)+'人</div><p class="muted">2023年4月人口 [S25] ／ 医師偏在指標（2026年） '+r.doctorIndex2026+'</p><p><b>区域：</b>'+safe(r.municipalities)+'</p><p><b>需要ドライバー：</b>'+safe(r.driver)+'</p><p><b>課題：</b>'+safe(r.challenge)+'</p><p><b>3〜5年の機会：</b>'+safe(r.opportunity)+'</p><p><b>注目施設：</b>'+safe(r.facilities)+'</p><span class="pill estimate">独自分析</span></article>').join('');
const sr=$('scoreRows');if(sr)sr.innerHTML=d.regions.map(r=>'<div class="region-name" style="padding:8px 0;border-bottom:1px solid #e3edf2"><span>'+safe(r.name)+'：'+r.priority.map(String).join(' / ')+' <small class="muted">（5軸×各5点）</small></span><span class="score">'+score(r.priority)+'点</span></div>').join('')+'<p class="footnote">軸順：需要 / 機能ギャップ / アクセス / 持続性 / 連携。高いほど優先度が高いという仮説で、必ずしも事業収益が高い意味ではない。</p>';
const tbody=$('bedsBody');if(tbody)tbody.innerHTML=d.regions.map(r=>'<tr><th scope="row">'+safe(r.name)+'</th>'+r.beds2024.map(v=>'<td>'+nice(v)+'</td>').join('')+r.needed2025.map(v=>'<td>'+ (v===null?'10未満':nice(v))+'</td>').join('')+'</tr>').join('');
const dt=$('deviceBody');if(dt)dt.innerHTML=d.deviceNames.map((m,i)=>'<tr><th scope="row">'+safe(m)+'</th><td>'+d.deviceJapan[i]+'</td>'+['east','island','west'].map(id=>'<td>'+d.regions.find(r=>r.id===id).devices[i]+'</td>').join('')+'<td>'+safe(d.deviceUnit)+'</td></tr>').join('');
}
function institutions(d){
const root=$('associations');if(!root)return;root.innerHTML=d.associations.map(n=>'<span class="seg">'+link('https://www.kagawa.med.or.jp/map.aspx',n+'（県医師会の公式一覧）')+'</span>').join('');
}
function facilityHTML(f){const gsi=getGSI(f),gm=getGM(f);return '<article class="facility"><div class="facility-title">'+link(f.url,f.name)+'</div><small>'+safe(areas[f.area])+'｜'+safe(f.type)+'</small><small>'+safe(f.address)+'</small><div class="facility-links">'+link(gm,'Googleマップ')+link(gsi,'地理院地図')+link(f.url,'公式情報')+'</div></article>'}
function renderFacilities(){const q=($('facilitySearch')?.value||'').toLowerCase().trim(),a=$('facilityArea')?.value||'all',filtered=facilityData.filter(f=>(a==='all'||f.area===a)&&(f.name+' '+f.address+' '+f.type).toLowerCase().includes(q));const root=$('facilityList');if(root)root.innerHTML=filtered.length?filtered.map(facilityHTML).join(''):'<p class="placeholder" role="status">条件に合う施設がありません。検索条件を変更してください。</p>';if(leafMap){for(const m of markers)m.remove();markers=[];for(const f of filtered){const m=window.L.marker([f.lat,f.long]).addTo(leafMap).bindPopup('<b>'+safe(f.name)+'</b><br>'+safe(f.address)+'<br>'+link(getGM(f),'Google')+' / '+link(getGSI(f),'地理院'));markers.push(m)}}}
function startMap(regionData){
const el=$('facilityMap');if(!el)return;
if(!window.L){el.innerHTML='<div class="map-placeholder"><strong>地図ライブラリの読込に失敗しました。</strong><br>施設一覧のGoogleマップ・地理院地図リンクをご利用ください。</div>';return}
try{
 leafMap=window.L.map(el,{scrollWheelZoom:false}).setView([34.33,134.04],9);
 window.L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{attribution:'<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">地理院タイル</a>',maxZoom:18,minZoom:7}).addTo(leafMap);
 for(const r of regionData||[]){window.L.circleMarker(r.center,{radius:10,color:'#083955',fillColor:'#15a49a',fillOpacity:.65,weight:2}).addTo(leafMap).bindPopup('<b>'+safe(r.name)+'二次医療圏・代表点</b><br>'+safe(r.municipalities)+'<br><small>範囲・医療圏境界ではありません</small>');}
 renderFacilities();setTimeout(()=>{if(leafMap)leafMap.invalidateSize()},250);
}catch(err){console.warn('Leaflet map failed',err);leafMap=null;el.innerHTML='<div class="map-placeholder">地図の読み込みに失敗しました。施設一覧の地図リンクを利用してください。</div>'}
}
function renderSources(d){const root=$('sourceList');if(!root)return;root.innerHTML=d.sources.map(s=>'<li id="'+safe(s[0])+'"><a href="'+safe(s[3])+'" target="_blank" rel="noopener noreferrer">['+safe(s[0])+'] '+safe(s[1])+'</a><span>データ年次：'+safe(s[2])+'<br>URL：'+safe(s[3])+'</span></li>').join('')}
async function load(){
try{
 const res=await fetch('./data/market.json',{cache:'no-cache'});if(!res.ok)throw new Error('HTTP '+res.status);
 const d=await res.json();if(!d||!Array.isArray(d.regions)||!Array.isArray(d.facilities)||!Array.isArray(d.sources))throw new Error('Bad market data');
 regions(d);institutions(d);renderSources(d);facilityData=d.facilities;renderFacilities();makeCharts(d);startMap(d.regions);
 $('facilitySearch')?.addEventListener('input',renderFacilities);
 $('facilityArea')?.addEventListener('change',renderFacilities);
}catch(err){
 console.warn('Kagawa market data fallback',err);
 ['populationFallback','bedFallback','doctorFallback','deviceFallback','scoreFallback'].forEach(showFallback);
 const e=$('facilityMap');if(e)e.innerHTML='<div class="map-placeholder">施設データが読み込めません。ページ中の施設・出典リンクをご利用ください。</div>';
}
}
document.addEventListener('DOMContentLoaded',load);
})();