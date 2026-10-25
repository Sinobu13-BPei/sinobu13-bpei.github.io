/* Public research extensions; safe fallback when CDN resources are unavailable. */
(()=>{
 const d=window.YAMAGUCHI_EXTRA,el=id=>document.getElementById(id);
 if(!d)return;
 const gmap=p=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(p.name+" "+p.address);
 const gsi=p=>"https://maps.gsi.go.jp/#15/"+p.lat+"/"+p.lng+"/";
 const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const devices=d.devices.map(x=>({name:x[0],total:x[1],pref:x[2],national:x[3],hospital:x[4],clinic:x[5]}));
 const totals=d.ratings.map(x=>({name:x[0],total:Math.round(x[1].reduce((sum,v,i)=>sum+v*d.axis[i][1]/5,0)),detail:x[2]})).sort((a,b)=>b.total-a.total);
 if(el("deviceEvidence")){
  el("deviceEvidence").innerHTML='<thead><tr><th>機器</th><th>保有台数</th><th>人口10万人当たり 山口県</th><th>全国</th><th>病院</th><th>診療所</th></tr></thead><tbody>'+
  devices.map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+x.total+'</td><td>'+x.pref+'</td><td>'+x.national+'</td><td>'+x.hospital+'</td><td>'+x.clinic+'</td></tr>').join('')+'</tbody>';
 }
 if(el("comparisonEvidence")){
  el("comparisonEvidence").innerHTML='<thead><tr><th>地域</th><th>2020年人口</th><th>比較上の着眼点（編集分析）</th></tr></thead><tbody>'+
   d.compare.map(x=>'<tr><td>'+esc(x[0])+'</td><td>'+Number(x[1]).toLocaleString("ja-JP")+'</td><td>'+esc(x[2])+'</td></tr>').join('')+'</tbody>';
 }
 if(el("scoreEvidence")){
  el("scoreEvidence").innerHTML='<thead><tr><th>優先順位</th><th>二次医療圏</th><th>参考スコア</th><th>論点</th></tr></thead><tbody>'+
   totals.map((x,i)=>'<tr><td>'+(i+1)+'</td><td><b>'+esc(x.name)+'</b></td><td>'+x.total+'/100</td><td>'+esc(x.detail)+'</td></tr>').join('')+'</tbody>';
 }
 if(el("scoreWeights"))el("scoreWeights").textContent=d.axis.map(x=>x[0]+" "+x[1]+"%").join(" / ");
 if(el("facilitiesMapList")){
  const wrap=el("facilitiesMapList");
  wrap.innerHTML=d.mapCenters.map(p=>'<tr><td><b>'+esc(p.name)+'</b></td><td>'+esc(p.category)+'</td><td>'+esc(p.address)+'</td><td><div class="linkgroup"><a target="_blank" rel="noopener noreferrer" href="'+gmap(p)+'">Googleマップ</a><a target="_blank" rel="noopener noreferrer" href="'+gsi(p)+'">地理院地図</a></div></td></tr>').join("");
 }
 if(typeof window.Chart!=="undefined"){
  const base=(canvasId,labels,series)=>{
   const target=el(canvasId);if(!target)return;
   const chart=new Chart(target,{type:"bar",data:{labels,datasets:series},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}},scales:{y:{beginAtZero:true}},layout:{padding:6}}});
  };
  base("deviceCompareChart",devices.map(x=>x.name),[
    {label:"山口県",data:devices.map(x=>x.pref),backgroundColor:"#2e7fa9"},
    {label:"全国",data:devices.map(x=>x.national),backgroundColor:"#d69d47"}
  ]);
  base("priorityChart",totals.map(x=>x.name),[
    {label:"独自評価スコア（100点満点）",data:totals.map(x=>x.total),backgroundColor:"#318a92"}
  ]);
 } else {
  ["deviceCompareChart","priorityChart"].forEach(id=>{const x=el(id);if(x)x.outerHTML="<p class='reportNote'>グラフライブラリが利用できません。下の比較表をご利用ください。</p>";});
 }
 const mp=el("medicalMap");
 if(mp){
  if(typeof window.L==="undefined"){
   mp.innerHTML="<p class='reportNote' style='padding:20px'>地図ライブラリを読み込めませんでした。下の施設別 Googleマップ・国土地理院リンクから確認できます。</p>";
  }else{
   try{
    const map=L.map("medicalMap",{scrollWheelZoom:false}).setView([34.18,131.45],8);
    L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",{
      minZoom:4,maxZoom:17,attribution:'<a href="https://maps.gsi.go.jp/" target="_blank" rel="noopener noreferrer">地理院タイル</a>'
    }).addTo(map);
    d.mapCenters.forEach(p=>{
     const col=p.category==="保健所"?"#168d91":p.category==="行政"?"#cb8a36":p.category==="医師会"?"#a26aaf":"#1f6599";
     const circle=L.circleMarker([p.lat,p.lng],{radius:6,color:"#fff",weight:1.5,fillColor:col,fillOpacity:.85}).addTo(map);
     const pop='<strong>'+esc(p.name)+'</strong><div>'+esc(p.address)+'</div><p style="font-size:11px">位置は概略値。訪問前に住所をご確認ください。</p><a href="'+gmap(p)+'" target="_blank" rel="noopener noreferrer">Googleマップ</a> / <a href="'+gsi(p)+'" target="_blank" rel="noopener noreferrer">地理院地図</a>';
     circle.bindPopup(pop);
    });
   }catch(e){
    mp.innerHTML='<p class="reportNote" style="padding:20px">地図の描画に失敗しました。下の施設別リンクをご利用ください。</p>';
   }
  }
 }
})();
