(()=>{'use strict';
const D=window.HIROSHIMA_DATA;
if(!D){console.error('研究データを読み込めません');return;}
const $=s=>document.querySelector(s);
const make=(tag,txt,cls)=>{const el=document.createElement(tag);if(txt!==undefined&&txt!==null)el.textContent=String(txt);if(cls)el.className=cls;return el;};
const link=(href,txt)=>{const a=make('a',txt);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;};
const fmt=n=>new Intl.NumberFormat('ja-JP').format(n);
const w=[.30,.25,.20,.15,.10];
const score=a=>+(a.score.reduce((t,x,i)=>t+x*w[i],0)*20).toFixed(1);
const appendCell=(row,v)=>row.appendChild(make('td',v));
const MAPURL=(name,address)=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(name+' '+address);
const GSI=(lat,lng)=>'https://maps.gsi.go.jp/#15/'+Number(lat).toFixed(5)+'/'+Number(lng).toFixed(5)+'/';
const colors=['#114d75','#3196aa','#e5ac54','#7e83b8','#a2b5b9'];
// 出典リンク一覧
const src=$('#sourceList');if(src){Object.entries(D.source).forEach(([id,s])=>{const li=make('li');li.id='src-'+id;li.append(make('strong',s.title),make('em','年次：'+s.year+' ／ '),link(s.url,'公式資料を開く ↗'));src.appendChild(li)})}
// 病床データ表
const tbody=$('#areaTable tbody');D.areas.forEach(a=>{const tr=make('tr');appendCell(tr,a.name);appendCell(tr,fmt(a.total));a.beds.forEach(n=>appendCell(tr,fmt(n)));tbody.appendChild(tr)});
// 圏域カード
const target=$('#regionCards');D.areas.forEach(a=>{const card=make('article',null,'region-card');const header=make('header');header.append(make('h4',a.name),make('span',score(a)+' / 100','score'));card.appendChild(header);card.append(make('p',a.cities,'cities'));[['需要','driver'],['主要課題','issue'],['注目施設','hosp'],['3〜5年の機会','future']].forEach(([lab,key])=>{const p=make('p');p.append(make('b',lab+'：'),document.createTextNode(a[key]));card.appendChild(p)});target.appendChild(card)});
// 公表された病院設備のみ掲載
const dt=$('#deviceTable tbody');D.verifiedDevices.forEach(x=>{const tr=make('tr');[x.facility,x.type,x.count,x.note].forEach(v=>appendCell(tr,v));dt.appendChild(tr)});
// 流通
const trd=$('#tradeCards');D.trade.forEach(t=>{const article=make('article',null,'trade-card');article.append(make('h3',t.name),make('small',t.type),make('p',t.scope),link(t.url,'事業情報・拠点 ↗'));trd.append(article)});
const scores=[...D.areas].sort((a,b)=>score(b)-score(a));const sn=$('#scoreNotes');scores.forEach((a,i)=>{const p=make('p');p.append(make('b',(i+1)+'. '+a.name+'：'+score(a)+'点'),make('small','需要 / 再編 / アクセス / 施設 / 実行：'+a.score.join('・')));sn.append(p)});
// 公的機関一覧
const associations=$('#associationList'),offices=$('#healthOfficeList');
D.associations.forEach(p=>{const row=make('p');row.append(link(p.url,p.name),make('small',p.address));associations.append(row)});
D.healthOffices.forEach(p=>{const row=make('p');row.append(link(D.source.office.url,p.name),make('small',p.address));offices.append(row)});
// 地図施設には公式サイト、Googleマップ、地理院地図を全件表示
const coord=(record)=>{
 if(Number.isFinite(record.lat)&&Number.isFinite(record.lng))return [record.lat,record.lng,false];
 const found=D.facilities.find(x=>x.address&&record.address&&x.address===record.address);
 if(found)return [found.lat,found.lng,true];
 const cityNames=['広島市','呉市','福山市','三原市','尾道市','東広島市','廿日市市','三次市'];
 const city=cityNames.find(c=>record.address.startsWith(c));
 const guide={'広島市':[34.397,132.464],'呉市':[34.248,132.565],'福山市':[34.487,133.362],'三原市':[34.398,133.08],'尾道市':[34.416,133.2],'東広島市':[34.426,132.743],'廿日市市':[34.351,132.333],'三次市':[34.803,132.855]};
 return [...(guide[city]||[34.38,132.53]),true];
};
const points=[...D.facilities.map(x=>({...x,category:'病院',desc:x.note})),...D.associations.map(x=>({...x,category:'医師会',desc:'地区医師会'})),...D.healthOffices.map(x=>({...x,category:'保健所',desc:'所管区域は厚労省参照',url:D.source.office.url}))];
let m=null,markers=null,pinMap=new Map();
if(window.L){try{m=L.map('map',{scrollWheelZoom:false,zoomControl:true}).setView([34.57,132.8],8);L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{attribution:'<a href="https://maps.gsi.go.jp/">地理院タイル</a> © 国土地理院',maxZoom:18}).addTo(m);markers=L.layerGroup().addTo(m);setTimeout(()=>m.invalidateSize(),250)}catch(err){console.warn('地図初期化に失敗しました',err)}}
function showFacilities(){
 const q=($('#facilitySearch').value||'').trim().toLowerCase(),cat=$('#facilityType').value;
 const list=$('#facilityList');list.replaceChildren();if(markers)markers.clearLayers();pinMap=new Map();
 const matching=points.filter(x=>(!cat||x.category===cat)&&(x.name+' '+x.area+' '+x.address+' '+x.desc).toLowerCase().includes(q));
 if(!matching.length){list.append(make('p','該当施設はありません。'));return;}
 matching.forEach(p=>{
  const [lat,lng,approx]=coord(p),item=make('div',null,'facility-item');
  const head=make('b',p.name),descr=make('small',p.address+' ｜ '+(p.type||p.desc||p.category)+(approx?'（座標概略）':''));
  const links=make('div',null,'facility-links');
  links.append(link(p.url||D.source.office.url,'公式'),link(MAPURL(p.name,p.address),'Googleマップ'),link(GSI(lat,lng),'地理院地図'));
  item.append(head,descr,links);list.append(item);
  if(markers){const marker=L.circleMarker([lat,lng],{radius:p.category==='病院'?7:5,color:'#ffffff',weight:2,fillColor:p.category==='医師会'?'#ce8d2b':p.category==='保健所'?'#8562a9':'#087e86',fillOpacity:.93});
   marker.bindPopup('<strong>'+escapeHTML(p.name)+'</strong><div style="font-size:11px">'+escapeHTML(p.address)+'</div>').addTo(markers);pinMap.set(p.name,marker);
   head.tabIndex=0;head.title='地図の場所に移動';head.style.cursor='pointer';
   const focus=()=>{m.setView([lat,lng],12);marker.openPopup()};head.addEventListener('click',focus);head.addEventListener('keydown',ev=>{if(ev.key==='Enter')focus()})}
 });
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('#facilitySearch').addEventListener('input',showFacilities);$('#facilityType').addEventListener('change',showFacilities);showFacilities();
// Chart.js を使用した病床・人口・偏在・独自スコアの可視化
const usable=!!window.Chart;
if(!usable){document.querySelectorAll('.chart').forEach(c=>c.append(make('p','グラフのライブラリを読み込めませんでした。表・数値をご確認ください。','small')))}
else {
Chart.defaults.font.family='system-ui, sans-serif';Chart.defaults.color='#365468';
const legend={position:'bottom',labels:{boxWidth:11,usePointStyle:true,padding:15}};
const opt={responsive:true,maintainAspectRatio:false,plugins:{legend},interaction:{intersect:false,mode:'index'}};
new Chart($('#populationChart'),{type:'line',data:{labels:['2020実績','2026推計','2030社人研','2040社人研','2050社人研'],datasets:[{label:'人口（万人）※異なる統計系列',data:[D.population.census2020/10000,D.population.estimate202609/10000,D.population.ipss2030/10000,D.population.ipss2040/10000,D.population.ipss2050/10000],borderColor:'#087e86',backgroundColor:'rgba(8,126,134,.13)',fill:true,tension:.15,pointRadius:5}]},options:{...opt,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>ctx.parsed.y.toFixed(1)+'万人（系列に注意）'}}},scales:{y:{beginAtZero:false,title:{display:true,text:'万人'}}}}});
new Chart($('#bedsChart'),{type:'bar',data:{labels:D.areas.map(x=>x.name),datasets:['高度急性期','急性期','回復期','慢性期','休棟等'].map((label,i)=>({label,data:D.areas.map(x=>x.beds[i]),backgroundColor:colors[i],borderRadius:2}))},options:{...opt,scales:{x:{stacked:true,ticks:{maxRotation:40,minRotation:0}},y:{stacked:true,beginAtZero:true,title:{display:true,text:'床'}}}}});
new Chart($('#doctorChart'),{type:'bar',data:{labels:['全国','広島','岡山','山口','島根','愛媛'],datasets:[{label:'2026年医師偏在指標',data:[D.doctorIndex.national,D.doctorIndex.hiroshima,D.doctorIndex.okayama,D.doctorIndex.yamaguchi,D.doctorIndex.shimane,D.doctorIndex.ehime],backgroundColor:['#95b2be','#087e86','#7ea7c5','#7ea7c5','#7ea7c5','#7ea7c5'],borderRadius:5}]},options:{...opt,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{beginAtZero:true}}}});
new Chart($('#scoreChart'),{type:'bar',data:{labels:scores.map(a=>a.name),datasets:[{label:'暫定スコア / 100',data:scores.map(score),backgroundColor:'#188b92',borderRadius:5}]},options:{...opt,indexAxis:'y',plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>ctx.parsed.x+'点（独自分析）'}}},scales:{x:{min:0,max:100},y:{ticks:{autoSkip:false}}}}});
}
})();