/* Osaka prefecture regional demographics. Data: IPSS 2023 / Osaka public official statistics. */
(()=>{"use strict";
const $=id=>document.getElementById(id);
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=x=>Number(x).toLocaleString("ja-JP");
const pct=(a,b)=>b?((a/b-1)*100):NaN;
const popIndex=(xs)=>xs.map(n=>+(n/xs[0]*100).toFixed(1));
const chartPalette=["#0c7893","#e2a15b","#25a08a","#7c69a2","#576f90","#b56f71","#6d9392","#bd85a7"];
const makeChart=(id,fallback,chartConfig,rows)=>{try{if(typeof Chart==="undefined")throw Error("Chart.js is unavailable");const node=$(id);if(!node)throw Error("missing canvas");return new Chart(node,chartConfig)}catch(err){const c=$(id);if(c)c.style.display="none";const e=$(fallback);if(e){e.classList.add("show");e.innerHTML='<table><tbody>'+rows.map(a=>'<tr>'+a.map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table>'}return null}};
const options={responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}}};
function apply(data,base){
const areas=data.areas,years=data.years,facilities=new Map(base.facilityMarket.regions2023.map(a=>[a.name,a]));
const regionTable=$("regionProjectionTable")?.querySelector("tbody");
if(regionTable)regionTable.innerHTML=areas.map(a=>{const f=facilities.get(a.name),g=pct(a.total[6],a.total[0]),old=pct(a.age75plus[6],a.age75plus[0]);return "<tr><td><b>"+esc(a.name)+"</b></td><td>"+fmt(a.total[0])+"</td><td>"+fmt(a.total[6])+"</td><td>"+g.toFixed(1)+"%</td><td>"+fmt(a.age75plus[0])+"</td><td>"+fmt(a.age75plus[6])+"</td><td>+"+old.toFixed(1)+"%</td><td>"+(f?fmt(f.clinics):"—")+"</td><td>"+(f?fmt(f.hospitals):"—")+"</td></tr>"}).join("");
const values=areas.map(a=>+pct(a.age75plus[6],a.age75plus[0]).toFixed(1));
makeChart("regionalOldChart","regionalOldFallback",{type:"bar",data:{labels:areas.map(a=>a.name),datasets:[{label:"75歳以上人口の2020→2050増減率（%）",data:values,backgroundColor:areas.map((a,i)=>chartPalette[i]),borderRadius:5,maxBarThickness:25}]},options:{...options,indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{min:0,max:50}}}},areas.map((a,i)=>[a.name,values[i]+"%"]));
const selector=$("regionalCurveSelect");
if(selector)selector.innerHTML=areas.map(a=>'<option value="'+esc(a.code)+'">'+esc(a.name)+'</option>').join("");
let curveChart=null;
function renderCurve(){const area=areas.find(a=>a.code===(selector?.value||"2701"))||areas[0];
const sets=[["総人口",area.total,"#0c7893"],["75歳以上",area.age75plus,"#da9052"],["15–64歳",area.age15_64,"#338879"]].map(x=>({label:x[0]+'（2020年＝100）',data:popIndex(x[1]),borderColor:x[2],backgroundColor:x[2],pointRadius:2.8,tension:.18,fill:false}));
if(curveChart){curveChart.destroy();curveChart=null}
curveChart=makeChart("regionalCurveChart","regionalCurveFallback",{type:"line",data:{labels:years.map(String),datasets:sets},options:{...options,scales:{y:{suggestedMin:60,suggestedMax:150}}}},years.map((y,i)=>[y,...sets.map(s=>s.data[i])]));
}
renderCurve();if(selector)selector.addEventListener("change",renderCurve);
const specialties=data.specialties2023.slice(0,11);makeChart("specialtiesChart","specialtiesFallback",{type:"bar",data:{labels:specialties.map(x=>x.name),datasets:[{label:"標榜診療所数（複数標榜あり）",data:specialties.map(x=>x.clinics),backgroundColor:"#1f7b99",borderRadius:4,maxBarThickness:26}]},options:{...options,indexAxis:"y",plugins:{legend:{display:false}}}},specialties.map(x=>[x.name,fmt(x.clinics)]));
const network=data.networkExample.hospitals;
const mapSearch=name=>("https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(name+" 大阪府"));
const html=network.map(n=>'<article class="network-card"><div class="name">'+esc(n.name)+'</div><div class="sub">'+esc(n.area)+'医療圏 · '+esc(n.municipality)+'</div><div class="links"><a href="'+esc(mapSearch(n.name))+'" target="_blank" rel="noopener noreferrer">Googleマップ</a><a href="https://maps.gsi.go.jp/" target="_blank" rel="noopener noreferrer">地理院地図</a></div></article>').join("");
if($("osakaHospitalNetwork"))$("osakaHospitalNetwork").innerHTML=html;
}
Promise.all([
fetch("./data/region-demography-2026.json?v=20261027",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("地域データHTTP "+r.status);return r.json()}),
fetch("./data/data.json?v=20261027",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("基礎データHTTP "+r.status);return r.json()})
]).then(([x,y])=>apply(x,y)).catch(e=>{const p=$("regionProjectionTable")?.querySelector("tbody");if(p)p.innerHTML='<tr><td colspan="9" style="text-align:left">データ取得エラー。再読み込み、またはGitHubで公開JSONを確認してください。 '+esc(e.message)+'</td></tr>';if($("osakaHospitalNetwork"))$("osakaHospitalNetwork").textContent="データを表示できません。"});
})();