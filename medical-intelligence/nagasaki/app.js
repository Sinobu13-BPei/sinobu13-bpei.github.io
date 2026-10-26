/* Nagasaki Medical Intelligence | Public-source Atlas | 2026-10-27 */
(() => {
  'use strict';
  const node = document.getElementById('site-data');
  if (!node) { console.error('site-data not found'); return; }
  let db;
  try { db = JSON.parse(node.textContent); } catch (error) { console.error('Data parse error', error); return; }
  const $ = (id) => document.getElementById(id);
  const nf = new Intl.NumberFormat('ja-JP');
  const clean = (s) => String(s ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const google = (name, address) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${name} ${address || ''}`);
  const gsi = (lat, lon) => `https://maps.gsi.go.jp/#15/${Number(lat).toFixed(5)}/${Number(lon).toFixed(5)}/`;
  const out = (url, text) => `<a href="${clean(url)}" target="_blank" rel="noopener noreferrer">${clean(text)}</a>`;

  const menu = $('menuToggle');
  if (menu) {
    menu.addEventListener('click', () => {
      const nav = $('nav');
      const isOpen = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(isOpen));
      menu.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
    });
    $('nav').querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      $('nav').classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
    }));
  }

  function sources() {
    const box = $('sourceList');
    if (!box) return;
    box.innerHTML = db.sources.map((x, idx) => `<article class="source-entry"><a href="${clean(x.url)}" target="_blank" rel="noopener noreferrer">[S${idx + 1}] ${clean(x.title)}</a><small>公表・参照年：${clean(x.year)} ／ ${clean(x.scope || '関連資料')}</small></article>`).join('');
  }
  sources();

  function areaCards() {
    const box = $('areaCards');
    if (!box) return;
    box.innerHTML = db.areas.map(a => `<article class="area-card"><h3>${clean(a.name)}医療圏 <span class="score">優先度 ${a.score.toFixed(0)}/100</span></h3><div class="area-info">${clean(a.municipalities)}　｜　一般診療所 ${nf.format(a.facilities2026?.clinics ?? 0)}施設／病院 ${nf.format(a.facilities2026?.hospitals ?? 0)}施設（ナビイ2026）　｜　病床 ${nf.format(a.beds2025.total)}床 / 2025年</div><p><strong>需要ドライバー：</strong>${clean(a.drivers)}</p><p><strong>主な医療機関：</strong>${clean(a.hospitals)}</p><p><strong>3〜5年の仮説：</strong>${clean(a.opportunities)}</p><div class="area-links">${out(google(a.name + ' 医療機関', '長崎県'), 'Googleマップ')}　${out(gsi(a.lat, a.lon), '地理院地図')}　<span class="estimate-tag">提言／独自分析</span></div></article>`).join('');
  }
  areaCards();

  const facilityList = $('facilityList');
  function renderFacilities(value = '') {
    const key = (value || '').normalize('NFKC').toLowerCase().trim();
    const filtered = db.facilities.filter(f => !key || [f.name, f.area, f.address, f.role].some(x => String(x || '').normalize('NFKC').toLowerCase().includes(key)));
    facilityList.innerHTML = filtered.length ? filtered.map(f => `<article class="facility"><b>${clean(f.name)}</b><small>${clean(f.address)} ／ ${clean(f.area)}医療圏<br>${clean(f.role)}</small><div class="facility-links">${out(f.web, '公式Web')} ${out(google(f.name, f.address), 'Googleマップ')} ${out(gsi(f.lat, f.lon), '地理院地図')}</div></article>`).join('') : '<p>検索条件に合う施設がありません。</p>';
  }
  if (facilityList) {
    renderFacilities();
    const search = $('facilitySearch');
    if (search) search.addEventListener('input', e => renderFacilities(e.target.value));
  }

  // The map uses GSI public map tiles. Markers are intentionally APPROXIMATE.
  const mapElement = $('map');
  if (mapElement && typeof window.L !== 'undefined') {
    try {
      const map = window.L.map('map', {scrollWheelZoom:false}).setView([32.95, 129.9], 8);
      window.L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://maps.gsi.go.jp/" target="_blank" rel="noopener noreferrer">国土地理院／地理院タイル</a>',
        minZoom: 5, maxZoom: 17, maxNativeZoom: 17
      }).addTo(map);
      const group = window.L.layerGroup().addTo(map);
      const refreshMap = () => {
        group.clearLayers();
        const mode = $('mapFilter')?.value || 'all';
        if (mode === 'all' || mode === 'area') {
          db.areas.forEach(a => {
            window.L.circleMarker([a.lat, a.lon], {radius:10, color:'#075a64', fillColor:'#20b4a8', fillOpacity:.68, weight:2})
              .bindPopup(`<strong>${clean(a.name)}医療圏</strong><div>2025年報告 ${nf.format(a.beds2025.total)}床</div><div>2022年人口 ${nf.format(a.pop2022)}人</div>${out(google(a.name + ' 医療圏', '長崎県'), 'Googleマップ')} ${out(gsi(a.lat,a.lon),'地理院地図')}`)
              .addTo(group);
          });
        }
        if (mode === 'all' || mode === 'hospital' || mode === 'public') {
          const facilities = db.facilities.filter(f => {
            const isHospital = /hospital|university|medical|hosp|agency/.test(String(f.source || '').toLowerCase()) || (/病院|センター/.test(f.role) && !/保健所/.test(f.role));
            return mode === 'all' || (mode === 'hospital' ? isHospital : !isHospital);
          });
          facilities.forEach(f => {
            window.L.circleMarker([f.lat, f.lon], {radius:6, color:'#134357', fillColor:'#ffb76a', fillOpacity:.92, weight:1})
              .bindPopup(`<strong>${clean(f.name)}</strong><div>${clean(f.address)}</div><div>${clean(f.role)}</div>${out(f.web,'公式Web')} ${out(google(f.name,f.address),'Googleマップ')} ${out(gsi(f.lat,f.lon),'地理院地図')}`)
              .addTo(group);
          });
        }
      };
      refreshMap();
      $('mapFilter')?.addEventListener('change', refreshMap);
      window.addEventListener('resize', () => map.invalidateSize(), {passive:true});
    } catch (error) {
      console.error('Map failed',error);
      mapElement.classList.add('map-not-available');
    }
  } else if (mapElement) { mapElement.classList.add('map-not-available'); }


  // Nagasaki open public register. Only official institution-level fields are served.
  async function initPublicFacilityRegister(){
    const target=$('ndbRecords'),status=$('ndbResults'),pageInfo=$('ndbPageInfo');
    if(!target||!status)return;
    const query=$('ndbQuery'),area=$('ndbArea'),type=$('ndbType'),st=$('ndbStatus'),city=$('ndbCity');
    const prev=$('ndbPrev'),next=$('ndbNext'),reset=$('ndbClear');
    const PAGE_SIZE=50;
    let rows=[],visible=[],page=0,sourceUrls={};
    const kind=r=>r.category==='薬局'?'薬局':r.category==='歯科'?'歯科診療所':r.type==='病院'?'病院':'医科診療所';
    const norm=v=>String(v||'').normalize('NFKC').toLowerCase().replace(/\s+/g,'').trim();
    const safeMap=r=>google(r.name,r.address);
    const fmt=n=>nf.format(n);
    const updateCities=()=>{
      const old=city.value;
      const cities=[...new Set(rows.filter(r=>!area.value||r.area===area.value).map(r=>r.city))].sort((a,b)=>a.localeCompare(b,'ja'));
      city.innerHTML='<option value="">すべての市町</option>'+cities.map(c=>`<option value="${clean(c)}">${clean(c)}</option>`).join('');
      if(cities.includes(old))city.value=old;
    };
    const draw=()=>{
      const q=norm(query.value),a=area.value,t=type.value,s=st.value,c=city.value;
      visible=rows.filter(r=>(!a||r.area===a)&&(!c||r.city===c)&&(!t||kind(r)===t)&&(!s||r.status===s)&&(!q||norm([r.name,r.address,r.city,r.area,r.departments].join(' ')).includes(q)));
      page=Math.min(page,Math.max(0,Math.ceil(visible.length/PAGE_SIZE)-1));
      const start=page*PAGE_SIZE,chunk=visible.slice(start,start+PAGE_SIZE);
      status.textContent=`該当 ${fmt(visible.length)} 件／公表名簿 ${fmt(rows.length)} 件（現存・休止含む）`;
      pageInfo.textContent=visible.length?`${fmt(start+1)}～${fmt(start+chunk.length)}件 / ${fmt(visible.length)}件`:'該当なし';
      prev.disabled=page===0;next.disabled=start+PAGE_SIZE>=visible.length;
      target.innerHTML=chunk.length?chunk.map(r=>{
        const src=sourceUrls[r.category]||sourceUrls['医科']||'#';
        const dept=r.departments||'—';
        return `<tr><td><strong>${clean(r.name)}</strong><small>${clean(kind(r))}／${clean(r.status)}</small></td><td>${clean(r.area)}<small>${clean(r.city)}</small></td><td>${clean(r.address)}</td><td>${r.beds>0?fmt(r.beds)+'床':'—'}</td><td>${clean(dept)}</td><td>${out(safeMap(r),'Googleマップ')}<small>${out(src,'原資料PDF')}</small></td></tr>`;
      }).join(''):'<tr><td colspan="6">該当する施設がありません。検索条件を変更してください。</td></tr>';
    };
    try{
      const response=await fetch('./data/facilities-public.json',{cache:'no-cache'});
      if(!response.ok)throw Error('HTTP '+response.status);
      const payload=await response.json();
      if(!Array.isArray(payload.records)||payload.records.length!==2523)throw Error('Unexpected data format');
      rows=payload.records;sourceUrls=payload.sourceURLs||{};
      updateCities();draw();
      for(const el of [query,type,st,city])el?.addEventListener(el===query?'input':'change',()=>{page=0;draw()});
      area?.addEventListener('change',()=>{page=0;updateCities();draw()});
      prev?.addEventListener('click',()=>{if(page>0){page--;draw()}});
      next?.addEventListener('click',()=>{if((page+1)*PAGE_SIZE<visible.length){page++;draw()}});
      reset?.addEventListener('click',()=>{query.value='';area.value='';type.value='';st.value='';city.value='';updateCities();page=0;draw()});
      const canvas=$('registryChart');
      if(canvas&&typeof window.Chart!=='undefined'){
        const areaOrder=db.areas.map(a=>a.name);
        const kinds=[['病院','hospitals','#146a88'],['医科診療所','medicalClinics','#239c9c'],['歯科診療所','dentalClinics','#d59a65'],['薬局','pharmacies','#858fc0']];
        try{new window.Chart(canvas,{type:'bar',data:{labels:areaOrder,datasets:kinds.map(([label,key,color])=>({label,data:areaOrder.map(n=>(db.areas.find(a=>a.name===n)?.register2026?.[key]||0)),backgroundColor:color,borderRadius:2}))},options:{responsive:true,maintainAspectRatio:false,animation:false,indexAxis:'y',plugins:{legend:{position:'bottom',labels:{boxWidth:12,font:{size:11}}},tooltip:{mode:'index',intersect:false}},scales:{x:{stacked:true,beginAtZero:true,grid:{color:'#edf1f2'},ticks:{precision:0}},y:{stacked:true,grid:{display:false}}}}});canvas.classList.add('chart-ok');}catch(err){console.error('Register chart unavailable',err)}
      }
    }catch(error){
      console.error('Public facility register cannot load',error);
      status.textContent='施設名簿の取得に失敗しました。下記の原資料リンクをご利用ください。';
      target.innerHTML='<tr><td colspan="6">公開施設名簿の読み込みに失敗しました。ページを再読み込みしてください。</td></tr>';
    }
  }
  initPublicFacilityRegister();

  // Chart.js draws charts only when its CDN loads. Fallback text remains available offline.
  if (typeof window.Chart === 'undefined') return;
  const Chart = window.Chart;
  Chart.defaults.font.family = '-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif';
  Chart.defaults.color = '#416274';
  const palette = ['#146a88','#239c9c','#90bb80','#df9e64','#8b8ec3','#bd7897','#7f9eae','#d9bf88'];
  const baseOpts = () => ({responsive:true, maintainAspectRatio:false, animation:false, plugins:{legend:{labels:{boxWidth:13,font:{size:11}}},tooltip:{mode:'index',intersect:false}}, scales:{x:{ticks:{font:{size:10},maxRotation:45,minRotation:0},grid:{display:false}},y:{beginAtZero:true,grid:{color:'#e8eff0'},ticks:{font:{size:10}}}}});
  const make = (id, config) => {
    const c = $(id);
    if (!c) return null;
    try { const v = new Chart(c, config); c.classList.add('chart-ok'); return v; }
    catch (error) { console.error(`chart failed: ${id}`,error); return null; }
  };
  const areas = db.areas.map(x=>x.name);
  const hist = db.population.history;
  const years = Object.keys(hist).concat('2035*');
  const historicSeries = Object.values(hist).map(n => Math.round(n / 10000 * 10) / 10).concat(null);
  make('populationChart', {type:'line',data:{labels:years,datasets:[
    {label:'実績（万人）',data:historicSeries,borderColor:'#146a88',backgroundColor:'rgba(35,156,156,.08)',fill:true,tension:.22,pointRadius:2,borderWidth:3},
    {label:'2023年社人研推計（万人）',data:Array(years.length-2).fill(null).concat([Math.round(hist['2024']/10000*10)/10,db.population.proj2035/10000]),borderColor:'#df9e64',borderDash:[6,5],pointRadius:4,borderWidth:3}
  ]},options:{...baseOpts(),scales:{...baseOpts().scales,y:{beginAtZero:false,suggestedMin:95,grid:{color:'#e8eff0'},ticks:{callback:v=>v+'万人'}}}}});
  make('bedsChart', {type:'bar',data:{labels:areas,datasets:[['高度急性期','high'],['急性期','acute'],['回復期','recovery'],['慢性期','chronic']].map(([label,key],i)=>({label,data:db.areas.map(a=>a.beds2025[key]),backgroundColor:palette[i],borderRadius:2}))},options:{...baseOpts(),indexAxis:'y',scales:{x:{stacked:true,beginAtZero:true,grid:{color:'#edf1f2'}},y:{stacked:true,grid:{display:false}}},plugins:{legend:{position:'bottom',labels:{boxWidth:12,font:{size:11}}},tooltip:{mode:'index'}}}});
  make('clinicAreaChart',{type:'bar',data:{labels:areas,datasets:[{label:'病院',data:db.areas.map(a=>a.facilities2026?.hospitals??0),backgroundColor:'#146a88'},{label:'一般診療所',data:db.areas.map(a=>a.facilities2026?.clinics??0),backgroundColor:'#239c9c'},{label:'歯科診療所',data:db.areas.map(a=>a.facilities2026?.dental??0),backgroundColor:'#df9e64'}]},options:{...baseOpts(),indexAxis:'y',scales:{x:{stacked:true,beginAtZero:true,grid:{color:'#edf1f2'}},y:{stacked:true,grid:{display:false}}},plugins:{legend:{position:'bottom'},tooltip:{mode:'index',intersect:false}}}});
  make('doctorsChart',{type:'bar',data:{labels:areas,datasets:[{label:'医師偏在指標 2026',data:db.areas.map(a=>a.doctorIndex2026),backgroundColor:db.areas.map((a,i)=>i>=4?'#38a5a8':'#146a88'),borderRadius:5}]},options:{...baseOpts(),indexAxis:'y',plugins:{legend:{display:false},tooltip:{enabled:true}}}});
  make('needBedsChart',{type:'bar',data:{labels:['高度急性期','急性期','回復期','慢性期'],datasets:[{label:'2025年報告',data:['high','acute','recovery','chronic'].map(k=>db.areas.reduce((t,a)=>t+a.beds2025[k],0)),backgroundColor:'#176784',borderRadius:3},{label:'2025年必要量の参考値',data:['high','acute','recovery','chronic'].map(k=>db.needBeds2025[k]),backgroundColor:'#58ada2',borderRadius:3}]},options:{...baseOpts(),plugins:{legend:{position:'bottom'},tooltip:{enabled:true}}}});
  make('deviceIndexChart',{type:'bar',data:{labels:db.devicesBenchmark.categories,datasets:[{label:'全国',data:db.devicesBenchmark.national,backgroundColor:'#b4cad1',borderRadius:3},{label:'長崎県',data:db.devicesBenchmark.nagasaki,backgroundColor:'#177b83',borderRadius:3}]},options:{...baseOpts(),plugins:{legend:{position:'bottom'}}}});
  let deviceChart = null;
  const drawDevice = (kind) => {
    if (deviceChart) deviceChart.destroy();
    deviceChart = make('deviceAreaChart',{type:'bar',data:{labels:areas,datasets:[{label:`${kind}：2020年保有台数`,data:db.areas.map(a=>a.devices2020[kind]),backgroundColor:palette[0],borderRadius:4}]},options:{...baseOpts(),indexAxis:'y',plugins:{legend:{display:false},tooltip:{enabled:true}}}});
  };
  drawDevice($('deviceSelect')?.value || 'CT');
  $('deviceSelect')?.addEventListener('change', e=>drawDevice(e.target.value));
  make('utilizationChart',{type:'line',data:{labels:db.hospitalUtilization.years,datasets:[{label:'CT検査件数',data:db.hospitalUtilization.ct,borderColor:'#146a88',backgroundColor:'#146a88',tension:.2,pointRadius:4,borderWidth:3},{label:'MRI検査件数',data:db.hospitalUtilization.mri,borderColor:'#d38959',backgroundColor:'#d38959',tension:.2,pointRadius:4,borderWidth:3}]},options:{...baseOpts(),scales:{x:{grid:{display:false}},y:{beginAtZero:true,ticks:{callback:v=>nf.format(v)+'件'},grid:{color:'#e8eff0'}}},plugins:{legend:{position:'bottom'}}}});
  const rank = [...db.areas].sort((a,b)=>b.score-a.score);
  make('priorityChart',{type:'bar',data:{labels:rank.map(a=>a.name),datasets:[{label:'独自優先度スコア',data:rank.map(a=>a.score),backgroundColor:rank.map((_,i)=>i<3?'#146a88':'#48a8a4'),borderRadius:4}]},options:{...baseOpts(),indexAxis:'y',scales:{x:{min:0,max:100,grid:{color:'#e8eff0'}},y:{grid:{display:false}}},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.raw}/100（独自仮説）`}}}}});
})();
