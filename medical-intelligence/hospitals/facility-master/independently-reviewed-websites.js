/* Rev.14: combine the 13 historical and 4 new source-evidenced website reviews.
   NEVER promote a website confirmation into a Navi ID match-status change. */
(()=>{"use strict";
const DATA="/medical-intelligence/hospitals/facility-master/data/independently-reviewed-websites-20261122.csv";
const DATA14="/medical-intelligence/hospitals/facility-master/data/independently-reviewed-websites-20261123.csv";
const COLUMNS=["facility_uid","source_row_no","prefecture","facility_name_legacy","address_legacy",
"verified_website_url","review_outcome","current_hospital_name","reviewed_on",
"primary_evidence_url","secondary_evidence_url","original_review_bucket",
"identity_decision","review_notes"];
const normalize=s=>String(s||"").trim();
const key=(p,n,a)=>[normalize(p),normalize(n),normalize(a)].join("\u001f");
function csv(text,expectedCount,expectedDate){
 text=text.replace(/^\uFEFF/,"");let rows=[],line=[],token="",quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){
   if(c==='"'&&text[i+1]==='"'){token+='"';i++}
   else if(c==='"')quoted=false;
   else token+=c;
  }else if(c==='"')quoted=true;
  else if(c===","){line.push(token);token=""}
  else if(c==="\n"){line.push(token.replace(/\r$/,""));rows.push(line.splice(0));token=""}
  else token+=c;
 }
 if(quoted)throw Error("CSV quotation invalid");
 if(token||line.length){line.push(token);rows.push(line)}
 const cols=rows.shift();
 if(!cols||cols.length!==COLUMNS.length||COLUMNS.some((c,i)=>cols[i]!==c))
  throw Error("Reviewed hospital website CSV header changed");
 if(rows.length!==expectedCount)throw Error("Unexpected independently verified record count: "+rows.length);
 const found=new Map(),usedIndex=new Set(),usedURLs=new Set(),usedNameAddr=new Set();
 for(const data of rows){
  if(data.length!==COLUMNS.length)throw Error("Reviewed site column count mismatch");
  const row=Object.fromEntries(COLUMNS.map((k,i)=>[k,data[i]]));
  const address=key(row.prefecture,row.facility_name_legacy,row.address_legacy);
  const i=Number(row.source_row_no);
  const url=secureUrl(row.verified_website_url);
  if(!/^LEG-[0-9a-f]{16}$/.test(row.facility_uid)||!url||
      !Number.isInteger(i)||i<1||i>8019||
      row.reviewed_on!==expectedDate||
      !["verified_same_name","verified_renamed"].includes(row.review_outcome)||
      !secureUrl(row.primary_evidence_url)||!secureUrl(row.secondary_evidence_url)||
      !normalize(row.current_hospital_name)||
      !row.identity_decision.includes("維持"))
    throw Error("Reviewed site not independently documented / unsafe URL");
  if(found.has(row.facility_uid)||usedIndex.has(i)||usedNameAddr.has(address))
    throw Error("Reviewed hospital UID/source row/name+address collision");
  usedIndex.add(i);usedNameAddr.add(address);
  found.set(row.facility_uid,{...row,url});
 }
 if([...found.values()].filter(x=>x.review_outcome==="verified_renamed").length!==1)
   throw Error("Expected exactly one separately evidenced renamed hospital");
 return found;
}
function secureUrl(input){
 try{
  if(/[\x00-\x20\x7f<>"'\\]/.test(input))return null;
  const url=new URL(input);
  if(url.protocol!=="https:"||url.username||url.password||
     !url.hostname||url.hostname==="localhost")return null;
  return url.href;
 }catch{return null}
}
const ready=(detail)=>{window.__independentWebsiteReview={ready:true,detail,error:""}};
function jpDate(value){const [y,m,d]=value.split("-");return y+"年"+Number(m)+"月"+Number(d)+"日"}
function description(r){
 return r.review_outcome==="verified_renamed"
 ? "公式発表により2026年4月1日に「"+r.current_hospital_name+"」へ改称。旧病院名は原票記載。施設ID判定は変更していません。"
 : "病院公式Webと所在地・施設名を"+jpDate(r.reviewed_on)+"個別確認。施設IDの既存照合判定は変更していません。";
}
function applyLegacy(records){
 const data=window.__hospitalResearch;
 const detail=document.getElementById("detailTable");
 if(!Array.isArray(data)||data.length!==8019||!detail?.tBodies[0])
   throw Error("Original 8019-hospital array not found");
 const byRow=new WeakMap();
 for(const record of records.values()){
  const src=data[Number(record.source_row_no)-1];
  if(!src?.row||key(src.pref,src.cells?.[2],src.cells?.[3])!==
    key(record.prefecture,record.facility_name_legacy,record.address_legacy))
    throw Error("Reviewed site does not match the exact legacy row");
  byRow.set(src.row,record);
 }
 const tbody=detail.tBodies[0];
 let scheduled=false;
 function apply(){
  let count=0;
  for(const tr of tbody.rows){
   const row=byRow.get(tr);
   if(!row)continue;
   const a=tr.cells?.[2]?.querySelector("a.hi-hospital-name");
   if(!a||a.textContent!==row.facility_name_legacy)continue;
   if(a.dataset.independentReviewed==="2026-11-22"){count++;continue;}
   if(a.dataset.naviWeb)throw Error("Manual and Navi website overlays overlap");
   a.href=row.url;a.target="_blank";a.rel="noopener noreferrer";
   a.dataset.independentReviewed="2026-11-22";
   a.dataset.reviewOutcome=row.review_outcome;
   a.classList.add("rev12-hospital-official-link");
   a.title=description(row);
   const badge=tr.cells[2].querySelector(".hi-official-badge");
   if(badge){
    badge.textContent=row.review_outcome==="verified_renamed"
      ? "現："+row.current_hospital_name+"（2026年4月1日改称）"
      : "病院公式Web個別確認済（ID照合判定は従来どおり）";
   }
   count++;
  }
  const global=window.__independentWebsiteReview;
  if(global?.ready)global.detail.visibleLegacyLinks=count;
 }
 function schedule(){
  if(scheduled)return;scheduled=true;
  queueMicrotask(()=>{scheduled=false;apply()});
 }
 new MutationObserver(schedule).observe(tbody,{childList:true,subtree:true});
 for(const name of ["click","change","input"])
  document.addEventListener(name,()=>setTimeout(schedule,0),true);
 apply();
}
function applyMaster(records){
 const holders=["records","im-rows"].map(id=>document.getElementById(id)).filter(Boolean);
 if(holders.length!==2)throw Error("Facility master hospital tables not found");
 let scheduled=false;
 function render(){
  let linked=0;
  for(const holder of holders){
   for(const tr of holder.querySelectorAll("tr[data-facility-uid]")){
    const record=records.get(tr.dataset.facilityUid);
    if(!record)continue;
    const td=tr.cells?.[1];
    if(!td)continue;
    if(tr.dataset.independentReviewed==="2026-11-22"){linked++;continue;}
    if(td.querySelector("a"))throw Error("Manual URL overlaps existing hospital site link");
    const oldName=td.textContent;
    if(oldName!==record.facility_name_legacy)throw Error("Hospital name differs from reviewed website identity");
    const a=document.createElement("a");a.href=record.url;
    a.textContent=oldName;a.className="official-site-name-link";
    a.dataset.independentReviewed="2026-11-22";
    a.target="_blank";a.rel="noopener noreferrer";a.title=description(record);
    td.replaceChildren(a);
    if(record.review_outcome==="verified_renamed"){
     const mark=document.createElement("small");
     mark.className="site-rename-note";mark.textContent="現："+record.current_hospital_name+"（2026年4月1日改称）";
     td.append(document.createTextNode(" "),mark);
    }
    tr.dataset.independentReviewed="2026-11-22";linked++;
   }
  }
  if(window.__independentWebsiteReview?.ready)
    window.__independentWebsiteReview.detail.visibleMasterLinks=linked;
 }
 function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;render()})}
 for(const holder of holders)new MutationObserver(schedule).observe(holder,{childList:true,subtree:true});
 render();
}
Promise.all([DATA,DATA14].map(url=>fetch(url,{cache:"no-store"}))).then(responses=>{
 if(responses.some(response=>!response.ok))throw Error("Manual-reviewed site CSV load failed");
 return Promise.all(responses.map(response=>response.text()));
}).then(texts=>{
 const historical=csv(texts[0],13,"2026-11-22");
 const current=csv(texts[1],4,"2026-11-23");
 const rows=new Map([...historical,...current]);
 if(rows.size!==17)throw Error("Reviewed website batches contain a UID collision");
 const urls=[...rows.values()].map(row=>row.url);
 if(new Set(urls).size!==urls.length)throw Error("Reviewed website batches contain duplicate destination URLs");
 const detail={count:rows.size,sameName:16,renamed:1,linkTotal:3098+rows.size};
 ready(detail);
 if(document.getElementById("detailTable"))applyLegacy(rows);
 else if(document.getElementById("records"))applyMaster(rows);
 else throw Error("Unsupported hospital page");
 const summary=document.getElementById("manual-site-summary");
 if(summary)summary.textContent="公式Web個別確認：17施設（うち改称1件）。既存の医療情報ネット掲載3,098件と合わせて3,115件に直接リンク。施設IDの照合判定は変更しません。";
}).catch(err=>{
 window.__independentWebsiteReview={ready:false,error:String(err)};
 const summary=document.getElementById("manual-site-summary");
 if(summary)summary.textContent="個別確認済みWebリンクを読み込めません。既存3,098件の掲載リンクは別処理で維持します。";
 console.error("[Rev14 manually reviewed hospital websites]",err);
});
})();
