/* Original transformed visual comparison of public population and DPC statistics. No copyrighted PDF images. */
(()=>{"use strict";
const d=window.FUKUOKA_ATTACHMENT_INSIGHTS;const med=window.FUKUOKA_DATA;if(!d||!med)return;
const el=id=>document.getElementById(id),n=v=>Number(v).toLocaleString('ja-JP'),f=(v,k=1)=>Number(v).toFixed(k),safe=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const rows=d.regions;const sum=key=>rows.reduce((v,x)=>v+x[key],0);
function table(){
const tbody=el('deepTable')?.querySelector('tbody');if(!tbody)return;
tbody.innerHTML=rows.map(r=>{
const rate=(r.p50/r.p20-1)*100,delta=(r.a75_50/r.a75_20-1)*100,worker=(r.work50/r.work20-1)*100;
return '<tr><th scope="row">'+safe(r.name)+'</th><td>'+n(r.p20)+'</td><td>'+n(r.p50)+'</td><td>'+f(rate)+'%</td><td>'+f(r.aging20)+'%</td><td>'+f(r.aging50)+'%</td><td>'+f(delta)+'%</td><td>'+f(worker)+'%</td><td>'+f(r.dpcResidentK)+'</td><td>'+f(r.dpcFacilityK)+'</td><td>'+f(r.dpcRatio)+'%</td></tr>';
}).join('');
for(const [id,k] of [['deepPopulationNow','p20'],['deepPopulationFuture','p50'],['deepWorkersFuture','work50'],['deepOver75Future','a75_50']])if(el(id))el(id).textContent=n(sum(k));
}
function profile(){
const sl=el('deepRegionSelect');if(!sl)return;
sl.innerHTML=rows.map(r=>'<option>'+safe(r.name)+'</option>').join('');
function display(){
const r=rows.find(x=>x.name===sl.value)||rows[0];
const pop=(r.p50/r.p20-1)*100,worker=(r.work50/r.work20-1)*100,elder=(r.a75_50/r.a75_20-1)*100;
let kind=r.dpcRatio>=110?'当該医療圏の医療機関所在地件数が患者住所地件数を上回る流入集積型':r.dpcRatio<70?'医療機関所在地件数が住所地件数を下回る周辺依存型':'両件数が比較的近接する混合型';
const market=r.aging50>40?'高齢化と地域での医療継続が重要':r.a75_50>r.a75_20*1.4?'後期高齢者増加と外来・在宅サービス設計が重要':'現役世代減少に対応した省人化・検査連携が重要';
el('deepProfile').innerHTML='<strong>'+safe(r.name)+'</strong>：2020→2050年総人口 <strong>'+f(pop)+'%</strong>／生産年齢人口 <strong>'+f(worker)+'%</strong>／75歳以上 <strong>'+(elder>0?'+':'')+f(elder)+'%</strong>。<br>2023年度DPC施設所在地／患者住所地比 <strong>'+f(r.dpcRatio)+'%</strong>（'+kind+'）。<br>医療機器の市場仮説：'+market+'。<small style="display:block">一次データ：社人研2023年将来推計・厚労省2023年度DPC退院患者調査。PDF参照：株式会社日本経営『医療需給総覧1.0』、各圏域・DPC図の'+r.pdfPage+'ページ。</small>';
}
sl.addEventListener('change',display);display();
}
function chart(id,options){if(!window.Chart){const x=el(id);if(x)x.outerHTML='<p class="deep-alert">グラフ用ライブラリが利用できません。下記の医療圏別数値表を参照してください。</p>';return}try{new Chart(el(id),options)}catch(e){console.warn('chart',id,e)}}
const options={responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{position:'bottom',labels:{boxWidth:12,font:{size:10}}},tooltip:{mode:'nearest',intersect:false}},scales:{x:{ticks:{font:{size:10}},grid:{color:'#e9f0f2'}},y:{ticks:{font:{size:10}},grid:{display:false}}}};
function charts(){
const r=rows;
const sorted=[...r].sort((a,b)=>b.p20-a.p20);
chart('deepPopChart',{type:'bar',data:{labels:sorted.map(x=>x.name),datasets:[{label:'2020年（実績）',data:sorted.map(x=>+(x.p20/1e4).toFixed(1)),backgroundColor:'#2675a2'},{label:'2050年（推計）',data:sorted.map(x=>+(x.p50/1e4).toFixed(1)),backgroundColor:'#34a5a0'}]},options:{...options,plugins:{...options.plugins,tooltip:{callbacks:{label:c=>c.dataset.label+'：'+c.raw+'万人'}}}}});
const aging=[...r].sort((a,b)=>b.aging50-a.aging50);
chart('deepAgingChart',{type:'bar',data:{labels:aging.map(x=>x.name),datasets:[{label:'2020年',data:aging.map(x=>x.aging20),backgroundColor:'#a7c6d6'},{label:'2050年（推計）',data:aging.map(x=>x.aging50),backgroundColor:'#2a8791'}]},options:{...options,scales:{...options.scales,x:{min:0,max:50,ticks:{callback:v=>v+'%'}}}}});
const work=[...r].sort((a,b)=>a.work50/a.work20-b.work50/b.work20);
chart('deepWorkChart',{type:'bar',data:{labels:work.map(x=>x.name),datasets:[{label:'生産年齢人口増減率（2020→2050）',data:work.map(x=>+((x.work50/x.work20-1)*100).toFixed(1)),backgroundColor:work.map(x=>(x.work50/x.work20)<.7?'#c98255':'#4a9aab'),borderRadius:4}]},options:{...options,plugins:{...options.plugins,legend:{display:false}},scales:{x:{min:-55,max:0,ticks:{callback:v=>v+'%'}},y:options.scales.y}}});
const dpc=[...r].sort((a,b)=>b.dpcRatio-a.dpcRatio);
chart('deepDpcChart',{type:'bar',data:{labels:dpc.map(x=>x.name),datasets:[{label:'施設所在地症例数／患者住所地症例数',data:dpc.map(x=>x.dpcRatio),backgroundColor:dpc.map(x=>x.dpcRatio>=100?'#2c8a8b':'#d59b60'),borderRadius:4}]},options:{...options,plugins:{...options.plugins,legend:{display:false}},scales:{x:{min:0,max:160,ticks:{callback:v=>v+'%'}},y:options.scales.y}}});
}
function map(){
const target=el('deepMap');if(!target)return;
if(!window.L){target.innerHTML='<p class="deep-alert">地図を表示できません。圏域一覧を参照してください。</p>';return}
try{
const map=L.map(target,{scrollWheelZoom:false}).setView([33.55,130.65],9);
L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{maxZoom:18,attribution:'地図：<a href="https://maps.gsi.go.jp/" target="_blank" rel="noopener">国土地理院 地理院タイル</a>'}).addTo(map);
const points=Object.fromEntries(med.regions.map(r=>[r.name,r.center]));
for(const r of rows){const loc=points[r.name];if(!loc)continue;const clr=r.dpcRatio>=100?'#207c90':r.dpcRatio>=75?'#dda05c':'#b95a5d';
L.circleMarker(loc,{radius:Math.max(6,Math.min(17,5+Math.sqrt(r.dpcResidentK)*.75)),color:'#fff',weight:2,fillColor:clr,fillOpacity:.91}).addTo(map).bindPopup('<strong>'+safe(r.name)+'</strong><br>2023年度DPC所在地／住所地比 '+f(r.dpcRatio)+'%<br>住所地 '+f(r.dpcResidentK)+'千件／所在地 '+f(r.dpcFacilityK)+'千件<br>2020→2050年人口 '+f((r.p50/r.p20-1)*100)+'%<br><small>医療圏の代表地点。施設位置や行政境界ではありません。</small>');
}
setTimeout(()=>map.invalidateSize(),200);
}catch(e){target.textContent='地図を読み込めません。以下の医療圏表をご確認ください。'}
}
function main(){if(!el('deepTable'))return;table();profile();charts();map();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',main);else main();
})();