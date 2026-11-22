/* Rev.12 safe overlay: no edits to original 8,019 hospital rows or filters.
   Pinned identity (prefecture + hospital name + address) is the only link key. */
(()=>{"use strict";
const URL_CSV="/medical-intelligence/hospitals/facility-master/data/legacy-official-site-links-20260601.csv";
const HEADER=["facility_uid","source_row_no","prefecture","facility_name","address",
              "website_url","navi_facility_id_confirmed","source_data_as_of"];
const key=(p,n,a)=>[p.trim(),n.trim(),a.trim()].join("\u001f");
const setStatus=(state,detail)=>{window.__legacyOfficialWebsites={state,detail};};
setStatus("loading","公式Webリンク照合データを取得中");

function parseCSV(input){
 input=input.replace(/^\uFEFF/,"");
 const out=[],row=[];let part="",quoted=false;
 for(let i=0;i<input.length;i++){
  const ch=input[i];
  if(quoted){
   if(ch==='"'&&input[i+1]==='"'){part+='"';i++}
   else if(ch==='"')quoted=false;
   else part+=ch;
  }else if(ch==='"')quoted=true;
  else if(ch===","){row.push(part);part=""}
  else if(ch==="\n"){row.push(part.replace(/\r$/,""));out.push(row.splice(0));part=""}
  else part+=ch;
 }
 if(quoted)throw Error("CSV引用符不正");
 if(part||row.length){row.push(part);out.push(row)}
 return out;
}
function safeUrl(value){
 try{
  if(/[\x00-\x20\x7f<>"'\\]/.test(value))return null;
  const u=new URL(value);
  if(!["https:","http:"].includes(u.protocol)||u.username||u.password||!u.hostname)return null;
  if(u.hostname.toLowerCase()==="localhost")return null;
  return u.href;
 }catch{return null}
}
function loadMap(text){
 const table=parseCSV(text),head=table.shift();
 if(!head||head.length!==HEADER.length||HEADER.some((h,i)=>head[i]!==h))
  throw Error("公式Webの列定義が一致しません");
 if(table.length!==3098)throw Error("確定リンク件数が3,098件と一致しません");
 const map=new Map(),ids=new Set(),seq=new Set();
 for(const record of table){
  if(record.length!==HEADER.length)throw Error("CSV列数が不正");
  const row=Object.fromEntries(HEADER.map((h,i)=>[h,record[i]]));
  const k=key(row.prefecture,row.facility_name,row.address);
  const url=safeUrl(row.website_url);
  const no=Number(row.source_row_no);
  if(!url||row.source_data_as_of!=="2026-06-01"||!row.facility_uid.startsWith("LEG-")||
     !row.navi_facility_id_confirmed||!Number.isInteger(no)||no<1||no>8019)
   throw Error("公式WebのURL・出典・行番号が不正");
  if(map.has(k)||ids.has(row.facility_uid)||seq.has(no))throw Error("公式Webに重複レコード");
  ids.add(row.facility_uid);seq.add(no);
  map.set(k,{url,row});
 }
 return map;
}
function initialize(map){
 // The original page owns its 8,019 source rows but renders only 100 at once.
 // Do not assert that all 8,019 exist simultaneously in the live DOM.
 // Match each currently visible/paginated row by three original identifiers.
 let scheduled=false,seenTable=null;
 function render(){
  let displayed=0,linked=0;
  const rows=[...document.querySelectorAll("tr[data-text]")];
  for(const tr of rows){
   if(tr.cells.length!==7)continue;
   displayed++;
   const p=tr.cells[0].textContent.trim(),n=tr.cells[2].textContent.trim(),
         a=tr.cells[3].textContent.trim(),found=map.get(key(p,n,a));
   if(!found)continue;
   const cell=tr.cells[2];
   const previous=cell.querySelector("a");
   if(previous){
     // Existing links from original application must never be overwritten.
     if(previous.dataset.naviWeb==="2026-06-01"&&previous.href===found.url)linked++;
     continue;
   }
   if(!n)continue;
   const link=document.createElement("a");
   link.href=found.url;link.textContent=n;
   link.className="rev12-hospital-official-link";
   link.dataset.naviWeb="2026-06-01";
   link.target="_blank";link.rel="noopener noreferrer";
   link.title="医療情報ネット2026年6月施設票に掲載の案内用ホームページ。現況と施設の帰属は未確認。";
   cell.replaceChildren(link);
   tr.dataset.officialSiteLinked="yes";
   linked++;
  }
  const table=rows[0]?.closest("table");
  if(table&&!seenTable){
   seenTable=table;
   if(!document.querySelector(".rev12-hospital-site-legend")){
    const note=document.createElement("div");
    note.className="rev12-hospital-site-legend";
    note.textContent="下線付きの病院名は医療情報ネット（2026年6月版）掲載の案内用ホームページへ移動します。リンク先の現況・帰属は未確認です。照合未確定の施設にはリンクを付けていません。";
    note.setAttribute("role","note");
    table.before(note);
   }
  }
  window.__legacyOfficialWebsites={state:"ready",detail:{
    totalSourceRows:8019,confirmedSourceLinks:map.size,unlinked:8019-map.size,
    renderedRows:displayed,linkedRenderedRows:linked
  }};
 }
 function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;render()});
 }
 // Original listing filters/sorts/paginates 100 rows at a time. Observe
 // only child-list changes; editing a link triggers one harmless second pass.
 const observer=new MutationObserver(schedule);
 observer.observe(document.body,{childList:true,subtree:true});
 render();
}

fetch(URL_CSV,{cache:"no-store"}).then(res=>{
 if(!res.ok)throw Error("施設Web CSV HTTP "+res.status);
 return res.text();
}).then(text=>initialize(loadMap(text))).catch(err=>{
 setStatus("error",String(err));
 console.error("[Rev12 legacy hospital website overlay]",err);
});
})();
