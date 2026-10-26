"use strict";
const $=s=>document.querySelector(s),fmt=x=>Number(x).toLocaleString('ja-JP');
const src=(key,label=key)=>'<a class="source-ref" href="#source-'+key+'" title="出典 '+key+'">['+label+']</a>';
let dataset,regionChart,popChart,bedsChart,mapObj,markerLayer,weightValues={demand:30,aging:25,scarcity:20,hub:15,resilience:10};
const sourceOrder=['P01','P02','P03','P04','P05','P06','P07','P08','P09','P10','P11','P12','P13','P14','P15','P16','P17','P18','P19','P20','P21','P22','P23','P24','P25','P26','P27'];
const meta={demand:"需要量",aging:"高齢化",scarcity:"人材制約",hub:"高度医療拠点",resilience:"地域完結・BCP"};
function markmap(p){const q=encodeURIComponent(p.name+' '+p.address);return 'https://www.google.com/maps/search/?api=1&query='+q}
function gsifor(p){return 'https://maps.gsi.go.jp/#15/'+p.lat.toFixed(5)+'/'+p.lng.toFixed(5)+'/'}
function mapLinks(p){return '<div class="links"><a target="_blank" rel="noopener noreferrer" href="'+markmap(p)+'">Googleマップ</a><a target="_blank" rel="noopener noreferrer" href="'+gsifor(p)+'">地理院地図</a></div>'}
function score(a){return +(Object.entries(weightValues).reduce((s,[k,w],i)=>s+w*a.scoreInputs[i]/5,0)).toFixed(1)}
function level(v){return v>=85?'優先A':v>=76?'優先B':v>=66?'優先C':'重点テーマ限定'}
function areaCard(a){let v=score(a),d=a.needed2025.recovery-a.report2024.recovery;return '<article class="card region-card"><div style="display:flex;justify-content:space-between;align-items:center"><h3>'+a.name+'</h3><span class="badge estimate">'+level(v)+'</span></div><div class="regional-tags"><span class="mini">判断スコア</span><span class="rank">'+v+'</span><span class="mini">/100</span></div><div class="progress"><i style="width:'+v+'%"></i></div><p class="mini">医療圏の特徴：'+a.drivers+'</p><p><b>主要施設：</b>'+a.hospitals+'</p><p><b>今後3〜5年の機会（独自分析）：</b>'+a.opportunity3to5+'</p><p class="mini">2024年医師数：'+fmt(a.physicians2024)+'人 ／ 2026年医師偏在指標：'+a.physicianMaldistributionIndex2026+' ／ 外来医師偏在指標（第8次前期）：'+a.outpatientPhysicianIndex2024Plan+' '+src('P25')+src('P26')+src('P27')+'</p><p class="mini">回復期 2024報告 '+fmt(a.report2024.recovery)+'床 ／2025必要推計 '+fmt(a.needed2025.recovery)+'床（差 '+fmt(d)+'床、定義差に注意） '+src('P04')+src('P05')+'</p></article>'}
function renderRegions(){
 const areas=[...dataset.areas].sort((a,b)=>score(b)-score(a));
 $('#regions-grid').innerHTML=areas.map(areaCard).join('');
 const html=dataset.areas.map(a=>{
 let r=a.report2024,n=a.needed2025, sc=score(a);
 return '<tr><th scope="row">'+a.name+'</th><td class="num">'+fmt(r.high)+'</td><td class="num">'+fmt(r.acute)+'</td><td class="num">'+fmt(r.recovery)+'</td><td class="num">'+fmt(r.chronic)+'</td><td class="num">'+fmt(r.total)+'</td><td class="num">'+fmt(n.recovery)+'</td><td class="num">'+fmt(n.total)+'</td><td class="num">'+fmt(n.recovery-r.recovery)+'</td><td class="num"><b>'+sc+'</b></td></tr>';
 }).join('');
 $('#area-table').innerHTML=html;
 $('#score-weights').innerHTML=Object.entries(weightValues).map(([k,v])=>'<label>'+meta[k]+' <strong id="val-'+k+'">'+v+'</strong>% <input style="width:100%" type="range" data-weight="'+k+'" min="0" max="50" step="5" value="'+v+'" aria-label="'+meta[k]+'重み"></label>').join('');
 document.querySelectorAll('[data-weight]').forEach(i=>i.addEventListener('change',changeWeight));
 drawAreaCharts(); 
}
function changeWeight(e){const key=e.target.dataset.weight;const v=Number(e.target.value);let base={...weightValues,[key]:v};const others=Object.keys(base).filter(k=>k!==key);const old=others.reduce((s,k)=>s+weightValues[k],0);let rem=100-v,fracs=others.map(k=>({k,v:old?weightValues[k]*rem/old:rem/others.length}));let values={};fracs.forEach(x=>values[x.k]=Math.floor(x.v/5)*5);let deficit=rem-Object.values(values).reduce((a,b)=>a+b,0);for(let j=0;j<Math.round(deficit/5);j++){let k=fracs.map(x=>({k:x.k,frac:x.v-values[x.k]})).sort((a,b)=>b.frac-a.frac)[0].k;values[k]+=5;}weightValues={...values,[key]:v};renderRegions();}
function makeChart(id,type,labels,ds,options){if(typeof Chart==='undefined')return null;let ctx=document.getElementById(id);if(!ctx)return null;return new Chart(ctx,{type,data:{labels,datasets:ds},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:ds.length>1,position:'bottom',labels:{boxWidth:13,font:{size:11}}},tooltip:{mode:'index',intersect:false}},scales:{x:{ticks:{font:{size:11}},stacked:!!options.stacked},y:{beginAtZero:true,stacked:!!options.stacked,ticks:{font:{size:11}}}},...options}})}
function drawAreaCharts(){
 if(typeof Chart==='undefined'){document.querySelectorAll('.chartbox').forEach(e=>{if(!e.querySelector('.mini'))e.insertAdjacentHTML('beforeend','<p class="mini">Chart.js を取得できません。下の数値表をご覧ください。</p>')});return}
 if(bedsChart)bedsChart.destroy();if(regionChart)regionChart.destroy();
 const a=dataset.areas;
 bedsChart=makeChart('beds-chart','bar',a.map(x=>x.name),[
 {label:'高度急性期',data:a.map(x=>x.report2024.high),backgroundColor:'#325aa1'},
 {label:'急性期',data:a.map(x=>x.report2024.acute),backgroundColor:'#388fc1'},
 {label:'回復期',data:a.map(x=>x.report2024.recovery),backgroundColor:'#16a08f'},
 {label:'慢性期',data:a.map(x=>x.report2024.chronic),backgroundColor:'#b8a567'}],{stacked:true});
 let sorted=[...a].sort((x,y)=>score(y)-score(x));
 regionChart=makeChart('score-chart','bar',sorted.map(x=>x.name),[{label:'優先度（分析スコア）',data:sorted.map(score),backgroundColor:'#147e90'}],{indexAxis:'y',scales:{x:{min:0,max:100,ticks:{font:{size:11}}},y:{ticks:{font:{size:11}}}}});
}
function drawPopulation(){
 let p=dataset.populations;
 if(typeof Chart==='undefined')return;
 popChart=makeChart('population-chart','line',p.years.map(String),[
 {label:'埼玉県',data:p.saitama.map(x=>x/1e4),borderColor:'#0a8390',backgroundColor:'#0a8390',borderWidth:3,tension:.15},
 {label:'神奈川県',data:p.kanagawa.map(x=>x/1e4),borderColor:'#6078b9',borderWidth:2,tension:.15},
 {label:'千葉県',data:p.chiba.map(x=>x/1e4),borderColor:'#d68a3d',borderWidth:2,tension:.15}],
 {scales:{x:{title:{display:true,text:'推計対象年'}},y:{title:{display:true,text:'万人'},beginAtZero:false}},plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:c=>c.dataset.label+'：'+fmt(c.parsed.y)+'万人'}}}});
 $('#population-table').innerHTML=[['全国','12614.6','11283.7','10468.6'],['東京都','1404.8','1450.7','1439.9'],['神奈川県','923.7','886.9','852.4'],['埼玉県','734.5','695.3','663.4'],['千葉県','628.4','595.6','569.0'],['茨城県','286.7','247.3','224.5'],['栃木県','193.3','165.8','150.2'],['群馬県','193.9','167.3','152.1']].map(x=>'<tr>'+x.map((y,i)=>'<'+(i===0?'th':'td')+(i>0?' class="num"':'')+'>'+y+'</'+(i===0?'th':'td')+'>').join('')+'</tr>').join('');
}
function renderSources(){
 $('#sources-list').innerHTML=sourceOrder.map(k=>{let s=dataset.sources[k];return '<div id="source-'+k+'"><a href="'+(s.url||'#source-'+k)+'" '+(s.url?'target="_blank" rel="noopener noreferrer"':'')+'><b>'+k+'</b> '+s.title+'<br><small>'+s.year+(s.url?' ／ 一次・公表資料を確認':' ／ 提供資料・公開再利用条件要確認')+'</small></a></div>'}).join('');
}
let currentKind='all',leafletReady=false;
function renderPlaces(){
 if(!dataset)return;const query=($('#place-search').value||'').trim().toLowerCase();
 const filtered=dataset.places.filter(p=>(currentKind==='all'||(currentKind==='hospital'?p.kind==='hospital':currentKind==='health'?p.kind==='health':p.kind!=='hospital'&&p.kind!=='health'))&&(!query||[p.name,p.address,p.type].join(' ').toLowerCase().includes(query)));
 $('#places-list').innerHTML=filtered.map(p=>'<article class="place"><b>'+p.name+'</b><small>'+p.type+' | '+p.address+'</small>'+mapLinks(p)+'</article>').join('')||'<p class="note">該当する施設はありません。</p>';
 $('#place-count').textContent=filtered.length+' 件';
 if(leafletReady){markerLayer.clearLayers();filtered.forEach(p=>{let col=p.kind==='hospital'?'#247a9e':p.kind==='health'?'#c68a32':'#1f997a';const pin=L.circleMarker([p.lat,p.lng],{radius:6,color:'#fff',weight:2,fillColor:col,fillOpacity:.95});pin.bindPopup('<b>'+p.name+'</b><br><small>'+p.address+'</small><br><a target="_blank" rel="noopener" href="'+markmap(p)+'">Googleマップ</a> ／ <a target="_blank" rel="noopener" href="'+gsifor(p)+'">地理院地図</a>');markerLayer.addLayer(pin)})}
}
function initMap(){
 if(typeof L==='undefined'){document.getElementById('map').innerHTML='<p class="note" style="padding:25px">地図タイルを読み込めません。右側の施設一覧からGoogleマップ・地理院地図を開けます。</p>';return}
 mapObj=L.map('map',{scrollWheelZoom:false}).setView([35.96,139.55],9);
 L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{attribution:'<a href="https://maps.gsi.go.jp/" target="_blank" rel="noopener">地理院タイル</a>',maxZoom:18}).addTo(mapObj);
 markerLayer=L.layerGroup().addTo(mapObj);leafletReady=true;renderPlaces();
}
function initFilters(){document.querySelectorAll('[data-kind]').forEach(b=>b.addEventListener('click',()=>{currentKind=b.dataset.kind;document.querySelectorAll('[data-kind]').forEach(a=>a.setAttribute('aria-pressed',a===b?'true':'false'));renderPlaces()}));$('#place-search').addEventListener('input',renderPlaces)}
function addModality(){
 const rows=[
 ['US／超音波','施設・診療科別の保有実態は施設票から集計','診療所・在宅・POCUS・共同利用','検査需要×教育×保守'],
 ['CT','2023年医療施設調査 T74 等で台数確認','救急・がん・診療所画像診断','更新周期・検査回転・線量'],
 ['MRI','2023年医療施設調査 T74 等で台数確認','脳神経・整形・専門病院','共同利用・TCO・稼働率'],
 ['PET／SPECT','同年施設調査・外来機能報告を照合','がん診療・核医学','集約化・搬送・診療連携'],
 ['放射線治療／リニアック','2023年医療施設調査 T75','県立がんセンター・専門拠点','治療件数・保守・施設改修'],
 ['血管撮影／カテーテル','病院別外来機能報告で確認','救急・循環器・脳神経','手術室設備・周辺材・消耗品'],
 ['内視鏡','病院・診療所の診療実績を照合','消化器・健診・外来','洗浄消毒・IT連携'],
 ['心電図／透析','診療科・透析実施施設の母数を照合','循環器・腎臓・慢性疾患','継続消耗品・保守・搬送'],
 ['PACS／遠隔読影','施設の接続・IT実装状況は別途精査','共同利用・病診連携','DICOM連携・レポート・BCP']
 ];$('#modality-tbody').innerHTML=rows.map(r=>'<tr>'+r.map((x,i)=>'<'+(i===0?'th':'td')+'>'+x+'</'+(i===0?'th':'td')+'>').join('')+'</tr>').join('');
}
function boot(){fetch('./data/market.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(d=>{dataset=d;renderRegions();drawPopulation();renderSources();addModality();initFilters();initMap();$('#data-status').textContent='出典付きデータ読み込み完了 ／ 2026-10-26'}).catch(e=>{$('#data-status').textContent='データ読み込みに失敗しました：'+e.message+'。ページを再読み込みしてください。';console.error(e)});
 const btn=$('#nav-toggle');btn?.addEventListener('click',()=>{let n=$('#top-nav');let open=n.classList.toggle('open');btn.setAttribute('aria-expanded',String(open))});document.querySelectorAll('.top-nav a').forEach(a=>a.addEventListener('click',()=>{$('#top-nav').classList.remove('open');$('#nav-toggle').setAttribute('aria-expanded','false')}));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();