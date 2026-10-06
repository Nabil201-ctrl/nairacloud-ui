# NairaCloud Platform — API Endpoints

**Base URL:** `https://api.nairacloud.xyz` (REST paths below start after the `v1` global prefix)
**WebSocket:** `${NEXT_PUBLIC_WS_URL}` → default `wss://api.nairacloud.xyz`, namespace `/ws` (socket.io)
**Admin Frontend:** `https://api.nairacloud.xyz` /admin routes
**OpenAPI:** `https://api.nairacloud.xyz/openapi.json` and ReDoc at `/docs`

Paths are shown relative to the prefix, e.g. `/v1/instances`.

---

## Global Notes

- **Authentication:** the `nc_access` cookie (JWT) set on `.nairacloud.xyz` (`HttpOnly`, `Secure`, `SameSite=Lax`). API keys are sent as `Authorization: Bearer nc_live_…`. CS agent (n8n): `Authorization: Bearer nc_agent_…` plus `X-NairaCloud-Customer-Id` or `X-NairaCloud-Customer-Email`.
- **Excluded from the `v1` prefix** (no `/v1`): `/health`, `/ready`, `/metrics`, `/docs`, `/docs-json`, `/openapi.json`, and everything under `/internal/*`.
- **Responses:** success `{ success: true, data }`; errors `{ success: false, error: { code, message, details? }, requestId }`.
- **Admin endpoints** require `role=ADMIN` (cookie auth).

---

## Authentication (`/v1/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/auth/signup` | Register new user |
| `POST` | `/v1/auth/verify-email` | Verify email with OTP code |
| `POST` | `/v1/auth/resend-verification` | Resend verification email |
| `POST` | `/v1/auth/login` | Login (sets JWT + refresh cookies) |
| `POST` | `/v1/auth/logout` | Logout (clears cookies) |
| `POST` | `/v1/auth/refresh` | Refresh access token |
| `POST` | `/v1/auth/forgot-password` | Request password reset |
| `POST` | `/v1/auth/reset-password` | Reset password with token |
| `GET` | `/v1/auth/me` | Get current user profile |

---

## User Management (`/v1/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/users/me` | Get current user profile |
| `PATCH` | `/v1/users/me` | Update profile |
| `PATCH` | `/v1/users/me/password` | Change password |
| `DELETE` | `/v1/users/me` | Delete account |
| `GET` | `/v1/users/me/notifications-settings` | Get notification settings |
| `PATCH` | `/v1/users/me/notifications-settings` | Update notification settings |

---

## Admin API (`/v1/admin`) — *Admin only*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/admin/overview` | Dashboard overview stats |
| `GET` | `/v1/admin/nodes` | List all nodes |
| `POST` | `/v1/admin/nodes/onboard` | Onboard new node |
| `POST` | `/v1/admin/nodes/probe` | Probe node via SSH (WS probe progress) |
| `GET` | `/v1/admin/nodes/:id` | Get node details |
| `POST` | `/v1/admin/nodes/:id/drain` | Drain node into maintenance |
| `POST` | `/v1/admin/nodes/:id/maintenance` | Toggle maintenance mode |
| `POST` | `/v1/admin/nodes/:id/restart-agent` | Roll the node agent forward to a stored release (in-place binary swap, body may carry `releaseId` or `version`; defaults to the active release) |
| `POST` | `/v1/admin/nodes/:id/retry-onboard` | Retry node onboarding |
| `POST` | `/v1/admin/nodes/:id/reconcile-containers` | Reconcile runtime containers |
| `GET` | `/v1/admin/agent-releases` | List stored agent release binaries (metadata) |
| `POST` | `/v1/admin/agent-releases` | Upload an agent release binary (multipart `file`, `version`, optional `notes`/`sha256`) |
| `POST` | `/v1/admin/agent-releases/:id/activate` | Mark a release as the default update target |
| `DELETE` | `/v1/admin/agent-releases/:id` | Delete a stored release (refuses the active one) |
| `GET` | `/v1/admin/instances` | List all instances |
| `GET` | `/v1/admin/instances/:id` | Get instance details |
| `POST` | `/v1/admin/instances/:id/suspend` | Suspend instance |
| `POST` | `/v1/admin/instances/:id/resume` | Resume instance |
| `POST` | `/v1/admin/instances/:id/move` | Move instance to another node |
| `GET` | `/v1/admin/instances/:id/logs` | Tail instance logs |
| `GET` | `/v1/admin/orders` | List orders |
| `GET` | `/v1/admin/customers` | List customers |
| `GET` | `/v1/admin/customers/:id` | Get customer details |
| `GET` | `/v1/admin/customers/:id/wallet` | Get customer wallet |
| `GET` | `/v1/admin/wallet-transactions` | List wallet transactions |
| `POST` | `/v1/admin/wallet-transactions/:reference/retry-verify` | Re-verify a funding reference |
| `POST` | `/v1/admin/customers/:id/suspend` | Suspend customer account |
| `POST` | `/v1/admin/customers/:id/terminate` | Terminate account (AUP) — stops instances, data removed after 14 days |
| `GET` | `/v1/admin/plans` | List all plans incl. DISABLED |
| `POST` | `/v1/admin/plans` | Create plan |
| `PATCH` | `/v1/admin/plans/:id` | Update plan |
| `GET` | `/v1/admin/payments` | List payments |
| `POST` | `/v1/admin/payments/:reference/retry-verification` | Re-verify a payment |
| `GET` | `/v1/admin/subscriptions` | List subscriptions |
| `GET` | `/v1/admin/usage/aggregate` | Usage sample count |
| `GET` | `/v1/admin/incidents` | List status incidents |
| `POST` | `/v1/admin/incidents` | Create incident |
| `PATCH` | `/v1/admin/incidents/:id` | Update incident |
| `GET` | `/v1/admin/abuse-queue` | List open abuse cases |
| `POST` | `/v1/admin/abuse-queue/:id/resolve` | Resolve/dismiss (+ action: suspendInstance, suspendAccount, terminateAccount) |
| `GET` | `/v1/admin/audit-logs` | Audit log trail |
| `GET` | `/v1/admin/settings` | Platform settings |
| `PATCH` | `/v1/admin/settings` | Update settings |

