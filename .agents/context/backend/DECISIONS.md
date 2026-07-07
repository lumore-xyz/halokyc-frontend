# DECISIONS.md

# Architecture Decision Records

**Navigate:** [`TODO.md`](TODO.md) for implementation status of each ADR · [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) for schema changes · [`API_CONTRACTS.md`](API_CONTRACTS.md) for contract changes · [`ARCHITECTURE.md`](ARCHITECTURE.md) for system layout · [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) for business context

This document tracks the "why" behind the HaloKYC backend architecture. Decisions are grouped by functional area but maintained as individual ADRs for auditability.

---

## Core Infrastructure
*The fundamental stack chosen for stability, speed, and low operational overhead.*

### ADR-001: Use FastAPI
**Status**: Accepted
**Reason**: Fast development speed, async support, OpenAPI generation, strong ecosystem.
**Date**: 2026-06-21

---

### ADR-002: Use PostgreSQL
**Status**: Accepted
**Reason**: Reliable, mature, supports JSONB and pgvector.
**Date**: 2026-06-21

---

### ADR-003: Use pgvector Instead of Qdrant
**Status**: Accepted
**Reason**: Lower infrastructure cost, single database, easier MVP deployment.
**Fallback**: Qdrant allowed if vector performance becomes a bottleneck.
**Date**: 2026-06-21

---

### ADR-004: Use Celery For Background Processing
**Status**: Accepted
**Reason**: Well known ecosystem, reliable queue processing, works with Redis.
**Date**: 2026-06-21

---

### ADR-005: Use Local Storage For MVP
**Status**: Accepted
**Reason**: Simplifies development, reduces infrastructure cost.
**Future**: `StorageService` abstraction allows migration to S3.
**Date**: 2026-06-21

---

## Verification Engine
*The AI pipeline and risk scoring logic for identity verification.*

### ADR-006: Use PaddleOCR
**Status**: Accepted
**Reason**: Strong open-source OCR support, works offline.
**Fallback**: EasyOCR
**Implementation Rules**:
- PaddleOCR is isolated behind an OCR provider interface and loaded lazily in worker processes.
- Raw OCR text and full document numbers remain in memory only.
- Document numbers are normalized and fingerprinted with a domain-separated HMAC-SHA256 digest before persistence.
**Date**: 2026-06-21

---

### ADR-007: Use InsightFace For Face Matching
**Status**: Accepted
**Reason**: Open source, strong embedding quality, easy integration.
**Implementation Rules**:
- InsightFace is isolated behind a face-provider interface and loaded lazily in worker processes.
- CPU inference uses ONNX Runtime by default.
- Face matching requires exactly one face in the selfie and ID-front image and compares normalized ArcFace embeddings with cosine similarity.
- Embeddings are not persisted during Phase 7; Phase 9 owns tenant-scoped biometric storage and duplicate search.
- InsightFace library code is MIT licensed, but its provided pretrained model packs are non-commercial research only. Production must mount a separately licensed/custom ONNX model pack and configure `FACE_MODEL_NAME` and `FACE_MODEL_ROOT` accordingly.
**Date**: 2026-06-21

---

### ADR-012: Use A Passive, Heuristic Liveness Provider Behind A Provider Protocol
**Status**: Accepted
**Reason**: The MVP calls for "basic passive liveness" only; video/active liveness is explicitly out of scope. A model-independent provider interface lets the worker pipeline run deterministic passive checks today and swap in a production-grade open-source anti-spoof model later without touching the check result contract.
**Rules**:
- The liveness service exposes a provider protocol returning a `LivenessResult` with status and score.
- The MVP ships a heuristic `HeuristicLivenessProvider` that combines image statistics from the stored selfie (size, brightness variance, uniqueness, and aspect ratio).
- A `SilentFaceAntiSpoofProvider` is scaffolded but gated behind `LIVENESS_PROVIDER=silentface`.
- Liveness uses the same `pass` / `manual_review` / `fail` status policy as face matching.
- Active/video liveness remains a post-MVP feature.
**Date**: 2026-06-22

