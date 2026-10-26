/* Fukuoka facility survey by official secondary care area and geographic physicians association */
(()=>{"use strict";const d=window.FUKUOKA_FACILITY_COUNTS;if(!d)return;
const byId=s=>document.getElementById(s),num=n=>Number(n).toLocaleString("ja-JP"),safe=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const src='<a href="'+d.meta.clinicSource+'" target="_blank" rel="noopener noreferrer">厚生労働省2023年医療施設調査N2</a>／<a href="'+d.meta.hospitalSource+'" target="_blank" rel="noopener noreferrer">同N1</a>';
function buildAreas(){
const root=byId("areaDetails");if(!root)return;
const place=document.createElement("section");place.className="fc-section";place.id="facility-by-medical-area";
place.innerHTML='<div class="fc-eyebrow">OFFICIAL FACILITY SURVEY / 2023</div><h3>13二次医療圏の一般診療所数・病院数</h3>'
+'<p class="fc-note">医療施設調査の所在施設数（2023年）。「合計」は一般診療所＋病院であり、歯科診療所・薬局を含みません。医師会の会員数でもありません。</p>'
+'<div class="fc-totals"><div class="fc-total"><strong>'+num(d.province.clinics)+'</strong><span>一般診療所</span></div><div class="fc-total"><strong>'+num(d.province.hospitals)+'</strong><span>病院</span></div><div class="fc-total"><strong>'+num(d.province.total)+'</strong><span>一般診療所＋病院</span></div></div>'
+'<div class="fc-charts"><div class="fc-chart"><h4>一般診療所数：医療圏別</h4><div class="fc-chart-area"><canvas id="fcClinicChart" role="img" aria-label="福岡県13医療圏の一般診療所数の比較"></canvas></div></div><div class="fc-chart"><h4>病院数：医療圏別</h4><div class="fc-chart-area"><canvas id="fcHospitalChart" role="img" aria-label="福岡県13医療圏の病院施設数の比較"></canvas></div></div></div>'
+'<div class="fc-scroll"><table id="fcAreaTable"><thead><tr><th scope="col">二次医療圏</th><th scope="col">一般診療所</th><th scope="col">病院</th><th scope="col">施設合計</th><th scope="col">市区町村別内訳</th></tr></thead><tbody></tbody></table></div>'
+'<p class="fc-note fc-ref">出典：'+src+'（2023年調査、公開時点と基準年を区別）。築上郡3町分は京築圏域の公表総数から既知4市町を差し引いた合計値であり、3町個別内訳ではありません。</p>';
root.parentNode.insertBefore(place,root);
byId("fcAreaTable").querySelector("tbody").innerHTML=d.regions.map(r=>'<tr><th scope="row">'+safe(r.name)+'</th><td class="fc-num">'+num(r.clinics)+'</td><td class="fc-num">'+num(r.hospitals)+'</td><td class="fc-num">'+num(r.total)+'</td><td><details><summary>内訳（'+r.municipalities.length+'区分）</summary><table class="fc-mini-table"><thead><tr><th>市区町村</th><th>診療所</th><th>病院</th></tr></thead><tbody>'+r.municipalities.map(m=>'<tr><td>'+safe(m.name)+'</td><td class="fc-num">'+num(m.clinics)+'</td><td class="fc-num">'+num(m.hospitals)+'</td></tr>').join("")+'</tbody></table></details></td></tr>').join("")+'<tr><th>県合計</th><td class="fc-num">'+num(d.province.clinics)+'</td><td class="fc-num">'+num(d.province.hospitals)+'</td><td class="fc-num">'+num(d.province.total)+'</td><td>13圏域</td></tr>';
const sorted=[...d.regions].sort((a,b)=>b.clinics-a.clinics);
if(window.Chart){
const opt={responsive:true,maintainAspectRatio:false,indexAxis:"y",plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>num(c.raw)+"施設"}}},scales:{x:{beginAtZero:true,ticks:{font:{size:10}}},y:{ticks:{font:{size:10}}}}};
new Chart(byId("fcClinicChart"),{type:"bar",data:{labels:sorted.map(r=>r.name),datasets:[{label:"一般診療所",data:sorted.map(r=>r.clinics),backgroundColor:"#20858b",borderRadius:4}]},options:opt});
const hospitals=[...d.regions].sort((a,b)=>b.hospitals-a.hospitals);
new Chart(byId("fcHospitalChart"),{type:"bar",data:{labels:hospitals.map(r=>r.name),datasets:[{label:"病院",data:hospitals.map(r=>r.hospitals),backgroundColor:"#386f9a",borderRadius:4}]},options:opt});
}else place.querySelectorAll(".fc-chart").forEach(x=>x.insertAdjacentHTML("beforeend","<p class='fc-note'>グラフを表示できません。下表の数値をご確認ください。</p>"));
}
function buildAssociations(){
const anchor=byId("associations");if(!anchor)return;
const place=document.createElement("section");place.className="fc-section";place.id="facility-by-medical-association";
place.innerHTML='<div class="fc-eyebrow">GEOGRAPHIC COMPARISON / MEDICAL ASSOCIATIONS</div><h3>26医師会：対象地域に所在する診療所・病院</h3>'
+'<p class="fc-note"><strong>医師会の会員施設数ではありません。</strong> 各医師会の担当とみなす市区町村の所在地別施設数を2023年医療施設調査から集計。県・北九州市の広域会は地区会と重複するため集計に再加算しません。</p>'
+'<div class="fc-search"><label for="fcAssocSearch">医師会・自治体で絞り込み</label><input id="fcAssocSearch" type="search" placeholder="例：糸島、久留米、八幡"><label for="fcAssocKind">集計区分</label><select id="fcAssocKind"><option value="all">すべて</option><option value="local">地区・市医師会（重複除外）</option><option value="umbrella">県・広域の医師会</option></select></div>'
+'<div class="fc-scroll"><table id="fcAssociationTable"><thead><tr><th>医師会</th><th>主な対象地域</th><th>一般診療所</th><th>病院</th><th>施設合計</th><th>区分</th></tr></thead><tbody></tbody></table></div>'
+'<p class="fc-note">医師会名称・地域の確認：<a href="'+d.meta.associationSource+'" target="_blank" rel="noopener noreferrer">福岡県医師会「地域の医療機関」</a>。施設数の出典：'+src+'。<strong>計26医師会の行を合算すると重複</strong>します。地域施設数は県合計4,806診療所・453病院を参照してください。</p>';
anchor.insertAdjacentElement("afterend",place);
const tbody=byId("fcAssociationTable").querySelector("tbody");
const render=()=>{
const query=byId("fcAssocSearch").value.trim(),kind=byId("fcAssocKind").value;
const rows=d.associations.filter(a=>(!query||a.name.includes(query)||a.coverage.includes(query)||a.regions.join("・").includes(query))&&(kind==="all"||kind===a.kind));
tbody.innerHTML=rows.length?rows.map(a=>'<tr><th scope="row">'+safe(a.name)+'</th><td>'+safe(a.coverage)+'</td><td class="fc-num">'+num(a.clinics)+'</td><td class="fc-num">'+num(a.hospitals)+'</td><td class="fc-num">'+num(a.clinics+a.hospitals)+'</td><td><span class="fc-flag '+(a.kind==="umbrella"?"umbrella":"")+'">'+(a.kind==="umbrella"?"広域・重複あり":"地域集計")+'</span></td></tr>').join(""):'<tr><td colspan="6">該当する医師会はありません。</td></tr>';
};
byId("fcAssocSearch").addEventListener("input",render);byId("fcAssocKind").addEventListener("change",render);render();
}
function enrichExisting(){
const wrap=byId("associations");if(wrap)for(const article of wrap.querySelectorAll("article.loc")){
const b=article.querySelector("b");if(!b)continue;const a=d.associations.find(x=>x.name===b.textContent.trim());if(!a||article.querySelector(".fc-medical-association-item"))continue;
const p=document.createElement("div");p.className="fc-medical-association-item";p.textContent="2023年の所在地ベース：一般診療所 "+num(a.clinics)+"・病院 "+num(a.hospitals)+"（会員数ではありません）";article.appendChild(p);
}
const root=byId("areaDetails");if(!root)return;
for(const panel of root.querySelectorAll(".area-panel")){
const label=panel.querySelector("h3");if(!label||panel.querySelector(".fc-area-badges"))continue;
const a=d.regions.find(x=>label.textContent.includes(x.name));if(!a)continue;
const p=document.createElement("div");p.className="fc-area-badges";p.innerHTML='<span>一般診療所 '+num(a.clinics)+'施設</span><span>病院 '+num(a.hospitals)+'施設</span><span>合計 '+num(a.total)+'施設</span><small class="fc-subtle">（2023年調査）</small>';label.insertAdjacentElement("afterend",p);
}
}
function boot(){try{buildAreas();buildAssociations();enrichExisting();const q=byId("areaQuery"),s=byId("areaSelect");if(q)q.addEventListener("input",()=>setTimeout(enrichExisting,0));if(s)s.addEventListener("change",()=>setTimeout(enrichExisting,0));if(window.MutationObserver&&byId("areaDetails")){new MutationObserver(enrichExisting).observe(byId("areaDetails"),{childList:true});}}catch(e){console.error("Facility insight error",e)}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();