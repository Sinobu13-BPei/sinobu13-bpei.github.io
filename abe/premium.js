
/* 安部の歴史 — premium interactions, historical charts and Google Maps */
(function(){
"use strict";
var $=function(q,r){return(r||document).querySelector(q)};
var $$=function(q,r){return Array.from((r||document).querySelectorAll(q))};
function element(html){var t=document.createElement("template");t.innerHTML=html.trim();return t.content.firstElementChild}
function addBefore(section,html){var fig=$(".figure",section);var el=element(html);if(fig)fig.before(el);else $(".wrap",section).append(el)}
var intro=$("#overview");
if(intro&&!$(".premium-overview",intro)){
 var cards=[
  ["文","名字と表記","阿倍・安倍・阿部・安部。漢字の違いだけで血統を断定しない。"],
  ["図","国内分布","大分・福岡の大きな集積と、山形・島根の地域性を図解。"],
  ["城","武家の歴史","信濃・駿河から岡部藩主家へつながる安部氏。"],
  ["系","熊本阿部家","弥一右衛門の家系と1643年後の旁系親族を慎重に追う。"],
  ["史","研究史料","『先祖附』『綿考輯録』『熊本藩年表稿』などを参照。"],
  ["絵","10枚の図版","全図版を章ごとに配置し、末尾からも拡大できる。"]
 ];
 var overview='<div class="premium-overview"><div class="premium-stats">'+
  [['全国の安部姓','約76,900人','2026年参考推計'],['最大の集積','大分県','県内順位6位'],['熊本阿部家','1643年','事件後の旁系も検証'],['調査の姿勢','史料重視','確認／仮説／未証明']].map(function(x){return '<div><small>'+x[0]+'</small><b>'+x[1]+'</b><span>'+x[2]+'</span></div>'}).join('')+
  '</div><div class="premium-cards">'+cards.map(function(x){return '<article class="premium-card"><div class="premium-icon" aria-hidden="true">'+x[0]+'</div><div><h3>'+x[1]+'</h3><p>'+x[2]+'</p></div></article>'}).join('')+'</div></div>';
 addBefore(intro,overview)
}
function bar(name,value,max,suffix){return '<div class="premium-bar"><span>'+name+'</span><span class="premium-track" role="img" aria-label="'+name+' '+value.toLocaleString('ja-JP')+suffix+'"><span class="premium-fill" style="width:'+(value/max*100).toFixed(1)+'%"></span></span><strong>'+value.toLocaleString('ja-JP')+suffix+'</strong></div>'}
var maps=[
 ["大分市","安部姓の最大集積","大分県大分市","県内順位6位の中心地域。"],
 ["福岡県","九州北部の分布核","福岡県","大分と並ぶ安部姓の大きな集積。"],
 ["宇佐市山","宇佐側の墓碑伝承","大分県宇佐市山 貴船神社","弥一右衛門関連の墓碑伝承。正確な墓碑位置は要確認。"],
 ["米沢市","山形・置賜地方","山形県米沢市","山形県安部姓の地域分布を検討。"],
 ["松江市","島根の集積地域","島根県松江市","出雲地域の安部姓分布を考える地点。"],
 ["深谷市岡部","武蔵岡部藩","埼玉県深谷市岡部","岡部藩主安部家ゆかりの地域。"],
 ["小倉","細川家豊前旧領","福岡県北九州市小倉北区","弥一右衛門の豊前時代の研究拠点。"],
 ["妙解寺跡","熊本の藩主墓所","熊本県熊本市 妙解寺跡 細川家墓所","細川忠利・殉死者の墓所。"]
];
function gmap(name,q){return '<a class="premium-map-link" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&amp;query='+encodeURIComponent(q)+'" aria-label="'+name+'をGoogleマップで開く">Googleマップを開く</a>'}
var dist=$("#distribution");
if(dist&&!$(".premium-maps",dist)){
 var d='<div class="premium-viz"><div class="premium-chart"><span class="premium-caption">DISTRIBUTION GRAPH</span><h3>都道府県別・安部姓の推計人数</h3><p>2026年の参考推計。人数と県内順位は異なる指標です。</p><div class="premium-bars">'+
 [['大分',10800],['福岡',9300],['東京',6500],['神奈川',5200],['大阪',4000],['山形',3800],['島根',2900],['熊本',380]].map(function(x){return bar(x[0],x[1],10800,'人')}).join('')+
 '</div></div><div class="premium-chart"><span class="premium-caption">READING THE DATA</span><h3>三つの視点</h3>'+
 '<div class="premium-point"><b>人数</b><span>大分・福岡は全国の大きな分布核。</span></div>'+
 '<div class="premium-point"><b>密度</b><span>山形・島根は県内順位が高く、地域に根付いた姓。</span></div>'+
 '<div class="premium-point"><b>史料</b><span>熊本は現代の人数よりも阿部一族史の重要地域。</span></div>'+
 '<p class="note">現在の分布だけから、古代の起源地や全員の共通祖先は確定できません。</p></div></div>';
 var grid='<div class="premium-maps"><span class="premium-caption">HISTORICAL & DISTRIBUTION MAPS</span><h3>重要地点をGoogleマップで確認</h3><p class="note">以下は研究上の地名・史跡へのリンクです。宇佐の墓碑は伝承地点であり、正確な位置を確約するものではありません。</p><div class="premium-map-grid">'+
 maps.map(function(x){return '<article class="premium-map-card"><small>'+x[1]+'</small><h3>'+x[0]+'</h3><p>'+x[3]+'</p>'+gmap(x[0],x[2])+'</article>'}).join('')+'</div></div>';
 addBefore(dist,d);addBefore(dist,grid)
}
var kum=$("#kumamoto");
if(kum&&!$(".premium-route",kum)){
 var route='<div class="premium-maps"><span class="premium-caption">KUMAMOTO / USA · GEOGRAPHY</span><h3>豊前から肥後への地理的なつながり</h3>'+
 '<div class="premium-route"><div><strong>小倉</strong><small>細川家の豊前旧領</small></div><div><strong>宇佐</strong><small>宇佐宮関係の記録</small></div><div><strong>熊本</strong><small>1632年・細川家肥後入国</small></div></div>'+
 '<p class="note">図は関係する三地点の概念図です。実際の移動順序や経路を断定するものではありません。</p>'+
 '<details class="premium-embed"><summary>熊本・妙解寺跡のGoogleマップを表示</summary><div data-place="熊本県熊本市 妙解寺跡 細川家墓所"></div><p>埋め込みが表示されない場合：'+gmap('妙解寺跡','熊本県熊本市 妙解寺跡 細川家墓所')+'</p></details>'+
 '<details class="premium-embed"><summary>宇佐市山・貴船神社周辺のGoogleマップを表示</summary><div data-place="大分県宇佐市山 貴船神社"></div><p>墓碑の位置は現地で要確認：'+gmap('宇佐市山','大分県宇佐市山 貴船神社')+'</p></details></div>';
 addBefore(kum,route)
}
var ya=$("#yaichiemon");
if(ya&&!$(".premium-viz",ya)){
 var y='<div class="premium-viz"><div class="premium-chart"><span class="premium-caption">CHIGYO GRAPH</span><h3>50石から1,100石へ</h3><p>豊前での実務が評価され、加増を重ねた経歴。</p><div class="premium-bars">'+
 [['初期',50],['加増',100],['家臣化',300],['最終',1100]].map(function(x){return bar(x[0],x[1],1100,'石')}).join('')+
 '</div></div><div class="premium-chart"><span class="premium-caption">FAMILY SIZE</span><h3>事件前の家勢</h3>'+
 [['弥一右衛門','1,100石'],['権兵衛','500石'],['市太夫','300石'],['弥五兵衛','200石'],['五太夫','200石'],['左平太','10人扶持']].map(function(x){return '<div class="premium-point"><b>'+x[0]+'</b><span>'+x[1]+'</span></div>'}).join('')+
 '<p class="note">知行と人扶持は単純に加算できません。</p></div></div>';
 addBefore(ya,y)
}
var ge=$("#genealogy");
if(ge&&!$(".premium-legend",ge)){
 var legend='<div class="premium-legend"><div class="premium-legend-grid">'+
 '<article class="premium-legend-card"><span class="premium-status">確</span><h3>史料で確認</h3><p>弥一右衛門と五人の男子、1641～1643年の事件記録。</p></article>'+
 '<article class="premium-legend-card"><span class="premium-status hyp">仮</span><h3>接続を検証中</h3><p>事件後に仕えた「従弟など」と、後代の熊本藩阿部姓諸家。</p></article>'+
 '<article class="premium-legend-card"><span class="premium-status unknown">空</span><h3>父祖3代は未詳</h3><p>父・祖父・曾祖父の実名を架空の人物で埋めない。</p></article>'+
 '</div></div>';
 var intro=$('.intro',ge);if(intro)intro.after(element(legend));else addBefore(ge,legend)
}
var nav=$('.nav');
if(nav){
 var btn=element('<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="abe-chapter-list">☰　章を選ぶ〈目次〉</button>');nav.prepend(btn);
 var links=$('.wrap',nav);if(links)links.id='abe-chapter-list';
 function closeMenu(){nav.classList.remove('is-open');btn.setAttribute('aria-expanded','false');btn.textContent='☰　章を選ぶ〈目次〉'}
 btn.addEventListener('click',function(){var open=nav.classList.toggle('is-open');btn.setAttribute('aria-expanded',String(open));btn.textContent=open?'✕　目次を閉じる':'☰　章を選ぶ〈目次〉'});
 $$('.nav a').forEach(function(a){a.addEventListener('click',closeMenu)});
 var queued=false;function updateProgress(){var d=document.documentElement;var max=d.scrollHeight-innerHeight;nav.style.setProperty('--read-progress',(max>0?Math.min(100,scrollY/max*100):0)+'%');queued=false}
 addEventListener('scroll',function(){if(!queued){queued=true;requestAnimationFrame(updateProgress)}},{passive:true});updateProgress();
 if('IntersectionObserver' in window){
  var observer=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){$$('.nav a').forEach(function(a){a.setAttribute('aria-current',String(a.hash==='#'+e.target.id))})}})},{rootMargin:'-18% 0px -70% 0px'});
  $$('main > section[id]').forEach(function(s){observer.observe(s)})
 }
}
$$('.table-wrap').forEach(function(t){t.tabIndex=0;t.setAttribute('role','region');t.setAttribute('aria-label','左右にスクロールできる表');t.before(element('<p class="scroll-hint">← 表は左右にスクロールできます →</p>'))});
$$('.premium-embed').forEach(function(d){d.addEventListener('toggle',function(){if(!d.open)return;var t=$('[data-place]',d);if(!t||t.firstChild)return;var f=document.createElement('iframe');f.loading='lazy';f.referrerPolicy='strict-origin-when-cross-origin';f.title=t.dataset.place+'のGoogleマップ';f.src='https://www.google.com/maps?q='+encodeURIComponent(t.dataset.place)+'&output=embed';t.append(f)})});
$$('.gallery button').forEach(function(b,i){var image=$('img',b);if(image&&!$('.gallery-label',b)){var label=document.createElement('span');label.className='gallery-label';label.textContent=String(i+1).padStart(2,'0')+' — '+(image.alt||'歴史図版').replace(/^図版\d+\s*/,'');b.append(label)}});
var lb=$("#lightbox");
if(lb&&!$(".lb-count",lb)){
 var imgs=$$('.gallery img'),index=0;
 var count=element('<span class="lb-count" aria-live="polite"></span>');
 var prev=element('<button class="lightbox-nav prev" type="button" aria-label="前の図版">‹</button>');
 var next=element('<button class="lightbox-nav next" type="button" aria-label="次の図版">›</button>');
 lb.append(count,prev,next);
 async function show(i){index=(i+imgs.length)%imgs.length;var selected=index,im=imgs[selected];count.textContent=(selected+1)+' / '+imgs.length;if(typeof hydrateImage==='function'&&im.dataset.srcB64){await hydrateImage(im)}if(index!==selected)return;var target=$('img',lb);target.src=im.src;target.alt=im.alt}
 imgs.forEach(function(im,i){im.addEventListener('click',function(){show(i)},true)});
 $$('.figure img').forEach(function(im){im.addEventListener('click',function(){var j=imgs.findIndex(function(g){return g.src===im.src});if(j>=0)show(j)},true)});
 prev.addEventListener('click',function(e){e.stopPropagation();show(index-1)});
 next.addEventListener('click',function(e){e.stopPropagation();show(index+1)});
 document.addEventListener('keydown',function(e){if(!lb.classList.contains('open'))return;if(e.key==='ArrowLeft'){e.preventDefault();show(index-1)}if(e.key==='ArrowRight'){e.preventDefault();show(index+1)}});
 var touchX=0;lb.addEventListener('touchstart',function(e){touchX=e.changedTouches[0].screenX},{passive:true});lb.addEventListener('touchend',function(e){var dx=e.changedTouches[0].screenX-touchX;if(Math.abs(dx)>60)show(index+(dx<0?1:-1))},{passive:true});
}
})();
