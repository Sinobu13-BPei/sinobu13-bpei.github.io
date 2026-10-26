"use strict";
(async function naraDeepDive2026(){
const $=id=>document.getElementById(id);
const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const num=n=>Number(n).toLocaleString("ja-JP");
const colors={"奈良":"#127d80","東和":"#408dab","西和":"#c08335","中和":"#496cad","南和":"#bd6985"};
let d;try{const response=await fetch("./data/deep-dive-2026.json");if(!response.ok)throw Error("HTTP "+response.status);d=await response.json();if(d.regions?.length!==5||d.deviceExamples?.length!==17)throw Error("invalid data schema")}catch(e){$("regional-deep-dive")?.insertAdjacentHTML("afterbegin",'<p class="note" role="alert">深掘りデータの読み込みに失敗しました。表・グラフを表示できません。</p>');console.error(e);return}
const source=id=>d.sources[id];
const sourceLink=id=>'<a href="'+esc(source(id).url)+'" rel="noopener noreferrer" target="_blank">'+esc(id)+'</a>';
function set(id,markup){if($(id))$(id).innerHTML=markup}
const locale=(s)=>String(s);
set("deepForecastRows",d.regions.map(r=>'<tr><th scope="row">'+esc(r.name)+'</th><td class="num">'+num(r.populationForecast[0])+'</td><td class="num">'+num(r.populationForecast[2])+'</td><td class="num">'+num(r.populationForecast[4])+'</td><td class="num"><b>'+num(r.populationForecast[6])+'</b></td><td class="num">'+r.change2020to2050+'%</td><td class="num">'+num(r.age75plus[6])+'</td><td class="num">'+r.olderShare2050+'%</td></tr>').join(""));
set("deepCapacityRows",d.regions.map(r=>'<tr><th scope="row">'+esc(r.name)+'</th><td class="num">'+r.clinicPer100k2023on2020Population+'</td><td class="num">'+r.habitableLandPercent2020+'%</td><td class="num">'+r.dpc2023.providerThousand.toFixed(1)+'</td><td class="num">'+r.dpc2023.residentThousand.toFixed(1)+'</td><td class="num">'+r.dpc2023.providerToResidentRatioPercent.toFixed(1)+'%</td></tr>').join(""));
const medicalArea=$("deepDeviceArea");if(medicalArea){d.regions.forEach(r=>{const opt=document.createElement("option");opt.value=r.name;opt.textContent=r.name;medicalArea.appendChild(opt)})}
function drawDevices(){const a=medicalArea?.value||"",q=$("deepDeviceSearch")?.value?.trim().toLowerCase()||"";const matches=d.deviceExamples.filter(x=>(!a||a===x.area)&&(!q||x.name.toLowerCase().includes(q)));set("deepDeviceRows",matches.map(x=>'<tr><td>'+esc(x.area)+'</td><th scope="row">'+esc(x.name)+'</th><td class="num"><b>'+x.ct+'</b></td><td class="num"><b>'+x.mri+'</b></td><td>2024年7月（'+sourceLink("R03")+'）</td><td><a href="https://www.google.com/maps/search/?api=1&amp;query='+encodeURIComponent(x.name+" 奈良県")+'" target="_blank" rel="noopener noreferrer">Googleマップ</a></td></tr>').join("")||'<tr><td colspan="6">該当施設はありません</td></tr>')}
medicalArea?.addEventListener("change",drawDevices);
$("deepDeviceSearch")?.addEventListener("input",drawDevices);drawDevices();
set("deepRoadCards",d.logistics.map((r,i)=>'<article><div class="deepRoadNumber">0'+(i+1)+'</div><div><b>'+esc(r.axis)+'</b><span>'+esc(r.role)+'</span><small>留意：'+esc(r.risk)+'</small></div></article>').join(""));
set("deepRouteRows",d.logistics.map(r=>'<tr><th scope="row">'+esc(r.axis)+'</th><td>'+r.roads.map(esc).join("<br>")+'</td><td>'+r.regions.map(esc).join("・")+'</td><td>'+esc(r.role)+'</td><td>'+esc(r.risk)+'<br><small>'+sourceLink(r.source)+'</small></td></tr>').join(""));
const insights={奈良:d.planNotes.nara,東和:d.planNotes.towa,西和:d.planNotes.seiwa,中和:d.planNotes.chuwa,南和:d.planNotes.nanwa};
set("deepRegionInsights",d.regions.map(r=>'<div><b>'+esc(r.name)+'医療圏</b><span>'+esc(insights[r.name])+'</span></div>').join(""));
set("deepSourceRows",Object.entries(d.sources).map(([id,src])=>'<li><a href="'+esc(src.url)+'" target="_blank" rel="noopener noreferrer">'+esc(id)+'｜'+esc(src.title)+'</a><small>'+esc(src.year)+'</small></li>').join(""));
const graphs=["deepPopulationChart","deepAge75Chart","deepChangeChart","deepElderChart","deepClinicDensityChart","deepDpcFlowChart","deepCTChart","deepMRIChart"];
if(!window.Chart){graphs.forEach(id=>$(id)?.insertAdjacentHTML("afterend",'<p class="deepCaption">グラフを読み込めません。下記の比較表を参照してください。</p>'));return}
Chart.defaults.font.family='"Meiryo UI",system-ui,sans-serif';Chart.defaults.font.size=12;
Chart.defaults.color="#476275";
const common={responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{position:"bottom"},tooltip:{mode:"nearest",intersect:false}},interaction:{mode:"nearest",intersect:false}};
function plot(id,type,labels,datasets,rest={}){
const el=$(id);if(!el)return;
try{new Chart(el,{type,data:{labels,datasets},options:{...common,...rest}})}catch(e){console.warn("deep chart error "+id,e);el.insertAdjacentHTML("afterend",'<p class="deepCaption">グラフを表示できません。比較表に数値を記載しています。</p>')}
}
const regionNames=d.regions.map(r=>r.name);
const years=d.years.map(v=>String(v));
const lines=key=>d.regions.map(r=>({label:r.name,data:r[key],borderColor:colors[r.name],backgroundColor:colors[r.name],pointRadius:2,pointHoverRadius:5,borderWidth:2.5,tension:.17,spanGaps:false}));
plot("deepPopulationChart","line",years,lines("populationForecast"),{scales:{y:{beginAtZero:true,ticks:{callback:v=>num(v/10000)+"万"}}},plugins:{legend:{position:"bottom"}}});
plot("deepAge75Chart","line",years,lines("age75plus"),{scales:{y:{beginAtZero:true,ticks:{callback:v=>num(v/10000)+"万"}}},plugins:{legend:{position:"bottom"}}});
plot("deepChangeChart","bar",regionNames,[{label:"人口増減率（％）",data:d.regions.map(r=>r.change2020to2050),backgroundColor:d.regions.map(r=>colors[r.name])}],{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{min:-65,max:0}}});
plot("deepElderChart","bar",regionNames,[{label:"65歳以上割合・2050年",data:d.regions.map(r=>r.olderShare2050),backgroundColor:d.regions.map(r=>colors[r.name])}],{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{min:0,max:70}}});
plot("deepClinicDensityChart","bar",regionNames,[{label:"一般診療所 / 10万人",data:d.regions.map(r=>r.clinicPer100k2023on2020Population),backgroundColor:d.regions.map(r=>colors[r.name])}],{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{min:0,max:130}}});
plot("deepDpcFlowChart","bar",regionNames,[{label:"医療機関所在地（千件）",data:d.regions.map(r=>r.dpc2023.providerThousand),backgroundColor:"#2d88a2"},{label:"患者住所地（千件）",data:d.regions.map(r=>r.dpc2023.residentThousand),backgroundColor:"#daa261"}],{indexAxis:"y",plugins:{legend:{position:"bottom"}},scales:{x:{min:0}}});
const sortedByCT=[...d.deviceExamples].sort((a,b)=>b.ct-a.ct||b.mri-a.mri).slice(0,10);
const sortedByMRI=[...d.deviceExamples].sort((a,b)=>b.mri-a.mri||b.ct-a.ct).slice(0,10);
plot("deepCTChart","bar",sortedByCT.map(x=>x.name),[{label:"CT（台）",data:sortedByCT.map(x=>x.ct),backgroundColor:sortedByCT.map(x=>colors[x.area])}],{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{min:0,ticks:{stepSize:1}}}});
plot("deepMRIChart","bar",sortedByMRI.map(x=>x.name),[{label:"MRI（台）",data:sortedByMRI.map(x=>x.mri),backgroundColor:sortedByMRI.map(x=>colors[x.area])}],{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{min:0,ticks:{stepSize:1}}}});
})();