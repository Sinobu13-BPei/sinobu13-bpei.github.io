# Personal Health Intelligence

- Static UI: GitHub Pages
- Private data: Supabase Auth + Postgres (RLS) + private Storage
- Historical checkups: one-time private claim into authenticated user's account
- Doctor sharing: expiring read-only token; raw token is never stored in GitHub
- AI meal estimate / daily coach: existing `diet-coach` Edge Function (requires OPENAI_API_KEY secret)

Canonical URL: /health/
Legacy /diet-v2/ should redirect to /health/ after deployment.
