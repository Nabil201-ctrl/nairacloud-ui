# NairaCloud Waitlist (frontend-only)

Standalone early-access waitlist landing page for NairaCloud.

This is a **frontend-only** build — no backend, no database, no email service.
The form POSTs to `WAITLIST_API_PATH` (default `/api/waitlist`). Wire it to your
own route or proxy when the backend is ready.

## Local development

```bash
cd waitlist
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3010](http://localhost:3010).

## Environment

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_WAITLIST_API_PATH` | No | Path the form POSTs to (default `/api/waitlist`) |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical site URL for metadata |

## Deploy

```bash
vercel --prod --token "$VERCEL_TOKEN"
```