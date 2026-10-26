/* 公開一次資料に基づく集計。分析スコアのみ独自評価。外部提供統計の転載なし。 */
window.SAGA_DATA={
  "meta": {
    "title": "佐賀県 医療機器市場・医療政策・5医療圏",
    "updated": "2026-10-27",
    "method": "公的統計と公開資料の独立分析",
    "status": "公開資料確認版"
  },
  "municipal": [
    {
      "area": "中部",
      "name": "佐賀市",
      "hospitals": 27,
      "clinics": 234,
      "dental": 125,
      "population": 228293
    },
    {
      "area": "中部",
      "name": "多久市",
      "hospitals": 3,
      "clinics": 11,
      "dental": 7,
      "population": 17200
    },
    {
      "area": "中部",
      "name": "小城市",
      "hospitals": 3,
      "clinics": 30,
      "dental": 20,
      "population": 42959
    },
    {
      "area": "中部",
      "name": "神埼市",
      "hospitals": 3,
      "clinics": 22,
      "dental": 14,
      "population": 29908
    },
    {
      "area": "中部",
      "name": "吉野ヶ里町",
      "hospitals": 1,
      "clinics": 11,
      "dental": 6,
      "population": 16322
    },
    {
      "area": "東部",
      "name": "鳥栖市",
      "hospitals": 8,
      "clinics": 72,
      "dental": 37,
      "population": 74707
    },
    {
      "area": "東部",
      "name": "基山町",
      "hospitals": 1,
      "clinics": 13,
      "dental": 9,
      "population": 17366
    },
    {
      "area": "東部",
      "name": "上峰町",
      "hospitals": 1,
      "clinics": 6,
      "dental": 4,
      "population": 9553
    },
    {
      "area": "東部",
      "name": "みやき町",
      "hospitals": 3,
      "clinics": 18,
      "dental": 12,
      "population": 25548
    },
    {
      "area": "北部",
      "name": "唐津市",
      "hospitals": 15,
      "clinics": 102,
      "dental": 57,
      "population": 111510
    },
    {
      "area": "北部",
      "name": "玄海町",
      "hospitals": 0,
      "clinics": 4,
      "dental": 1,
      "population": 5032
    },
    {
      "area": "西部",
      "name": "伊万里市",
      "hospitals": 8,
      "clinics": 39,
      "dental": 24,
      "population": 50309
    },
    {
      "area": "西部",
      "name": "有田町",
      "hospitals": 1,
      "clinics": 17,
      "dental": 5,
      "population": 18037
    },
    {
      "area": "南部",
      "name": "武雄市",
      "hospitals": 5,
      "clinics": 42,
      "dental": 24,
      "population": 46346
    },
    {
      "area": "南部",
      "name": "鹿島市",
      "hospitals": 4,
      "clinics": 18,
      "dental": 14,
      "population": 26506
    },
    {
      "area": "南部",
      "name": "嬉野市",
      "hospitals": 4,
      "clinics": 18,
      "dental": 11,
      "population": 24568
    },
    {
      "area": "南部",
      "name": "大町町",
      "hospitals": 1,
      "clinics": 5,
      "dental": 4,
      "population": 5909
    },
    {
      "area": "南部",
      "name": "江北町",
      "hospitals": 2,
      "clinics": 5,
      "dental": 4,
      "population": 9495
    },
    {
      "area": "南部",
      "name": "白石町",
      "hospitals": 4,
      "clinics": 19,
      "dental": 8,
      "population": 20632
    },
    {
      "area": "南部",
      "name": "太良町",
      "hospitals": 1,
      "clinics": 2,
      "dental": 3,
      "population": 7475
    }
  ],
  "areas": [
    {
      "name": "中部",
      "cities": "佐賀市・多久市・小城市・神埼市・吉野ヶ里町",
      "h": 37,
      "c": 308,
      "d": 172,
      "raw": [
        133,
        2343,
        991,
        1182,
        277
      ],
      "need": [
        372,
        1168,
        1430,
        855
      ],
      "score": [
        5,
        5,
        4,
        3,
        4
      ],
      "lat": 33.26,
      "lon": 130.3,
      "driver": "大学病院・県医療センターを核とする高次医療・専門画像診断・病診連携",
      "issue": "急性期から回復期への機能分化、設備投資と人材確保の両立",
      "opportunity": "画像診断更新、遠隔読影・PACS、がん診療・内視鏡連携、共同利用契約",
      "site": "佐賀大学医学部附属病院／佐賀県医療センター好生館"
    },
    {
      "name": "東部",
      "cities": "鳥栖市・基山町・上峰町・みやき町",
      "h": 13,
      "c": 109,
      "d": 62,
      "raw": [
        20,
        458,
        429,
        819,
        13
      ],
      "need": [
        31,
        286,
        472,
        559
      ],
      "score": [
        3,
        4,
        4,
        5,
        4
      ],
      "lat": 33.374,
      "lon": 130.52,
      "driver": "鳥栖JCT・九州新幹線・福岡久留米通院圏、人口維持地域",
      "issue": "県境患者移動の把握、施設間の検査分担、福岡医療機関との競合・補完",
      "opportunity": "健診・循環器・CT/MRI検査連携、粒子線治療を含む広域患者動線",
      "site": "今村病院／東佐賀病院／九州国際重粒子線がん治療センター"
    },
    {
      "name": "北部",
      "cities": "唐津市・玄海町",
      "h": 15,
      "c": 106,
      "d": 58,
      "raw": [
        16,
        727,
        264,
        559,
        132
      ],
      "need": [
        101,
        378,
        269,
        437
      ],
      "score": [
        3,
        4,
        5,
        4,
        3
      ],
      "lat": 33.449,
      "lon": 129.969,
      "driver": "唐津赤十字病院を軸に救急・離島を含む半島沿岸医療",
      "issue": "離島・沿岸アクセス、人口減・高齢化、災害時物流・保守対応",
      "opportunity": "可搬型US、更新保守、巡回・遠隔読影、地域救急・在宅支援",
      "site": "唐津赤十字病院"
    },
    {
      "name": "西部",
      "cities": "伊万里市・有田町",
      "h": 9,
      "c": 56,
      "d": 29,
      "raw": [
        0,
        397,
        189,
        266,
        63
      ],
      "need": [
        32,
        171,
        244,
        272
      ],
      "score": [
        2,
        3,
        4,
        4,
        3
      ],
      "lat": 33.267,
      "lon": 129.88,
      "driver": "伊万里有田共立病院による広域連携、県境をまたぐ外来受診",
      "issue": "医師確保、装置稼働率、地域完結と佐世保方面への流出",
      "opportunity": "画像共同利用・維持更新、小規模施設への出張保守・検査支援",
      "site": "伊万里有田共立病院"
    },
    {
      "name": "南部",
      "cities": "武雄市・鹿島市・嬉野市・大町町・白石町・江北町・太良町",
      "h": 21,
      "c": 109,
      "d": 68,
      "raw": [
        86,
        1102,
        414,
        681,
        158
      ],
      "need": [
        161,
        635,
        684,
        521
      ],
      "score": [
        4,
        4,
        5,
        4,
        4
      ],
      "lat": 33.192,
      "lon": 130.018,
      "driver": "嬉野医療センター・武雄鹿島地域の救急、温泉地・高齢地域・有明海沿岸",
      "issue": "洪水・内水氾濫、医師・技師の不足、急性期/回復期の再編",
      "opportunity": "BCP保守・代替機、ポータブルUS、回復期対応、装置共同利用",
      "site": "嬉野医療センター／新武雄病院／織田病院"
    }
  ],
  "associations": [
    {
      "name": "佐賀市医師会",
      "area": "中部",
      "cities": [
        "佐賀市"
      ],
      "address": "佐賀市水ヶ江1-12-11",
      "site": "https://www.sagashi-med.or.jp/",
      "lat": 33.246,
      "lon": 130.302
    },
    {
      "name": "神埼市郡医師会",
      "area": "中部",
      "cities": [
        "神埼市",
        "吉野ヶ里町"
      ],
      "address": "神埼市神埼町神埼463-1",
      "site": "https://www.kanzaki-ishikai.com/",
      "lat": 33.313,
      "lon": 130.371
    },
    {
      "name": "多久・小城地区医師会",
      "area": "中部",
      "cities": [
        "多久市",
        "小城市"
      ],
      "address": "小城市牛津町勝1499-1",
      "site": "https://www.saga.med.or.jp/residents/gunshi/gunshi_list.html",
      "lat": 33.247,
      "lon": 130.205
    },
    {
      "name": "鳥栖三養基医師会",
      "area": "東部",
      "cities": [
        "鳥栖市",
        "基山町",
        "上峰町",
        "みやき町"
      ],
      "address": "鳥栖市幸津町1923",
      "site": "https://tosumiyaki-ishikai.com/",
      "lat": 33.375,
      "lon": 130.507
    },
    {
      "name": "唐津東松浦医師会",
      "area": "北部",
      "cities": [
        "唐津市",
        "玄海町"
      ],
      "address": "唐津市千代田町2566-11",
      "site": "https://www.karatsu.saga.med.or.jp/",
      "lat": 33.451,
      "lon": 129.969
    },
    {
      "name": "伊万里・有田地区医師会",
      "area": "西部",
      "cities": [
        "伊万里市",
        "有田町"
      ],
      "address": "伊万里市立花町通谷1542-15",
      "site": "https://www.saga.med.or.jp/residents/gunshi/gunshi_list.html",
      "lat": 33.265,
      "lon": 129.88
    },
    {
      "name": "武雄杵島地区医師会",
      "area": "南部",
      "cities": [
        "武雄市",
        "大町町",
        "江北町",
        "白石町"
      ],
      "address": "武雄市武雄町昭和300",
      "site": "https://tk-med.or.jp/",
      "lat": 33.195,
      "lon": 130.02
    },
    {
      "name": "鹿島藤津地区医師会",
      "area": "南部",
      "cities": [
        "鹿島市",
        "嬉野市",
        "太良町"
      ],
      "address": "鹿島市高津原813",
      "site": "https://www.kf-med.jp/",
      "lat": 33.104,
      "lon": 130.099
    }
  ],
  "locations": [
    {
      "type": "大学病院",
      "name": "佐賀大学医学部附属病院",
      "area": "中部",
      "address": "佐賀市鍋島5丁目1番1号",
      "lat": 33.285,
      "lon": 130.281,
      "site": "https://www.hospital.med.saga-u.ac.jp/",
      "tag": "特定機能・県がん診療連携拠点"
    },
    {
      "type": "病院",
      "name": "佐賀県医療センター好生館",
      "area": "中部",
      "address": "佐賀市嘉瀬町中原400番地",
      "lat": 33.242,
      "lon": 130.265,
      "site": "https://www.koseikan.jp/",
      "tag": "地域医療支援・がん連携"
    },
    {
      "type": "病院",
      "name": "国立病院機構佐賀病院",
      "area": "中部",
      "address": "佐賀市日の出1丁目20-1",
      "lat": 33.276,
      "lon": 130.296,
      "site": "https://saga.hosp.go.jp/",
      "tag": "地域医療支援"
    },
    {
      "type": "病院",
      "name": "今村病院",
      "area": "東部",
      "address": "鳥栖市轟木町1523-6",
      "lat": 33.366,
      "lon": 130.506,
      "site": "https://www.josuikai.or.jp/",
      "tag": "広域急性期"
    },
    {
      "type": "病院",
      "name": "国立病院機構東佐賀病院",
      "area": "東部",
      "address": "みやき町原古賀7324",
      "lat": 33.32,
      "lon": 130.454,
      "site": "https://higashisaga.hosp.go.jp/",
      "tag": "地域医療支援"
    },
    {
      "type": "病院",
      "name": "唐津赤十字病院",
      "area": "北部",
      "address": "唐津市和多田2430",
      "lat": 33.432,
      "lon": 129.966,
      "site": "https://www.karatsu.jrc.or.jp/",
      "tag": "地域医療支援・がん連携"
    },
    {
      "type": "病院",
      "name": "伊万里有田共立病院",
      "area": "西部",
      "address": "有田町二ノ瀬甲860番地",
      "lat": 33.19,
      "lon": 129.873,
      "site": "https://www.imari-arita-hp.or.jp/",
      "tag": "地域医療支援"
    },
    {
      "type": "病院",
      "name": "国立病院機構嬉野医療センター",
      "area": "南部",
      "address": "嬉野市嬉野町大字下宿甲4760番地1",
      "lat": 33.095,
      "lon": 129.998,
      "site": "https://uresino.hosp.go.jp/",
      "tag": "地域医療支援・がん連携"
    },
    {
      "type": "病院",
      "name": "新武雄病院",
      "area": "南部",
      "address": "武雄市武雄町大字富岡",
      "lat": 33.197,
      "lon": 130.025,
      "site": "https://www.shintakeo-hp.or.jp/",
      "tag": "救急・臨床研修"
    },
    {
      "type": "行政",
      "name": "佐賀県庁",
      "area": "中部",
      "address": "佐賀市城内1丁目1-59",
      "lat": 33.248,
      "lon": 130.3,
      "site": "https://www.pref.saga.lg.jp/",
      "tag": "行政"
    },
    {
      "type": "保健所",
      "name": "佐賀中部保健福祉事務所",
      "area": "中部",
      "address": "佐賀市八丁畷町1-20",
      "lat": 33.269,
      "lon": 130.307,
      "site": "https://www.pref.saga.lg.jp/",
      "tag": "保健所"
    },
    {
      "type": "保健所",
      "name": "鳥栖保健福祉事務所",
      "area": "東部",
      "address": "鳥栖市元町1234-1",
      "lat": 33.369,
      "lon": 130.506,
      "site": "https://www.pref.saga.lg.jp/",
      "tag": "保健所"
    },
    {
      "type": "保健所",
      "name": "唐津保健福祉事務所",
      "area": "北部",
      "address": "唐津市大名小路3-1",
      "lat": 33.451,
      "lon": 129.973,
      "site": "https://www.pref.saga.lg.jp/",
      "tag": "保健所"
    },
    {
      "type": "保健所",
      "name": "伊万里保健福祉事務所",
      "area": "西部",
      "address": "伊万里市新天町122-4",
      "lat": 33.26,
      "lon": 129.88,
      "site": "https://www.pref.saga.lg.jp/",
      "tag": "保健所"
    },
    {
      "type": "保健所",
      "name": "杵藤保健福祉事務所",
      "area": "南部",
      "address": "武雄市武雄町昭和265",
      "lat": 33.194,
      "lon": 130.02,
      "site": "https://www.pref.saga.lg.jp/",
      "tag": "保健所"
    },
    {
      "type": "医師会",
      "name": "佐賀県医師会",
      "area": "中部",
      "address": "佐賀市水ヶ江1丁目12番10号",
      "lat": 33.248,
      "lon": 130.319,
      "site": "https://www.saga.med.or.jp/",
      "tag": "県医師会"
    }
  ],
  "sources": [
    {
      "id": "s1",
      "name": "佐賀県 令和6年医療施設調査・病院報告／市町別表3",
      "year": "2024",
      "url": "https://www.pref.saga.lg.jp/toukei/kiji003118418/index.html",
      "detail": "病院・診療所・歯科診療所、市町・保健所別"
    },
    {
      "id": "s2",
      "name": "佐賀県 2025年国勢調査速報",
      "year": "2025速報（2026年5月公表）",
      "url": "https://www.pref.saga.lg.jp/kiji003119590/",
      "detail": "人口781,214人、2020年比較"
    },
    {
      "id": "s3",
      "name": "国立社会保障・人口問題研究所 地域別将来推計人口",
      "year": "2023年推計（2020〜2050）",
      "url": "https://www.ipss.go.jp/pp-shicyoson/j/shicyoson23/t-page.asp",
      "detail": "人口・年齢構成の将来推計"
    },
    {
      "id": "s4",
      "name": "佐賀県 地域福祉支援計画資料 将来人口",
      "year": "2025年資料・社人研2023年推計",
      "url": "https://www.pref.saga.lg.jp/kiji003115858/3_115858_367346_up_ur5bqgtp.pdf",
      "detail": "2020〜2050の年齢階層別人口"
    },
    {
      "id": "s5",
      "name": "佐賀県 令和6年度病床機能報告の集計結果",
      "year": "2024年7月1日報告",
      "url": "https://www.pref.saga.lg.jp/kiji00398017/3_98017_up_1wij6mkd.pdf",
      "detail": "5医療圏の4機能・休床区分、2025年必要量との比較"
    },
    {
      "id": "s6",
      "name": "佐賀県 医療費適正化計画（第4期）",
      "year": "2024年度〜2029年度（2025年一部改定）",
      "url": "https://www.pref.saga.lg.jp/kiji003112573/3_112573_350646_up_u00bi155.pdf",
      "detail": "2025必要病床数、政策"
    },
    {
      "id": "s7",
      "name": "佐賀県 外来医療計画・高額医療機器共同利用",
      "year": "2024〜2026年度・機器保有基準R4報告",
      "url": "https://www.pref.saga.lg.jp/kiji003107531/index.html",
      "detail": "医療機器マッピング・CT/MRI/PET/放射線治療/マンモ"
    },
    {
      "id": "s8",
      "name": "佐賀県 外来医療計画 別冊1 高額医療機器保有機関",
      "year": "2022年度調査・2023年末区分",
      "url": "https://www.pref.saga.lg.jp/kiji003107531/3_107531_321988_up_2igd777g.pdf",
      "detail": "旧基準の施設別保有状況（現時点の台数ではない）"
    },
    {
      "id": "s9",
      "name": "佐賀県医師会 郡市医師会一覧",
      "year": "2026年閲覧",
      "url": "https://www.saga.med.or.jp/residents/gunshi/gunshi_list.html",
      "detail": "8郡市医師会の名称・所在・リンク"
    },
    {
      "id": "s10",
      "name": "厚生労働省 保健所所管区域案内 佐賀県",
      "year": "2026年閲覧",
      "url": "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/hokenjo/41saga.html",
      "detail": "5保健福祉事務所所在地と管轄"
    },
    {
      "id": "s11",
      "name": "佐賀県 地域医療支援病院業務報告",
      "year": "2025年3月末時点・2026年公表",
      "url": "https://www.pref.saga.lg.jp/kiji00377856/index.html",
      "detail": "県内6病院"
    },
    {
      "id": "s12",
      "name": "がんポータルさが がん診療連携拠点病院",
      "year": "2026年閲覧",
      "url": "https://www.ganportal-saga.jp/consultation/kyoten",
      "detail": "県拠点1・地域拠点3"
    },
    {
      "id": "s13",
      "name": "佐賀県 臨床研修病院一覧",
      "year": "2026年4月",
      "url": "https://www.pref.saga.lg.jp/kiji00396291/index.html",
      "detail": "県内基幹型臨床研修病院"
    },
    {
      "id": "s14",
      "name": "佐賀県外来医師偏在指標（第8次医療計画抜粋）",
      "year": "2024年計画・2026年掲載",
      "url": "https://www.pref.saga.lg.jp/kiji00398017/3_98017_up_wqi7vnig.pdf",
      "detail": "中部135.9 東部153.7 北部105.1 西部106.7 南部120.5"
    },
    {
      "id": "s15",
      "name": "厚生労働省 令和7年度病床機能報告公表データ",
      "year": "2025年度",
      "url": "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/open_data_00020.html",
      "detail": "施設別機器台数・病床・医療機能の再確認先"
    },
    {
      "id": "s16",
      "name": "日本消化器内視鏡学会 指導施設・指導連携施設",
      "year": "2026年閲覧",
      "url": "https://www.jges.net/institutions/branch/41-saga",
      "detail": "県内内視鏡診療提供体制"
    },
    {
      "id": "s17",
      "name": "キシヤ 佐賀営業所 所在地",
      "year": "2026年閲覧",
      "url": "https://www.kishiya.co.jp/location/detail/masterid/12/",
      "detail": "卸流通拠点の例"
    },
    {
      "id": "s18",
      "name": "九州国際重粒子線がん治療センター 連携施設",
      "year": "2026年閲覧",
      "url": "https://www.saga-himat.jp/about/alignment/",
      "detail": "県境を跨ぐ医療連携"
    }
  ],
  "projection": [
    {
      "year": 2020,
      "age0": 109174,
      "age15": 453697,
      "age65": 248571
    },
    {
      "year": 2025,
      "age0": 98867,
      "age15": 429288,
      "age65": 254609
    },
    {
      "year": 2030,
      "age0": 88279,
      "age15": 409183,
      "age65": 254444
    },
    {
      "year": 2035,
      "age0": 80746,
      "age15": 387924,
      "age65": 251537
    },
    {
      "year": 2040,
      "age0": 77255,
      "age15": 358189,
      "age65": 252354
    },
    {
      "year": 2045,
      "age0": 74005,
      "age15": 330518,
      "age65": 249833
    },
    {
      "year": 2050,
      "age0": 69890,
      "age15": 307017,
      "age65": 243966
    }
  ],
  "weight": [
    30,
    25,
    20,
    15,
    10
  ],
  "trend": {
    "nationalHosp100k": 6.5,
    "sagaHosp100k": 12.1,
    "nationalClinic100k": 85,
    "sagaClinic100k": 87.3,
    "nationalBeds100k": 1245.8,
    "sagaBeds100k": 2003.6
  },
  "deviceSample": {
    "year": 2022,
    "label": "佐賀県外来医療計画別冊1（R4病床機能報告）",
    "universityCT64": 6,
    "universityCT16": 1,
    "koseikanCT64": 3,
    "koseikanCT16": 1
  }
};
