/* Saga UI Rev.2 – interaction, charts fallback and accessible links */
(()=>{'use strict';
const $=id=>document.getElementById(id),S=window.SAGA_DATA,L=window.L,map=window.SAGA_MAP;
const safe=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const gmap=(n,a)=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(n+' '+(a||''));
const gsi=(lat,lon)=>'https://maps.gsi.go.jp/#15/'+lat+'/'+lon+'/';
const link=(u,label)=>'<a href="'+safe(u)+'" target="_blank" rel="noopener noreferrer">'+safe(label)+'</a>';
document.querySelectorAll('#sourcesList .source-row a').forEach(a=>{a.title=a.textContent;a.textContent='一次資料・原典を開く ↗'});
const municipality=$('municipalTable');
if(municipality){const wrap=municipality.closest('.table-scroll'),panel=wrap?.parentNode;if(panel&&wrap){
 const details=document.createElement('details');details.className='inline-table';details.id='municipal-details';
 const title=document.createElement('summary');title.textContent='20市町別の施設詳細表を見る（病院・診療所・歯科・人口）';
 panel.insertBefore(details,wrap);details.append(title,wrap);
 window.addEventListener('beforeprint',()=>{details.dataset.wasOpen=String(details.open);details.open=true});
 window.addEventListener('afterprint',()=>{details.open=details.dataset.wasOpen==='true'});
}}
const pictograms=[
 '<circle cx="16" cy="16" r="10"/><circle cx="16" cy="16" r="4"/>',
 '<rect x="5" y="6" width="22" height="20" rx="5"/><circle cx="16" cy="16" r="5"/>',
 '<path d="M4 15c4-5 8-5 12 0s8 5 12 0M4 23c4-5 8-5 12 0s8 5 12 0"/>',
 '<circle cx="16" cy="16" r="5"/><path d="M16 3v7M16 22v7M3 16h7M22 16h7M7 7l5 5M20 20l5 5"/>',
 '<path d="M4 6h13a9 9 0 0 1 9 9v9a3 3 0 0 1-6 0v-7a3 3 0 0 0-3-3H4"/>',
 '<rect x="4" y="7" width="24" height="18" rx="2"/><path d="M7 17h5l3-6 4 12 3-6h4"/>'];
document.querySelectorAll('.device-grid>div').forEach((e,i)=>{const span=document.createElement('span');span.className='device-icon';span.innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true">'+pictograms[i%pictograms.length]+'</svg>';e.prepend(span)});
const grid=document.querySelector('#summary .kpis');if(grid){
 const strip=document.createElement('div');strip.className='insight-strip';
 const items=[['市場の推移','2024年度 223億円','民間参考推計。2020年度186億円から変化','#supplement'],
 ['県内の医療圏','5医療圏・20市町','2024年公的医療施設調査と整合','#regions'],
 ['人口と需要','2050年の医療需要','後期高齢者と生産年齢人口を別系列で推計','#demographic2050']];
 strip.innerHTML=items.map((a,i)=>'<a class="insight" href="'+a[3]+'" style="color:inherit;text-decoration:none"><svg viewBox="0 0 36 36" aria-hidden="true"><rect x="5" y="6" width="26" height="24" rx="4"/><path d="M9 24l7-7 5 4 6-9"/></svg><span><b>'+safe(a[1])+'</b><small>'+safe(a[2])+'</small></span></a>').join('');
 grid.insertAdjacentElement('afterend',strip);
}
const route=document.querySelector('#logistics .route');if(route){
 const figure=document.createElement('figure');figure.className='network-diagram';
 figure.innerHTML='<svg viewBox="0 0 700 135" role="img" aria-label="広域供給、地域配送、医療機関の保守を結ぶ模式図"><defs><marker id="sagaArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#288494"/></marker></defs><g fill="#eff8fa" stroke="#74b8c3" stroke-width="1.5"><rect x="6" y="20" width="170" height="85" rx="10"/><rect x="265" y="20" width="170" height="85" rx="10"/><rect x="524" y="20" width="170" height="85" rx="10"/></g><g fill="none" stroke="#288494" stroke-width="3" marker-end="url(#sagaArrow)"><path d="M184 63h70"/><path d="M444 63h70"/></g><g text-anchor="middle" font-family="sans-serif" fill="#1e566d"><text x="91" y="51" font-size="13" font-weight="700">広域供給</text><text x="91" y="72" font-size="11">在庫・専門技術</text><text x="91" y="89" font-size="11">代替ルート</text><text x="350" y="51" font-size="13" font-weight="700">鳥栖・佐賀</text><text x="350" y="72" font-size="11">物流・設定拠点</text><text x="350" y="89" font-size="11">災害時中継</text><text x="609" y="51" font-size="13" font-weight="700">病院・診療所</text><text x="609" y="72" font-size="11">設置・保守</text><text x="609" y="89" font-size="11">医療の継続</text></g></svg><figcaption>物流と保守BCPの概念図。実際の配送実績・ルートを示すものではありません。</figcaption>';
 route.insertAdjacentElement('afterend',figure);
}
const status=$('mapStatus'),markers=window.SAGA_REGION_MARKERS||[];
if(map&&L&&S){
 const groups={hospitals:L.layerGroup(),public:L.layerGroup()};
 for(const p of S.locations){
  if(!Number.isFinite(p.lat)||!Number.isFinite(p.lon))continue;
  const group=['大学病院','病院'].includes(p.type)?groups.hospitals:groups.public;
  const color=group===groups.hospitals?'#177c9b':'#c18b26';
  const m=L.circleMarker([p.lat,p.lon],{radius:7,color:'#fff',weight:2,fillColor:color,fillOpacity:.95});
  m.bindPopup('<div class="maptip"><strong>'+safe(p.name)+'</strong><small>'+safe(p.type+' / '+p.area)+'</small><div class="map-tip-link">'+link(p.site,'公式サイト')+link(gmap(p.name,p.address),'Googleマップ')+link(gsi(p.lat,p.lon),'地理院地図')+'</div><small>住所付近の概略点</small></div>');
  m.bindTooltip(safe(p.name),{direction:'top'});m.addTo(group);
 }
 for(const p of S.associations){
  if(!Number.isFinite(p.lat)||!Number.isFinite(p.lon))continue;
  const m=L.circleMarker([p.lat,p.lon],{radius:5,color:'#fff',weight:2,fillColor:'#987abe',fillOpacity:.95});
  m.bindPopup('<div class="maptip"><strong>'+safe(p.name)+'</strong><div class="map-tip-link">'+link(p.site,'公式Web')+link(gmap(p.name,p.address),'Google')+link(gsi(p.lat,p.lon),'地理院')+'</div></div>');
  m.addTo(groups.public);
 }
 const buttons=[...document.querySelectorAll('.map-filter')];
 const select=name=>{
  markers.forEach(m=>{if(map.hasLayer(m))map.removeLayer(m)});
  Object.values(groups).forEach(g=>{if(map.hasLayer(g))map.removeLayer(g)});
  if(name==='regions'||name==='all')markers.forEach(m=>m.addTo(map));
  if(name==='hospitals'||name==='all')groups.hospitals.addTo(map);
  if(name==='public'||name==='all')groups.public.addTo(map);
  buttons.forEach(b=>{const active=b.dataset.mapLayer===name;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active))});
  if(status)status.textContent=name==='regions'?'医療圏代表地点の概略表示。公式境界線ではありません。':name==='hospitals'?'主要病院・大学病院の住所付近にピンを表示。':name==='public'?'県庁・保健所・医師会の住所付近にピンを表示。':'医療圏と主要施設を同時表示。重なりはズームで確認できます。';
  map.invalidateSize();
 };
 buttons.forEach(b=>b.addEventListener('click',()=>select(b.dataset.mapLayer)));select('regions');
}else if(status)status.textContent='地図ライブラリを読み込めません。下の施設一覧にGoogleマップ・地理院地図へのリンクがあります。';
if(!window.Chart){document.querySelectorAll('.chart-wrap').forEach(w=>{const canvas=w.querySelector('canvas');if(canvas)canvas.hidden=true;const alt=document.createElement('div');alt.className='chart-unavailable';alt.setAttribute('role','status');alt.textContent='グラフを読み込めません。併記した表・本文の数値をご参照ください。';w.appendChild(alt)})}
const nav=[...document.querySelectorAll('#nav a[href^="#"]')];
if('IntersectionObserver' in window&&nav.length){
 const mapping=new Map(nav.map(a=>[a.getAttribute('href').slice(1),a]));
 const observer=new IntersectionObserver(entries=>{const e=entries.filter(x=>x.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(!e)return;nav.forEach(a=>a.removeAttribute('aria-current'));mapping.get(e.target.id)?.setAttribute('aria-current','location')},{rootMargin:'-85px 0px -65% 0px',threshold:0});
 mapping.forEach((v,k)=>{const el=$(k);if(el)observer.observe(el)});
}
const toTop=document.createElement('button');toTop.id='goTop';toTop.type='button';toTop.textContent='↑';toTop.title='ページ先頭へ';toTop.setAttribute('aria-label','ページ先頭へ戻る');document.body.appendChild(toTop);
const showTop=()=>toTop.classList.toggle('visible',window.scrollY>700);window.addEventListener('scroll',showTop,{passive:true});showTop();
toTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'}));
window.SAGA_UI_QA={mapControls:!!map,markerCount:markers.length,sourceLinks:document.querySelectorAll('#sourcesList a').length,canvases:document.querySelectorAll('canvas').length,municipalDetails:!!$('municipal-details'),sections:document.querySelectorAll('section[id]').length};
})();