---

### ADR-013: Use Tenant-Scoped pgvector Cosine Search For Duplicate Detection
**Status**: Accepted
**Reason**: Implements duplicate-account detection. Storing embeddings alongside relational tables and filtering by `client_id` keeps infrastructure to a single database while satisfying tenant-isolation.
**Rules**:
- The duplicate service always filters by `client_id` and never returns matches from another tenant.
- Cosine distance is computed via pgvector's `<=>` operator with `ivfflat` index.
- Missing selfie embeddings degrade the check to `manual_review`.
- Embeddings are biometric data and are never exposed on the API or audit trail.
**Date**: 2026-06-22

---

### ADR-014: Use A Pure-Function Rule Engine For Phase 10 Risk Scoring
**Status**: Accepted
**Reason**: Decision rules are small and deterministic. A pure-function engine keeps the test surface free of DB/AI dependencies and aligns with "no complex workflow engines" (ADR-010).
**Rules**:
- Applies the rule table (weights for OCR fail, face mismatch, liveness fail, etc.).
- Age is a terminal rule: if below `ADULT_AGE_THRESHOLD`, decision is `REJECTED`.
- Missing DOB routes to `manual_review`.
- Decision boundaries driven by `RISK_APPROVED_BELOW` and `RISK_MANUAL_REVIEW_BELOW`.
**Date**: 2026-06-22

---

### ADR-023: Use normalized document JSON as the OCR boundary
**Status**: Accepted
**Reason**: Identity documents vary by country. A normalized document payload gives the worker one canonical source of extracted fields while preserving the rule that raw OCR text is never persisted.
**Rules**:
- `OCRService.analyze()` keeps raw provider lines in memory only.
- The canonical payload `result.document` includes normalized fields (name, dob, etc.) with confidence and source.
- `document_number.value` is the HMAC-SHA256 fingerprint.
**Date**: 2026-06-26

---

## Security & Identity
*Authentication, Authorization, and Data Protection.*

### ADR-008: Store API Keys Hashed
**Status**: Accepted
**Reason**: Security best practice.
**Rule**: Raw API keys must never be stored.
**Date**: 2026-06-21

---

### ADR-011: Use Environment-Configured Admin Bootstrap Authentication
**Status**: Accepted
**Reason**: Secure provisioning without a complex admin DB model for MVP.
**Rules**:
- Admin login issues a signed JWT with an explicit admin token-type claim.
- Client API keys are returned once and stored only as SHA-256 hashes.
**Date**: 2026-06-21

---

### ADR-020: `require_client_user` returns `(client_id, client_user_id)` as a tuple
**Status**: Accepted
**Reason**: Fixed a `TypeError` where routes expected both IDs for tenant checks and audit logging, but the dependency only returned one.
**Rules**:
- `app/api/dependencies.py::require_client_user` returns `tuple[uuid.UUID, uuid.UUID]`.
- New client-self endpoints MUST consume the tuple form and have HTTP tests.
**Date**: 2026-06-25

---

### ADR-025: Adopt organization-first workspace scoping with fixed RBAC
**Status**: Accepted
**Reason**: Allows one company to operate multiple apps/business units. Separates workspace-scoped data (workflows, API keys) from organization-level billing and credits.
**Rules**:
- `Organization` owns billing, credits, and members.
- `Workspace` owns workflows, API keys, sessions, and reviews.
- Customer roles: `client_owner`, `client_admin`, `client_reviewer`, `client_developer`.
- Platform roles: `platform_owner`, `platform_business_admin`, `platform_support`, `platform_sales`.
**Date**: 2026-06-27

---

