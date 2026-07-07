## Unreleased

**Context:** [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) (phases) · [`TODO.md`](TODO.md) (task status) · [`API_CONTRACTS.md`](API_CONTRACTS.md) (changed endpoints)
### Authentication / Identity Federation
- [x] Added "Sign in with Google" for client users:
  - New `POST /api/v1/auth/google` route that exchanges a Google
    authorization code for a `UnifiedLoginResponse`.
  - New `users.google_id` column (nullable, unique) stores Google's stable
    account identifier so repeated Google logins reuse the existing `User` row.
  - Backend links Google-only sign-ins to existing email/password
    `User` rows when the email case-insensitively matches and `google_id`
    is still null. New Google-only users get a `User` row with
    `email_verified_at = now()` and no Organization; the frontend walks
    them through org creation or invitation.
  - Platform admins are **not** offered Google login; they keep
    username/password to preserve env bootstrap for the first owner.
  - Config flags `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`,
    `GOOGLE_OAUTH_REDIRECT_URI`. Route returns `503` when unconfigured.
  - Fixed Google-only setup completion so it validates the short-lived
    unified token, provisions the organization/default workspace for the
    existing Google-linked `User`, and returns a fresh `UnifiedLoginResponse`
    for the shared account-selection flow.

### Security
- [x] Hardened webhook callback dispatch against SSRF by resolving callback
  hostnames before sending, rejecting local/metadata/private/special-use
  network targets, and disabling automatic redirects on the HTTP transport.

### Billing / Dodo Payments
- [x] Dodo Payments integration: added backend-owned Dodo checkout session
  creation for monthly subscriptions and one-time credit packs, SDK-verified
  Dodo webhook ingestion, local checkout/subscription/webhook audit tables,
  admin-managed billing catalog rows for Dodo product IDs/prices/credits,
  and customer billing BFF routes/UI that never expose payment API keys to the
  frontend. Credit grants continue through the existing HaloKYC ledger.

### Compliance surface (per `.agents/context/COMPLIANCE.md` §4)
- [x] Retention hardening: made `purge_expired_evidence(dry_run=True)`
  non-destructive for storage and database evidence rows, fixed
  `embedding_retention_days=0` so it means immediate eligibility instead
  of falling back to the long default, counted deleted evidence by actual
  `VerificationFile` rows, and made the `purge-biometrics` compatibility
  CLI commit real runs while rolling back dry-runs and failures.
- [x] Data Export Engine: `ComplianceEngine.build_export_archive` builds a
  subject-scoped ZIP archive under `storage_root/exports/<request_id>.zip`
  with a `summary.json` manifest. Export approval triggers archive
  generation synchronously inside the DSR decision transaction so
  `rollback` also removes a partial archive.
- [x] Erasure dispatch: `ComplianceEngine.process_approved_request` treats
  `PrivacyRequestKind.ERASURE` by deleting `VerificationSession`,
  `VerificationFile`, `FaceEmbedding`, and `WebhookDelivery` rows scoped
  to the subject within the `(organization, workspace)` range, then
  flushes before commit so the audit trail and `processed_at` flag stay
  consistent with the caller's transaction.
- [x] Retention Engine: replaced the `purge_biometrics` no-op with a
  policy-aware `ComplianceEngine.purge_expired_evidence` that reads the
  effective `RetentionPolicy` (configured via the existing `/admin/retention`
  surfaces), deletes expired `VerificationFile` rows and their on-disk
  files, purges orphaned `FaceEmbedding` rows not held for active bans,
  and reuses the existing webhook retention primitive. Policy changes
  take effect on the next run only and do not retroactively purge already
  committed evidence.
- [x] DSR decision side-effects: `POST /api/v1/admin/dsr/{request_id}/decision`
  now calls `ComplianceEngine.process_approved_request` for every `approve`
  decision and persists `PrivacyRequest.processed_at` plus an audit-log
  entry for `privacy_request_processed`. Rejections skip destructive
  work but still receive a status-change audit entry.
- [x] Subject PIN gate: added optional `subject_pin_hash` column on
  `verification_sessions` (nullable so existing rows are unaffected).
  PIN is bcrypt-hashed on the session row itself — no new subject_token
  table required. `POST /api/v1/privacy/access-token` validates the
  6-digit PIN against the scoped session and mints a short-lived
  scoped JWT cookie (`halokyc_privacy`, `scope=subject_privacy`)
  that the existing privacy-dashboard BFF routes consume.
- [x] Privacy dashboard backend contract:
  `POST /api/v1/verifications/{id}/consent`
  `GET/POST /api/v1/privacy/summary`
  `GET/POST /api/v1/privacy/requests`
  `POST /api/v1/privacy/access-token`
  `GET /api/v1/admin/dsr` + `POST /api/v1/admin/dsr/{id}/decision`
  `GET /api/v1/admin/retention` + `PUT /api/v1/admin/retention`
  `GET /api/v1/admin/retention/effective`.

