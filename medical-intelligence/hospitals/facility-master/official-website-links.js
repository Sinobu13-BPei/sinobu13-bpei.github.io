/* Rev.11: Link only exact-confirmed source-pinned MHLW Navi homepage records.
   A listed homepage URL is not independent proof of current validity or ownership. */
(()=>{"use strict";
const DATA="data/official-websites-navi-20260601.csv";
const fields=["facility_uid","legacy_prefecture","legacy_name","navi_facility_id_confirmed",
"website_url","website_evidence","source_data_as_of","source_url","source_zip_sha256"];
const SOURCE_SHA="b416472ec52a151455e1c91438e0dec5b471e19eafe70e3e2ee1bb22544efe87";
const tables=["records","im-rows"];
const byUid=new Map();
const summary=document.getElementById("official-site-summary");

function parseCSV(text){
 text=text.replace(/^\uFEFF/,"");
 const rows=[],row=[];let token="",inside=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(inside){
   if(c==='"'&&text[i+1]==='"'){token+='"';i++}
   else if(c==='"')inside=false;
   else token+=c;
  }else if(c==='"')inside=true;
  else if(c===","){row.push(token);token=""}
  else if(c==="\n"){row.push(token.replace(/\r$/,""));rows.push(row.splice(0));token=""}
  else token+=c;
 }
 if(inside)throw Error("CSV引用符が閉じていません");
 if(token||row.length){row.push(token);rows.push(row)}
 return rows;
}
function safeUrl(raw){
 try{
  if(/[\x00-\x20\x7f<>"'\\]/.test(raw))return null;
  const url=new URL(raw);
  if(!["http:","https:"].includes(url.protocol)||url.username||url.password)return null;
  if(!url.hostname||url.hostname==="localhost")return null;
  return url.href;
 }catch{return null}
}
function applyToTable(id){
 const node=document.getElementById(id);
 if(!node)return;
 for(const tr of node.querySelectorAll("tr[data-facility-uid]")){
  const linkData=byUid.get(tr.dataset.facilityUid);
  if(!linkData||tr.dataset.websiteLinked==="yes")continue;
  const cell=tr.cells[1];
  if(!cell||cell.querySelector("a"))continue;
  const hospitalName=cell.textContent;
  if(!hospitalName)continue;
  const link=document.createElement("a");
  link.href=linkData.url;
  link.textContent=hospitalName;
  link.className="official-site-name-link";
  link.dataset.officialSite="navi-20260601";
  link.rel="noopener noreferrer";
  link.target="_blank";
  link.title="医療情報ネット2026年6月施設票掲載の案内用ホームページ（リンク先の現況は未確認）";
  cell.replaceChildren(link);
  tr.dataset.websiteLinked="yes";
 }
}
function apply(){for(const id of tables)applyToTable(id)}
for(const id of tables){
 const body=document.getElementById(id);
 if(body)new MutationObserver(apply).observe(body,{childList:true,subtree:true});
}
fetch(DATA,{cache:"no-store"}).then(r=>{
 if(!r.ok)throw Error("施設URL CSV HTTP "+r.status);
 return r.text();
}).then(text=>{
 const parsed=parseCSV(text),header=parsed.shift();
 if(!header||header.length!==fields.length||fields.some((v,i)=>header[i]!==v))
  throw Error("掲載URLの列定義が一致しません");
 if(parsed.length<1000||parsed.length>3453)throw Error("掲載URL件数が想定外です");
 for(const cols of parsed){
  if(cols.length!==fields.length)throw Error("掲載URL CSVの行が不正です");
  const row=Object.fromEntries(fields.map((k,i)=>[k,cols[i]]));
  const url=safeUrl(row.website_url);
  if(!url||row.source_zip_sha256!==SOURCE_SHA||row.source_data_as_of!=="2026-06-01"||
     !row.facility_uid.startsWith("LEG-")||!row.navi_facility_id_confirmed)
    throw Error("出典・URL・施設IDの整合性がありません");
  if(byUid.has(row.facility_uid))throw Error("掲載URLの施設ID重複");
  byUid.set(row.facility_uid,{url,navi:row.navi_facility_id_confirmed});
 }
 if(summary)summary.textContent="医療情報ネット掲載の施設Web："+byUid.size.toLocaleString("ja-JP")+"件（2026年6月版。リンク先の現在の稼働・帰属は全件未確認）";
 window.__officialWebsiteOverlay={ready:true,count:byUid.size,error:""};
 apply();
}).catch(err=>{
 byUid.clear();
 if(summary)summary.textContent="施設Webリンクを確認できません。病院名は通常表示し、誤ったURLへは誘導しません。";
 window.__officialWebsiteOverlay={ready:false,count:0,error:String(err)};
 console.error("[Hospital official website overlay]",err);
});
})();
