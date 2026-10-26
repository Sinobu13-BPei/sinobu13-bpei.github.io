/* 千葉県医療MKT: offline-friendly static data rendering, no analytics or secrets */
'use strict';
(() => {
  const data = window.CHIBA_DATA;
  if (!data) { document.querySelectorAll('.map-loading').forEach(el=>el.textContent='地域データを読み込めませんでした。data/chiba-data.js の配置を確認してください。'); return; }
  const $ = selector => document.querySelector(selector);
  const format = value => Number(value).toLocaleString('ja-JP');
  const esc = str => String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const regions = data.regions.slice();
  const regionByName = name => regions.find(r=>r.name===name);
  function maps(name, address, area) {
    const place = regionByName(area) || regions.find(r=>r.name==='千葉');
    const g = 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(name+' '+address);
    const gs = `https://maps.gsi.go.jp/#15/${place.lat}/${place.lon}/`;
    return `<div class="map-links"><a href="${g}" target="_blank" rel="noopener noreferrer" aria-label="${esc(name)}をGoogleマップで検索">Googleマップ（施設検索）</a><a href="${gs}" target="_blank" rel="noopener noreferrer" aria-label="${esc(area)}周辺の地理院地図">地理院地図（圏域周辺）</a></div>`;
  }
  function regionSorter(value) {
    if (value === 'name') return regions.slice().sort((a,b)=>['千葉','東葛南部','東葛北部','印旛','香取海匝','山武長生夷隅','安房','君津','市原'].indexOf(a.name)-['千葉','東葛南部','東葛北部','印旛','香取海匝','山武長生夷隅','安房','君津','市原'].indexOf(b.name));
    if (value === 'pop') return regions.slice().sort((a,b)=>b.pop-a.pop);
    return regions.slice().sort((a,b)=>b.score-a.score);
  }
  function paintRegions() {
    const order = regionSorter($('#sort-regions')?.value || 'score');
    $('#region-table tbody').innerHTML=order.map(r=>`<tr><th scope="row">${esc(r.name)}</th><td>${format(r.pop)}</td><td>${r.doctor.toFixed(1)}</td><td>${format(r.beds[2])}</td><td>${format(r.need[2])}</td><td><strong>${r.score.toFixed(1)}</strong> / 100</td></tr>`).join('');
    $('#region-cards').innerHTML=order.map(r=>`<article class="region-card"><span class="tag">分析スコア ${r.score.toFixed(1)}</span><h3>${esc(r.name)}</h3><p><b>対象市町村：</b>${esc(r.municipalities)}</p><p><b>需要：</b>${esc(r.driver)}</p><p><b>課題：</b>${esc(r.risk)}</p><p><b>3〜5年の検討領域：</b>${esc(r.opportunity)}</p><p class="source-line">人口 ${format(r.pop)}人（2023）・医師偏在 ${r.doctor.toFixed(1)}（2026公表）</p>${maps(r.name+'医療圏', '千葉県', r.name)}</article>`).join('');
    $('#scores-chart').innerHTML=order.map(r=>`<div class="score-row"><span>${esc(r.name)}</span><div class="track" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${r.score}" aria-label="${esc(r.name)} 優先度スコア"><i style="width:${r.score}%"></i></div><strong>${r.score.toFixed(1)}</strong></div>`).join('');
  }
  function paintBeds() {
    const ordered=regionSorter('name');
    $('#beds-table tbody').innerHTML=ordered.map(r=>`<tr><th scope="row">${esc(r.name)}</th>${r.need.map((n,i)=>`<td>${format(r.beds[i])} / ${format(n)}</td>`).join('')}<td>+${format(r.rehab_gap)}</td></tr>`).join('');
    const sum = i => ordered.reduce((s,r)=>s+r.beds[i],0);
    const goal = i => ordered.reduce((s,r)=>s+r.need[i],0);
    console.assert(sum(0)+sum(1)+sum(2)+sum(3)+sum(4)===48446, 'bed total differs from official prefecture source');
    console.assert(goal(0)+goal(1)+goal(2)+goal(3)===50004, 'need total differs');
    const canvas=$('#beds-chart');
    if(typeof window.Chart!=='undefined') {
      new Chart(canvas, {type:'bar',data:{labels:['高度急性期','急性期','回復期','慢性期'],datasets:[{label:'病床機能報告（2025）',data:[0,1,2,3].map(sum),backgroundColor:'#167c93',maxBarThickness:46},{label:'必要病床数推計（2025）',data:[0,1,2,3].map(goal),backgroundColor:'#c19d57',maxBarThickness:46}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${format(c.parsed.y)}床`}}},scales:{y:{beginAtZero:true,ticks:{callback:v=>format(v)}}}}});
    } else canvas.replaceWith(Object.assign(document.createElement('p'),{textContent:'病床機能：高度急性期6,931床・急性期22,662床・回復期7,249床・慢性期10,438床（2025年報告値）。'}));
  }
  function paintPopulation() {
    const ordered=regionSorter('name'), canvas=$('#population-chart');
    if(typeof window.Chart!=='undefined') {
      new Chart(canvas,{type:'bar',data:{labels:ordered.map(r=>r.name),datasets:[{label:'圏域人口（2023年4月、人）',data:ordered.map(r=>r.pop),backgroundColor:'#1589a2',borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${format(c.parsed.x)}人`}}},scales:{x:{beginAtZero:true,ticks:{callback:v=>`${Number(v)/10000}万`}},y:{ticks:{font:{size:11}}}}}});
    } else canvas.replaceWith(Object.assign(document.createElement('p'),{textContent:ordered.map(r=>`${r.name} ${format(r.pop)}人`).join('／')}));
  }
  function itemCard(x,indexOrDetail,siteFallback) {
    const site=x.site||siteFallback||null;
    return `<article class="location"><span class="loc-kind">${esc(indexOrDetail)}</span><h4>${site?`<a href="${esc(site)}" target="_blank" rel="noopener noreferrer">${esc(x.name)}</a>`:esc(x.name)}</h4><p>${esc(x.address)}</p>${maps(x.name,x.address,x.area)}</article>`;
  }
  function paintHospitals() {
    const sel=$('#filter-hospitals');
    const order=regionSorter('name');
    for(const r of order) {const el=document.createElement('option'); el.value=r.name; el.textContent=r.name; sel.appendChild(el);}
    function render() { const area=sel.value; const sub=data.hospitals.filter(x=>area==='all'||x.area===area); $('#hospitals-list').innerHTML=sub.length?sub.map(h=>itemCard(h,`${h.area} / ${h.kind}`)).join(''):'<p>該当する掲載施設はありません。</p>';}
    sel.addEventListener('change',render); render();
  }
  function paintInstitutions() {
    const sel=$('#location-type');
    function render() {
      const type=sel.value;
      const values=type==='association'?data.physicianAssociations:type==='health'?data.healthCenters:data.government;
      const url=type==='association'?'https://www.chiba.med.or.jp/medical/ishikailist/':type==='health'?'https://www.pref.chiba.lg.jp/kenfuku/kenkoufukushi/soudan.html':null;
      $('#institutions-list').innerHTML=values.map(x=>itemCard(x,x.area+(type==='health'?' / 保健所':' / 公的機関'),url)).join('');
    }
    sel.addEventListener('change',render);render();
  }
  function paintMap() {
    const el=$('#regional-map');
    if(typeof window.L==='undefined') {el.innerHTML='<p class="map-loading">地図ライブラリを読み込めませんでした。医療圏の概要と地図リンクは利用できます。<a href="https://maps.gsi.go.jp/#9/35.54/140.30/">国土地理院の地図を開く</a></p>';return;}
    try {
      el.innerHTML='';
      const map=L.map(el,{scrollWheelZoom:false}).setView([35.53,140.19],9);
      L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{attribution:'<a href="https://maps.gsi.go.jp/">国土地理院「地理院タイル」</a>',maxZoom:18}).addTo(map);
      for (const r of regions) L.circleMarker([r.lat,r.lon],{radius:8,color:'#0d516a',weight:2,fillColor:'#1ba2b2',fillOpacity:.88}).bindPopup(`<strong>${esc(r.name)}医療圏</strong><p>人口（2023）：${format(r.pop)}人<br>医師偏在指標（2026公表）：${r.doctor.toFixed(1)}</p><p>代表地点・概略位置です</p>`).addTo(map);
    } catch (e) {el.textContent='地図の表示に失敗しました。医療圏の表および各施設の地図リンクをご覧ください。';}
  }
  function paintSources() {
    const detail={plan:['第8次千葉県保健医療計画','2024〜2029／圏域人口2023年4月'],needs:['千葉県地域医療構想','2025年必要病床数推計'],beds:['令和7年病床機能報告','2025年7月'],pop:['千葉県毎月常住人口調査','2026年9月1日'],popforecast:['国立社会保障・人口問題研究所 地域別将来推計人口','2023年推計／2050年'],elder:['千葉県総合計画・将来人口','2023年推計（2050年）'],doctors:['厚生労働省 医師確保・医師偏在指標','2026年公表'],doctor2024:['厚生労働省 医師・歯科医師・薬剤師統計','2024年'],doctorindex:['SCUEL 医師偏在指標・千葉県集計','2026年公表値の二次集計'],clinic:['千葉県 令和6年医療施設統計','2024年'],emergency:['千葉県 救命救急センター指定一覧','2026年8月20日'],cancer:['千葉県 がん診療連携拠点病院等','2026年4月1日'],prevention:['千葉県 保健所（健康福祉センター）一覧','2026年10月'],med:['千葉県医師会 地区医師会一覧','2026年10月確認'],government:['千葉県公式ホームページ','随時更新'],fund:['千葉県地域医療介護総合確保基金','令和6年度関連計画'],devices:['厚生労働省 病床機能報告データ・公開資料','令和7年度'],homecare:['千葉県 在宅医療','随時更新'],network:['千葉県 がん診療連携協力病院','随時更新']};
    $('#source-list').innerHTML=Object.entries(data.meta.sources).map(([key,url])=>`<div class="source-item"><strong>${esc(detail[key]?.[0]||key)}</strong><small>${esc(detail[key]?.[1]||'')}</small><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(url)}</a></div>`).join('');
  }
  document.addEventListener('DOMContentLoaded', () => {
    paintRegions();paintBeds();paintPopulation();paintHospitals();paintInstitutions();paintMap();paintSources();
    $('#sort-regions').addEventListener('change',paintRegions);
  });
})();
