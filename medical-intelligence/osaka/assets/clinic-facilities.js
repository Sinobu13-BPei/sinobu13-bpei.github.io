/* Osaka public facility statistics, sourced from Osaka Prefecture 2023 / Osaka City 2025 / Osaka Medical Association. */
(()=>{"use strict";
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=v=>Number(v).toLocaleString("ja-JP");
const val=x=>x==null?"—":fmt(x);
const sum=(data,key)=>data.reduce((a,v)=>a+(v[key]||0),0);
const official="https://www.osaka.med.or.jp/citizen/district.html";
const gm=(name,area)=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(name+" "+area);
const safeLink=(url,label)=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(label)+'</a>';
function renderTable(id,rows){const t=$(id);if(t){const body=t.querySelector("tbody");if(body)body.innerHTML=rows}}
function chart(id,fallback,labels,values,label){const canvas=$(id);try{if(!canvas||typeof Chart==="undefined")throw new Error("chart library unavailable");new Chart(canvas,{type:"bar",data:{labels,datasets:[{label,data:values,backgroundColor:"#167c97",borderRadius:5,maxBarThickness:29}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,ticks:{precision:0}}}}})}catch(err){if(canvas)canvas.style.display="none";const e=$(fallback);if(e){e.classList.add("show");e.innerHTML='<table><tbody>'+labels.map((x,i)=>'<tr><td>'+esc(x)+'</td><td>'+fmt(values[i])+'</td></tr>').join("")+'</tbody></table>'}}}
function render(fm){const rr=fm.regions2023||[],aa=fm.associations||[],ww=fm.wards2025||[],mm=fm.municipality2023||[];
const rMap=new Map(rr.map(x=>[x.name,x]));
const regionRow=r=>'<tr><td>'+esc(r.name)+'</td><td>'+fmt(r.clinics)+'</td><td>'+fmt(r.hospitals)+'</td><td>'+fmt(r.dental)+'</td><td>'+fmt(r.clinics+r.hospitals+r.dental)+'</td><td>'+fmt(r.associationCount)+'</td><td class="wrapcell">'+esc(r.members.join("・"))+'</td></tr>';
const totalRow='<tr class="facilityTotal"><td>大阪府計</td><td>'+fmt(sum(rr,"clinics"))+'</td><td>'+fmt(sum(rr,"hospitals"))+'</td><td>'+fmt(sum(rr,"dental"))+'</td><td>'+fmt(sum(rr,"clinics")+sum(rr,"hospitals")+sum(rr,"dental"))+'</td><td>'+fmt(sum(rr,"associationCount"))+'</td><td>43市町村・地域医師会57団体</td></tr>';
renderTable("clinicRegionTable",rr.map(regionRow).join("")+totalRow);
const sumWard='<tr class="facilityTotal"><td>大阪市計</td><td>'+fmt(sum(ww,"clinics"))+'</td><td>'+fmt(sum(ww,"hospitals"))+'</td><td>'+fmt(sum(ww,"dental"))+'</td><td>24区／26団体</td></tr>';
renderTable("wardClinicTable",ww.map(w=>'<tr><td>'+esc(w.name)+'</td><td>'+fmt(w.clinics)+'</td><td>'+fmt(w.hospitals)+'</td><td>'+fmt(w.dental)+'</td><td class="wrapcell">'+esc(w.physicianAssociations.join("／"))+(w.physicianAssociations.length>1?'（同一区の施設数を共有）':'')+'</td></tr>').join("")+sumWard);
const muniRegion=new Map(rr.flatMap(r=>r.members.map(n=>[n,r.name])));
renderTable("municipalityClinicTable",mm.map(m=>'<tr><td>'+esc(muniRegion.get(m.name))+'</td><td>'+esc(m.name)+'</td><td>'+fmt(m.clinics)+'</td><td>'+fmt(m.hospitals)+'</td><td>'+fmt(m.dental)+'</td></tr>').join(""));
const regionControl=$("assocRegion"),query=$("assocSearch");
if(regionControl){regionControl.innerHTML='<option value="">全医療圏・職域</option>'+rr.map(r=>'<option value="'+esc(r.name)+'">'+esc(r.name)+'</option>').join("")+'<option value="職域">大学・職域（7団体）</option>'}
function filterAssoc(){const region=regionControl?.value||"",keyword=(query?.value||"").toLowerCase().trim();const filtered=aa.filter(a=>(!region||(region==="職域"?!a.year:a.region===region))&&(!keyword||(a.name+" "+a.coverage+" "+(a.region||"")).toLowerCase().includes(keyword)));
const trs=filtered.map(a=>{const shared=a.shared?'<strong class="shared">同一市区の施設数を共有</strong>　':"";const links=safeLink(official,"医師会公式一覧")+" / "+safeLink(gm(a.name,"大阪府"+a.coverage),"Googleマップ")+" / "+safeLink("https://maps.gsi.go.jp/","地理院地図");return '<tr><td>'+esc(a.region||"大学・職域")+'</td><td class="wrapcell"><b>'+esc(a.name)+'</b></td><td class="wrapcell">'+esc(a.coverage)+'</td><td>'+val(a.clinics)+'</td><td>'+val(a.hospitals)+'</td><td>'+val(a.dental)+'</td><td>'+(a.year?esc(a.year.substring(0,4)):"—")+'</td><td class="wrapcell">'+shared+esc(a.note)+'<div class="assoclinks">'+links+'</div></td></tr>'}).join("");
renderTable("associationTable",trs||'<tr><td colspan="8">該当する医師会がありません。</td></tr>');
if($("assocMatchCount"))$("assocMatchCount").textContent=filtered.length+"件 / 64団体"}
regionControl?.addEventListener("change",filterAssoc);query?.addEventListener("input",filterAssoc);filterAssoc();
chart("clinicRegionChart","clinicRegionFallback",rr.map(x=>x.name),rr.map(x=>x.clinics),"一般診療所数（2023）");
chart("physicianCountChart","physicianCountFallback",rr.map(x=>x.name),rr.map(x=>x.associationCount),"地域医師会数");
const applyCardCounts=()=>{const cards=$("areaCards");if(!cards)return;for(const card of cards.querySelectorAll(".regioncard")){if(card.querySelector(".region-facility-strip"))continue;const title=card.querySelector("h3");const region=rr.find(r=>title?.textContent?.trim().startsWith(r.name));if(!region)continue;const el=document.createElement("div");el.className="region-facility-strip";el.innerHTML='<span>一般診療所 <b>'+fmt(region.clinics)+'</b></span><span>病院 <b>'+fmt(region.hospitals)+'</b></span><span>歯科診療所 <b>'+fmt(region.dental)+'</b></span><span>地域医師会 <b>'+fmt(region.associationCount)+'</b></span><small>施設：2023年／医師会：2026年参照</small>';card.querySelector(".head")?.insertAdjacentElement("afterend",el)}};
applyCardCounts();const cards=$("areaCards");if(cards){const observer=new MutationObserver(()=>applyCardCounts());observer.observe(cards,{childList:true})}
}
fetch("./data/data.json?v=20261027-facilities",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(d=>{if(!d.facilityMarket)throw Error("施設数データ未登録");render(d.facilityMarket)}).catch(err=>{const box=$("clinicRegionTable")?.closest(".scroll");if(box){const p=document.createElement("p");p.textContent="施設数データを取得できません。ページを再読み込みしてください。"+err.message;box.prepend(p)}});
})();