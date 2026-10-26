'use strict';
document.addEventListener('DOMContentLoaded', function(){
const d=window.HOKKAIDO_DATA;
if(!d){document.getElementById('areaRows').innerHTML='<tr><td colspan="7">データ読み込みに失敗しました。</td></tr>';return}
const f=(v)=>String(v),esc=(v)=>f(v).replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const g=(s)=>document.getElementById(s);
const google=(n)=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(n+' 北海道');
const gsi=(a,b)=>'https://maps.gsi.go.jp/#15/'+a+'/'+b+'/';
const score=(a)=>Math.round((35*a.demand+25*a.hub+20*a.shortage+20*a.logistics)/5);
const arr=d.areas.map(a=>Object.assign({},a,{score:score(a)}));
function table(){
let q=g('areaSearch').value.trim(),cl=g('areaClass').value;
let list=arr.filter(a=>(!cl||a.doctorClass===cl)&&(!q||(a.name+a.city+a.driver+a.opportunity+a.facility).includes(q))).sort((a,b)=>b.score-a.score);
g('areaCount').textContent=list.length+' / 21 二次医療圏';
g('areaRows').innerHTML=list.map(a=>'<tr><td><b>'+esc(a.name)+'</b><br><small>'+esc(a.city)+'</small></td><td>'+esc(a.doctorClass)+'<br>'+a.physician+'</td><td><b>'+a.score+'</b>/100</td><td>'+esc(a.driver)+'</td><td>'+esc(a.opportunity)+'</td><td>'+esc(a.facility)+'</td><td><a target="_blank" rel="noopener" href="'+google(a.city)+'">Google</a> / <a target="_blank" rel="noopener" href="'+gsi(a.lat,a.lon)+'">地理院</a></td></tr>').join('')||'<tr><td colspan="7">該当なし</td></tr>';
}table();g('areaSearch').addEventListener('input',table);g('areaClass').addEventListener('change',table);
g('scoreMethod').textContent='独自分析スコア：需要の集積35%、地域中核性25%、医師不足課題20%、地理・保守負荷20%。各項目1～5点で100点換算。公的格付け・販売見込み・企業推奨ではありません。';
g('exportCsv').addEventListener('click',()=>{
let head=['医療圏','代表市町','医師偏在指標','区分','独自スコア','需要ドライバー','機会の仮説'];
let rows=[head,...arr.map(a=>[a.name,a.city,a.physician,a.doctorClass,a.score,a.driver,a.opportunity])];
let output='\uFEFF'+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
let url=URL.createObjectURL(new Blob([output],{type:'text/csv;charset=utf-8'}));
let a=document.createElement('a');a.href=url;a.download='hokkaido_21_medical_areas.csv';a.click();URL.revokeObjectURL(url);
});
const places=[
['北海道庁','札幌市中央区北3条西6丁目',43.062,141.35,'行政'],
['北海道大学病院','札幌市北区北14条西5丁目',43.074,141.342,'大学'],
['札幌医科大学附属病院','札幌市中央区南1条西16丁目291番地',43.055,141.335,'大学'],
['旭川医科大学病院','旭川市緑が丘東2条1丁目1番1号',43.731,142.385,'大学'],
['市立札幌病院','札幌市中央区北11条西13丁目1-1',43.071,141.339,'病院'],
['北海道がんセンター','札幌市白石区菊水4条2丁目3-54',43.056,141.383,'病院'],
['手稲渓仁会病院','札幌市手稲区前田1条12丁目1-40',43.12,141.24,'病院'],
['市立函館病院','函館市港町1丁目10番1号',41.79,140.728,'病院'],
['函館五稜郭病院','函館市五稜郭町38番3号',41.793,140.756,'病院'],
['旭川赤十字病院','旭川市曙1条1丁目1-1',43.769,142.339,'病院'],
['旭川厚生病院','旭川市1条通24丁目111番地',43.762,142.395,'病院'],
['砂川市立病院','砂川市西4条北3丁目1番1号',43.494,141.905,'病院'],
['北見赤十字病院','北見市北6条東2丁目',43.806,143.895,'病院'],
['帯広厚生病院','帯広市西14条南10丁目1番地',42.924,143.175,'病院'],
['市立釧路総合病院','釧路市春湖台1番12号',42.984,144.39,'病院'],
['王子総合病院','苫小牧市若草町3丁目4番8号',42.635,141.604,'病院'],
['小樽市立病院','小樽市若松1丁目1番1号',43.188,141.0,'病院'],
['北海道医師会','札幌市中央区大通西6丁目',43.06,141.345,'医師会'],
['札幌市保健所','札幌市中央区大通西19丁目',43.06,141.324,'保健所'],
['市立函館保健所','函館市五稜郭町23番1号',41.792,140.757,'保健所'],
['旭川市保健所','旭川市7条通9丁目',43.772,142.364,'保健所'],
['小樽市保健所','小樽市築港11番1号',43.182,141.023,'保健所']
];
g('placeKind').innerHTML='<option value="">すべて</option>'+['大学','病院','医師会','行政','保健所'].map(k=>'<option>'+k+'</option>').join('');
function showPlaces(){
let cl=g('placeKind').value,p=places.filter(x=>!cl||x[4]===cl);
g('facilityCount').textContent=p.length+'施設・機関';
g('placeList').innerHTML=p.map(x=>'<div class="facility"><div><strong>'+esc(x[0])+'</strong><small>'+esc(x[1])+' ／ '+esc(x[4])+'</small></div><div class="loclinks"><a target="_blank" rel="noopener" href="'+google(x[0]+' '+x[1])+'">Google マップ</a><a title="周辺参考座標であり正確な敷地座標ではありません" target="_blank" rel="noopener" href="'+gsi(x[2],x[3])+'">地理院（周辺）</a></div></div>').join('');
}g('placeKind').addEventListener('change',showPlaces);showPlaces();
if(typeof L!=='undefined'){
let map=L.map('medicalMap',{scrollWheelZoom:false}).setView([43.6,142.7],6);
L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{attribution:'出典：地理院タイル（国土地理院）',maxZoom:17}).addTo(map);
arr.forEach(a=>L.circleMarker([a.lat,a.lon],{radius:5+a.hub*1.1,color:a.doctorClass==='少数'?'#bc6131':'#176b86',fillOpacity:.8}).addTo(map).bindPopup('<b>'+esc(a.name)+'</b>：'+esc(a.city)+'<br>医師偏在指標 '+a.physician+'<br><a target="_blank" href="'+google(a.city)+'">Google</a> / <a target="_blank" href="'+gsi(a.lat,a.lon)+'">地理院</a>'));
}else{g('medicalMap').textContent='地図機能の取得に失敗しました。各医療圏の地図リンクは表から開けます。'}
if(typeof Chart!=='undefined'){
let chart=(id,type,labels,values,options={})=>new Chart(g(id),{type,data:{labels,datasets:[{label:options.label||'値',data:values,borderColor:'#087d80',backgroundColor:type==='line'?'rgba(8,125,128,.18)':'#328e98',fill:type==='line',tension:.25}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:options.horizontal?'y':'x',plugins:{legend:{display:type==='line'}},scales:{x:options.horizontal?{beginAtZero:true}:{},y:options.horizontal?{ticks:{autoSkip:false,font:{size:10}}}:{beginAtZero:false}}}});
chart('populationChart','line',d.population.years.map(String),d.population.hokkaido,{label:'北海道（万人）'});
let doctors=arr.slice().sort((a,b)=>b.physician-a.physician);
chart('doctorChart','bar',doctors.map(a=>a.name),doctors.map(a=>a.physician),{horizontal:true});
let top=arr.slice().sort((a,b)=>b.score-a.score).slice(0,10);
chart('scoreChart','bar',top.map(a=>a.name),top.map(a=>a.score),{horizontal:true});
}else{document.querySelectorAll('.chartframe').forEach(x=>x.innerHTML='<p class="fallback">グラフは外部ライブラリ取得時に表示します。データは表を参照してください。</p>')}
const list=[
['北海道医療計画','2024–2029',d.sources.plan],['地域医療構想・2025必要病床数','2025基準',d.sources.vision],['4機能病床報告','2024年度',d.sources.beds],['21圏域患者受療動向','2024年度診療',d.sources.regions],['医師確保計画・偏在指標','2024–2026',d.sources.doctor],['重点医師偏在対策支援区域（予定）','2026年10月',d.sources.priority],['社人研人口推計','2023年推計',d.sources.ipss],['2025国勢調査人口速報','2025年調査',d.sources.census],['医療施設調査 CT/MRI','2023年設備原表',d.sources.estat],['医療施設調査概況','2024年',d.sources.clinic],['基金（医療分）','2026–2027',d.sources.fund],['北海道遠隔医療','2026年',d.sources.remote],['道内保健所一覧','2026年参照',d.sources.healthOffice],['北海道医師会','2026年参照',d.sources.medicalAssociation],['がん拠点病院一覧','2026年',d.sources.cancer],['救命救急センター','2026年4月',d.sources.emergency]];
g('sourcesList').innerHTML=list.map((x,i)=>'<li>['+(i+1)+'] <a href="'+x[2]+'" target="_blank" rel="noopener">'+esc(x[0])+'</a> <span class="source-year">'+esc(x[1])+'</span></li>').join('');
});