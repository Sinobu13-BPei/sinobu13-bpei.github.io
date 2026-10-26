(() => {
"use strict";
const $=id=>document.getElementById(id);
const E=(tag,cl="",t="")=>{const n=document.createElement(tag);if(cl)n.className=cl;if(t)n.textContent=t;return n};
const num=n=>Number(n).toLocaleString("ja-JP");
const svg=(paths,cls="")=>'<svg viewBox="0 0 80 80" class="'+cls+'" aria-hidden="true">'+paths+'</svg>';
const pict={
patient:svg('<circle cx="40" cy="24" r="11"/><path d="M18 66V55c0-12 10-21 22-21s22 9 22 21v11M26 61h28"/>'),
hospital:svg('<rect x="17" y="18" width="46" height="51" rx="4"/><path d="M32 11h16v14H32zM40 13v11m-7-6h14M24 39h8m16 0h8M24 49h8m16 0h8M34 68V56h12v12"/>'),
heart:svg('<path d="M40 68 15 46C-1 28 23 9 40 29c17-20 41-1 25 17z"/><path d="M17 44h14l5-10 8 21 5-11h14"/>'),
machine:svg('<rect x="12" y="9" width="56" height="59" rx="8"/><circle cx="40" cy="35" r="19"/><circle cx="40" cy="35" r="9"/><path d="M26 68v6m28-6v6"/>'),
network:svg('<circle cx="14" cy="40" r="9"/><circle cx="62" cy="15" r="9"/><circle cx="62" cy="65" r="9"/><path d="M23 36 53 19M23 44l30 17M62 24v32"/>'),
shield:svg('<path d="M40 8 66 18v19c0 17-12 28-26 36C26 65 14 54 14 37V18z"/><path d="m25 40 11 10 19-21"/>'),
cloud:svg('<path d="M23 57h36c12 0 14-18 2-23-2-16-27-23-33-5C9 27 4 54 23 57z"/><path d="M40 41v24m-9-9 9 9 9-9"/>'),
scan:svg('<path d="M18 18V9h17m10 0h17v17M62 53v17H45m-10 0H18V53"/><circle cx="40" cy="39" r="16"/><path d="M31 39h18M40 30v18"/>'),
calendar:svg('<rect x="13" y="20" width="54" height="47" rx="5"/><path d="M13 32h54M27 12v15m26-15v15M24 43h12m11 0h10m-33 12h12m11 0h10"/>'),
surgery:svg('<rect x="12" y="17" width="56" height="45" rx="6"/><path d="M25 42h10l7-13 8 24 5-11h6"/>'),
ambulance:svg('<path d="M8 25h35v31H8zM43 35h15l14 12v9H43zM14 25V14h24v11M26 16v9m-6-4h12"/><circle cx="23" cy="59" r="7"/><circle cx="58" cy="59" r="7"/>'),
snow:svg('<path d="M40 8v64M12 24l56 32M12 56l56-32M30 17l10 10 10-10M30 63l10-10 10 10"/>'),
server:svg('<rect x="11" y="11" width="58" height="20" rx="4"/><rect x="11" y="41" width="58" height="20" rx="4"/><circle cx="21" cy="21" r="3"/><circle cx="21" cy="51" r="3"/><path d="M41 21h18M41 51h18"/>'),
ct:svg('<rect x="10" y="8" width="60" height="64" rx="7"/><circle cx="40" cy="40" r="22"/><circle cx="40" cy="40" r="11"/>',"viz-mod-icon"),
mr:svg('<rect x="9" y="14" width="62" height="51" rx="9"/><circle cx="40" cy="40" r="21"/><path d="M30 39h21M17 72h46"/>',"viz-mod-icon"),
us:svg('<path d="M22 9c-10 0-10 17 0 26l19 13m3 0 15 15"/><rect x="29" y="44" width="33" height="17" rx="6" transform="rotate(-20 29 44)"/><path d="M14 23q-8 9 0 18M8 21q-13 15 0 31"/>',"viz-mod-icon"),
pet:svg('<circle cx="40" cy="40" r="28"/><circle cx="40" cy="40" r="14"/><path d="M40 12v56M12 40h56"/>',"viz-mod-icon"),
rt:svg('<circle cx="40" cy="40" r="9"/><path d="M40 9v20m0 22v20M9 40h20m22 0h20M17 17l15 15m16 16 15 15M17 63l15-15m16-16 15-15"/>',"viz-mod-icon"),
ivr:svg('<path d="M12 17h56v43H12zM22 50c10-6 10-22 20-22s10 16 19 7M17 69h46"/>',"viz-mod-icon"),
endo:svg('<path d="M18 12c27-6 40 8 39 29-1 18-21 16-24 6-3-10 6-12 12-8M18 12l-4 10m4-10h13"/>',"viz-mod-icon"),
ecg:svg('<path d="M6 44h16l7-20 13 35 8-19h24"/>',"viz-mod-icon"),
hd:svg('<path d="M20 12v43q0 16 20 16t20-16V12M20 35h40M30 12v15m20-15v15"/>',"viz-mod-icon")};
function appendFeatureCards(){
 const root=$("vizFeatures");if(!root)return;
 const items=[["人口・需要構造",pict.patient,"2020年から2050年へ。地域別の絶対数とアクセス需要を並べて読む。"],["機能別病床",pict.hospital,"実績の報告病床と政策上の必要病床を分離し、機能を比較。"],["画像・検査機器",pict.machine,"台数の未検証値を避け、疾患・用途から機器機会を整理。"],["BCP・地域連携",pict.network,"救急・診療所・在宅を結ぶ運用、保守、情報基盤を俯瞰。"]];
 for(const [title,ico,sub]of items){const e=E("article","viz-feature");e.innerHTML=ico; e.append(E("strong","",title),E("p","",sub));root.append(e)}
}
function populationAtlas(d){
const root=$("vizPopulation");if(!root)return;
const grid=E("div","viz-grid"),left=E("div","viz-surface v-col-7"),right=E("div","viz-surface v-col-5");
left.append(E("h3","viz-card-title","人口構成｜5圏域の規模感（2020年）"));
const list=E("div","viz-poplist");
const max=Math.max(...d.regions.map(r=>r.pop2020));
for(const r of [...d.regions].sort((a,b)=>b.pop2020-a.pop2020)){
 const row=E("div","viz-poprow");row.append(E("b","",r.name));const bar=E("div","viz-popbar");const fill=E("span");fill.style.width=(r.pop2020/max*100).toFixed(1)+"%";bar.append(fill);row.append(bar,E("strong","",num(r.pop2020)+"人"));list.append(row);
}
left.append(list,E("p","viz-muted","出典：2020年国勢調査（岐阜県第8期計画掲載、S04）。棒の長さは岐阜医療圏を100とした相対値。"));
right.append(E("h3","viz-card-title","人口縮小が迫る設備運用の変化"));
const baseline=d.future[0].pop,final=d.future[d.future.length-1].pop;
const reduction=((1-final/baseline)*100).toFixed(1);
const detail=E("div","viz-pred");detail.append(E("strong","","−"+reduction+"%"),E("p","","2020→2050年の総人口変化。2020年は実績、2050年は社人研2023年推計（S08）。実績の将来値ではありません。"));right.append(detail);
const stages=E("div","viz-workflow");
[["01","高齢化の進展"],["02","疾病構造の変化"],["03","病床・診療連携"],["04","検査・装置配置"],["05","共同利用・保守"]].forEach(([no,desc])=>{const s=E("div","viz-step");s.append(E("b","",no),E("p","",desc));stages.append(s)});
right.append(E("p","viz-muted","設備投資の総量増加を予測するものではなく、構成の変化に着目する推論。"));
grid.append(left,right);root.append(grid);
}
function areaSketch(d){
 const box=$("vizRegionSketch");if(!box)return;
 const regions=[
 {name:"飛騨",x:302,y:92,color:"#9cc9c3",short:"高山・下呂"},
 {name:"中濃",x:319,y:258,color:"#a9d1af",short:"関・美濃加茂"},
 {name:"東濃",x:492,y:318,color:"#e8cf91",short:"多治見・中津川"},
 {name:"岐阜",x:212,y:367,color:"#a9c5e3",short:"岐阜・各務原"},
 {name:"西濃",x:80,y:343,color:"#e9b5ae",short:"大垣・揖斐"}
 ];
 let markup='<svg viewBox="0 0 620 465" class="viz-region-map" role="img" aria-label="岐阜県5医療圏の位置関係を示す模式図。北側に飛騨、中央に中濃、東側に東濃、南西に岐阜と西濃"><defs><filter id="skshadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#1a4656" flood-opacity=".10"/></filter></defs><path d="M305 96Q334 160 319 258T212 367M319 258Q404 268 492 318M212 367Q128 380 80 343" fill="none" stroke="#4c8291" stroke-width="4" stroke-dasharray="7 8"/><text x="24" y="31" fill="#4a7381" font-size="15" font-weight="700">N ↑｜圏域代表都市の位置関係</text>';
for(const r of regions) markup+='<g filter="url(#skshadow)"><ellipse cx="'+r.x+'" cy="'+r.y+'" rx="92" ry="64" fill="'+r.color+'" stroke="white" stroke-width="4"/><text x="'+r.x+'" y="'+(r.y-3)+'" text-anchor="middle" class="region-title">'+r.name+'</text><text x="'+r.x+'" y="'+(r.y+21)+'" text-anchor="middle" class="region-sub">'+r.short+'</text></g>';
markup+='</svg>';
box.innerHTML=markup;box.append(E("p","viz-schem-note","位置関係を説明する概念図であり、行政界・二次医療圏境界・面積・距離を正確に示す地図ではありません。精密な位置確認は隣のLeaflet地理院地図と各施設の地図リンクをご利用ください。"));
}
function bedsAtlas(d){
const root=$("vizBedMix");if(!root)return;
const parts=["高度急性期","急性期","回復期","慢性期","休棟"];
const colors=["#174a67","#3c8a95","#87b7a1","#cc9a63","#aab8c1"];
const left=E("div","viz-surface v-col-7"),right=E("div","viz-surface v-col-5");
left.append(E("h3","viz-card-title","構成で見る病床機能｜2025年報告"));
const rows=E("div","viz-mini");
for(const r of d.regions){
const sum=r.beds.reduce((a,b)=>a+b,0);const line=E("div","viz-mbar-row");
line.append(E("strong","",r.name));const track=E("div","viz-track");track.setAttribute("role","img");track.setAttribute("aria-label",r.name+"の2025年報告病床内訳："+parts.map((k,i)=>k+r.beds[i]+"床").join("、"));
r.beds.forEach((n,i)=>{const b=E("i");b.style.width=(n/sum*100)+"%";b.style.backgroundColor=colors[i];b.title=parts[i]+" "+num(n)+"床";track.append(b)});
line.append(track,E("em","",num(sum)+"床"));rows.append(line)
}
left.append(rows);
const legend=E("div","viz-track-legend");parts.forEach((name,i)=>{const it=E("span");const sw=E("b");sw.style.backgroundColor=colors[i];it.append(sw,document.createTextNode(name));legend.append(it)});left.append(legend);
left.append(E("p","viz-muted","各圏域の帯は構成比100％で描画。帯の長さが同じでも病床数は異なります。出典：岐阜県2025年病床機能報告（S03）。"));
right.append(E("h3","viz-card-title","同じ2025年でも、指標の定義が違う"));
const all=d.regions.reduce((s,r)=>s+r.beds.reduce((a,b)=>a+b,0),0),closed=d.regions.reduce((s,r)=>s+r.beds[4],0);
const n=E("div","viz-number","16,235床");right.append(n,E("p","viz-muted","2025年7月の病床機能報告：休棟中を含む総病床数（S03）"));
const track=E("div","viz-track");for(const [value,color,title] of [[all-closed,colors[1],"4機能報告 15,129床"],[closed,colors[4],"休棟中 1,106床"]]){const b=E("i");b.style.width=(value/all*100)+"%";b.style.backgroundColor=color;b.title=title;track.append(b)}right.append(track);
const sep=E("hr","viz-vline");right.append(sep,E("div","viz-number","14,978床"),E("p","viz-muted","地域医療構想で計算された2025年の必要病床数。実測値ではなく需要推計（S26）。"));
const count=E("div","viz-pred");count.append(E("strong","","区別"),E("p","","報告総病床 − 必要病床数を『余剰病床』と呼ばない。時点・定義・患者移動・病床機能の違いを確認する。"));right.append(count);
const g=E("div","viz-grid");g.append(left,right);root.append(g);
}
function addFlow(root,items){
const el=E("div","viz-patient-path");
for(const [img,title,desc] of items){const x=E("article","viz-patient-node");x.innerHTML=img;x.append(E("strong","",title),E("p","",desc));el.append(x)}root.append(el);
}
function pathways(){
const r=$("vizPatientPath");if(r)addFlow(r,[[pict.patient,"住民・患者","予防・受診・救急"],[pict.heart,"診療所・在宅","初期診療・検査"],[pict.hospital,"基幹病院","高度診断・入院"],[pict.network,"地域連携","逆紹介・共同利用"]]);
const inst=$("vizInstitutionRoles");if(inst){
const choices=[[pict.hospital,"大学・基幹病院","専門医療・臨床研究・地域拠点","S02 / S10"],[pict.network,"医師会・地域医療","病診連携・在宅・医師の生涯教育","S09"],[pict.shield,"行政・保健所","医療計画・災害医療・医療DX・補助制度","S02 / S12 / S16"]];
for(const [pic,t,description,source]of choices){const c=E("article","viz-role");c.innerHTML=pic;c.append(E("strong","",t),E("p","",description),E("small","",source));inst.append(c)}
}
const risk=$("vizRiskPath");if(risk){const risks=[[pict.snow,"01 / RISK","気象・交通","豪雪・河川氾濫・土砂災害による搬送とアクセス制約"],[pict.ambulance,"02 / CONTINUITY","医療継続","救急・病院間搬送・広域連携のバックアップ"],[pict.machine,"03 / EQUIPMENT","設備冗長化","停電、装置停止、部品・代替機を含む復旧計画"],[pict.server,"04 / DATA","データ保全","画像連携・遠隔読影・サイバー対策を同時に確保"]];
for(const [pic,no,title,desc]of risks){const c=E("article");c.append(E("b","",no));c.innerHTML+=pic;c.append(E("strong","",title),E("p","",desc));risk.append(c)}}
const channels=$("vizChannelFlow");if(channels)addFlow(channels,[[pict.machine,"製造・調達","機器・医療材料"],[pict.network,"商社・卸","調達・比較・物流"],[pict.hospital,"医療機関","患者・検査・診療"],[pict.shield,"運用・保守","教育・DX・BCP"]]);
}
const mods=[["CT","ct"],["MRI","mr"],["US","us"],["PET","pet"],["放治","rt"],["血管撮影","ivr"],["内視鏡","endo"],["心電図","ecg"],["透析","hd"]];
const patterns={
岐阜:[3,3,3,3,3,3,3,3,2],
西濃:[3,2,3,1,2,2,3,3,3],
中濃:[3,3,3,2,2,3,3,3,2],
東濃:[3,2,3,2,2,3,3,2,2],
飛騨:[3,2,3,1,1,2,2,3,2]
};
const lens={
CT:"救急・患者の紹介動線、共同利用、撮影能力と保守冗長性",
MRI:"脳神経・整形外科・がん領域の検査待ち時間と撮像効率",
US:"循環器・腹部・周産期・訪問診療と救急POCUSの適合",
PET:"専門的ながん診療の広域集約と紹介体制",
放治:"高度ながん治療機能と品質管理・専門スタッフ",
血管撮影:"脳・心血管・救急医療と24時間運用",
内視鏡:"消化器疾患、健診、がん検診と感染対策",
心電図:"不整脈・心不全、地域連携、在宅モニタリング",
透析:"慢性腎疾患・通院アクセス・人材配置"};
function deviceAtlas(d){
const root=$("vizDeviceHeatmap");if(!root)return;
const top=E("div","viz-heat-actions");top.append(E("div","viz-muted","セルの1–3は市場台数・シェア・予測額ではなく、政策・疾患・地理条件から検討した編集部の相対的なテーマ適合度。"));
const lbl=E("label","viz-muted","圏域を強調： ");const sel=E("select");sel.setAttribute("aria-label","ヒートマップで強調する医療圏");sel.append(E("option","","全医療圏"));for(const r of d.regions){const o=E("option","",r.name);o.value=r.name;sel.append(o)}lbl.append(sel);top.append(lbl);root.append(top);
const wrap=E("div","viz-heatwrap");const table=E("table","viz-heat"),thead=E("thead"),hdr=E("tr");hdr.append(E("th","","圏域 / 機器"));for(const [name]of mods)hdr.append(E("th","",name));thead.append(hdr);table.append(thead);const tbody=E("tbody");
const commentary=E("div","viz-highlight","セルを選択すると、評価の論点を表示します。");
for(const r of d.regions){const tr=E("tr");tr.setAttribute("data-region",r.name);tr.append(E("th","",r.name));patterns[r.name].forEach((level,i)=>{const td=E("td");const b=E("button","lv"+level,level+"/3");b.type="button";b.setAttribute("aria-label",r.name+"・"+mods[i][0]+"、仮説適合度 "+level+"／3");b.addEventListener("click",()=>{commentary.replaceChildren();commentary.append(E("strong","",r.name+" × "+mods[i][0]+" ｜独自分析 "+level+"/3"),E("div","",lens[mods[i][0]]+"。個別施設の更新年・実需要・導入計画は未確認です。"))});td.append(b);tr.append(td)});tbody.append(tr)}
table.append(tbody);wrap.append(table);root.append(wrap);
const legend=E("div","viz-heat-legend");[["#e7edef","1｜要個別確認"],["#aad3cf","2｜条件次第"],["#397f91","3｜重点検討"]].forEach(([color,txt])=>{const a=E("span");const k=E("i");k.style.backgroundColor=color;a.append(k,document.createTextNode(txt));legend.append(a)});root.append(legend,commentary,E("p","viz-muted","情報源：岐阜県第8期計画（S02）、外来医療計画（S13）、圏域の地理条件を基にした独自分析。スコアは実績データではない。"));
sel.addEventListener("change",()=>tbody.querySelectorAll("tr").forEach(tr=>tr.classList.toggle("is-dim",sel.value!=="全医療圏"&&sel.value!==tr.getAttribute("data-region"))));
const devCards=document.querySelectorAll(".devicegrid .deviceicon");devCards.forEach((box,i)=>{const ico=mods[i]?.[1];if(ico&&pict[ico])box.insertAdjacentHTML("afterbegin",pict[ico]);});
}
function strategyAtlas(d){
const r=$("vizStrategyFlow");if(r){const strip=E("div","viz-strategy-stream");for(const [name,desc]of [["PEST","環境・政策"],["3C・STP","顧客・選択"],["4P・4C","価値・届け方"],["VRIO","実行資源"],["5 Forces","競争構造"],["KSF","勝ち筋"]]){const c=E("div");c.append(E("strong","",name),E("p","",desc));strip.append(c)}r.append(strip)}
const radar=$("vizRadar");if(!radar)return;
if(typeof Chart!=="undefined"){
const cols=["#176980","#7e9e75","#d59b54","#8e77ab","#c16f6e"];
new Chart(radar,{type:"radar",data:{labels:d.scoreLabels.map(s=>s.replace("・","/")),datasets:d.regions.map((r,i)=>({label:r.name,data:r.scores,borderColor:cols[i],backgroundColor:cols[i]+"18",pointBackgroundColor:cols[i],pointRadius:3,borderWidth:2}))},options:{responsive:true,maintainAspectRatio:false,scales:{r:{min:0,max:5,ticks:{stepSize:1,font:{size:10},backdropColor:"transparent"},pointLabels:{font:{size:11},color:"#455f6c"},grid:{color:"#c9d8de"}}},plugins:{legend:{position:"bottom",labels:{boxWidth:12,font:{size:11}}},tooltip:{callbacks:{label:c=>c.dataset.label+": "+c.raw+"/5（仮説）"}}}}});
}else{const f=E("div","viz-mini");d.regions.forEach(r=>{const q=E("div","viz-mbar-row");q.append(E("strong","",r.name));const bar=E("div","viz-popbar");const fill=E("span");fill.style.width=(r.scores.reduce((a,b,i)=>a+b*d.scoreWeights[i]/5,0))+"%";bar.append(fill);q.append(bar,E("em","",Math.round(r.scores.reduce((a,b,i)=>a+b*d.scoreWeights[i]/5,0))+"点"));f.append(q)});radar.replaceWith(f)}
}
appendFeatureCards();pathways();
fetch("./data/market.json").then(r=>{if(!r.ok)throw Error("JSON HTTP "+r.status);return r.json()}).then(d=>{populationAtlas(d);areaSketch(d);bedsAtlas(d);deviceAtlas(d);strategyAtlas(d)}).catch(err=>{console.error("Visual atlas",err);for(const id of ["vizPopulation","vizRegionSketch","vizBedMix","vizDeviceHeatmap","vizStrategyFlow"]){const node=$(id);if(node)node.append(E("p","viz-muted","追加図表のデータが読み込めません。基礎となる表と一次資料をご参照ください。"))}});
})();