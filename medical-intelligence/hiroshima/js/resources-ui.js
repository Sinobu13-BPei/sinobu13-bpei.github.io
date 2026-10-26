/* Medical facilities and local medical associations | public references only */
(()=>{"use strict";
const R=window.HIROSHIMA_RESOURCES,D=window.HIROSHIMA_DATA;
if(!R||!D)return;
const $=id=>document.getElementById(id);
const fmt=n=>new Intl.NumberFormat("ja-JP").format(n);
const make=(tag,txt,cl)=>{const e=document.createElement(tag);if(txt!=null)e.textContent=String(txt);if(cl)e.className=cl;return e};
const a=(url,label)=>{const e=make("a",label);e.href=url;e.target="_blank";e.rel="noopener noreferrer";return e};
const fields=[
 ["hospital","病院"],["clinics","一般診療所"],["dental","歯科診療所"],["pharmacy","薬局"]
];
const totals={};["hospital","generalHospital","psychiatricHospital","clinics","bedded","nonBedded","dental","pharmacy"].forEach(key=>totals[key]=R.area.reduce((sum,x)=>sum+x[key],0));
const topline=$("facilityTotals");
if(topline){
 fields.forEach(([key,label])=>{const box=make("div",null,"facility-mini");const pic=make("span",key==="hospital"?"✚":key==="clinics"?"●":key==="dental"?"◇":"▣","facility-glyph");box.append(pic,make("span",label),make("strong",fmt(totals[key])+"施設"),make("small","2022年・広島県全域"));topline.append(box)});
}
const rows=$("facilityCensusTable");
if(rows){
 const body=rows.querySelector("tbody"),foot=rows.querySelector("tfoot");
 function tr(a,total=false){
  const row=make("tr",null,total?"total-row":undefined);
  [a.name,a.hospital,a.generalHospital,a.psychiatricHospital,a.clinics,a.bedded,a.nonBedded,a.dental,a.pharmacy,a.per100k].forEach((v,i)=>{const td=make(total?"th":"td",typeof v==="number"?i===9?v.toFixed(1):fmt(v):v);if(total&&i===0)td.scope="row";row.append(td)});
  return row;
 }
 R.area.forEach(v=>body.append(tr(v)));
 foot.append(tr({name:"広島県計",...totals,per100k:91.9},true));
}
const cardContainer=$("regionCards");
if(cardContainer){
 [...cardContainer.querySelectorAll(".region-card")].forEach(card=>{
  const region=card.querySelector("h4")?.textContent;
  const data=R.area.find(x=>x.name===region);
  if(!data)return;
  const stats=make("div",null,"region-facility-summary");
  const headline=make("div",null,"facility-summary-head");
  headline.append(make("strong","圏域内の医療資源"),make("small","2022年・医療施設調査等"));
  stats.append(headline);
  for(const [key,title] of fields){
   const cell=make("div",null,"region-stat");
   cell.append(make("span",title),make("b",fmt(data[key])));
   stats.append(cell);
  }
  const badge=make("div",null,"bedded-note");
  badge.append(make("span","内訳：有床診療所 "+data.bedded+"施設／無床診療所 "+data.nonBedded+"施設"));
  stats.append(badge);
  const cities=card.querySelector(".cities");
  if(cities)cities.after(stats);else card.append(stats);
 });
}
// 23 independent district associations. County/area census figures are separately labeled.
const totalAssoc=$("associationOverview");
if(totalAssoc){
 const m=make("div",null,"association-totals");
 const num=make("strong","23"),unit=make("span","市郡地区医師会");
 m.append(num,unit,make("small","広島県医師会掲載の独立組織（区医師会は補助掲載）"));
 totalAssoc.append(m);
 const summary=make("div",null,"association-totals");
 summary.append(make("strong",fmt(R.membership2025.memberCount)+"人"),make("span","県医師会の日本医師会会員数"),make("small","2025年12月1日・会員人数であり施設数ではない"),a(R.membership2025.url,"出典 ↗"));
 totalAssoc.append(summary);
}
const regionSelect=$("assocArea"),query=$("assocQuery"),listing=$("medicalAssociations");
if(listing&&regionSelect&&query){
 const all=[...R.associations.map(x=>({...x,isSub:false})),...R.subAssociations.map(x=>({...x,isSub:true,url:x.countUrl||R.associationSource}))];
 function render(){
  listing.replaceChildren();
  const zone=regionSelect.value,q=query.value.trim().toLowerCase();
  const found=all.filter(o=>(!zone||o.area===zone)&&(!q||[o.name,o.coverage,o.area].some(t=>(t||"").toLowerCase().includes(q))));
  if(!found.length){listing.append(make("p","条件に一致する医師会がありません。"));return}
  const section=make("div",null,"assoc-results");listing.append(section);
  found.forEach(o=>{
   const card=make("article",null,"assoc-resource-card");
   const h=make("div",null,"assoc-resource-head");
   h.append(make("h4",o.name),make("span",o.area,"zone-tag"));card.append(h);
   const territory=make("p",null,"assoc-territory");territory.append(make("b","対象・所在地の目安："),document.createTextNode(o.coverage));card.append(territory);
   if(o.memberFacilities!=null){
    const n=make("div",null,"assoc-number verified");
    n.append(make("span",o.countLabel||"公表会員施設数"),make("strong",fmt(o.memberFacilities)+"施設"),make("small",o.countYear+"｜医師会の公式公表"));
    card.append(n);
   }else{
    const unknown=make("div",null,"assoc-number unknown");
    unknown.append(make("span","医師会の会員施設数"),make("strong","未公表・未確認"),make("small","医療圏施設数を医師会施設数として転用しません"));
    card.append(unknown);
   }
   if(o.clinics!=null||o.hospitals!=null){
    const special=make("div",null,"assoc-sub-stats");
    special.append(make("b","地区の公表施設数"),make("span","病院 "+fmt(o.hospitals)+"／診療所 "+fmt(o.clinics)+"（"+o.countYear+"）"));
    card.append(special);
   }
   if(o.memberCount!=null){
    const membership=make("p",null,"assoc-members");
    membership.append(make("b","会員人数："),document.createTextNode(fmt(o.memberCount)+"人（"+o.countYear+"）"));
    card.append(membership);
   }
   const inArea=R.area.find(z=>z.name===o.area);
   if(inArea){
    const ref=make("div",null,"assoc-area-reference");
    ref.append(make("span","医療圏全体の参考値（2022年・医師会の所属数ではない）"));
    ref.append(make("strong","一般診療所 "+fmt(inArea.clinics)+"施設"));
    ref.append(make("small","病院 "+fmt(inArea.hospital)+" ／ 歯科診療所 "+fmt(inArea.dental)));
    card.append(ref);
   }
   const links=make("div",null,"assoc-resource-links");
   links.append(a(o.url||R.associationSource,"医師会サイト ↗"),a(R.associationSource,"県医師会の地区一覧 ↗"));
   if(o.countUrl&&o.countUrl!==o.url)links.append(a(o.countUrl,"数値の出典 ↗"));
   if(o.address)links.append(a("https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(o.name+" "+o.address),"Googleマップ ↗"));
   card.append(links);
   section.append(card);
  });
  const stamp=make("p",found.length+"件の医師会・区医師会を表示（地区23＋補助2の計25項目）","assoc-result-count");
  listing.prepend(stamp);
 }
 regionSelect.addEventListener("change",render);query.addEventListener("input",render);render();
}
if(!window.Chart)return;
const Chart=window.Chart;
const get=id=>$(id);
const draw=(id,type,data,options={})=>{
 const el=get(id);if(!el)return;
 new Chart(el,{type,data,options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{boxWidth:10,usePointStyle:true}}},...options}});
};
const names=R.area.map(a=>a.name);
draw("clinicCountChart","bar",{
 labels:names,datasets:[{label:"一般診療所（施設）",data:R.area.map(x=>x.clinics),backgroundColor:R.area.map((x,i)=>i===0?"#0c687a":"#3395a6"),borderRadius:6}]
},{indexAxis:"y",plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fmt(c.parsed.x)+"施設"}}},scales:{x:{beginAtZero:true,ticks:{callback:v=>fmt(v)}},y:{ticks:{autoSkip:false}}}});
draw("clinicRateChart","bar",{
 labels:names,datasets:[{label:"人口10万人当たり一般診療所",data:R.area.map(x=>x.per100k),backgroundColor:R.area.map(x=>x.per100k>=91.9?"#118a8b":"#7aa4c4"),borderRadius:5}]
},{indexAxis:"y",plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.parsed.x.toFixed(1)+"施設／10万人（2022年）"}}},scales:{x:{beginAtZero:true,title:{display:true,text:"施設／人口10万人"}},y:{ticks:{autoSkip:false}}}});
draw("multiFacilityChart","bar",{
 labels:names,datasets:[["hospital","病院","#234f81"],["clinics","一般診療所","#178f99"],["dental","歯科診療所","#dbac60"],["pharmacy","薬局","#888bb6"]].map(([k,label,color])=>({label,data:R.area.map(x=>x[k]),backgroundColor:color}))
},{indexAxis:"y",plugins:{legend:{position:"bottom"},tooltip:{callbacks:{label:c=>c.dataset.label+"："+fmt(c.parsed.x)+"施設"}}},scales:{x:{stacked:true,beginAtZero:true,title:{display:true,text:"カテゴリ別施設数（個別計上）"}},y:{stacked:true,ticks:{autoSkip:false}}}});
})();