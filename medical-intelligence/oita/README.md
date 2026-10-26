# 大分県 医療機器市場・医療政策インテリジェンス（公開版）

- 公開想定URL: https://sinobu13-bpei.github.io/medical-intelligence/oita/
- 最終改稿: 2026-10-27
- 方針: 公開資料を優先し、特定メーカーの評価・推奨、非公開商談、流通シェア推定資料、案件・顧客情報を除外
- ファイル: `index.html`, `css/style.css`, `js/app.js`, `data/data.json`

## 構成
サマリー → 人口・医療圏 → 医療提供体制 → 大学・医師会・行政 → 機器市場 → 流通 → 外部環境 → 戦略提言 → 出典一覧。地図: Leaflet＋国土地理院地理院タイル。グラフ: Chart.js（12図）。医療機器SVGピクトグラム8種、圏域病床構成カード6種、概念フロー、地図の施設カテゴリ切替も実装。

## 数値と調査上の留意点
- 2025年7月の病床機能報告は6圏域合計16,798床。地域医療構想の2025年必要病床量14,649床は推計値。直接の過剰不足認定に使用しないこと。
- 2026年9月推計人口、2025年国勢調査速報、2020年国勢調査、社人研将来推計は時点・統計系列が異なる。
- 2024年/2050年の近隣県高齢化率は内閣府「令和8年版高齢社会白書」第1章表1-1-10。
- 医師数・医師偏在指標は公表統計を二次集計した参考値。正確な圏域分類を原票で再照合すること。
- 地図の施設座標は概略・施設検索補助であり住所・敷地・入口の公式ジオコードではない。
- US/CT/MRI/PET/血管撮影/リニアック/内視鏡/透析の県別全設置台数、全国平均人口当たり設置率、機器更新年限などは比較可能な一次資料の統合が未完了であり推測値を掲載していない。
- 優先度スコアは政策評価ではなく独自の商社活動仮説。需要25%・病床機能転換25%・アクセス/BCP20%・拠点15%・実現性15%。

## QA（2026-10-27）
- GitHub main ブランチに `index.html` / `css/style.css` / `js/app.js` / `data/data.json` を作成し、親ページ `medical-intelligence/index.html` に大分MKTリンクを追加：確認済み。
- GitHub APIで5ファイル再取得・SHA確認：確認済み。
- 6医療圏の病床内訳合計（16,798床）一致：確認済み。
- `js/app.js` のJavaScript文法検証（Functionコンパイル）：合格。
- DOM ID重複なし、セクション9、グラフ12、出典40、病院・関連施設22、医師会リンク9：静的確認済み。
- Leafletの国土地理院タイルURL、帰属表示、Google Mapsと地理院地図への施設リンク生成：実装・静的確認済み。
- CSSのスマートフォン向けメディアクエリ、モバイルメニュー：実装済み。ただし実機ブラウザでの動作検証は未実施。
- 各外部URLのHTTP 200・地図座標精度・CDNロードの実機確認：未実施。実環境で手動確認を要する。
- 公開URLへの外部HTTP到達確認：2026-10-27時点、この実行環境から検証不可。リポジトリ反映は完了しているが配信開始は未確認。

## 推奨確認順
1. GitHub Actions / Pages でデプロイの完了状態を確認。
2. https://sinobu13-bpei.github.io/medical-intelligence/oita/ を開き、開発者ツールに404やJavaScriptエラーがないか確認。
3. モバイル幅360, 390, 768, 1280px、折り返し・横スクロールテーブル・メニュー・地図・12グラフを確認。
4. 外部リンク検証、実住所・緯度経度と病院・行政部門の最新指定一覧を照合。

## 2026-10-27 update: Clinic and facility atlas / medical associations
- 6 secondary medical regions, each sourced to the Japan Medical Association JMAP medical area profile (S32–S37).
- Region counts: 758 general clinics, 149 hospitals, 474 dental facilities, 566 pharmacies; separately 177 home-care support clinics as a subset of general clinics. **These are JMAP online listings, not licensed facility census counts**, and not association members.
- 18 municipalities with JMAP city-level clinics/hospitals/dental listings and region filter. Each city sums to the corresponding region for these three categories.
- All 17 district/city medical associations from Oita Medical Association's 2026-07-01 list (S38), with affiliated/related municipalities. **Geographic city-level counts are references only and not medical-association member facilities or membership counts.** 3 associations in Oita city show the same whole-city statistics with a clear nonadditivity warning. University medical association receives no allocated facilities.
- Facilities sourced to JMAP and Oita Statistical Yearbook 2025 (Oita Prefecture published 2026-03-31, S39, for definition cross-check), plus e-Stat (S40).
- New files: `css/facilities.css` and `js/facilities.js`.
- Charts added: JMAP medical-area clinic count and clinic/hospital/dental/pharmacy type mix. Total 12 Chart.js plots; facility KPI cards and association table are responsive.
- 2020 Census denominators for JMAP clinics per 100k; these are not current 2026 resident counts.
- Source caveat: JMAP publication timestamp checked 2026-10-27; the underlying dataset's single reference date is not confirmed.

### Static QA (2026-10-27)
- GitHub read-back and commit verification: seven website files retrieved successfully.
- JavaScript parsing: `js/app.js`, `js/visuals.js`, `js/facilities.js` all PASS.
- 11 HTML sections, 12 canvas charts, zero duplicate HTML IDs, zero missing facility UI target IDs.
- 6 region totals independently recomputed from 18 municipal rows: clinic / hospital / dental checks all PASS.
- All 17 associations represented and no unverified numeric membership count is stated.
- Visual assets have mobile media queries, existing Leaflet with GSI tiles retained.
- Pending: full browser-device testing, external link HTTP checks, actual GitHub Pages deployment check and any underlying non-uniform JMAP time reference.

