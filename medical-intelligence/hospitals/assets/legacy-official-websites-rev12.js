/* Rev.12 source-safe overlay: retarget ONLY existing hospital-research name
   anchors for the 3,098 uniquely matched MHLW Navi-listed homepages.
   Other 4,921 hospitals keep their original search links and evidence badges.
   No changes to source rows, hospital names, DPC, filters or page navigation. */
(()=>{"use strict";
const URL_CSV="/medical-intelligence/hospitals/facility-master/data/legacy-official-site-links-20260601.csv";
const HEADER=["facility_uid","source_row_no","prefecture","facility_name","address",
              "website_url","navi_facility_id_confirmed","source_data_as_of"];
const key=(p,n,a)=>[String(p).trim(),String(n).trim(),String(a).trim()].join("\u001f");
const setStatus=(state,detail)=>{window.__legacyOfficialWebsites={state,detail};};
setStatus("loading","医療情報ネット掲載Webの照合データを取得中");

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
  throw Error("医療情報ネット掲載Webの列定義が一致しません");
 if(table.length!==3098)throw Error("掲載Webの確定対応件数が3,098件と一致しません");
 const map=new Map(),uids=new Set(),sourceRows=new Set();
 for(const record of table){
  if(record.length!==HEADER.length)throw Error("掲載Web CSVの列数が不正");
  const row=Object.fromEntries(HEADER.map((h,i)=>[h,record[i]]));
  const k=key(row.prefecture,row.facility_name,row.address);
  const url=safeUrl(row.website_url);
  const index=Number(row.source_row_no);
  if(!url||row.source_data_as_of!=="2026-06-01"||
     !row.facility_uid.startsWith("LEG-")||!row.navi_facility_id_confirmed||
     !Number.isInteger(index)||index<1||index>8019)
   throw Error("掲載WebのURL・出典・行番号が不正");
  if(map.has(k)||uids.has(row.facility_uid)||sourceRows.has(index))
   throw Error("掲載Webに病院・UID・原票行番号の重複があります");
  map.set(k,{url,row});uids.add(row.facility_uid);sourceRows.add(index);
 }
 return map;
}
function initialize(map){
 const source=window.__hospitalResearch;
 const table=document.getElementById("detailTable");
 if(!Array.isArray(source)||source.length!==8019||!table||!table.tBodies[0])
  throw Error("元の8,019病院データまたは一覧テーブルが読み込めません");
 // The legacy controller retains all 8,019 original records as {pref, cells, row}.
 // Its Rev6 research script decorates each paginated row with a.hi-hospital-name.
 // Use the immutable source record, NEVER the decorated cell's textContent,
 // which also contains "Map", evidence badges and link labels.
 const sourceRows=new WeakMap(),seen=new Set();
 for(const [k,hit] of map){
  const sourceIndex=Number(hit.row.source_row_no)-1;
  const x=source[sourceIndex];
  if(!x||!x.row||!Array.isArray(x.cells)||x.cells.length<7||
     key(x.pref,x.cells[2],x.cells[3])!==k)
   throw Error("原票行番号と病院名・所在地の組み合わせが一致しません");
  if(seen.has(x.row))throw Error("複数のWebリンクが同じ原票行を指しています");
  seen.add(x.row);
  sourceRows.set(x.row,{...hit,originalName:x.cells[2]});
 }
 if(seen.size!==3098)throw Error("原票と確定URL3,098件の対応関係が崩れています");
 const tbody=table.tBodies[0];
 let pending=false;
 function apply(){
  let displayed=0,linked=0;
  for(const tr of tbody.rows){
   displayed++;
   const hit=sourceRows.get(tr);
   if(!hit)continue;
   const anchor=tr.cells[2]?.querySelector("a.hi-hospital-name");
   if(!anchor||anchor.textContent!==hit.originalName)continue;
   // Do not replace the original node: preserve its functionality, badge,
   // other controls, the Map link and the existing Rev6 event handlers.
   anchor.href=hit.url;
   anchor.target="_blank";
   anchor.rel="noopener noreferrer";
   anchor.title="医療情報ネット2026年6月施設票に掲載の案内用ホームページ。リンク先の現況・帰属は未確認。";
   anchor.dataset.naviWeb="2026-06-01";
   anchor.classList.add("rev12-hospital-official-link");
   // The Rev6 badge originally describes a Google search. When the link
   // becomes a Navi-listed homepage, keep the caution but remove the false
   // "search" action label. Preserve separately verified clinical badges.
   const badge=tr.cells[2]?.querySelector(".hi-official-badge");
   if(badge?.textContent.includes("公式サイト検索"))
     badge.textContent="医療情報ネット掲載URL（現況未確認）";
   linked++;
  }
  if(displayed){
   setStatus("ready",{totalSourceRows:8019,confirmedSourceLinks:3098,
    unlinked:4921,renderedRows:displayed,linkedRenderedRows:linked});
  }
 }
 function schedule(){
  if(pending)return;
  pending=true;
  queueMicrotask(()=>{pending=false;apply()});
 }
 // The Rev6 research script inserts a.hi-hospital-name on each paginated
 // source row and rebuilds the tbody on search/sort/pagination.
 // Observe the tbody's children only, avoiding recursive mutations of
 // all elements and avoiding animation frames throttled in headless Chrome.
 const observer=new MutationObserver(schedule);
 observer.observe(tbody,{childList:true,subtree:true});
 const legend=document.createElement("div");
 legend.className="rev12-hospital-site-legend";
 legend.textContent="病院名：医療情報ネット（2026年6月版）掲載の案内用ホームページがある施設は直接リンク。その他は従来の「公式サイト検索（未確認）」を維持。掲載URLの現況・施設帰属は全件独立確認していません。";
 legend.setAttribute("role","note");
 table.before(legend);
 apply();
 document.addEventListener("DOMContentLoaded",schedule);
 window.addEventListener("load",schedule);
 const events=["click","change","input"];
 for(const type of events){
  document.addEventListener(type,()=>setTimeout(schedule,0),true);
 }
}
fetch(URL_CSV,{cache:"no-store"}).then(resp=>{
 if(!resp.ok)throw Error("掲載Web CSV HTTP "+resp.status);
 return resp.text();
}).then(text=>initialize(loadMap(text))).catch(err=>{
 setStatus("error",String(err));
 console.error("[Rev12 legacy hospital official website overlay]",err);
});
})();
