(()=>{'use strict';
const $=s=>document.querySelector(s),format=n=>Number(n).toLocaleString('ja-JP');
const google=(n,a)=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(n+' '+a);
const gsi=(lat,lon)=>'https://maps.gsi.go.jp/#15/'+lat+'/'+lon+'/';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(u,t)=>'<a target="_blank" rel="noopener noreferrer" href="'+esc(u)+'">'+esc(t)+'</a>';
const weights=[30,25,20,15,10];
fetch('./data.json').then(r=>{if(!r.ok)throw Error('データ取得失敗');return r.json()}).then(d=>{
const regions=d.regions.map(a=>({name:a[0],code:a[1],p:a[2],f:a[3],doctor:a[4],beds:a[5],need:a[6],lat:a[7],lon:a[8],driver:a[9],challenge:a[10],grades:a[11],score:Math.round(a[11].reduce((s,n,i)=>s+n*weights[i],0)/5)}));
const places=d.places.map(a=>({name:a[0],type:a[1],address:a[2],lat:a[3],lon:a[4],official:a[5]}));
const chart=(id,type,labels,datasets,opt={})=>{const canvas=$('#'+id);if(!canvas)return;if(typeof Chart==='undefined'){canvas.insertAdjacentHTML('afterend','<p>グラフライブラリに接続できません。下記の表をご覧ください。</p>');return}new Chart(canvas,{type,data:{labels,datasets},options:{responsive:true,maintainAspectRatio:false,indexAxis:opt.horizontal?'y':'x',plugins:{legend:{display:datasets.length>1,labels:{boxWidth:11,font:{size:10}}}},scales:opt.stacked?{x:{stacked:true},y:{stacked:true,beginAtZero:true}}:opt.horizontal?{x:{beginAtZero:opt.positive!==false},y:{ticks:{font:{size:10}}}}:{y:{beginAtZero:opt.positive!==false}}}})};
const teal='#158e9e',blue='#2a6894',rose='#d05167',gold='#d5a252',green='#55a787',colors=[rose,blue,teal,gold];
chart('populationChart','bar',regions.map(r=>r.name),[{label:'2024年（万人）',data:regions.map(r=>r.p),backgroundColor:blue},{label:'2040年推計（万人）',data:regions.map(r=>r.f),backgroundColor:green}],{horizontal:true});
chart('doctorChart','bar',regions.map(r=>r.name),[{label:'医師偏在指標（2026年）',data:regions.map(r=>r.doctor),backgroundColor:regions.map(r=>r.doctor>=266.8?teal:blue)}],{horizontal:true});
const bednames=['高度急性期','急性期','回復期','慢性期'];
chart('bedsChart','bar',['2026年病床機能見込','2025年必要病床'],bednames.map((t,i)=>({label:t,data:[regions.reduce((s,r)=>s+r.beds[i],0),regions.reduce((s,r)=>s+r.need[i],0)],backgroundColor:colors[i]})),{stacked:true});
chart('needChart','bar',regions.map(r=>r.name),bednames.map((t,i)=>({label:t,data:regions.map(r=>r.need[i]),backgroundColor:colors[i]})),{horizontal:true,stacked:true});
const sorted=[...regions].sort((a,b)=>b.score-a.score);
chart('scoreChart','bar',sorted.map(r=>r.name),[{label:'独自優先度',data:sorted.map(r=>r.score),backgroundColor:sorted.map(r=>r.score>=75?rose:teal)}],{horizontal:true});
chart('clinicChart','bar',['全国','福岡','長崎','熊本','大分'],[{label:'人口10万人あたり診療所（2023年）',data:[84.4,94.2,103.9,86,86.4],backgroundColor:[blue,blue,blue,rose,blue]}]);

const cohorts=(d.populationCohorts||[]).map(a=>({code:a[0],p2020:a[1],p2030:a[2],p2040:a[3],p2050:a[4],older2020:a[5],older2040:a[6]}));
const byCode=new Map(cohorts.map(p=>[p.code,p]));const combined=regions.map(r=>({name:r.name,...byCode.get(r.code)}));
if(cohorts.length===10&&combined.every(r=>Number.isFinite(r.p2040))){
chart('forecastPopulationChart','bar',combined.map(r=>r.name),[{label:'2020年実績（人）',data:combined.map(r=>r.p2020),backgroundColor:blue},{label:'2040年推計（人）',data:combined.map(r=>r.p2040),backgroundColor:green}],{horizontal:true});
chart('forecastOlderChart','bar',combined.map(r=>r.name),[{label:'75歳以上・2020年（人）',data:combined.map(r=>r.older2020),backgroundColor:blue},{label:'75歳以上・2040年推計（人）',data:combined.map(r=>r.older2040),backgroundColor:rose}],{horizontal:true});
const tb=$('#projectionBody');if(tb)tb.innerHTML=combined.map(r=>'<tr><th>'+esc(r.name)+'</th>'+[r.p2020,r.p2030,r.p2040,r.p2050].map(n=>'<td class="numeric">'+format(n)+'</td>').join('')+'<td class="numeric">'+((r.p2040/r.p2020-1)*100).toFixed(1)+'%</td><td class="numeric">'+format(r.older2020)+'</td><td class="numeric">'+format(r.older2040)+'</td></tr>').join('')+'<tr><th>県計</th>'+[1,2,3,4].map(i=>'<td class="numeric"><b>'+format(d.populationCohorts.reduce((s,a)=>s+a[i],0))+'</b></td>').join('')+'<td class="numeric"><b>'+((d.populationCohorts.reduce((s,a)=>s+a[3],0)/d.populationCohorts.reduce((s,a)=>s+a[1],0)-1)*100).toFixed(1)+'%</b></td>'+[5,6].map(i=>'<td class="numeric"><b>'+format(d.populationCohorts.reduce((s,a)=>s+a[i],0))+'</b></td>').join('')+'</tr>';
}
const bd=$('#bedsBody'),rb=$('#regionBody');
if(bd)bd.innerHTML=regions.map(r=>'<tr><th>'+esc(r.name)+'</th>'+[...r.beds,...r.need].map(x=>'<td class="numeric">'+format(x)+'</td>').join('')+'<td>'+link('https://scueldata.me/ph/plan/a/'+r.code+'/','原集計')+'</td></tr>').join('');
if(rb)rb.innerHTML=sorted.map(r=>'<tr><th>'+esc(r.name)+'</th><td class="numeric"><b>'+r.score+'点</b></td><td>'+esc(r.driver)+'</td><td>'+esc(r.challenge)+'</td><td>'+esc(r.f<r.p?'人口減少下での機能再配分、医療機器更新、地域連携・保守設計':'新たな外来・健診需要と地域連携')+'</td></tr>').join('');
const equip=[['CT','検出器列数別・医療施設調査','救急・脳/肺疾患・共同利用'],['MRI','磁場強度別・医療施設調査','整形・脳神経・がん'],['超音波（US）','医療施設調査・診療実績','消化器・循環器・産科・POCUS'],['PET・核医学','専門施設・届出・診療実績','がん診療連携'],['リニアック','放射線治療指定・認定施設','がん治療の専門拠点'],['血管撮影・IVR','循環器・救急機能の公開情報','高度急性期・低侵襲治療'],['内視鏡','検査実施・病院と診療所調査','消化器・健診'],['心電図・生体情報','在宅・循環器・救急部門','遠隔・慢性疾患管理'],['透析装置','人工透析施設と慢性期医療','通院・装置と材料の安定供給']];
const eb=$('#equipmentBody');if(eb)eb.innerHTML=equip.map(x=>'<tr>'+x.map(s=>'<td>'+esc(s)+'</td>').join('')+'<td><span class="pill">設置総数未検証</span></td></tr>').join('');
const st=$('#sourcesBody');if(st)st.innerHTML=d.sources.map(s=>'<div class="source"><strong>'+esc(s[0])+'</strong>'+link(s[3],s[1])+'<small>データ年次：'+esc(s[2])+'</small></div>').join('');
const pb=$('#placesBody');
function renderPlaces(filter){if(!pb)return;pb.innerHTML=places.filter(p=>filter==='all'||(filter==='hospital'&&!['行政','医師会','保健所'].includes(p.type))||(filter==='office'&&['行政','医師会','保健所'].includes(p.type))).map(p=>'<article class="place"><span class="kind">'+esc(p.type)+'</span><strong>'+esc(p.name)+'</strong><address>'+esc(p.address)+'</address><div class="links">'+link(p.official,'公式')+link(google(p.name,p.address),'Googleマップ')+link(gsi(p.lat,p.lon),'地理院地図')+'</div></article>').join('')}
renderPlaces('all');$('#facilitySelect')?.addEventListener('change',e=>renderPlaces(e.target.value));
$('#saveCSV')?.addEventListener('click',()=>{const lines=[['医療圏','2026高度急性期','2026急性期','2026回復期','2026慢性期','2025必要高度','2025必要急性','2025必要回復','2025必要慢性'],...regions.map(r=>[r.name,...r.beds,...r.need])];const csv='\ufeff'+lines.map(r=>r.join(',')).join('\r\n');const a=document.createElement('a'),u=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.href=u;a.download='kumamoto-beds-comparison.csv';a.click();URL.revokeObjectURL(u)});
const mapEl=$('#map');
if(mapEl&&window.L){const map=L.map('map',{scrollWheelZoom:false}).setView([32.67,130.65],8);L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{attribution:'地理院タイル（国土地理院）',maxZoom:18}).addTo(map);const all=[];
function pin(p,kind){const dot=L.circleMarker([p.lat,p.lon],{radius:kind==='area'?9:5,color:'#fff',weight:1.2,fillColor:kind==='area'?teal:kind==='hospital'?rose:blue,fillOpacity:.9}).addTo(map);let html='<b>'+esc(p.name)+'</b><p>'+esc(p.address||'二次医療圏の代表地点（近似）')+'</p>';if(p.address)html+=link(p.official,'公式')+' | '+link(google(p.name,p.address),'Google')+' | '+link(gsi(p.lat,p.lon),'地理院');dot.bindPopup(html);dot.on('click',()=>{const info=$('#mapinfo');if(info)info.innerHTML=html});all.push({dot,kind})}
regions.forEach(r=>pin({...r,address:''},'area'));places.forEach(p=>pin(p,['行政','医師会','保健所'].includes(p.type)?'office':'hospital'));
$('#maptype')?.addEventListener('change',e=>all.forEach(o=>{if(e.target.value==='all'||o.kind===e.target.value)o.dot.addTo(map);else map.removeLayer(o.dot)}));
}else if(mapEl)mapEl.textContent='地図の読み込みに失敗しました。施設一覧のGoogleマップ・地理院地図リンクをご利用ください。';
}).catch(err=>{console.error(err);const p=document.createElement('p');p.textContent='一部の集計データを読み込めませんでした。ページを再読込してください。';p.className='note';document.querySelector('main')?.prepend(p)});
})();