/* 2026-10-27 / e-Stat 医療施設調査2023年 N1(病院)・N2(一般診療所)
 * 配列の[2],[3]は公的な地域内施設数であり、医師会への加盟施設数ではない。 */
(function(){
"use strict";
const d=window.KOSHINETSU;if(!d)return;
d.facilityYear=2023;
d.facilitySource={
 hospital:"https://www.e-stat.go.jp/stat-search/files?cycle=7&cycle_facet=tclass1&layout=datalist&page=1&stat_infid=000040222901&tclass1=000001222880&tclass2=000001222883&tclass3val=0&toukei=00450021&tstat=000001030908",
 clinic:"https://www.e-stat.go.jp/dbview?sid=0004024930",
 hospitalDb:"https://ecitizen.jp/statdb/StatsData/0004024929",
 clinicDb:"https://ecitizen.jp/statdb/StatsData/0004024930",
 associations:{
  "新潟県":"https://www.niigatashi-ishikai.or.jp/siteinfo/links.html",
  "長野県":"https://www.nagano.med.or.jp/general/branch/",
  "山梨県":"https://www.yamanashi-med.or.jp/residents/20250313111346.html"
 }
};
d.facilityByArea=[
["新潟県","下越",152,16],["新潟県","新潟",718,47],["新潟県","県央",163,10],["新潟県","中越",298,19],["新潟県","魚沼",103,11],["新潟県","上越",183,14],["新潟県","佐渡",38,2],
["長野県","佐久",169,13],["長野県","上小",118,16],["長野県","諏訪",144,11],["長野県","上伊那",138,9],["長野県","飯伊",128,9],["長野県","木曽",21,1],["長野県","松本",366,26],["長野県","大北",48,2],["長野県","長野",406,33],["長野県","北信",61,3],
["山梨県","中北",441,32],["山梨県","峡東",91,14],["山梨県","峡南",47,6],["山梨県","富士・東部",147,8]
];
/* 市・郡の関連団体が明確な場合のみ自治体統計を掲示。医師会管轄の精密な境界や会員施設数を意味しない。 */
d.cityFacilities={
"新潟市":[651,42],"長岡市":[182,11],"上越市":[140,10],"三条市":[65,7],"柏崎市":[55,5],"加茂市":[19,1],"燕市":[69,2],"佐渡市":[38,2],"糸魚川市":[30,2],"見附市":[30,1],"村上市":[40,6],"五泉市":[37,2],"小千谷市":[27,2],"十日町市":[36,2],"南魚沼市":[28,5],"魚沼市":[28,2],
"佐久市":[83,7],"小諸市":[31,2],"上田市":[100,13],"諏訪市":[47,3],"岡谷市":[30,3],"松本市":[231,16],"安曇野市":[81,5],"長野市":[297,24],"千曲市":[41,4],"須坂市":[39,2],"大町市":[25,1],"中野市":[29,2],"飯山市":[16,1],
"甲府市":[219,14],"山梨市":[26,4],"笛吹市":[41,8],"富士吉田市":[54,1],"都留市":[16,3],"大月市":[20,1],"上野原市":[16,2],"北杜市":[23,2],"甲斐市":[67,4],"中央市":[23,1]
};
/* [県, 二次医療圏, 医師会名, 公式リンク（なければ県の公的一覧）, 代表自治体(数値表示用)] */
d.associationRows=[
["新潟県","下越","新発田北蒲原医師会","https://www.niigatashi-ishikai.or.jp/siteinfo/links.html","新発田市"],
["新潟県","下越","村上市岩船郡医師会","https://www.niigatashi-ishikai.or.jp/siteinfo/links.html","村上市"],
["新潟県","新潟","新潟市医師会","https://www.niigatashi-ishikai.or.jp/","新潟市"],
["新潟県","新潟","五泉市東蒲原郡医師会","https://www.niigatashi-ishikai.or.jp/siteinfo/links.html","五泉市"],
["新潟県","県央","三条市医師会","https://www.niigatashi-ishikai.or.jp/siteinfo/links.html","三条市"],
["新潟県","県央","加茂市医師会","https://www.niigatashi-ishikai.or.jp/siteinfo/links.html","加茂市"],
["新潟県","県央","燕市医師会","https://www.niigatashi-ishikai.or.jp/siteinfo/links.html","燕市"],
["新潟県","中越","長岡市医師会","https://www.niigatashi-ishikai.or.jp/siteinfo/links.html","長岡市"],
["新潟県","中越","柏崎市刈羽郡医師会","https://www.niigatashi-ishikai.or.jp/siteinfo/links.html","柏崎市"],
["新潟県","中越","見附市南蒲原郡医師会","https://www.niigatashi-ishikai.or.jp/siteinfo/links.html","見附市"],
["新潟県","魚沼","十日町市中魚沼郡医師会","https://www.niigatashi-ishikai.or.jp/siteinfo/links.html","十日町市"],
["新潟県","魚沼","小千谷市魚沼市医師会","https://www.niigatashi-ishikai.or.jp/siteinfo/links.html","魚沼市"],
["新潟県","魚沼","南魚沼郡市医師会","https://www.niigatashi-ishikai.or.jp/siteinfo/links.html","南魚沼市"],
["新潟県","上越","上越医師会","https://www.niigatashi-ishikai.or.jp/siteinfo/links.html","上越市"],
["新潟県","上越","糸魚川市医師会","https://www.niigatashi-ishikai.or.jp/siteinfo/links.html","糸魚川市"],
["新潟県","佐渡","佐渡医師会","https://www.pref.niigata.lg.jp/site/opendata/niigatabyouinmeibo20220401.html","佐渡市"],
["長野県","佐久","佐久医師会","https://www.saku-ishikai.or.jp/","佐久市"],
["長野県","佐久","小諸北佐久医師会","https://www.nagano.med.or.jp/general/branch/","小諸市"],
["長野県","上小","小県医師会","https://www.nagano.med.or.jp/general/branch/","上田市"],
["長野県","上小","上田市医師会","https://www.nagano.med.or.jp/general/branch/","上田市"],
["長野県","諏訪","諏訪郡医師会","https://www.nagano.med.or.jp/general/branch/","諏訪市"],
["長野県","諏訪","岡谷市医師会","https://www.nagano.med.or.jp/general/branch/","岡谷市"],
["長野県","諏訪","諏訪市医師会","https://www.nagano.med.or.jp/general/branch/","諏訪市"],
["長野県","上伊那","上伊那医師会","https://www.nagano.med.or.jp/general/branch/",null],
["長野県","飯伊","飯田医師会","https://www.nagano.med.or.jp/general/branch/",null],
["長野県","木曽","木曽医師会","https://www.nagano.med.or.jp/general/branch/",null],
["長野県","松本","塩筑医師会","https://www.nagano.med.or.jp/general/branch/",null],
["長野県","松本","安曇野市医師会","https://www.nagano.med.or.jp/general/branch/","安曇野市"],
["長野県","松本","松本市医師会","https://www.nagano.med.or.jp/general/branch/","松本市"],
["長野県","大北","大北医師会","https://www.nagano.med.or.jp/general/branch/","大町市"],
["長野県","長野","更級医師会","https://www.nagano.med.or.jp/general/branch/",null],
["長野県","長野","千曲医師会","https://www.nagano.med.or.jp/general/branch/","千曲市"],
["長野県","長野","須高医師会","https://www.nagano.med.or.jp/general/branch/","須坂市"],
["長野県","長野","上水内医師会","https://www.nagano.med.or.jp/general/branch/",null],
["長野県","長野","長野市医師会","https://www.nagano.med.or.jp/general/branch/","長野市"],
["長野県","北信","中高医師会","https://www.nagano.med.or.jp/general/branch/","中野市"],
["長野県","北信","飯水医師会","https://www.nagano.med.or.jp/general/branch/","飯山市"],
["山梨県","中北","甲府市医師会","https://www.kofu-med.or.jp/","甲府市"],
["山梨県","中北","中巨摩医師会","https://nakakoma.yamanashi-med.or.jp/",null],
["山梨県","中北","北巨摩医師会","https://kitakoma-med.org/","北杜市"],
["山梨県","中北","山梨大学医師会","https://www.yamanashi-med.or.jp/residents/20250313111346.html",null],
["山梨県","峡東","東山梨医師会","https://www.yamanashi-med.or.jp/residents/20250313111346.html","山梨市"],
["山梨県","峡東","笛吹市医師会","https://f-med.org/","笛吹市"],
["山梨県","峡南","西八代郡医師会","https://nishiyatsushiro-med.org/",null],
["山梨県","峡南","南巨摩郡医師会","https://minamikoma-med.org/",null],
["山梨県","富士・東部","富士吉田医師会","https://www.yamanashi-med.or.jp/residents/20250313111346.html","富士吉田市"],
["山梨県","富士・東部","都留医師会","https://tsuru-med.org/","都留市"],
["山梨県","富士・東部","北都留医師会","https://kitatsuru.yamanashi-med.or.jp/","大月市"]
];
d.sources.push(
 ["F01","厚生労働省 令和5年医療施設調査 第1表 N1 病院施設数（二次医療圏・市区町村）","2023年・e-Stat公表2025年","https://www.e-stat.go.jp/stat-search/files?cycle=7&cycle_facet=tclass1&layout=datalist&page=1&stat_infid=000040222901&tclass1=000001222880&tclass2=000001222883&tclass3val=0&toukei=00450021&tstat=000001030908"],
 ["F02","厚生労働省 令和5年医療施設調査 第2表 N2 一般診療所総数（二次医療圏・市区町村）","2023年・e-Statデータベース","https://www.e-stat.go.jp/dbview?sid=0004024930"],
 ["F03","新潟市医師会 地域医師会公式リンク集（新潟県の関連団体）","2026年10月閲覧","https://www.niigatashi-ishikai.or.jp/siteinfo/links.html"],
 ["F04","長野県医師会 21郡市医師会一覧","2026年9月現在","https://www.nagano.med.or.jp/general/branch/"],
 ["F05","山梨県医師会 地区医師会一覧","2026年10月閲覧","https://www.yamanashi-med.or.jp/residents/20250313111346.html"]
);
d.getFacility=(pref,area)=>d.facilityByArea.find(r=>r[0]===pref&&r[1]===area);
})();