# Monitoring & Analytics

**Status:** ✅ Implemented

Platform-wide and workspace-scoped observability for verification volume, AI accuracy, automation efficiency, and credit usage.

## What it does
- **Platform admin overview**: verification volume, AI failure rates (OCR, face), system latency
- **Agentic adjudication metrics**: provider failure rate, budget fallback count, invalid output fallback count, auto-decision volume, shadow recommendation agreement rate
- **Automation efficiency cards** (Phase 10): manual review rate, top manual-review factors, timeout recovery success rate, duplicate policy coverage — scoped by workspace/organization/workflow and time window
- **Workspace analytics**: manual review trends by workflow, agreement rate, fallback count, average agent latency
- **Aggregate endpoint**: `GET /api/v1/admin/metrics/automation` returns `AutomationMetricsResponse` with window, scope, totals, and time-series buckets

## Key endpoints
- `GET /api/v1/admin/metrics/automation?organization_id=&workspace_id=&workflow_id=&since=&until=` — platform admin aggregate
- `GET /api/v1/admin/metrics/ai-failures` — AI failure rates (OCR, face) per client
- Workspace analytics derived from client-scoped verification detail sample (no separate endpoint)

## Frontend surfaces
- `/admin/metrics/automation` — platform admin automation cards
- `/dashboard/analytics` — workspace-level analytics (manual review trends by workflow)

## Implementation notes
- Metrics query the existing `verification_checks` and `audit_logs` tables; no new time-series DB or Prometheus
- Role-gated: provider metadata visible only to `platform_owner` / `platform_business_admin`
- Time-window selector and workspace/organization scoping on admin surfaces
- No unbounded aggregation; always scoped to prevent full-table scans on production

## Related
- [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §2.1 (Platform Admin monitoring), §2.11 (admin portal)
- [`API_CONTRACTS.md`](API_CONTRACTS.md) §Admin Metrics
- [`backend/MONITORING.md`](backend/MONITORING.md) — monitoring design doc
- [`TODO.md`](TODO.md) §10.3 (platform admin monitoring aggregates), §10.6 (analytics instrumentation)
