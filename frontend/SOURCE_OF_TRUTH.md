# NairaCloud — Frontend Source of Truth
> This file is law. `FRONTEND_PLAN.md` is the product spec.
> This file is how we execute it: brand, UX, UI, SEO, security, quality.
> If they conflict, this file wins on HOW, `FRONTEND_PLAN.md` wins on WHAT.

**Scope:** frontend only. Never touch `backend/`. API is cookie-session first.
**Stack:** Next.js 14 App Router + TypeScript strict · Tailwind + shadcn/ui.
**Infra reality:** 2-node Bootstrap Cloud. No KVM UI, no multi-region, no K8s.
## 1. Production structure — admin is a separate app
```
frontend/
  FRONTEND_PLAN.md      # WHAT to build (frozen product spec)
  SOURCE_OF_TRUTH.md    # HOW to build (this file, obeyed)
  apps/
    web/                # customer app: marketing + auth + dashboard
    admin/              # admin app: standalone, role-gated
  packages/
    ui/                 # tokens + shadcn wrappers + StatusDot, ResourceGauge,
                        # PlanCard, CopyField, TerminalPreview, EmptyState,
                        # CapacityBanner, PriceTag, Timeline
    api-client/         # typed fetch from backend/openapi.json, CSRF + refresh
    config/             # tsconfig, eslint, tailwind preset (single tokens)
```
Why separate: separate deploys (`app.` vs `admin.`), separate CORS origins,
smaller customer bundle, admin gets stricter CSP + ADMIN badge isolation,
independent releases, fail-closed RBAC. Never import admin code into web.
## 2. Product manager rules (think before coding)
1. Build order is law: tokens → Auth → Overview → Deploy wizard →
   Instance detail → SSH keys → Billing → Admin nodes/instances → rest.
2. Never ship fake data. Stats strip pulls `GET /v1/public/stats` (5min cache).
   No fake testimonials — use changelog snippet. No fake uptime.
3. Capacity-aware UX: never silently fail. At-capacity plan = disabled card +
   `<CapacityBanner>` + waitlist path (per FRONTEND_PLAN §4.3, §6).
4. Money truth: Paystack redirect is NEVER success. Poll
   `GET /v1/instances/:id` until out of `CREATING`. Free plan skips checkout.
5. Every route has: loading (`<Skeleton>`), empty (illustration + 1 CTA),
   error (toast transient / inline `<Alert>` form / full 404-500 page).
6. Destructive = `<Dialog>` confirm; Delete Instance = type hostname.
## 3. Brand (strongest version, locked)
- Position: "Your cloud." Naira-first, Paystack-native,
  developer-first, transparent billing, real support.
- Voice: direct, technical, no hype. Ban: unleash, seamless, elevate,
  next-gen, game-changer, delve. Write plain sentences.
- Dark-first (Vercel-inspired restraint): `--bg:#000000 --main:#1A1A1A`
  `--card:#0D0D0D --surface:#101010 --surface-hover:#161616`
  `--nav-active:#202020 --border:rgba(255,255,255,0.08)`
  `--border-subtle:rgba(255,255,255,0.05) --text:#FFFFFF`
  `--text-secondary:#A1A1A1 --text-muted:#666666 --accent:#4ec9b0`
  `--accent-hover:#6dd3c0 --accent-fg:#000000 --danger:#f48771`
  `--warning:#cca700 --info:#3794ff`.
- One accent only (`#4ec9b0` green). Use sparingly: chart lines, progress
  rings, live status, selected tabs, small highlights. Never fill whole cards.
  Primary CTAs are white/black; secondary are dark bordered surfaces.
- Hierarchy: black page → charcoal main container → near-black cards →
  subtle borders → white primary text → gray secondary → green for active data.
- Type: Geist/Inter UI + JetBrains Mono for prices, IPs, hostnames, specs,
  terminal. Currency: always `₦` + mono + commas. Never `$`.
- Radius 6 controls, 8 cards/nav, 12 main containers, 16 floating mobile nav.
  Motion 150-200ms ease. No glassmorphism, no heavy shadows, no glow spam.
## 4. UI consistency (no drift)
- Tokens live once in `packages/config` as CSS vars. No raw hex in components.
- shadcn primitives (install once in `packages/ui`): button, input, select,
  dropdown-menu, dialog, sheet, tabs, table, badge, card, sonner toast,
  tooltip, progress, skeleton, command (Cmd+K), avatar, separator, switch,
  checkbox, radio-group, alert, popover, accordion, pagination.
- Custom once, reuse everywhere: StatusDot, ResourceGauge, PlanCard,
  CopyField, TerminalPreview, EmptyState, CapacityBanner, PriceTag, Timeline.
- Layouts: `MarketingLayout` (nav+footer) · `AuthLayout` (centered card) ·
  `DashboardLayout` (sidebar+topbar) · `AdminLayout` (different nav + red
  ADMIN badge always visible). Sidebar navs = FRONTEND_PLAN §1.3/§1.4 verbatim.
- Tables → stacked cards <768px. Sidebar → hamburger/bottom sheet on mobile.
- Fonts via `next/font`, self-hosted. Icons: one family (Phosphor), one
  stroke width. No emoji in UI. Max 65ch body, `min-h-[100dvh]` never `h-screen`.