### ADR-026: Unified authentication and account selection flow
**Status**: Accepted
**Reason**: A single identity can access multiple consoles. Users authenticate once, then select the specific account/context.
**Rules**:
- Login returns a short-lived temporary token and available accounts.
- Selection endpoints validate the token and issue the final scoped JWT.
- Final JWTs are set as httpOnly cookies via the BFF.
**Date**: 2026-06-28

---

## Administration & Platform Ops
*Internal tools, architectural constraints, and system monitoring.*

### ADR-009: Keep Routes Thin
**Status**: Accepted
**Reason**: Maintainability.
**Rule**: Business logic belongs in services. Routes only validate, authenticate, call services, and return responses.
**Date**: 2026-06-21

---

### ADR-010: Production Minded MVP
**Status**: Accepted
**Reason**: Goal is working SaaS MVP, not enterprise platform.
**Rules**: Avoid event sourcing, microservices, CQRS, and Kubernetes dependencies. Prefer simple architecture and clean interfaces.
**Date**: 2026-06-21

---

### ADR-016: Use A Thin Admin Override Layer Above The Risk Engine
**Status**: Accepted
**Reason**: MVP needs a one-shot override for sessions the risk engine routes to `manual_review`. Admin decisions are authoritative.
**Rules**:
- Admin endpoints require `require_admin` bearer token.
- `AdminService` transitions sessions via the canonical state machine.
- Decisions dispatch the client webhook with the final outcome.
**Date**: 2026-06-22

---

### ADR-017: Keep `ClientService` separate from `AdminService`
**Status**: Accepted
**Reason**: Prevents `AdminService` from becoming a "god service" by splitting client-management logic into its own service.
**Rules**:
- `app/services/client_service.py` owns client list, detail, update, and phase management.
- `app/services/admin_service.py` continues to own the verification review queue.
**Date**: 2026-06-23

---

### ADR-021: Compute AI failure metrics with a single grouped SQL query, no new schema
**Status**: Accepted
**Reason**: Avoids introducing a time-series DB. One grouped query over `verification_checks` is sufficient for MVP scale.
**Rules**:
- `AdminService.ai_failure_metrics` is the only owner of aggregation logic.
- Failure rate = `fail / (pass + fail + manual_review)`.
- Endpoint: `GET /api/v1/admin/metrics/ai-failures`.
**Date**: 2026-06-25

---

## Product & Billing
*Client-facing features, workflow management, and monetization.*

### ADR-015: Use A Synchronous Inline Webhook Dispatcher With A Single Retry
**Status**: Accepted
**Reason**: Matches MVP scope for "no complex workflow engines". Simple one-delivery + one-retry approach.
**Rules**:
- Signing uses `WEBHOOK_SECRET` (HMAC-SHA256).
- Retry policy: Up to `WEBHOOK_MAX_ATTEMPTS` (default 2).
- Delivery is performed inline; failure does not mark a verification as failed.
**Date**: 2026-06-22

---

### ADR-018: Make `Workflow` the source of truth for the verification pipeline
**Status**: Accepted
**Reason**: Enables each session to have a `workflow_id` that drives which AI checks run and the `min_age` terminal rule.
**Rules**:
- `Workflow` model owns `services` (JSONB) and `min_age`.
- `VerificationStartRequest` now requires `workflow_id`.
- Worker reads `Workflow.min_age` for the adult age threshold.
**Date**: 2026-06-25

---

### ADR-019: Run data retention as application-side CLI jobs, not DB TTLs
**Status**: Accepted
**Reason**: Treats retention as an application concern. CLI commands allow wiring into any scheduler (cron, k8s) without forcing a framework.
**Rules**:
- `scripts/retention.py` exports `purge_biometrics` and `purge_webhook_logs`.
- `purge_biometrics` deletes files and `face_embeddings` for terminal sessions older than the window.
- Audit logs are retained permanently.
**Date**: 2026-06-25

---

