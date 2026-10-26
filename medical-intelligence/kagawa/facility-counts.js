'use strict';
/* Public Kagawa municipality counts; association cross-municipality grouping is not a membership census. */
(()=>{
const $=id=>document.getElementById(id);
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const fmt=n=>Number(n).toLocaleString('ja-JP');
const labels={east:'東部',west:'西部',island:'小豆'};
const colors={east:'#3b87c0',west:'#25a18f',island:'#e0a14c'};
const rel={
'高松市':'高松市医師会、木田地区、綾歌地区の一部',
'さぬき市':'大川地区医師会',
'東かがわ市':'大川地区医師会',
'三木町':'木田地区医師会',
'直島町':'地区医師会の所属割付は未確認',
'土庄町':'小豆郡医師会',
'小豆島町':'小豆郡医師会',
'丸亀市':'丸亀市医師会、綾歌地区医師会',
'坂出市':'坂出市医師会',
'善通寺市':'仲多度郡・善通寺市医師会',
'観音寺市':'三豊・観音寺市医師会',
'三豊市':'三豊・観音寺市医師会',
'宇多津町':'坂出市医師会（同会公式サイト「宇多津エリア」）',
'綾川町':'綾歌地区医師会',
'琴平町':'仲多度郡・善通寺市医師会',
'多度津町':'仲多度郡・善通寺市医師会',
'まんのう町':'仲多度郡・善通寺市医師会'
};
const regionSort=['east','west','island'];
let data,region='all';
function summarize(rows){return rows.reduce((acc,r)=>{acc.hospitals+=r.hospitals;acc.clinics+=r.clinics;acc.hospitalBeds+=r.hospitalBeds;return acc},{hospitals:0,clinics:0,hospitalBeds:0})}
function renderCityRows(){
let rows=data.municipalities.filter(m=>(region==='all'||m.region===region));
const q=$('fsMunicipalitySearch')?.value.trim()||'';if(q)rows=rows.filter(m=>m.name.includes(q)||labels[m.region].includes(q));
rows.sort((a,b)=>regionSort.indexOf(a.region)-regionSort.indexOf(b.region)||b.clinics-a.clinics);
const target=$('fsMunicipalityRows');
if(target)target.innerHTML=rows.length?rows.map(m=>'<tr><td><span class="fs-area-pill" data-region="'+safe(m.region)+'">'+labels[m.region]+'</span></td><td><strong>'+safe(m.name)+'</strong></td><td class="fs-num">'+fmt(m.hospitals)+'</td><td class="fs-num"><strong>'+fmt(m.clinics)+'</strong></td><td class="fs-num">'+fmt(m.hospitals+m.clinics)+'</td><td class="fs-num">'+fmt(m.hospitalBeds)+'</td><td>'+safe(rel[m.name]||'未確認')+'</td></tr>').join(''):'<tr><td colspan="7">一致する市町村がありません。</td></tr>';
const sum=summarize(rows),output=$('fsMunicipalityTotals');
if(output)output.textContent=rows.length+'市町：病院 '+fmt(sum.hospitals)+'、一般診療所 '+fmt(sum.clinics)+'、合計 '+fmt(sum.hospitals+sum.clinics)+'、病院病床 '+fmt(sum.hospitalBeds)+'床（2024年10月・表示条件による集計）。';
}
function areaTotals(){const root=$('fs-region-cards');if(!root)return;
root.innerHTML=regionSort.map(id=>{const sum=summarize(data.municipalities.filter(m=>m.region===id));return '<article class="fs-region-card fs-theme-'+id+'"><h3>'+labels[id]+'医療圏</h3><div class="fs-big">'+fmt(sum.clinics)+' <small>一般診療所</small></div><p>病院 '+fmt(sum.hospitals)+' ／ 総施設 '+fmt(sum.clinics+sum.hospitals)+'</p><p>病院病床 '+fmt(sum.hospitalBeds)+'床（同表ベース）</p></article>'}).join('');
}
function associationRows(){
const root=$('fsAssociationRows');if(!root)return;
root.innerHTML=data.associations.map(a=>{
let ms=a.municipalNames.map(name=>data.municipalities.find(x=>x.name===name)).filter(Boolean);
let count;
if(!ms.length)count='<span class="fs-unverified">対象市町が分割されるため、所属数への換算不可</span>';
else {const sum=summarize(ms);count=fmt(sum.clinics)+' <small>（'+safe(ms.map(x=>x.name).join('・'))+'の全施設）</small>';}
let off;
if(a.officialMembership){const m=a.officialMembership;off='<span class="fs-official">'+fmt(m.total)+'施設</span>'+(m.clinics!==null?' <small>（病院'+fmt(m.hospitals)+'・診療所'+fmt(m.clinics)+'）</small>':'')+'<br><small>'+safe(m.year)+'</small> <a href="'+safe(m.source)+'" target="_blank" rel="noopener noreferrer">公式資料</a>';}
else off='<span class="fs-unverified">未確認（全会員数の推定はしない）</span>';
return '<tr><td><span class="fs-area-pill" data-region="'+safe(a.area)+'">'+labels[a.area]+'</span></td><td><a href="'+safe(a.site)+'" target="_blank" rel="noopener noreferrer">'+safe(a.name)+'</a><br><small>'+safe(a.address)+'</small><br><a href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(a.name+' '+a.address)+'" target="_blank" rel="noopener noreferrer">Googleマップ</a></td><td>'+safe(a.municipalHint)+'<br><small>'+safe(a.detail)+'</small></td><td>'+count+'</td><td class="fs-num"><strong>'+fmt(a.emergency)+'</strong><br><small>2023年4月・在宅当番医制</small></td><td>'+off+'</td></tr>';
}).join('');
}
function references(){const root=$('fsSourceList');if(!root)return;root.innerHTML=data.sourceRefs.map(s=>'<div><a href="'+safe(s.url)+'" target="_blank" rel="noopener noreferrer">['+safe(s.id)+'] '+safe(s.label)+'</a><small>'+safe(s.year)+'</small></div>').join('')}
function charts(){
if(!window.Chart)return;
const base={responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{position:'bottom',labels:{color:'#385c70',boxWidth:13,padding:11}}},scales:{x:{ticks:{color:'#486679'},grid:{display:false}},y:{beginAtZero:true,ticks:{color:'#486679'},grid:{color:'#e6eef2'}}}};
const per=regionSort.map(id=>summarize(data.municipalities.filter(m=>m.region===id)));
try{new window.Chart($('fsAreaChart'),{type:'bar',data:{labels:regionSort.map(id=>labels[id]),datasets:[{label:'一般診療所',data:per.map(s=>s.clinics),backgroundColor:'#268e9a',borderRadius:4},{label:'病院',data:per.map(s=>s.hospitals),backgroundColor:'#e7a85d',borderRadius:4}]},options:{...base,scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,beginAtZero:true,grid:{color:'#e6eef2'}}}}})}catch(e){console.warn('Facility area chart unavailable',e)}
try{const ordered=[...data.municipalities].sort((a,b)=>b.clinics-a.clinics);
new window.Chart($('fsTownChart'),{type:'bar',data:{labels:ordered.map(x=>x.name),datasets:[{label:'一般診療所数',data:ordered.map(x=>x.clinics),backgroundColor:ordered.map(x=>colors[x.region]),borderRadius:3,maxBarThickness:19}]},options:{...base,indexAxis:'y',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fmt(c.parsed.x)+'施設（2024年10月）'}}},scales:{x:{beginAtZero:true,ticks:{color:'#476578',precision:0},grid:{color:'#e9eef2'}},y:{ticks:{color:'#476578',font:{size:10}},grid:{display:false}}}}})}catch(e){console.warn('Municipality chart unavailable',e)}
}
function setupButtons(){
for(const b of document.querySelectorAll('[data-fs-area]'))b.addEventListener('click',()=>{
region=b.dataset.fsArea;
document.querySelectorAll('[data-fs-area]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.fsArea===region)));
renderCityRows();
});
$('fsMunicipalitySearch')?.addEventListener('input',renderCityRows);
}
async function init(){
try{const response=await fetch('./data/facility-counts-2024.json',{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);
data=await response.json();
if(data.municipalities?.length!==17||data.associations?.length!==9)throw Error('Incorrect facility supply schema');
const sum=summarize(data.municipalities);
if(sum.hospitals!==86||sum.clinics!==813||sum.hospitalBeds!==13911)throw Error('Source totals not reconciled');
areaTotals();renderCityRows();associationRows();references();charts();setupButtons();
}catch(e){console.warn('Facility supply data fallback',e);const el=$('fsMunicipalityTotals');if(el)el.textContent='2024年10月の香川県施設数：病院86・一般診療所813。詳細データ読込に失敗したため市町表は抜粋表示です。';}
}
document.addEventListener('DOMContentLoaded',init);
})();
