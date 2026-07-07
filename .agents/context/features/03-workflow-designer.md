# Workflow Designer

**Status:** ✅ Implemented

Clients define verification workflows — named sequences of AI services plus a minimum age rule — and the system executes exactly that journey for each end-user.

## What it does
- Create / edit / delete workflows under a workspace
- Toggle deterministic services per workflow: `selfie`, `liveness`, `document`, `age`
- Set `min_age` (terminal rule: under-age is auto-rejected with score=100)
- Configure agentic adjudication mode per workflow: `disabled`, `shadow`, `assist_review`, `auto_decide`
- Agentic validation: workflows cannot enable agentic review without at least one deterministic evidence service selected
- Show effective agentic mode on the workflow card

## Key endpoints
- `GET/POST /api/v1/workspaces/{workspace_id}/workflows`
- `GET/PATCH/DELETE /api/v1/workspaces/{workspace_id}/workflows/{workflow_id}`
- `GET /api/v1/workflows/{workflow_id}/verify-plan` (deferred; `/verifications/{id}/config` covers the release flow)

## Frontend pages
- `/dashboard/workflows` — workflow list + create
- `/dashboard/workflows/[id]` — workflow detail + edit

## Implementation notes
- Workflow-scoped services determine which AI tools the worker runs
- `auto_decide_confidence_threshold` is a nullable per-workflow field (default null = disabled); when set, the agent may auto-decide gray-zone sessions above the threshold
- `timeout_recovery_enabled` is a per-workflow feature flag (default off)

## Related
- [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §2.1, §5 (Decision Rules), §7 (Agentic Policy)
- [`API_CONTRACTS.md`](API_CONTRACTS.md) §Workflows
- [`backend/DATABASE_SCHEMA.md`](backend/DATABASE_SCHEMA.md) `workflows`
- [`TODO.md`](TODO.md) §9 (agentic workflow controls)
