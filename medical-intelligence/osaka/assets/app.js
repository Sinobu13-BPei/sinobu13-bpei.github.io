(function(){"use strict";
const fmt=n=>Number(n).toLocaleString("ja-JP");
const byId=id=>document.getElementById(id);
const esc=t=>String(t).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const sourceLink=id=>'<a href="#src-'+esc(id)+'">出典</a>';
const mapGoogle=(name,addr)=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(name+' '+addr);
const mapGsi=(lat,lng)=>'https://maps.gsi.go.jp/#15/'+Number(lat).toFixed(5)+'/'+Number(lng).toFixed(5)+'/&base=std&ls=std&disp=1&vs=c1g1j0h0k0l0u0t0z0r0s0m0f1';
const links=(row,area)=>{const ref=area||row;let html='<div class="links"><a href="'+esc(mapGoogle(row.name,row.address||('大阪府'+row.area)))+'" target="_blank" rel="noopener noreferrer">Googleマップ</a>';if(ref.lat!=null)html+='<a href="'+esc(mapGsi(ref.lat,ref.lng))+'" title="地理院地図（概略参照。正確な施設座標は要照合）" target="_blank" rel="noopener noreferrer">地理院地図（参考）</a>';else html+='<a href="https://maps.gsi.go.jp/" target="_blank" rel="noopener noreferrer">地理院地図で検索</a>';return html+'</div>'};
const $=(id,html)=>{const e=byId(id);if(e)e.innerHTML=html};
const framework=[
["PEST","政策：病床分化・医師の働き方改革・共同利用／経済：保守費・投資制約／社会：都心集中と周辺アクセス／技術：画像IT・省人化・BCP"],
["3C","Customer＝病院・診療所・住民、Company＝中立商社の接続力、Competitor＝直販・総合商社・IT・SPD・検査共同利用"],
["STP","Segmentation＝8医療圏×救急/がん/在宅×装置領域。Targeting＝課題と実行可能性で区域を選ぶ。Positioning＝調達から診療運用まで支援"],
["4P","Product＝機器・IT・保守・教育、Price＝総所有費用、Place＝地域流通と共同利用、Promotion＝客観的な比較・症例教育"],
["4C","Customer Value＝検査アクセス・品質、Cost＝保守と人員も含む負担、Convenience＝紹介・予約動線、Communication＝臨床職種間の合意"],
["VRIO","Value＝診療成果、Rarity＝地域横断の実務知識、Imitability＝継続的な連携・実装体制、Organization＝コンプライアンスと知見を更新する仕組み"],
["5F","既存競争：高い／新規参入：規制・技術支援が障壁／供給者：特定機種は交渉力大／買い手：大規模病院の調達力大／代替：共同利用・アウトソース"]
];
const neighbors=[["大阪",8838,7263],["兵庫",5465,4358],["京都",2578,2076],["滋賀",1414,1223],["奈良",1324,950],["和歌山",923,632]];
function score(a,d){const scale=25*a.beds/Math.max(...d.areas.map(x=>x.beds));const acute=20*(a.functions[0]+a.functions[1])/a.beds;const rehab=20*Math.min(1,Math.max(0,(a.need2025[2]-a.functions[2])/a.need2025[2]));const ph=20*Math.min(1,Math.max(0,(380-a.physician2026)/(380-210)));const access=15*a.accessDifficulty/5;return Math.round((scale+acute+rehab+ph+access)*10)/10}
function fallback(id,rows){const e=byId(id);if(e)e.classList.add("show");$(id,'<table><tbody>'+rows.map(x=>'<tr>'+x.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table>')}
function chart(id,fb,config,rows){try{if(typeof Chart==='undefined')throw Error('Chart unavailable');Chart.defaults.font.family='"Noto Sans JP",system-ui,sans-serif';new Chart(byId(id),config)}catch(e){if(byId(id))byId(id).style.display='none';fallback(fb,rows)}}
function render(d){const a=d.areas;const aSorted=[...a].sort((x,y)=>score(y,d)-score(x,d));
const bedsTable=a.map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+fmt(x.beds)+'</td>'+x.functions.map(v=>'<td>'+fmt(v)+'</td>').join('')+'<td>'+fmt(x.need2025.reduce((p,n)=>p+n,0))+'</td><td>'+x.physician2026+'</td></tr>').join('');
byId('bedsTable').querySelector('tbody').innerHTML=bedsTable;
$('areaSelect',byId('areaSelect').innerHTML+a.map(x=>'<option value="'+esc(x.name)+'">'+esc(x.name)+'</option>').join(''));
function areasPaint(){const selected=byId('areaSelect').value,q=byId('areaSearch').value.trim().toLowerCase();const subset=aSorted.filter(x=>(!selected||selected===x.name)&&(!q||(x.name+' '+x.driver+' '+x.focus+' '+x.opportunity+' '+x.municipalities).toLowerCase().includes(q)));
$('areaCards',subset.length?subset.map(x=>'<article class="regioncard"><div class="head"><h3>'+esc(x.name)+' <span class="chip">探索指数 / 独自分析</span></h3><div class="score">'+score(x,d)+'/100</div></div><p><b>需要の特徴：</b>'+esc(x.driver)+'</p><p><b>注目施設：</b>'+esc(x.focus)+'</p><p><b>今後3–5年の機会：</b>'+esc(x.opportunity)+'</p><dl><div><dt>2025報告病床</dt><dd>'+fmt(x.beds)+'床</dd></div><div><dt>医師偏在指標（2026）</dt><dd>'+x.physician2026+'</dd></div><div><dt>2025回復期（報告）</dt><dd>'+fmt(x.functions[2])+'床</dd></div><div><dt>2018年資料の2025必要量（回復期）</dt><dd>'+fmt(x.need2025[2])+'床</dd></div></dl><p><small>市町村：'+esc(x.municipalities)+'</small></p>'+links({name:x.name+'二次医療圏',area:x.name,address:'大阪府'+x.municipalities.split('・')[0]},x)+'<p class="source"><a href="#src-beds">病床2025</a> ／ <a href="#src-needed">旧必要量2018</a> ／ <a href="#src-phys">医師2026</a></p></article>').join(''):'<p>一致する医療圏がありません。</p>')}
areasPaint();byId('areaSelect').addEventListener('change',areasPaint);byId('areaSearch').addEventListener('input',areasPaint);
$('facilityList',d.facilities.map(x=>'<article class="fac"><span class="tag">'+esc(x.type)+' / '+esc(x.area)+'</span><h4>'+esc(x.name)+'</h4><address>'+esc(x.address)+'</address>'+links(x)+'<p class="source">'+sourceLink(x.source)+'</p></article>').join(''));
// The 64 medical association directory is rendered once in clinic-facilities.js.
$('hokenList',d.hokens.map(x=>'<article class="fac"><span class="tag">'+esc(x.area)+'</span><h4>'+esc(x.name)+'</h4><address>'+esc(x.address)+'</address>'+links(x)+'<p class="source">'+sourceLink(x.source)+'</p></article>').join(''));
$('dealerList',d.dealers.map(x=>'<article><span>'+esc(x.category)+'</span><h3>'+esc(x.names)+'</h3><p>'+esc(x.role)+'</p><p class="source">'+sourceLink(x.source)+'</p></article>').join(''));
$('deviceList',d.device.map(x=>'<article class="device"><h3>'+esc(x.modality)+'</h3><small>'+esc(x.target)+'</small><p>'+esc(x.drivers)+'</p><p class="source">データ補強課題：'+esc(x.gap)+'。<a href="#src-medical">2023医療施設調査</a>／<a href="#src-facplan">病院プラン</a></p></article>').join(''));
$('frameworks',framework.map(x=>'<article><h4>'+esc(x[0])+'</h4><p>'+esc(x[1])+'</p></article>').join(''));
$('sourceList',d.sources.map(x=>'<article id="src-'+esc(x.id)+'"><b>'+esc(x.name)+'</b><small>データ年次・時点：'+esc(x.year)+'</small><a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">'+esc(x.url)+'</a></article>').join(''));
const years=Object.keys(d.population.ipss);const pop=Object.values(d.population.ipss).map(n=>n/1e4);const pop65=Object.values(d.population.ipss65).map(n=>n/1e4);
const common={responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}};
chart('popChart','popFallback',{type:'line',data:{labels:years,datasets:[{label:'総人口（万人）',data:pop,borderColor:'#0c7893',backgroundColor:'#0c789322',tension:.25,fill:true},{label:'65歳以上（万人）',data:pop65,borderColor:'#dc9460',tension:.25}]},options:{...common,scales:{y:{beginAtZero:true}}}},years.map((y,i)=>[y,Math.round(pop[i])+'万人',Math.round(pop65[i])+'万人']));
chart('neighborsChart','neighborsFallback',{type:'bar',data:{labels:neighbors.map(x=>x[0]),datasets:[{label:'2020–2050人口増減率（%）',data:neighbors.map(x=>+((x[2]/x[1]-1)*100).toFixed(1)),backgroundColor:'#0b7894'}]},options:{...common,indexAxis:'y',scales:{x:{max:0}}}},neighbors.map(x=>[x[0],((x[2]/x[1]-1)*100).toFixed(1)+'%']));
chart('bedsChart','bedsFallback',{type:'bar',data:{labels:['高度急性期','急性期','回復期','慢性期'],datasets:[{label:'2025年病床機能報告',data:d.beds.functions,backgroundColor:'#117d97'},{label:'旧計画の2025年必要病床数',data:d.beds.neededOld,backgroundColor:'#de9f5e'}]},options:common},d.beds.functions.map((x,i)=>[['高度急性期','急性期','回復期','慢性期'][i],fmt(x),fmt(d.beds.neededOld[i])]));
chart('areaBedsChart','areaBedsFallback',{type:'bar',data:{labels:a.map(x=>x.name),datasets:['高度急性期','急性期','回復期','慢性期'].map((name,i)=>({label:name,data:a.map(x=>x.functions[i]),backgroundColor:['#176a90','#4b8caa','#6fb3a6','#da9f67'][i]}))},options:{...common,scales:{x:{stacked:true},y:{stacked:true}}}},a.map(x=>[x.name,...x.functions.map(fmt)]));
chart('priorityChart','priorityFallback',{type:'bar',data:{labels:aSorted.map(x=>x.name),datasets:[{label:'暫定優先度 / 100',data:aSorted.map(x=>score(x,d)),backgroundColor:'#1a7891'}]},options:{...common,indexAxis:'y',scales:{x:{min:0,max:100}}}},aSorted.map(x=>[x.name,score(x,d)]));
const clinic=[['大阪',214],['兵庫',166],['京都',36],['奈良',25],['和歌山',51],['滋賀',19]];
chart('ctClinicChart','ctClinicFallback',{type:'bar',data:{labels:clinic.map(x=>x[0]),datasets:[{label:'2023年 診療所16–63列CT（台、二次集計）',data:clinic.map(x=>x[1]),backgroundColor:'#176f94'}]},options:common},clinic);
try{if(typeof L!=='undefined'){const map=L.map('map',{scrollWheelZoom:false}).setView([34.66,135.51],9);L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{attribution:'地理院タイル（国土地理院）',maxZoom:18}).addTo(map);a.forEach(x=>L.circleMarker([x.lat,x.lng],{radius:9,weight:2,color:'#073e66',fillColor:'#12a5ab',fillOpacity:.85}).addTo(map).bindPopup('<b>'+esc(x.name)+'</b><p>医療圏の概略代表点（境界・病院の所在地ではありません）</p><button type="button" data-area="'+esc(x.name)+'" style="cursor:pointer;border:1px solid #a9d5d8;background:#eef9f8;border-radius:6px;color:#0d5169;padding:5px 9px;font-weight:700">この医療圏を分析</button><p><a href="'+esc(mapGsi(x.lat,x.lng))+'" target="_blank" rel="noopener noreferrer">地理院地図で確認</a></p>'));setTimeout(()=>map.invalidateSize(),100)}else byId('mapFallback').textContent='外部地図ライブラリ未読込。代表点・住所の確認は下の医療圏一覧を参照。'}catch(e){byId('mapFallback').textContent='地図読み込み失敗。下の地図リンクから参照できます。'}
}
fetch('./data/data.json?v=20261027',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(render).catch(err=>{$('areaCards','<div class="notice"><b>データ読込エラー</b><p>公開版の data/data.json を確認してください。 '+esc(err.message)+'</p></div>')});
const btn=byId('navbtn');const nav=byId('nav');if(btn&&nav){btn.addEventListener('click',()=>{let open=!nav.classList.contains('open');nav.classList.toggle('open',open);btn.setAttribute('aria-expanded',String(open))});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');btn.setAttribute('aria-expanded','false')}))};
})();