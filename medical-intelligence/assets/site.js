/* Japan Medical Market Intelligence | site.js | 2026-10-25
   Presentation-only: never rewrite medical values, sources or citations. */
(function(){
  'use strict';
  const ROOT='https://sinobu13-bpei.github.io/';
  const DATA_YEAR={hub:'2026',atlas:'2025',handbook:'2026'};
  const PAGES=[
    ['ハブ','medical-intelligence/'],
    ['診療所','clinic-medical-device-market/'],
    ['商社・HD','medical-intelligence/national-medical-distribution/'],
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
    /* On the original hub, the extra masthead is purely a duplicate link menu. */
    if(path.startsWith('medical-intelligence/')){
      const oldHeader=[...document.querySelectorAll('body > header')].find(x=>x!==head);
      if(oldHeader&&!oldHeader.querySelector('h1')&&oldHeader.querySelector('nav'))oldHeader.hidden=true;
    }
    const foot=document.getElementById('site-footer')||el('footer');foot.id='site-footer';
    if(!foot.parentNode)document.body.appendChild(foot);
    foot.replaceChildren();foot.className='jm-footer';
    const inner=el('div','jm-shell jm-footer-inner'),left=el('div');
    left.append(el('div','jm-footer-title','Japan Medical Market Intelligence'));
    left.append(el('p','jm-footer-note','公開資料の基準年・出典・利用条件をご確認ください。'));
    const links=el('nav','jm-footer-nav');links.setAttribute('aria-label','共通フッター');
    (path.startsWith('medical-intelligence/')?[['ハブ','medical-intelligence/']]:[['ハブ','medical-intelligence/'],['戦略策定','medical-device-strategy-handbook/']]).forEach(([label,target])=>{
      const a=el('a','',label);a.href=relative(target);links.appendChild(a);
    });
    /* Use the page's existing contact destination when unambiguous. */
    const contacts=[...document.querySelectorAll('a[href^="mailto:"]')].filter(a=>!foot.contains(a));
    const addresses=[...new Set(contacts.map(a=>a.getAttribute('href')?.split('?')[0]).filter(Boolean))];
    if(addresses.length===1){
      const a=el('a','jm-contact','問合せ');
      const preferred=contacts.find(x=>(x.getAttribute('href')||'').startsWith(addresses[0]))?.getAttribute('href')||addresses[0];
      a.href=preferred;links.appendChild(a);
      contacts.forEach(old=>{
        if(/^\s*(?:✉\s*)?問合せ\s*(?:↗)?\s*$/.test(old.textContent||'')){
          old.replaceWith(document.createTextNode(''));
        }
      });
    }else if(addresses.length>1){
      foot.dataset.audit='multiple-contact-destinations';
    }
    /* Move original hub's unique utility links into the shared footer; suppress duplicate strip. */
    if(path.startsWith('medical-intelligence/')){
      const oldRelated=document.querySelector('.footer-link-zone');
      if(oldRelated){
        const already=new Set([...links.querySelectorAll('a')].map(a=>new URL(a.href,document.baseURI).pathname));
        const related=el('nav','jm-footer-nav jm-footer-resources');related.setAttribute('aria-label','関連リンク');
        [...oldRelated.querySelectorAll('a[href]')].forEach(a=>{
          const url=new URL(a.href,document.baseURI);
          if(already.has(url.pathname)||url.protocol==='mailto:')return;
          /* Reuse the existing link node: no hidden duplicate in the DOM. */
          related.appendChild(a);already.add(url.pathname);
        });
        if(related.childElementCount)inner.appendChild(related);
        oldRelated.hidden=true;
      }
    }
    inner.append(left,links);foot.appendChild(inner);
    const meta=document.querySelector('[data-site-meta]')||el('div','jm-shell jm-meta');
    meta.setAttribute('data-site-meta','');
    if(!meta.parentNode)head.insertAdjacentElement('afterend',meta);
    if(!meta.textContent.trim()){
      const base=document.body.dataset.dataYear;
      const version=document.body.dataset.lastUpdated||'2026-10-25';
      meta.textContent='最終更新 '+version+'｜データ基準 '+(base?base+'年':'要確認');
    }
    meta.classList.add('jm-meta');
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
          a.href=relative(target.replace(/^\//,'')); // same GitHub Pages repository: relative URL
        }else{
          a.target='_blank';a.rel='noopener';
        }
      }
      if(a.target==='_blank'){a.rel='noopener';if(!a.classList.contains('rizno-one-btn')&&!a.textContent.trim().endsWith('↗'))a.append(document.createTextNode(' ↗'))}
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
      if(!h.previousElementSibling?.matches('.jm-section-label,.tag')){
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

  /* Contrast repair for legacy content. Evaluates actual foreground against the
     composited ancestor background. Never edits copy, medical data, citations or URLs. */
  function contrastRepair(){
    const TARGET='h1,h2,h3,h4,h5,h6,p,span,small,strong,b,em,i,a,button,label,summary,li,dd,dt,th,td,caption,figcaption,blockquote,output,input,select,textarea,div,section,article,[role="button"],.note,.lead,.eyebrow';
    const rgb=value=>{
      if(!value)return null;
      const match=value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s\/]+([\d.]+))?\s*\)$/i);
      if(match)return[+match[1],+match[2],+match[3],match[4]===undefined?1:+match[4]];
      const hex=value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
      if(hex){let v=hex[1];if(v.length===3)v=[...v].map(c=>c+c).join('');return[parseInt(v.slice(0,2),16),parseInt(v.slice(2,4),16),parseInt(v.slice(4,6),16),1]}
      return null;
    };
    const composite=(front,back)=>{
      const a=Math.max(0,Math.min(1,front[3]));
      return[0,1,2].map(i=>front[i]*a+back[i]*(1-a)).concat([1]);
    };
    const brightness=c=>{
      const x=c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)});
      return .2126*x[0]+.7152*x[1]+.0722*x[2];
    };
    const ratio=(a,b)=>{
      const l1=brightness(a),l2=brightness(b);return(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
    };
    const DARK=[31,41,51,1],NAVY=[15,42,74,1],TEAL=[14,124,134,1],WHITE=[255,255,255,1];
    let repaired=0,gradientsRemoved=0,checked=0;
    function resolvedBackground(element){
      const tree=[];let node=element;
      while(node&&node.nodeType===1){tree.push(node);node=node.parentElement}
      let bg=WHITE;
      for(let i=tree.length-1;i>=0;i--){
        const e=tree[i],cs=getComputedStyle(e);
        /* Remove CSS gradients, but never remove actual imagery (url()). */
        if(cs.backgroundImage.includes('gradient(')&&!cs.backgroundImage.includes('url(')){
          /* A transparent gradient-only surface must retain an opaque base once
             the gradient is removed. Otherwise white text becomes invisible. */
          const base=rgb(cs.backgroundColor);
          e.style.setProperty('background-image','none','important');
          gradientsRemoved++;
          if(!base||base[3]<.1){
            const isControl=e.matches('a,button,[role="button"]');
            const foreground=rgb(cs.color);
            const lightText=foreground&&brightness(composite(foreground,WHITE))>.65;
            const fallback=isControl?'#0E7C86':lightText?'#0F2A4A':'#F5F7FA';
            e.style.setProperty('background-color',fallback,'important');
          }
        }
        const color=rgb(getComputedStyle(e).backgroundColor);
        if(color)bg=composite(color,bg);
      }
      return bg;
    }
    function repair(el){
      if(el.closest('svg,canvas,template,[hidden],[aria-hidden="true"],#site-header .jm-menu-toggle[aria-expanded="false"] + .jm-primary-nav:not(.is-open)'))return;
      if(!el.matches('input,select,textarea')){
        let directText=false;
        for(const child of el.childNodes){if(child.nodeType===3&&child.nodeValue.trim()){directText=true;break}}
        if(!directText)return;
      }
      const cs=getComputedStyle(el);
      if(cs.display==='none'||cs.visibility==='hidden'||cs.visibility==='collapse'||cs.opacity==='0')return;
      const fg=rgb(cs.color);if(!fg)return;
      const bg=resolvedBackground(el);const actual=composite(fg,bg);
      const large=parseFloat(cs.fontSize)>=24||(parseFloat(cs.fontSize)>=18.66&&Number(cs.fontWeight)>=700);
      const threshold=large?3:4.5;checked++;
      if(ratio(actual,bg)>=threshold)return;
      /* Filled links must keep light text: teal text on teal is invisible on iOS. */
      const filled=el.closest('a,button,[role="button"]');
      if(filled){
        const surface=rgb(getComputedStyle(filled).backgroundColor);
        if(surface&&surface[3]>.9&&brightness(surface)<.27&&ratio(WHITE,bg)>=threshold){
          el.style.setProperty('color','#FFFFFF','important');
          el.style.setProperty('-webkit-text-fill-color','#FFFFFF','important');
          el.dataset.jmContrastFixed='true';
          repaired++;
          return;
        }
      }
      const isLink=el.matches('a')||el.closest('a,button,[role="button"]')!==null;
      const candidates=isLink?[TEAL,WHITE,NAVY,DARK]:[DARK,NAVY,WHITE];
      const best=candidates.map(c=>({c,r:ratio(c,bg)})).sort((a,b)=>b.r-a.r)[0];
      /* Prefer the accent for light-background links when WCAG AA is met. */
      let selected=best.c;
      if(isLink&&ratio(TEAL,bg)>=threshold)selected=TEAL;
      if(ratio(selected,bg)<threshold)return;
      const hex='#'+selected.slice(0,3).map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
      el.style.setProperty('color',hex,'important');
      el.dataset.jmContrastFixed='true';
      repaired++;
    }
    const scan=root=>{
      const nodes=[];
      if(root.nodeType===1&&root.matches?.(TARGET))nodes.push(root);
      if(root.querySelectorAll)nodes.push(...root.querySelectorAll(TARGET));
      for(const node of nodes)repair(node);
      window.__jmContrastStatus={checked,repaired,gradientsRemoved,lastRun:new Date().toISOString()};
    };
    scan(document.body);
    let pending=false,queued=[];
    const flush=()=>{
      pending=false;
      const roots=queued;queued=[];
      if(roots.length>30){scan(document.body);return}
      roots.forEach(node=>{if(node.isConnected&&node.nodeType===1)scan(node)});
    };
    const observer=new MutationObserver(records=>{
      for(const record of records){for(const node of record.addedNodes){if(node.nodeType===1)queued.push(node)}}
      if(queued.length&&!pending){pending=true;
        if('requestIdleCallback'in window)requestIdleCallback(flush,{timeout:500});
        else setTimeout(flush,120);
      }
    });
    observer.observe(document.body,{childList:true,subtree:true});
    window.addEventListener('load',()=>scan(document.body),{once:true});
    /* Accessible diagnosis: call JMContrastAudit() from the browser console. */
    window.JMContrastAudit=()=>{scan(document.body);return {...window.__jmContrastStatus}};
  }

  const start=()=>{
    const phases=[['header-footer',common],['small-repairs',smallRepairs],['structure',structure],['failsafe',failSafe],['contrast',contrastRepair]];
    window.__jmInitErrors=[];
    for(const [name,fn] of phases){
      try{fn()}catch(e){
        const message=name+': '+(e&&e.message||String(e));
        window.__jmInitErrors.push(message);
        console.warn('[JM shared UI]',message,e);
      }
    }
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
