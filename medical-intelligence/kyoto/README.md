# 京都府 医療MKT研究2026

公開用配置：`medical-intelligence/kyoto/`（本フォルダの `index.html`, `assets/`, `data/` を格納）

## 情報と公開判断
一次資料：京都府・厚生労働省・社人研・医師会等の公式ページ。各値の年次・解説をサイト内に表示。独自スコアは定性評価でありメーカー/病院の格付けではない。添付の民間調査資料は著作権・非公開情報の再配布リスクがあるため、図表・企業別販売高・シェアはサイトに転用していない。

## データソース
- `data/kyoto.json`: 二次医療圏別2020～2050人口、2025病床、政策上の必要病床数（旧推計）、2026医師偏在指標、施設リンク、一次資料URLと年次
- `assets/app.js`: Chart.js折れ線・積み上げ・スコア図、Leaflet地理院タイル、施設検索／圏域絞込み
- `assets/style.css`: PC・iPhone・Android対応

## GitHub Pages
既存 `Sinobu13-BPei/sinobu13-bpei.github.io` リポジトリの `medical-intelligence/kyoto/` 配下に配置する。
公開URL `https://sinobu13-bpei.github.io/medical-intelligence/kyoto/`
トップ `medical-intelligence/index.html` の京都行に `京都MKT` のリンクを追加。

## 未確認・制限
- 院内更新予定・施設ごとの機器稼働率・メーカー別商流とシェア等は公開根拠なしのため除外。
- 医療機器台数は種類・抽出範囲・年次が揃わず、実数一覧は未収録（公的原表リンクを提示）。
- 施設の地理院地図座標およびLeafletマーカーは概略位置であり精密なジオコーディング未実施。
- 2025年病床機能報告と2017年頃に推計された2025年必要病床数の差は「過不足」として評価しない。