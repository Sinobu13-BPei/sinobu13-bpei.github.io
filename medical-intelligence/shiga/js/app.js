(()=>{"use strict";
const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
const num=(x)=>Number(x).toLocaleString("ja-JP");
const esc=(s)=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const mapQ=(s)=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(s);
const gsi=(r)=>"https://maps.gsi.go.jp/#15/"+r.coord[0]+"/"+r.coord[1]+"/";
let data=null, map=null,charts=[];
const asset=(n)=>"data/shiga.json";
const attr=(a)=>encodeURIComponent(a);
const linkSet=(item,region)=>{const r=data.regions.find(a=>a.name===(region||item.area))||data.regions[0], exact=[item.name,item.address].filter(Boolean).join(" ");
return '<span class="dir-links"><a href="'+esc(item.url)+'" target="_blank" rel="noopener noreferrer" aria-label="'+esc(item.name)+'の公式サイト">公式サイト ↗</a><a href="'+mapQ(exact)+'" target="_blank" rel="noopener noreferrer">Googleマップ ↗</a><a href="'+gsi(r)+'" target="_blank" rel="noopener noreferrer" title="施設位置ではなく医療圏の代表点を表示">地理院地図（圏域概略） ↗</a></span>'};
const source=(url,year)=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">出典 ↗</a> <span class="muted">'+esc(year)+'</span>';
async function boot(){try{const r=await fetch(asset("shiga"),{cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);data=await r.json();render();$("#loadstate").textContent="一次情報・集計データを読み込みました。";}catch(e){$("#loadstate").textContent="データ読み込みに失敗しました。再読み込みしてください。";$("#loadstate").style.color="#ffe6a6";const problem=$("#critical");if(problem)problem.textContent="追加の分析データを読み込めませんでした。ネットワーク状態を確認してください。";console.error(e)}}
const sectionDate='2025年10月（人口）・2025年7月（病床）';
function render(){
 const P=data.regions,sites=data.sources,idx=(i)=>sites[i]?.url;
 const popTotal=P.reduce((s,r)=>s+r.pop2025,0),bedTotal=P.reduce((s,r)=>s+r.beds2025[0],0);
 $("#totalPop").textContent=num(popTotal);$("#totalBeds").textContent=num(bedTotal);
 $("#popTable tbody").innerHTML=P.map(r=>'<tr><th scope="row">'+r.name+'</th><td class="num">'+num(r.pop2025)+'</td><td class="num">'+num(r.forecast2020Base[4])+'</td><td class="num">'+num(r.forecast2020Base[6])+'</td><td class="num">'+r.aging2050.toFixed(1)+'%</td><td>'+esc(r.municipalities.join("・"))+'</td></tr>').join("");
 $("#bedTable tbody").innerHTML=P.map(r=>'<tr><th scope="row">'+r.name+'</th>'+r.beds2025.map(v=>'<td class="num">'+num(v)+'</td>').join("")+'<td class="num">'+num(r.beds2040Indicative)+'</td></tr>').join("");
 $("#deviceTable tbody").innerHTML=data.modalities.map(d=>'<tr><th scope="row">'+d.name+'</th><td class="num">'+d.hospital+'</td><td class="num">'+d.clinic+'</td><td class="num">'+d.total+'</td><td class="num">'+d.adjusted+'</td><td class="num">'+d.national+'</td><td class="num">'+(d.adjusted-d.national).toFixed(2)+'</td></tr>').join("");
 $("#regionTabs").innerHTML=P.map((r,i)=>'<button type="button" class="tab" role="tab" id="tab-'+i+'" aria-controls="regionDetails" aria-selected="'+(i===0)+'" data-area="'+esc(r.name)+'">'+esc(r.name)+'</button>').join("");
 $$(".tab",$("#regionTabs")).forEach(b=>b.addEventListener("click",()=>selectRegion(b.dataset.area)));
 selectRegion(P[0].name);
 $("#hospitalItems").innerHTML=data.hospitals.map(h=>'<article class="dir-card" data-search="'+esc(h.area+" "+h.name)+'"><h3><a href="'+esc(h.url)+'" target="_blank" rel="noopener noreferrer">'+esc(h.name)+' ↗</a></h3><p>'+esc(h.area)+'医療圏</p>'+linkSet(h)+'</article>').join("");
 $("#officeItems").innerHTML=[...data.healthOffices,...data.associations].map(h=>'<article class="dir-card" data-search="'+esc(h.area+" "+h.name)+'"><h3><a href="'+esc(h.url)+'" target="_blank" rel="noopener noreferrer">'+esc(h.name)+' ↗</a></h3><p>'+esc(h.area)+'医療圏｜'+esc(h.address)+'</p>'+linkSet(h)+'</article>').join("");
 $("#sourcesItems").innerHTML=sites.map((s,i)=>'<div class="source"><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+String(i+1).padStart(2,"0")+'｜'+esc(s.title)+' ↗</a><small>データ年次：'+esc(s.year)+'</small></div>').join("");
 $("#hospitalCount").textContent=data.hospitals.length+"施設を掲載";
 bindSearch("#hospitalSearch","#hospitalItems","#hospitalCount","施設");
 bindSearch("#officeSearch","#officeItems","#officeCount","団体・窓口");
 renderScore();
 renderCharts();
 renderMap();
 $("#csvButton").addEventListener("click",downloadCSV);
 const check=$("#checkMap");if(check)check.addEventListener("click",()=>map?.invalidateSize());
}
function bindSearch(input,root,counter,word){$(input).addEventListener("input",()=>{const q=$(input).value.toLocaleLowerCase("ja-JP").trim();let n=0;$$(".dir-card",$(root)).forEach(el=>{const ok=el.dataset.search.toLocaleLowerCase("ja-JP").includes(q);el.hidden=!ok;if(ok)n++});$(counter).textContent=n+" "+word+"を表示中"})}
function selectRegion(name){const r=data.regions.find(x=>x.name===name);if(!r)return;
 $$("#regionTabs .tab").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.area===name)));
 $("#regionDetails").innerHTML='<h3>'+r.name+'医療圏 <span class="tag">'+esc(r.driver)+'</span></h3><div class="grid three"><div class="metric"><span class="lab">2025確定人口</span><strong>'+num(r.pop2025)+'</strong><small>国勢調査・市町村合算</small></div><div class="metric"><span class="lab">2040年予測人口</span><strong>'+num(r.forecast2020Base[4])+'</strong><small>社人研・2020年基準推計</small></div><div class="metric"><span class="lab">2025年病床機能報告</span><strong>'+num(r.beds2025[0])+'</strong><small>病院＋有床診療所の報告対象病床</small></div></div><div class="two-panel"><div class="textblock"><h4>需要の構造</h4><p>'+esc(r.driver)+'</p><h4>主な課題</h4><p>'+esc(r.problem||"医療圏内の医師・機能配置と施設経営の両立")+'</p></div><div class="textblock"><h4>今後3〜5年の検討テーマ（独自分析）</h4><p>'+esc(r.action)+'</p><h4>主要施設</h4><p>'+r.majorHospitals.map(n=>{const h=data.hospitals.find(h=>h.name===n);return h?'<a href="'+esc(h.url)+'" target="_blank" rel="noopener noreferrer">'+esc(n)+' ↗</a>':esc(n)}).join("・")+'</p></div></div><p class="chart-caption">2040年推計は2025確定人口からの単純延長ではありません。医療圏の比較・議論用の独自整理です。</p>';
}
const scoreInput={
 "大津":[5,2,5,3,4],"湖南":[5,3,4,2,5],"甲賀":[3,5,4,4,2],"東近江":[4,4,4,3,3],"湖東":[3,4,3,3,3],"湖北":[3,5,5,5,2],"湖西":[2,5,4,5,2]
};
function renderScore(){const w=Object.values(data.scoreWeights);
 const z=data.regions.map(r=>{const a=scoreInput[r.name];return {name:r.name,parts:a,score:Math.round(a.reduce((v,x,i)=>v+x*w[i],0)/5)};}).sort((a,b)=>b.score-a.score);
 $("#ranking").innerHTML=z.map(r=>'<div class="rankrow"><strong>'+r.score+'</strong><b>'+r.name+'</b><div><div class="progress"><i style="width:'+r.score+'%"></i></div><small class="muted">需要'+r.parts[0]+'・医療格差'+r.parts[1]+'・再編'+r.parts[2]+'・アクセス'+r.parts[3]+'・実行性'+r.parts[4]+'（各５段階）</small></div></div>').join("");
}
function draw(el,type,labels,datasets,options={}){if(typeof Chart==="undefined"){const p=document.createElement("p");p.className="empty";p.textContent="グラフライブラリを読み込めません。数値は直下の表をご確認ください。";$("#"+el).parentElement.append(p);return}
const c=$("#"+el);if(!c)return;
 charts.push(new Chart(c,{type,data:{labels,datasets},options:{responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{position:"bottom",labels:{boxWidth:12,font:{size:11}}}},scales:type==="doughnut"?{}:{y:{beginAtZero:true,ticks:{font:{size:10}}},x:{ticks:{font:{size:10},maxRotation:50}}},...options}}));}
