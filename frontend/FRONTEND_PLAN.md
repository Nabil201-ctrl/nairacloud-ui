# NairaCloud — Frontend MVP Plan
**Stack:** Next.js 14 (App Router) + TypeScript · Tailwind CSS + shadcn/ui · Zustand or React Query for state/data · WebSocket for realtime instance status
**Scope:** MVP only — runs on current 2-node container infrastructure (Bootstrap Cloud mode). No KVM UI, no multi-region, no Kubernetes. Build for what we can actually ship on 5 vCPU / 10GB.

> **As-built (2026-09):** most of this plan shipped. Diffs from the plan below:
> - Console shipped (xterm.js over WS, see `SOURCE_OF_TRUTH.md`).
> - Backups did **not** ship — the Backups tab is an honest "not available yet" empty state; no ₦500 snapshot add-on. The pricing FAQ says snapshots are on the roadmap.
> - Invoices are an HTML page (print to PDF); there is no generated-PDF download.
> - Plan changes apply immediately with no mid-cycle proration; stop does not pause billing.
> - Instances share the node's public IP with a private SSH port; there is no Networking/firewall UI and no public port mapping yet.

---

## 0. Design System (build this first, before any page)

### 0.1 Tokens
```
--bg:            #0A0A0B
--surface:       #111113
--surface-hover: #17171A
--border:        #232326
--border-hover:  #2E2E31
--text:          #F5F5F5
--text-muted:    #8A8A8F
--accent:        #00D9A0
--accent-hover:  #00F0B0
--accent-fg:     #0A0A0B   (text on accent buttons)
--danger:        #FF5C5C
--warning:       #FFB020
--info:          #4EA1FF
```
Font: **Inter/Geist** (UI text) · **JetBrains Mono** (prices, IPs, hostnames, code, specs, terminal output)
Radius: 6px (inputs/buttons), 8px (cards), 12px (modals)
Motion: 150–200ms ease-out, no bouncy easing — Linear-style restraint.

### 0.2 Component Library (shadcn/ui primitives to install)
`button`, `input`, `select`, `dropdown-menu`, `dialog`, `sheet` (slide-over), `tabs`, `table`, `badge`, `card`, `toast` (sonner), `tooltip`, `progress`, `skeleton`, `command` (⌘K palette), `avatar`, `separator`, `switch`, `checkbox`, `radio-group`, `alert`, `popover`, `accordion`, `pagination`

### 0.3 Custom Components (build once, reuse everywhere)
| Component | Used in |
|---|---|
| `<StatusDot>` (Running/Stopped/Error/Suspended, color+pulse) | Instances table, instance page, admin nodes |
| `<ResourceGauge>` (CPU/RAM/Disk radial or bar) | Dashboard, instance page, admin node page |
| `<PlanCard>` | Deploy wizard, pricing page |
| `<CopyField>` (IP, SSH command, API key — click to copy) | Instance page, API keys page |
| `<TerminalPreview>` (styled mono block, read-only) | Console modal, docs |
| `<EmptyState>` | Instances, SSH keys, invoices when empty |
| `<CapacityBanner>` ("Plan unavailable — join waitlist") | Deploy wizard |
| `<PriceTag>` (₦ mono formatted) | Everywhere pricing shows |
| `<Timeline>` (audit log / incident feed) | Admin audit log, status page |

---

## 1. Global App Shell

### 1.1 Layouts
- `MarketingLayout` — public site (nav + footer)
- `AuthLayout` — centered card, no nav, subtle bg gradient
- `DashboardLayout` — left sidebar + topbar (customer)
- `AdminLayout` — left sidebar (different nav) + topbar, red-tinted "ADMIN" badge always visible

### 1.2 Topbar (Dashboard + Admin)
- Left: breadcrumb / page title
- Center: ⌘K command palette trigger ("Search instances, docs, settings…")
- Right: notification bell (dropdown of alerts) → SSH key nudge, balance low, instance suspended
- Right: account menu (dropdown): Profile · Billing · API Keys · Support · Admin (if role=admin) · Logout

### 1.3 Sidebar Nav — Customer Dashboard
```
Overview
Instances
SSH Keys
Billing
  ↳ Subscriptions
  ↳ Invoices
  ↳ Payment Methods
Usage
API & Keys
Support
Documentation ↗ (external)
```

