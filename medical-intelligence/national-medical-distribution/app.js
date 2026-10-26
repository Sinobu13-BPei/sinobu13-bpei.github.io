'use strict';
document.addEventListener('DOMContentLoaded',()=>{
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const a=(url,label)=>url?`<a target="_blank" rel="noopener noreferrer" href="${esc(url)}">${esc(label)}</a>`:'—';
const num=(x,dec=0)=>x===null||x===undefined||x===''?'非開示':Number(x).toLocaleString('ja-JP',{minimumFractionDigits:0,maximumFractionDigits:dec});
const body=$('industryData');
let d;try{d=JSON.parse(body.textContent)}catch(err){document.querySelector('#groupBody').innerHTML='<tr><td colspan="8">データを読み込めませんでした。</td></tr>';return}
$('metricGroups').textContent=d.groups.length;
$('metricChildren').textContent=d.subsidiaries.length;
const parentAlias={'メディパルホールディングス':'全国','アルフレッサホールディングス':'全国','スズケン':'全国','東邦ホールディングス':'全国'};
function category(v){return {'医薬品卸HD':'薬業卸HD','狭義HD':'医療機器系HD','混合型HD':'複合型HD','非HD大手':'非HD大手'}[v]||v}
function regionTest(obj,val){if(val==='all')return true;let t=(obj.area||''); if(t.includes('全国'))return true;if(val==='東海・北陸')return /東海|北陸|中部|愛知|岐阜|静岡|富山|石川|福井|新潟|長野/.test(t);if(val==='中国・四国')return /中国|四国|岡山|広島|山口|鳥取|島根|徳島|香川|愛媛|高知/.test(t);if(val==='九州・沖縄')return /九州|沖縄|福岡|佐賀|熊本|大分|長崎|宮崎|鹿児島/.test(t);if(val==='関西')return /関西|近畿|京都|大阪|兵庫|滋賀|奈良|和歌山/.test(t);if(val==='関東')return /関東|首都圏|東京|神奈川|埼玉|千葉|群馬|茨城|栃木/.test(t);return t.includes(val)}
const entries=[...d.groups.map(g=>({...g,kind:'parent'})),...d.subsidiaries.map(g=>({...g,kind:'subsidiary',sales:null,devices:null,employees:null,period:'個別非開示'})),...d.finance.map(g=>({...g,category:'その他',financeKind:g.kind,kind:'finance',sales:null,devices:null,employees:null,period:'2026/10 公式確認',activities:g.service,subsidiaries:g.products}))];
function renderTable(){let q=$('searchCompany').value.trim().normalize('NFKC').toLowerCase(),typ=$('typeFilter').value,reg=$('areaFilter').value,mode=$('displayMode').value;
let arr=entries.filter(g=>(mode==='all'||(mode==='parent'?g.kind==='parent':mode==='other'?g.kind==='finance':g.kind==='subsidiary'))&&(typ==='all'||g.category===typ)&&regionTest(g,reg)&&([g.name,g.area,g.activities,g.subsidiaries,g.group].join(' ').normalize('NFKC').toLowerCase().includes(q)));
let h=arr.map(g=>g.kind==='finance'?`<tr><td>${esc(g.name)}<span class="minor">${esc(g.group)}</span></td><td><span class="badge">その他：${esc(g.financeKind)}</span></td><td class="num">対象額非開示</td><td class="num">対象額非開示</td><td class="num">医療専任数非開示</td><td>2026年10月確認</td><td>${esc(g.area)}</td><td>${a(g.source,'公式サービス')}<span class="minor">${esc(g.service)}。${esc(g.note)}</span></td></tr>`:g.kind==='subsidiary'?`<tr><td>${esc(g.name)}<span class="minor">${esc(g.group)} ／ 主要グループ索引</span></td><td><span class="badge">構成・関連</span></td><td class="num">—</td><td class="num">—</td><td class="num">—</td><td>個社非開示</td><td>${esc(g.area)}</td><td>${a(g.source,'グループ公表')}</td></tr>`:`<tr><td>${esc(g.name)}<span class="minor">${esc(g.subsidiaries||g.activities)}</span></td><td><span class="badge">${esc(category(g.category))}</span></td><td class="num">${num(g.sales,2)}</td><td class="num">${num(g.devices)}${g.devices!==null?`<span class="minor">${esc(g.device_kind)}</span>`:''}</td><td class="num">${num(g.employees)}</td><td>${esc(g.period)}<span class="minor">${esc(g.quality)}</span></td><td>${esc(g.area)}</td><td>${a(g.source,'出典')}<span class="minor">${esc(g.notes||'')}</span></td></tr>`).join('');
$('groupBody').innerHTML=h||'<tr><td colspan="8">一致する企業がありません。</td></tr>';$('tableCount').textContent=`${arr.length} 件表示（主要グループ ${d.groups.length}／構成・関連企業 ${d.subsidiaries.length}／その他 ${d.finance.length}）`}
['searchCompany','typeFilter','areaFilter','displayMode'].forEach(id=>$(id).addEventListener(id==='searchCompany'?'input':'change',()=>{if(id==='typeFilter'&&$('typeFilter').value==='構成企業・関連企業')$('displayMode').value='subsidiary';else if(id==='typeFilter'&&$('typeFilter').value==='その他')$('displayMode').value='other';else if(id==='typeFilter'&&$('typeFilter').value==='all'&&['other','subsidiary'].includes($('displayMode').value))$('displayMode').value='parent';else if(id==='displayMode'&&$('displayMode').value==='other')$('typeFilter').value='その他';else if(id==='displayMode'&&$('displayMode').value!=='other'&&$('typeFilter').value==='その他')$('typeFilter').value='all';renderTable()}));$('resetFilters').addEventListener('click',()=>{$('searchCompany').value='';$('typeFilter').value='all';$('areaFilter').value='all';$('displayMode').value='parent';renderTable()});renderTable();
function renderFinance(){const query=$('financeSearch').value.trim().normalize('NFKC').toLowerCase(),kind=$('financeKind').value;
const rows=d.finance.filter(f=>(kind==='all'||f.kind===kind)&&[f.name,f.group,f.model,f.service,f.products,f.note].join(' ').normalize('NFKC').toLowerCase().includes(query));
$('financeBody').innerHTML=rows.map(f=>'<tr><td>'+esc(f.name)+'<small>'+esc(f.group)+'</small></td><td><span class="fin-tag '+(f.kind==='リース'?'lease':f.kind==='レンタル'?'rent':'')+'">'+esc(f.kind)+'</span></td><td>'+esc(f.service)+'<small>'+esc(f.products)+'</small></td><td>'+esc(f.area)+'<small>'+esc(f.scale||'医療事業単独数値：非開示')+'</small></td><td>'+a(f.source,'公式ページ ↗')+'<small>'+esc(f.scope)+'</small><small>'+esc(f.note)+'</small></td></tr>').join('')||'<tr><td colspan="5">一致する企業・サービスはありません。</td></tr>';
$('financeCount').textContent=rows.length+' 社・サービス表示／調査対象 '+d.finance.length+' 社（全社売上や医療機器融資額のランキングではありません）';
}
$('financeSearch').addEventListener('input',renderFinance);$('financeKind').addEventListener('change',renderFinance);$('financeReset').addEventListener('click',()=>{$('financeSearch').value='';$('financeKind').value='all';renderFinance()});renderFinance();
$('consultGrid').innerHTML=d.consultants.map((c,i)=>`<article><span class="unitLabel teal">${String(i+1).padStart(2,'0')} / PROCUREMENT</span><h3>${esc(c.name)}</h3><p>${esc(c.service)}</p><p><b>対象：</b>${esc(c.area)}<br><b>医療機器取扱高：</b>非開示<br><b>従業員：</b>個別非開示</p>${a(c.source,'公式サービス・事業情報 ↗')}</article>`).join('');
$('sourcesList').innerHTML=d.sources.map((s,i)=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}<small>${esc(s.year)} ／ 原典を開く ↗</small></a>`).join('');
$('prefectures').innerHTML=d.prefectures.map(p=>`<a title="Googleマップで${esc(p.name)}を確認" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(p.name+' 医療機関')}" target="_blank" rel="noopener noreferrer">${esc(p.name)}</a>`).join('');
// Figures are not a 47-prefecture head-office density map; city hubs are a geographic reading aid.
const pick=$('regionPicker');d.regions.forEach((r,i)=>pick.insertAdjacentHTML('beforeend',`<option value="${i}">${esc(r.name)}</option>`));
function regionInfo(i){if(i==='all'){$('regionName').textContent='全国俯瞰';$('regionDesc').textContent='地域の医療需要、物流・災害リスク、地域専門商社を重ねて評価。ピンは代表都市を示します。';$('regionPlayers').innerHTML=d.regions.map(r=>`<span>${esc(r.name)}</span>`).join('');return}const r=d.regions[Number(i)];$('regionName').textContent=r.name;$('regionDesc').textContent=r.description;$('regionPlayers').innerHTML=r.players.map(n=>`<span>${esc(n)}</span>`).join('')}
pick.addEventListener('change',()=>regionInfo(pick.value));regionInfo('all');
$('regionStrategies').innerHTML='<p class="sourceTiny">選択した地域の説明は地図右側に表示しています。7地域の比較は地図・地域セレクターをご利用ください。</p>';

function drawStaticGeo(){
 const root=$('map'),xy=(lon,lat)=>[40+(lon-122)*32,26+(46-lat)*19];
 const poly=c=>c.map(([x,y])=>xy(x,y).map(v=>v.toFixed(1)).join(',')).join(' ');
 const islandShapes=[
 [[139.3,41.5],[140.4,41.2],[141.8,42.0],[143.1,42.1],[145.8,43.5],[144.0,44.6],[143.3,45.4],[142.2,44.1],[141.4,45.1],[140.6,43.6],[140.0,42.7]],
 [[140.7,41.5],[141.4,40.5],[141.5,38.4],[140.8,37.0],[140.9,36.1],[139.8,35.0],[138.0,34.6],[136.0,34.3],[134.8,34.2],[133.0,34.1],[131.0,34.2],[130.9,35.0],[133.0,35.8],[135.1,35.4],[137.1,35.1],[139.1,37.1],[139.2,39.5]],
 [[130.9,34.5],[129.8,33.7],[129.6,32.4],[130.5,31.1],[131.7,31.5],[131.6,32.5],[130.9,33.3],[131.6,34.0]],
 [[132.0,34.4],[133.2,34.1],[134.7,34.1],[134.7,33.5],[133.3,33.3],[132.1,33.6]],
 [[127.4,26.6],[127.9,26.3],[127.7,26.0],[127.3,26.2]]
 ];
 const islands=islandShapes.map(p=>'<polygon points="'+poly(p)+'" fill="#d9e8da" stroke="#83aa9c" stroke-width="1.5" stroke-linejoin="round"/>').join('');
 const offsets=[[12,-15],[17,-15],[17,18],[-92,-15],[-80,20],[-100,16],[16,17]];
 const pins=d.regions.map((r,i)=>{const [x,y]=xy(r.lng,r.lat),[dx,dy]=offsets[i]||[12,-12];return '<g data-mapregion="'+i+'" tabindex="0" role="button" aria-pressed="false" aria-label="'+esc(r.name)+'を選択" class="map-static-region"><title>'+esc(r.name)+' - '+esc(r.hub)+'</title><circle cx="'+x+'" cy="'+y+'" r="12" fill="#f2ffff"/><circle cx="'+x+'" cy="'+y+'" r="7" fill="#117487" stroke="#fff" stroke-width="2"/><text x="'+(x+dx)+'" y="'+(y+dy)+'" font-size="15" fill="#174c63" font-weight="700" stroke="#f6fbfc" stroke-width="3" paint-order="stroke">'+esc(r.name)+'</text></g>'}).join('');
 root.innerHTML='<div class="map-static"><div class="map-static-header"><b>日本全国・7地域の事業環境</b><span>地図ライブラリが利用できない場合の概略地図</span></div><svg viewBox="0 0 900 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="日本列島の概略図と7地域の代表都市配置。丸印を選んで地域情報を表示できます"><rect width="900" height="480" fill="#f2f8fa"/>'+islands+pins+'<text x="52" y="455" font-size="13" fill="#597680">概略形状・代表都市のみ。正確な行政界や所在地を表しません。</text></svg><div class="map-static-links"><a href="https://maps.gsi.go.jp/" target="_blank" rel="noopener noreferrer">地理院地図で確認 ↗</a><a href="https://www.google.com/maps/search/?api=1&amp;query=%E6%97%A5%E6%9C%AC" target="_blank" rel="noopener noreferrer">Google マップ ↗</a></div></div>';
 const sync=()=>root.querySelectorAll('[data-mapregion]').forEach(g=>{const isSelected=pick.value===g.getAttribute('data-mapregion');g.classList.toggle('selected',isSelected);g.setAttribute('aria-pressed',String(isSelected))});
 root.querySelectorAll('[data-mapregion]').forEach(g=>{const action=()=>{pick.value=g.getAttribute('data-mapregion');regionInfo(pick.value);sync()};g.addEventListener('click',action);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();action()}})});
 pick.addEventListener('change',sync);
}
if(window.L){
 try{
 let mapActive=true,tileLoaded=false,tileFailures=0;
 const map=L.map('map',{zoomControl:true,scrollWheelZoom:false}).setView([37.1,137.6],5);
 const tiles=L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{attribution:'地理院タイル © 国土地理院',maxZoom:17}).addTo(map);
 tiles.on('tileload',()=>{tileLoaded=true});
 tiles.on('tileerror',()=>{tileFailures++;if(!tileLoaded&&tileFailures>=3&&mapActive){mapActive=false;try{map.remove()}catch(e){}drawStaticGeo()}});
 d.regions.forEach((r,i)=>{const marker=L.marker([r.lat,r.lng]).addTo(map);
 marker.bindPopup('<b>'+esc(r.name)+' / '+esc(r.hub)+'</b><div>'+esc(r.description)+'</div><p>'+a('https://maps.gsi.go.jp/#12/'+r.lat+'/'+r.lng+'/','地理院地図')+'</p>');
 marker.on('click',()=>{pick.value=String(i);regionInfo(String(i))})});
 pick.addEventListener('change',()=>{if(!mapActive)return;if(pick.value==='all')map.setView([37.1,137.6],5);else{const r=d.regions[Number(pick.value)];map.setView([r.lat,r.lng],8)}});
 }catch(error){$('map').innerHTML='';drawStaticGeo()}
}else{drawStaticGeo()}

