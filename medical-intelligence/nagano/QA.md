# 長野県医療MKT 2026 公開版：品質確認記録

作成日：2026年10月25日。編纂：高橋亜耶佳。中立的な医療機器商社向けに公開情報を分析。

## 収録範囲
- 長野県全10二次医療圏、人口・高齢化・医師・病院、2040年推計、旧10圏→4ブロック案（確定ではない）
- 2025年国勢調査確定人口、2025年中の自然・社会増減、長野市・松本市の確定人口
- 病床機能報告と2025年必要病床数の推計の区分、2026年医師偏在指標
- 大学病院・救命救急・がん・地域医療支援病院、医療機器、診療所、医療材料・SPD
- PEST、3C、STP、4P、4C、VRIO、5 Forces、SWOT、KSF、Where to Play/How to Win
- Googleマップ・地理院地図、Leaflet+地理院タイル、Chart.js
- 出典一覧40項目、公開一次情報リスト data/sources.json 22項目（重複は一部あり）

## 静的確認（合格）
1. GitHub mainに index.html / css/main.css / js/main.js / js/analytics.js / data/areas.json / data/benchmarks.json / data/sources.json が存在
2. JavaScript 2ファイルの構文検査に問題なし
3. 22章構成のページ内アンカー参照に欠落なし、HTML id重複なし
4. Chart.js用canvas 5個の参照IDが存在
5. 県内10医療圏のJSONがパース可能。33団体・保健所にGoogleマップ・地理院地図導線あり
6. 個別メーカーの非公開シェア・社内案件情報を除外。サイト内の「CMSC」「キヤノン」「社内用」に該当表記なし
7. ハブ medical-intelligence/index.html の長野県リンクを新パスへ変更
8. 旧URL nagano-medical-mkt/ は削除せず、最新版への案内を表示

## 注意事項・未検証
- GitHub Pages配信側の実際のHTTP応答、PC・スマートフォンのブラウザ実機表示、外部リンク全件のHTTP 200、CDN障害時のグラフ表示はこの環境から確認できなかった。
- 全77市町村の診療科別診療所数、医療圏別の最新４機能病床、同年度の全モダリティ設置台数・全国比は集計未了。資料の不足を推測値で補っていない。
- 機器の令和元年度比較値は歴史的データであり2026年の最新値ではない。
- 医療圏別の優先度スコアは独自評価。公開資料に基づくが行政評価・予測売上・案件確度ではない。
- 保健所・医師会の地理院地図リンクは医療圏の概略中心であり、建物所在地の正確な座標を示さない。Googleマップは名称検索。
- 公開免責：情報の正確性・完全性・最新性は保証しない。投資判断には原典と最新施設情報の確認が必要。

## 公開経路
- https://sinobu13-bpei.github.io/medical-intelligence/nagano/
- GitHub: https://github.com/Sinobu13-BPei/sinobu13-bpei.github.io/tree/main/medical-intelligence/nagano
- ハブ: https://sinobu13-bpei.github.io/medical-intelligence/