### 1.4 Sidebar Nav — Admin
```
Overview
Nodes
Instances
Customers
Plans
Payments
Subscriptions
Usage
Incidents
Abuse Queue
Audit Logs
Settings
```

---

## 2. Public Marketing Site

### 2.1 Homepage (`/`)
- Hero: "Your cloud." + subhead + price-from callout + [Deploy your server] [View plans]
- Live-feeling stat strip (real, not fake): "X active instances" (pull from public metrics endpoint, cache 5min)
- "Why us" section — 6 cards: Naira pricing, Paystack, Fast provisioning, Developer-first, Transparent billing, Real support
- Pricing teaser — 5 plan cards (FREE→PRO), link to full pricing page
- "How it works" — 4-step horizontal flow (Choose plan → Pay in Naira → Deploy → SSH in)
- Social proof section — **skip fake testimonials at MVP**; use a "Built in public" changelog snippet instead
- Footer: Products / Pricing / Docs / Status / Blog / Terms / Privacy / AUP / Socials

### 2.2 Pricing (`/pricing`)
- 5 plan cards side-by-side (desktop) / stacked (mobile), STARTER marked "Most popular"
- FAQ accordion: "Why is PRO limited?", "What happens if I exceed my plan?", "Do you offer backups?", "What payment methods?"
- CTA band before footer

### 2.3 Status Page (`/status`) — public, no auth
- Big "● All Systems Operational" banner (or Degraded/Outage state)
- Component list: Control Plane API / Payments / Compute / Networking / Dashboard — each with dot + uptime %
- Incident history timeline below (last 90 days)
- "Subscribe to updates" (email input) — optional MVP+1

### 2.4 Legal pages (`/terms`, `/privacy`, `/aup`) — static MDX content

### 2.5 Docs (`/docs`) — MVP: static MDX pages, sidebar nav
```
Getting Started
Creating an Instance
SSH Access
Networking & Firewall
Billing & Subscriptions
API Reference (auto-generated from OpenAPI)
```

---

## 3. Auth Flow

### 3.1 Sign Up (`/signup`)
Fields: Email, Password, Confirm Password → [Create account]
- Password strength meter
- Link → Log in

### 3.2 Verify Email (`/verify-email`)
- "We sent a code to you@email.com" + 6-digit OTP input + [Resend in 00:30]
- Blocks dashboard access until verified (middleware redirect)

### 3.3 Log In (`/login`)
Email, Password, [Log in], "Forgot password?" link, "Don't have an account? Sign up"

### 3.4 Forgot / Reset Password (`/forgot-password`, `/reset-password`)
Standard email → token link → new password form

### 3.5 Onboarding (`/onboarding`) — one-time, after first verified login
Step modal/wizard (not full page): 
1. "What are you building?" (dropdown: Website / API / Bot / Learning / Other) — used for analytics/segmentation only
2. "Add your first SSH key" (optional, [Skip for now])
3. Redirect → Dashboard, auto-open Deploy wizard if no instance yet

---

## 4. Customer Dashboard

### 4.1 Overview (`/dashboard`)
- Greeting header: "Good evening, {name}"
- Stat cards row: Active Instances · Monthly Spend (₦, mono) · Account Balance
- Aggregate resource gauges: CPU / RAM / Storage / Network (sum across instances)
- "Your Instances" — compact list (max 5, "View all →" if more), each row: name, StatusDot, specs, [⋮ menu]
  - Row `⋮` dropdown: Console · Restart · Stop · Rebuild · Delete (danger, confirm dialog)
- Empty state (no instances): illustration + "Deploy your first instance" CTA
- Floating/pinned **[+ Deploy Instance]** button (top-right of page, always visible)

### 4.2 Instances List (`/dashboard/instances`)
- Table: Name · Status · Plan · IP · Region · Created · Actions
- Filter bar: Status dropdown (All/Running/Stopped/Error/Suspended), Search by name/IP
- Sort by created date / name
- Bulk select → bulk restart/delete (with confirm)
- Row click → Instance Detail page
- **[+ Deploy Instance]** button top-right

### 4.3 Deploy Instance Wizard (`/dashboard/instances/new`) — multi-step, modal or full-page stepper
**Step 1 — Plan**
- Cards: FREE / STARTER / BASIC / STANDARD / PRO
- Disabled + `<CapacityBanner>` if plan is at capacity ("PRO — Currently unavailable, join waitlist")
- Price, CPU, RAM, storage shown per card

