
'use strict';
/* The page is complete without JS. This adds search, interactive charts and map. */
(()=>{
  const one=s=>document.querySelector(s);
  const all=s=>Array.from(document.querySelectorAll(s));
  const score=r=>r.score.reduce((sum,n,i)=>sum+n*[.30,.25,.20,.15,.10][i],0);
  const mapLink=(name,place)=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(name+' '+place);

  function search(){
    const input=one('#facilitySearch'),button=one('#clearFacilitySearch'),count=one('#facilityCount');
    if(!input)return;
    const rows=all('#facilityTable tbody tr');
    const normalize=s=>String(s).normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
    function update(){
      const q=normalize(input.value);let n=0;
      for(const row of rows){
        const keep=!q||normalize(row.textContent).includes(q);
        row.hidden=!keep;if(keep)n++;
      }
      if(count)count.textContent=q?n+'件 / 全'+rows.length+'件':'全'+rows.length+'件';
      if(button)button.disabled=!q;
      const empty=one('#facilityEmpty');
      if(empty)empty.hidden=n!==0;
    }
    input.addEventListener('input',update);
    if(button)button.addEventListener('click',()=>{input.value='';update();input.focus()});
    update();
  }
  function plot(id,type,labels,datasets,opts={}){
    const canvas=one('#'+id);
    if(!canvas||!window.Chart)return;
    const fallback=canvas.parentElement.querySelector('.chart-fallback');
    const axis=opts.indexAxis||'x';
    const scaleX={beginAtZero:axis==='y',stacked:!!opts.stacked,grid:{color:'#e8eef4'},ticks:{maxRotation:0,autoSkip:false,font:{size:11}}};
    const scaleY={beginAtZero:axis==='x',stacked:!!opts.stacked,grid:{color:'#e8eef4'},ticks:{autoSkip:false,font:{size:11}}};
    if(opts.max!==undefined)scaleX.max=opts.max;
    if(opts.min!==undefined)scaleY.min=opts.min;
    if(opts.ymax!==undefined)scaleY.max=opts.ymax;
    try{
      canvas.hidden=false;
      new window.Chart(canvas.getContext('2d'),{
        type,data:{labels,datasets},
        options:{
          responsive:true,maintainAspectRatio:false,animation:false,indexAxis:axis,
          plugins:{legend:{display:datasets.length>1,position:'bottom',labels:{boxWidth:12}},tooltip:{mode:'index',intersect:false}},
          scales:{x:scaleX,y:scaleY},
          layout:{padding:{top:8,right:12,bottom:2,left:0}}
        }
      });
      if(fallback)fallback.hidden=true;
    }catch(err){
      canvas.hidden=true;
      if(fallback)fallback.hidden=false;
      console.warn('Using accessible SVG instead of canvas chart',id,err);
    }
  }
  function charts(d){
    if(!window.Chart)return;
    plot('populationChart','line',d.population.map(x=>x.year.slice(0,4)),[
      {label:'人口（万人）',data:d.population.map(x=>+(x.n/1e4).toFixed(2)),
       borderColor:'#0d6a8d',backgroundColor:'#0d6a8d24',fill:true,tension:.2,pointRadius:4,borderWidth:3}
    ],{min:85,ymax:140});
    plot('bedsChart','bar',d.regions.map(x=>x.name),
      ['高度急性期','急性期','回復期','慢性期'].map((name,i)=>({
        label:name,data:d.regions.map(r=>r.beds[i]),backgroundColor:['#13759a','#19a4b2','#e6a43f','#766fbd'][i]
      })),{indexAxis:'y',stacked:true});
    const cs=d.additionalEvidence?.clinic2023?.cities||{};
    plot('clinicDistributionChart','bar',Object.keys(cs),[
      {label:'一般診療所（2023年）',data:Object.values(cs),backgroundColor:'#0e7896'}
    ],{indexAxis:'y'});
    plot('scoresChart','bar',d.regions.map(x=>x.name),[
      {label:'独自優先度 / 5',data:d.regions.map(score),backgroundColor:'#0b8189'}
    ],{indexAxis:'y',max:5});
  }
  function map(d){
    const el=one('#map');
    if(!el||!window.L||!d.regions?.length)return;
    const backup=el.innerHTML;
    let instance=null,failures=0,restored=false;
    function restore(){
      if(restored)return;restored=true;
      try{instance?.remove()}catch(_e){}
      el.innerHTML=backup;
      el.classList.add('map-in-fallback');
    }
    try{
      el.replaceChildren();
      instance=window.L.map(el,{scrollWheelZoom:false}).setView([33.69,132.94],8);
      window.L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{
        maxZoom:18,attribution:'国土地理院「地理院タイル」'
      }).on('tileerror',()=>{if(++failures>=8)restore()}).addTo(instance);
      for(const r of d.regions){
        const popup=document.createElement('div'),strong=document.createElement('strong');
        strong.textContent=r.name;
        const p=document.createElement('p');p.textContent=r.towns+'｜圏域代表地点（施設の位置ではありません）';
        const a=document.createElement('a');a.href=mapLink(r.name+' 愛媛県',r.towns);
        a.target='_blank';a.rel='noopener noreferrer';a.textContent='Googleマップで確認 ↗';
        popup.append(strong,p,a);
        window.L.circleMarker(r.city,{radius:9,weight:2,color:'#104666',fillColor:'#14a4b5',fillOpacity:.94})
          .addTo(instance).bindPopup(popup);
      }
      requestAnimationFrame(()=>instance.invalidateSize());
    }catch(err){console.warn('Showing map links instead of Leaflet',err);restore()}
  }
  function navigation(){
    const nav=all('.toc a[href^="#"]'),section=nav.map(a=>one(a.getAttribute('href'))).filter(Boolean);
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver(entries=>{
        const found=entries.filter(x=>x.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
        if(!found)return;
        nav.forEach(a=>{
          if(a.hash==='#'+found.target.id)a.setAttribute('aria-current','location');
          else a.removeAttribute('aria-current');
        });
      },{rootMargin:'-100px 0px -60% 0px'});
      section.forEach(el=>io.observe(el));
    }
    const progress=one('#readingProgress'),up=one('#backToTop');
    let scheduled=false;
    function update(){
      const root=document.documentElement,max=Math.max(1,root.scrollHeight-root.clientHeight);
      if(progress)progress.style.width=Math.min(100,Math.max(0,window.scrollY/max*100))+'%';
      if(up)up.hidden=window.scrollY<650;
      scheduled=false;
    }
    window.addEventListener('scroll',()=>{
      if(!scheduled){scheduled=true;requestAnimationFrame(update)}
    },{passive:true});
    window.addEventListener('resize',update,{passive:true});
    up?.addEventListener('click',()=>window.scrollTo({
      top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'
    }));
    update();
  }
  function boot(){
    search();navigation();
    try{
      const d=JSON.parse(one('#ehime-embedded-data').textContent);
      if(!Array.isArray(d.regions)||!Array.isArray(d.sources))return;
      charts(d);map(d);
    }catch(err){console.warn('Using static content; interactive data not available',err)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
