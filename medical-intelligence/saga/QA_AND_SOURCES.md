# 佐賀県医療機器MKT分析 Web QA・公開資料一覧

調査基準日：2026-10-27
ページ：https://sinobu13-bpei.github.io/medical-intelligence/saga/
リポジトリ：https://github.com/Sinobu13-BPei/sinobu13-bpei.github.io/tree/main/medical-intelligence/saga

## 実装・確認
- [x] Sagaのindex.html / style.css / app.js / data.jsをGitHub mainにコミット
- [x] トップページの「佐賀県」エントリーに「佐賀MKT」リンクを追加。既存トップ構造を保持
- [x] 5二次医療圏・20市町をカバー
- [x] 市町別集計：病院95、一般診療所688、歯科診療所389。2024年公式調査に合致
- [x] 5医療圏の施設数が市町別集計と一致
- [x] 8郡市医師会による20市町の区域集約、重複計上なし
- [x] 県・全国・福岡・長崎2024年施設比較表（施設数と10万人当たり）
- [x] Chart.js による人口・病床機能・施設数・比較・優先順位等のグラフ（静的ソース検査）
- [x] Leaflet + 地理院タイル、出典を明記
- [x] 主要病院・大学病院・県庁・保健所・医師会の公式Web／Google Maps／地理院地図の導線
- [x] モバイル用CSSブレークポイント（900px、700px、410px）・折り畳みメニュー（ソース検査）
- [x] app.js JavaScript構文検査に合格
- [x] 医療圏別優先度の5評価軸と重みを掲載、独自分析と識別
- [x] 市場フレームPEST・3C・STP・4P・4C・VRIO・5 Forces、KSF、Where to Play・How to Win
- [x] 機密性に注意：過去の私的文書に含まれる未公表のメーカー・販社別金額／推計市場シェアは引用せず

## 未検証・制約
- [ ] GitHub Pagesの実際のHTTP 200・ブラウザ描画：この実行環境は公開サイトへのアクセスが制限されているため確認不可
- [ ] 実機スマートフォン表示、端末別操作、全外部URLの到達性・リンク切れ（静的実装チェックのみ）
- [ ] 2025年確定国勢調査と2024年施設調査の同一定義での更新
- [ ] 医師会会員施設数：表は地区内所在施設数（非会員を含みうる）。会員実数は未取得
- [ ] 現有装置の全県台数・製造メーカー別シェア・導入年次・全国100k対比の原票照合
- [ ] 災害指定病院・救急/へき地拠点病院の最新の全指定件数、建替計画の確定情報、転出入と実走行ロジ時間
- [ ] データセットに記載した施設住所・概略緯度経度の個々の測位検証（公表地図と必ず照合）
- [ ] 病床機能報告（2024年）と地域医療構想2025年必要量は別定義であり差分を「過剰床」と断定しない
- [ ] 更新公募日・補助予算は最新公募要領で毎回再確認

## 主要出典（公開一次資料）
1. 佐賀県2024年医療施設調査 市町別表：https://www.pref.saga.lg.jp/toukei/kiji003118418/index.html
2. 佐賀県2024年施設数・人口10万対 全国都道府県比較：https://www.pref.saga.lg.jp/toukei/kiji003118418/3_118418_383257_up_zudh3j8e.pdf
3. 佐賀県2025国勢調査速報：https://www.pref.saga.lg.jp/kiji003119590/
4. 国立社会保障・人口問題研究所（2023年地域推計）：https://www.ipss.go.jp/pp-shicyoson/j/shicyoson23/t-page.asp
5. 佐賀県令和6年病床機能報告（2024年7月1日時点）：https://www.pref.saga.lg.jp/kiji00398017/3_98017_up_1wij6mkd.pdf
6. 佐賀県外来医療計画・高額医療機器マップ：https://www.pref.saga.lg.jp/kiji003107531/index.html
7. 佐賀県医師会郡市一覧：https://www.saga.med.or.jp/residents/gunshi/gunshi_list.html
8. 厚労省保健所所管：https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/hokenjo/41saga.html

すべての数値の集計年度はページ内に表示。一次資料に戻れるリンクを保持する。 
