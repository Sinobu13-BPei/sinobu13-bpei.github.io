(function(){'use strict';
const d=window.TOCHIGI_DATA;if(!d){document.body.insertAdjacentHTML('afterbegin','<p>データ読み込みに失敗しました。</p>');return}
const byId=id=>document.getElementById(id),num=n=>Number(n).toLocaleString('ja-JP'),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const w=[25,20,20,20,15],score=r=>Math.round(r.scoreParts.reduce((a,x,i)=>a+x*w[i]/5,0)); 
const source=(id)=>'<a href="#'+id+'">['+id+']</a>';
const statSpecs=[['2025年 国勢調査確報',num(d.stats.populationCensus2025)+' 人','S01｜2026-09-29公表'],['2026年9月 推計人口',num(d.stats.populationSep2026)+' 人','S02｜2026-09-01現在'],['2024年 病床機能報告',num(d.stats.bedTotal2024)+' 床','S04｜2024-07現在'],['2025年 必要病床数',num(d.stats.needBed2025)+' 床','S05｜地域医療構想の推計']];
byId('statCards').innerHTML=statSpecs.map(x=>'<article class="stat"><small>'+esc(x[0])+'</small><strong>'+esc(x[1])+'</strong><p>'+esc(x[2])+'</p></article>').join('');
byId('areaTable').querySelector('tbody').innerHTML=d.regions.map(r=>'<tr><th scope="row">'+r.name+'</th><td>'+esc(r.municipalities)+'</td><td class="num">'+num(r.current.reduce((a,b)=>a+b,0))+'</td>'+r.current.slice(0,4).map(v=>'<td class="num">'+num(v)+'</td>').join('')+'<td class="num">'+num(r.need.reduce((a,b)=>a+b,0))+'</td><td class="num">'+r.phys.toFixed(1)+'</td><td class="num">'+score(r)+'/100</td></tr>').join('');
byId('areaCards').innerHTML=d.regions.map(r=>'<article class="area-card"><strong>'+esc(r.name)+'医療圏</strong><p>'+esc(r.driver)+'</p><p><b>課題：</b>'+esc(r.issue)+'</p><p><b>検討機会：</b>'+esc(r.opportunity)+'</p><details><summary>注目施設・具体的な確認事項</summary><p><b>主な施設：</b>'+esc(r.facilities)+'</p><p><b>次の確認：</b>'+esc(r.next)+'</p></details></article>').join('');
byId('cityTable').querySelector('tbody').innerHTML=d.cities.map(c=>'<tr><th>'+esc(c[0])+'</th><td class="num">'+num(c[1])+'</td><td>'+esc(c[2])+'</td></tr>').join('');
const mapUrl=(name,address)=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(name+' '+address);
const gsiUrl=(lat,lng)=>'https://maps.gsi.go.jp/#11/'+lat.toFixed(3)+'/'+lng.toFixed(3)+'/';
const card=loc=>{const [n,a,reg,type,official,lat,lng]=loc;return '<article class="facility"><span class="tag">'+esc(type)+'｜'+esc(reg)+'</span><h4>'+esc(n)+'</h4><p>'+esc(a)+'</p><div class="links">'+(official?'<a href="'+esc(official)+'" target="_blank" rel="noopener noreferrer">公式</a>':'')+'<a href="'+mapUrl(n,a)+'" target="_blank" rel="noopener noreferrer">Google地図</a><a href="'+gsiUrl(lat,lng)+'" target="_blank" rel="noopener noreferrer" title="自治体周辺の概略図。施設の正確な位置ではありません">地理院 周辺図</a></div></article>'};
const renderFacility=()=>{const f=byId('facilityFilter').value;byId('facilityList').innerHTML=d.locations.filter(l=>f==='all'||l[3]===f).map(card).join('')};byId('facilityFilter').addEventListener('change',renderFacility);renderFacility();
byId('associationList').innerHTML=d.associations.map(x=>'<a href="https://www.tochigi-med.or.jp/tma/association/" target="_blank" rel="noopener noreferrer">'+esc(x)+'</a>').join('');
const eq=[['超音波 US','検査需要・在宅/救急POCUS・保守総額','県別設置台数の確定値は未掲載'],['CT','共同利用・救急・更新と線量管理','e-Stat CT分類別機器台数参照'],['MRI','高磁場/普及機・診療科別稼働','e-Stat磁場強度別台数参照'],['PET/PET-CT','腫瘍・認知症等の検査運用','公的原表と保険適用を照合'],['リニアック','がん集約化と治療アクセス','がん拠点・放射線治療設備を確認'],['血管撮影','救急循環器・脳卒中/IVR','症例件数・施設機能の確認が必要'],['内視鏡','消化器・検診・滅菌ワークフロー','診療科/件数と更新周期の照合が必要'],['心電図/生体情報','健診・循環器・在宅','診療所統計と設置実態を分けて確認'],['透析/腎代替','慢性疾患・地域交通と人材','透析施設と保守/透析患者規模を検証']];
byId('equipmentCards').innerHTML=eq.map(x=>'<article><h4>'+esc(x[0])+'</h4><p>'+esc(x[1])+'</p><p class="caption">'+esc(x[2])+'｜'+source('S12')+'</p></article>').join('');
const frameworks=[
['PEST','P:医療計画/共同利用と医師確保　E:病院経営・設備投資制約　S:人口減少/高齢化　T:画像DX/省人化'],
['3C','Customer:病院・診療所・地域連携　Competitor:多様な提供手段（直販/卸/共同利用）　Company:商社の物流・技術連携・保守運用'],
['STP','Segmentation:6医療圏×医療機能×モダリティ　Target:実需と供給のミスマッチ領域　Positioning:装置単体より地域機能の最適化'],
['4P','Product:装置＋診療DX＋保守　Price:総保有費用　Place:共同利用・広域配送　Promotion:公表エビデンスに基づく説明'],
['4C','Customer Value:患者アクセスと検査質　Cost:運用総額　Convenience:紹介連携/可搬　Communication:多職種合意'],
['VRIO','Value:運用・診療連携　Rarity:地理/設備/制度を横断する調整力　Imitability:運用ノウハウ蓄積　Organization:品質/物流/保守の組織化'],
['Five Forces','新規参入:保守認証等の障壁　売手:部材依存　買手:病院の調達競争　代替:共同利用/検査外注　競合:価格より総費用・運用']];
byId('frameworks').innerHTML=frameworks.map(x=>'<article><h4>'+esc(x[0])+'</h4><p>'+esc(x[1])+'</p></article>').join('');
const swot=[['Strengths / 強み','2大学病院・県央の高度医療資源、交通結節・検査集積'],['Weaknesses / 弱み','県北・県西・両毛の医師偏在、広域人口減少、病床機能アンバランス'],['Opportunities / 機会','地域医療連携、在宅US、画像共同利用、医療DX、設備更新・BCP'],['Threats / 脅威','診療報酬・人件費、調達負担、技術職不足、部品調達、洪水・積雪']];
byId('swot').innerHTML=swot.map(x=>'<article><h4>'+esc(x[0])+'</h4><p>'+esc(x[1])+'</p></article>').join('');
byId('scoreTable').querySelector('tbody').innerHTML=d.regions.map(r=>'<tr><th>'+r.name+'</th>'+r.scoreParts.map((p,i)=>'<td class="num">'+(p*w[i]/5).toFixed(0)+'</td>').join('')+'<td class="num"><b>'+score(r)+'</b></td></tr>').join('');
byId('sourceList').innerHTML=d.sources.map(s=>'<article id="'+esc(s[0])+'"><strong>['+esc(s[0])+'] '+esc(s[1])+'</strong><small>年次：'+esc(s[2])+'</small><a href="'+esc(s[3])+'" target="_blank" rel="noopener noreferrer">'+esc(s[3])+'</a></article>').join('');
function fallbackChart(id,msg){const p=byId(id);if(p)p.parentElement.innerHTML='<p class="note">グラフ表示ライブラリに接続できません。数値は同ページの表で確認できます。 '+esc(msg||'')+'</p>'}
const labels=d.regions.map(r=>r.name);
if(typeof Chart!=='undefined'){Chart.defaults.font.family='system-ui,Meiryo,sans-serif';Chart.defaults.color='#3c5364';const create=(id,type,chartLabels,datasets,options={})=>new Chart(byId(id),{type,data:{labels:chartLabels,datasets},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'},tooltip:{mode:'index',intersect:false}},...options}});
create('populationChart','bar',['2020実績','2025確報','2026/9推計','2050推計'],[{label:'人口（万人）',data:[d.stats.population2020/10000,d.stats.populationCensus2025/10000,d.stats.populationSep2026/10000,d.stats.population2050/10000],backgroundColor:['#397a97','#397a97','#397a97','#b67824']}],{scales:{y:{beginAtZero:true}}});
create('bedsChart','bar',labels,[{label:'高度急性期',data:d.regions.map(r=>r.current[0]),backgroundColor:'#285b86'},{label:'急性期',data:d.regions.map(r=>r.current[1]),backgroundColor:'#2f8e9b'},{label:'回復期',data:d.regions.map(r=>r.current[2]),backgroundColor:'#cc8c37'},{label:'慢性期',data:d.regions.map(r=>r.current[3]),backgroundColor:'#7a729d'}],{scales:{x:{stacked:true},y:{stacked:true,beginAtZero:true}}});
create('recoveryChart','bar',labels,[{label:'2024報告',data:d.regions.map(r=>r.current[2]),backgroundColor:'#137a87'},{label:'2025必要量（推計）',data:d.regions.map(r=>r.need[2]),backgroundColor:'#be8540'}]);
create('physChart','bar',labels,[{label:'医師偏在指標',data:d.regions.map(r=>r.phys),backgroundColor:'#1f7188'},{label:'全国',data:labels.map(()=>d.stats.nationalPhysician),type:'line',borderColor:'#c26d26',pointRadius:0}],{scales:{y:{beginAtZero:true}}});
create('scoreChart','bar',labels,[{label:'独自優先度 / 100点',data:d.regions.map(score),backgroundColor:'#116f83'}],{scales:{y:{min:0,max:100}}});
}else{['populationChart','bedsChart','recoveryChart','physChart','scoreChart'].forEach(id=>fallbackChart(id))}
if(typeof L!=='undefined'){try{const map=L.map('map',{scrollWheelZoom:false}).setView([36.64,139.82],9);L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{maxZoom:17,attribution:'&copy; <a href="https://maps.gsi.go.jp/" target="_blank">国土地理院 地理院タイル</a>'}).addTo(map);d.regions.forEach(r=>L.circleMarker(r.center,{radius:8,weight:2,color:'#064960',fillColor:'#55d5ca',fillOpacity:.9}).addTo(map).bindPopup('<b>'+esc(r.name)+'医療圏・代表市付近</b><br>医師偏在指標 '+r.phys+'<br>概略位置（実測境界ではありません）'));}catch(e){byId('map').innerHTML='<p class="note">地図を表示できません。<a href="https://maps.gsi.go.jp/" target="_blank" rel="noopener noreferrer">地理院地図</a>をご利用ください。</p>'}}else{byId('map').innerHTML='<p class="note">地図ライブラリが利用できません。<a href="https://maps.gsi.go.jp/" target="_blank" rel="noopener noreferrer">地理院地図</a>を開く。</p>'}
})();