## 5. SEO + best-app performance (web app)
- Metadata API on every public route: title, description, canonical, OG,
  twitter card. `/sitemap.xml` + `/robots.txt`. Semantic HTML
  (`main/article/nav/section`), one `h1` per page, real alt text.
- Public pages static where possible (`/`, `/pricing`, `/status`, `/docs`,
  `/terms`, `/privacy`, `/aup`). Status page: `revalidate 30s`, reads
  `GET /v1/public/status` + `GET /v1/public/incidents`.
- Targets: LCP <2.5s, CLS <0.1, INP <200ms. Hero image `priority`, explicit
  sizes, `next/image`. No layout shift on skeletons.
- Dashboard/admin: `noindex, nofollow`. No marketing JS on admin bundle.
## 6. Data + realtime (only these patterns)
- `packages/api-client`: `fetch(..., { credentials:'include' })`, typed from
  `backend/openapi.json` (orval/hey-api). Read `data/meta` envelope.
- Switch on stable codes: UNAUTHORIZED, FORBIDDEN, CSRF_REJECTED,
  EMAIL_UNVERIFIED, INVALID_CREDENTIALS, OTP_INVALID/EXPIRED, NO_CAPACITY,
  PAYMENT_REQUIRED, HOSTNAME_TAKEN, SUSPENDED, NOT_RUNNING, RATE_LIMITED.
- Pagination `?page=&limit=` everywhere, use `meta.totalPages`.
- Realtime: Socket.IO `/ws` (`instance.status.changed`,
  `instance.provisioning.progress`, `alert.new`, admin `node.status.changed`).
  Fallback 5s polling if socket drops. Console: `GET console-token`
  (60s TTL) → `emit console.subscribe` → xterm.js read-only preview.
- State: server state = React Query; client wizard/UI state = Zustand.
  Images enum only: `ubuntu-22.04|ubuntu-24.04|debian-12|almalinux-9`.
## 7. Security — 100% (frontend scope, non-negotiable)
1. Cookies are the session. Never store JWT in localStorage/sessionStorage.
   Mutations send `X-CSRF-Token: <nc_csrf>`; on 401+UNAUTHORIZED call
   `POST /v1/auth/refresh` once then retry; `POST /v1/auth/logout` clears.
2. `NEXT_PUBLIC_*` allowlist ONLY: API URL, WS URL, PAYSTACK_PUBLIC_KEY,
   app URLs. Never Paystack secret, JWT secrets, agent HMAC, SMTP creds.
3. No `dangerouslySetInnerHTML` for user content. Render API error `message`
   as text, never HTML. Validate all forms with zod + server envelope.
4. Admin: middleware checks `role===ADMIN` + server `GET /v1/auth/me` gate,
   fail-closed to `/login`. Separate origin in `CORS_ORIGINS`. Stricter CSP,
   no marketing trackers in `apps/admin`.
5. API keys: show raw secret ONCE with copy + "won't see again" warning.
6. Headers via `next.config`: CSP, `frame-ancestors 'self'`,
   `referrer-policy`, `X-Content-Type-Options`, HSTS on prod domains.
## 8. Zero-bug bar (every step)
- `strict` TS, no `any` without guard. `npm run typecheck`, `lint`, `test`
  green before next step. Small diffs, existing stack only.
- Auth walls in middleware: unverified → `/verify-email`; authed → away
  from `/login|/signup`; first verified login → `/onboarding` once.
- Hostname live validation: lowercase/numbers/hyphens; preview
  `my-server.nairacloud.app`; handle `HOSTNAME_TAKEN` inline.
- SSH key paste validated client-side before POST. OTP 6-digit + resend timer.
- Contract tests: login→refresh→me, CSRF reject path, NO_CAPACITY banner,
  checkout-poll state machine, admin 403 for CUSTOMER role.
- A11y: focus rings, 44px targets, labels above inputs, AA contrast,
  `prefers-reduced-motion` disables loops/parallax. Animate transform/opacity.
## 9. Obey list (agent contract)
DO: follow FRONTEND_PLAN §7 route inventory verbatim (~38 routes); reuse
`packages/ui`; add skeletons/empty/error per route; `₦` mono everywhere.
DO NOT: invent KVM/multi-region/K8s UI; add purple gradients, Inter-only
typography, 3-equal-card clichés, fake stats/testimonials, localStorage auth,
or backend changes. One accent, one icon family, one token source.
Step gate: demo previous step (typecheck+lint+manual path) before next.

## 10. Build sequence (step by step)
0. Tokens + `packages/ui` + api-client shell + web/admin shells + headers.
1. Auth (`/signup /verify-email /login /forgot-password /reset-password
   /onboarding`) + middleware walls.
2. Overview + Instances list + Deploy wizard (plan→OS→SSH→hostname→review→
   Paystack→provisioning checklist→detail).
3. Instance detail tabs + SSH keys + Billing (subscriptions/invoices/methods).
4. Usage + API keys + Support + Settings.
5. Marketing (`/ /pricing /status /docs /terms /privacy /aup`) + SEO pack.
6. Admin app: overview → nodes → instances → customers → plans → payments →
   subscriptions → usage → incidents → abuse → audit-logs → settings.
