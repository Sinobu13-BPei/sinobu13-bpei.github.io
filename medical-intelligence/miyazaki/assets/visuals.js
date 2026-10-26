
/* Visual Intelligence 2026 — data-derived, public-source and clearly marked analytical diagrams. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const num = n => Math.round(n).toLocaleString('ja-JP');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const view = (id, markup) => { const node = $(id); if (node) node.innerHTML = markup; };
  const total = arr => arr.reduce((a,b)=>a+b,0);
  const svg = paths => '<svg viewBox="0 0 48 48" role="presentation" focusable="false" aria-hidden="true">' + paths + '</svg>';
  const icons = {
    hospital: '<rect x="7" y="14" width="34" height="28" rx="2"/><path d="M18 14V7h12v7M22 7v-4m4 4v-4M13 23h7m8 0h7M13 30h7m8 0h7M21 42V35h6v7"/>',
    person:'<circle cx="24" cy="9" r="6"/><path d="M14 45l2-19-7-4 3-6h24l3 6-7 4 2 19M20 26v19m8-19v19"/>',
    clinic:'<path d="M7 43V18L24 7l17 11v25H7Z"/><path d="M20 43V31h8v12M17 22h14M24 15v14"/>',
    ct:'<rect x="6" y="5" width="34" height="38" rx="6"/><circle cx="23" cy="22" r="12"/><circle cx="23" cy="22" r="4"/><path d="M12 37h23M17 43h20"/>',
    mri:'<rect x="4" y="6" width="40" height="36" rx="7"/><circle cx="24" cy="23" r="13"/><circle cx="24" cy="23" r="8"/><path d="M24 15v16M16 23h16"/>',
    us:'<path d="M9 9h30v22H9zM14 34h20M24 31v3M13 23l6-5 6 7 7-11"/><path d="M38 36q6 0 5 5l-2 4"/>',
    pet:'<circle cx="23" cy="22" r="16"/><path d="M23 3v38M4 22h38M12 10l22 23M34 10 12 33"/>',
    ivr:'<path d="M8 34h30M12 34V14h24M36 14v20M12 25c9-14 15 5 24-5"/><path d="M18 9h12M24 4v10"/>',
    endo:'<path d="M8 8h12v9H8zM14 17v7q0 6 8 6h7q7 0 7 6t-6 8"/><circle cx="31" cy="43" r="3"/>',
    dial:'<rect x="7" y="8" width="24" height="32" rx="3"/><path d="M13 15h12v8H13zM14 31h10m-5-8v8M31 22h6v15q0 6 7 5"/><circle cx="19" cy="34" r="2"/>',
    monitor:'<rect x="5" y="9" width="38" height="27" rx="4"/><path d="M10 23h7l4-7 6 13 4-6h7M17 43h14M24 36v7"/>',
    security:'<path d="M24 4 40 11v12q0 14-16 21Q8 37 8 23V11zM17 24l5 5 10-11"/>',
    power:'<path d="M29 3 10 28h13l-3 17 18-26H26z"/>',
    cloud:'<path d="M13 36h24q8-3 6-12-2-7-10-7Q30 8 21 11q-7 2-8 10-9 0-9 8 0 7 9 7z"/>',
    truck:'<path d="M4 10h24v25H4zM28 19h8l8 10v6H28z"/><circle cx="12" cy="36" r="4"/><circle cx="37" cy="36" r="4"/>',
    heart:'<path d="M24 41 7 24Q-1 9 13 6q7-1 11 6 4-7 11-6 14 3 6 18Z"/>',
    clipboard:'<rect x="11" y="9" width="27" height="34" rx="3"/><path d="M18 5h13v8H18zM17 22l3 3 5-6M17 33h14"/>'
  };
  const icon = name => svg(icons[name] || icons.clinic);
  const score = (a, data) => a.score.reduce((s,x,i) => s + x * data.scoring.weights[i] / 5,0);
  function renderHero(){
    view('visual-hero','<div class="v-band"><div class="v-head"><div><div class="v-tag" style="color:#a2e9e7">VISUAL OVERVIEW / MARKET LOGIC</div><h3>宮崎県の医療需要から機器市場へ</h3><p style="color:#e2f4f4">人口動態・医療提供体制・機器配置を一本の流れで読み解く概念図（計測値ではありません）</p></div></div>'+
      '<svg class="v-svg" viewBox="0 0 1000 168" aria-labelledby="v-hero-title" role="img" style="width:100%"><title id="v-hero-title">人口構造から臨床需要と医療機能を経由して画像診断・医療IT・保守へ至る分析フロー</title>'+
      '<g fill="none" stroke="#9ddfe4" stroke-width="3" opacity=".8"><path d="M177 83H255"/><path d="M422 83H500"/><path d="M670 83H750"/></g>'+
      '<g fill="#e4fbfa"><path d="m240 76 13 7-13 7Z"/><path d="m484 76 13 7-13 7Z"/><path d="m734 76 13 7-13 7Z"/></g>'+
      '<g font-family="Noto Sans JP, sans-serif" text-anchor="middle"><rect x="8" y="15" width="170" height="131" rx="15" fill="#1b6070"/><text x="93" y="55" font-size="26" fill="#c6f4f0">①</text><text x="93" y="86" font-size="19" font-weight="800" fill="#fff">人口・高齢化</text><text x="93" y="109" font-size="12" fill="#deeff0">受療・移動・通院</text>'+
      '<rect x="255" y="15" width="169" height="131" rx="15" fill="#1b6070"/><text x="339" y="55" font-size="26" fill="#c6f4f0">②</text><text x="339" y="86" font-size="19" font-weight="800" fill="#fff">疾患・検査需要</text><text x="339" y="109" font-size="12" fill="#deeff0">救急・がん・慢性疾患</text>'+
      '<rect x="500" y="15" width="171" height="131" rx="15" fill="#1b6070"/><text x="585" y="55" font-size="26" fill="#c6f4f0">③</text><text x="585" y="86" font-size="19" font-weight="800" fill="#fff">医療機能の分化</text><text x="585" y="109" font-size="12" fill="#deeff0">病院・診療所・在宅</text>'+
      '<rect x="749" y="15" width="244" height="131" rx="15" fill="#e5f4ee"/><text x="871" y="55" font-size="26" fill="#0c7880">④</text><text x="871" y="86" font-size="19" font-weight="800" fill="#105c65">機器・IT・保守</text><text x="871" y="109" font-size="12" fill="#386f78">配置合理性・共同利用・BCP</text></g></svg>'+
      '<p class="v-note" style="color:#e5f4f4">出典：宮崎県第8次医療計画（2024年）。因果構造は公開情報に基づく独自分析。</p></div>');
  }
  function renderAging(data) {
    const iconPerson = '<svg viewBox="0 0 12 22" aria-hidden="true"><circle cx="6" cy="3" r="2.3" fill="currentColor"/><path d="M4 8h4l1 6H7.5v7h-3v-7H3z" fill="currentColor"/></svg>';
    const card = (label,percentage,source) => {
      const list = Array.from({length:100}, (_,i)=>'<span class="' + (i<Math.round(percentage)?'senior':'other') + '">' + iconPerson + '</span>').join('');
      return '<div class="v-panel"><div class="v-tag">'+esc(label)+'</div><div class="v-small-stat">'+percentage.toFixed(1)+'%</div><div class="v-humanfield" aria-hidden="true">'+list+'</div><p class="v-tiny">100人のピクトグラムを四捨五入で表示（高齢者：色付き）</p><p class="v-note">'+esc(source)+'</p></div>';
    };
    view('visual-age','<div class="v-head"><div><div class="v-tag">DEMOGRAPHY / HUMAN ICON CHART</div><h3>100人のピクトグラムで見る高齢化率</h3><p>高齢化率は異なる地域間でも同一年で比較。人口の実数と混同しません。</p></div></div><div class="v-agecompare">'+
      card('宮崎県 / 2025',data.population.aging2025,'出典：宮崎県 2025年高齢化率')+
      card('全国 / 2025',data.population.agingNational2025,'出典：内閣府 令和8年版高齢社会白書')+
      '</div>');
  }
  function renderBeds(data){
    const shades=['#22788a','#e29359','#65aaa2','#8297bd','#cbd6dd'];
    const labels=['高度急性期','急性期','回復期','慢性期','休棟等'];
    const legend = labels.map((x,i)=>'<span class="v-key"><b class="v-dot" style="background:'+shades[i]+'"></b>'+x+'</span>').join('');
    const rows = data.areas.map(a=>{
      const all=total(a.beds);
      return '<div><div class="v-stack-label"><b>'+esc(a.name)+'</b><span>'+num(all)+' 床（2024年）</span></div><div class="v-bar" role="img" aria-label="'+esc(a.name)+'の2024年病床機能構成：'+labels.map((n,i)=>n+' '+num(a.beds[i])+'床').join('、')+'">'+a.beds.map((n,i)=>'<span style="width:'+ (n/all*100).toFixed(4)+'%;background:'+shades[i]+'" title="'+labels[i]+'：'+num(n)+'床／'+(n/all*100).toFixed(1)+'%"></span>').join('')+'</div></div>';
    }).join('');
    view('visual-bedmix','<div class="v-head"><div><div class="v-tag">BEDS / 100% STACKED INFOGRAPHIC</div><h3>医療圏ごとに異なる病床機能の構成</h3><p>各医療圏の許可病床を100%に正規化し、総病床規模とは独立して構成比を比較。</p></div></div><div class="v-panel"><div class="v-legend" style="margin-bottom:17px">'+legend+'</div><div class="v-stacks">'+rows+'</div><p class="v-note">2024年病床機能報告（許可病床）。バーの幅は各圏域内の比率であり、絶対数の大小を表すものではありません。<a href="https://www.pref.miyazaki.lg.jp/iryoseisaku/kurashi/iryo/20251023083845.html">宮崎県・2024年病床機能報告 ↗</a></p></div>');
  }
  function renderHeatmap(data){
    const names=data.scoring.labels;
    let html='<div class="v-head"><div><div class="v-tag">STRATEGY / INTERACTIVE HEATMAP</div><h3>7医療圏 × 5評価軸｜優先度ヒートマップ</h3><p>1–5点・重み付けの独自分析仮説。売上、受注、医療機器の設置実数ではありません。</p></div></div>';
    html+='<div class="v-panel"><div class="v-legend" style="margin-bottom:10px"><span>低評価</span>'+[1,2,3,4,5].map(i=>'<span class="v-key"><span class="v-dot" style="background:'+['','#edf6f9','#cee7e8','#91d0ca','#469da1','#076477'][i]+'"></span>'+i+'</span>').join('')+'<span>高評価</span></div><div class="v-heatwrap"><div class="v-heat"><span class="v-heat-label">医療圏</span>'+names.map((name,i)=>'<span class="v-heat-heading">'+esc(name)+'<br><strong>'+data.scoring.weights[i]+'%</strong></span>').join('');
    data.areas.forEach((a,j)=>{html+='<span class="v-heat-label">'+esc(a.name)+'</span>';a.score.forEach((score,i)=>{html+='<button type="button" class="v-cell" data-area="'+j+'" data-axis="'+i+'" data-level="'+score+'" aria-label="'+esc(a.name)+'、'+esc(names[i])+'、5点満点中'+score+'点"><strong>'+score+'</strong><small> / 5点</small></button>'})});
    html+='</div></div><div class="v-detail" id="heatmap-detail" aria-live="polite">セルを選択すると、対象医療圏の評価・課題を表示します。</div><p class="v-note">評価軸の重み：'+names.map((x,i)=>esc(x)+' '+data.scoring.weights[i]+'%').join(' / ')+'。独自スコアであり公的統計ではありません。</p></div>';
    view('visual-heatmap',html);
    const root=$('visual-heatmap');
    root.querySelectorAll('.v-cell').forEach(node => node.addEventListener('click',()=>{
      const a=data.areas[Number(node.dataset.area)],axis=Number(node.dataset.axis);
      view('heatmap-detail','<b>'+esc(a.name)+'｜'+esc(names[axis])+'：'+a.score[axis]+'/5点</b><br>評価軸の重み '+data.scoring.weights[axis]+'%、総合優先度 '+score(a,data).toFixed(0)+'/100点。<br><span>'+esc(a.focus)+'</span><br><small>公開情報の解釈による分析者の仮説です。</small>');
    }));
  }
  function renderBubble(data){
    view('visual-quadrant','<div class="v-head"><div><div class="v-tag">DISTRIBUTION / BUBBLE CHART</div><h3>医師偏在と病床規模の組合せ</h3><p>横軸＝2026年医師偏在指標／縦軸＝2024年許可病床／円の大きさ＝独自優先度。異なる指標間の因果関係を証明するものではありません。</p></div></div><div class="v-panel"><div class="v-bubble-wrap"><canvas id="v-bubble" role="img" aria-label="7医療圏の医師偏在指標と許可病床数のバブルチャート"></canvas></div><p class="v-note">出典：厚生労働省「2026年医師偏在指標」・宮崎県「2024年病床機能報告」。円のサイズのみ独自スコア。機器設置数や市場規模を意味しません。</p></div>');
    if(!window.Chart){$('v-bubble').replaceWith(Object.assign(document.createElement('p'),{textContent:'図の描画ライブラリを取得できないため、医療圏別の表・ヒートマップを参照してください。'}));return}
    new Chart($('v-bubble'),{type:'bubble',
      data:{datasets:data.areas.map((a,i)=>({label:a.name,backgroundColor:['#0b8794','#db8c52','#477b97','#69a99c','#a884bc','#b4a16b','#8e9db0'][i]+'C9',borderColor:'#14576a',borderWidth:1,
      data:[{x:a.physicianIndex2026,y:total(a.beds),r:5+Math.round(score(a,data)/100*15),region:a.name,grade:score(a,data).toFixed(0)}]}))},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:11,font:{size:11}}},tooltip:{callbacks:{label:ctx=>{const x=ctx.raw;return x.region+'｜偏在 '+x.x+'／病床 '+num(x.y)+'床／優先度 '+x.grade+'点'}}}},
      scales:{x:{min:115,max:360,title:{display:true,text:'2026年 医師偏在指標'}},y:{beginAtZero:true,title:{display:true,text:'2024年 許可病床数（床）'}}}}});
  }
  function flowStep(name,title,desc){return '<div class="v-flowstep"><span class="v-icon">'+icon(name)+'</span><strong>'+title+'</strong><small>'+desc+'</small></div>'}
  function renderCare(){
    view('visual-care-path','<div class="v-head"><div><div class="v-tag">PATIENT JOURNEY / CLINICAL FLOW</div><h3>診療所と中核病院を結ぶ画像診断の流れ</h3><p>県立宮崎病院の公開共同利用手順を概念化。実際の予約方法・対象地域・登録条件は病院案内を参照。</p></div></div><div class="v-panel"><div class="v-figure-flow">'+
      flowStep('clinic','① 診療所','紹介状・患者情報・検査依頼')+
      flowStep('clipboard','② 病院の予約窓口','共同利用検査の受付・確認')+
      flowStep('ct','③ CT/MRI・核医学','検査・読影・診断レポート')+
      flowStep('monitor','④ 結果の連携','紹介元への画像・結果の返送')+
      '</div><p class="v-note">実際の共同利用は宮崎東諸県など対象地域・登録医条件に従います。<a href="https://www.kenritsu-miyazakibyouin.jp/medical/doctor/">出典：県立宮崎病院「地域の先生方へ」／公開案内 ↗</a></p></div>');
  }
  function renderDevices(data){
    const models=[['ct','CT','救急・肺癌・検査共同利用'],['mri','MRI','脳神経・整形・専門検査'],['us','超音波','内科・心臓・在宅POCUS'],['pet','PET／核医学','がん高度検査・広域集約'],['ivr','血管撮影・治療','脳卒中・循環器・救命'],['endo','内視鏡','消化器健診・感染対策'],['dial','透析','慢性腎不全・災害継続'],['monitor','生体情報','心電・モニタ・救急'],['security','PACS／医療IT','画像共有・遠隔読影・DX']];
    view('visual-devices','<div class="v-head"><div><div class="v-tag">MODALITY / VECTOR PICTOGRAM CATALOG</div><h3>画像・検査・治療・IT｜機器機能を図で整理</h3><p>各アイコンは臨床的な用途の分類を説明するものであり、県内の設置実数・機種別シェアを示しません。</p></div></div><div class="v-deck">'+models.map(row=>'<article class="v-tile"><div class="v-icon">'+icon(row[0])+'</div><h4>'+esc(row[1])+'</h4><p>'+esc(row[2])+'</p></article>').join('')+'</div><p class="v-note">装置共同利用計画対象：CT・MRI・PET・放射線治療・マンモグラフィー。 <a href="https://www.pref.miyazaki.lg.jp/iryoseisaku/kense/kekaku/20241111164543.html">出典：宮崎県外来医療計画（2024年） ↗</a></p>');
  }
  function renderSharedPlan(){
    view('visual-shared-plan','<div class="v-panel"><div class="v-head"><div><div class="v-tag">ADMINISTRATIVE FLOW / PUBLIC RULE</div><h3>高額機器の新設・更新と共同利用計画</h3><p>公的な手続きを提案フローへ落とし込む場合の参考図（制度の実施に従って個別確認が必要）。</p></div></div><div class="v-cycle"><span>対象装置を確認</span><span>共同利用を検討</span><span>計画書を作成</span><span>県保健所へ提出</span><span>地域で協議</span></div><p class="v-note">CT・MRI・PET/PET-CT・リニアック/ガンマナイフ・マンモが対象。<strong>設置・更新前に</strong>計画書を策定し管轄県保健所へ提出。承認済みであることや納入可否を図から推定しません。<a href="https://www.pref.miyazaki.lg.jp/iryoseisaku/kense/kekaku/20241111164543.html">県・共同利用計画書 ↗</a></p></div>');
  }
  function renderSupply(){
    view('visual-supply','<div class="v-head"><div><div class="v-tag">CHANNEL ECOSYSTEM / CONCEPT MAP</div><h3>機器市場の流通構造を役割で可視化</h3><p>メーカー・広域流通・地場サービスを機能で分類。社数・競争順位・実売上を示す勢力図ではありません。</p></div></div><div class="v-flowbox">'+
      '<article><h4>① 供給・技術</h4><ul><li>機器メーカー・専門メーカー</li><li>部品・消耗品・保守契約</li><li>画像・情報システムの接続</li></ul></article>'+
      '<article><h4>② 卸・設置・地域支援</h4><ul><li>九州域の広域医療機器卸</li><li>県内の専門商社・医薬卸</li><li>納品・教育・保守の対応網</li></ul></article>'+
      '<article><h4>③ 医療機関・共同利用</h4><ul><li>大学・県立・民間病院</li><li>診療所・在宅・健診</li><li>地域医師会と情報連携</li></ul></article>'+
      '</div><div class="v-legend" style="margin-top:12px"><span class="v-key"><b class="v-dot" style="background:#0e8990"></b>製品・サービス</span><span class="v-key"><b class="v-dot" style="background:#dd8d54"></b>流通・地域対応</span><span class="v-key"><b class="v-dot" style="background:#849bbb"></b>医療提供</span></div><p class="v-note">宮崎県内で活動する個社の公開営業所情報は下のリンクを参照。企業別売上や取引関係は表現していません。</p>');
  }
  function renderBCP(){
    const arr=[['power','電源・空調','停電・燃料・装置再起動手順'],['cloud','通信・画像','PACSバックアップ・遠隔参照'],['truck','物流・代替拠点','幹線寸断・搬送・代替機確保'],['dial','透析・慢性疾患','水・電源・患者受入先と継続計画']];
    view('visual-bcp','<div class="v-head"><div><div class="v-tag">DISASTER RESILIENCE / SERVICE CONTINUITY</div><h3>災害BCPを医療機器で見る4つのピクトグラム</h3><p>宮崎県の被害想定を踏まえた独自の確認観点。被害の発生確率や定量リスク点数ではありません。</p></div></div><div class="v-riskgrid">'+arr.map(a=>'<article class="v-riskitem"><div class="v-icon">'+icon(a[0])+'</div><h4>'+esc(a[1])+'</h4><p>'+esc(a[2])+'</p></article>').join('')+'</div><p class="v-note">出典：<a href="https://www.pref.miyazaki.lg.jp/kiki-kikikanri/bosai/keikaku/20260219163728.html">宮崎県「南海トラフ巨大地震被害想定」2026年</a>。機器別チェック項目は市場分析上の提案仮説。</p>');
  }
  function renderStrategy(){
    view('visual-strategy','<div class="v-head"><div><div class="v-tag">WHERE TO PLAY × HOW TO WIN</div><h3>戦略のSauce｜どこを選び、何で優位を作るか</h3><p>地域・診療機能を選んでから、医療機関のTCO・医療アクセス・保守の価値を検証。</p></div></div><div class="v-brief"><article><h4>WHERE TO PLAY｜市場・顧客</h4><p>宮崎東諸県：大学・県立・専門病院／都城・延岡：地域救急・診療所連携／県西・中山間・離島：在宅・透析・ポータブル検査。</p></article><article><h4>HOW TO WIN｜提供価値・能力</h4><p>装置＋共同利用フロー＋画像共有＋技師教育＋域内保守＋災害代替。初期価格だけでなく医療継続と患者負担も比較。</p></article></div><div class="v-cycle"><span>PEST・地域需要</span><span>3C → STP</span><span>4P → 4C</span><span>VRIO・5F</span><span>KSF・施策</span></div><p class="v-note">独自提言。施策優先順位は施設の実測稼働率・予算・共同利用先の確認後に最終決定。</p>');
  }
  function renderAccessMap(data){
    view('visual-access-map','<div class="v-head"><div><div class="v-tag">ACCESS MAP / GSI TILE + MULTI-LAYER</div><h3>病院・大学・医師会・保健所｜拠点レイヤー地図</h3><p>代表医療圏、主要病院、行政・医師会を切り替え。クリックで公式URLとGoogleマップ、国土地理院地図を確認できます。</p></div></div><div class="v-panel"><div class="v-map-tools" role="group" aria-label="地図に表示する拠点カテゴリ"><button type="button" class="active" data-category="all" aria-pressed="true">すべて</button><button type="button" data-category="zones" aria-pressed="false">7医療圏代表市</button><button type="button" data-category="hospitals" aria-pressed="false">病院・大学</button><button type="button" data-category="offices" aria-pressed="false">県庁・医師会・保健所</button></div><div id="visual-layer-map" class="v-map-alt" role="region" aria-label="宮崎県の医療機関と行政拠点をレイヤー表示する地理院地図"></div><div class="v-map-legend"><span class="v-key"><b class="v-dot" style="background:#12898f"></b>医療圏代表</span><span class="v-key"><b class="v-dot" style="background:#d77e45"></b>病院</span><span class="v-key"><b class="v-dot" style="background:#677fa9"></b>医師会・行政</span></div><p class="v-note">背景地図：<a href="https://maps.gsi.go.jp/">地理院タイル</a>（国土地理院）。記号は<strong>所在都市の概略点</strong>であり、施設の測量座標や二次医療圏境界ではありません。</p></div>');
    if(!window.L){view('visual-layer-map','<p style="padding:20px">地図描画ライブラリを利用できません。下の施設一覧からGoogleマップ／地理院地図をご覧ください。</p>');return}
    try {
      const map=L.map('visual-layer-map',{scrollWheelZoom:false}).setView([32.14,131.37],8);
      L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{maxZoom:17,attribution:'<a href="https://maps.gsi.go.jp/">地理院タイル</a> ｜ 国土地理院'}).addTo(map);
      const google=(n,address)=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(n+' '+(address||'宮崎県'));
      const gsi=(lat,lng)=>'https://maps.gsi.go.jp/#14/'+lat+'/'+lng+'/';
      const popup=(n,address,lat,lng,url)=>'<b>'+esc(n)+'</b><br><small>'+esc(address||'所在地の概略点')+'</small><br><a href="'+google(n,address)+'" target="_blank" rel="noopener noreferrer">Googleマップ</a> ｜ <a href="'+gsi(lat,lng)+'" target="_blank" rel="noopener noreferrer">地理院地図</a>'+(url?'<br><a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">公式ページ</a>':'');
      const groups={zones:L.layerGroup(),hospitals:L.layerGroup(),offices:L.layerGroup()};
      data.areas.forEach(a=>{L.circleMarker([a.lat,a.lng],{radius:11,color:'#075c6a',weight:2,fillColor:'#12898f',fillOpacity:.77}).bindPopup(popup(a.name+'（代表市域）',a.city,a.lat,a.lng)).addTo(groups.zones)});
      data.facilities.forEach(a=>{L.circleMarker([a.lat,a.lng],{radius:7,color:'#a65321',weight:2,fillColor:'#d77e45',fillOpacity:.95}).bindPopup(popup(a.name,a.where,a.lat,a.lng,a.url)).addTo(groups.hospitals)});
      data.publicOffices.forEach(a=>{L.circleMarker([a.lat,a.lng],{radius:5,color:'#425d85',weight:1,fillColor:'#677fa9',fillOpacity:.95}).bindPopup(popup(a.name,a.where,a.lat,a.lng,a.url)).addTo(groups.offices)});
      Object.values(groups).forEach(layer=>layer.addTo(map));
      $('visual-access-map').querySelectorAll('[data-category]').forEach(btn=>btn.addEventListener('click',()=>{
        const cat=btn.dataset.category;
        $('visual-access-map').querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn))});
        for(const [name,layer] of Object.entries(groups)){if(cat==='all'||cat===name){if(!map.hasLayer(layer))layer.addTo(map)}else if(map.hasLayer(layer))map.removeLayer(layer)}
        map.invalidateSize();
      }));
      setTimeout(()=>map.invalidateSize(),200);
    }catch(error){view('visual-layer-map','<p style="padding:20px">地図の初期化に失敗しました。施設一覧の外部地図リンクを使用してください。</p>');console.warn('secondary-map',error)}
  }
  fetch('./data/medical-market.json',{cache:'no-cache'})
    .then(r=>{if(!r.ok)throw Error('data request '+r.status);return r.json()})
    .then(data=>{
      renderHero();renderAging(data);renderBeds(data);renderHeatmap(data);renderBubble(data);renderCare();
      renderDevices(data);renderSharedPlan();renderSupply();renderBCP();renderStrategy();renderAccessMap(data);
      if(window.MutationObserver){ /* all graphics use immutable public JSON; no client analytics */ }
    })
    .catch(error=>{
      console.error('visual-atlas',error);
      view('visual-hero','<div class="v-panel">ビジュアル用の公開データを読み込めませんでした。下の表と出典リンクをご利用ください。</div>');
    });
})();
