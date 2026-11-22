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
