/* Hiroshima extra research | user-supplied materials, vetted aggregates, 2026-10-27.
No dealer sales, shares, individual transactions, specific account plans, or third-party imagery.
This dataset intentionally separates official-source metrics from privately estimated market values. */
window.HIROSHIMA_DEEP_RESEARCH={
  reviewedFiles:14,
  originDescription:"添付資料：広島県医療需給総覧（7圏域、2026）、医療施設・市場規模に関するExcel・Word・PowerPoint（計13資料）",
  geo:{year:2020,sourceName:"総務省「令和2年国勢調査」・社会人口統計体系",sourceUrl:"https://www.e-stat.go.jp/stat-search/files?page=1&toukei=00200521"},
  dpc:{year:2023,sourceName:"厚生労働省 令和5年度DPC退院患者調査に基づく医療圏別参考集計（千件、原資料集計）",sourceUrl:"https://www.mhlw.go.jp/stf/shingi2/newpage_00137.html",
       caveat:"所在地症例数÷住所地症例数×100。添付資料では「完結率」と表記されているが、100%超があり、自医療圏内完結率ではなく患者受療量の流入・流出を示す需給比として扱う。施設所在地と患者住所地の件数は丸め値。"},
  physician:{year:2024,sourceName:"厚生労働省「医師偏在指標関連データ」2024年1月公表版（旧版）",sourceUrl:"https://www.mhlw.go.jp/content/10800000/001364029.pdf",caveat:"過去版であり2026年公表の県別指標と異なる。全国・県・圏域で比較対象集団も異なる。"},
  area:[
    {name:"広島",population2020:1366912,landKm2:2506.13,density:545.4,habitableShare:24,physicianIndex2024:298.9,dpcResidentK:113.4,dpcFacilityK:121.2,medicalInsight:"大学・高度急性期への診療機能集積。施設再編の際は画像診断の集約と診療所の紹介動線を一体設計。"},
    {name:"広島西",population2020:140492,landKm2:568.15,density:247.3,habitableShare:16,physicianIndex2024:239.1,dpcResidentK:12.5,dpcFacilityK:13.6,medicalInsight:"県西部の紹介基盤を維持しながら、慢性期・回復期と市内中核病院への検査アクセスをつなぐ。"},
    {name:"呉",population2020:236522,landKm2:453.55,density:521.5,habitableShare:44,physicianIndex2024:266.7,dpcResidentK:27.9,dpcFacilityK:29.0,medicalInsight:"海上交通・高齢化と高度救急が並存。地域内の撮影・治療機能の維持と設備停止BCPが要点。"},
    {name:"広島中央",population2020:227759,landKm2:796.50,density:285.9,habitableShare:38,physicianIndex2024:200.4,dpcResidentK:18.5,dpcFacilityK:13.6,medicalInsight:"所在地症例数が住所地症例数を大きく下回る。東広島の紹介検査・遠隔画像連携の改善余地。"},
    {name:"尾三",population2020:236868,landKm2:1034.76,density:228.9,habitableShare:37,physicianIndex2024:198.2,dpcResidentK:24.1,dpcFacilityK:23.4,medicalInsight:"尾道・三原・しまなみの機能分担。患者移動と紹介検査、急性期から回復期への連携が重要。"},
    {name:"福山・府中",population2020:506835,landKm2:1095.87,density:462.5,habitableShare:34,physicianIndex2024:201.3,dpcResidentK:44.4,dpcFacilityK:43.9,medicalInsight:"備後の第二拠点として救急・専門医療を支える。高齢化地域からの紹介と病院増改築に伴う装置運用が課題。"},
    {name:"備北",population2020:84314,landKm2:2024.67,density:41.6,habitableShare:19,physicianIndex2024:219.8,dpcResidentK:9.2,dpcFacilityK:9.0,medicalInsight:"低密度・広域医療圏。検査の共同利用、代替機・保守の移動費、遠隔診療支援を重視。"}
  ],
  populationProjections:{
   base:"社人研令和5（2023）年地域別将来人口推計：各医療圏の5歳階級集計、日本経営「医療需給総覧」2026年版で照合",
   sourceUrl:"https://www.ipss.go.jp/pp-shicyoson/j/shicyoson23/2gaiyo_hyo/gaiyo.asp",
   years:[2020,2025,2030,2035,2040,2045,2050],
   areas:[
    {name:"広島",total:[1366912,1343402,1316307,1284960,1249315,1210770,1170761],age75:[183274,222286,233758,231689,230787,238846,262089],working:[824912,806622,786610,749134,690582,650177,621347]},
    {name:"広島西",total:[140492,137126,132560,127484,122102,116545,111195],age75:[22350,26772,28814,28940,27894,27150,27998],working:[78141,74653,71972,68144,62622,58498,54913]},
    {name:"呉",total:[236522,214867,198491,182230,166607,152313,139383],age75:[47272,52543,50700,46093,41833,39805,40780],working:[126018,112939,105039,94723,81498,71885,64813]},
    {name:"広島中央",total:[227759,225419,221155,215921,209317,202123,195052],age75:[30576,36467,38168,37960,37644,38319,41397],working:[138622,137234,134169,128331,119143,112082,106739]},
    {name:"尾三",total:[236868,220782,206492,192397,178608,165442,152998],age75:[46619,51247,52011,49749,45806,42658,42810],working:[123952,113940,107454,99479,88219,79645,72555]},
    {name:"福山・府中",total:[506835,485249,471425,456543,440681,424450,408287],age75:[78568,91812,96416,94202,90220,89113,95230],working:[289393,273591,268159,257097,236970,222153,210990]},
    {name:"備北",total:[84314,77052,71448,66279,61345,56483,51851],age75:[18753,19381,19616,19003,17540,16035,15570],working:[41774,37561,35253,32719,29056,25827,23349]}
   ]
  },
  privateMarket:{type:"民間市場調査の推計値（添付資料由来）",years:[2022,2023,2024],valuesOku:[858,907,925],scope:"国内医療機器末端市場の広島県内推計。画像診断装置以外、材料・SPDなど関連取引を含む。医療施設調査やJIRA出荷統計と定義が異なる。",sourceNote:"添付『34広島県（2026-10-26）.docx』等。公開URLなし、提供元の推計値。転載元文書・販社別内訳・画像は公開していない。"},
  facilityHistory:[
    {year:"2022年（公的統計）",hospitals:232,clinics:2537,source:"第8次保健医療計画資料編・医療施設調査（2022年）",public:true},
    {year:"2024年10月（民間集計）",hospitals:231,clinics:2513,source:"添付『34広島.xlsx』",public:false},
    {year:"2025年1月（民間集計）",hospitals:230,clinics:2508,source:"添付『34広島県（旧版）』",public:false},
    {year:"2026年1月（民間集計）",hospitals:228,clinics:2494,source:"添付『34広島県（2026-10-26）.docx』",public:false}
  ],
  comparisonMethod:"二次医療圏別2020年人口・面積・医師偏在指標2024旧版・DPC2023は調査年度と分母が異なる。2025年国勢調査確定値や2025年病床機能報告の実績と同列には扱わない。",
  editorialWarnings:[
    "DPC施設所在地／患者住所地比は受療完結率そのものではなく、100%を超え得る。",
    "医師偏在指標（2024年1月版）は新しい2026年指標とは連続比較できない。",
    "民間推計の市場規模と医療機器メーカー出荷額、医療機関設備投資額、診療所の件数は互換性がない。",
    "区域の面積が広いことと医療機器市場が大きいことは同義でない。"
  ]
};