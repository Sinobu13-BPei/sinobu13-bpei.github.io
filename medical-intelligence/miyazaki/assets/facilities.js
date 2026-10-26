
/* Miyazaki facility atlas. 2022 official area counts vs. year-unverified association-area worksheet are NEVER merged. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n).toLocaleString('ja-JP');
const href=(url,title)=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(title)+'</a>';
const gmap=(name,address)=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(name+' '+address);
const sum=(arr,key)=>arr.reduce((t,x)=>t+x[key],0);
let dataset;
const regionCenters={"宮崎東諸県":[31.91,131.42],"都城北諸県":[31.72,131.06],"延岡西臼杵":[32.58,131.66],"日南串間":[31.60,131.38],"西諸":[31.99,130.98],"西都児湯":[32.11,131.40],"日向入郷":[32.43,131.63]};
const gsiRegion = area => {const v=regionCenters[area];return v?'https://maps.gsi.go.jp/#14/'+v[0]+'/'+v[1]+'/':'https://maps.gsi.go.jp/'};
const refYear="基準年未確認";
const makeTable=(rows,headers,classes='')=>'<div class="fac-table-wrap"><table class="fac-table '+classes+'"><thead><tr>'+headers.map(x=>'<th scope="col">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table></div>';
function renderOfficial(data){
const o=data.official2022, a=o.areas, total=o.totals;
$('facilityKpis').innerHTML=[
['病院',total.hospital,'2022・県全域'],['一般診療所',total.clinic,'2022・歯科を除く'],
['歯科診療所',total.dental,'2022・歯科を別掲'],['有床一般診療所',total.bedded,'2022・一般診療所の内数']
].map(x=>'<article class="fac-stat"><small>'+x[0]+'</small><strong>'+fmt(x[1])+'</strong><span>'+x[2]+'</span></article>').join('');
const rows=a.map(x=>'<tr><td><b>'+esc(x.name)+'</b></td><td>'+fmt(x.hospitals)+'</td><td><b>'+fmt(x.generalClinics)+'</b></td><td>'+fmt(x.beddedClinics)+'</td><td>'+fmt(x.nonBeddedClinics)+'</td><td>'+fmt(x.clinicBeds)+'</td><td>'+fmt(x.dentalClinics)+'</td><td>'+x.rate2023.toFixed(1)+'</td></tr>');
rows.push('<tr><td><b>宮崎県合計</b></td><td><b>132</b></td><td><b>918</b></td><td><b>134</b></td><td><b>784</b></td><td><b>2,146</b></td><td><b>488</b></td></tr>');
$('facilityAreaTable').innerHTML=makeTable(rows,['二次医療圏','病院数','医科診療所','有床','無床','診療所病床','歯科診療所']);
$('facilitySourceOfficial').innerHTML=href(o.source.url,'県第8次医療計画・第3章 pp.38–39（2022年医療施設調査）');
$('facilityDensityInfo').innerHTML='2023年の人口10万人当たり医科診療所数は、添付「医療需給総覧」の令和5年医療施設調査値です。<b>2022年の施設実数と2023年の人口当たり数値を合算・逆算していません。</b> 全国 84.2／宮崎県 84.6（2023年、人口10万人当たり）。';
if(window.Chart){
  new Chart($('facilityCountChart'),{type:'bar',data:{labels:a.map(x=>x.name),datasets:[{label:'一般診療所（施設）',data:a.map(x=>x.generalClinics),backgroundColor:'#0f8490',borderRadius:5},{label:'病院（施設）',data:a.map(x=>x.hospitals),backgroundColor:'#df9558',borderRadius:5}]},
  options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}},scales:{y:{beginAtZero:true,title:{display:true,text:'施設数'}},x:{ticks:{maxRotation:35,minRotation:0,font:{size:10}}}}}});
  new Chart($('facilityBeddedChart'),{type:'doughnut',data:{labels:['有床一般診療所','無床一般診療所'],datasets:[{data:[total.bedded,total.nonBedded],backgroundColor:['#db8e56','#0f8490'],borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,cutout:'66%',plugins:{legend:{position:'bottom'}}}});
  new Chart($('facilityDensityChart'),{type:'bar',data:{labels:a.map(x=>x.name).concat(['宮崎県','全国']),datasets:[{label:'2023年人口10万人当たり一般診療所',data:a.map(x=>x.rate2023).concat([84.6,84.2]),backgroundColor:a.map(x=>x.rate2023>84.2?'#13828b':'#9bbfc8').concat(['#13577e','#e09b58']),borderRadius:4}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{min:0,max:115},y:{ticks:{font:{size:11}}}}}});
}else{
$('facilityCountChart').replaceWith(document.createTextNode('グラフが利用できない場合は上の施設数表をご確認ください。'));
$('facilityBeddedChart').replaceWith(document.createTextNode('有床：134施設／無床：784施設（2022年）'));
$('facilityDensityChart').replaceWith(document.createTextNode('2023年の人口10万人当たり診療所数は下記表の最終列を参照してください。'));
}
}
function renderAssoc(data){
const ref=data.referenceUnverified, a=ref.associations, ms=ref.municipalities;
$('facilityAssocCount').textContent=a.length+' 医師会';
$('facilityReferenceWarning').innerHTML='【参考値・集計年次未確認】各医師会の「所在地域の病院数・一般診療所数」は、添付Excel「市町村_市場」シートの市町村数値を集計したものです。<strong>医師会加盟施設数ではありません。</strong>基準年不明につき、県公式2022年の施設数とは差があり、更新状況は未確認です。医師会別の正確な会員施設数は各医師会へ個別確認が必要です。';
$('facilityAssociationList').innerHTML=a.map(x=>{
 const n=x.regionalFacilityCountsReference;
 return '<article class="fac-assoc"><span class="fac-region">'+esc(x.area)+'</span><h4>'+esc(x.name)+'</h4><p>対象：'+x.municipalities.map(esc).join('・')+'</p><div class="fac-assoc-metrics"><div><small>所在地域の一般診療所（参考）</small><strong>'+fmt(n.generalClinics)+'</strong></div><div><small>所在地域の病院（参考）</small><strong>'+fmt(n.hospitals)+'</strong></div></div><p>'+esc(x.work)+'</p><div class="fac-assoc-links">'+href(x.url,'医師会公式 ↗')+' '+href(gmap(x.name,x.address),'Googleマップ ↗')+' '+href(gsiRegion(x.area),'地理院地図（地域概略） ↗')+'</div><p class="fac-note">※会員数ではなく医師会対象市町村の参考合計。'+refYear+'。</p></article>'
}).join('');
const select=$('facilityAreaSelect');select.innerHTML='<option value="all">宮崎県内すべて</option>'+data.official2022.areas.map(x=>'<option value="'+esc(x.name)+'">'+esc(x.name)+'</option>').join('');
const selectAssoc=$('facilityAssocSelect');selectAssoc.innerHTML='<option value="all">すべての郡市医師会</option>'+a.map(x=>'<option value="'+esc(x.name)+'">'+esc(x.name)+'</option>').join('');
const doctorArea=new Map(a.flatMap(x=>x.municipalities.map(m=>[m,x.name])));
const draw=()=>{
 const chosen=select.value,assoc=selectAssoc.value;
 const filtered=ms.filter(x=>(chosen==='all'||x.area===chosen)&&(assoc==='all'||doctorArea.get(x.name)===assoc));
 const rows=filtered.map(x=>'<tr><td><b>'+esc(x.name)+'</b></td><td>'+esc(x.area)+'</td><td>'+esc(doctorArea.get(x.name)||'―')+'</td><td>'+fmt(x.hospitals)+'</td><td><b>'+fmt(x.generalClinics)+'</b></td></tr>');
 rows.push('<tr><td><b>表示対象合計</b></td><td>―</td><td>―</td><td><b>'+fmt(sum(filtered,'hospitals'))+'</b></td><td><b>'+fmt(sum(filtered,'generalClinics'))+'</b></td></tr>');
 $('facilityMunicipalTable').innerHTML=makeTable(rows,['市町村','医療圏','対応医師会（分析上の地域分類）','病院数（参考）','一般診療所数（参考）']);
 $('facilityMunicipalCount').textContent=filtered.length+' 市町村';
 };
 select.addEventListener('change',draw);selectAssoc.addEventListener('change',draw);draw();
 $('facilityAssocSources').innerHTML=href(data.physicianAssocOfficial.url,'宮崎県医師会・9郡市医師会公式リンク（2026年10月確認）')+'　／　'+esc(ref.source.title)+'（基準年未確認）';
}
fetch('./data/facilities-and-associations.json',{cache:'no-cache'})
.then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()})
.then(d=>{dataset=d;renderOfficial(d);renderAssoc(d);$('facilityLoadStatus').textContent='施設数・医師会地域対応データ：読込済み'})
.catch(e=>{console.error('facility counts',e);$('facilityLoadStatus').textContent='施設数の追加データを読み込めませんでした。再読み込みするか県の第8次医療計画をご確認ください。'});
})();
