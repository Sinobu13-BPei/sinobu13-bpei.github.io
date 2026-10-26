'use strict';
/* Kagawa Visual Atlas: all quantitative charts are driven by public-source market.json. */
(()=>{
const $=id=>document.getElementById(id);
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=v=>Number(v).toLocaleString('ja-JP');
const colors={east:'#3b87c0',west:'#5aaeba',island:'#e9aa4e'};
const names={east:'東部',west:'西部',island:'小豆'};
const weights=[.30,.25,.20,.15,.10];
const axes=['潜在需要','機能ギャップ','アクセス','持続可能性','連携余地'];
const scores=r=>Math.round(r.priority.reduce((s,p,i)=>s+p*weights[i],0)*20);
function noChart(id){const el=$(id);if(el)el.style.display='block';const chartEl=$(id.replace('Fallback',''));if(chartEl)chartEl.style.display='none'}
function chart(id,config){
 const el=$(id);if(!el||!window.Chart){noChart(id+'Fallback');return}
 try{new window.Chart(el,config)}catch(e){console.warn('Visual atlas chart fallback:',id,e);noChart(id+'Fallback')}
}
const common={responsive:true,maintainAspectRatio:false,animation:false,interaction:{intersect:false,mode:'index'},plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:13,color:'#425f72',font:{size:11}}},tooltip:{backgroundColor:'#193c52',padding:10,cornerRadius:8}}};
const axisY={beginAtZero:true,grid:{color:'#e7f0f4'},ticks:{color:'#557182',font:{size:11}}};
const axisX={grid:{display:false},ticks:{color:'#456478',font:{size:11}}};
const regionOrder=['east','west','island'];
function initializeCharts(d){
 const regs=regionOrder.map(k=>d.regions.find(r=>r.id===k));
 const popValues=regs.map(r=>r.pop2023);
 chart('visualRegionPop',{type:'doughnut',data:{labels:regs.map(r=>r.name),datasets:[{data:popValues,backgroundColor:regs.map(r=>colors[r.id]),borderColor:'#fff',borderWidth:3,hoverOffset:5}]},
 options:{...common,cutout:'62%',plugins:{...common.plugins,tooltip:{...common.plugins.tooltip,callbacks:{label:ctx=>ctx.label+': '+number(ctx.parsed)+'人 ('+(ctx.parsed/popValues.reduce((a,b)=>a+b,0)*100).toFixed(1)+'%)'}}}}});
 const bedName=['高度急性期','急性期','回復期','慢性期'];
 const bedColors=['#253e66','#227aa1','#23a495','#d99d4b'];
 const bedTotal=regs.map(r=>r.beds2024.reduce((a,b)=>a+b,0));
 const bedDatasets=bedName.map((n,j)=>({label:n,backgroundColor:bedColors[j],data:regs.map((r,i)=>+(r.beds2024[j]*100/bedTotal[i]).toFixed(2)),counts:regs.map(r=>r.beds2024[j]),borderWidth:0}));
 chart('visualBedsRegion',{type:'bar',data:{labels:regs.map(r=>r.name),datasets:bedDatasets},options:{...common,indexAxis:'y',scales:{x:{min:0,max:100,stacked:true,grid:{color:'#e9eff2'},title:{display:true,text:'構成比 %',font:{size:10}}},y:{stacked:true,grid:{display:false},ticks:{color:'#486b7e'}}},plugins:{...common.plugins,tooltip:{...common.plugins.tooltip,callbacks:{label:c=>c.dataset.label+': '+number(c.dataset.counts[c.dataIndex])+'床 ('+c.parsed.x.toFixed(1)+'%)'}}}}});
 const a=d.visualAtlas?.clinicPhysicianAging;
 if(a){
 const labels=['全国','香川県',...regs.map(r=>r.name)];const rates=[+(a.total.olderJapan/a.total.japan*100).toFixed(1),+(a.total.olderKagawa/a.total.kagawa*100).toFixed(1),...regs.map(r=>a.areas.find(x=>x.id===r.id).rate)];
 chart('visualPhysicianAge',{type:'bar',data:{labels,datasets:[{label:'65歳以上割合（%）',data:rates,backgroundColor:['#a3b9c8','#12677e',colors.east,colors.west,colors.island],borderRadius:6,maxBarThickness:48}]},options:{...common,plugins:{...common.plugins,legend:{display:false},tooltip:{callbacks:{label:c=>c.parsed.y.toFixed(1)+'%（2020年調査）'}}},scales:{x:axisX,y:{...axisY,max:100,ticks:{stepSize:20,callback:v=>v+'%'}}}}});
 }else noChart('visualPhysicianAgeFallback');
 const ds=regs.map(r=>({label:r.name,data:d.deviceJapan.map((nat,i)=>Math.round(r.devices[i]/nat*100)),backgroundColor:colors[r.id],maxBarThickness:32,borderRadius:5,raw:r.devices}));
 chart('visualDeviceIndex',{type:'bar',data:{labels:d.deviceNames,datasets:ds},options:{...common,scales:{x:{...axisX,ticks:{font:{size:10},maxRotation:35}},y:{...axisY,max:200,title:{display:true,text:'全国=100',font:{size:11}}}},plugins:{...common.plugins,tooltip:{...common.plugins.tooltip,callbacks:{label:c=>c.dataset.label+': 指数'+c.parsed.y+'（原値'+c.dataset.raw[c.dataIndex]+'／調整人口10万人）'}}}}});
}
function renderDetail(d,id){
 const r=d.regions.find(x=>x.id===id),el=$('visualAreaDetail');if(!r||!el)return;
 const totalBeds=r.beds2024.reduce((a,b)=>a+b,0)+r.inactive;
 const labels={east:'高度医療集積・医療機関間連携',west:'広域救急・共同利用・回復期連携',island:'離島医療・保守BCP・搬送'};
 el.innerHTML='<h4>'+escapeHTML(r.name)+'医療圏</h4><p>'+escapeHTML(r.municipalities)+'</p><div class="v-region-data"><div><small>人口（2023）</small><b>'+number(r.pop2023)+'</b><small>人 [S25]</small></div><div><small>許可病床（2024）</small><b>'+number(totalBeds)+'</b><small>床、休棟含む [S04]</small></div><div><small>医師偏在指標</small><b>'+escapeHTML(r.doctorIndex2026)+'</b><small>2026年 [S07]</small></div><div><small>戦略優先度</small><b>'+scores(r)+'<span style="font-size:12px"> / 100</span></b><small>独自分析</small></div></div><div class="v-focus-row"><span>特徴・提案課題</span><strong>'+escapeHTML(labels[r.id])+'</strong></div>';
 document.querySelectorAll('[data-visual-area]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.visualArea===id)));
}
function heatColor(n){
 if(n===0)return {bg:'#f3f5f7',color:'#526476'};
 if(n<70)return {bg:'#f0f6fb',color:'#38566e'};
 if(n<95)return {bg:'#d5e8f4',color:'#174969'};
 if(n<115)return {bg:'#add7e1',color:'#134d63'};
 if(n<150)return {bg:'#78c0c4',color:'#103e4b'};
 return {bg:'#266f87',color:'#fff'};
}
function renderHeatmap(d){
 const target=$('visualHeatmap');if(!target)return;
 let out='<div class="v-hm-head" style="text-align:left">装置の種類</div><div class="v-hm-head">東部</div><div class="v-hm-head">西部</div><div class="v-hm-head">小豆</div>';
 d.deviceNames.forEach((m,i)=>{
 out+='<div class="v-hm-label">'+escapeHTML(m)+'<br><small style="font-size:10px;color:#70879a;font-weight:500">全国 '+d.deviceJapan[i]+'</small></div>';
 for(const id of regionOrder){
 const r=d.regions.find(x=>x.id===id),value=r.devices[i],idx=Math.round(value/d.deviceJapan[i]*100);
 const c=heatColor(idx);
 out+='<div class="v-hm-cell" style="background:'+c.bg+';color:'+c.color+';border-color:'+c.bg+'" title="'+escapeHTML(r.name+' '+m+'：調整人口10万人当たり'+value+'・全国指数'+idx)+'" aria-label="'+escapeHTML(r.name+'、'+m+'、全国を100とした指数'+idx)+'"><b>'+idx+'</b><small>原値 '+value+'</small></div>';
 }
 });target.innerHTML=out;
}
function renderPriority(d){
 const el=$('visualPriorityMatrix');if(!el)return;
 let html='<div class="v-p-head">医療圏</div>'+axes.map((axis,i)=>'<div class="v-p-head">'+escapeHTML(axis)+'<br>('+Math.round(weights[i]*100)+'%)</div>').join('')+'<div class="v-p-head">計</div>';
 for(const id of regionOrder){
 const r=d.regions.find(x=>x.id===id);html+='<div class="v-p-title">'+escapeHTML(r.name)+'</div>';
 for(const p of r.priority){
 const bg=['','#f0f4f7','#dfeef3','#b1dbe1','#6bbac7','#19788e'][p];
 const c=p>=5?'#fff':'#1a4b63';
 html+='<div class="v-p-cell" title="5点満点中'+p+'点（独自分析）" style="background:'+bg+';color:'+c+'">'+p+'</div>';
 }
 html+='<div class="v-p-total">'+scores(r)+'</div>';
 }
 el.innerHTML=html;
}
async function render(){
 try{
 const response=await fetch('./data/market.json',{cache:'no-cache'});
 if(!response.ok)throw new Error('HTTP '+response.status);
 const data=await response.json();
 if(!Array.isArray(data.regions)||data.regions.length!==3||!Array.isArray(data.deviceNames))throw new Error('Bad dataset');
 initializeCharts(data);renderDetail(data,'east');renderHeatmap(data);renderPriority(data);
 document.querySelectorAll('[data-visual-area]').forEach(b=>b.addEventListener('click',()=>renderDetail(data,b.dataset.visualArea)));
 }catch(error){
 console.warn('Kagawa visual atlas fallback',error);
 ['visualRegionPopFallback','visualBedsRegionFallback','visualPhysicianAgeFallback','visualDeviceIndexFallback'].forEach(noChart);
 const hm=$('visualHeatmap');if(hm)hm.innerHTML='<div class="v-loading">データ読み込みに失敗しました。下の「機器市場」表から元データをご確認ください。</div>';
 const pm=$('visualPriorityMatrix');if(pm)pm.innerHTML='<p class="v-loading">スコア内訳を読み込めません。戦略章の優先度をご参照ください。</p>';
 }
}
document.addEventListener('DOMContentLoaded',render);
})();