**Step 2 — OS**
- Radio cards: Ubuntu 22.04 / Ubuntu 24.04 / Debian 12 / AlmaLinux 9 (logos)

**Step 3 — SSH Key**
- Dropdown: select existing key
- `[+ Add new SSH key]` → opens modal (Name + paste public key + validation) inline, doesn't leave wizard

**Step 4 — Hostname**
- Text input, live validation (lowercase, numbers, hyphens only), live preview: `my-server.nairacloud.app`

**Step 5 — Review & Pay**
- Summary card: plan, OS, hostname, SSH key fingerprint, price
- [Deploy] → triggers Paystack checkout modal/redirect
- On return: polling/WebSocket screen — "Provisioning your instance…" progress steps (Payment verified → Node assigned → Instance booting → Network configured → Ready) with animated checklist
- On success → redirect to Instance Detail
- On failure → error state with [Retry] / [Contact support]

### 4.4 Instance Detail (`/dashboard/instances/[id]`)
Header: hostname, StatusDot, plan badge, IP with `<CopyField>`
Tabs: **Overview** · **Console** · **Metrics** · **Networking** · **Backups** · **Settings**

- **Overview tab**: quick specs, uptime, SSH connect string (`<CopyField>`), action buttons row (Restart/Stop/Rebuild/Delete — each behind confirm dialog, Delete requires typing hostname to confirm)
- **Console tab**: embedded web terminal (xterm.js) via WebSocket to node agent
- **Metrics tab**: 4 charts — CPU / RAM / Disk / Network, time range selector (1h/24h/7d)
- **Networking tab**: IP, firewall rule list (MVP: read-only default rules + "request change via support")
- **Backups tab**: if not subscribed → upsell card ("Enable backups — ₦500/mo"); if subscribed → snapshot list + [Restore] [Create manual backup]
- **Settings tab**: rename instance, danger zone (rebuild/delete)

### 4.5 SSH Keys (`/dashboard/ssh-keys`)
- Table: Name · Fingerprint · Added date · [⋮ Delete]
- `[+ Add SSH Key]` → modal (Name, paste key, validate format client-side)
- Empty state prompts add before allowing deploy elsewhere

### 4.6 Billing
**Subscriptions (`/dashboard/billing/subscriptions`)**
- List of active subscriptions per instance: plan, price, next billing date, status (Active/Grace/Suspended)
- `[Manage]` → modal: upgrade/downgrade plan (shows prorated note), cancel subscription (confirm, explains grace period + data retention)

**Invoices (`/dashboard/billing/invoices`)**
- Table: Invoice # · Date · Amount · Status (Paid/Due/Failed) · [Download PDF] [View]

**Payment Methods (`/dashboard/billing/payment-methods`)**
- Paystack-tokenized cards list, [+ Add payment method], set default, remove

**Balance/top-up banner** shown if grace period active: "Payment failed — update your card. 2 days left before suspension." [Update payment]

### 4.7 Usage (`/dashboard/usage`)
- Cross-instance usage table + simple bar chart of spend over last 6 months (mono price labels)

### 4.8 API & Keys (`/dashboard/api-keys`)
- Table of API keys: name, prefix, created, last used, [Revoke]
- `[+ Generate API Key]` → modal, shows secret ONCE with copy + "you won't see this again" warning
- Link to API docs

### 4.9 Support (`/dashboard/support`)
- Ticket list: Subject · Category (Billing/Technical/Network/Abuse/Account) · Status · Last update
- `[+ New Ticket]` → modal: category dropdown, subject, description, optional instance attach
- Ticket detail (`/dashboard/support/[id]`) — thread view, reply box, status badge

### 4.10 Account Settings (`/dashboard/settings`)
Tabs: **Profile** (name, email, avatar) · **Security** (password change, 2FA toggle — MVP+1) · **Notifications** (email toggle per alert type) · **Danger Zone** (delete account)

---

## 5. Admin Panel (role-gated, separate route group `/admin`)

### 5.1 Overview (`/admin`)
- Stat cards: Total customers, Active instances, MRR, Node capacity used %
- Alerts feed (node offline, payment webhook failures, provisioning errors)

