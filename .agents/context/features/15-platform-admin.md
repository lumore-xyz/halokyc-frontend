# Platform Admin Portal

**Status:** ✅ Implemented

Full operator surface for platform owners and internal roles to manage the SaaS infrastructure, onboard clients, monitor system health, adjust billing, and respond to support requests.

## What it does

### Platform roles (from `platform_admins` table)
- `platform_owner` — full access
- `platform_business_admin` — organizations, workspaces, verifications, billing, audit logs (no platform admin management)
- `platform_support` — organization lookup, verification lookup, webhook logs, error logs, support notes
- `platform_sales` — customers, leads, plans, usage summary, sales notes

### Admin surfaces
- **Overview**: system-wide verification volume, AI failure rates, latency
- **Organizations**: list, create, suspend, view detail, transfer credits
- **Workspaces**: list under each organization
- **Verifications**: platform-wide lookup, detail, override
- **Billing & Credits**: credit ledger, manual adjustment, credit-ledger reads scoped by org/workspace
- **AI Providers**: provider + key management (see `14-ai-provider-management.md`)
- **Platform Admins**: invite, update roles, disable users (platform_owner only)
- **Audit Logs**: immutable event stream across all tenants
- **Webhook Deliveries**: delivery log with status codes and errors
- **Support Hub**: webhook/error logs, support notes
- **Sales Hub**: customer list, leads, plans, usage summary, sales notes
- **System Settings**: global configuration toggles
- **Metrics / Automation**: provider failure rate, budget fallback count, invalid output fallback count, auto-decision volume, manual review rate by workflow/service/timeout

## Key endpoints (all under `/api/v1/admin/`, role-gated)
- `/admin/organizations`, `/admin/workspaces`, `/admin/verifications`
- `/admin/billing/credits`, `/admin/billing/credits/adjust`, `/admin/credit-ledger`
- `/admin/ai-providers`, `/admin/ai-providers/{id}/keys/{key_id}/test`
- `/admin/platform-admins`, `/admin/platform-admins/invite`
- `/admin/audit-logs`, `/admin/webhook-deliveries`
- `/admin/metrics/automation` — Phase 10 automation aggregates

## Frontend pages
- `/admin` and `/admin/*` — each admin section routed under the sidebar

## Implementation notes
- First `platform_owner` bootstrapped from environment only when none exists
- Backend enforces 403s for unauthorized platform roles; frontend route hiding is UX only
- All sensitive actions (credit adjustments, organization suspension, admin invites) audited
- Admin JWTs in httpOnly cookies; never exposed to browser JS

## Related
- [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §2.1 (Platform Admin persona), §2.11 (admin portal)
- [`API_CONTRACTS.md`](API_CONTRACTS.md) §Admin
- [`backend/DATABASE_SCHEMA.md`](backend/DATABASE_SCHEMA.md) `platform_admins`
- [`backend/DECISIONS.md`](backend/DECISIONS.md) ADR-008 (database-backed admin auth)
- [`TODO.md`](TODO.md) §4 (platform admin users & RBAC)