### ADR-022: Persist verification start metadata as session-scoped JSONB
**Status**: Accepted
**Reason**: Allows clients to attach business context (display name, region, etc.) to a session without altering the API contract.
**Rules**:
- `VerificationStartRequest.metadata` is optional JSON.
- Stored in `verification_sessions.metadata` as JSONB.
- No biometrics or raw API keys in metadata.
**Date**: 2026-06-25

---

### ADR-024: Use bucketed credit accounts plus an append-only ledger
**Status**: Accepted
**Reason**: Needs usage-based accounting with separate free, subscription, and purchased buckets, while preserving an auditable history.
**Rules**:
- `CreditService` owns all bucket math.
- Free credits topped up monthly to 1000; do not stack.
- Subscription credits roll over up to `10 * monthly_plan_credits`.
- Reservations consume credits in order: free -> subscription -> purchased.
**Date**: 2026-06-26

---

### ADR-025: Add organization listing endpoints for the customer console
**Status**: Accepted
**Reason**: The customer frontend needs to render an organization profile card and a team table. Until now the only read endpoint was the admin-only `GET /api/v1/organizations`. Adding a `client_member`-scoped read path keeps the customer UI off admin endpoints and avoids round-tripping the admin BFF for member-only screens.
**Rules**:
- `GET /api/v1/organizations/{organization_id}` returns the caller's own organization. Cross-org lookups are 403.
- `GET /api/v1/organizations/{organization_id}/members` returns members ordered by creation time. All active members may call it; owner/admin can subsequently mutate via existing POST/PATCH routes.
- Reuse the `_serialize_member` helper so invite, update, and list responses stay aligned.
**Date**: 2026-06-28

---

### ADR-027: Mandate per-test cleanup of live-DB rows
**Status**: Accepted
**Reason**: pytest runs against a shared development Postgres were leaving "D2 %", "WFS %", "Admin %", "Select Client Org %", "D2 Tenant %", and "user_admin_%"/"user_metrics_%" rows behind. Those rows surfaced in the platform admin's `/admin/organizations`, the `/admin/verifications` list, and the customer billing ledger, polluting dev data and making manual UI walkthroughs unreliable.
**Rules**:
- Every test that commits to the real database uses the ``live_db`` fixture in ``backend/app/tests/conftest.py``.
- New tests register every created row via ``live_db.tag("entity_tag", value=id)``. Tags resolve to a (table, id_column) pair in ``TAG_TABLE_HINTS``. Legacy ``ClientUser`` rows keyed by email use ``live_db.tag_email(email)``.
- An autouse backstop (``_purge_legacy_name_tags``) runs after every test and wipes rows whose client name matches the legacy prefix convention, plus ``user_admin_%`` and ``user_metrics_%`` verification sessions, plus ``_purge_tagged_emails`` for tagged emails.
- A second autouse fixture forces ``APP_ENV=test`` for the entire pytest process so a stray `pytest` invocation against the development database is impossible.
- One-shot recovery: ``uv run purge-test-data`` (a.k.a. ``scripts/cleanup_test_data.py``) wipes the legacy prefixes across all tables.
**Date**: 2026-06-29

---

### ADR-028: Auto-release stale credit reservations
**Status**: Accepted
**Reason**: A broker outage, worker restart, or missed enqueue can leave a verification in `processing` after credits have been reserved. Holding those credits forever creates customer distrust and makes billing hard to reconcile.
**Rules**:
- Reservations are active only while the session is genuinely in flight.
- Open reservations older than `CREDIT_RESERVATION_TIMEOUT_MINUTES` (default 60) are released back to their original buckets.
- If the stale session is still `processing`, it moves to `manual_review` with a timeout reason so operators can inspect it without charging the customer.
- Credit ledger responses include `reserved_sessions` so Billing can show which session IDs are currently holding credits.
**Date**: 2026-06-30

---

