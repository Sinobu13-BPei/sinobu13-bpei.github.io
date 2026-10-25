"use strict";
(function () {
  const data=window.KANAGAWA_STRATEGY;
  if(!data){console.warn("Kanagawa strategic data unavailable");return;}
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const link=(url,label)=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(label)+'</a>';
  const source=Object.fromEntries(data.sources.map(x=>[x.id,x]));
  function ref(ids) {return String(ids).split(",").map(x=>source[x.trim()]).filter(Boolean).map(x=>'<a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer" class="sc-cite" title="'+esc(x.name)+'">'+esc(x.id)+'</a>').join(" ")}
  const pills=x=>x.map(s=>'<span class="sc-pill">'+esc(s)+'</span>').join("");
  function modesRender(){
    const target=$("strategy-mode-table");
    if(target)target.innerHTML=data.modes.map(m=>'<tr><th scope="row">'+esc(m.name)+'</th><td>'+esc(m.demand)+'</td><td>'+esc(m.customer)+'</td><td>'+esc(m.constraints)+'</td><td><span class="sc-unverified">県内台数：未検証</span></td><td>'+ref(m.source)+'</td></tr>').join("");
    const select=$("strategy-mode-select");
    if(select){select.innerHTML=data.modes.map(m=>'<option value="'+esc(m.id)+'">'+esc(m.name)+'</option>').join("");select.addEventListener("change",showMode);showMode();}
  }
  function showMode(){
    const m=data.modes.find(x=>x.id=== $("strategy-mode-select")?.value)||data.modes[0];
    const t=$("strategy-mode-detail");if(!t||!m)return;
    t.innerHTML='<h3>'+esc(m.name)+'</h3><p><b>需要の観測軸：</b>'+esc(m.demand)+'</p><p><b>主な施設類型：</b>'+esc(m.customer)+'</p><p><b>導入・運用制約：</b>'+esc(m.constraints)+'</p><p><b>商社が集めるべき情報：</b>'+esc(m.verification)+'</p><p class="sc-unverified"><b>県内機器台数／人口当たり：</b>統一基準の抽出が未完了のため未掲載</p><p class="sc-small">一次資料：'+ref(m.source)+'</p>';
  }
  function areaRender(){
    const sel=$("strategy-area-select");
    if(!sel)return;sel.innerHTML=data.area.map(a=>'<option value="'+esc(a.area)+'">'+esc(a.area)+'</option>').join("");
    sel.addEventListener("change",showArea);showArea();
    const body=$("strategy-area-rows");
    if(body)body.innerHTML=data.area.map(a=>'<tr><th scope="row">'+esc(a.area)+'</th><td>'+esc(a.demand)+'</td><td>'+esc(a.where)+'</td><td>'+esc(a.how)+'</td><td>'+esc(a.risk)+'</td></tr>').join("");
  }
  function showArea(){
    let a=data.area.find(x=>x.area===$("strategy-area-select")?.value)||data.area[0],t=$("strategy-area-insight");if(!t)return;
    t.innerHTML='<div class="sc-side"><div><span class="sc-kicker">WHERE TO PLAY</span><h3>'+esc(a.area)+'｜どこで戦うか</h3><p>'+esc(a.where)+'</p><p class="sc-small">需要ドライバー：'+esc(a.demand)+'</p></div><div><span class="sc-kicker">HOW TO WIN</span><h3>どの価値で選ばれるか</h3><p>'+esc(a.how)+'</p><p class="sc-small">反証・不確実性：'+esc(a.risk)+'</p></div></div><div class="sc-pills">'+pills(a.modalities)+'</div>';
  }
  function frameworksRender(){
    const root=$("strategy-framework-list");if(!root)return;
    root.innerHTML=data.frameworks.map((f,i)=>'<details class="sc-framework" '+(i===0?'open':'')+'><summary><span class="sc-count">0'+(i+1)+'</span><strong>'+esc(f.code)+'</strong><span>'+esc(f.name)+'</span><span class="sc-summary">分析・反証・出典を表示</span></summary><div class="sc-table-wrap"><table><thead><tr><th>軸</th><th>地域の事実・観測</th><th>中立的商社の示唆</th><th>反対論・リスク</th><th>出典</th></tr></thead><tbody>'+f.rows.map(v=>'<tr><th scope="row">'+esc(v[0])+'</th><td>'+esc(v[1])+'</td><td>'+esc(v[2])+'</td><td>'+esc(v[3])+'</td><td>'+ref(v[4])+'</td></tr>').join("")+'</tbody></table></div></details>').join("");
    const chartRoot=$("strategy-process");if(chartRoot){
      const name=data.frameworks.map(x=>x.code).concat("KSF");
      chartRoot.innerHTML=name.map((v,i)=>'<div class="sc-step"><span>'+("0"+(i+1)).slice(-2)+'</span><strong>'+esc(v)+'</strong><small>'+esc(["外部要因","顧客/競争/商社","顧客選択","提供設計","顧客価値","能力検証","業界構造","成功条件"][i])+'</small></div>').join("");
    }
  }
  function ksfRender(){
    const root=$("strategy-ksf");if(!root)return;
    root.innerHTML=data.ksf.map(k=>'<article class="sc-ksf"><div class="sc-knum">'+esc(k.id)+'</div><div><h3>'+esc(k.name)+'</h3><p>'+esc(k.initiative)+'</p><p><b>検証KPI：</b>'+esc(k.kpi)+'</p><p class="sc-small"><b>制約：</b>'+esc(k.caveat)+'</p></div></article>').join("");
  }
  function sourceRender(){
    const root=$("strategy-source-rows");if(!root)return;
    root.innerHTML=data.sources.map(s=>'<tr><th>'+esc(s.id)+'</th><td>'+link(s.url,s.name)+'</td><td>'+esc(s.year)+'</td><td>'+esc(s.type)+'</td></tr>').join("");
    const tag=$("strategy-asof");if(tag)tag.textContent=data.metadata.asOf;
  }
  function compareModes(){
    const body=$("strategy-market-by-area");if(!body)return;
    const groups={"横浜":[5,5,4,4],"川崎北部":[4,3,4,3],"川崎南部":[5,4,4,4],"相模原":[4,4,4,5],"横須賀・三浦":[4,3,4,5],"湘南東部":[4,3,5,3],"湘南西部":[4,5,3,4],"県央":[4,4,4,5],"県西":[3,2,3,5]};
    const head=["急性期・高度医療","大学・専門検査","外来・診療所","医療継続/物流"];
    body.innerHTML=Object.entries(groups).map(([name,vals])=>'<tr><th>'+esc(name)+'</th>'+vals.map((v,i)=>'<td><div class="sc-heat lv'+v+'" title="'+esc(head[i])+'：独自定性仮説 '+v+'/5">'+v+'/5</div></td>').join("")+'</tr>').join("");
    const labels=$("strategy-market-labels");if(labels)labels.textContent=head.join(" / ");
  }
  function updateResponsiveTableAccess(){
    document.querySelectorAll(".sc-table-wrap").forEach(el=>{el.tabIndex=0;el.setAttribute("role","region");el.setAttribute("aria-label","左右スクロールできる比較表")});
  }
  modesRender();areaRender();frameworksRender();ksfRender();sourceRender();compareModes();updateResponsiveTableAccess();
})();