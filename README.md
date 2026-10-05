# NairaCloud UI

Frontend-only copy of the NairaCloud user interface. No backend included.

## Layout

```
.
├── frontend/            # monorepo: customer app, admin app, shared packages
│   ├── apps/web/        # customer app (marketing + auth + dashboard)
│   ├── apps/admin/      # admin app (role-gated operations)
│   ├── packages/ui/     # shared UI primitives + custom components
│   ├── packages/api-client/  # typed fetch wrapper (CSRF + refresh)
│   ├── packages/config/ # tsconfig, tailwind preset, design tokens
│   └── ...
└── waitlist/            # standalone marketing waitlist landing page
```

## Getting started

```bash
# frontend monorepo
cd frontend
npm install
npm run dev:web      # http://localhost:3001
npm run dev:admin    # http://localhost:3003

# waitlist landing
cd waitlist
npm install
npm run dev          # http://localhost:3010
```

## Environment

Each app ships a `.env.example`. Copy it to `.env.local` and set the values:

- `frontend/apps/web/.env.example`
- `frontend/apps/admin/.env.example`
- `waitlist/.env.example`

## Notes

- This is a **frontend-only** snapshot. The waitlist form POSTs to
  `WAITLIST_API_PATH` (default `/api/waitlist`) — wire it to your own route or
  proxy when the backend is ready.
- The admin app's `/api/groq` route requires a `GROQ_API_KEY` env var at build
  time only when that feature is enabled.
- Design tokens live once in `frontend/packages/config` (CSS vars + tailwind
  preset). No raw hex in components.