### 5.2 Nodes (`/admin/nodes`)
- Card per node: NODE-01 / NODE-02, status (ONLINE/DEGRADED/DRAINING/OFFLINE/MAINTENANCE), CPU/RAM/Storage gauges, instance count
- `[Drain]` `[Maintenance mode]` `[Restart agent]` — each with confirm dialog
- Node detail (`/admin/nodes/[id]`) — instance list on that node, raw metrics, logs tail

### 5.3 Instances (`/admin/instances`)
- Full table across all customers: owner, hostname, plan, node, status, created
- Filters: node, status, plan, customer search
- Row actions: View · Suspend · Resume · Restart · Rebuild · Delete · Move (dropdown to pick target node)
- Instance detail mirrors customer view + admin-only "Logs" tab (raw provisioning/agent logs)

### 5.4 Customers (`/admin/customers`)
- Table: name, email, status, instances count, MRR, joined date
- Customer detail (`/admin/customers/[id]`) — profile, instances, payments, tickets, `[Suspend account]`

### 5.5 Plans (`/admin/plans`)
- Table of plans with edit modal (price, CPU, RAM, storage, status Active/Limited/Disabled)
- Toggle "Limited availability" per plan (drives the customer-facing waitlist banner)

### 5.6 Payments (`/admin/payments`)
- Table: reference, customer, amount, status, webhook received time
- Filter by status (Success/Failed/Pending), search by reference
- Manual "Retry webhook verification" action for support cases

### 5.7 Subscriptions (`/admin/subscriptions`)
- Table across all customers, status filter (Active/Grace/Suspended/Cancelled)

### 5.8 Usage (`/admin/usage`)
- Aggregate charts: capacity allocated vs total, per-node utilization trend

### 5.9 Incidents (`/admin/incidents`)
- List of internal incidents (from failed provisioning etc.), status (Open/Investigating/Resolved), linked to status page component
- `[+ New Incident]` modal — also pushes to public status page

### 5.10 Abuse Queue (`/admin/abuse`)
- Flagged instances/accounts (from automated detection), evidence snippet, `[Suspend]` `[Dismiss]` `[Escalate]`

### 5.11 Audit Logs (`/admin/audit-logs`)
- `<Timeline>` — filterable by user, action type, date range, exportable CSV

### 5.12 Settings (`/admin/settings`)
- Global toggles: maintenance mode banner, free tier signup on/off, capacity reserve %

---

## 6. Cross-Cutting UX Patterns

| Pattern | Rule |
|---|---|
| Destructive actions | Always `<Dialog>` confirm; Delete Instance requires typing hostname |
| Loading | `<Skeleton>` for tables/cards, never blank white flash (dark bg) |
| Empty states | Always illustration + one clear CTA, never just "No data" |
| Errors | Toast for transient (network), inline `<Alert>` for form errions, full error page for 404/500 |
| Realtime | Instance status + provisioning progress via WebSocket; fallback to 5s polling if socket drops |
| Currency | Always ₦ + mono font, comma-separated, never floating dollar signs |
| Empty capacity | Never silently fail — always show waitlist path |
| Mobile | Dashboard sidebar collapses to bottom sheet / hamburger; tables become stacked cards below 768px |

---

## 7. Page/Route Inventory (quick reference for dev)

```
PUBLIC
/                          Homepage
/pricing
/status
/docs, /docs/[slug]
/terms /privacy /aup
/blog, /blog/[slug]        (MVP+1, static MDX ok)

AUTH
/signup
/login
/verify-email
/forgot-password
/reset-password
/onboarding

DASHBOARD
/dashboard
/dashboard/instances
/dashboard/instances/new
/dashboard/instances/[id]              (tabs: overview/console/metrics/networking/backups/settings)
/dashboard/ssh-keys
/dashboard/billing/subscriptions
/dashboard/billing/invoices
/dashboard/billing/payment-methods
/dashboard/usage
/dashboard/api-keys
/dashboard/support
/dashboard/support/[id]
/dashboard/settings

ADMIN
/admin
/admin/nodes
/admin/nodes/[id]
/admin/instances
/admin/instances/[id]
/admin/customers
/admin/customers/[id]
/admin/plans
/admin/payments
/admin/subscriptions
/admin/usage
/admin/incidents
/admin/abuse
/admin/audit-logs
/admin/settings
```

**Total: ~38 routes for full MVP.** Recommend building in this order: Auth → Dashboard Overview → Deploy Wizard → Instance Detail → SSH Keys → Billing → Admin Nodes/Instances → everything else.
