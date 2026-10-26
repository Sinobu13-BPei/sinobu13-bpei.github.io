(() => {
'use strict';
const D = window.ShikokuData;
const q = id => document.getElementById(id);
const el = { mode:q('mapMode'), pref:q('mapPref'), cat:q('mapCategory'), catField:q('mapCategoryField'), reset:q('mapReset'), list:q('mapList'), count:q('mapCount'), status:q('mapStatus'), fallback:q('mapFallback'), frame:q('map') };
if (!D || !el.mode || !el.pref || !el.list || !el.frame) return;
const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const google = (name,pref='') => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(name + (pref ? ' ' + pref + '県' : ''));
const gsi = (lat,lon) => 'https://maps.gsi.go.jp/#15/' + Number(lat).toFixed(5) + '/' + Number(lon).toFixed(5) + '/';
const external = (url,title) => '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(title) + '</a>';
const kindOf = p => (p[2] === '大学病院' ? '大学病院' : p[2] === '医師会' ? '医師会' : p[2] === '行政' ? '行政' : '病院');
const matchesCat = p => el.cat.value === 'all' || kindOf(p) === el.cat.value;
const prefectures = D.pref.map(p=>p[0]);
let leafletMap = null, layer = null, rendered = [], visibleMarkers = [], selectedIndex = -1, warnedTiles = false;
let resizeObserver = null;
function getItems() {
 const pref = el.pref.value, mode = el.mode.value;
 const summaries = (mode === 'overview' || (mode === 'places' && pref === '全県'));
 if(summaries) return D.pref.filter(p=>pref==='全県'||p[0]===pref).map(p=>{
   const areas=D.areas.filter(a=>a[0]===p[0]).length;
   const places=D.places.filter(a=>a[0]===p[0]&&(mode==='overview'||matchesCat(a))).length;
   return {kind:'pref',pref:p[0],name:p[0]+'県',detail:areas+'医療圏・主要施設'+places+'件',lat:p[6],lon:p[7],zoom:9,summaryCount:mode==='overview'?areas:places};
 });
 if(mode==='areas') return D.areas.filter(a=>pref==='全県'||a[0]===pref).map(a=>({
   kind:'area',pref:a[0],name:a[1]+'医療圏',detail:a[2]+'｜'+a[3],lat:a[8],lon:a[9],zoom:10
 }));
 return D.places.filter(p=>(pref==='全県'||p[0]===pref)&&matchesCat(p)).map(p=>({
   kind:'place',pref:p[0],name:p[1],detail:p[2],lat:p[3],lon:p[4],zoom:11,site:p[5]||''
 }));
}
function initMap() {
 if(!window.L) {
   el.fallback.hidden=false;
   el.fallback.textContent='地図ライブラリを読み込めませんでした。右の地点一覧と外部地図リンクを利用できます。';
   return;
 }
 try {
   const cssProbe=document.createElement('div');
   cssProbe.className='leaflet-pane';
   cssProbe.style.visibility='hidden';
   document.body.appendChild(cssProbe);
   const cssReady=window.getComputedStyle(cssProbe).position==='absolute';
   cssProbe.remove();
   if(!cssReady){
     el.fallback.hidden=false;
     el.fallback.textContent='地図の表示用スタイルが読み込めなかったため、崩れた地図の表示を停止しています。右の地点一覧と外部地図リンクをご利用ください。';
     return;
   }
   leafletMap=L.map(el.frame,{scrollWheelZoom:false,preferCanvas:true,zoomControl:false,attributionControl:true,keyboard:true,fadeAnimation:false})
      .setView([33.83,133.49],8);
   L.control.zoom({position:'topright'}).addTo(leafletMap);
   L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{
     maxZoom:16,minZoom:6,attribution:'<a href="https://maps.gsi.go.jp/" target="_blank" rel="noopener noreferrer">地理院タイル</a>'
   }).on('tileerror',()=>{
     if(!warnedTiles) {
       warnedTiles=true;
       el.fallback.hidden=false;
       el.fallback.textContent='地理院タイルの取得に失敗しました。地点リストとGoogleマップ・地理院地図リンクは利用できます。';
     }
   }).addTo(leafletMap);
   leafletMap.setMaxBounds([[31.7,130.9],[35.35,135.65]]);
   layer=L.layerGroup().addTo(leafletMap);
   if(window.ResizeObserver) {
     resizeObserver=new ResizeObserver(()=>{if(leafletMap && document.visibilityState!=='hidden')requestAnimationFrame(()=>leafletMap.invalidateSize({pan:false}));});
     resizeObserver.observe(el.frame);
   }
   window.addEventListener('pageshow',()=>{if(leafletMap)leafletMap.invalidateSize({pan:false});});
 }catch(e) {
   leafletMap=null;layer=null;
   el.fallback.hidden=false;
   el.fallback.textContent='地図の描画に失敗しました。右側のリストと地図リンクから各施設を確認できます。';
 }
}
function linkFor(r) {
 const n=r.kind==='pref'?r.name:r.name.replace(/医療圏$/,'');
 return '<div class="map-item-links">' + external(google(n,r.kind==='pref'?'':r.pref),'Googleマップ') +
   external(gsi(r.lat,r.lon),'地理院地図') + (r.site ? external(r.site,'公式サイト') : '') + '</div>';
}
function drawList(items) {
 el.count.textContent=items.length+'地点';
 if(!items.length) {
   el.list.innerHTML='<p class="map-list-empty">この条件に該当する地点はありません。施設種別または都道府県を変更してください。</p>';
   return;
 }
 el.list.innerHTML=items.map((r,i)=>'<div role="listitem" class="map-entry '+r.kind+'">' +
  '<button type="button" class="map-item" data-map-index="'+i+'" aria-pressed="false">' +
  '<span class="map-item-icon" aria-hidden="true">'+(r.kind==='pref'?r.summaryCount:r.kind==='area'?'圏':'医')+'</span>'+
  '<span class="map-item-text"><span class="map-item-name">'+escapeHtml(r.name)+'</span><span class="map-item-sub">'+escapeHtml(r.kind==='pref'?r.detail:r.pref+'県｜'+r.detail)+'</span></span>'+
  '<span class="map-item-arrow" aria-hidden="true">›</span></button>'+linkFor(r)+'</div>').join('');
}
function popupHtml(r) {
 const label=escapeHtml(r.name);
 const tip=r.kind==='pref'?'県内の地点を展開できます。':r.kind==='area'?'代表地点（医療圏境界ではありません）。':'概略座標（正確な施設所在地ではありません）。';
 return '<strong>'+label+'</strong><p style="margin:4px 0;font-size:11px">'+escapeHtml(tip)+'</p>'+linkFor(r);
}
function fitItems(items) {
 if(!leafletMap || !items.length) return;
 const pts=items.map(r=>[Number(r.lat),Number(r.lon)]).filter(p=>p.every(Number.isFinite));
 if(!pts.length)return;
 const viewZoom=el.mode.value==='overview'?8:(el.pref.value==='全県'?8:10);
 if(pts.length===1)leafletMap.setView(pts[0],viewZoom,{animate:false});
 else leafletMap.fitBounds(L.latLngBounds(pts).pad(.23),{padding:[36,36],maxZoom:viewZoom,animate:false});
 requestAnimationFrame(()=>leafletMap.invalidateSize({pan:false}));
}
function selectItem(index,fromMap=false) {
 const r=rendered[index];
 if(!r)return;
 if(r.kind==='pref') {
   el.pref.value=r.pref;
   if(el.mode.value==='overview')el.mode.value='areas';
   update({syncTable:true});
   return;
 }
 selectedIndex=index;
 el.list.querySelectorAll('[data-map-index]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.mapIndex)===index)));
 if(leafletMap && visibleMarkers[index]) {
   const target=visibleMarkers[index];
   leafletMap.setView([r.lat,r.lon],Math.min(11,r.zoom),{animate:false});
   target.openPopup();
 }
 if(fromMap){
   const button=el.list.querySelector('[data-map-index="'+index+'"]');
   if(button)button.setAttribute('aria-pressed','true');
 }
}
function drawMarkers(items) {
 if(!leafletMap||!layer||!window.L)return;
 layer.clearLayers();visibleMarkers=[];
 items.forEach((r,i)=>{
   const pos=[r.lat,r.lon];
   let marker;
   if(r.kind==='pref') {
     marker=L.marker(pos,{icon:L.divIcon({
       className:'map-region-bubble',
       html:'<span class="map-bubble">'+escapeHtml(r.name)+'<small>'+r.summaryCount+(el.mode.value==='places'?'施設':'医療圏')+'</small></span>',
       iconSize:[80,46],iconAnchor:[40,23],popupAnchor:[0,-20]
     }),keyboard:true});
   } else {
     const facility=r.kind==='place';
     marker=L.circleMarker(pos,{radius:facility?7:8,weight:2,color:'#ffffff',
       fillColor:facility?'#c57728':'#119d96',fillOpacity:.93,opacity:1,interactive:true});
   }
   marker.bindPopup(popupHtml(r),{autoPan:true,maxWidth:240});
   marker.on('click',()=>selectItem(i,true));
   marker.addTo(layer);visibleMarkers.push(marker);
 });
 fitItems(items);
}
function update(options={}) {
 const mode=el.mode.value, pref=el.pref.value;
 el.cat.disabled=(mode!=='places');
 el.catField.classList.toggle('is-disabled',mode!=='places');
 if(mode==='overview')el.cat.value='all';
 rendered=getItems();selectedIndex=-1;
 drawList(rendered);
 const description=mode==='overview'?'4県の代表点':mode==='areas'?'二次医療圏の代表地点':'主要医療機関等';
 el.status.textContent=(pref==='全県'?'四国全体':pref+'県')+'・'+description+'（'+rendered.length+'件）';
 if(leafletMap)drawMarkers(rendered);
 if(options.syncTable) {
   const tableFilter=q('areaFilter');
   if(tableFilter && tableFilter.value!==pref) {
     tableFilter.value=pref;
     tableFilter.dispatchEvent(new Event('change',{bubbles:true}));
   }
 }
}
el.list.addEventListener('click',evt=>{
 const button=evt.target.closest('[data-map-index]');
 if(!button || !el.list.contains(button))return;
 selectItem(Number(button.dataset.mapIndex));
});
el.mode.addEventListener('change',()=>update());
el.cat.addEventListener('change',()=>update());
el.pref.addEventListener('change',()=>{if(el.pref.value!=='全県'&&el.mode.value==='overview')el.mode.value='areas';update({syncTable:true});});
el.reset.addEventListener('click',()=>{
 el.mode.value='overview';el.pref.value='全県';el.cat.value='all';
 update({syncTable:true});
});
document.addEventListener('shikoku:area-filter',evt=>{
 const pref=evt.detail?.pref;
 if(!pref || !['全県',...prefectures].includes(pref))return;
 if(el.pref.value===pref)return;
 el.pref.value=pref;
 if(pref!=='全県' && el.mode.value==='overview')el.mode.value='areas';
 update();
});
const areaRows=q('arearows');
areaRows?.addEventListener('click',evt=>{
 const target=evt.target.closest('[data-map-area]');
 if(!target || !areaRows.contains(target))return;
 const area=target.getAttribute('data-map-area'), pref=target.getAttribute('data-map-pref');
 if(!area||!pref)return;
 el.mode.value='areas';el.pref.value=pref;
 update({syncTable:true});
 const index=rendered.findIndex(r=>r.name===area+'医療圏');
 if(index>=0)selectItem(index);
 q('geoSection')?.scrollIntoView({behavior:'smooth',block:'start'});
});
initMap();
update();
})();