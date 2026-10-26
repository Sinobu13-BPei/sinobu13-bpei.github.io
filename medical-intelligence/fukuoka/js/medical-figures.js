/* 福岡県：病床構成比切替・病床機能ヒートマップ・評価軸レーダー（出典分類を保持） */
(()=>{'use strict';
const d=window.FUKUOKA_DATA;if(!d||!Array.isArray(d.regions))return;
const $=id=>document.getElementById(id),number=n=>Number(n).toLocaleString('ja-JP');
const clean=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cats=['高度急性期','急性期','回復期','慢性期'];
const evalScore=r=>Math.round(r.ratings.reduce((v,x,i)=>v+x*d.weights[i]/5,0));
function buildHeatmap(){
const table=$('fuku-bed-composition');if(!table)return;
let rows='<thead><tr><th scope="col">医療圏</th>'+cats.map(x=>'<th scope="col">'+x+'</th>').join('')+'</tr></thead><tbody>';
const max=c=>Math.max(...d.regions.map(r=>r.beds[c+1]/r.beds[0]));
for(const r of d.regions){
 rows+='<tr><th scope="row">'+clean(r.name)+'</th>';
 for(let c=0;c<4;c++){
  const n=r.beds[c+1],share=n/r.beds[0],normalized=share/max(c),alpha=(.08+normalized*.64).toFixed(3);
  rows+='<td style="background:rgba(8,138,148,'+alpha+');color:'+(normalized>.68?'#fff':'#16445d')+'" title="'+clean(r.name)+' '+cats[c]+' '+number(n)+'床">'+(share*100).toFixed(1)+'%</td>';
 }
 rows+='</tr>';
}
table.innerHTML=rows+'</tbody>';
}
function chartFallback(label){const out=$(label);if(out){out.style.display='block';out.textContent='グラフが読み込めない場合も、医療圏別スコア表の数値を参照できます。'}}
function updateBedMode(){
const canvas=$('vizBeds13'),absolute=$('fuku-bed-absolute'),share=$('fuku-bed-share'),out=$('figure-bed-mode-notice');
if(!canvas||!absolute||!share)return;
function change(percent){
 const chart=window.Chart&&Chart.getChart(canvas);
 if(!chart){if(out)out.textContent='グラフの読み込みが必要です。下の病床数表をご参照ください。';return}
 chart.data.datasets.forEach((dataset,i)=>{dataset.data=d.regions.map(r=>percent?Number((r.beds[i+1]/r.beds[0]*100).toFixed(2)):r.beds[i+1])});
 chart.options.scales.x.beginAtZero=true;chart.options.scales.x.max=percent?100:undefined;
 chart.options.scales.x.ticks.callback=percent?(v=>v+'%'):(v=>number(v));
 chart.options.plugins.tooltip.callbacks={label:ctx=>{const r=d.regions[ctx.dataIndex],beds=r.beds[ctx.datasetIndex+1];return cats[ctx.datasetIndex]+'：'+number(beds)+'床'+(percent?' / '+(beds/r.beds[0]*100).toFixed(1)+'%':'')}};
 chart.update();
 absolute.setAttribute('aria-pressed',String(!percent));share.setAttribute('aria-pressed',String(percent));
 if(out)out.textContent=percent?'圏域内の4機能病床に対する構成比です。':'報告された病床実数を表示中です。';
}
 absolute.addEventListener('click',()=>change(false));share.addEventListener('click',()=>change(true));
}
function radar(){
const canvas=$('fuku-radar');if(!canvas)return;
if(!window.Chart){chartFallback('fuku-radar-alt');return}
const areaNames=['福岡・糸島','北九州','久留米','田川'];
const palette=['#13749d','#e29c42','#119388','#9a73a0'];
try{
new Chart(canvas,{type:'radar',data:{labels:d.indicators.map((s,i)=>s+'（'+d.weights[i]+'%）'),datasets:areaNames.map((s,i)=>{const r=d.regions.find(x=>x.name===s);return{label:s,data:r.ratings,borderColor:palette[i],backgroundColor:palette[i]+'18',pointBackgroundColor:palette[i],borderWidth:2,pointRadius:3}})},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:12,font:{size:11},padding:10}},tooltip:{callbacks:{label:c=>c.dataset.label+'：'+c.formattedValue+'/5（独自定性評価）'}}},scales:{r:{min:0,max:5,ticks:{stepSize:1,display:false},pointLabels:{font:{size:10},color:'#27485f'},angleLines:{color:'#d6e2ea'},grid:{color:'#dce9ec'}}}}});
}catch(e){console.warn('Fukuoka radar',e);chartFallback('fuku-radar-alt')}
const tbody=$('fuku-radar-table');if(tbody){tbody.innerHTML=areaNames.map(name=>{const r=d.regions.find(x=>x.name===name);return'<tr><th>'+clean(name)+'</th><td>'+evalScore(r)+'点（推計）</td></tr>'}).join('')}
}
function init(){try{buildHeatmap();updateBedMode();radar()}catch(e){console.warn('Fukuoka extra figures',e)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();