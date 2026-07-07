# Subject Lifecycle & Bans

**Status:** ✅ Implemented (2026-07-03)

Clients control the verification lifecycle for each subject (end-user) in their workspace: reset, full deletion, soft ban, permanent ban, and ban lift.

## What it does
- **Verification reset**: clears all data for a subject (sessions, files, checks, webhook deliveries, face embeddings)
- **Full deletion**: GDPR-style erasure — all subject data removed; idempotent
- **Soft ban**: subject blocked for a configurable duration; retains a minimized `ban_match` embedding
- **Permanent ban**: indefinite block; minimized embedding retained for duplicate detection
- **Ban lift**: removes/disables retained ban-match embeddings unless another active ban needs them
- All lifecycle actions are audited and tenant-scoped

## Key endpoints
- `POST /api/v1/subjects/{external_user_id}/reset-verification`
- `DELETE /api/v1/subjects/{external_user_id}`
- `GET/PUT/PATCH /api/v1/subjects/{external_user_id}/ban`
- Workspace-scoped equivalents under `/api/v1/workspaces/{workspace_id}/subjects/{external_user_id}/...`

## Frontend pages
- `/dashboard/[workspaceId]/subjects/[externalUserId]` — subject detail with ban status, recent sessions, lifecycle audit events, and safe lifecycle action results

## Implementation notes
- `subject_bans` table scoped by `organization_id`, `workspace_id`, and `external_user_id`
- `subject_ban_kind` enum: `soft_ban`, `permanent_ban`
- `face_embeddings.verification_id` changed from `ON DELETE CASCADE` to nullable `ON DELETE SET NULL` so active ban markers outlive deleted sessions
- Active ban matches are terminal rejection signals in both deterministic duplicate policy and agentic adjudication
- Developers excluded from mutation controls; route hidden from developer navigation
- Destructive confirmations explain the effect (e.g., "future duplicate matching for this subject is removed")

## Related
- [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §2.6, §7 (agentic overrides), §9 (security & retention)
- [`API_CONTRACTS.md`](API_CONTRACTS.md) §Subjects
- [`backend/DATABASE_SCHEMA.md`](backend/DATABASE_SCHEMA.md) `subject_bans`, updated `face_embeddings`
- [`backend/DECISIONS.md`](backend/DECISIONS.md) ADR-019 (ban retention), ADR-020 (subject lifecycle)
- [`TODO.md`](TODO.md) §11 (full lifecycle + bans tasks)
