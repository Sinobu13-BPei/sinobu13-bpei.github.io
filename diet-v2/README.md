# SHINOBU HEALTH 25 Ver.2

GitHub Pages front-end + Supabase Auth/DB + Supabase Edge Function + OpenAI Responses API.

## Cloud setup
1. Supabase projectを作成/選択。
2. `supabase/schema.sql` をSQL Editorで実行。
3. `supabase/functions/diet-coach/index.ts` を `diet-coach` Edge Functionとしてデプロイ。
4. Edge Function Secretに `OPENAI_API_KEY` を登録。
5. Auth Redirect URLへGitHub PagesのURLを追加。
6. Webアプリの「設定」でProject URLとanon keyを保存。

OpenAI APIキーやservice_role keyはGitHub Pagesへ置かないこと。