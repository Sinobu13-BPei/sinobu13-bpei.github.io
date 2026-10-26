/* Wakayama 2026 | public statistical research | no internal or customer-specific datasets */
(async function () {
  const root = document;
  const $ = id => root.getElementById(id);
  const escapeHTML = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = n => new Intl.NumberFormat('ja-JP').format(n);
  const weights = [.25,.25,.20,.15,.15];
  const score = a => a.score.reduce((v, n, i) => v + n * weights[i], 0);
  const dataURL = './data/areas.json';
  const populateError = error => {
    const message = '公開データを読み込めませんでした。通信状態をご確認のうえページを再読込してください。';
    ['regionTable','deviceTable'].forEach(id => {const t = $(id); if(t && t.tBodies[0])t.tBodies[0].innerHTML='<tr><td colspan="6">'+message+'</td></tr>';});
    if($('facilityList')) $('facilityList').textContent = message;
    if($('sourcesList')) $('sourcesList').textContent = message;
    console.error('Wakayama data load:', error);
  };
  let data;
  try {
    const response = await fetch(dataURL, {cache:'no-store'});
    if(!response.ok) throw new Error('HTTP '+response.status);
    data = await response.json();
    if (!Array.isArray(data.areas) || data.areas.length !== 7 || !Array.isArray(data.sources)) throw new Error('Invalid research dataset');
  } catch(error) { populateError(error); return; }
  const {areas,facilities,hoken,sources,associations=[]} = data;
  const regions = Object.fromEntries(areas.map(a=>[a.name,a]));
  const chartDefault = {
    responsive:true, maintainAspectRatio:false,
    plugins:{legend:{labels:{color:'#204458',font:{size:11},boxWidth:12}}},
    scales:{x:{ticks:{color:'#436277'},grid:{color:'#e7eff1'}},y:{ticks:{color:'#436277'},grid:{color:'#e7eff1'}}}
  };
  const chart = (id, opts) => {
    if(typeof window.Chart !== 'function' || !$(id)) return;
    try { new window.Chart($(id), opts); }
    catch(e){ console.warn('Chart skipped:',id,e); }
  };
  // Graphs intentionally separate 2025 bed reports, 2026 workforce indicators and 2017 device inventory.
  const bedTotals=[0,1,2,3].map(i=>areas.reduce((t,a)=>t+a.beds[i],0));
  chart('bedDonutChart',{
    type:'doughnut',data:{labels:['高度急性期','急性期','回復期','慢性期'],datasets:[{data:bedTotals,
      backgroundColor:['#187eaa','#18a8a8','#dfa446','#7870b9'],borderColor:'#ffffff',borderWidth:3,hoverOffset:6}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'61%',plugins:{
      legend:{position:'bottom',labels:{color:'#27495a',font:{size:12},padding:15,boxWidth:13}},
      tooltip:{callbacks:{label:c=>c.label+' '+fmt(c.parsed)+'床 / '+(100*c.parsed/bedTotals.reduce((a,b)=>a+b,0)).toFixed(1)+'%'}}
    }}
  });
  chart('physicianIndexChart',{
    type:'bar',data:{labels:areas.map(a=>a.name),datasets:[{label:'医師偏在指標（2026年）',
      data:areas.map(a=>a.physIndex),
      backgroundColor:areas.map(a=>a.physIndex<200?'#b77c41':a.physIndex>=300?'#087d83':'#86bdc2'),
      borderRadius:5,maxBarThickness:35}]},
    options:{...chartDefault,indexAxis:'y',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>'指標 '+c.parsed.x.toFixed(1)}}},
      scales:{x:{beginAtZero:true,grid:{color:'#e7eff1'},ticks:{color:'#567381'}},y:{grid:{display:false},ticks:{color:'#244757',font:{size:11}}}}}
  });
  chart('deviceDistributionChart',{
    type:'bar',data:{labels:areas.map(a=>a.name),
      datasets:[{label:'CT（2017年）',data:areas.map(a=>a.ct),backgroundColor:'#077d8b',borderRadius:4,maxBarThickness:35},
        {label:'MRI（2017年）',data:areas.map(a=>a.mri),backgroundColor:'#e2a44a',borderRadius:4,maxBarThickness:35}]},
    options:{...chartDefault,plugins:{...chartDefault.plugins,tooltip:{callbacks:{label:c=>c.dataset.label+' '+c.parsed.y+'台'}}},
      scales:{x:{grid:{display:false},ticks:{color:'#315769',maxRotation:35,minRotation:0}},y:{beginAtZero:true,grid:{color:'#e7eff1'},title:{display:true,text:'設置台数（台）',color:'#496579'}}}}
  });
  chart('populationChart',{
    type:'line',
    data:{labels:['2020 実績','2025 推計','2030 推計','2040 推計','2050 推計'],
      datasets:[{label:'人口（人）',data:[922584,875458,827214,728026,631619],borderColor:'#077b89',backgroundColor:'#077b8930',borderWidth:3,pointRadius:5,pointBackgroundColor:'#077b89',fill:true,tension:.2}]},
    options:{...chartDefault,plugins:{...chartDefault.plugins,tooltip:{callbacks:{label:c=>fmt(c.parsed.y)+'人'}}},scales:{...chartDefault.scales,y:{...chartDefault.scales.y,ticks:{callback:v=>(v/10000).toFixed(0)+'万人'}}}}
  });
  chart('bedChart',{
    type:'bar',data:{labels:areas.map(a=>a.name),datasets:[
      {label:'高度急性期',data:areas.map(a=>a.beds[0]),backgroundColor:'#187eaa'},
      {label:'急性期',data:areas.map(a=>a.beds[1]),backgroundColor:'#18a8a8'},
      {label:'回復期',data:areas.map(a=>a.beds[2]),backgroundColor:'#dfa446'},
      {label:'慢性期',data:areas.map(a=>a.beds[3]),backgroundColor:'#7870b9'}]},
    options:{...chartDefault,indexAxis:'y',scales:{x:{...chartDefault.scales.x,stacked:true},y:{...chartDefault.scales.y,stacked:true}},plugins:{...chartDefault.plugins,legend:{display:false}}}
  });
  chart('deviceChart',{
    type:'bar',data:{labels:['CT','MRI','PET','マンモ','放射線治療'],datasets:[
      {label:'和歌山県',data:[15.1,5.5,.28,4.2,1.02],backgroundColor:'#067e86'},
      {label:'全国',data:[11.1,5.5,.46,3.4,.91],backgroundColor:'#e7af4e'}]},
    options:{...chartDefault,plugins:{...chartDefault.plugins,tooltip:{callbacks:{label:c=>c.dataset.label+' '+c.parsed.y+'台／年齢調整10万人'}}}}
  });
  const byScore = [...areas].sort((a,b)=>score(b)-score(a));
  chart('scoreChart',{
    type:'bar',data:{labels:byScore.map(a=>a.name),datasets:[{label:'独自分析（5点満点）',data:byScore.map(a=>Number(score(a).toFixed(2))),backgroundColor:byScore.map((a,i)=>i<2?'#047780':'#669cb5'),borderRadius:4}]},
    options:{...chartDefault,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{min:0,max:5,ticks:{stepSize:1},grid:{color:'#e7eff1'}},y:{grid:{display:false}}}}
  });
  if($('scoreText')) $('scoreText').textContent='評価点：'+byScore.map(a=>a.name+score(a).toFixed(2)).join('／')+'。需要規模25%、アクセス課題25%、更新・共同利用20%、中核連携15%、BCP15%。いずれも独自評価。';
  // Compact per-area data navigation; no additional or undisclosed facility metrics.
  const regionCards=$('regionQuickCards');
  if(regionCards) {
    regionCards.innerHTML=areas.map(a=>'<button type="button" data-area="'+escapeHTML(a.name)+'" aria-label="'+escapeHTML(a.name)+'医療圏の表を表示"><b>'+escapeHTML(a.name)+'</b><span>'+fmt(a.beds.reduce((s,n)=>s+n,0))+'</span><small>報告病床・2025年</small></button>').join('');
    regionCards.addEventListener('click',event=>{
      const button=event.target.closest('button[data-area]');
      if(!button || !regionCards.contains(button))return;
      if($('areaSearch'))$('areaSearch').value=button.dataset.area;
      renderRegions();
      $('regionTable')?.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'auto':'smooth',block:'center'});
    });
  }
  const matrix=$('priorityMatrix');
  if(matrix) {
    const labels=['需要規模 25%','アクセス課題 25%','更新・共同利用 20%','中核連携 15%','BCP・保守 15%'];
    const rows=[...areas].sort((a,b)=>score(b)-score(a));
    matrix.innerHTML='<table aria-label="医療圏の定性評価マトリクス"><caption>全セルは独自の5段階定性評価。最終列のみ重み付き合計。</caption><thead><tr><th>医療圏</th>'+labels.map(l=>'<th>'+l+'</th>').join('')+'<th>総合/5</th></tr></thead><tbody>'+
      rows.map(a=>'<tr><td>'+escapeHTML(a.name)+'</td>'+a.score.map((v,i)=>'<td class="heat'+v+'" title="'+escapeHTML(labels[i])+'：'+v+'点（分析者による定性評価）">'+v+'</td>').join('')+'<td>'+score(a).toFixed(2)+'</td></tr>').join('')+'</tbody></table>';
  }
  const regionTbody = $('regionTable')?.tBodies[0];
  function renderRegions(){
    if(!regionTbody)return;
    const filter=($('areaSearch')?.value||'').trim().toLocaleLowerCase('ja-JP'), sort=$('areaSort')?.value;
    const shown=areas.filter(a=>(a.name+' '+a.municipalities+' '+a.drivers+' '+a.opportunity).toLocaleLowerCase('ja-JP').includes(filter));
    if(sort==='score')shown.sort((a,b)=>score(b)-score(a)); else if(sort==='beds')shown.sort((a,b)=>b.beds.reduce((s,n)=>s+n,0)-a.beds.reduce((s,n)=>s+n,0));
    regionTbody.innerHTML=shown.length?shown.map(a=>'<tr><td><b>'+escapeHTML(a.name)+'</b><small style="display:block">'+escapeHTML(a.municipalities)+'</small></td><td class="num">'+fmt(a.beds.reduce((s,n)=>s+n,0))+'</td><td class="num">'+fmt(a.physicians)+'</td><td class="num">'+a.physIndex.toFixed(1)+'</td><td class="num"><span class="score">'+score(a).toFixed(2)+'</span>/5</td><td><b>'+escapeHTML(a.drivers)+'</b><br><small>'+escapeHTML(a.opportunity)+'</small><br><small class="risk-high">課題：'+escapeHTML(a.risk)+'</small></td></tr>').join(''):'<tr><td colspan="6">該当する医療圏はありません。</td></tr>';
  }
  ['areaSearch','areaSort'].forEach(id=>$(id)?.addEventListener(id==='areaSearch'?'input':'change',renderRegions));renderRegions();
  const deviceTbody = $('deviceTable')?.tBodies[0];
  if(deviceTbody)deviceTbody.innerHTML=areas.map(a=>'<tr><td><b>'+escapeHTML(a.name)+'</b></td><td class="num">'+a.ct+'</td><td class="num">'+a.mri+'</td><td class="num">'+a.pet+'</td><td class="num">'+a.rt+'</td><td>'+escapeHTML(a.opportunity)+'</td></tr>').join('');
  // Facility name and address are never converted to a guessed precise location.
  const gmaps=(name,address)=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(name+' '+address);
  const gsi=region=>{
    const a=regions[region]||regions['和歌山'];
    return 'https://maps.gsi.go.jp/#15/'+a.lat+'/'+a.lng+'/';
  };
  const merged=[...facilities.map(f=>({name:f[0],area:f[1],address:f[2],category:f[3],url:f[4],kind:'hospital'})),...hoken.map(f=>({name:f[0],area:f[1],address:f[2],category:'保健所・地域保健',url:'',kind:'hoken'})),...associations.map(f=>({name:f[0],area:f[1],address:'和歌山県内（所在位置は各公式ページで確認）',category:'郡市医師会',url:f[2],kind:'association'}))];
  function renderFacilities(){
    const term=($('facilitySearch')?.value||'').trim().toLocaleLowerCase('ja-JP');
    const type=$('facilityType')?.value||'all';
    const found=merged.filter(f=>(type==='all'||f.kind===type)&&(f.name+' '+f.area+' '+f.address+' '+f.category).toLocaleLowerCase('ja-JP').includes(term));
    if(!$('facilityList'))return;
    $('facilityList').innerHTML=found.length?found.map(f=>{
      const map=escapeHTML(gmaps(f.name,f.address)),gsiUrl=escapeHTML(gsi(f.area));
      const title='<h4><a href="'+map+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(f.name)+'</a></h4>';
      return '<article class="facility">'+title+'<p><b>'+escapeHTML(f.area)+'</b> ｜ '+escapeHTML(f.category)+'</p><p>'+escapeHTML(f.address)+'</p><div class="mini-links">'+(f.url?'<a href="'+escapeHTML(f.url)+'" target="_blank" rel="noopener noreferrer">公式サイト ↗</a>':'')+'<a href="'+map+'" target="_blank" rel="noopener noreferrer">Googleマップ ↗</a><a href="'+gsiUrl+'" target="_blank" rel="noopener noreferrer" title="正確な施設位置ではなく医療圏の代表地点を表示">地理院地図（圏域概略） ↗</a></div></article>';
    }).join(''):'<p>条件に一致する施設はありません。</p>';
  }
  ['facilitySearch','facilityType'].forEach(id=>$(id)?.addEventListener(id==='facilitySearch'?'input':'change',renderFacilities));renderFacilities();
  if($('sourcesList'))$('sourcesList').innerHTML=sources.map(s=>'<li id="'+escapeHTML(s[0])+'"><a href="'+escapeHTML(s[3])+'" target="_blank" rel="noopener noreferrer">['+escapeHTML(s[0])+'] '+escapeHTML(s[1])+' ↗</a><small>出典年次・基準日：'+escapeHTML(s[2])+'</small></li>').join('');
  if(typeof window.L !== 'undefined'&&$('areaMap')){
    try {
      const map = window.L.map('areaMap',{scrollWheelZoom:false}).setView([33.98,135.45],8);
      window.L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{maxZoom:18,attribution:'出典：<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">地理院タイル</a>'}).addTo(map);
      const markers = areas.map(a=>window.L.circleMarker([a.lat,a.lng],{radius:Math.min(19,5+Math.sqrt(a.beds.reduce((s,n)=>s+n,0))/6),color:'#063c5e',weight:2,fillColor:'#09a5a0',fillOpacity:.80}).addTo(map)
        .bindPopup('<b>'+escapeHTML(a.name)+'医療圏（代表地点）</b><br>'+escapeHTML(a.municipalities)+'<br>2025年報告病床 '+fmt(a.beds.reduce((x,y)=>x+y,0))+'床<br>医師偏在指標（2026） '+a.physIndex.toFixed(1)+'<br><small>円の大きさは報告病床規模の概略比較／地点は圏域中心</small><br><a href="'+gmaps(a.name+' 医療機関','和歌山県')+'" target="_blank" rel="noopener noreferrer">Googleマップで医療機関検索 ↗</a>'));
      window.L.featureGroup(markers).getBounds().isValid() && map.fitBounds(window.L.featureGroup(markers).getBounds().pad(.12));
    } catch(error) {console.warn('Geographical tiles unavailable:', error);}
  }
  const updateProgress=()=>{
    const h=root.documentElement.scrollHeight-window.innerHeight;
    const fraction=h>0?Math.max(0,Math.min(1,window.scrollY/h)):0;
    if($('progress'))$('progress').style.width=(fraction*100).toFixed(1)+'%';
  };
  window.addEventListener('scroll',updateProgress,{passive:true});
  window.addEventListener('resize',updateProgress,{passive:true});
  updateProgress();
})();