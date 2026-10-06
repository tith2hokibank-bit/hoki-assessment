# HOKIbank Talent Assessment

Frontend kandidat untuk assessment rekrutmen HOKIbank.

## Stack
- React + Vite
- Supabase Edge Function `assessment-api`
- Vercel

## Setup Vercel

Tambahkan Environment Variable:

`VITE_ASSESSMENT_API`

Value:

`https://YOUR_PROJECT_REF.supabase.co/functions/v1/assessment-api`

Kemudian deploy/redeploy.

## URL kandidat

`https://DOMAIN-VERCEL/?token=INVITATION_TOKEN`

Contoh:

`https://hoki-assessment.vercel.app/?token=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

## Catatan keamanan
Jangan menyimpan `SUPABASE_SERVICE_ROLE_KEY` di frontend atau repository.
