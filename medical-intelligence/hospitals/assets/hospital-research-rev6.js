/* Hospital Rev.6 — evidence-aware hospital analytics, 2026 */
(()=>{'use strict';
const D=window.__hospitalResearch, E=id=>document.getElementById(id);
if(!Array.isArray(D)||!D.length){console.warn('Hospital Rev6 data not available');return}
const fmt=n=>Number(n||0).toLocaleString('ja-JP');
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const verified=[
{test:/国立がん研究センター中央病院/,url:'https://www.ncc.go.jp/jp/ncch/about/info/index.html',physicians:214,year:'2026-04-01',specialties:'がん専門各科（公式Web参照）',features:'がんゲノム医療中核・特定機能・臨床研究中核'},
{test:/北海道大学病院/,url:'https://www.huhp.hokudai.ac.jp/outline/',year:'2026年度病院概要'},
{test:/東京大学医学部附属病院/,url:'https://www.crc.h.u-tokyo.ac.jp/patient/depts/index.html',year:'公式診療科・部門一覧'}];
const evidence=x=>verified.find(v=>v.test.test(x.cells[2]));
const site=x=>evidence(x)?.url||'https://www.google.com/search?q='+encodeURIComponent('"'+x.cells[2]+'" '+x.pref+' 病院 公式サイト');
const tags=x=>String(x.cells[6]||'').split(/[・,、]/).filter(t=>t&&t!=='DPC外');
const officialDPC=[['大学病院本院群',82,'#9e314b'],['DPC特定病院群',172,'#da7467'],['標準病院群1',1141,'#147e8c'],['標準病院群2',290,'#93a9ba']];
const section=document.createElement('section');section.id='hi-research';
section.innerHTML=[
'<h2>病院深掘り分析｜DPC・病床・診療領域・医師数</h2>',
'<p class="hi-muted">原票8,019施設を維持。国の2026年DPC統計と既存の旧DPCタグは別系列で表示。病床・系列は原票時点の情報であり、公式確認前の項目には「未確認」を表示します。</p>',
'<div class="hi-cards" id="hi-kpis" aria-live="polite"></div>',
'<div class="hi-grid">',
'<article class="hi-box"><h3>2026年度 DPC分類（全国）</h3><div class="hi-stacked" id="hi-dpc-new"></div><div class="hi-key" id="hi-dpc-new-key"></div><p class="hi-muted">対象1,685施設。旧D1/D2/D3から自動変換しません。</p></article>',
'<article class="hi-box"><h3>原票内 DPC旧タグ分布</h3><div class="hi-stacked" id="hi-dpc-old"></div><div class="hi-key" id="hi-dpc-old-key"></div><p class="hi-muted">現行制度の個別病院区分を表すものではありません。</p></article>',
'<article class="hi-box"><h3>病床規模別施設数</h3><div class="hi-bars" id="hi-beds"></div></article>',
'<article class="hi-box"><h3>病院機能フラグ</h3><div class="hi-bars" id="hi-flags"></div><p class="hi-muted">原票の機能タグ。複数該当あり・更新未照合。</p></article>',
'<article class="hi-box"><h3>都道府県別施設数 上位10</h3><div class="hi-bars" id="hi-pref"></div></article>',
'<article class="hi-box"><h3>推定系列グループ 上位10</h3><div class="hi-bars" id="hi-group"></div><p class="hi-muted">原票による名称推定を含みます。「未確認」は系列病院がないことを意味しません。</p></article>',
'</div>',
'<div class="hi-box"><h3>診療科別割合・所属医師数の収録状況</h3>',
'<p id="hi-coverage" class="hi-note">診療科目・所属医師数は現在の原票では未収録。未確認を0件として集計しません。</p>',
'<p class="hi-muted">診療科別割合は、標榜科の確認済み病院数を分母として算出します。複数標榜なので合計100％にはなりません。確認済み病院の構成と全国の普及率も分けて報告します。</p>',
'<div class="hi-actions">',
'<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/newpage_43373.html" target="_blank" rel="noopener noreferrer">厚労省 2026年医療情報ネットCSV ↗</a>',
'<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/open_data_00020.html" target="_blank" rel="noopener noreferrer">2025年度病床機能報告 ↗</a>',
'<a href="https://www.mhlw.go.jp/stf/newpage_73042.html" target="_blank" rel="noopener noreferrer">2026年度DPC改定 ↗</a>',
'<button id="hi-save" type="button">深掘り施設CSVを保存</button>',
'</div></div>',
'<div class="hi-box"><h3>個別病院の情報の読み方</h3><p class="hi-muted">病院名から個別公式Webに直接移動できるのは確認済みの施設です。それ以外の病院名は「公式Webを検索（未確認）」に接続します。各施設の診療科・医師数・関連病院が不明な場合は未確認と表示します。関連病院が「ない」と確認できたことにはなりません。公表時点、施設移転・統合、DPC参加状況に注意してください。</p></div>'].join('');
const table=E('detailTable'),container=table.closest('section')||table.parentElement;
container.parentNode.insertBefore(section,container);
const nav=document.querySelector('.fixednav');if(nav){const a=document.createElement('a');a.href='#hi-research';a.textContent='深掘り分析';nav.append(a)}
const count=(a,f)=>{const m=new Map();for(const x of a){let k=f(x);if(!k)continue;m.set(k,(m.get(k)||0)+1)}return [...m].sort((a,b)=>b[1]-a[1]||String(a[0]).localeCompare(String(b[0]),'ja'))};
const chart=(id,arr,n=10)=>{const root=E(id);root.replaceChildren();const mx=Math.max(1,...arr.map(x=>x[1]));for(const [label,value] of arr.slice(0,n)){const line=document.createElement('div');line.className='hi-bar';const a=document.createElement('span'),t=document.createElement('div'),fill=document.createElement('span'),v=document.createElement('span');a.textContent=label;t.className='hi-track';fill.className='hi-fill';fill.style.width=(value/mx*100)+'%';t.append(fill);v.className='hi-val';v.textContent=fmt(value);line.append(a,t,v);root.append(line)}};
const stack=(id,key,arr)=>{const root=E(id),legend=E(key),sum=arr.reduce((n,x)=>n+x[1],0)||1;root.replaceChildren();legend.replaceChildren();for(const [name,val,color] of arr){const slice=document.createElement('span');slice.style.background=color;slice.style.width=(100*val/sum)+'%';slice.title=name+':'+fmt(val);root.append(slice);const item=document.createElement('span'),k=document.createElement('b');k.style.background=color;item.append(k,document.createTextNode(name+' '+fmt(val)));legend.append(item)}};
stack('hi-dpc-new','hi-dpc-new-key',officialDPC);
function selected(){const sel=id=>E(id)?.value||'',q=sel('q').normalize('NFKC').toLocaleLowerCase('ja').trim().split(/\s+/).filter(Boolean),p=sel('prefSel'),d=sel('dpcSel'),o=sel('ownerSel'),g=sel('groupSel'),e=sel('evidenceSel');return D.filter(x=>(!p||x.pref===p)&&(!d||x.dpc===d)&&(!o||(o==='public-all'?['prefecture','municipal','public-university','public-other'].includes(x.owner):o===x.owner))&&(!g||(g==='none'?!x.group:x.group===g))&&(!e||x.evidence===e)&&q.every(t=>x.text.includes(t)))}
let subset=D;
function refresh(){subset=selected();const beds=subset.map(x=>x.beds).filter(x=>x>0).sort((a,b)=>a-b),total=beds.reduce((n,x)=>n+x,0),middle=beds.length?(beds[Math.floor((beds.length-1)/2)]+beds[Math.floor(beds.length/2)])/2:0;
const kpi=[['抽出病院',fmt(subset.length)+'施設'],['病床数合計（原票）',fmt(total)+'床'],['病床数中央値',fmt(middle)+'床'],['系列名収録（推定含）',fmt(subset.filter(x=>x.group).length)+'施設']];
E('hi-kpis').innerHTML=kpi.map(([l,n])=>'<div class="hi-box"><small>'+safe(l)+'</small><strong>'+safe(n)+'</strong></div>').join('');
stack('hi-dpc-old','hi-dpc-old-key',[['D1', '#a14250'],['D2','#cd655b'],['D3','#14818e'],['非DPC','#a4b4c2']].map(([n,color])=>[n,subset.filter(x=>x.dpc===n).length,color]));
chart('hi-beds',[['0〜99床',0,99],['100〜199床',100,199],['200〜299床',200,299],['300〜499床',300,499],['500〜799床',500,799],['800床以上',800,Infinity]].map(([n,min,max])=>[n,subset.filter(x=>x.beds>=min&&x.beds<=max).length]));
chart('hi-flags',['救急','がん','地域支援','大学','特定','精神','DPC外'].map(n=>[n,subset.filter(x=>tags(x).some(t=>t.includes(n))).length]),7);
chart('hi-pref',count(subset,x=>x.pref));
chart('hi-group',count(subset,x=>x.group));
E('hi-coverage').textContent='抽出'+fmt(subset.length)+'施設。診療科名・医師数は現行原票に確定データがなく、全数での診療科割合は未算出です。個別公式情報を確認したもののみ参考表示し、未確認値を0に換算しません。';
}
const labels=['県','No.','病院名／公式Web','所在地','病床数','旧DPC','機能フラグ','設置主体（推定）','系列（推定）','診療科目','医師数','関連病院・特徴'];
const th=table.tHead.rows[0];for(const label of labels.slice(9)){const cell=document.createElement('th');cell.textContent=label;th.append(cell)}
const tbody=table.tBodies[0];
const rowMap=new WeakMap(D.map(x=>[x.row,x]));
function decorate(){for(const row of tbody.rows){if(row.dataset.rev6)return;const x=rowMap.get(row);if(!x)continue;row.dataset.rev6='1';
for(let i=0;i<row.cells.length;i++)row.cells[i].dataset.label=labels[i]||'詳細';
const n=row.cells[2],name=x.cells[2],e=evidence(x),a=document.createElement('a');a.className='hi-hospital-name';a.textContent=name;a.href=site(x);a.target='_blank';a.rel='noopener noreferrer';a.title=e?'公式病院Webを開く':'公式サイトを検索・施設一致未確認';n.insertBefore(a,n.firstChild);
for(const child of Array.from(n.childNodes))if(child.nodeType===3&&child.textContent.trim()===name)child.remove();
const verifiedTag=document.createElement('span');verifiedTag.className='hi-official-badge';verifiedTag.textContent=e?'公式資料確認：'+e.year:'公式サイト検索（未確認）';n.append(verifiedTag);
const values=[e?.specialties||'未確認',e?.physicians!=null?fmt(e.physicians)+'名（出典時点明記）':'未確認',(x.group?'系列推定：'+x.group:'関連病院：未確認')+'／'+(e?.features||'原票タグ：'+(tags(x).join('・')||'未判定'))];
values.forEach((v,i)=>{const cell=row.insertCell();cell.className='hi-extra'+(i===2?' hi-feature':'');cell.dataset.label=labels[i+9];cell.textContent=v});
}}
decorate();const observer=new MutationObserver(()=>{decorate();refresh()});observer.observe(tbody,{childList:true});
['q','prefSel','dpcSel','ownerSel','groupSel','evidenceSel'].forEach(id=>{const el=E(id);if(el)el.addEventListener(id==='q'?'input':'change',()=>setTimeout(refresh,180))});
E('clearFilters')?.addEventListener('click',()=>setTimeout(refresh,180));
const quote=v=>{let s=String(v??'');if(/^[=+@\-	\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};
E('hi-save').addEventListener('click',()=>{const out=[['県','No.','病院名','所在地','病床数（原票）','DPC旧区分','機能タグ','設置主体推定','系列グループ推定','診療科目','所属医師数','関連病院','特徴','公式Web/検索URL','照合状況']];for(const x of subset){const e=evidence(x);out.push([x.pref,x.cells[1],x.cells[2],x.cells[3],x.beds,x.dpc,x.cells[6],x.owner,x.group||'未確認',e?.specialties||'未確認',e?.physicians??'未確認','未確認',e?.features||'原票：'+tags(x).join('・'),site(x),e?'公式資料確認':'Web検索のみ・未照合'])}const csv='\uFEFF'+out.map(r=>r.map(quote).join(',')).join('\r\n'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='hospital_research_rev6.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1200)});
refresh();
})();