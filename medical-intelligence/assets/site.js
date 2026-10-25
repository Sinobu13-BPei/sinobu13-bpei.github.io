/* Japan Medical Market Intelligence | site.js | 2026-10-25
   Presentation-only: never rewrite medical values, sources or citations. */
(function(){
  'use strict';
  const ROOT='https://sinobu13-bpei.github.io/';
  const DATA_YEAR={hub:'2026',atlas:'2025',handbook:'2026'};
  const PAGES=[
    ['ハブ','medical-intelligence/'],
    ['診療所','clinic-medical-device-market/'],
    ['CT','ct-market-atlas/'],
    ['MRI','mri_market_atlas_2025.html'],
    ['論文調査','research-atlas/index.html'],
    ['戦略策定','medical-device-strategy-handbook/']
  ];
  const normPath=()=>decodeURI(location.pathname).replace(/^\/+/, '');
  const relative=(target)=>{
    const here=normPath().split('/').filter(Boolean);
    if(here.length&&/\.[a-z\d]{2,5}$/i.test(here[here.length-1]))here.pop();
    return '../'.repeat(here.length)+target;
  };
  const el=(tag,klass,text)=>{
    const x=document.createElement(tag);
    if(klass)x.className=klass;
    if(text!==undefined)x.textContent=text;
    return x;
  };
  function common(){
    if(!document.body)return;
    document.body.classList.add('jm-site');
    const path=normPath();
    const kind=document.body.dataset.siteType||(/handbook|training/.test(path)?'handbook':path.startsWith('medical-intelligence/')?'hub':'atlas');
    const head=document.getElementById('site-header')||el('header');
    head.id='site-header';
    if(!head.parentNode)document.body.insertBefore(head,document.body.firstChild);
    head.replaceChildren();
    const line=el('div','jm-shell jm-header-inner');
    const brand=el('a','jm-brand','Japan Medical Market Intelligence');
    brand.href=relative('medical-intelligence/');
    const toggle=el('button','jm-menu-toggle','メニュー');
    toggle.type='button';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','jm-primary-nav');
    const nav=el('nav','jm-primary-nav');nav.id='jm-primary-nav';nav.setAttribute('aria-label','共通ナビゲーション');
    PAGES.forEach(([name,target])=>{
      const a=el('a','',name);a.href=relative(target);
      const absolute=new URL(a.href,document.baseURI);
      if(absolute.pathname===location.pathname||(path===target.replace(/\/$/,'')+'/'))a.setAttribute('aria-current','page');
      nav.appendChild(a);
    });
    toggle.addEventListener('click',()=>{
      const next=!nav.classList.contains('is-open');
      nav.classList.toggle('is-open',next);toggle.setAttribute('aria-expanded',String(next));
    });
    line.append(brand,toggle,nav);head.appendChild(line);
    const foot=document.getElementById('site-footer')||el('footer');foot.id='site-footer';
    if(!foot.parentNode)document.body.appendChild(foot);
    foot.replaceChildren();foot.className='jm-footer';
    const inner=el('div','jm-shell jm-footer-inner'),left=el('div');
    left.append(el('div','jm-footer-title','Japan Medical Market Intelligence'));
    left.append(el('p','jm-footer-note','公開資料の基準年・出典・利用条件をご確認ください。'));
    const links=el('nav','jm-footer-nav');links.setAttribute('aria-label','共通フッター');
    [['ハブ','medical-intelligence/'],['戦略策定','medical-device-strategy-handbook/']].forEach(([label,target])=>{
      const a=el('a','',label);a.href=relative(target);links.appendChild(a);
    });
    /* Use the page's existing contact destination when unambiguous. */
    const contacts=[...document.querySelectorAll('a[href^="mailto:"]')].filter(a=>!foot.contains(a));
    const addresses=[...new Set(contacts.map(a=>a.getAttribute('href')?.split('?')[0]).filter(Boolean))];
    if(addresses.length===1){
      const a=el('a','jm-contact','問合せ');a.href=addresses[0];links.appendChild(a);
      contacts.forEach(old=>{
        if(/^\s*(?:✉\s*)?問合せ\s*(?:↗)?\s*$/.test(old.textContent||'')){
          old.replaceWith(document.createTextNode(''));
        }
      });
    }else if(addresses.length>1){
      foot.dataset.audit='multiple-contact-destinations';
    }
    inner.append(left,links);foot.appendChild(inner);
    const meta=document.querySelector('[data-site-meta]');
    if(meta){
      if(!meta.textContent.trim())meta.textContent='最終更新 '+new Date(document.lastModified).toISOString().slice(0,10)+'｜データ基準 '+(document.body.dataset.dataYear||DATA_YEAR[kind]||'要確認')+'年';
      meta.classList.add('jm-meta');
    }
  }
  function smallRepairs(){
    document.querySelectorAll('a[href]').forEach(a=>{
      const href=a.getAttribute('href')||'';
      if(/^https?:\/\//.test(href)){
        let u;try{u=new URL(href)}catch(_){return}
        /* Strip tracking params only; never replace the URL path, anchors or source identity. */
        if(u.hostname==='sinobu13-bpei.github.io'){
          u.searchParams.delete('utm_source');u.searchParams.delete('v');
          const target=u.pathname+u.search+u.hash;
          a.href=target; // same GitHub Pages site, path-relative to origin
        }else{
          a.target='_blank';a.rel='noopener';
        }
      }
      if(a.target==='_blank'){a.rel='noopener';if(!a.textContent.trim().endsWith('↗'))a.append(document.createTextNode(' ↗'))}
    });
    document.querySelectorAll('img[src=""],source[src=""]').forEach(x=>x.removeAttribute('src'));
  }
  function structure(){
    const main=document.querySelector('main');
    if(!main)return;
    const h2=[...main.querySelectorAll('h2')].filter(h=>h.offsetParent!==null);
    if(!h2.length||document.querySelector('.jm-toc'))return;
    const toc=el('nav','jm-toc');toc.setAttribute('aria-label','ページ内目次');
    h2.forEach((h,i)=>{
      const number=String(i+1).padStart(2,'0');
      if(!h.id)h.id='jm-section-'+number;
      const a=el('a','',number+'｜'+h.textContent.trim().replace(/^\s*[0-9]{1,2}\s*[.｜:]\s*/,'').slice(0,36));a.href='#'+h.id;toc.appendChild(a);
      /* Visual labels only: original heading text and section semantics remain untouched. */
      if(!h.previousElementSibling?.classList.contains('jm-section-label')){
        const lbl=el('span','jm-section-label',number+'｜SECTION');
        h.before(lbl);
      }
    });
    const top=main.querySelector('h1');
    if(top)top.insertAdjacentElement('afterend',toc);
    else main.insertBefore(toc,main.firstChild);
  }
  function failSafe(){
    window.addEventListener('error',(event)=>{
      const e=event.target;
      if(!(e instanceof HTMLScriptElement)||!e.src)return;
      const notice=el('p','jm-load-error','データを読み込めませんでした');
      const holder=document.querySelector('[data-js-error]')||e.parentElement;
      if(holder&&!holder.querySelector('.jm-load-error'))holder.appendChild(notice);
    },true);
  }
  const start=()=>{try{common();smallRepairs();structure();failSafe()}catch(e){console.warn('[JM shared UI]',e)}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
