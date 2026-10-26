"use strict";
(async function initNaraMarket(){
  const $ = id => document.getElementById(id);
  const n = v => Number(v).toLocaleString("ja-JP");
  const esc = s => String(s??"").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const regionColors = {"奈良":"#247f7f","東和":"#2e89aa","西和":"#c28a3c","中和":"#537fae","南和":"#b76889"};
  let d;
  try {
    const res=await fetch("./data/nara.json",{cache:"no-cache"});
    if(!res.ok)throw new Error("JSON HTTP "+res.status);
    d=await res.json();
    if(!Array.isArray(d.regions)||d.regions.length!==5)throw new Error("The five regions are missing");
  }catch(e){
    document.querySelector("main")?.insertAdjacentHTML("afterbegin",'<p class="note" role="alert">医療圏データを読み込めません。データの公開状態またはネットワーク接続を確認してください。</p>');
    console.error("Nara public data error",e);return;
  }
  const gmap=x=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(x.name+" "+(x.address||"奈良県"));
  const gsi=x=>"https://maps.gsi.go.jp/#15/"+x.lat+"/"+x.long;
  const links=x=>'<a href="'+gmap(x)+'" target="_blank" rel="noopener noreferrer">Googleマップ</a> / <a href="'+gsi(x)+'" target="_blank" rel="noopener noreferrer">地理院地図</a>';
  const score=r=>r.ratings.reduce((sum,v,i)=>sum+v*d.scoreAxis[i].weight/5,0);
  const regionOrder=d.regions.map(r=>r.name);
  const areaSum=d.regions.reduce((sum,x)=>sum+x.areaKm2,0);
  const populationSum=d.regions.reduce((sum,x)=>sum+x.population,0);
  function setHTML(id, html){if($(id))$(id).innerHTML=html;}
  function bootTables(){
    setHTML("facilityAreaRows",d.regions.map(r=>{const f=r.facilityCounts2021;return '<tr><th scope="row">'+esc(r.name)+'</th><td class="num">'+n(f.hospitals)+'</td><td class="num"><strong>'+n(f.generalClinics)+'</strong></td><td class="num">'+n(f.dentalClinics)+'</td><td class="num">'+n(f.total)+'</td><td class="num">'+n(r.memberClinicCount2023)+'</td><td><a href="'+d.sources.S25.url+'" target="_blank" rel="noopener noreferrer">施設2021</a> / <a href="'+d.sources.S26.url+'" target="_blank" rel="noopener noreferrer">会員2023</a></td></tr>'}).join(""));
    setHTML("regionFacilityCards",d.regions.map(r=>{const f=r.facilityCounts2021;return '<article class="regionFacilityItem"><h3>'+esc(r.name)+'医療圏</h3><div class="regionFacNumbers"><div><strong>'+n(f.generalClinics)+'</strong><span>一般診療所</span></div><div><strong>'+n(f.hospitals)+'</strong><span>病院</span></div><div><strong>'+n(f.dentalClinics)+'</strong><span>歯科診療所</span></div></div><div class="regionMemberTag">医師会会員診療所（2023年）<b>'+n(r.memberClinicCount2023)+'施設</b></div><p class="small">一般診療所・病院・歯科：2021年（S25）。会員：2023年（S26）。</p></article>'}).join(""));
    const assocSelector=$("associationAreaFilter");
    if(assocSelector){d.regions.forEach(r=>{const opt=document.createElement("option");opt.value=r.name;opt.textContent=r.name;assocSelector.appendChild(opt)})}
    function drawAssociation(){
      const region=assocSelector?.value||"",q=($("associationSearch")?.value||"").trim().toLowerCase();
      const list=d.associationDetails.filter(a=>(!region||a.regions.includes(region))&&(!q||[a.name,a.coverage,...a.regions].join(" ").toLowerCase().includes(q)));
      setHTML("associationRows",list.map(a=>{
        const isKnown=Number.isFinite(a.clinicMembers);
        const splits=a.parts?a.parts.map(p=>'<span class="splitPart">'+esc(p.region)+' '+esc(p.name)+'：<b>'+n(p.count)+'</b>施設</span>').join(""):"";
        const loc=d.associationMap[a.name], map=loc?links({name:a.name,...loc}):"所在地を県医師会一覧で確認";
        const count=isKnown?n(a.clinicMembers)+'施設':'未公表';
        const coop=Number.isFinite(a.cooperating)?n(a.cooperating)+'施設':'未公表';
        return '<tr><th scope="row"><a href="'+esc(a.officialUrl)+'" rel="noopener noreferrer" target="_blank">'+esc(a.name)+'</a></th><td><div>'+esc(a.coverage)+'</div>'+splits+'</td><td>'+a.regions.map(esc).join("・")+(a.type?'（職域等）':'')+'</td><td class="num">'+count+'</td><td class="num">'+coop+'<div class="small">'+esc(a.cooperationScope)+'</div></td><td><a href="'+esc(a.officialUrl)+'" target="_blank" rel="noopener noreferrer">公式サイト・一覧</a><div class="small">'+map+'</div><a href="'+d.sources.S26.url+'" target="_blank" rel="noopener noreferrer">計数出典</a></td></tr>';
      }).join("")||'<tr><td colspan="6">該当する医師会はありません。</td></tr>');
    }
    assocSelector?.addEventListener("change",drawAssociation);
    $("associationSearch")?.addEventListener("input",drawAssociation);
    drawAssociation();

    setHTML("regions", d.regions.map(r=>'<article class="region"><h3>'+esc(r.name)+'医療圏 <b class="score">'+score(r)+'/100</b></h3><p><strong>主要施設：</strong>'+esc(r.hospitals)+'</p><p><strong>需要：</strong>'+esc(r.driver)+'</p><p><strong>課題：</strong>'+esc(r.issue)+'</p><p><strong>3–5年の機会（独自分析）：</strong>'+esc(r.play)+'</p><p class="small">人口：2020年国勢調査 '+n(r.population)+'人／病床：2025年7月 '+n(r.total)+'床。<a href="'+d.sources.S02.url+'">S02</a>・<a href="'+d.sources.S03.url+'">S03</a></p></article>').join(""));
    setHTML("bedsRows", d.regions.map(r=>'<tr><th scope="row">'+esc(r.name)+'</th><td class="num">'+n(r.total)+'</td>'+r.beds.map(x=>'<td class="num">'+n(x)+'</td>').join("")+'<td class="num">'+n(r.needed)+'</td><td class="num">'+n(r.standard)+'</td></tr>').join(""));
    setHTML("priorityRows",d.regions.map(r=>'<tr><th scope="row">'+esc(r.name)+'</th>'+r.ratings.map((q,i)=>'<td class="num">'+Math.round(q*d.scoreAxis[i].weight/5)+'</td>').join("")+'<td class="num"><b>'+score(r)+'</b></td></tr>').join(""));
    setHTML("bedCompareRows",d.regions.map(r=>{const earlier=d.beds2024[r.name],change=r.total-earlier;return '<tr><th scope="row">'+esc(r.name)+'</th><td class="num">'+n(earlier)+'</td><td class="num">'+n(r.total)+'</td><td class="num">'+(change>0?"+":"")+n(change)+'</td></tr>'}).join(""));
    setHTML("deviceRows",d.device.map(row=>'<tr>'+row.map(col=>'<td>'+esc(col)+'</td>').join("")+'</tr>').join(""));
    setHTML("associationList",d.associations.map(name=>{const loc=d.associationMap[name]||{lat:34.5,long:135.8,address:"奈良県"};return '<span class="assocItem"><a href="'+d.sources.S07.url+'" target="_blank" rel="noopener noreferrer">'+esc(name)+'　県医師会一覧</a><small>'+links({name,...loc})+'</small></span>'}).join(""));
    setHTML("officeList",d.officials.map(o=>'<div><a href="'+o.url+'" target="_blank" rel="noopener noreferrer">'+esc(o.name)+'</a> ｜'+esc(o.address)+'<div>'+links(o)+'</div></div>').join(""));
    setHTML("sourceList",Object.entries(d.sources).map(([id,s])=>'<li><a href="'+s.url+'" rel="noopener noreferrer" target="_blank">'+esc(id)+' '+esc(s.name)+'</a> <small>資料年次：'+esc(s.year)+'</small></li>').join(""));
    const selector=$("hospitalFilter");
    if(selector){for(const r of d.regions){const opt=document.createElement("option");opt.value=r.name;opt.textContent=r.name;selector.appendChild(opt)}}
    function drawHospitals(){
      const area=selector?.value||"",q=($("hospitalSearch")?.value||"").trim().toLowerCase();
      const list=d.hospitals.filter(h=>(!area||area===h.area)&&(!q||[h.name,h.area,h.address,h.role].join(" ").toLowerCase().includes(q)));
      setHTML("hospitalRows",list.map(h=>'<tr><th scope="row">'+esc(h.name)+'</th><td>'+esc(h.area)+'</td><td>'+esc(h.role)+'<br><small><a href="'+(d.sources[h.source]?.url||d.sources.S09.url)+'" target="_blank" rel="noopener noreferrer">施設機能出典</a></small></td><td>'+links(h)+'</td></tr>').join("")||'<tr><td colspan="4">該当施設はありません。</td></tr>');
    }
    selector?.addEventListener("change",drawHospitals);
    $("hospitalSearch")?.addEventListener("input",drawHospitals);
    drawHospitals();
  }
  function buildGraphics(){
    setHTML("clinicAreaLegend",d.regions.map(r=>'<div><i style="background:'+regionColors[r.name]+'"></i><span>'+esc(r.name)+'</span><strong>'+n(r.facilityCounts2021.generalClinics)+'</strong></div>').join(""));

    const stack=(id,key,sum)=>setHTML(id,d.regions.map(r=>{
      const value=key==="population"?r.population:r.areaKm2,percent=value/sum*100;
      return '<div class="stackPart" style="width:'+percent.toFixed(3)+'%;background:'+regionColors[r.name]+'" tabindex="0" title="'+esc(r.name)+'：'+percent.toFixed(1)+'%" aria-label="'+esc(r.name)+' '+percent.toFixed(1)+'パーセント">'+(percent>=8?percent.toFixed(0)+"%":"")+'</div>';
    }).join(""));
    stack("populationStack","population",populationSum);
    stack("areaStack","areaKm2",areaSum);
    setHTML("geoLegend",d.regions.map(r=>'<span class="legendEntry"><i style="background:'+regionColors[r.name]+'"></i>'+esc(r.name)+'</span>').join(""));
    const total=d.regions.reduce((sum,r)=>sum+r.total,0);
    const functions=[0,1,2,3].map(i=>d.regions.reduce((sum,r)=>sum+r.beds[i],0));
    const idle=total-functions.reduce((a,b)=>a+b,0);
    const colors=["#285e7f","#e4a15f","#4c9d86","#9b709a","#a6b1bd"];
    const labels=["高度急性期","急性期","回復期","慢性期","休棟等"];
    setHTML("bedDonutLegend",labels.map((l,i)=>'<div><i style="background:'+colors[i]+'"></i><span>'+l+'</span><strong>'+n((functions[i]??idle))+'</strong></div>').join(""));
    // last element is the status outside the four care functions
    const weights=d.scoreAxis;
    setHTML("weightBars",weights.map(a=>'<div class="weightRow"><div class="weightBarLabel"><span>'+esc(a.label)+'</span><span>'+a.weight+'%</span></div><div class="weightBarBase"><div class="weightBarFill" style="width:'+(a.weight/30*100)+'%"></div></div></div>').join(""));
    const iconPaths=[
      '<rect x="8" y="12" width="40" height="29" rx="5"/><path d="M14 47h28M22 41v6m12-6v6"/><path d="m13 30 8-10 7 14 7-12 8 8"/>',
      '<circle cx="27" cy="26" r="17"/><circle cx="27" cy="26" r="9"/><path d="M44 37h6v12H10V37"/>',
      '<rect x="7" y="8" width="43" height="40" rx="4"/><circle cx="29" cy="26" r="14"/><circle cx="29" cy="26" r="7"/>',
      '<path d="M15 13h28v32H15zM22 21h14m-7-7v14"/><circle cx="29" cy="35" r="5"/>',
      '<circle cx="28" cy="28" r="19"/><path d="M28 13v30M13 28h30M18 18l20 20M38 18 18 38"/>',
      '<path d="M6 44h45M28 44V10M18 10h21l-5 15H22z"/><path d="M14 44V31h27"/>',
      '<path d="M10 46h36M18 46V12h23v34"/><path d="M26 21h8M26 28h8M26 35h8"/>',
      '<path d="M5 34h11l5-12 9 23 5-12h16"/><path d="M5 11h46v38H5"/>',
      '<rect x="9" y="8" width="38" height="41" rx="5"/><path d="M18 17h20M18 24h20M18 31h13M20 39h15"/>'
    ];
    setHTML("deviceVisualGrid",d.device.map((row,i)=>'<article class="deviceTile"><svg viewBox="0 0 56 56" role="img" aria-label="医療機器のアイコン">'+iconPaths[i]+'</svg><div><strong>'+esc(row[0])+'</strong><small>'+esc(row[1])+'</small></div></article>').join(""));
    return {total,functions,idle,colors,labels};
  }
  function renderCharts(care){
    const ids=["facilityMixChart","clinicAreaDonutChart","associationCountChart","associationAreaChart","migrationChart","agingChart","populationChart","bedsChart","priorityChart","doctorChart","doctorPrefChart","ageCompositionChart","densityChart","bedDonutChart","opportunityBubbleChart"];
    if(!window.Chart){for(const id of ids){const el=$(id);if(el)el.insertAdjacentHTML("afterend",'<p class="vizFoot">グラフを表示できません。付近の数値・比較表をご利用ください。</p>')}return}
    Chart.defaults.font.family='"Meiryo UI",system-ui,sans-serif';
    Chart.defaults.font.size=11;
    Chart.defaults.color="#3c5667";
    const common={responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{position:"bottom"}}};
    function graph(id,type,labels,datasets,overrides={}){
      const el=$(id);if(!el)return;
      try{new Chart(el,{type,data:{labels,datasets},options:{...common,...overrides}})}
      catch(e){console.error("Chart "+id,e);el.insertAdjacentHTML("afterend",'<p class="vizFoot">グラフを表示できません。下記のテキストまたは表を参照してください。</p>')}
    }
    
    graph("facilityMixChart","bar",regionOrder,["一般診療所","歯科診療所","病院"].map((name,i)=>({label:name,data:d.regions.map(r=>i===0?r.facilityCounts2021.generalClinics:i===1?r.facilityCounts2021.dentalClinics:r.facilityCounts2021.hospitals),backgroundColor:["#15858a","#e0a365","#5b88b0"][i]})),{scales:{x:{stacked:true},y:{stacked:true}},plugins:{legend:{position:"bottom"}}});
    graph("clinicAreaDonutChart","doughnut",regionOrder,[{data:d.regions.map(r=>r.facilityCounts2021.generalClinics),backgroundColor:d.regions.map(r=>regionColors[r.name]),borderWidth:0,hoverOffset:4}],{cutout:"75%",plugins:{legend:{display:false}}});
    const namedAssociations=d.associationDetails.filter(a=>Number.isFinite(a.clinicMembers)).sort((a,b)=>b.clinicMembers-a.clinicMembers);
    graph("associationCountChart","bar",namedAssociations.map(a=>a.name.replace("地区医師会","医師会")),[{label:"会員診療所（施設）",data:namedAssociations.map(a=>a.clinicMembers),backgroundColor:"#277f91"}],{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{min:0}}});
    graph("associationAreaChart","bar",regionOrder,[{label:"会員診療所（2023年）",data:d.regions.map(r=>r.memberClinicCount2023),backgroundColor:d.regions.map(r=>regionColors[r.name])}],{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{min:0}}});

    graph("migrationChart","bar",["自然増減","社会増減","年間人口増減"],[{label:"人",data:[d.statistics.natural,d.statistics.social,d.statistics.yearlydecline],backgroundColor:["#cc6c68","#2c9d8d","#b45d53"]}],{indexAxis:"y",plugins:{legend:{display:false}}});
    graph("agingChart","bar",["奈良県","全国"],[{label:"65歳以上人口割合（％）",data:[d.statistics.age65rate,d.statistics.nationalAge65],backgroundColor:["#148686","#97b7c6"]}],{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{min:0,max:40}}});
    graph("ageCompositionChart","doughnut",["65歳以上","65歳未満"],[{data:[d.statistics.age65,d.statistics.population2025-d.statistics.age65],backgroundColor:["#13898b","#dbe7ed"],borderWidth:0,hoverOffset:3}],{cutout:"76%",plugins:{legend:{display:false}}});
    graph("densityChart","bar",[...d.regions].sort((a,b)=>b.populationDensity-a.populationDensity).map(x=>x.name),[{label:"人 / km²",data:[...d.regions].sort((a,b)=>b.populationDensity-a.populationDensity).map(x=>x.populationDensity),backgroundColor:[...d.regions].sort((a,b)=>b.populationDensity-a.populationDensity).map(x=>regionColors[x.name])}],{indexAxis:"y",plugins:{legend:{display:false}}});
    graph("populationChart","bar",d.regions.map(x=>x.name),[{label:"2020年人口（人）",data:d.regions.map(x=>x.population),backgroundColor:d.regions.map(x=>regionColors[x.name])}],{plugins:{legend:{display:false}}});
    graph("bedsChart","bar",regionOrder,["高度急性期","急性期","回復期","慢性期"].map((name,i)=>({label:name,data:d.regions.map(r=>r.beds[i]),backgroundColor:care.colors[i]})),{scales:{x:{stacked:true},y:{stacked:true}}});
    graph("bedDonutChart","doughnut",care.labels,[{data:[...care.functions,care.idle],backgroundColor:care.colors,borderWidth:0,hoverOffset:2}],{cutout:"75%",plugins:{legend:{display:false}}});
    const sorted=[...d.regions].sort((a,b)=>score(b)-score(a));
    graph("priorityChart","bar",sorted.map(x=>x.name),[{label:"独自優先度スコア",data:sorted.map(score),backgroundColor:sorted.map(x=>regionColors[x.name])}],{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{min:0,max:100}}});
    graph("doctorChart","bar",regionOrder,[{label:"2026年公表・医師偏在指標",data:regionOrder.map(name=>d.doctorIndexRegions[name]),backgroundColor:regionOrder.map(name=>regionColors[name])}],{plugins:{legend:{display:false}},scales:{y:{min:0,max:370}}});
    graph("doctorPrefChart","bar",d.doctorIndexPref.map(x=>x[0]),[{label:"医師偏在指標",data:d.doctorIndexPref.map(x=>x[1]),backgroundColor:d.doctorIndexPref.map(x=>x[0]==="奈良県"?"#c98c47":"#6c9eb0")}],{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{min:0,max:380}}});
    const bubbles=d.regions.map(x=>({label:x.name,data:[{x:x.populationDensity,y:d.doctorIndexRegions[x.name],r:Math.sqrt(x.population/Math.max(...d.regions.map(k=>k.population)))*22}],backgroundColor:regionColors[x.name]+"bb",borderColor:regionColors[x.name],borderWidth:2}));
    graph("opportunityBubbleChart","bubble",[],bubbles,{plugins:{legend:{position:"bottom",labels:{boxWidth:12}},tooltip:{callbacks:{label:context=>{const reg=d.regions.find(x=>x.name===context.dataset.label);return context.dataset.label+"：人口密度 "+n(reg.populationDensity)+"人/km²、偏在指標 "+context.raw.y+"、人口 "+n(reg.population)+"人"}}}},scales:{x:{type:"logarithmic",min:15,max:4000,title:{display:true,text:"人口密度（人/km²、対数）"}},y:{min:180,max:360,title:{display:true,text:"医師偏在指標 2026"}}}});
  }
  function renderMap(){
    const el=$("map");if(!el)return;
    if(!window.L){el.innerHTML='<p class="note">地図ライブラリを読み込めません。各施設のGoogleマップ・地理院地図リンクをご利用ください。</p>';return}
    try{
      const map=L.map(el,{scrollWheelZoom:false,zoomControl:true}).setView([34.52,135.8],9);
      L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",{maxZoom:18,minZoom:6,attribution:'地理院タイル © <a href="https://maps.gsi.go.jp/" target="_blank" rel="noopener noreferrer">国土地理院</a>'}).addTo(map);
      const hospitalLayer=L.layerGroup().addTo(map);
      const publicLayer=L.layerGroup().addTo(map);
      const regionLayer=L.layerGroup().addTo(map);
      const popup=p=>'<strong>'+esc(p.name)+'</strong><div>'+esc(p.address||"医療圏の参考中心点")+'</div>'+links(p);
      for(const p of d.hospitals){L.circleMarker([p.lat,p.long],{radius:7,color:"#fff",weight:2,fillColor:"#217c9b",fillOpacity:.93}).bindPopup(popup(p)).addTo(hospitalLayer)}
      for(const p of d.officials){L.circleMarker([p.lat,p.long],{radius:6,color:"#fff",weight:2,fillColor:"#e08a5b",fillOpacity:.94}).bindPopup(popup(p)).addTo(publicLayer)}
      for(const r of d.regions){const p={name:r.name+"医療圏・参考点",address:"正確な行政界を示すものではありません",lat:r.center[0],long:r.center[1]};L.circleMarker(r.center,{radius:11,weight:2,color:regionColors[r.name],fillColor:regionColors[r.name],fillOpacity:.26,dashArray:"4 3"}).bindPopup(popup(p)+'<p><a href="'+d.sources.S24.url+'" target="_blank" rel="noopener noreferrer">県公式の医療圏図</a></p>').addTo(regionLayer)}
      for(const [id,layer] of [["layerHospitals",hospitalLayer],["layerOfficials",publicLayer],["layerRegions",regionLayer]])$(id)?.addEventListener("change",e=>{if(e.target.checked)layer.addTo(map);else map.removeLayer(layer)});
      const bounds=L.latLngBounds([[33.76,135.51],[34.81,136.20]]);
      $("fitNaraMap")?.addEventListener("click",()=>map.fitBounds(bounds,{padding:[18,18]}));
      setTimeout(()=>map.invalidateSize(),140);
    }catch(e){console.error("Nara map render failed",e);el.innerHTML='<p class="note">地図を表示できません。施設別のGoogleマップ・地理院地図リンクをご利用ください。</p>'}
  }
  bootTables(); const care=buildGraphics(); renderCharts(care);renderMap();
})();
