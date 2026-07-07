# Monitoring & Observability — Design

**Status:** Approved 2026-06-25. Implementation in progress.

**Context:** [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §2.11 (admin portal monitoring) · [`TODO.md`](TODO.md) §10.3 (Phase 10 monitoring aggregates) · [`backend/ARCHITECTURE.md`](ARCHITECTURE.md) (service layout) · [`API_CONTRACTS.md`](API_CONTRACTS.md) (metrics endpoints)

## Goal

Per `backend/TODO.md` Loop 3.2: *"Implement basic metrics for AI
failure rates (OCR/Face) per client."*

`PRODUCT_PLAN.md` says the Platform Admin *"monitors system-wide
performance and AI accuracy"*, and `PRODUCT_PLAN.md` lists
**Platform Monitoring** as *"a global view of verification volume,
AI failure rates, and system latency."*

MVP scope from the TODO line: **basic, AI failure rates, OCR + Face,
per client.** No new infra, no Prometheus, no time-series DB. Query
the existing `verification_checks` table.

## Decisions

| # | Decision | Why |
|---|----------|-----|
| D1 | Read-only SQL aggregation over `verification_checks` joined to `verification_sessions` (for `client_id`). No new tables, no new columns, no Alembic migration. | "Basic" per the TODO. ADR-010 says avoid complex infra. |
| D2 | Single admin endpoint `GET /api/v1/admin/metrics/ai-failures` returning a JSON rollup. | Matches "global view" in `PRODUCT_PLAN.md`. Easier than N per-client calls for the MVP admin dashboard. |
| D3 | Auth: `require_admin` (existing `halokyc_admin` cookie / JWT). Not exposed to client-self; the admin's view spans all tenants. | "Platform Admin" owns monitoring per `PRODUCT_PLAN.md`. |
| D4 | Window: all-time by default; optional `since=<iso8601>` query param for time-window scoping. `client_id=<uuid>` query param for per-client drill-down. | Matches "per client" plus the rollup. Keeping the API minimal. |
| D5 | Failure status is `CheckStatus.FAIL` only. `manual_review` and `pending` are reported separately so the admin can see *why* a check did not produce a definitive pass/fail. | Avoids conflating "model said no" with "human needed" — per ADR-014 the engine routes mid-confidence checks to manual_review, not fail. |
| D6 | Count a check per `verification_checks` row (one per `verification_id` × `check_type`). There is one row per check per session, so the count is the per-session outcome count. | Mirrors the worker pipeline (one row per check, written once). |
| D7 | No monitoring-driven retention change. Metrics aggregate live against `verification_checks`; webhook rotation remains separate, and ADR-030 retires the old fixed-window biometric purge in favor of explicit subject lifecycle actions. | Monitoring should not own data lifecycle policy. |

## Current DB-backed audit-log inventory

This section lists the `audit_logs.action` values the backend currently writes.
It is an inventory only; importance, retention, and pruning decisions are still
open. Console/runtime logger events are not included here unless they also write
to the `audit_logs` table.

### Verification lifecycle

| Action | Current trigger | Stored payload summary |
|---|---|---|
| `verification_created` | Developer API or workspace API creates a verification session. | Status, external user id, client metadata, workflow id, services, min age; workspace path also stores organization/workspace/api-key ids. |
| `status_changed` | Session moves between statuses, including upload-to-processing, processing completion, and failure fallback to manual review. | Previous status, new status, and reason; processing completion also stores risk score and triggered rules. |
| `verification_completed` | Worker finishes processing and settles a chargeable terminal/manual-review result. | Final status, risk score, decision reason, triggered rules. |
| `verification_failed` | Worker records a processing failure. | Serialized error type/message/context plus recorded timestamp. |
| `manual_decision` | `VerificationService.set_decision()` manually sets an outcome. | Previous status, new status, and optional reason. |

### Manual review decisions

| Action | Current trigger | Stored payload summary |
|---|---|---|
| `manual_approved` | Client/workspace/platform reviewer approves a `manual_review` session. | One transition row with previous/new status and reviewer subject; one admin-action row with reviewer subject. |
| `manual_rejected` | Client/workspace/platform reviewer rejects a `manual_review` session. | One transition row with previous/new status, reviewer subject, and reason; one admin-action row with reviewer subject and reason. |

### Workflow and workspace configuration

| Action | Current trigger | Stored payload summary |
|---|---|---|
| `workflow_created` | Client or workspace workflow is created. | Name, services, min age, actor subject when available. |
| `workflow_updated` | Workflow name, services, or min age changes. | Old and new workflow configuration, actor subject when available. |
| `workflow_deleted` | Workflow is deleted. | Deleted workflow configuration, actor subject when available. |
| `workspace_created` | Customer creates a workspace. | Organization id, workspace id, name, slug, actor user id. |
| `workspace_updated` | Workspace name or description changes. | Changed old/new fields plus actor user id. |

### API keys, webhooks, and integration events

| Action | Current trigger | Stored payload summary |
|---|---|---|
| `api_key_created` | Legacy client or workspace API key is issued. | API-key id, name, and for workspace keys organization/workspace/environment. Raw key is not stored. |
| `api_key_revoked` | Client revokes an active API key. | API-key id. |
| `webhook_endpoint_created` | Workspace webhook endpoint is created. | Webhook endpoint id and target URL. |
| `webhook_sent` | Verification result webhook delivery succeeds. | HTTP status and attempt count. |

### Organization, client, and member administration

| Action | Current trigger | Stored payload summary |
|---|---|---|
| `organization_created` | Customer signup creates an organization, owner, default workspace, and legacy client bridge. | Organization id, name, owner user id, legacy client id. |
| `organization_member_invited` | Customer owner/admin invites a member. | Actor user id, member id, user id, email, role, status. |
| `organization_member_updated` | Customer member full name, role, or status changes. | Actor user id, member id, changed old/new fields. |
| `client_created` | Platform/legacy client is created. | Client name. |
| `client_updated` | Platform updates client name or active flag. | Changed old/new fields. |
| `client_phase_changed` | Platform changes a client's lifecycle phase. | Old/new phase plus admin subject. |
| `platform_admin_organization_updated` | Platform updates organization name or status. | Old name/status and new name/status plus actor user id. |

### Platform admin and internal operations

| Action | Current trigger | Stored payload summary |
|---|---|---|
| `platform_admin_bootstrapped` | Seed/bootstrap ensures the first platform owner exists. | User id and platform-owner role. |
| `platform_admin_invited` | Platform owner invites another internal admin. | Actor user id, platform admin id, user id, email, role, status. |
| `platform_admin_updated` | Platform admin full name, role, or status changes. | Actor user id, platform admin id, changed old/new fields. |
| `platform_admin_credit_adjusted` | Platform admin adjusts an organization's credit wallet. | Actor user id, organization id, amount, bucket, description. |
| `platform_admin_sales_note_created` | Platform sales note is created for an organization. | Note text and actor user id. |
| `platform_admin_system_settings_updated` | Platform system settings are updated. | Old/new credit cost and JWT expiry settings. |

## Endpoint contract

### `GET /api/v1/admin/metrics/ai-failures`

Auth: `halokyc_admin` cookie (or `Authorization: Bearer <jwt>` with
`token_type: "admin"` per `API_CONTRACTS.md` § Auth Surfaces).
Returns `200 OK` with the body below. `401` for unauthenticated
callers, `403` for non-admin tokens (covered by `require_admin`).

**Query parameters** (all optional):

| Param | Type | Default | Meaning |
|-------|------|---------|---------|
| `client_id` | UUID | (absent → all clients) | Filter to one tenant. Unknown id → empty per-client entry. |
| `since` | ISO 8601 datetime | (absent → all-time) | Only include checks with `verification_checks.created_at >= since`. |

**Response shape**

```ts
type AiFailureMetrics = {
  window: {
    since: string | null;       // echo of the since param, or null
    generated_at: string;        // server-side timestamp (ISO 8601 UTC)
  };
  totals: {
    checks: number;              // total verification_checks rows in window
    by_type: {
      [K in "ocr" | "face_match" | "liveness" | "duplicate" | "age"]: {
        total: number;
        pass: number;
        fail: number;
        manual_review: number;
        pending: number;
        skipped: number;
        failure_rate: number;   // pass + fail + manual_review > 0 ? fail / (pass + fail + manual_review) : 0.0
      };
    };
  };
  clients: Array<{
    client_id: string;
    name: string;               // joined from clients.name for the admin UI
    is_active: boolean;
    by_type: AiFailureMetrics["totals"]["by_type"];
  }>;
};
```

Notes on the response:

- `failure_rate` is the canonical "model failed this check" rate.
  It excludes `pending` and `skipped` from the denominator because
  neither represents a real model decision — a session that never
  ran the check (skipped) or whose pipeline crashed (pending) is
  noise. `manual_review` is in the denominator because a mid-
  confidence check is a real model output (ADR-014) and tracking
  it alongside `fail` lets the admin distinguish "model is wrong"
  from "model is unsure." Formula: `fail / (pass + fail +
  manual_review)`, with `0.0` when the denominator is `0`.
- `pending` is exposed (not just `pass`/`fail`) so the admin can
  spot stuck pipelines. It is intentionally not folded into the
  failure rate.
- When `client_id` is supplied, `clients` contains exactly one
  client entry if the client exists, otherwise an empty array.
  The `totals` object always represents the selected filter scope.
- For the all-client response (no `client_id` filter), `clients`
  includes every **active** client (even if they have zero checks)
  plus any **inactive** client that has checks in the selected
  window. Hiding inactive clients while their checks still
  contribute to `totals` would make the numbers not reconcile.
  Per-client entries are sorted by `ocr.failure_rate` then
  `face_match.failure_rate` descending so the dashboard can show
  the worst offenders first.

## Why a single endpoint, not per-client

The frontend admin portal (`frontend/TODO.md` § 4) has a Client List
and Client Detail page, neither of which currently displays metrics.
The natural fit is a single Monitoring page (`/admin/metrics`) that
shows the totals row + a sortable per-client table. Per-client
detail can either re-call this endpoint with `?client_id=<id>` or
piggy-back on the existing Client Detail page. Keeping the contract
to one endpoint avoids N+1 calls and matches the "global view" in
`PRODUCT_PLAN.md`.

If the dashboard later wants a sparkline, a future revision can add
`/admin/metrics/ai-failures/timeseries` with a bucketed shape. That
is explicitly out of scope here.

## Example payload

```json
{
  "window": {
    "since": null,
    "generated_at": "2026-06-25T12:00:00Z"
  },
  "totals": {
    "checks": 1248,
    "by_type": {
      "ocr":         {"total": 312, "pass": 280, "fail": 12, "manual_review": 8,  "pending": 2, "skipped": 10, "failure_rate": 0.0400},
      "face_match":  {"total": 312, "pass": 295, "fail": 5,  "manual_review": 4,  "pending": 1, "skipped": 7,  "failure_rate": 0.0165},
      "liveness":    {"total": 312, "pass": 300, "fail": 3,  "manual_review": 5,  "pending": 0, "skipped": 4,  "failure_rate": 0.0097},
      "duplicate":   {"total": 312, "pass": 309, "fail": 1,  "manual_review": 0,  "pending": 0, "skipped": 2,  "failure_rate": 0.0032},
      "age":         {"total": 312, "pass": 290, "fail": 18, "manual_review": 0,  "pending": 0, "skipped": 4,  "failure_rate": 0.0584}
    }
  },
  "clients": [
    {
      "client_id": "…",
      "name": "Demo Co",
      "is_active": true,
      "by_type": { "…": { "…": "…" } }
    }
  ]
}
```

## SQL sketch (illustrative, not final)

```sql
-- totals rollup
SELECT
  vc.check_type,
  vc.status,
  COUNT(*) AS n
FROM verification_checks AS vc
JOIN verification_sessions AS vs ON vs.id = vc.verification_id
WHERE ($since IS NULL OR vc.created_at >= $since)
  AND ($client_id IS NULL OR vs.client_id = $client_id)
GROUP BY vc.check_type, vc.status;
```

The application then pivots this result into the nested shape in
Python (one query, ~5 rows × 5 statuses per client). The
`verification_checks_check_type` index covers `check_type` and
`ix_verification_sessions_client_id` covers `client_id` filtering.
At MVP scale (<100k checks) this is fast enough; a deferred
materialised view or a Prometheus exporter is the post-MVP path.

## Files this will touch (when approved)

- `backend/app/schemas/admin.py` — add `AiFailureMetrics`,
  `AiFailureByType`, `AiFailureClientMetrics`, `AiFailureWindow`.
- `backend/app/services/admin_service.py` — add
  `ai_failure_metrics(*, client_id=None, since=None)`.
- `backend/app/api/v1/routes/admin.py` — add
  `GET /admin/metrics/ai-failures`.
- `backend/app/tests/test_admin_service.py` — add at least:
  - happy path (mixed statuses across two clients + one with no checks);
  - per-client filter returns empty clients list;
  - `since` filter excludes older rows;
  - auth: 401 without admin token.
- `.agents/context/API_CONTRACTS.md` — add the new endpoint under
  the existing admin section.
- `.agents/context/backend/CHANGELOG.md` — `[Unreleased]` entry.
- `.agents/context/backend/TODO.md` — mark 3.2 Monitoring `[x]`.

## Out of scope (deferred)

- Time-series / bucketed data for sparklines (post-MVP).
- Liveness, duplicate, and age failure rates in the **UI** — the
  endpoint exposes them, the dashboard is the frontend's call.
- Per-workflow breakdown (the TODO only asked per-client).
- Webhook delivery failure rate (different metric surface;
  `webhook_deliveries` table is already queryable; deferred).
- System latency (p50/p95 worker turnaround) — different store;
  deferred.

## Open questions for the user

**All resolved (2026-06-25).**

1. **Endpoint path**: `GET /api/v1/admin/metrics/ai-failures` — keeps
   room for sibling routes (`…/system-latency`, `…/webhooks`,
   `…/ai-failures/timeseries`) without renaming.
2. **`pending` in response**: yes — exposed as a separate count.
   Not included in `failure_rate`.
3. **Surface on `ClientDetail`**: deferred. The Monitoring page
   already supports drill-down via `?client_id=<uuid>`.
