(()=>{'use strict';
const $=s=>document.querySelector(s),format=n=>Number(n).toLocaleString('ja-JP');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const google=(name,address)=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(name+' '+address);
const gsi=(lat,lon)=>'https://maps.gsi.go.jp/#15/'+lat+'/'+lon+'/';
const link=(url,label)=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(label)+'</a>';
const scoreWeights=[30,25,20,15,10];
const colors={teal:'#088995',blue:'#397ba6',rose:'#c3516c',gold:'#d6a253',green:'#5d9c81'};
const palette=[colors.rose,colors.blue,colors.teal,colors.gold];
const failChart=canvas=>{const msg=document.createElement('p');msg.className='chart-fallback';msg.textContent='グラフを表示できません。近くの数値表・出典リンクから内容を確認できます。';canvas.replaceWith(msg)};
function drawChart(id,type,labels,datasets,opts={}){
const canvas=$('#'+id);if(!canvas)return;
if(typeof window.Chart!=='function'){failChart(canvas);return}
const horiz=Boolean(opts.horizontal),stacked=Boolean(opts.stacked);
const x=horiz?{beginAtZero:true,stacked,ticks:{color:'#577281',maxTicksLimit:6}}:{stacked,ticks:{color:'#577281',maxRotation:0,autoSkip:true}};
const y=horiz?{stacked,ticks:{color:'#496273',autoSkip:false,font:{size:11}}}:{beginAtZero:true,stacked,ticks:{color:'#577281',maxTicksLimit:6}};
try{new window.Chart(canvas,{type,data:{labels,datasets},options:{responsive:true,maintainAspectRatio:false,indexAxis:horiz?'y':'x',animation:false,
plugins:{legend:{display:datasets.length>1,position:'bottom',labels:{boxWidth:12,usePointStyle:true,pointStyle:'rectRounded',font:{size:11}}},tooltip:{callbacks:{label:context=>context.dataset.label+': '+format(context.parsed[horiz?'x':'y'])+(opts.unit||'')}}},
scales:{x,y},interaction:{mode:'nearest',intersect:false}}})}
catch(err){console.warn('chart error',id,err);failChart(canvas)}
}
function downloadTableCSV(table,fileName){
if(!table)return;
const rows=[...table.querySelectorAll('tr')].map(tr=>[...tr.querySelectorAll('th,td')].map(c=>c.textContent.trim())).filter(row=>row.length);
const csv='\ufeff'+rows.map(row=>row.map(v=>{let s=String(v);if(/^[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'}).join(',')).join('\r\n');
const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
const a=document.createElement('a');a.href=url;a.download=fileName;a.style.display='none';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)
}
fetch('./data.json',{cache:'no-cache'}).then(resp=>{if(!resp.ok)throw Error('HTTP '+resp.status);return resp.json()}).then(data=>{
if(!Array.isArray(data.regions)||data.regions.length!==10||!Array.isArray(data.places)||!Array.isArray(data.populationCohorts)||!Array.isArray(data.facilityCounts))throw Error('地域データ形式が不正');
const regions=data.regions.map(row=>({name:row[0],code:row[1],oldPopulation:row[2],oldForecast:row[3],doctor:row[4],beds:row[5],neededBeds:row[6],lat:row[7],lon:row[8],driver:row[9],challenge:row[10],grades:row[11],score:Math.round(row[11].reduce((n,v,i)=>n+v*scoreWeights[i],0)/5)}));
const population=new Map(data.populationCohorts.map(row=>[row[0],{p2020:row[1],p2030:row[2],p2040:row[3],p2050:row[4],over75_2020:row[5],over75_2040:row[6]}]));
const facilities=new Map(data.facilityCounts.map(row=>[row[0],{hospital:row[1],clinic:row[2]}]));
const list=regions.map(r=>({...r,...population.get(r.code),...facilities.get(r.code)}));
if(list.some(r=>!Number.isFinite(r.p2040)||!Number.isFinite(r.clinic)||!Number.isFinite(r.hospital)))throw Error('医療圏の統計が不足');
if(list.reduce((s,r)=>s+r.hospital,0)!==202||list.reduce((s,r)=>s+r.clinic,0)!==1470)throw Error('医療施設数の合計不整合');
const places=data.places.map(a=>({name:a[0],type:a[1],address:a[2],lat:a[3],lon:a[4],official:a[5]}));
const byCode=new Map(list.map(r=>[String(r.code),r]));
const sorted=[...list].sort((a,b)=>b.score-a.score);
const bednames=['高度急性期','急性期','回復期','慢性期'];
drawChart('doctorChart','bar',list.map(r=>r.name),[{label:'医師偏在指標（2026年）',data:list.map(r=>r.doctor),backgroundColor:list.map(r=>r.doctor>=266.8?colors.teal:colors.blue)}],{horizontal:true});
drawChart('forecastPopulationChart','bar',list.map(r=>r.name),[{label:'2020年実績（人）',data:list.map(r=>r.p2020),backgroundColor:colors.blue},{label:'2040年推計（人）',data:list.map(r=>r.p2040),backgroundColor:colors.green}],{horizontal:true});
drawChart('forecastOlderChart','bar',list.map(r=>r.name),[{label:'2020年（人）',data:list.map(r=>r.over75_2020),backgroundColor:colors.blue},{label:'2040年推計（人）',data:list.map(r=>r.over75_2040),backgroundColor:colors.rose}],{horizontal:true});
drawChart('facilityCountsChart','bar',list.map(r=>r.name),[{label:'一般診療所（施設）',data:list.map(r=>r.clinic),backgroundColor:list.map(r=>r.code===4312?colors.rose:colors.teal)}],{horizontal:true});
drawChart('bedsChart','bar',['2026年病床機能見込','2025年必要病床'],bednames.map((label,i)=>({label,data:[list.reduce((s,r)=>s+r.beds[i],0),list.reduce((s,r)=>s+r.neededBeds[i],0)],backgroundColor:palette[i]})),{stacked:true});
drawChart('needChart','bar',list.map(r=>r.name),bednames.map((label,i)=>({label,data:list.map(r=>r.neededBeds[i]),backgroundColor:palette[i]})),{horizontal:true,stacked:true});
drawChart('scoreChart','bar',sorted.map(r=>r.name),[{label:'独自分析スコア（点）',data:sorted.map(r=>r.score),backgroundColor:sorted.map(r=>r.score>=75?colors.rose:colors.teal)}],{horizontal:true});
drawChart('clinicChart','bar',['全国','福岡','長崎','熊本','大分'],[{label:'人口10万人当たり診療所（2023年）',data:[84.4,94.2,103.9,86,86.4],backgroundColor:[colors.blue,colors.blue,colors.blue,colors.rose,colors.blue]}]);
const projection=$('#projectionBody');
if(projection){let rows=list.map(r=>'<tr><th scope="row">'+esc(r.name)+'</th>'+[r.p2020,r.p2030,r.p2040,r.p2050].map(n=>'<td class="numeric">'+format(n)+'</td>').join('')+'<td class="numeric">'+((r.p2040/r.p2020-1)*100).toFixed(1)+'%</td><td class="numeric">'+format(r.over75_2020)+'</td><td class="numeric">'+format(r.over75_2040)+'</td></tr>').join('');
const sum=key=>list.reduce((s,r)=>s+r[key],0);
rows+='<tr><th scope="row">熊本県計</th>'+['p2020','p2030','p2040','p2050'].map(k=>'<td class="numeric"><b>'+format(sum(k))+'</b></td>').join('')+'<td class="numeric"><b>'+((sum('p2040')/sum('p2020')-1)*100).toFixed(1)+'%</b></td>'+['over75_2020','over75_2040'].map(k=>'<td class="numeric"><b>'+format(sum(k))+'</b></td>').join('')+'</tr>';
projection.innerHTML=rows;
}
const bedBody=$('#bedsBody');if(bedBody)bedBody.innerHTML=list.map(r=>'<tr><th scope="row">'+esc(r.name)+'</th>'+[...r.beds,...r.neededBeds].map(n=>'<td class="numeric">'+format(n)+'</td>').join('')+'<td>'+link('https://scueldata.me/ph/plan/a/'+r.code+'/','地域集計')+'</td></tr>').join('');
const strat=$('#regionBody');if(strat)strat.innerHTML=sorted.map(r=>'<tr><th scope="row">'+esc(r.name)+'</th><td class="numeric"><b>'+r.score+'点</b></td><td>'+esc(r.driver)+'</td><td>'+esc(r.challenge)+'</td><td>'+esc(r.p2040<r.p2020?'人口減少下での機器更新・機能分担・地域連携':'人口・高齢者構造の変化への対応')+'</td></tr>').join('');
const equip=[['CT','検出器列数別・医療施設調査','救急・脳/肺疾患・共同利用'],['MRI','磁場強度別・医療施設調査','整形・脳神経・がん'],['超音波（US）','医療施設調査・診療実績','消化器・循環器・産科・POCUS'],['PET・核医学','専門施設・届出・診療実績','がん診療連携'],['リニアック','放射線治療指定・認定施設','がん治療の専門拠点'],['血管撮影・IVR','循環器・救急機能の公開情報','高度急性期・低侵襲治療'],['内視鏡','検査実施・病院と診療所調査','消化器・健診'],['心電図・生体情報','在宅・循環器・救急部門','遠隔・慢性疾患管理'],['透析装置','人工透析施設と慢性期医療','通院・装置と材料の安定供給']];
const equipment=$('#equipmentBody');if(equipment)equipment.innerHTML=equip.map(e=>'<tr>'+e.map(s=>'<td>'+esc(s)+'</td>').join('')+'<td><span class="pill">設置総数未検証</span></td></tr>').join('');
const sources=$('#sourcesBody');if(sources)sources.innerHTML=data.sources.map(s=>'<div class="source"><strong>'+esc(s[0])+'</strong>'+link(s[3],s[1])+'<small>データ年次：'+esc(s[2])+'</small></div>').join('');
let focusMap=()=>{};
const cards=$('#regionCards'),detail=$('#regionDetail'),focusSelector=$('#focusRegion');
function presentRegion(r,scrollMap=false){
if(!r)return;for(const b of cards?.querySelectorAll('.region-card')||[])b.setAttribute('aria-pressed',String(b.dataset.code===String(r.code)));
if(detail)detail.innerHTML='<strong>'+esc(r.name)+'</strong>　一般診療所：'+format(r.clinic)+'施設（2023年）／病院：'+format(r.hospital)+'施設（2023年）／2040年人口：'+format(r.p2040)+'人（推計）<p>'+esc(r.driver)+'。課題：'+esc(r.challenge)+'。</p>';
if(focusSelector)focusSelector.value=String(r.code);focusMap(r,scrollMap);
}
if(cards){
const max=Math.max(...list.map(r=>r.clinic));
cards.innerHTML=list.map(r=>'<button type="button" class="region-card" data-code="'+r.code+'" aria-pressed="false"><span class="r-name">'+esc(r.name)+'</span><span class="r-count">'+format(r.clinic)+'<small>診療所</small></span><span class="r-label">2023年・人口：'+(r.p2020/10000).toFixed(1)+'万人（2020年）</span><span class="r-spark"><i style="width:'+Math.max(2,r.clinic/max*100).toFixed(1)+'%"></i></span><span class="r-label">2040年人口：'+format(r.p2040)+'人</span></button>').join('');
cards.addEventListener('click',e=>{const button=e.target.closest('button[data-code]');if(button)presentRegion(byCode.get(button.dataset.code),true)})
}
if(focusSelector){focusSelector.innerHTML='<option value="">県内全域を表示</option>'+list.map(r=>'<option value="'+r.code+'">'+esc(r.name)+'</option>').join('')}
const pb=$('#placesBody'),fq=$('#facilityQuery'),fs=$('#facilitySelect');
const officeTypes=['行政','医師会','保健所'];const norm=s=>String(s||'').normalize('NFKC').toLowerCase();
function renderPlaces(){
if(!pb)return;const category=fs?.value||'all',q=norm(fq?.value).trim();
const filtered=places.filter(p=>{const categoryOK=category==='all'||(category==='office'&&officeTypes.includes(p.type))||(category==='hospital'&&!officeTypes.includes(p.type));return categoryOK&&(!q||norm(p.name+' '+p.address+' '+p.type).includes(q))});
pb.innerHTML=filtered.length?filtered.map(p=>'<article class="place"><span class="kind">'+esc(p.type)+'</span><strong>'+esc(p.name)+'</strong><address>'+esc(p.address)+'</address><div class="links">'+link(p.official,'公式サイト')+link(google(p.name,p.address),'Googleマップ')+link(gsi(p.lat,p.lon),'地理院地図')+'</div></article>').join(''):'<p class="fine">条件に一致する施設はありません。検索語を変更してください。</p>';
const counter=$('#facilityHitCount');if(counter)counter.textContent=filtered.length+'件表示／登録'+places.length+'地点（全医療機関の網羅リストではありません）';
}
renderPlaces();fs?.addEventListener('change',renderPlaces);fq?.addEventListener('input',renderPlaces);
$('#saveProjectionCSV')?.addEventListener('click',()=>downloadTableCSV($('#projectionBody')?.closest('table'),'kumamoto-population-projections-2020-2050.csv'));
$('#saveFacilityCSV')?.addEventListener('click',()=>downloadTableCSV($('#facility-counts .scroll table'),'kumamoto-hospitals-clinics-2023.csv'));
$('#saveCSV')?.addEventListener('click',()=>downloadTableCSV($('#bedsBody')?.closest('table'),'kumamoto-beds-planning-comparison.csv'));
const mapEl=$('#map'),mapStatus=$('#mapStatus'),maptype=$('#maptype');
if(mapEl&&window.L){
try{
const map=window.L.map(mapEl,{scrollWheelZoom:false,preferCanvas:true}).setView([32.7,130.7],8);
const tile=window.L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{attribution:'地理院タイル（国土地理院）',maxZoom:18});
let tilesFailed=false;
tile.on('tileerror',()=>{if(!tilesFailed&&mapStatus){tilesFailed=true;mapStatus.innerHTML='一部の地図タイルを取得できません。'+link('https://maps.gsi.go.jp/','地理院地図で開く')}});tile.addTo(map);
const markers=[],areaMarkers=new Map();
function pin(p,kind){
if(!Number.isFinite(p.lat)||!Number.isFinite(p.lon))return;
const marker=window.L.circleMarker([p.lat,p.lon],{radius:kind==='area'?9:5,color:'#fff',weight:1.6,fillColor:kind==='area'?colors.teal:kind==='hospital'?colors.rose:colors.blue,fillOpacity:.9});
const popup='<b>'+esc(p.name)+'</b><p>'+esc(p.address||'医療圏の代表地点（近似）')+'</p>'+(p.address?link(p.official,'公式サイト')+' ｜ '+link(google(p.name,p.address),'Googleマップ')+' ｜ ':'')+link(gsi(p.lat,p.lon),'地理院地図');
marker.bindPopup(popup);marker.on('click',()=>{const info=$('#mapinfo');if(info)info.innerHTML=popup});
markers.push({marker,kind});marker.addTo(map);if(kind==='area')areaMarkers.set(String(p.code),marker);
}
list.forEach(r=>pin({...r,address:''},'area'));
places.forEach(p=>pin(p,officeTypes.includes(p.type)?'office':'hospital'));
const syncMap=()=>{const type=maptype?.value||'all';markers.forEach(m=>{if(type==='all'||type===m.kind){if(!map.hasLayer(m.marker))m.marker.addTo(map)}else if(map.hasLayer(m.marker))map.removeLayer(m.marker)})};
maptype?.addEventListener('change',syncMap);
focusMap=(r,scrollMap)=>{if(maptype&&maptype.value==='hospital'){maptype.value='all';syncMap()}map.flyTo([r.lat,r.lon],10,{animate:!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,duration:.35});const marker=areaMarkers.get(String(r.code));if(marker&&map.hasLayer(marker))marker.openPopup();if(scrollMap)document.querySelector('#map-section')?.scrollIntoView({behavior:'smooth',block:'start'});};
focusSelector?.addEventListener('change',()=>{const r=byCode.get(focusSelector.value);if(r)presentRegion(r,false);else{map.setView([32.7,130.7],8);for(const btn of cards?.querySelectorAll('button[data-code]')||[])btn.setAttribute('aria-pressed','false');if(detail)detail.textContent='県内全域を表示しています。';}});
window.addEventListener('resize',()=>map.invalidateSize(),{passive:true});
}catch(error){console.error('地図描画失敗',error);mapEl.innerHTML='<div class="chart-fallback">地図を表示できません。下の医療機関一覧からGoogleマップ・地理院地図へ移動できます。</div>'}
}else if(mapEl){mapEl.innerHTML='<div class="chart-fallback">地図の読み込みができません。医療機関一覧の外部地図をご利用ください。</div>'}
}).catch(error=>{
console.error('熊本県医療市場データ読み込み失敗',error);
const notice=document.createElement('p');notice.className='note';notice.setAttribute('role','alert');notice.textContent='集計データを読み込めませんでした。基本の施設数一覧は表示できますが、グラフ・絞り込み機能は利用できません。再読み込みをお試しください。';
$('#content')?.prepend(notice);
for(const canvas of document.querySelectorAll('.chartbox canvas'))failChart(canvas);
const rc=$('#regionCards');if(rc)rc.innerHTML='<p class="fine">データが読み込めません。下の数値表と出典を参照してください。</p>'
});
})();