### ADR-029: Add a LangGraph agentic adjudication layer after deterministic verification tools
**Status**: Planned
**Reason**: OCR, face matching, liveness, duplicate detection, and age checks are valuable deterministic evidence producers, but they can produce conflicting, incomplete, or borderline signals. A bounded agentic layer can improve precision and reduce unnecessary manual review by reasoning over the normalized outputs without replacing the underlying tools.
**Rules**:
- Existing OCR, face detection/match, liveness, duplicate, age, and quality services remain the first-pass pipeline and continue to write auditable `verification_checks`.
- LangGraph is the preferred orchestration layer because verification adjudication needs explicit branching, deterministic policy gates, fallback paths, and future human-in-the-loop resume points.
- The agent graph runs inside the existing worker process/service boundary. Do not add a new microservice unless production load proves the worker boundary is insufficient.
- The preferred initial model provider is a Google API-hosted Gemma-family model, configured as Gemma 4 where available, behind a provider interface with local/open-model and disabled fallbacks.
- LLM calls are conditional: skip them for clean deterministic approvals, terminal deterministic rejects, disabled workflows, model-budget exhaustion, or provider outage.
- Terminal policy rules override the model. The model cannot approve under-age sessions, confirmed face mismatches, confirmed liveness failures, or confirmed tenant-scoped duplicates.
- Model output must be validated against a strict schema and invalid output falls back to the deterministic risk decision.
- External model prompts must use minimized structured evidence by default. Do not send raw OCR text, full document numbers, API keys, secrets, or raw biometric captures unless a future explicit workflow policy enables redacted visual review with audit logging.
- If LangGraph interrupts are introduced for reviewer approval/resume, production must use PostgreSQL checkpointing and a stable verification-scoped `thread_id`.
**Date**: 2026-07-01

---

### ADR-030: Replace automatic biometric purge with explicit subject lifecycle controls
**Status**: Accepted
**Reason**: Customers need two different lifecycle operations that the old 30-day biometric purge cannot express. A legitimate user reset/full deletion should remove all matchability so the person can re-verify cleanly or exercise account-deletion rights. A fraud ban should remove sensitive session artifacts while preserving a minimized tenant-scoped face embedding marker so the same person can be matched on future attempts even when they change email, phone, or external identifiers.
**Rules**:
- Do not automatically delete verification session data merely because a terminal session is older than 30 days.
- Remove or retire the biometric purge behavior that deletes terminal-session files and embeddings on a fixed 30-day window. Webhook-log retention may remain as a separate operational cleanup.
- Add explicit subject lifecycle operations for reset verification, full subject deletion, create/update soft ban, create/update permanent ban, and lift ban.
- Reset/full deletion removes verification sessions, files, checks, webhook deliveries, and face embeddings for the `(workspace_id, external_user_id)` subject, while leaving audit-log tombstones.
- Ban creation/update deletes session artifacts and PII-like verification data but retains minimized face embeddings with a `ban_match` purpose while the ban is active.
- Ban matching remains tenant/workspace-scoped and never exposes raw vectors through APIs, webhooks, audit logs, or dashboard UI.
- Active ban matches are terminal rejection signals by default; the response should use safe reason codes rather than revealing biometric details.
- Every subject lifecycle mutation must be audit logged with actor type, workspace, external user id, action, and safe counts of deleted/retained records.
**Date**: 2026-07-02

---

### ADR-031: Gate auto-decide with durable checkpoints and replay thresholds
**Status**: Accepted
**Reason**: Agentic `auto_decide` can change customer-visible verification outcomes, so enabling it must require resumable execution, auditable human review, and measured replay performance instead of a single feature flag flip.
**Rules**:
- Production human-in-the-loop agentic graphs use LangGraph PostgreSQL checkpointing with the stable verification-scoped `thread_id`.
- Deployment setup runs `uv run setup-agentic-checkpointer` before `AGENTIC_CHECKPOINT_BACKEND=postgres` is enabled.
- Worker shadow/assist execution remains non-blocking; `interrupt()` / `Command(resume=...)` is exposed through explicit service methods for review workflows.
- `agentic-replay` is the baseline command for production-like data and must report approval precision, rejection precision, manual-review deflection, false approve/reject rates, provider failure rate, latency, and spend.
- A workspace may move to `auto_decide` only after replay satisfies the configured minimum sessions, precision thresholds, maximum false decision rates, maximum provider failure rate, and minimum manual-review deflection rate.
**Date**: 2026-07-02

