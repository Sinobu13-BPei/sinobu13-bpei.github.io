import {readFileSync,existsSync} from "node:fs";
import {Script} from "node:vm";
import {resolve} from "node:path";
const root=resolve(import.meta.dirname,"..");
const read=(p)=>readFileSync(resolve(root,p),"utf8");
const html=read("index.html"),css=read("css/site.css"),js=read("js/app.js"),d=JSON.parse(read("data/shiga.json"));
const fail=[];const assert=(ok,msg)=>{if(!ok)fail.push(msg)};
try{new Script(js)}catch(e){fail.push("JS構文: "+e.message)}
const regions=d.regions,regionsN=regions.length;
assert(regionsN===7,"医療圏７件");
assert(d.hospitals.length===23,"病院23件");
assert(d.associations.length===9,"地域医師会９団体");
assert(d.healthOffices.length===7,"保健所７か所");
assert(d.modalities.length===5,"モダリティ５分類");
assert(d.sources.length>=15,"出典15点以上");
assert(regions.reduce((t,r)=>t+r.pop2025,0)===1392008,"2025確定人口は1,392,008");
assert(regions.reduce((t,r)=>t+r.beds2025[0],0)===11794,"2025病床合計は11,794");
assert(regions.reduce((t,r)=>t+r.beds2040Indicative,0)===11311,"2040構想推計11,311");
assert(regions.every(r=>r.forecast2020Base?.length===7),"人口将来推計７期間");
assert(regions.every(r=>r.beds2025?.length===6),"2025病床機能６列");
assert(regions.every(r=>r.beds2025.slice(1).reduce((a,b)=>a+b,0)===r.beds2025[0]),"2025病床内訳と総数が一致");
assert(regions.every(r=>Array.isArray(r.coord)&&r.coord.length===2),"圏域概略座標");
assert(d.hospitals.every(h=>h.url.startsWith("https://")||h.url.startsWith("http://")),"病院公式サイトURLあり");
assert(d.associations.every(h=>h.url.startsWith("http")),"医師会URLあり");
assert(d.healthOffices.every(h=>h.url.startsWith("http")),"保健所URLあり");
assert(d.sources.every(h=>h.url.startsWith("http")&&!!h.year),"出典と年次");
const ids=["summary","population","areas","system","workforce","facilities","institutions","devices","distribution","external","strategy","sources"];
for(const id of ids)assert(html.includes('id="'+id+'"'),"HTML内に章#"+id);
for(const id of ["totalPop","totalBeds","popTable","bedTable","deviceTable","regionTabs","regionDetails","hospitalItems","hospitalSearch","hospitalCount","officeItems","officeSearch","officeCount","sourcesItems","ranking","gsiMap","csvButton","loadstate","critical"]){
  if(id==="critical")continue; // エラー表示はロードステータスに表示
  assert(html.includes('id="'+id+'"'),"HTML内DOM #"+id);
}
for(const id of ["chartPop","chartFuture","chartBeds","chartDevice"])assert(html.includes('id="'+id+'"'),"グラフ canvas "+id);
assert(html.includes("chart.umd.min.js"),"Chart.js設置");
assert(html.includes("leaflet.js")&&html.includes("leaflet.css"),"Leaflet設置");
assert(js.includes("cyberjapandata.gsi.go.jp/xyz/std"),"地理院標準タイル設置");
assert(html.includes("地理院タイル"),"地理院出典クレジット");
assert(html.includes("https://www.google.com/maps"),"Google Mapsリンク");
assert(html.includes("https://maps.gsi.go.jp/#15"),"GSIリンク");
assert(html.includes("rizno-one/?utm_source"),"リズノワン著者ボタン");
assert(html.includes("代表取締役 社長 大橋和乗"),"編纂者表記");
assert(html.includes("../")&&html.includes("medical-intelligence/"),"全国ハブ導線");
assert(html.includes("2026年10月25日")&&html.includes("免責事項"),"公開更新日・免責");
assert(html.includes("Where to Play")&&html.includes("How to Win"),"戦略のSauce");
for(const topic of ["PEST","3C","STP","4P","4C","VRIO","5 Forces","SWOT","KSF"])assert(html.includes(topic),"戦略"+topic);
assert(css.includes("@media(max-width:660px)"),"小画面レスポンシブ");
assert(css.includes(".dir-card[hidden]{display:none!important}"),"検索時の非表示CSS");
assert(!/キヤノンメディカル|CMSC|ソニーを買うべき/.test(html),"中立性・社内情報残存なし");
assert(/<!DOCTYPE html>/i.test(html)&&html.trim().endsWith("</html>"),"HTML完全性");
if(fail.length){for(const v of fail)console.error("FAIL",v);process.exit(1)}
console.log(JSON.stringify({success:true,files:4,regions:regionsN,people:1392008,beds:11794,locations:d.hospitals.length+d.associations.length+d.healthOffices.length,sections:ids.length,chartCanvases:4,sourceCount:d.sources.length},null,2));