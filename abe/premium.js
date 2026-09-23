/* 安部の歴史 — ビジュアル・スマートフォンUI */
(() => {
  'use strict';
  const $=(q,root=document)=>root.querySelector(q), $$=(q,root=document)=>Array.from(root.querySelectorAll(q));
  const icon={book:'<path d="M3 5h8c2 0 2 1 2 1s0-1 2-1h6v15h-7c-2 0-3 1-3 1s-1-1-3-1H3z"/><path d="M12 6v15"/>',pin:'<path d="M12 21s7-5.7 7-11A7 7 0 1 0 5 10c0 5.3 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',family:'<circle cx="8" cy="7" r="3"/><path d="M2 21v-3a6 6 0 0 1 12 0v3M17 11a3 3 0 1 0-1-6M18 15c2 0 4 2 4 6"/>',scroll:'<path d="M7 4h12a2 2 0 1 1 0 4H7zM7 8v10a2 2 0 0 0 2 2h10M7 20a2 2 0 1 1 0-4h12"/>',chart:'<path d="M4 20V9m6 11V4m6 16v-8m5 8V7"/>',castle:'<path d="M4 21h16M6 21v-8l2 1v-3l3 1V6h3v6l3-1v3l2-1v8M11 21v-5h3v5"/>'};
  const svg=n=>`<svg viewBox="0 0 24 24" aria-hidden="true">${icon[n]}</svg>`;
  const node=s=>{const t=document.createElement('template');t.innerHTML=s.trim();return t.content.firstElementChild;};
  const putBefore=(section,markup)=>{const fig=$('.figure',section);if(fig)fig.before(node(markup));else section.querySelector('.wrap').append(node(markup));};
  const dashboard=$('#overview');
  if(dashboard&&!$('.visual-dashboard',dashboard))putBefore(dashboard,`<div class="visual-dashboard" aria-label="研究の要点">
    <div class="mini-stats"><div><small>全国推計</small><b>約76,900人</b>2026年・参考値</div><div><small>分布最大県</small><b>大分県</b>県内順位 6位</div><div><small>熊本・宇佐研究</small><b>1643年</b>事件後の旁系を追跡</div><div><small>史料検証</small><b>3段階</b>確認・仮説・未証明</div></div>
    <div class="icon-grid">${[
      ['book','名字の成立ち','阿倍・安倍・阿部・安部の表記関係を整理。'],
      ['pin','国内の分布','大分・福岡の厚み、山形・島根の地域核。'],
      ['castle','近世武家','駿河・岡部藩主安部氏と熊本細川家臣の歴史。'],
      ['family','熊本阿部家','弥一右衛門と五男、事件後の旁系親族。'],
      ['scroll','文献研究','『先祖附』『綿考輯録』『熊本藩年表稿』等を照合。'],
      ['chart','図解資料','10枚の図版と系図・グラフ・マップを連動。']
      ].map(([i,h,p])=>`<article class="icon-card"><div class="icon-mark">${svg(i)}</div><div><h3>${h}</h3><p>${p}</p></div></article>`).join('')}</div>
  </div>`);
  const maps=[
    ['大分市','最大集積','大分県大分市','安部姓の全国最大の集積地域。'],
    ['福岡県','九州北部核','福岡県','大分と並ぶ九州北部の人口集積。'],
    ['宇佐市山','墓碑伝承','大分県宇佐市山 貴船神社','弥一右衛門関連墓碑の伝承地点。正確な現地位置は資料で要確認。'],
    ['米沢市','置賜核','山形県米沢市','山形の安部姓を調べる重点地域。'],
    ['松江市','出雲核','島根県松江市','島根県で濃い地域分布が見られる地点。'],
    ['深谷市岡部','岡部藩','埼玉県深谷市岡部','岡部藩主安部氏ゆかりの地。'],
    ['小倉','細川家旧領','福岡県北九州市小倉北区','豊前小倉藩時代の弥一右衛門研究の舞台。'],
    ['妙解寺跡','熊本藩士墓所','熊本県熊本市 妙解寺跡 細川家墓所','細川忠利と殉死者の墓所。']
  ];
  const mapLink=(label,query)=>`<a class="map-link" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}" aria-label="${label}をGoogleマップで開く">Googleマップで見る</a>`;
  const dist=$('#distribution');
  if(dist&&!$('.chart-flex',dist))putBefore(dist,`<div class="visual-dashboard">
    <div class="chart-flex"><div class="chart-card"><span class="chart-label">DATA GRAPH · 推計人数</span><h3>安部姓の都道府県別分布</h3><p>単位：人。人口規模と県内順位を合わせて考える必要があります。</p>
    <div class="h-bars">${[['大分',10800],['福岡',9300],['東京',6500],['神奈川',5200],['大阪',4000],['山形',3800],['島根',2900],['熊本',380]].map(([n,v])=>`<div class="hbar"><span>${n}</span><div class="track" role="img" aria-label="${n} ${v.toLocaleString('ja-JP')}人"><span class="fill" style="width:${(v/10800*100).toFixed(1)}%"></span></div><span class="val">${v.toLocaleString('ja-JP')}</span></div>`).join('')}</div></div>
    <div class="chart-card"><span class="chart-label">HOW TO READ</span><h3>人数と地域性を分ける</h3><div class="feature-list"><div><strong>人口</strong><span>大分・福岡は全国の大きな分布核。</span></div><div><strong>密度</strong><span>山形・島根は県内順位が高く、地域に根付いた名字。</span></div><div><strong>歴史</strong><span>熊本は現代の人数ではなく、阿部一族事件の史料で重要。</span></div></div></div></div>
    <div class="map-deck"><span class="chart-label">HISTORICAL & DISTRIBUTION MAPS</span><h3>研究地点をGoogleマップで確認</h3><p>県・市・史跡をクリックすると、該当地点をGoogleマップで開きます。墓碑の位置は伝承地点を示し、現地の正確な位置を確約するものではありません。</p>
    <div class="map-grid">${maps.map(([n,t,q,p])=>`<article class="map-card"><span class="map-kicker">${t}</span><h3>${n}</h3><p>${p}</p>${mapLink(n,q)}</article>`).join('')}</div></div>
  </div>`);
  const kumamoto=$('#kumamoto');
  if(kumamoto&&!$('.map-route',kumamoto))putBefore(kumamoto,`<div class="map-deck"><span class="chart-label">HISTORICAL ROUTE · 図解</span><h3>豊前から肥後への活動経路</h3><div class="map-route"><div><b>小倉</b><small>豊前・細川家の時代</small></div><div><b>宇佐</b><small>宇佐宮永勝院の文書</small></div><div><b>熊本</b><small>1632年 細川家肥後入国</small></div></div><p class="note">上図は関係地点を結ぶ概念図であり、実際の移動経路や経由順を確定するものではありません。</p>
  <details class="map-embed"><summary>熊本・妙解寺跡周辺の地図を表示</summary><div data-map-query="熊本県熊本市 妙解寺跡 細川家墓所"></div><p class="embed-note">埋め込みが表示されない場合：${mapLink('妙解寺跡','熊本県熊本市 妙解寺跡 細川家墓所')}</p></details>
  <details class="map-embed"><summary>宇佐市山周辺の地図を表示</summary><div data-map-query="大分県宇佐市山 貴船神社"></div><p class="embed-note">墓碑の位置は現地・資料で要確認：${mapLink('宇佐市山','大分県宇佐市山 貴船神社')}</p></details>
  </div>`);
  const yi=$('#yaichiemon');
  if(yi&&!$('.chart-flex',yi))putBefore(yi,`<div class="chart-flex"><div class="chart-card"><span class="chart-label">CHIGYO GRAPH · 知行推移</span><h3>50石から1,100石へ</h3><p>行政実務による登用・加増の推移を図示。</p><div class="h-bars">${[['初期',50],['加増',100],['家臣化',300],['最終',1100]].map(([n,v])=>`<div class="hbar"><span>${n}</span><div class="track"><span class="fill" style="width:${(v/1100*100).toFixed(1)}%"></span></div><span class="val">${v.toLocaleString('ja-JP')}石</span></div>`).join('')}</div></div><div class="chart-card"><span class="chart-label">HOUSEHOLD · 事件前</span><h3>阿部家の家勢</h3><div class="feature-list">${[['弥一右衛門','1,100石'],['権兵衛','500石'],['市太夫','300石'],['弥五兵衛','200石'],['五太夫','200石'],['左平太','10人扶持']].map(([n,v])=>`<div><strong>${n}</strong><span>${v}</span></div>`).join('')}</div><p class="note">知行の集計時点に注意。人扶持と石高は直接加算できません。</p></div></div>`);
  const genealogy=$('#genealogy');
  if(genealogy&&!$('.evidence-legend',genealogy)){
    const first=$('.intro',genealogy);
    const el=node(`<div class="evidence-legend"><div class="evidence-grid"><article class="legend-card"><span class="evidence-chip">確</span><h3>確認できる系譜</h3><p>弥一右衛門と、1643年事件に関わった男子の名前・事件記録。</p></article><article class="legend-card"><span class="evidence-chip hyp">仮</span><h3>接続を検証中</h3><p>1643年後に召し仕えられた「従弟など」と、後代の阿部姓藩士の関係。</p></article><article class="legend-card"><span class="evidence-chip unknown">空</span><h3>未確定の3代</h3><p>弥一右衛門以前の父・祖父・曾祖父の実名は無理に補わず空欄を維持。</p></article></div></div>`);
    if(first)first.after(el);else genealogy.querySelector('.wrap').append(el);
  }
  // スマートフォン用目次
  const nav=$('.nav');
  if(nav){
    const btn=node(`<button class="nav-toggle" aria-expanded="false" aria-controls="chapter-links" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>章を選ぶ〈目次〉</button>`);
    const links=$('.wrap',nav);if(links)links.id='chapter-links';nav.prepend(btn);
    btn.addEventListener('click',()=>{const o=nav.classList.toggle('is-open');btn.setAttribute('aria-expanded',String(o));btn.innerHTML=(o?'✕　目次を閉じる':`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>章を選ぶ〈目次〉`);});
    $$('.nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');btn.setAttribute('aria-expanded','false');btn.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>章を選ぶ〈目次〉`;}));
    let queued=false;const progress=()=>{const max=document.documentElement.scrollHeight-innerHeight;nav.style.setProperty('--scroll-progress',`${max>0?Math.min(100,scrollY/max*100):0}%`);queued=false;};addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(progress)}},{passive:true});progress();
    if('IntersectionObserver' in window){const io=new IntersectionObserver(items=>{items.forEach(e=>{if(e.isIntersecting){$$('.nav a').forEach(a=>a.setAttribute('aria-current',a.hash==='#'+e.target.id?'true':'false'));}})},{rootMargin:'-18% 0px -70% 0px'});$$('main > section[id]').forEach(s=>io.observe(s));}
  }
  $$('.table-wrap').forEach(x=>{x.setAttribute('tabindex','0');x.setAttribute('role','region');x.setAttribute('aria-label','横にスクロールできる比較表');x.before(node('<p class="scroll-hint" aria-hidden="true">← 表は左右にスクロールできます →</p>'));});
  // 地図は開いた時だけGoogleマップを読み込み、外部への通信を最小化。
  $$('.map-embed').forEach(details=>details.addEventListener('toggle',()=>{if(!details.open)return;const target=$('[data-map-query]',details);if(!target||target.firstChild)return;const q=target.dataset.mapQuery;const iframe=document.createElement('iframe');iframe.loading='lazy';iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.title=q+'のGoogleマップ';iframe.src='https://www.google.com/maps?q='+encodeURIComponent(q)+'&output=embed';target.append(iframe);}));
  // ギャラリーのラベルと前後移動。既存の拡大表示に付加する。
  $$('.gallery button').forEach((b,i)=>{if(!$('.gallery-label',b)){const img=$('img',b);b.append(node(`<span class="gallery-label">${String(i+1).padStart(2,'0')} — ${(img.alt||'歴史図版').replace(/^図版\d+\s*/, '')}</span>`));}});
  const lb=$('#lightbox');
  if(lb&&!$('.lb-count',lb)){
    const ims=$$('.gallery img');let current=0;const count=node('<span class="lb-count" aria-live="polite"></span>');const prev=node('<button class="lightbox-nav prev" type="button" aria-label="前の画像">‹</button>');const next=node('<button class="lightbox-nav next" type="button" aria-label="次の画像">›</button>');lb.append(count,prev,next);
    const set=i=>{current=(i+ims.length)%ims.length;const im=$('img',lb);im.src=ims[current].src;im.alt=ims[current].alt;count.textContent=(current+1)+' / '+ims.length;};
    ims.forEach((im,i)=>im.addEventListener('click',()=>{set(i)},true));
    // 記事中の図版からの拡大は、同じ画像ソースを探して位置を合わせる。
    $$('.figure img').forEach(im=>im.addEventListener('click',()=>{const j=ims.findIndex(g=>g.src===im.src);if(j>=0)set(j)},true));
    prev.addEventListener('click',e=>{e.stopPropagation();set(current-1)});next.addEventListener('click',e=>{e.stopPropagation();set(current+1)});
    document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='ArrowLeft'){e.preventDefault();set(current-1)}if(e.key==='ArrowRight'){e.preventDefault();set(current+1)}});
    let startX=0;lb.addEventListener('touchstart',e=>{startX=e.changedTouches[0].screenX},{passive:true});lb.addEventListener('touchend',e=>{const dx=e.changedTouches[0].screenX-startX;if(Math.abs(dx)>60)set(current+(dx<0?1:-1))},{passive:true});
  }
})();
