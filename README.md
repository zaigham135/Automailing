# AutoMailer

Small automated mailer service that queries a database, generates an Excel report, and emails it on a cron schedule.

Quick start

1. Copy and edit `.env` with your DB and SMTP credentials.
2. Install deps: `npm install`.
3. Start: `npm start`.

Smoke test (no real email)

```
node scripts/smoke.js
```

Docker

Build and run using the provided `Dockerfile`. Ensure env values are provided via secrets or env file.
# Automailing