---

## Instances (`/v1/instances`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/instances` | Create instance (planId, hostname, image, sshKeyId) |
| `GET` | `/v1/instances` | List instances |
| `GET` | `/v1/instances/:id` | Get instance details |
| `POST` | `/v1/instances/:id/action` | Generic lifecycle action |
| `PATCH` | `/v1/instances/:id` | Update instance (hostname, autoRenew, ...) |
| `POST` | `/v1/instances/:id/start` | Start instance |
| `POST` | `/v1/instances/:id/stop` | Stop instance |
| `POST` | `/v1/instances/:id/restart` | Restart instance |
| `POST` | `/v1/instances/:id/rebuild` | Rebuild from image (same address + port) |
| `DELETE` | `/v1/instances/:id` | Delete instance (confirmation name required) |
| `GET` | `/v1/instances/:id/metrics` | Instance usage metrics |
| `GET` | `/v1/instances/:id/console-token` | Console WebSocket token |

---

## Plans (`/v1/plans`) — *public*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/plans` | List active plans |
| `GET` | `/v1/plans/:id` | Get plan details |

---

## SSH Keys (`/v1/ssh-keys`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/ssh-keys` | Add SSH key |
| `GET` | `/v1/ssh-keys` | List SSH keys |
| `DELETE` | `/v1/ssh-keys/:id` | Delete SSH key |

---

## API Keys (`/v1/api-keys`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/api-keys` | Create API key (`nc_live_…`) |
| `GET` | `/v1/api-keys` | List API keys |
| `DELETE` | `/v1/api-keys/:id` | Delete API key |

---

## Billing (`/v1/billing`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/billing/wallet` | Get wallet balance |
| `POST` | `/v1/billing/wallet/fund` | Fund wallet |
| `POST` | `/v1/billing/wallet/verify` | Verify funding |
| `POST` | `/v1/billing/checkout` | Create checkout session |
| `POST` | `/v1/billing/webhooks/paystack` | Paystack webhook (no auth) |
| `GET` | `/v1/billing/subscriptions` | List subscriptions |
| `PATCH` | `/v1/billing/subscriptions/:id` | Update subscription (cancel / upgrade / downgrade) |
| `GET` | `/v1/billing/invoices` | List invoices |
| `GET` | `/v1/billing/invoices/:id` | Invoice details |
| `GET` | `/v1/billing/invoices/:id/pdf` | Invoice (JSON with `url`, or `html` to print/save as PDF) |
| `GET` | `/v1/billing/payment-methods` | List payment methods |
| `POST` | `/v1/billing/payment-methods` | Add payment method |
| `DELETE` | `/v1/billing/payment-methods/:id` | Delete payment method |

---

## Support (`/v1/support`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/support` | Create ticket |
| `GET` | `/v1/support` | List tickets |
| `GET` | `/v1/support/:id` | Get ticket details |
| `POST` | `/v1/support/:id/reply` | Reply to ticket |
| `POST` | `/v1/support/:id/messages` | Add message to ticket |
| `PATCH` | `/v1/support/:id` | Update ticket |

---

## CS Agent (`/v1/cs-agent`) — *nc_agent_ key*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/cs-agent/customers` | Lookup customer by `?email=` or `?id=` |
| `GET` | `/v1/cs-agent/customers/:id` | Customer account summary |

Admin: `POST|GET /v1/admin/cs-agent-keys`, `DELETE /v1/admin/cs-agent-keys/:id`. Full n8n guide: Backend `docs/CS_AGENT.md`.

---

## Referrals (`/v1/referrals`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/referrals` | Get referral info |

---

## Usage (`/v1/usage`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/usage/summary` | Usage summary |
| `GET` | `/v1/usage/history` | Usage history |

---

## Public / Status (`/v1/public`) — *no auth*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/public/status` | Overall + component status |
| `GET` | `/v1/public/incidents` | Incident history |
| `GET` | `/v1/public/stats` | Homepage stats (active instances, customers, nodes) |

---

## Internal / Node Agent (`/internal`) — *HMAC-authenticated agent channel*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/internal/nodes/register` | Register node |
| `POST` | `/internal/nodes/:id/heartbeat` | Node heartbeat |
| `POST` | `/internal/nodes/:id/metrics` | Per-instance usage metrics |
| `POST` | `/internal/jobs/:jobId/ack` | Acknowledge job |
| `POST` | `/internal/jobs/:jobId/complete` | Complete job |
| `POST` | `/internal/jobs/:jobId/fail` | Fail job |

---

## Health (no `/v1` prefix)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Liveness |
| `GET` | `/ready` | Readiness |
| `GET` | `/metrics` | Metrics |

---

## WebSocket (`wss://api.nairacloud.xyz/ws`)

| Event | Direction | Description |
|-------|-----------|-------------|
| `connect` | Client → Server | Authenticate with `nc_access` cookie |
| `console.subscribe` | Client → Server | Join instance console room (with console token) |
| `console.input` | Client → Server | Forward keystrokes to the instance |
| `console.data` | Server → Client | Console output relay |
| `node.probe.progress` | Server → Client | Real-time probe progress |
| `instance.status.changed` | Server → Client | Instance status updates |
| `alert.new` | Server → Client | Alert notifications |

---

**Generated:** 2026-09-25
**API Version:** v1