- [x] Production hardening filters: customer `GET /me/verifications` and
  workspace `GET /workspaces/{workspace_id}/verifications` now accept
  `agentic_mode` and `agentic_recommendation` filters, matching platform
  verification filtering.
- [x] Fixed workflow schema drift by adding the missing
  `timeout_recovery_enabled` Alembic migration and hardening agentic evidence
  serialization when in-memory workflows have not populated SQLAlchemy
  defaults yet.
- [x] Confidence-based auto-decide expansion: added workflow-level
  `auto_decide_confidence_threshold`, API/schema support, gray-zone
  auto-decision logic, and `auto_decide_confidence_override` audit logging.
- [x] Document Quality Check: added `document_quality` as a verification check
  type, a fail-open `DocumentQualityService` with heuristic and multimodal
  provider paths, upload-time document retake responses before credit
  reservation, worker backfill, and bounded agentic `retake_document` action
  support.
- [x] Platform AI provider deletion: exposed platform-owner DELETE routes for
  AI providers and provider API keys, reusing the audited provider service.
- [x] Platform AI provider key smoke tests: added a platform-owner endpoint
  that sends a tiny provider prompt with one encrypted key and records safe
  success/error metadata.
- [x] Credit backlog / deferred processing: added `awaiting_credits`,
  accepted uploads without available credits, deferred worker enqueue until
  credits are reserved, drained queued sessions FIFO when credits arrive, and
  documented ADR-033.
- [x] Timeout Recovery implementation: detection of timed-out AI services, `timeout_recovery` flag, workflow `timeout_recovery_enabled` feature flag, policy gate handling, `agentic_timeout_recovery` audit action, and admin metrics `timeout_recovery_success_rate` / `timeout_recovery_manual_rate`
- [x] Deterministic Duplicate Policy implementation: pre-agent duplicate decision rules, audit actions (`duplicate_same_external_user_resolved`, `duplicate_ban_match_auto_rejected`, `duplicate_manual_review_triggered`), and updated duplicate check result schema
- [x] Added `GET /api/v1/admin/metrics/automation` to aggregate manual-review rate, timeout recovery success, duplicate policy coverage, top manual-review factors, and daily automation series from structured audit analytics events.
- [x] Storage transport (BunnyCDN forward proxy): replaced the
  filesystem-only `StorageService` default with a `bunnycdn` provider
  path that reuses the same signature; a thin HTTP forward-proxy handler
  at the FastAPI layer translates `/api/v1/verifications/{id}/files/*`
  requests through a signed BunnyCDN origin URL so uploaded evidence
  lives off the application node without a separate edge-gateway deployment.
- [x] Bundle lifecycle choreography: unified `retake_document` +
  `requires_user_action` handling under a `BundleOps` stage that commits
  partial bundles atomically, preserves original file captions, and
  emits a single `bundle_updated` audit log per mutation.
- [x] Entity-resolution cleanup: tightened `VerificationService` scope
  filters so cross-tenant fallback lookups are rejected before the DB
  sees them, and added an explicit "primary not found" error branch that
  surfaces `client_id` / `workspace_id` mismatch to the caller.
- [x] Auto-resolve tier: added `auto_resolve` as a first-class
  `VerificationStatus` terminal state with its own worker branch and
  audit action (`auto_resolved`), bypassing both the manual-review
  queue and the agentic adjudication pipeline. Toggled via the existing
  `agentic_mode` field with a new `auto_resolve` enum member, gated by
  the `timeout_recovery_enabled` workflow flag.
- [x] `GET /api/v1/admin/metrics/ai-failures` endpoint for AI failure rate tracking
- [ ] ADR-009
- [ ] ADR-003
- [ ] ADR-004
- [ ] ADR-005
- [ ] ADR-006
- [ ] ADR-007
- [ ] ADR-008
- [ ] ADR-009
- [ ] ADR-010
- [ ] ADR-011
- [ ] ADR-012
- [ ] ADR-013
- [ ] ADR-014
- [ ] ADR-015
- [ ] ADR-016
- [ ] ADR-017
- [ ] ADR-018
- [ ] ADR-019
- [ ] ADR-020
- [ ] ADR-021
- [ ] ADR-022
- [ ] ADR-023
- [ ] ADR-024
- [ ] ADR-025
- [ ] ADR-026
- [ ] ADR-027
- [ ] ADR-028
- [ ] ADR-029
- [ ] ADR-030
- [ ] ADR-031
- [ ] ADR-032