---

### ADR-032: Replace single env-based model provider with DB-backed multi-provider routing
**Status**: Accepted
**Reason**: A single env API key cannot support multiple providers, multiple keys per provider, quota-aware failover, or admin-panel configuration. Multiple legitimate keys/providers are needed for reliability, cost control, and free-tier maximization while preserving deterministic adjudication as a fallback.
**Rules**:
- AI providers and API keys are configured through a new backend admin API at `/api/v1/admin/ai-providers`. Providers are never reconfigured through client-facing workspace APIs.
- Encrypted provider keys are stored in `ai_provider_keys`; raw keys are accepted only on create and never returned in API responses. Only `key_last4` is displayed after creation.
- The provider router selects the best candidate by priority, output state, and quota. Disabled providers, cooldown keys, and keys past configured limits are skipped.
- Router policy includes quota cooldown after rate-limit errors and preserves one no-op deterministic provider as the final fallback instead of changing the env-based provider path for dev setups.
- Support four provider types: `google_gemma`, `nvidia`, `ollama_cloud`, and `openai_compatible`; the latter can cover OpenAI-style APIs from NVIDIA or Ollama Cloud with configurable `base_url`, headers, and model name.
- Frontend or client apps never receive raw provider credentials. Only the backend worker or polling adjudication service may request a route from `DatabaseAgenticModelRouter`.
**Date**: 2026-07-02

---

### ADR-033: Accept evidence before credits are available
**Status**: Accepted
**Reason**: Blocking upload on exhausted credits harms the client's conversion
funnel and forces end users to retry later for a billing condition they cannot
control. Deferring AI work preserves ledger integrity while allowing the user
to complete their part of the verification flow.
**Rules**:
- Active organizations can upload evidence without an immediate credit
  reservation.
- Sessions that cannot reserve credits after upload move to
  `awaiting_credits`; no worker is queued and no reservation ledger entry is
  created.
- New credits drain `awaiting_credits` sessions FIFO within the organization,
  reserve credits using the existing bucket order, transition to `processing`,
  audit `credit_backlog_reserved`, and enqueue the normal worker.
- End-user surfaces must not mention credits, billing, payment, or plan state.
  Operator surfaces may label the state as `Awaiting credits`.
**Date**: 2026-07-02

---

### ADR-034: Run document quality as a fail-open verification check
**Status**: Accepted
**Reason**: Poor document photos are a major source of OCR failure and manual review, but making upload dependent on a newly configured multimodal provider would create avoidable conversion risk. A first-class `document_quality` check gives the agent and operators structured quality evidence while allowing the upload path to fall back safely.
**Rules**:
- Document workflows expand to `document_quality` before OCR.
- Upload assesses the front document image before credit reservation and worker enqueue. If the quality result confidently recommends retry, the session remains `pending_upload`, no credit is reserved, no worker is queued, and `/verify` asks for a neutral document retake.
- If quality assessment fails, times out, or has no configured multimodal provider, processing continues with OCR instead of blocking the verification.
- Persist only safe quality fields in `verification_checks`; never persist raw images, storage paths, prompts, API keys, or provider secrets in check payloads.
- The optional agentic `requires_user_action` contract is bounded to `retake_document`.
**Date**: 2026-07-02

---

