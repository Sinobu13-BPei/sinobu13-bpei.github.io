/* Fukushima health-policy visualization dashboard, 2026-10-26. Public aggregated data only. */
(()=>{"use strict";
const numberFmt=n=>new Intl.NumberFormat("ja-JP").format(n);
function chart(el,config){const canvas=document.getElementById(el);if(!canvas||typeof Chart==="undefined")return;try{new Chart(canvas,config)}catch(e){console.warn("[Fukushima policy] Chart error:",el,e)}}
function horizontalBar(labels,values,max,color,ticksuffix){return {type:"bar",data:{labels,datasets:[{data:values,backgroundColor:color,borderRadius:6,borderSkipped:false,maxBarThickness:34}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:"y",animation:{duration:400},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>numberFmt(c.raw)+(ticksuffix||"")}}},scales:{x:{min:0,max,ticks:{callback:v=>v+(ticksuffix||"")},grid:{color:"#e5ebf0"}},y:{ticks:{color:"#183e58",font:{size:12,weight:"bold"}},grid:{display:false}}}}}}
function draw(p){
  if(!p||!p.screening||!p.thyroid)return;
  if(typeof Chart==="undefined"){console.info("[Fukushima policy] Chart.js unavailable; accessible data tables visible.");return}
  Chart.defaults.font.family='system-ui,"Yu Gothic",Meiryo,sans-serif';Chart.defaults.color="#173950";
  const screening=p.screening.series, labels=screening.map(x=>x.name);
  chart("cancerRateChart",horizontalBar(labels,screening.map(x=>x.participation),60,["#216c83","#2b839b","#308e8d","#b47454","#806cb1"],"%"));
  chart("cancerFollowChart",horizontalBar(labels,screening.map(x=>x.followup),100,["#216c83","#2b839b","#308e8d","#b47454","#806cb1"],"%"));
  const rounds=p.thyroid.rounds;
  chart("thyroidRateChart",horizontalBar(rounds.map(x=>x.round+"（"+(x.completedPeriod?"期間終了":"途中経過")+"）"),rounds.map(x=>+(x.first/x.target*100).toFixed(1)),45,["#23708b","#bd8370"],"%"));
  const t=rounds[1];const values=[t.first,t.results,t.B,t.second,t.secondFinal,t.cytology];
  chart("thyroidProcessChart",{type:"bar",data:{labels:["一次受診","一次判定済","B判定","二次受診","二次結果確定","細胞診"],datasets:[{label:"人数",data:values,backgroundColor:["#2b8199","#53a1ae","#bb7d68","#8668a1","#9e87b5","#d4ac66"],borderRadius:6,maxBarThickness:36}]},options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>numberFmt(c.raw)+"人"}}},scales:{x:{type:"logarithmic",min:1,max:100000,title:{display:true,text:"人数（対数目盛。段階移行率を示すものではありません）",color:"#426070",font:{size:11}},ticks:{callback:value=>[1,10,100,1000,10000,100000].includes(value)?numberFmt(value):""}},y:{grid:{display:false},ticks:{color:"#1a3e56"}}}}});
  document.querySelectorAll(".chartbox canvas").forEach(c=>{c.style.background="#ffffff"})
}
function init(){fetch("./data/research.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(data=>{draw(data.policyDashboard)}).catch(err=>console.warn("[Fukushima policy] Data fetch:",err.message))}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();