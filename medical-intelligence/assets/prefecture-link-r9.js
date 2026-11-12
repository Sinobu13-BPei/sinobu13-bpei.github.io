/* Rev.9 - common prefectural official site / Google Maps navigation.
   Direct links are used only for an official URL identified in the source page
   or in a separately reviewed small directory. Unverified names are NOT
   represented as verified homepages. This does not rewrite original data. */
(function(){
'use strict';
if(window.__prefLinkRev9)return;window.__prefLinkRev9=true;
const official={"北海道大学病院":"https://www.huhp.hokudai.ac.jp/","札幌医科大学附属病院":"https://web.sapmed.ac.jp/hospital/","旭川医科大学病院":"https://www.asahikawa-med.ac.jp/hospital/","市立函館病院":"https://www.kanbyou.jp/","函館五稜郭病院":"https://www.gobyou.com/","北海道立江差病院":"https://esashi.hospital.hokkaido.jp/","八雲総合病院":"https://hosp.town.yakumo.hokkaido.jp/","小樽市立病院":"https://www.otaru-general-hospital.jp/","岩見沢市立総合病院":"https://www.iwamizawa-hospital.jp/","砂川市立病院":"https://www.med.sunagawa.hokkaido.jp/","深川市立病院":"https://www.city.fukagawa.lg.jp/web/section/fukabyo/","日鋼記念病院":"https://www.nikko-kinen.or.jp/","王子総合病院":"https://ojihosp.or.jp/","日高徳洲会病院":"https://hidakatokushukai.com/","旭川赤十字病院":"https://www.asahikawa.jrc.or.jp/","旭川厚生病院":"https://www.dou-kouseiren.com/byouin/asahikawa/","名寄市立総合病院":"https://www.nayoroch.jp/","富良野協会病院":"https://ssl.hokushakyo.jp/furano-hospital/","留萌市立病院":"https://rumoi-hp.jp/","市立稚内病院":"https://www.city.wakkanai.hokkaido.jp/hospital/","北見赤十字病院":"https://www.kitami.jrc.or.jp/","広域紋別病院":"https://www.mombetsu-hospital.jp/","帯広厚生病院":"https://www.dou-kouseiren.com/byouin/obihiro/","市立釧路総合病院":"https://www.kushiro-cghp.jp/","市立根室病院":"https://www.city.nemuro.hokkaido.jp/cgi-bin/hsp/","市立札幌病院":"https://www.city.sapporo.jp/hospital/","北海道がんセンター":"https://hokkaido-cc.hosp.go.jp/","手稲渓仁会病院":"https://www.keijinkai.com/teine/","北海道医師会":"https://www.hokkaido.med.or.jp/","弘前大学医学部附属病院":"https://www.med.hirosaki-u.ac.jp/hospital/","青森県医師会":"https://www.aomori.med.or.jp/","千葉県医師会":"https://www.chiba.med.or.jp/","千葉大学医学部附属病院":"https://www.ho.chiba-u.ac.jp/","筑波大学附属病院":"https://www.hosp.tsukuba.ac.jp/","愛媛大学医学部附属病院":"https://www.hsp.ehime-u.ac.jp/","愛媛県立中央病院":"https://www.eph.pref.ehime.jp/epch/","松山赤十字病院":"https://www.matsuyama.jrc.or.jp/","松山市民病院":"https://www.matsuyama-shimin-hsp.or.jp/","済生会松山病院":"https://db.matsuyama.saiseikai.or.jp/","住友別子病院":"https://sbh.gr.jp/","愛媛県立新居浜病院":"https://www.eph.pref.ehime.jp/epnh/","十全総合病院":"https://jyuzen.jp/","西条中央病院":"https://www.saijo-c-hospital.jp/","愛媛県立今治病院":"https://www.eph.pref.ehime.jp/epih/","済生会今治病院":"https://www.imabari.saiseikai.or.jp/","四国中央病院":"https://www.shikokuchuo-hospital.jp/","HITO病院":"https://hitomedical.co-site.jp/","市立宇和島病院":"https://www.uwajima-mh.jp/","愛媛労災病院":"https://www.ehimeh.johas.go.jp/","愛媛県医師会":"https://www.ehime.med.or.jp/","福井大学医学部附属病院":"https://www.hosp.u-fukui.ac.jp/","福島県医師会":"https://www.fukushima.med.or.jp/","岐阜県医師会":"https://www.gifu.med.or.jp/","兵庫県医師会":"https://hyogo.med.or.jp/","神戸大学医学部附属病院":"https://www.hosp.kobe-u.ac.jp/","福山市民病院":"https://www.fc-hosp.jp/","竹山":"https://www.takeyama.co.jp/","ムトウ":"https://www.wism-mutoh.jp/","常光":"https://www.jokoh.com/","ほくやく":"https://www.hokuyaku.co.jp/","モロオ":"https://www.moroo.co.jp/","スズケン":"https://www.suzuken.co.jp/","メディセオ":"https://www.mediceo.co.jp/","JA北海道厚生連":"https://www.dou-kouseiren.com/"};
const pref={"hokkaido":"北海道","aomori":"青森県","iwate":"岩手県","miyagi":"宮城県","akita":"秋田県","yamagata":"山形県","fukushima":"福島県","ibaraki":"茨城県","tochigi":"栃木県","gunma":"群馬県","saitama":"埼玉県","chiba":"千葉県","tokyo":"東京都","kanagawa":"神奈川県","niigata":"新潟県","toyama":"富山県","ishikawa":"石川県","fukui":"福井県","yamanashi":"山梨県","nagano":"長野県","gifu":"岐阜県","shizuoka":"静岡県","aichi":"愛知県","mie":"三重県","shiga":"滋賀県","kyoto":"京都府","osaka":"大阪府","hyogo":"兵庫県","nara":"奈良県","wakayama":"和歌山県","tottori":"鳥取県","shimane":"島根県","okayama":"岡山県","hiroshima":"広島県","yamaguchi":"山口県","tokushima":"徳島県","kagawa":"香川県","ehime":"愛媛県","kochi":"高知県","fukuoka":"福岡県","saga":"佐賀県","nagasaki":"長崎県","kumamoto":"熊本県","oita":"大分県","miyazaki":"宮崎県","kagoshima":"鹿児島県","okinawa":"沖縄県","akita-medical-mkt":"秋田県","yamagata-medical-mkt":"山形県","niigata-medical-mkt":"新潟県","yamanashi-medical-mkt":"山梨県","shizuoka-medical-atlas":"静岡県","sanin-medical-mkt":"鳥取県・島根県","aichi-medical-mkt":"愛知県","gunma-medical-mkt":"群馬県","kanagawa-medical-mkt":"神奈川県","mie-medical-mkt":"三重県","nagano-medical-mkt":"長野県","niigata-medical-market":"新潟県","okayama-medical-mkt":"岡山県","okinawa-medical-mkt":"沖縄県","shiga-medical-mkt":"滋賀県","shizuoka-medical-market-2026":"静岡県","tokushima-medical-mkt":"徳島県","yamaguchi-medical-mkt":"山口県","okinawa_medical_device_market_neutral_2026.html":"沖縄県","tohoku-medical-mkt":"東北地方","medical-intelligence":"全国"};
const p=location.pathname.split('/').filter(Boolean);
const key=p[0]==='medical-intelligence'?(p[1]==='radiology-physicians'?p[2]:p[1]):p[0];
const region=pref[key]||(document.title.match(/^(?:北海道|東京都|大阪府|京都府|.{2,3}県)/)||[])[0]||'';
if(!region)return;
const safeUrl=u=>{try{const x=new URL(u,location.href);return ['https:','http:'].includes(x.protocol)?x.href:''}catch(_){return''}};
const googleMap=q=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);
const googleOfficial=q=>'https://www.google.com/search?q='+encodeURIComponent(q+' 公式サイト');
const isAllowedOfficial=u=>{const url=safeUrl(u);if(!url||/\.pdf(?:\?|$)|\/link\/?(?:\?|$)|\/association\/?(?:\?|$)/i.test(url)||url.includes('google.')||url.includes('maps.gsi.go.jp')||url.includes('jmap.jp')||url.includes('scueldata')||url.includes('github.io')||url.includes('e-stat.go.jp')||url.includes('mhlw.go.jp')||url.includes('ipss.go.jp'))return false;return true};
function normalize(s){return String(s||'').replace(/[\s\u3000]*(?:↗|→)[\s\u3000]*$/g,'').trim()}
function collectNames(){
 for(const a of document.querySelectorAll('main a[href],article a[href]')){
  const name=normalize(a.textContent),url=a.getAttribute('href');
  if(!name||name.length>38||name.length<3||!isAllowedOfficial(url))continue;
  if(/(病院|医療センター|医師会|大学附属|厚生連|株式会社|医療機器|メディセオ|スズケン|ムトウ|竹山|ほくやく|常光|モロオ)/.test(name)&&!/(一覧|原典|資料|概要|検索|報告|調査|統計|データ|文献|ニュース|計画|画像|等|について|特集|改革プラン|医師数)/.test(name)){
    if(!official[name])official[name]=safeUrl(url)
  }
 }
}
function styleOnce(){
 if(document.getElementById('pref-link-r9-css'))return;
 const s=document.createElement('style');s.id='pref-link-r9-css';
 s.textContent='.pref-official-r9{color:#086b86!important;text-decoration:underline!important;text-decoration-color:#75b6c4!important;text-underline-offset:3px;font-weight:750!important;overflow-wrap:anywhere}.pref-official-r9:hover{color:#064b60!important;text-decoration-color:#064b60!important}.pref-map-r9,.pref-search-r9{display:inline-flex!important;align-items:center;justify-content:center;vertical-align:middle;gap:4px;padding:6px 10px;margin:5px 6px 5px 0;min-height:36px;border:1px solid #9bbdc9;border-radius:9px;background:#edf7f9;color:#155b72!important;font-size:12px!important;font-weight:750;text-decoration:none!important;line-height:1.4}.pref-map-r9:hover,.pref-search-r9:hover{background:#dceff4}.pref-map-r9:focus-visible,.pref-official-r9:focus-visible,.pref-search-r9:focus-visible{outline:3px solid #e7a93a;outline-offset:2px}.pref-map-r9-wrap{display:flex;justify-content:flex-end;flex-wrap:wrap;max-width:100%}.pref-search-r9{font-size:11px!important;min-height:30px;padding:3px 7px}.pref-map-r9-spacer{margin:1px 3px 1px 7px;min-height:30px;padding:3px 7px}@media(max-width:600px){.pref-map-r9-wrap{justify-content:flex-start}.pref-map-r9{min-height:44px}}';
 document.head.appendChild(s)
}
function createLink(text,url,cls,title){
 const a=document.createElement('a');a.className=cls;a.textContent=text;a.href=url;a.target='_blank';a.rel='noopener noreferrer';if(title)a.title=title;return a
}
function linkText(root){
 const names=Object.keys(official).filter(k=>k.length>=3&&isAllowedOfficial(official[k])).sort((a,b)=>b.length-a.length);
 if(!names.length||!root||!window.NodeFilter)return;
 const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];let n;
 while((n=walk.nextNode())){
  const par=n.parentElement;
  if(!par||!n.nodeValue||n.nodeValue.length>1800||!n.nodeValue.trim()||par.closest('a,button,script,style,select,option,textarea,svg,noscript,[data-no-link-r9],.pref-map-r9-wrap'))continue;
  if(names.some(k=>n.nodeValue.includes(k)))nodes.push(n);
  if(nodes.length>2500)break;
 }
 for(const n of nodes){
  const text=n.nodeValue;let cursor=0,changed=false;const frag=document.createDocumentFragment();
  while(cursor<text.length){
    let best=-1,word='';
    for(const k of names){const ix=text.indexOf(k,cursor);if(ix>=0&&(best<0||ix<best||(ix===best&&k.length>word.length))){best=ix;word=k}}
    if(best<0){frag.appendChild(document.createTextNode(text.slice(cursor)));break}
    if(best>cursor)frag.appendChild(document.createTextNode(text.slice(cursor,best)));
    frag.appendChild(createLink(word,official[word],'pref-official-r9','公式ホームページへ移動'));
    changed=true;cursor=best+word.length
  }
  if(changed&&n.parentNode)n.parentNode.replaceChild(frag,n)
 }
}
function addFallback(root){
 if(!root)return;
 const elems=root.querySelectorAll('h3,h4,.facility-name,.hospital-name,.facility strong,td:first-child strong');
 let handled=0;
 for(const el of elems){
  if(++handled>600)break;
  if(el.querySelector('a,.pref-search-r9'))continue;
  const name=normalize(el.textContent);
  if(!name||name.length>45||name.length<4||!/(?:病院|医療センター|医師会)$/.test(name)||official[name]||/(?:数|一覧|検索|連携|体制|市場|分析|参考|例)/.test(name))continue;
  el.appendChild(createLink('公式HPを検索',googleOfficial(name),'pref-search-r9','公式URL未確認のため検索結果を開く'))
 }
}
function gsiSearch(a){
 const href=a.getAttribute('href')||'';let match;
 try{const hash=new URL(href,location.href).hash;match=hash.match(/#\d+\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)/)}catch(_){}
 if(match)return googleMap(match[1]+','+match[2]);
 const row=a.closest('tr,.facility,.card,li');let label=normalize(row?.querySelector('th,td,strong,b,h3')?.textContent||'');
 return googleMap((label&&label.length<55?region+' '+label:region+' 病院'))
}
function augmentGsi(root){
 if(!root)return;
 const links=root.querySelectorAll('a[href*="maps.gsi.go.jp"]');
 let i=0;for(const a of links){
  if(++i>300)break;
  if(a.dataset.rev9GoogleAdded)return;
  a.dataset.rev9GoogleAdded='1';
  if(a.parentElement&&a.parentElement.querySelector('a[href*="google.com/maps"],a[href*="google.co.jp/maps"]'))continue;
  const next=a.nextElementSibling;
  if(next?.classList.contains('pref-map-r9'))continue;
  const extra=createLink('Googleマップ',gsiSearch(a),'pref-map-r9 pref-map-r9-spacer','同じ地点をGoogleマップで確認');
  a.insertAdjacentElement('afterend',extra)
 }
}
function mapButtons(root){
 if(!root)return;
 const selectors='.leaflet-container,.mapbox,.map-frame,#medicalMap,#areaMap,#mapCanvas,#map-section iframe,iframe[src*="maps.gsi.go.jp"]';
 const targets=root.querySelectorAll(selectors);
 let shown=0;for(const el of targets){
  if(++shown>6)break;
  if(el.classList.contains('leaflet-container')&&el.closest('.mapbox'))continue;
  if(el.dataset.rev9MapButton)continue;
  el.dataset.rev9MapButton='1';
  if(el.closest('a'))continue;
  const box=document.createElement('div');box.className='pref-map-r9-wrap';box.dataset.noLinkR9='1';
  box.appendChild(createLink(region+'の病院をGoogleマップで見る',googleMap(region+' 病院 医療機関'),'pref-map-r9','Googleマップの病院検索へ移動'));
  el.insertAdjacentElement('afterend',box)
 }
 if(shown===0&&!document.querySelector('.pref-map-r9-wrap')){
  const heads=[...root.querySelectorAll('h2,h3')].filter(h=>/医療圏.*(?:地図|Map)|(?:マップ|MAP|地図)/i.test(h.textContent)).slice(0,2);
  for(const h of heads){if(h.nextElementSibling?.classList.contains('pref-map-r9-wrap'))continue;const box=document.createElement('div');box.className='pref-map-r9-wrap';box.dataset.noLinkR9='1';box.appendChild(createLink(region+'の医療機関をGoogleマップで見る',googleMap(region+' 病院 医療機関'),'pref-map-r9'));h.insertAdjacentElement('afterend',box)}
 }
}
function update(){
 const root=document.querySelector('main')||document.querySelector('article')||document.body;
 if(!root)return;
 collectNames();linkText(root);augmentGsi(root);mapButtons(root);addFallback(root)
}
function start(){
 styleOnce();update();
 let scheduled=false;
 const root=document.querySelector('main')||document.body;
 const observer=new MutationObserver(items=>{
  if(scheduled)return;
  if(!items.some(x=>[...x.addedNodes].some(n=>n.nodeType===1&&!n.closest?.('.pref-map-r9-wrap')&&!n.classList?.contains('pref-official-r9')&&!n.classList?.contains('pref-search-r9')&&!n.classList?.contains('pref-map-r9'))))return;
  scheduled=true;window.requestAnimationFrame(()=>{scheduled=false;update()})
 });
 observer.observe(root,{subtree:true,childList:true})
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();