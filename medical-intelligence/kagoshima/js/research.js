
/* 鹿児島県・独立調査 2026-10-26 | 公開情報と明示した編集部推計 */
(function(){
'use strict';
var doc=document;
function el(id){return doc.getElementById(id);}
function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function fmt(x){return Number(x).toLocaleString('ja-JP');}
function maplinks(n,a,lat,lon){
 var google='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(n+' '+a);
 var gsi='https://maps.gsi.go.jp/#15/'+lat+'/'+lon+'/';
 return '<span class="links"><a href="'+google+'" target="_blank" rel="noopener noreferrer" aria-label="'+esc(n)+'のGoogleマップ">Google マップ ↗</a><a href="'+gsi+'" target="_blank" rel="noopener noreferrer" aria-label="'+esc(n)+'の地理院地図">地理院地図 ↗</a></span>';
}
function refLink(d,id){var s=d.sources.find(function(x){return x.id===id;});return s?'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title)+'（'+esc(s.year)+'）</a>':'出典未取得';}
function showChartFallback(target,labels,datasets,message){
 var columns=datasets.map(function(d,i){return esc(d.label||('数値'+(datasets.length>1?' '+(i+1):'')));});
 var head='<thead><tr><th>項目</th>'+columns.map(function(x){return '<th>'+x+'</th>';}).join('')+'</tr></thead>';
 var rows=labels.map(function(label,i){return '<tr><td>'+esc(label)+'</td>'+datasets.map(function(d){var val=d.data&&d.data[i]!=null?d.data[i]:'—';return '<td class="num">'+esc(val)+'</td>';}).join('')+'</tr>';}).join('');
 target.parentNode.innerHTML='<p class="warning" role="status">'+esc(message)+' 数値表を表示しています。</p><div class="table-scroll chart-data-table"><table>'+head+'<tbody>'+rows+'</tbody></table></div>';
}
function drawChart(canvas,kind,labels,datasets,other){
 var target=el(canvas);if(!target)return;
 if(typeof Chart==='undefined'){showChartFallback(target,labels,datasets,'図表ライブラリが利用できません。');return;}
 try{
 var options=Object.assign({responsive:true,maintainAspectRatio:false,animation:{duration:250},plugins:{legend:{display:datasets.length>1,position:'bottom'},tooltip:{enabled:true}},scales:{y:{beginAtZero:true,grid:{color:'#e6edf4'},ticks:{color:'#51677b'}},x:{grid:{display:false},ticks:{color:'#415c75',autoSkip:false,maxRotation:45}}}},other||{});
 if(kind==='doughnut' && (!other || !other.scales)){delete options.scales;}
 return new Chart(target,{type:kind,data:{labels:labels,datasets:datasets},options:options});
 }catch(error){showChartFallback(target,labels,datasets,'図表の描画に失敗しました。');if(window.console&&typeof window.console.warn==='function')window.console.warn('Chart render:',canvas,error);return null;}
}
function render(d){
 var weights=d.scoring.axes.map(function(x){return x[1];});
 var score=function(a){return +a.score.reduce(function(s,v,i){return s+v*weights[i]/5;},0).toFixed(1);};
 var areas=d.areas.slice().sort(function(a,b){return score(b)-score(a);});
 var allBeds=d.areas.reduce(function(s,a){return s+a.beds24.reduce(function(x,y){return x+y;},0);},0);
 var needBeds=d.areas.reduce(function(s,a){return s+a.need25.reduce(function(x,y){return x+y;},0);},0);
 var byCat=[0,0,0,0,0];d.areas.forEach(function(a){a.beds24.slice(0,4).forEach(function(v,i){byCat[i]+=v;});});
 var targets=[
 ['人口',fmt(d.population.value)+'人','2026年9月1日推計・出典 S01'],
 ['65歳以上',d.population.aging2025+'%','2025年国勢調査確定・出典 S23（2024年全国'+d.population.agingNational2024+'%との年次差に注意）'],
 ['病床機能報告',fmt(allBeds)+'床','2024年度・4機能＋休棟等・出典 S05'],
 ['医師',fmt(d.population.doctors2024)+'人','2024年調査・出典 S08']
 ];
 el('kpis').innerHTML=targets.map(function(k,i){return '<div class="card '+['blue','green','amber','navy'][i]+'"><div class="label">'+esc(k[0])+'</div><div class="kpi">'+esc(k[1])+'</div><div class="minor">'+esc(k[2])+'</div></div>';}).join('');
 el('population-timeline').innerHTML='<div class="card"><h3>人口：基準年を揃えて読む</h3><div class="table-scroll"><table><thead><tr><th>指標</th><th>値</th><th>基準・位置づけ</th></tr></thead><tbody>'+
 [['2025年国勢調査',fmt(d.population.census2025)+'人','2025年10月1日・2026年9月29日公表の確定値／S02'],['2026年9月推計',fmt(d.population.value)+'人','2026年9月1日／S01'],['前年同月差',fmt(d.population.fromPriorYear)+'人','2026年9月公表／S01'],['65歳以上人口割合',d.population.aging2025+'%（'+fmt(d.population.elderly2025)+'人）','2025年国勢調査確定・県各歳別表／S23'],['2026年9月の転入 / 転出',fmt(d.population.migration2026Sep.in)+' / '+fmt(d.population.migration2026Sep.out)+'人','2026年9月県月報・社会増減▲62人／S01'],['2040年将来人口', '約'+fmt(d.population.forecast2040)+'人','社人研2023年推計・概数／S09・S10']].map(function(x){return '<tr><td>'+esc(x[0])+'</td><td class="num">'+esc(x[1])+'</td><td>'+esc(x[2])+'</td></tr>';}).join('')+'</tbody></table></div><p class="minor">社人研は2020年国勢調査を基準にした将来推計。2025年・2026年の実測／推計値から2040年へ直線外挿していない。2025年国勢調査確定は速報（1,512,969人）から訂正され、1,511,783人。</p><p class="minor"><strong>市町村差：</strong>鹿児島市580,549人、姶良市は2020年比520人増、南大隅町は17.5%減、錦江町は17.3%減（S02・2025年国勢調査確報）。</p></div>';
 var lines=d.areas.map(function(a){
 var tot=a.beds24.reduce(function(x,y){return x+y;},0), need=a.need25.reduce(function(x,y){return x+y;},0);
 return '<tr><td><strong>'+esc(a.name)+'</strong><div class="minor">'+esc(a.code)+'</div></td><td class="num">'+fmt(tot)+'</td><td class="num">'+fmt(need)+'</td><td class="num">'+esc(a.phys)+'</td><td>'+esc(a.drivers)+'</td></tr>';
 });
 el('area-data').innerHTML=lines.join('');
 el('bed-function-data').innerHTML=d.areas.map(function(a){return '<tr><td><strong>'+esc(a.name)+'</strong></td>'+a.beds24.concat(a.need25).map(function(x){return '<td class="num">'+fmt(x)+'</td>';}).join('')+'</tr>';}).join('');

 el('strategy-areas').innerHTML=areas.map(function(a,index){
  return '<details class="card region-detail"'+(index===0?' open':'')+'><summary class="region-summary"><span class="region-heading"><strong>'+esc(a.name)+'医療圏</strong><small>'+esc(a.municipal)+'</small></span><span class="badge estimate">'+score(a).toFixed(1)+' / 100（独自評価）</span></summary><div class="region-body"><p><strong>需要の背景：</strong>'+esc(a.drivers)+'</p><p><strong>主な課題：</strong>'+esc(a.risks)+'</p><p><strong>注目施設・地域：</strong>'+esc(a.focus)+'</p><p><strong>今後3〜5年の論点：</strong>'+esc(a.opportunity)+'</p></div></details>';
 }).join('');
 var fHtml=d.facilities.map(function(h){
 return '<article class="location"><h3><a class="location-name-link" href="'+esc(h.site)+'" rel="noopener noreferrer" target="_blank">'+esc(h.name)+' ↗</a></h3><div class="minor">'+esc(h.area)+'｜'+esc(h.kind)+'</div><div class="minor">'+esc(h.address)+'</div>'+maplinks(h.name,h.address,h.lat,h.lon)+'</article>';
 }).join('');
 el('hospital-list').innerHTML=fHtml;
 var centers=d.healthCenters.map(function(h){
 return '<article class="location"><h3>'+esc(h[0])+'</h3><div class="minor">'+esc(h[1])+'</div>'+maplinks(h[0],h[1],h[2],h[3])+'</article>';
 }).join('');
 el('health-center-list').innerHTML=centers;
 el('dealer-list').innerHTML=d.distributors.map(function(x){return '<span class="chip">'+esc(x)+'</span>';}).join('');
 el('sources-table').innerHTML=d.sources.map(function(s){return '<tr><td>'+esc(s.id)+'</td><td><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title)+' ↗</a></td><td>'+esc(s.year)+'</td></tr>';}).join('');
 el('excluded-list').innerHTML=d.excluded.map(function(x){return '<li>'+esc(x)+'</li>';}).join('');
 el('pending-list').innerHTML=d.unverified.map(function(x){return '<li>'+esc(x)+'</li>';}).join('');
 el('score-weights').innerHTML=d.scoring.axes.map(function(a){return '<tr><td>'+esc(a[0])+'</td><td class="num">'+fmt(a[1])+'%</td><td>地域ごとに1〜5点を付与</td></tr>';}).join('');
 el('summary-note').innerHTML='2024年度の一般・療養病床の報告総数は'+fmt(allBeds)+'床、2025年必要病床数は'+fmt(needBeds)+'床。<strong>調査定義・計画年が異なるため差分を削減数と読み替えることはできません。</strong> 出典：'+refLink(d,'S05')+'／'+refLink(d,'S06')+'。';
 drawChart('chart-age','bar',d.population.comparison.map(function(x){return x[0];}),[{label:'65歳以上人口の割合（2024年・%）',data:d.population.comparison.map(function(x){return x[1];}),backgroundColor:['#7c92aa','#7c92aa','#7c92aa','#0a7f87'],borderRadius:5}],{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,suggestedMax:40,title:{display:true,text:'%'}}}});
 drawChart('chart-areas','bar',d.areas.map(function(a){return a.name;}),[{label:'病床機能報告 2024',data:d.areas.map(function(a){return a.beds24.reduce(function(x,y){return x+y;},0);}),backgroundColor:'#167c94'},{label:'2025年必要病床数（異なる定義）',data:d.areas.map(function(a){return a.need25.reduce(function(x,y){return x+y;},0);}),backgroundColor:'#d09b44'}],{indexAxis:'y',scales:{x:{beginAtZero:true},y:{ticks:{autoSkip:false}}}});
 drawChart('chart-beds','doughnut',['高度急性期','急性期','回復期','慢性期','休棟等'],[{data:byCat.concat([allBeds-byCat.reduce(function(x,y){return x+y;},0)]),backgroundColor:['#143c5b','#2a749f','#20a49e','#b0a1c1','#d6b788']}],{plugins:{legend:{position:'bottom'}},scales:{x:{display:false},y:{display:false}}});
 drawChart('chart-phys','bar',d.areas.map(function(a){return a.name;}),[{label:'医師偏在指標（資料参照値）',data:d.areas.map(function(a){return a.phys;}),backgroundColor:'#5178a2'}],{indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{beginAtZero:true},y:{ticks:{autoSkip:false}}}});
 drawChart('chart-priority','bar',areas.map(function(a){return a.name;}),[{label:'編集部スコア（推計）',data:areas.map(score),backgroundColor:areas.map(function(a){return ['鹿児島','姶良・伊佐','肝属'].indexOf(a.name)>=0?'#087f83':'#729eae';})}],{indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{min:0,max:100},y:{ticks:{autoSkip:false}}}});
 var map;
 try{
  if(typeof L==='undefined')throw Error('Leaflet unavailable');
  map=L.map('medical-map',{scrollWheelZoom:false,zoomControl:true}).setView([30.6,130.3],7);
  var tile=L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{attribution:'出典：<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">地理院タイル</a>',maxZoom:18}).addTo(map);
  d.areas.forEach(function(a){
   var popup='<strong>'+esc(a.name)+'医療圏</strong><br>'+esc(a.municipal)+'<br><span style="font-size:12px">代表地点の概略座標。医療圏境界ではありません。</span>';
   L.circleMarker(a.center,{radius:9,weight:2,color:'#fff',fillColor:'#137e82',fillOpacity:.94}).addTo(map).bindPopup(popup).bindTooltip(a.name);
  });
  d.facilities.forEach(function(h){
    var url='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(h.name+' '+h.address);
    L.circleMarker([h.lat,h.lon],{radius:4,weight:1,color:'#264863',fillColor:'#e2a55b',fillOpacity:.85}).addTo(map).bindPopup('<strong>'+esc(h.name)+'</strong><br><a target="_blank" rel="noopener noreferrer" href="'+url+'">Googleマップで所在地を確認 ↗</a>');
  });
  map.invalidateSize();
 }catch(e){
  map=null;
  el('medical-map').innerHTML='<p class="warning">地図ライブラリまたは地理院タイルを利用できません。下記施設名からGoogleマップと地理院地図へ移動できます。</p>';
 }
 var focusOptions={'鹿児島':{center:[31.59,130.55],zoom:10},'肝属':{center:[31.35,130.90],zoom:9},'熊毛':{center:[30.50,130.87],zoom:8},'奄美':{center:[28.20,129.15],zoom:7}};
 if(doc.querySelectorAll)Array.prototype.forEach.call(doc.querySelectorAll('.map-focus'),function(button){
  var area=button.getAttribute('data-area');
  if(!map || !focusOptions[area]){button.disabled=true;button.title='地図が利用できません';return;}
  button.addEventListener('click',function(){map.setView(focusOptions[area].center,focusOptions[area].zoom);map.invalidateSize();});
 });
 if(window.IntersectionObserver && doc.querySelectorAll){
  var links=Array.prototype.slice.call(doc.querySelectorAll('.nav a[href^="#"]'));
  var currentSections=Array.prototype.slice.call(doc.querySelectorAll('main section[id]'));
  var navObserver=new window.IntersectionObserver(function(entries){
   entries.forEach(function(e){if(!e.isIntersecting)return;links.forEach(function(a){if(a.getAttribute('href')==='#'+e.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});});
  },{rootMargin:'-95px 0px -70% 0px',threshold:0});
  currentSections.forEach(function(node){navObserver.observe(node);});
 }
 el('status').textContent='2026年10月26日版｜県・厚生労働省・社人研の公表資料と編集部の独自評価を区別して掲載しています。';
 var search=el('filter-areas'),counter=el('filter-count'),clear=el('clear-filter');
 function applyRegionFilter(){
  var q=search.value.trim().toLocaleLowerCase('ja-JP');
  var shown=0;
  Array.prototype.forEach.call(el('strategy-areas').children,function(card){
   var match=!q || card.textContent.toLocaleLowerCase('ja-JP').includes(q);
   card.hidden=!match;if(match)shown++;
  });
  counter.textContent=q ? shown+' / '+d.areas.length+'医療圏を表示' : '全'+d.areas.length+'医療圏を表示';
  counter.setAttribute('data-empty',shown===0?'true':'false');
  clear.disabled=!q;
 }
 search.addEventListener('input',applyRegionFilter);
 clear.addEventListener('click',function(){search.value='';applyRegionFilter();search.focus();});
 applyRegionFilter();
}
fetch('./data/research.json',{cache:'no-store'}).then(function(response){
 if(!response.ok)throw Error('データ読み込み失敗 '+response.status);
 return response.json();
}).then(render).catch(function(e){
 el('status').textContent='データを読み込めませんでした。公開元の data/research.json を確認してください。';
 var n=el('fallback');if(n)n.hidden=false;
 if(window.console&&typeof window.console.error==='function')window.console.error('Kagoshima data error',e);
});
})();
