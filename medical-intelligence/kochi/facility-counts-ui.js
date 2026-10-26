/* Public counts dashboard. Does not expose the uploaded facility-level business dataset. */
(()=>{"use strict";
const D=window.KOCHI_FACILITY_COUNTS;
if(!D)return;
const f=(q)=>document.querySelector(q),esc=x=>String(x).replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[k]));
const total=(rows,col)=>rows.reduce((s,x)=>s+(Number(x[col])||0),0),n=x=>Number(x).toLocaleString("ja-JP");
const areaKeys=["安芸","中央","高幡","幡多"];
const regionData=areaKeys.map(region=>{
 const c=D.census2023.find(x=>x.region===region);
 const rows=D.municipalities.filter(x=>x[1]===region);
 return {...c,year2026:{hospitals:total(rows,3),clinics:total(rows,4),dental:total(rows,5)}};
});
const rows=D.associations.map(a=>{
 const cities=D.municipalities.filter(x=>x[2]===a.name);
 return {...a,towns:cities,counts:{hospitals:total(cities,3),clinics:total(cities,4),dental:total(cities,5)}};
});
const numeric={h:total(D.municipalities,3),c:total(D.municipalities,4),d:total(D.municipalities,5)};
if(numeric.h!==118||numeric.c!==398||numeric.d!==323||D.municipalities.length!==34){console.warn("Public facility count source totals do not reconcile");return}
const t=f("#fCensusAreaTable tbody");
if(t){t.innerHTML=regionData.map(r=>'<tr><th scope="row">'+esc(r.region)+'</th><td>'+r.hospitals+'</td><td>'+r.clinics+'</td><td>'+r.bedded+'</td><td><b>'+(r.hospitals+r.clinics)+'</b></td></tr>').join("")+
'<tr><th scope="row">高知県計</th><td><b>118</b></td><td><b>514</b></td><td><b>55</b></td><td><b>632</b></td></tr>'}
const btn=f("#fAssociationSelect");
if(btn){rows.forEach(a=>{const o=document.createElement("option");o.value=a.name;o.textContent=a.name;btn.append(o)});}
const gm=a=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(a.name+' '+a.address+' 高知県');
const gsi=a=>'https://maps.gsi.go.jp/#15/'+a.lat+'/'+a.lng+'/';
function drawAssociations(){
 const sel=btn?.value||"all";
 const showing=rows.filter(a=>sel==="all"||a.name===sel);
 const el=f("#fAssociationTable tbody");
 if(!el)return;
 el.innerHTML=showing.map(a=>{
 const counts=a.counts;
 const prov=a.overlap?'教育機関対象（重複あり）':'行政区域内の施設数（会員数ではない）';
 return '<tr><th scope="row">'+esc(a.name)+'</th><td>'+esc(a.scope)+'<small style="display:block;color:#5d7681">'+prov+'</small></td>'+
 '<td>'+(a.overlap?"—":counts.hospitals)+'</td><td>'+(a.overlap?"—":counts.clinics)+'</td><td>'+(a.overlap?"—":counts.dental)+'</td><td><b>'+(a.overlap?"—":(counts.hospitals+counts.clinics))+'</b></td>'+
 '<td><a class="external" href="'+esc(a.url)+'" rel="noopener noreferrer" target="_blank">公式</a><a class="external" href="'+gm(a)+'" target="_blank" rel="noopener noreferrer">Googleマップ</a><a class="external" href="'+gsi(a)+'" target="_blank" rel="noopener noreferrer">地理院地図（概略）</a></td></tr>'
 }).join("");
 if(sel==="all"){
 el.insertAdjacentHTML("beforeend",'<tr><th>7地区医師会合計</th><td>県内34市町村・重複なし</td><td><b>118</b></td><td><b>398</b></td><td><b>323</b></td><td><b>516</b></td><td>2026年6月1日</td></tr>');
 }
}
btn?.addEventListener("change",drawAssociations);drawAssociations();
function drawMunicipalities(){
 const sel=f("#fMunicipalityRegion")?.value||"all";
 const items=D.municipalities.filter(x=>sel==="all"||x[1]===sel);
 const el=f("#fMunicipalityTable tbody");if(!el)return;
 el.innerHTML=items.map(x=>'<tr><th scope="row">'+esc(x[0])+'</th><td>'+esc(x[1])+'</td><td>'+esc(x[2])+'</td><td>'+x[3]+'</td><td>'+x[4]+'</td><td>'+x[5]+'</td></tr>').join("")+
 '<tr><th>表示範囲合計</th><td>'+items.length+'市町村</td><td>—</td><td><b>'+total(items,3)+'</b></td><td><b>'+total(items,4)+'</b></td><td><b>'+total(items,5)+'</b></td></tr>';
}
f("#fMunicipalityRegion")?.addEventListener("change",drawMunicipalities);drawMunicipalities();
const color=["#0d7c83","#3298b3","#eda962","#71869e"];
if(window.Chart){
 const common={responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{boxWidth:13}},tooltip:{intersect:false}}};
 new Chart(f("#vCensusFacilityChart"),{type:"bar",data:{labels:areaKeys,datasets:[
 {label:"一般診療所（2023年）",data:regionData.map(r=>r.clinics),backgroundColor:"#0d7c78",borderRadius:4},
 {label:"病院（2023年）",data:regionData.map(r=>r.hospitals),backgroundColor:"#dea15e",borderRadius:4}
 ]},options:{...common,scales:{x:{grid:{display:false}},y:{beginAtZero:true,title:{display:true,text:"施設数"}}}}});
 new Chart(f("#vMedicalAssocChart"),{type:"bar",data:{labels:rows.filter(x=>!x.overlap).map(a=>a.name.replace("医師会","")),datasets:[
 {label:"診療所（2026年6月）",data:rows.filter(x=>!x.overlap).map(a=>a.counts.clinics),backgroundColor:"#0d7c78"},
 {label:"病院（2026年6月）",data:rows.filter(x=>!x.overlap).map(a=>a.counts.hospitals),backgroundColor:"#dea15e"}
 ]},options:{...common,indexAxis:"y",scales:{x:{stacked:true,beginAtZero:true},y:{stacked:true,ticks:{font:{size:11}}}}}});
}else{
 for(const id of ["#vCensusFacilityChart","#vMedicalAssocChart"]){const e=f(id);if(e){const p=document.createElement("p");p.textContent="グラフが表示できないため表を参照してください。";e.replaceWith(p)}}
}
const tiles=[...document.querySelectorAll("#areaCards article")];
tiles.forEach((node,i)=>{const a=window.KOCHI_DATA?.areas?.[i];const row=regionData.find(x=>x.region===a?.name);if(!row||node.querySelector(".f-area-facts"))return;
const p=document.createElement("p");p.className="f-area-facts";p.style.cssText="border-top:1px solid #dce8e8;padding-top:10px;font-size:12px";
p.innerHTML='<strong>2023年｜病院 '+row.hospitals+'・一般診療所 '+row.clinics+'（有床 '+row.bedded+'）</strong><br><small>2026年6月｜診療所 '+row.year2026.clinics+'（別定義）</small>';
node.append(p)});
}/* Public 2023 IPSS demographic chart: aligned to verified JMAP / user-provided regional workbooks. */
const a2050=window.KOCHI_DATA?.areas||[];
if(a2050.length===4){
 const body=f("#fAgingPopulationTable tbody");
 if(body)body.innerHTML=a2050.map(a=>{
  const p=((a.population2050/a.population2020-1)*100).toFixed(1);
  const areaNum=({aki:"3901",chuo:"3902",koban:"3903",hata:"3904"})[a.id];
  return '<tr><th>'+esc(a.name)+'</th><td>'+n(a.population2020)+'</td><td>'+n(a.population2050)+'</td><td>'+p+'%</td><td>'+a.age2020.toFixed(1)+'%</td><td>'+a.age2050.toFixed(1)+'%</td><td><a href="https://jmap.jp/cities/detail/medical_area/'+areaNum+'" target="_blank" rel="noopener noreferrer">JMAP</a></td></tr>';
 }).join("")+'<tr><th>合計</th><td>691,527</td><td>450,980</td><td>−34.8%</td><td>—</td><td>—</td><td><a href="https://jmap.jp/cities/detail/pref/39" target="_blank" rel="noopener noreferrer">県計</a></td></tr>';
 if(window.Chart){
  const chartOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:10}}},scales:{y:{beginAtZero:true},x:{ticks:{font:{size:11}}}}};
  new Chart(f("#vAreaProjectionChart"),{type:"bar",data:{labels:a2050.map(a=>a.name),datasets:[
  {label:"2020年人口（人）",data:a2050.map(a=>a.population2020),backgroundColor:"#0c827b",borderRadius:3},
  {label:"2050年推計（人）",data:a2050.map(a=>a.population2050),backgroundColor:"#dba05f",borderRadius:3}
  ]},options:chartOpts});
  new Chart(f("#vAgingProjectionChart"),{type:"bar",data:{labels:a2050.map(a=>a.name),datasets:[
  {label:"2020年（％）",data:a2050.map(a=>a.age2020),backgroundColor:"#0c827b",borderRadius:3},
  {label:"2050年推計（％）",data:a2050.map(a=>a.age2050),backgroundColor:"#dba05f",borderRadius:3}
  ]},options:{...chartOpts,scales:{y:{beginAtZero:true,max:70},x:{}}}});
 }
}
})();
