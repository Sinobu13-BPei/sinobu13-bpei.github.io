
/* Additional published research visualisations; no cookies or personal data. */
(()=>{
const D=window.TOKUSHIMA_RESEARCH||null;
const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const byId=id=>document.getElementById(id);
function srcLink(url,title='原典'){return '<a class="src-link" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(title)+' ↗</a>'}
function gMap(name,address){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(name+' '+address)}
function gsi(lat,lon){return 'https://maps.gsi.go.jp/#15/'+lat+'/'+lon+'/'}
function render(){
 if(!D)return;
 const beds=byId('bed-comparison-body');
 if(beds){let html='';D.areas.forEach(a=>{a.actual.forEach((v,i)=>html+='<tr><td>'+esc(a.name)+'</td><td>'+['高度急性期','急性期','回復期','慢性期'][i]+'</td><td>'+v.toLocaleString('ja-JP')+'</td><td>'+a.needed[i].toLocaleString('ja-JP')+'</td><td style="font-weight:700;color:'+(v<a.needed[i]?'#b65d3d':'#1d668e')+'">'+(v-a.needed[i]>0?'+':'')+(v-a.needed[i]).toLocaleString('ja-JP')+'</td></tr>')});beds.innerHTML=html}
 const phys=byId('doctor-comp-body');if(phys){phys.innerHTML=D.areas.map(a=>'<tr><td>'+a.name+'</td><td>'+a.doctors2024.toLocaleString()+'</td><td>'+a.physIndex2026+'</td><td>'+srcLink(D.physSource,'厚労省')+'</td></tr>').join('')}
 const equip=byId('equipment-body');if(equip){equip.innerHTML=D.equipment.map(e=>'<tr><td>'+e.label+'</td><td>'+e.value+'</td><td>'+e.hospital+'</td><td>'+e.clinic+'</td><td>'+e.prefRate+'</td><td>'+e.nationalRate+'</td><td>'+srcLink(e.source,'2020年計画')+'</td></tr>').join('')}
 const more=byId('equipment-other');if(more){more.innerHTML=D.modalities.map(m=>'<tr><td>'+esc(m.name)+'</td><td>'+esc(m.signal)+'</td><td>'+esc(m.status)+'</td><td>'+srcLink(m.url)+'</td></tr>').join('')}
 const places=byId('deep-place-links');if(places){places.innerHTML=D.institutions.map(p=>'<tr><td>'+esc(p[0])+'</td><td>'+esc(p[1])+'</td><td>'+esc(p[2])+'</td><td><span class="gsi-group"><a target="_blank" rel="noopener" href="'+gMap(p[0],p[2])+'">Google Maps</a><a target="_blank" rel="noopener" href="'+gsi(p[3],p[4])+'">地理院地図</a></span></td><td>'+srcLink(p[5],'公式ページ')+'</td></tr>').join('')}
 const refs=byId('deep-source-list');if(refs){refs.innerHTML=D.sources.map((s,i)=>'<tr><td>'+String(i+1).padStart(2,'0')+'</td><td>'+esc(s.t)+'</td><td>'+esc(s.year)+'</td><td>'+srcLink(s.url)+'</td></tr>').join('')}
 const scores=byId('score-rows');if(scores){scores.innerHTML=D.areas.map(a=>'<tr><td>'+a.name+'</td><td>'+a.objectives.map((v,i)=>v+' /5').join('</td><td>')+'</td><td id="score-'+a.name+'">—</td></tr>').join('');calc()}
 const mapextra=byId('gsi-map-note');if(mapextra)mapextra.innerHTML='ベースマップ：<a target="_blank" rel="noopener" href="https://maps.gsi.go.jp/">国土地理院「地理院タイル」</a>。所在地マーカーは参考位置。個別の地理院地図は以下のリンク一覧を参照。';
 addExistingFacilityLinks();
 drawCharts();
}
function calc(){if(!D)return;let w=D.weights.map((v,i)=>Number(byId('weight-'+i)?.value||v.weight));let sum=w.reduce((a,b)=>a+b,0);byId('weight-total').textContent=sum+'%';D.areas.forEach(a=>{let v=a.objectives.reduce((s,sc,i)=>s+sc*w[i],0)/(sum||100);let t=byId('score-'+a.name);if(t)t.textContent=v.toFixed(2)+' /5'})}
function addExistingFacilityLinks(){const tb=byId('hospitalRows');if(tb){Array.from(tb.rows).forEach(row=>{if(row.cells.length<6)return;const name=row.cells[0]?.textContent?.trim()||'';const found=D.institutions.find(p=>p[0]===name);let a=document.createElement('a');a.textContent='地理院地図';a.className='btn';a.style.padding='4px 8px';a.style.marginLeft='6px';a.target='_blank';a.rel='noopener';a.href=found?gsi(found[3],found[4]):'https://maps.gsi.go.jp/#12/34.04/134.52/';a.title=found?'参考位置を地理院地図で見る':'徳島県の地理院地図を表示（施設位置ではありません）';row.cells[5].appendChild(a)})}}
function drawCharts(){if(!window.Chart||!D)return;Chart.defaults.font.family='"Meiryo UI",Meiryo,"Yu Gothic",sans-serif';Chart.defaults.color='#426075';let c=byId('deep-doctors');if(c)new Chart(c,{type:'bar',data:{labels:D.areas.map(a=>a.name),datasets:[{label:'2024 医師数',data:D.areas.map(a=>a.doctors2024),backgroundColor:['#247bb1','#d48252','#66a185']} ]},options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}},responsive:true,maintainAspectRatio:false}});c=byId('deep-devices');if(c)new Chart(c,{type:'bar',data:{labels:D.equipment.map(e=>e.label),datasets:[{label:'徳島県（旧計画）',data:D.equipment.map(e=>e.prefRate),backgroundColor:'#167eb0'},{label:'全国（同計画）',data:D.equipment.map(e=>e.nationalRate),backgroundColor:'#cba05b'}]},options:{indexAxis:'y',plugins:{legend:{position:'bottom'}},scales:{x:{beginAtZero:true,title:{display:true,text:'調整人口あたり台数：2020年計画記載値'}}},responsive:true,maintainAspectRatio:false}})}
function init(){if(!D){fetch('./data/research.json').then(r=>r.json()).then(v=>{window.TOKUSHIMA_RESEARCH=v;render()}).catch(()=>{const p=byId('research-load');if(p)p.textContent='外部データを読み込めません。公開HTMLの本文・原典リンクを参照してください。'});return}render()}
for(let i=0;i<5;i++){let input=byId('weight-'+i);if(input)input.addEventListener('input',()=>{byId('weight-view-'+i).textContent=input.value+'%';calc()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
