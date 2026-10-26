"use strict";
/* Hyogo publicly sourced facility / medical association atlas, 2026-10-27 */
(()=>{const $=s=>document.querySelector(s),fmt=n=>Number(n).toLocaleString("ja-JP");
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const link=(name,area)=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(name+" "+area+" 兵庫県");
const gsi={神戸:[34.691,135.196],阪神:[34.733,135.344],東播磨:[34.669,134.978],北播磨:[34.853,134.93],播磨姫路:[34.835,134.691],但馬:[35.545,134.821],丹波:[35.174,135.035],淡路:[34.343,134.895]};
const gsirep=name=>{const [lat,lon]=gsi[name];return "https://maps.gsi.go.jp/#12/"+lat+"/"+lon+"/&base=std&ls=std&disp=1"};
let model=null,chart1=null,chart2=null;
function renderArea(){const el=$("#facility-area-rows");if(!el||!model)return;if(el.querySelectorAll(":scope > tr").length>=9)return;
el.innerHTML=model.areas.map(a=>'<tr><td><strong><a href="#area-'+a.id+'">'+esc(a.name)+'</a></strong></td><td>'+fmt(a.clinics2023)+'</td><td>'+fmt(a.hospitals2023)+'</td><td>'+fmt(a.clinics2023+a.hospitals2023)+'</td><td>'+fmt(a.dentalClinics2022)+'</td><td><details><summary>市区町別内訳（'+a.municipalities.length+'）</summary><div>'+a.municipalities.map(m=>esc(m.name)+'：一般診療所<strong>'+fmt(m.clinics2023)+'</strong>／病院<strong>'+fmt(m.hospitals2023)+'</strong>').join('<hr style="border:0;border-top:1px solid #d9e5e9;margin:6px 0">')+'</div></details></td></tr>').join('')+'<tr><th>兵庫県 計</th><th>5,196</th><th>344</th><th>5,540</th><th>2,960</th><th>—</th></tr>'}
function renderAssocs(){const el=$("#medical-association-rows");if(!el||!model)return;
const select=$("#association-filter").value,term=$("#association-search").value.trim().toLocaleLowerCase("ja-JP");
const matches=model.associations.filter(a=>(select==="すべて"||a.region===select)&&(!term||[a.name,a.region,...a.municipalities].join(" ").toLocaleLowerCase("ja-JP").includes(term)));
el.innerHTML=matches.map(a=>{const repeat=a.kind==="umbrella"?"（再掲）":"";
const status=a.kind==="umbrella"?'<span class="facility-overlap">※神戸市9区を再掲</span>':a.kind!=="regional"?'<span class="facility-muted">地域集計の対象外</span>':"";
return '<tr><td>'+esc(a.name)+' '+status+'</td><td>'+esc(a.region)+'</td><td>'+esc(a.municipalities.join("・")||"—")+'</td><td>'+(a.clinics2023===null?"—":fmt(a.clinics2023)+repeat)+'</td><td>'+(a.hospitals2023===null?"—":fmt(a.hospitals2023)+repeat)+'</td><td class="facility-links"><a href="'+esc(a.website)+'" target="_blank" rel="noopener noreferrer">医師会情報</a><a href="'+esc(link(a.name,a.region))+'" target="_blank" rel="noopener noreferrer">Googleマップ</a><a href="'+esc(gsirep(a.region))+'" target="_blank" rel="noopener noreferrer" title="団体の所在地ではなく医療圏代表点です">地理院地図・医療圏代表点</a></td></tr>'}).join('')||'<tr><td colspan="6">該当する掲載項目はありません。</td></tr>';
$("#association-results").textContent=matches.length+"件 / 全"+model.associations.length+"掲載項目"}
function renderChart(){if(typeof Chart==="undefined"||!model)return;
const areas=model.areas,names=areas.map(a=>a.name);
const common={responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}}};
const c1=$("#facility-chart");if(c1)try{chart1=new Chart(c1,{type:"bar",data:{labels:names,datasets:[{label:"一般診療所（2023年）",data:areas.map(a=>a.clinics2023),backgroundColor:"#14758c"},{label:"病院（2023年）",data:areas.map(a=>a.hospitals2023),backgroundColor:"#d79c4c"}]},options:{...common,indexAxis:"y",scales:{x:{beginAtZero:true}}}});c1.closest(".chart")?.classList.add("chart-ok")}catch(e){console.warn("施設数グラフ描画失敗",e)}
const c2=$("#clinic-share-chart");if(c2)try{chart2=new Chart(c2,{type:"doughnut",data:{labels:names,datasets:[{label:"一般診療所数（2023年）",data:areas.map(a=>a.clinics2023),backgroundColor:["#0b5974","#157b87","#2c9a91","#59b3a6","#d49d49","#8a9c50","#728db9","#937db0"]}]},options:{...common,plugins:{legend:{position:"right"}}}});c2.closest(".chart")?.classList.add("chart-ok")}catch(e){console.warn("施設集積グラフ描画失敗",e)}
}
function addAreaStats(){if(!model)return;for(const a of model.areas){const el=document.getElementById("area-"+a.id);if(!el||el.querySelector(".facility-inline"))continue;const div=document.createElement("p");div.className="facility-inline";const bold=document.createElement("strong");bold.textContent="施設数（2023年）: ";div.appendChild(bold);div.append(document.createTextNode("一般診療所 "+fmt(a.clinics2023)+"施設／病院 "+fmt(a.hospitals2023)+"施設"));el.insertBefore(div,el.querySelector("dl")||null)}}
async function init(){try{const r=await fetch("./data/facilities.json",{cache:"no-cache"});if(!r.ok)throw Error("HTTP "+r.status);model=await r.json();
const sum=field=>model.areas.reduce((v,a)=>v+a[field],0);if(model.areas.length!==8||model.associations.length!==44||sum("clinics2023")!==5196||sum("hospitals2023")!==344||sum("dentalClinics2022")!==2960)throw Error("統計件数照合不一致");
for(const a of model.areas){for(const key of ["clinics2023","hospitals2023"]){if(a.municipalities.reduce((v,m)=>v+m[key],0)!==a[key])throw Error(a.name+"の"+key+"内訳に不整合")}}
renderArea();renderAssocs();renderChart();addAreaStats();
const root=$("#regioncards");if(root&&!model.areas.every(a=>!!document.querySelector("#area-"+a.id))){const observer=new MutationObserver(()=>{addAreaStats();if(model.areas.every(a=>!!document.querySelector("#area-"+a.id+" .facility-inline")))observer.disconnect()});observer.observe(root,{childList:true,subtree:true})}
$("#association-filter")?.addEventListener("change",renderAssocs);$("#association-search")?.addEventListener("input",renderAssocs);$("#facility-status").textContent="厚生労働省2023年統一基準の施設数を検証済み。8医療圏・44公式掲載項目・市区町内訳は相互整合。";
}catch(e){console.warn("施設データ動的読込失敗。HTML内の静的一覧を継続表示します。",e);const el=$("#facility-status");if(el)el.textContent="静的一覧を表示しています（グラフ・絞り込みは利用できません）。";}}
document.addEventListener("DOMContentLoaded",init);
})();