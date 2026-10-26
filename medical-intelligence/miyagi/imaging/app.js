"use strict";
(function(){
const D=window.MIYAGI_IMAGING;
const $=id=>document.getElementById(id);
const e=x=>String(x??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const num=x=>Number(x).toLocaleString("ja-JP");
const source=id=>'<a href="#'+e(id)+'">'+e(id)+'</a>';
const mods=[["CT","CT"],["MRI","MRI"],["PET","PET"],["RT","放射線治療"],["MMG","マンモグラフィ"]];
const sources=Object.fromEntries((D?.sources||[]).map(s=>[s[0],s]));
let areaChart=null,trendChart=null;
const chartSettings={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>num(c.parsed.y??c.parsed.x)+' 台'}}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}};
function fallback(id,labels,values){const el=$(id);const max=Math.max(1,...values);el.style.display="block";el.innerHTML=labels.map((a,i)=>'<div class="barrow"><span>'+e(a)+'</span><div class="barbg"><i style="width:'+Math.max(1,Math.round(values[i]/max*100))+'%"></i></div><b>'+num(values[i])+'</b></div>').join("")}
function countRows(){
const totals={};for(const [k] of mods)totals[k]=D.regions.reduce((n,r)=>n+r[k],0);
$('im-counts').innerHTML=D.regions.map(r=>'<tr><th scope="row">'+e(r.name)+'</th>'+mods.map(([k])=>'<td>'+num(r[k])+'</td>').join("")+'<td>'+r.ctAdj.toFixed(1)+'</td><td>'+r.mriAdj.toFixed(1)+'</td></tr>').join("")+
'<tr><th scope="row">宮城県計（機器）</th>'+mods.map(([k])=>'<td><strong>'+num(totals[k])+'</strong></td>').join("")+'<td>10.2</td><td>5.8</td></tr>';
}
function chartArea(){
const k=$('im-modality').value,labels=D.regions.map(r=>r.name),values=D.regions.map(r=>r[k]),el=$('im-area-chart');if(!el)return;
if(typeof Chart==='undefined'){el.style.display='none';fallback('im-chart-fallback',labels,values);return}
try{if(areaChart)areaChart.destroy();$('im-chart-fallback').style.display='none';el.style.display='block';areaChart=new Chart(el,{type:'bar',data:{labels,datasets:[{label:mods.find(q=>q[0]===k)?.[1]||k,data:values,backgroundColor:['#166395','#19a1a4','#c08a34','#9e5b83'],borderRadius:5}]},options:chartSettings})}catch(err){el.style.display='none';fallback('im-chart-fallback',labels,values)}}
function regionCards(){
$('im-regions').innerHTML=D.regions.map(r=>'<article class="mini"><h3>'+e(r.name)+' <span class="pill estimate">分析</span></h3><p><b>役割：</b>'+e(r.role)+'</p><p><b>リスク：</b>'+e(r.issues)+'</p><p><b>3〜5年の機会：</b></p><ul>'+r.actions.map(t=>'<li>'+e(t)+'</li>').join('')+'</ul><small class="note">配置：県医療計画 <a href="#I01">I01</a>、実行策は独自分析</small></article>').join('');
}
function hospitalList(){
const area=$('im-area-filter').value,k=$('im-device-filter').value,q=$('im-search').value.trim().toLowerCase();
const filtered=D.hospitalExamples.filter(h=>(!area||h.area===area)&&(!k||h.tags.includes(k))&&(!q||(h.name+' '+h.equipment+' '+h.metrics).toLowerCase().includes(q)));
$('im-hospital-count').textContent=filtered.length+'施設 / '+D.hospitalExamples.length+'施設を表示（全県内施設ではなく公式情報が確認できた主要施設）';
$('im-hospital-list').innerHTML=filtered.length?filtered.map(h=>{const s=sources[h.source],go='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(h.name+' 宮城県');return '<article class="im-fact"><h3>'+e(h.name)+'</h3><div class="meta">'+e(h.area)+'｜'+e(h.date)+'</div><p>'+e(h.equipment)+'</p><p><b>検査・更新：</b>'+e(h.metrics)+'</p><div>'+h.tags.map(t=>'<span class="im-cardtag">'+e(t)+'</span>').join('')+'</div><div><a class="im-link" target="_blank" rel="noopener noreferrer" href="'+e(s[3])+'">病院公式データを確認</a><a class="im-link" target="_blank" rel="noopener noreferrer" href="'+e(go)+'">Googleマップ</a> '+source(h.source)+'</div></article>'}).join(''):'<div class="mini">検索条件に一致する施設はありません。</div>';
}
function drawTrend(){
const mode=$('im-trend-mod').value,series=mode==='CT'?[28492,29425,30104]:[8704,8895,8809],el=$('im-trend-chart');
if(typeof Chart==='undefined'){el.style.display='none';fallback('im-trend-fallback',['2023年度','2024年度','2025年度'],series);return}
try{if(trendChart)trendChart.destroy();el.style.display='block';$('im-trend-fallback').style.display='none';trendChart=new Chart(el,{type:'line',data:{labels:['2023年度','2024年度','2025年度'],datasets:[{label:mode+' 年度件数',data:series,borderColor:'#14759a',backgroundColor:'#14759a',tension:.2,fill:false,pointRadius:5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>num(c.parsed.y)+' 件'}}},scales:{y:{beginAtZero:false,ticks:{callback:v=>num(v)}}}}})}catch(err){el.style.display='none';fallback('im-trend-fallback',['2023年度','2024年度','2025年度'],series)}}
function publicCases(){
$('im-procure').innerHTML=D.procurement.map(p=>'<tr><td>'+e(p.date)+'</td><td><strong>'+e(p.facility)+'</strong></td><td>'+e(p.type)+'</td><td>'+e(p.event)+'<br><span class="pill">'+e(p.tag)+'</span></td><td>'+source(p.source)+'</td></tr>').join('');
}
function renderSources(){
$('im-sources').innerHTML=D.sources.map(s=>'<article id="'+e(s[0])+'"><a target="_blank" rel="noopener noreferrer" href="'+e(s[3])+'">'+e(s[0])+'｜'+e(s[1])+'</a><small>データ年次：'+e(s[2])+'</small><small>'+e(s[3])+'</small></article>').join('');
}
function init(){if(!D){document.querySelectorAll('main section').forEach(section=>section.setAttribute('data-error','データを読み込めません'));return}
countRows();regionCards();renderSources();publicCases();hospitalList();chartArea();drawTrend();
$('im-modality').addEventListener('change',chartArea);$('im-trend-mod').addEventListener('change',drawTrend);
$('im-area-filter').addEventListener('change',hospitalList);$('im-device-filter').addEventListener('change',hospitalList);
$('im-search').addEventListener('input',hospitalList);
}
document.addEventListener('DOMContentLoaded',init);
})();