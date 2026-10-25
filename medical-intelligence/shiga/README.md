# 滋賀県の医療MKT2026

公開URL: https://sinobu13-bpei.github.io/medical-intelligence/shiga/

## 方針
中立的な医療機器商社の視点。公開一次資料（滋賀県・厚生労働省・総務省・社人研・大学・医師会）を中心に構成。
推計・政策案・独自の評価軸は実績と区別する。民間の転載許可が未確認の企業別市場推計は公開しない。

## 配置
- `index.html`: 全12章レポート、Chart.js / Leaflet 呼び出し、政策、施設、地域戦略と出典。
- `css/site.css`: PC/スマートフォン対応。
- `js/app.js`: グラフ、数値表、GISタイル（国土地理院）、7医療圏タブ、病院・医師会・保健所検索、CSV保存、主観的優先度スコア。
- `data/shiga.json`: ７医療圏人口・病床・将来推計、病院23、医師会9、保健所7、保有医療機器、出典年次。
- `tests/smoke.mjs`: Node.jsのみで実行できるデータ整合性・ファイル/章/出典/中立性の自動テスト。
- `.github/workflows/shiga-medical-qa.yml`: GitHub Actionsで更新時にQAを実施。

## ローカル確認手順
このリポジトリのルートで以下を実行。

```bash
node --check medical-intelligence/shiga/js/app.js
node medical-intelligence/shiga/tests/smoke.mjs
python3 -m http.server 8080
```
ブラウザで `http://localhost:8080/medical-intelligence/shiga/` を表示する（`file://`で直接開くとJSON fetchが制限される場合がある）。

## 品質・注記
- 2025年確定人口は市町を7医療圏に再集計。
- 社人研将来人口は2020年基準の別推計系列。2025年確定人口を起点とする新推計ではない。
- 2025年病床機能報告は自己申告の現況、2025年旧必要病床は2013年レセプトに基づく過去の推計、2040年必要病床は検討中の参考推計。
- 医療機器台数と全国比較は県外来医療計画に掲載された2020年調査値。2026年現在の配置台数ではない。
- 国土地理院標準タイルをLeafletで表示、圏域代表点は施設の正確な緯度経度とは異なる。個別施設位置はGoogleマップ検索リンクを提供。
- 配布時は外部CDN（Chart.js/Leaflet）と国土地理院タイルのネットワーク接続が必要。遮断環境では表による数値確認が可能。
- 経営・戦略の優先度スコアは評価者の判断を含む参考分析であり、調達・購入・投資の推奨ではない。

## 更新
2026-10-25／全国ハブ `medical-intelligence/index.html` からリンク。
