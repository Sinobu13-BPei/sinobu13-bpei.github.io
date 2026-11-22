# 医療機器MKT Rev.10 / 工程1：施設マスター

2026-11-22の初期版。GitHubの国内病院リストに掲載されていた8,019病院を、原票を変更せず暫定ID付きで切り出したものです。

**重要**：国・自治体の確認済み病院マスターではありません。施設実在、病床数、旧DPCタグ、設置主体、系列等を公式に検証したことにはなりません。原票の基準日は不明です。表示される2026-11-22は取得日です。

- 施設名・住所・県の欠測なし。47都道府県、8,019行。県・名称・住所の完全一致重複なし。
- facility_uid は県|施設名|住所をNFKC、大文字、空白除去してFNV-1a 64bitにした LEG- で始まる**サイト内暫定キー**。医療機関コードではなく、改称・移転で変化します。
- official_medical_institution_code、official_corporate_number、official_facility_code、medical_area_2026_codeは未照合につき空欄。0や非該当ではありません。
- identity_match_status は未照合。名前の類似だけで自動的に照合確定を付けてはいけません。
- 旧D1/D2/D3・「DPC外」等の機能タグに矛盾がある既存行も記録として残し、現行制度の分類へ変換しません。
- 出典原票は https://sinobu13-bpei.github.io/medical-intelligence/hospitals/ 
- 正式照合候補は厚労省 医療情報ネット2026年6月1日 https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/newpage_43373.html （PDL1.0）。
- 将来の対応履歴は data/identity-crosswalk.csv で、有効開始日・終了日・確認URL・レビュー状態を保持します。
- 県→二次医療圏の対応には2026年4月1日区分を採用。旧圏域は別マップで管理します。

検査コマンド：
python -m pip install pandas
python medical-intelligence/hospitals/facility-master/build_master.py --check --report /tmp/master-qa.json

前版比較はオプション --previous 前回CSV で実行。追加・削除・変更を集計し、人手レビューを必須とします。


## 工程1b｜医療情報ネット2026年6月1日版との照合（2026-11-22）

- 公式出典：https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/newpage_43373.html
- 病院施設票CSV.zip：65列、7,715件。SHA-256：b416472ec52a151455e1c91438e0dec5b471e19eafe70e3e2ee1bb22544efe87。
- 旧病院一覧8,019件のうち確定一致3,453件（43.06%）、要確認3,435件、未一致1,131件。47都道府県を集計。
- 確定一致は、県・正式名称・所在地が正規化後に双方一意な完全一致という機械判定。行政による同一性認証ではない。
- 名称・住所の近似は要確認に限定。候補IDを確定IDに転記しない。
- 医療情報ネットのIDは県や元データにより5〜13文字の英数字が混在する不透明な文字列として取り扱う（新潟県等では英字が含まれる）。数字に変換せず、ゼロ埋めせず、先頭ゼロを保持する。保険医療機関コード・法人番号とは異なる。開設者・法人番号・保険医療機関コードは今回の公表CSVに存在せず、別データでの確認が必要。
- 旧マスターの病院名・住所・病床・DPCタグ・未照合の行政コード欄は変更していない。
- 全件：data/identity-navi-20260601.csv
- 要確認：data/identity-review-20260601.csv
- 確定ID：data/identity-crosswalk-verified-navi-20260601.csv
- 集計・出典・実行履歴：data/identity-summary-20260601.json
- 生成プログラム：match_navi_20260601.py。GitHub Actions：.github/workflows/navi-identity-match.yml。
- 元ZIPのSHA-256や列構造に変更があれば公開データを上書きせず検証エラーとして止める。
- 医療情報ネットの公開データ利用条件はPDL1.0。二次利用の際は出典・加工の明示が必要。

工程1の残作業：要確認3,435件を原典と突合、未一致1,131件の理由分類、開設者・保険医療機関コード・法人番号の検証。工程2の機器台数統合はこのレビューの結果に応じて進める。
