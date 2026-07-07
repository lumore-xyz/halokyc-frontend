# Audit Logging

**Status:** ✅ Implemented

Immutable, append-only audit trail for every status change and sensitive action across the platform.

## What it does
- Records `actor_id`, `timestamp`, `previous_status`, `new_status`, and `reason` (plus structured `old_value` / `new_value` JSON for config changes)
- Captures: verification status changes, lifecycle actions (reset, delete, ban, ban lift), role changes, API key actions, webhook changes, refunds, retention policy updates, privacy request processing, agentic adjudication events
- Never modified or deleted after write; no update or delete endpoint exists
- Role-gated visibility: clients see their own workspace events; platform admins see all tenants

## Key endpoints
- `GET /api/v1/workspaces/{workspace_id}/audit-logs` — client-scoped
- `GET /api/v1/admin/audit-logs` — platform-scoped with filters

## Frontend pages
- `/dashboard/audit-logs` — client audit log viewer
- `/admin/audit-logs` — platform admin audit log

## Implementation notes
- `audit_logs` table is the single source of truth; no derived cache
- `retention_log_retention_days` and `audit_log_retention_days` are configurable per `RetentionPolicy`; `purge_expired_evidence` cleans up expired audit rows in scheduled runs
- Agentic events: `agentic_shadow_recommended`, `agentic_auto_decided`, `agentic_fallback_used`, `agentic_timeout_recovery`, `auto_decide_confidence_override`
- Compliance events: `consent_captured`, `privacy_request_processed`, `retention_policy_updated`

## Related
- [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §2.10, §9 (security)
- [`API_CONTRACTS.md`](API_CONTRACTS.md) §Audit Logs
- [`backend/DATABASE_SCHEMA.md`](backend/DATABASE_SCHEMA.md) `audit_logs`
- [`COMPLIANCE.md`](COMPLIANCE.md) §5 (Audit & Compliance Logic)
