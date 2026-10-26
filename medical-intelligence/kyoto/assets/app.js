(function(){
'use strict';
const el=id=>document.getElementById(id);
const dataEl=el('data-inline');
if(!dataEl)return;
let d;
try{d=JSON.parse(dataEl.textContent)}catch(e){console.error('京都府データの読み込みに失敗しました',e);return}
const colors=['#0f6c9d','#22a0a1','#e2ad3e','#a67ac7','#ce7481','#8494a8'];
const safe=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const regionSelect=el('regionFilter'),searchInput=el('facilitySearch');
function initMenu(){
 const btn=el('menuButton'),nav=el('mainNav');if(!btn||!nav)return;
 const close=(refocus=false)=>{btn.setAttribute('aria-expanded','false');nav.classList.remove('is-open');if(refocus)btn.focus()};
 btn.addEventListener('click',()=>{
  const open=btn.getAttribute('aria-expanded')!=='true';btn.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open)
 });
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>close()));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&btn.getAttribute('aria-expanded')==='true'){close(true)}});
 document.addEventListener('pointerdown',e=>{if(btn.getAttribute('aria-expanded')==='true'&&!nav.contains(e.target)&&!btn.contains(e.target))close()});
 window.matchMedia('(min-width:801px)').addEventListener('change',e=>{if(e.matches)close()});
}
function filter({updateMap=true}={}){
 const region=regionSelect?.value||'all',q=(searchInput?.value||'').trim().toLocaleLowerCase('ja');let count=0;
 document.querySelectorAll('.facility').forEach(node=>{
  const on=(region==='all'||node.dataset.region===region)&&(node.dataset.search||'').toLocaleLowerCase('ja').includes(q);
  node.hidden=!on;if(on)count++;
 });
 const label=el('facilityCount');if(label)label.textContent=`${count}施設を表示`;
 const empty=el('facilityEmpty');if(empty)empty.hidden=count>0;
 if(updateMap && window.kyotoMap&&window.kyotoMarkers){
  window.kyotoMarkers.forEach(x=>{
   const match=(region==='all'||x.region===region)&&x.text.toLocaleLowerCase('ja').includes(q);
   if(match){if(!window.kyotoMap.hasLayer(x.marker))x.marker.addTo(window.kyotoMap)}
   else if(window.kyotoMap.hasLayer(x.marker))window.kyotoMap.removeLayer(x.marker);
  });
 }
 return count;
}
function initCharts(){
 if(typeof window.Chart==='undefined')return;
 Chart.defaults.font.family="'Noto Sans JP',system-ui,sans-serif";Chart.defaults.color='#344f64';
 const opts={responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{position:'bottom'}}};
 const configs={
  populationChart:{type:'line',data:{labels:d.populationSeries.years.map(String),datasets:[
   {label:'総人口（万人）',data:d.populationSeries.totals.map(v=>v/10000),borderColor:colors[0],backgroundColor:colors[0],tension:.25,pointRadius:4},
   {label:'65歳以上（万人）',data:d.populationSeries.elderly.map(v=>v/10000),borderColor:colors[2],backgroundColor:colors[2],tension:.25,pointRadius:4}]},options:{...opts,scales:{y:{title:{display:true,text:'万人'},beginAtZero:true}}}},
  regionChart:{type:'bar',data:{labels:d.regions.map(r=>r.name),datasets:[{label:'2040年の人口変化率（%）',data:d.regions.map(r=>r.popChange2040),backgroundColor:colors[0]}]},options:{...opts,indexAxis:'y',scales:{x:{title:{display:true,text:'2020年比（%）'}}},plugins:{legend:{display:false}}}},
  bedChart:{type:'bar',data:{labels:d.regions.map(r=>r.name),datasets:['高度急性期','急性期','回復期','慢性期','休棟・無回答等'].map((name,i)=>({label:name,data:d.regions.map(r=>r.bed[i]),backgroundColor:colors[i]}))},options:{...opts,indexAxis:'y',scales:{x:{stacked:true},y:{stacked:true}}}},
  scoreChart:{type:'bar',data:{labels:d.regions.map(r=>r.name),datasets:[{label:'優先度（独自分析）',data:d.regions.map(r=>r.score),backgroundColor:colors[1]}]},options:{...opts,indexAxis:'y',scales:{x:{min:0,max:100}},plugins:{legend:{display:false}}}}
 };
 for(const [id,config] of Object.entries(configs)){
  const node=el(id);if(!node)continue;
  node.classList.add('is-ready');
  try{new Chart(node,config);const fallback=node.parentElement.querySelector('.chart-static');if(fallback)fallback.hidden=true}
  catch(err){node.classList.remove('is-ready');console.warn(id+' のChart.js描画を省略し静的グラフを使用します',err)}
 }
}
function mapUnavailable(){
 const box=el('map');if(!box)return;
 box.innerHTML='<div class="map-offline"><strong>オンライン地図を表示できません</strong><p>施設一覧のGoogleマップ・地理院地図リンクから位置を確認できます。地図ライブラリまたはタイルの通信が制限されている可能性があります。</p><a href="https://maps.gsi.go.jp/" target="_blank" rel="noopener noreferrer">地理院地図を開く ↗</a></div>';
}
function initMap(){
 if(typeof window.L==='undefined'){mapUnavailable();return}
 const map=L.map('map',{scrollWheelZoom:false}).setView([35.12,135.6],9);
 // Prevent a broken map stylesheet from allowing tiles to overflow into the page.
 const mapRoot=el('map'),mapPane=mapRoot?.querySelector('.leaflet-map-pane');
 if(!mapPane||getComputedStyle(mapPane).position!=='absolute'||getComputedStyle(mapRoot).overflow==='visible'){
  try{map.remove()}catch(_){}
  console.warn('Leafletの配置CSSが無効です。安全な地図リンク表示に切り替えます。');
  mapUnavailable();return;
 }

 const tiles=L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{
  attribution:'<a href="https://maps.gsi.go.jp/" target="_blank" rel="noopener noreferrer">地理院タイル（国土地理院）</a>',maxZoom:18
 }).addTo(map);
 let tileFails=0;
 tiles.on('tileerror',()=>{tileFails++;if(tileFails===4&&!el('mapTileWarning')){
  const tip=document.createElement('div');tip.id='mapTileWarning';tip.className='map-tile-warning';tip.textContent='地理院タイルを取得できません。施設一覧の地図リンクを併用してください。';el('map').appendChild(tip)
 }});
 window.kyotoMap=map;window.kyotoMarkers=[];
 d.regions.forEach(r=>L.circleMarker([r.lat,r.lon],{color:'#087c90',fillColor:'#b6e9eb',fillOpacity:.4,radius:19,weight:2})
  .bindPopup('<strong>'+safe(r.name)+'医療圏</strong><br>'+safe(r.cities)+'<br>代表点（概略）').addTo(map));
 d.facilities.forEach(f=>{
  const gsi=`https://maps.gsi.go.jp/#15/${Number(f.lat).toFixed(5)}/${Number(f.lon).toFixed(5)}/`;
  const gm='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(f.name+' '+f.address);
  const popup=`<strong>${safe(f.name)}</strong><br>${safe(f.address)}<br><small>位置は概略</small><br><a href="${gm}" target="_blank" rel="noopener noreferrer">Googleマップ</a> · <a href="${gsi}" target="_blank" rel="noopener noreferrer">地理院地図</a>`;
  const marker=L.circleMarker([f.lat,f.lon],{color:'#c78715',fillColor:'#ffdc77',fillOpacity:.9,radius:6,weight:1.2}).bindPopup(popup);
  marker.addTo(map);window.kyotoMarkers.push({marker,region:f.region,text:f.name+' '+f.address+' '+f.kind})
 });
 filter();
 map.invalidateSize();
}
document.addEventListener('DOMContentLoaded',()=>{
 initMenu();
 regionSelect?.addEventListener('change',()=>{
  filter();const r=d.regions.find(x=>x.name===regionSelect.value);
  if(window.kyotoMap){window.kyotoMap.closePopup();if(r)window.kyotoMap.setView([r.lat,r.lon],10);else window.kyotoMap.setView([35.12,135.6],9)}
 });
 searchInput?.addEventListener('input',()=>filter());
 filter({updateMap:false});
 initCharts();
 try{initMap()}catch(e){console.warn('地図機能は一覧表示に切り替えました',e);mapUnavailable()}
});
})();