function staticBars(target,rows,caption){
const usable=rows.filter(x=>Number.isFinite(Number(x.value))).slice(0,10),max=Math.max(1,...usable.map(x=>Number(x.value)));
const content=usable.map(x=>{const ratio=Math.max(0,Number(x.value)/max*100);return '<div class="static-bar-row"><span title="'+esc(x.name)+'">'+esc(x.name)+'</span><div class="static-bar-track"><div class="static-bar-fill" style="width:'+ratio.toFixed(1)+'%"></div></div><strong>'+esc(num(x.value,2))+'</strong></div>'}).join('');
$(target).parentElement.innerHTML='<div class="static-chart" role="img" aria-label="'+esc(caption)+'"><div class="static-chart-body">'+content+'</div><small>'+esc(caption)+'。グラフライブラリに依存しない表示です。</small></div>';
}
function staticShare(target,parts){
const total=parts.reduce((a,x)=>a+x[1],0)||1;
const palette=['#117688','#6498a4','#c2975e','#8178a8','#6a9c76','#c28088','#8aa8b7'];
const segments=parts.map((x,i)=>'<span style="width:'+(x[1]/total*100).toFixed(2)+'%;background:'+palette[i%palette.length]+'"></span>').join('');
const legend=parts.map((x,i)=>'<li><i style="background:'+palette[i%palette.length]+'"></i><span>'+esc(x[0])+'</span><b>'+esc(x[1])+'件</b></li>').join('');
$(target).parentElement.innerHTML='<div class="static-chart"><div class="static-sharebar" role="img" aria-label="企業の区分別構成比">'+segments+'</div><ul class="static-legend">'+legend+'</ul><small>調査対象内の構成比。国内市場シェアではありません。</small></div>';
}
if(window.Chart){const make=(el,list,label,color)=>{const labels=list.map(x=>x.name.replace('ホールディングス','HD').replace('ホールディング','HD').replace('HOLDINGS','HD'));return new Chart($(el),{type:'bar',data:{labels,datasets:[{label,data:list.map(x=>x.sales),backgroundColor:color,borderRadius:3}]},options:{maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false},tooltip:{callbacks:{label:i=>`${num(i.parsed.x,2)}億円（全社売上・期別）`}}},scales:{x:{beginAtZero:true,title:{display:true,text:'全社売上（億円）'}}}}})};const pharma=d.groups.filter(g=>(g.category==='医薬品卸HD'||g.category==='混合型HD')&&Number(g.sales)>0).sort((a,b)=>b.sales-a.sales);const device=d.groups.filter(g=>['狭義HD','混合型HD','非HD大手'].includes(g.category)&&Number(g.sales)>0).sort((a,b)=>b.sales-a.sales).slice(0,10);make('pharmaChart',pharma,'連結全社売上','#1b6b7c');make('deviceChart',device,'連結全社売上','#0a8a87');const typeCounts=Object.entries(d.groups.reduce((o,g)=>(o[category(g.category)]=(o[category(g.category)]||0)+1,o),{}));new Chart($('categoryChart'),{type:'doughnut',data:{labels:typeCounts.map(x=>x[0]),datasets:[{data:typeCounts.map(x=>x[1]),backgroundColor:['#167a8b','#547caa','#d5a14f','#a98fc6','#8fadb8']}]},options:{maintainAspectRatio:false,plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:x=>`${x.label}：${x.parsed}グループ（選定19内）`}}}}})}else{
const pharma=d.groups.filter(g=>(g.category==='医薬品卸HD'||g.category==='混合型HD')&&Number(g.sales)>0).sort((a,b)=>b.sales-a.sales).map(g=>({name:g.name.replace('ホールディングス','HD'),value:g.sales}));
const devices=d.groups.filter(g=>['狭義HD','混合型HD','非HD大手'].includes(g.category)&&Number(g.sales)>0).sort((a,b)=>b.sales-a.sales).slice(0,10).map(g=>({name:g.name.replace('ホールディングス','HD'),value:g.sales}));
const typeCounts=Object.entries(d.groups.reduce((o,g)=>(o[category(g.category)]=(o[category(g.category)]||0)+1,o),{}));
staticBars('pharmaChart',pharma,'連結等全社売上（億円）');staticBars('deviceChart',devices,'連結等全社売上（億円）');staticShare('categoryChart',typeCounts);
}
// Hypothesis-only qualitative scoring to demonstrate explicit weights. Never imply observed market ranking.
const score=[['北海道',3,2,3,5,3],['東北',3,3,3,4,3],['関東',5,5,2,3,5],['東海・北陸',4,4,3,3,4],['関西',5,5,2,3,5],['中国・四国',3,3,3,5,3],['九州・沖縄',4,4,3,5,3]],weights=[30,25,20,15,10];
if(window.Chart){const s1=score.map(x=>({name:x[0],value:Math.round(x.slice(1).reduce((acc,v,i)=>acc+v*weights[i]/5,0))}));new Chart($('regionScoreChart'),{type:'line',data:{labels:s1.map(v=>v.name),datasets:[{label:'地域仮説スコア（0–100）',data:s1.map(v=>v.value),borderColor:'#0e8292',backgroundColor:'#b7e5e8',fill:true,tension:0.18}]},options:{maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{min:0,max:100,title:{display:true,text:'仮スコア（実測値ではない）'}}}}})}else{const values=score.map(x=>({name:x[0],value:Math.round(x.slice(1).reduce((a,v,i)=>a+v*weights[i]/5,0))}));staticBars('regionScoreChart',values,'地域の仮説評価（0–100、実測市場規模ではありません）');}
$('scoreBody').innerHTML=score.map(row=>{const total=row.slice(1).reduce((acc,v,i)=>acc+v*weights[i]/5,0);return `<tr><td>${esc(row[0])} <span class="minor">独自仮説</span></td>${row.slice(1).map(v=>`<td class="num">${v}/5</td>`).join('')}<td class="num"><b>${Math.round(total)}</b></td></tr>`}).join('');
const menu=$('menu');menu.addEventListener('click',()=>{const n=$('siteNav'),state=!n.classList.contains('open');n.classList.toggle('open',state);menu.setAttribute('aria-expanded',String(state))});$('siteNav').querySelectorAll('a').forEach(n=>n.addEventListener('click',()=>{$('siteNav').classList.remove('open');menu.setAttribute('aria-expanded','false')}));
});
