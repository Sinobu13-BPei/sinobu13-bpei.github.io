/* Uploaded-source synthesis for Saga. Commercial figures are estimates, DPC 2023 is historical. No personal names/contact details. */
(()=>{"use strict";
const D={
  years:[2020,2023,2024],market:[186,208,223],
  areaLabels:["中部","東部","北部","西部","南部"],
  marketAreas:[92.4614,35.0449,32.6974,19.3248,43.4714],
  dpcCompletion:[115.6,37.5,86.8,56.1,95.8],
  dpcResident:[34.0,10.1,13.4,8.4,17.8],
  dpcMedical:[39.3,3.8,11.6,4.7,17.1],
  mdcDigestive:[19.9,27.2,26.5,29.3,23.0],
  oldListCount:[268,88,87,47,97],
  specialtyLabels:["内科・消化器等","小児科","整形外科","皮膚科","眼科","耳鼻咽喉科","精神・心療内科","産科・婦人科"],
  specialtyCount:[381,145,74,48,47,35,31,30]
};
const n=id=>document.getElementById(id);
function chart(id,type,labels,datasets,opts={}){if(!window.Chart||!n(id))return;new Chart(n(id),{type,data:{labels,datasets},options:{responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{position:"bottom",labels:{font:{size:11},boxWidth:12}}},scales:{x:{beginAtZero:false,ticks:{font:{size:10}}},y:{beginAtZero:true,ticks:{font:{size:10}}}},...opts}})}
chart("marketTrend","line",D.years.map(String),[{label:"県内医療機器末端市場（民間推計・億円）",data:D.market,pointRadius:5,borderWidth:3,borderColor:"#188295",backgroundColor:"#188295"}],{scales:{x:{},y:{beginAtZero:false,min:150,max:250}}});
chart("areaMarket","bar",D.areaLabels,[{label:"2024年度参考市場推計（億円）",data:D.marketAreas,backgroundColor:"#267f9b"}],{indexAxis:"y",scales:{x:{beginAtZero:true},y:{}}});
chart("dpcCompletion","bar",D.areaLabels,[{label:"2023年度 DPC完結率（％）",data:D.dpcCompletion,backgroundColor:D.dpcCompletion.map(x=>x>=100?"#216c8a":x>=80?"#43a39f":"#d9a351")}],{scales:{x:{},y:{beginAtZero:true,max:130}}});
chart("mdcDigestive","bar",D.areaLabels,[{label:"消化器系・肝胆膵のDPC退院患者構成比（％）",data:D.mdcDigestive,backgroundColor:"#23889f"}],{indexAxis:"y",scales:{x:{beginAtZero:true,max:35},y:{}}});
chart("specialtySample","bar",D.specialtyLabels,[{label:"2024年4月提供リスト内該当施設数（重複あり）",data:D.specialtyCount,backgroundColor:"#468ca3"}],{indexAxis:"y",scales:{x:{beginAtZero:true},y:{}}});
n("dpcAreaRows").innerHTML=D.areaLabels.map((area,i)=>"<tr><th>"+area+"</th><td>"+D.dpcCompletion[i].toFixed(1)+"%</td><td>"+D.dpcResident[i].toFixed(1)+"千件</td><td>"+D.dpcMedical[i].toFixed(1)+"千件</td><td>"+D.mdcDigestive[i].toFixed(1)+"%</td><td>"+D.oldListCount[i]+"件</td></tr>").join("");
n("marketAreaRows").innerHTML=D.areaLabels.map((area,i)=>"<tr><th>"+area+"</th><td>"+D.marketAreas[i].toFixed(1)+"億円</td><td>"+(D.marketAreas[i]/223*100).toFixed(1)+"%</td></tr>").join("")+"<tr><th>県合計（丸め前集計）</th><td><b>223.0億円</b></td><td>100%</td></tr>";
window.SAGA_SUPPLEMENT_QA={areas:D.areaLabels.length,years:D.years.length,dpcRange:D.dpcCompletion.every(x=>x>=0&&x<=130),sampleSize:D.oldListCount.reduce((a,b)=>a+b,0),marketTotal:Math.round(D.marketAreas.reduce((a,b)=>a+b,0))};
})();