function renderCharts(){const P=data.regions;
 draw("chartPop","bar",P.map(r=>r.name),[{label:"2025確定人口",data:P.map(r=>r.pop2025),backgroundColor:"#2583ab"}]);
 draw("chartFuture","line",[2020,2025,2030,2035,2040,2045,2050],P.map((r,i)=>({label:r.name,data:r.forecast2020Base,borderColor:["#1567a9","#12a09f","#d69c4e","#6d71bd","#4f8c4b","#c05a75","#8b6798"][i],tension:.28,pointRadius:2})),{interaction:{mode:"index",intersect:false}});
 draw("chartBeds","bar",P.map(r=>r.name),[["高度急性期",1,"#2764a7"],["急性期",2,"#4c9cc0"],["回復期",3,"#59bfa8"],["慢性期",4,"#d5a65a"],["休棟",5,"#9ba9b5"]].map(([label,i,color])=>({label,data:P.map(r=>r.beds2025[i]),backgroundColor:color})),{scales:{x:{stacked:true},y:{stacked:true,beginAtZero:true}}});
 draw("chartDevice","bar",data.modalities.map(d=>d.name),[{label:"滋賀県（調整人口あたり）",data:data.modalities.map(d=>d.adjusted),backgroundColor:"#188e9a"},{label:"全国（同条件）",data:data.modalities.map(d=>d.national),backgroundColor:"#a6bdd0"}]);
}
function renderMap(){if(typeof L==="undefined"){const map=$("#gsiMap");map.innerHTML='<p class="empty">地図ライブラリが読み込めません。下のGoogleマップ・地理院地図リンクをご利用ください。</p>';return}
 map=L.map("gsiMap",{scrollWheelZoom:false}).setView([35.20,136.05],9);
 L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://maps.gsi.go.jp/" target="_blank" rel="noopener">国土地理院｜地理院タイル</a>',maxZoom:17}).addTo(map);
 data.regions.forEach(r=>{const p=L.circleMarker(r.coord,{radius:10,color:"#fff",weight:2,fillColor:"#18718f",fillOpacity:.93}).addTo(map);
 p.bindPopup('<strong>'+r.name+'医療圏（概略点）</strong><br>'+num(r.pop2025)+'人（2025年）<br><a target="_blank" rel="noopener" href="'+mapQ("滋賀県 "+r.municipalities[0])+'">Googleマップ ↗</a><br><a target="_blank" rel="noopener" href="'+gsi(r)+'">地理院地図 ↗</a>');
 });
}
function downloadCSV(){const r=[["医療圏","2025確定人口","2030推計","2040推計","2050推計","2025病床数"],...data.regions.map(x=>[x.name,x.pop2025,x.forecast2020Base[2],x.forecast2020Base[4],x.forecast2020Base[6],x.beds2025[0]])];const s=r.map(x=>x.join(",")).join("\r\n");const blob=new Blob(["\ufeff"+s],{type:"text/csv;charset=utf-8"});const u=URL.createObjectURL(blob);const a=document.createElement("a");a.href=u;a.download="shiga-medical-areas-2026.csv";a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
document.addEventListener("DOMContentLoaded",boot);
})();