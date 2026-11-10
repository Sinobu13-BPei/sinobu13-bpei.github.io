/* 栃木県公開統計・医師会公式名簿に基づく追加分析（2026-11-10） */
(function(){
'use strict';
const d=window.TOCHIGI_DATA,r=window.TOCHIGI_RESEARCH_2026;
if(!d||!r)return;
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const n=v=>Number(v).toLocaleString('ja-JP');
const a=(url,title)=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(title)+'</a>';
const gm=(name,address)=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(name+' '+address);
const center={全県:[36.565,139.883],県北:[36.85,140.02],県西:[36.72,139.73],宇都宮:[36.555,139.882],県東:[36.44,140.02],県南:[36.39,139.84],両毛:[36.33,139.51]};
const gsi=(region)=>{const [lat,lng]=center[region]||center['全県'];return 'https://maps.gsi.go.jp/#10/'+lat+'/'+lng+'/&base=std&ls=std';};
const mapLinks=(name,address,region)=>'<div class="geo-links">'+a(gm(name,address),'Googleマップ')+a(gsi(region),'地理院地図（概略）')+'</div>';
if($('areaPeopleTable')){
 const tbody=$('areaPeopleTable').querySelector('tbody');
 tbody.innerHTML=d.regions.map(x=>'<tr><th scope="row">'+esc(x.name)+'</th><td class="num">'+n(x.population2025)+'</td><td class="num"><b>'+n(x.doctors2024)+'</b></td><td class="num">'+x.doctorsRateOfficial.toFixed(1)+'</td><td class="num">'+n(x.hospitals2025)+'</td><td class="num">'+n(x.clinics2025)+'</td><td class="num">'+n(x.nurses2024)+'</td><td>'+mapLinks(x.name+'医療圏',x.municipalities+' 栃木県',x.name)+'</td></tr>').join('');
}
const pop=d.regions.reduce((v,x)=>v+x.population2025,0), doctors=d.regions.reduce((v,x)=>v+x.doctors2024,0);
if($('areaFactCards'))$('areaFactCards').innerHTML=[
 ['2025年確報・県人口',n(pop)+'人','25市町の合計'],
 ['2024年・医療施設従事医師',n(doctors)+'人','県医療構想評価資料'],
 ['2024年・県内看護師',n(d.regions.reduce((s,x)=>s+x.nurses2024,0))+'人','6医療圏の合計'],
 ['2026年10月1日・県推計人口',n(d.stats.populationOct2026)+'人','公表された最新の月報']
 ].map(x=>'<article class="factcard"><small>'+esc(x[0])+'</small><strong>'+esc(x[1])+'</strong><span>'+esc(x[2])+'</span></article>').join('');
const initDoctorChart=()=>{
 const wrap=$('doctorCountChart');if(!wrap)return;
 if(typeof Chart==='undefined'){
 wrap.parentElement.innerHTML='<p class="note">グラフ表示環境が利用できません。医師数は直下の比較表で確認できます。</p>';return;
 }
 new Chart(wrap,{type:'bar',
 data:{labels:d.regions.map(x=>x.name),datasets:[{label:'医師数（2024年・人）',data:d.regions.map(x=>x.doctors2024),backgroundColor:'#237c88',borderRadius:4}]},
 options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>'医師数 '+n(c.parsed.y)+'人'}}},scales:{y:{beginAtZero:true,ticks:{precision:0}},x:{grid:{display:false}}}}
 });
};initDoctorChart();
function renderAssoc(){
 const root=$('associationCards'), select=$('associationRegion');if(!root)return;
 const v=select?select.value:'all';
 const match=r.associations.filter(x=>v==='all'||x.region===v||x.region==='全県');
 const item=x=>'<article class="directory-card"><span class="directory-tag">'+esc(x.type)+' · '+esc(x.region)+'</span>'+
 '<h3>'+a(x.official,x.name)+'</h3><p class="address">'+esc(x.address)+'</p>'+
 '<p class="directory-contact">電話 '+esc(x.tel)+'　'+a(x.directory,'県医師会の公式名簿')+'</p>'+
 '<p class="directory-focus"><strong>医療圏の調査論点：</strong>'+esc(x.focus)+'</p>'+
 (x.activity?'<div class="association-activity"><strong>公式サイトで確認できた活動：</strong><p>'+esc(x.activity.detail)+'</p>'+a(x.activity.url,x.activity.label)+'</div>':'')+
 '<p class="caption">'+esc(x.kind)+'</p>'+mapLinks(x.name,x.address,x.region)+'</article>';
 root.innerHTML=match.map(item).join('');
 if($('associationCount'))$('associationCount').textContent='表示：'+match.length+'団体／県医師会を含む13団体（県医師会は全エリアで表示）';
}
$('associationRegion')?.addEventListener('change',renderAssoc);renderAssoc();
if($('companyCards'))$('companyCards').innerHTML=r.companies.map(x=>
 '<article class="directory-card"><span class="directory-tag">'+esc(x.kind)+'</span><h3>'+a(x.official,x.name)+'</h3>'+
 '<p class="address">'+esc(x.address)+'</p><p>'+esc(x.area)+'</p>'+
 '<p class="caption">出典：企業公式サイト・会社概要（2026年11月確認）</p>'+mapLinks(x.name,x.address,'宇都宮')+'</article>'
 ).join('');
})();