### ADR-035: Gate confidence-based auto-decide per workflow
**Status**: Accepted
**Reason**: High-confidence agentic recommendations can reduce manual review in gray-zone sessions, but only after replay data proves the workflow is reliable enough. A nullable workflow threshold makes rollout explicit and reversible without changing global risk bands.
**Rules**:
- `workflows.auto_decide_confidence_threshold` is nullable; `null` disables the expansion.
- The override only applies when the workflow is in `auto_decide` mode and `auto_decide_allowed` is true.
- The override only applies to deterministic `manual_review` outcomes, never to terminal deterministic approves/rejects.
- The agent recommendation must be terminal, meet or exceed the threshold, and agree with the deterministic gray-band direction: scores in the lower half of the manual band lean approved; scores in the upper half lean rejected.
- Terminal overrides and model validation still run before the production decision is selected.
- Every override emits `auto_decide_confidence_override` with confidence, threshold, deterministic direction, and thread id.
**Date**: 2026-07-03

---

### ADR-036: Use Dodo Payments for checkout while keeping HaloKYC as the credit ledger
**Status**: Accepted
**Reason**: HaloKYC needs hosted checkout, subscription billing, and payment-event delivery without moving credit-balance authority out of the product. Dodo Payments handles payment collection and subscription lifecycle events; HaloKYC remains the source of truth for credit entitlements, reservations, settlements, and audit history.
**Rules**:
- Use the official Dodo Payments SDK on the backend for checkout session creation and webhook verification.
- Frontend code never receives Dodo API keys, webhook keys, or direct Dodo SDK calls. Browser flows call HaloKYC BFF routes, which call FastAPI.
- Dodo API/webhook credentials are environment configuration; Dodo product IDs,
  prices, credit amounts, rollover caps, and active plan/pack availability are
  managed in the platform admin billing catalog.
- Dodo webhook events are idempotent by `webhook-id` before any credit mutation.
- Successful one-time payment events add purchased credits via `CreditService.add_purchased_credits`.
- Successful subscription activation/renewal events grant subscription credits via `CreditService.grant_subscription_monthly`.
- `billing_subscriptions` mirrors Dodo status for UI and reconciliation only; `client_credit_accounts` plus `credit_ledger_entries` remain authoritative for spendable credits.
**Date**: 2026-07-04

---

## Authentication & Identity Federation

### ADR-037: Add Google OAuth as an optional identity provider for client sign-in
**Status**: Accepted
**Reason**: Customers (client org members) repeatedly ask to skip password creation. Google is the dominant workplace IdP for the target market; offering "Sign in with Google" lowers signup friction without outsourcing auth.
**Date**: 2026-07-04
**Rules**:
- Google OAuth is an **additional** identity surface; email/password stays as the default. No DB column is removed.
- `users.google_id` stores Google's `sub` claim. Repeated Google logins reuse the existing `User` row.
- When a Google callback's email already matches an existing `User` row whose `google_id` is null, the backend links the row (`google_id = sub`). This avoids duplicate accounts but is one-way: a password-set account can be linked by Google, but a Google-only account has no password to log in with.
- New Google-only users get a `User` row with `email_verified_at = now()` (Google verifies the email) but **no Organization or OrganizationMember**. They land on the unified "select account" surface with `organizations: []` and the frontend walks them through org creation or asks an admin for an invite.
- The backend exchanges the one-time Google `code` for an access token using `GOOGLE_OAUTH_CLIENT_ID` + `GOOGLE_OAUTH_CLIENT_SECRET` (server-only). The frontend never sees the Google access token, only its own HaloKYC `temp_token`.
- Google login is **not** offered to platform admins. Platform admins always authenticate with username/password against `platform_admins` to preserve the env-bootstrap fallback for the first owner.
- Platform operators can disable Google login by leaving `GOOGLE_OAUTH_CLIENT_ID` unset; the backend route returns `503` when the integration is unconfigured.

---

## Future Decisions

Add new ADRs here. Never silently change architecture. Every major technical decision must be recorded before implementation.
