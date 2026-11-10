/*
 * 栃木県医師数・診療科・病院／診療所従事医師の可視化
 * 元データ：2024年医師・歯科医師・薬剤師統計、公開一次資料に基づく数値
 * CSVの範囲を超える地域×診療科×勤務先クロス集計は作らない。
 */
(function(){
 'use strict';
 const d=window.TOCHIGI_DOCTORS_2024;
 if(!d)return;
 const $=id=>document.getElementById(id);
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
 const num=v=>Number(v).toLocaleString('ja-JP');
 const percent=(v,total)=>((v/total)*100).toFixed(1)+'%';
 const t=d.type;
 if($('doctorKpis')){
  const cards=[
   ['届出医師の総数',t.registered,'医療施設外で従事する201人を含む'],
   ['医療施設に従事',t.medicalFacilities,percent(t.medicalFacilities,t.registered)+'／届出医師'],
   ['病院で従事',t.hospital,percent(t.hospital,t.medicalFacilities)+'／医療施設従事'],
   ['診療所で従事',t.clinic,percent(t.clinic,t.medicalFacilities)+'／医療施設従事'],
   ['診療所開設者等',t.clinicOwner,'開業医の近似指標・診療所従事者の内数'],
   ['診療所勤務者',t.clinicEmployees,'診療所従事者の内数']
  ];
  $('doctorKpis').innerHTML=cards.map(v=>'<article class="factcard"><small>'+escape(v[0])+'</small><strong>'+num(v[1])+'人</strong><span>'+escape(v[2])+'</span></article>').join('');
 }
 if($('doctorWorkTable'))$('doctorWorkTable').querySelector('tbody').innerHTML=[
  ['届出医師の総数',t.registered,'医療施設外も含む'],
  ['病院で従事',t.hospital,'医療施設従事者の70.2%'],
  ['　病院の開設者等',t.hospitalOwner,'病院従事者の内数'],
  ['　病院の勤務者',t.hospitalEmployees,'開設者等を除く（医育機関含む）'],
  ['診療所で従事',t.clinic,'医療施設従事者の29.8%'],
  ['　診療所の開設者等',t.clinicOwner,'開業医の近似指標'],
  ['　診療所の勤務者',t.clinicEmployees,'開設者等を除く'],
  ['医療施設外・その他',t.other,'届出医師の4.2%'],
  ['医療施設従事者の小計',t.medicalFacilities,'病院＋診療所']
 ].map(x=>'<tr><th scope="row">'+escape(x[0])+'</th><td class="num">'+num(x[1])+'</td><td>'+escape(x[2])+'</td></tr>').join('');
 const excluded=new Set(['臨床研修医','全科','その他','主たる診療科不詳','不詳']);
 const top=d.specialties.filter(([name])=>!excluded.has(name)).slice().sort((a,b)=>b[1]-a[1]).slice(0,12);
 const charts=[
  ['doctorWorkChart','doughnut',{labels:['病院の医師','診療所の医師'],datasets:[{data:[t.hospital,t.clinic],backgroundColor:['#266d88','#bd8b43'],borderWidth:1}]},{plugins:{legend:{position:'bottom'}}}],
  ['doctorSpecialtyChart','bar',{labels:top.map(x=>x[0]),datasets:[{label:'医師数（人）',data:top.map(x=>x[1]),backgroundColor:'#277d8a',borderRadius:4}]},{indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{beginAtZero:true},y:{ticks:{autoSkip:false,font:{size:11}}}}}],
  ['doctorAgeChart','bar',{labels:d.ages.map(x=>x[0]),datasets:[{label:'医師数（人）',data:d.ages.map(x=>x[1]),backgroundColor:'#497aab',borderRadius:3}]},{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}]
 ];
 for(const [id,kind,data,options] of charts){
  const el=$(id);if(!el)continue;
  if(typeof Chart==='undefined'){
   el.parentElement.innerHTML='<p class="note">グラフの表示ライブラリを読み込めませんでした。数値は同じ章の比較表で確認できます。</p>';
   continue;
  }
  try{new Chart(el,{type:kind,data,options:{responsive:true,maintainAspectRatio:false,...options}})}
  catch(err){el.parentElement.innerHTML='<p class="note">グラフの表示に失敗しました。数値は下の表で確認できます。</p>'}
 }
 const renderSpecialties=()=>{
  const el=$('doctorSpecialtyTable');if(!el)return;
  const query=($('doctorSpecialtySearch')?.value||'').trim().toLocaleLowerCase('ja-JP');
  const sort=$('doctorSpecialtySort')?.value||'count';
  const entries=d.specialties.map(([name,count],i)=>({name,count,i})).filter(x=>x.name.toLocaleLowerCase('ja-JP').includes(query));
  if(sort==='count')entries.sort((a,b)=>b.count-a.count||a.i-b.i);
  if(sort==='name')entries.sort((a,b)=>a.name.localeCompare(b.name,'ja'));
  el.querySelector('tbody').innerHTML=entries.map(x=>'<tr><th scope="row">'+escape(x.name)+'</th><td class="num">'+num(x.count)+'</td><td class="num">'+percent(x.count,t.medicalFacilities)+'</td></tr>').join('');
  if($('doctorSpecialtyCount'))$('doctorSpecialtyCount').textContent='表示 '+entries.length+'区分／全45区分';
 };
 $('doctorSpecialtySearch')?.addEventListener('input',renderSpecialties);
 $('doctorSpecialtySort')?.addEventListener('change',renderSpecialties);
 renderSpecialties();
 if($('doctorAgeTable'))$('doctorAgeTable').querySelector('tbody').innerHTML=d.ages.map(x=>'<tr><th scope="row">'+escape(x[0])+'</th><td class="num">'+num(x[1])+'</td><td class="num">'+percent(x[1],t.medicalFacilities)+'</td></tr>').join('');
})();
