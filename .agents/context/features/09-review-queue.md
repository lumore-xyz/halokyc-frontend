# Client Review Queue

**Status:** ✅ Implemented

Dedicated interface for client operators to manually approve, reject, or escalate verification sessions that the automated pipeline could not resolve.

## What it does
- List view of sessions in `manual_review` status, scoped to the current workspace
- Assigned reviews vs. completed reviews tabs
- Evidence viewer: selfie, ID document, and all check result payloads
- Agent recommendation panel: shows `recommended_status`, confidence, reason codes, and human-readable summary when agentic adjudication is enabled
- Deterministic check results displayed beside the agent recommendation for comparison
- Approve / Reject buttons; final decision is human-owned for `manual_review` sessions — the UI never implies the model is the final authority
- Reviewer feedback: "agree with recommendation" / "override recommendation" persisted backend-side

## Key endpoints
- `GET /api/v1/workspaces/{workspace_id}/reviews` — list pending
- `GET /api/v1/workspaces/{workspace_id}/reviews/{verification_id}` — detail
- `POST /api/v1/workspaces/{workspace_id}/reviews/{verification_id}/decide` — approve / reject

## Frontend pages
- `/dashboard/reviews` — review queue (list)
- `/dashboard/reviews/[verificationId]` — review detail with evidence + agent panel
- `/dashboard/reviews/assigned` — reviewer's own queue
- `/dashboard/reviews/completed` — history

## Implementation notes
- Reviewer queue view consolidated into a single component (`reviews/_components/reviewer-queue-view.tsx`) with `completedOnly?: boolean` prop
- Reviewer must have `client_reviewer` or higher role
- Fallback states for: provider unavailable, budget exceeded, timeout, invalid model output, deterministic-only decision
- Model/provider metadata shown only to owner/admin/platform roles; hidden from developers and end users
- All review decisions appended to the immutable audit log

## Related
- [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §2.5, §3 (Client persona)
- [`API_CONTRACTS.md`](API_CONTRACTS.md) §Reviews
- [`frontend/DECISIONS.md`](frontend/DECISIONS.md) ADR-F013 (review queue UX)
- [`TODO.md`](TODO.md) §9.2 (review queue surface)
