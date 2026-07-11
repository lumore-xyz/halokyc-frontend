# Development Roadmap

> **Status legend:** `[x]` completed · `[-]` in progress · `[ ]` pending · `[~]` optional/deferred
> **Start here:** [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) for requirements, decision rules, and credit model. [`features/README.md`](features/README.md) for per-feature reference docs. [`API_CONTRACTS.md`](API_CONTRACTS.md) for endpoint shapes. Side-specific [`backend/ARCHITECTURE.md`](backend/ARCHITECTURE.md) / [`frontend/ARCHITECTURE.md`](frontend/ARCHITECTURE.md) for code layout.

---

## Phase 1 — Foundation ✅

- [x] Basic auth, start/upload/poll flow, workflow-scoped services.

## Phase 2 — AI Engine ✅

- [x] OCR (PaddleOCR), face matching (InsightFace), liveness, duplicate detection (pgvector), risk engine, webhook delivery.

## Phase 3 — Client Orchestration ✅

- [x] Workflow Designer, API key management, client review queue.

## Phase 4 — User Experience ✅

- [x] Dynamic `/verify` with instruction steps, camera-only selfie/liveness, document upload fallback, session resume.

## Phase 5 — Compliance & Security ✅

- [x] Audit trail, full RBAC (customer + platform), agent auditability, evidence minimization.

## Phase 6 — Organizations, Workspaces, and RBAC ✅

- [x] Organization-first model with workspace-scoped resources, fixed customer roles (owner/admin/reviewer/developer), platform roles (owner/business_admin/support/sales), migration compatibility.

## Phase 7 — Agentic Verification Adjudication ✅

- [x] Full LangGraph workflow with provider abstraction (Google/OpenAI-compatible), cost controls, shadow mode/evaluation, human-in-the-loop (PostgreSQL checkpointing), rollout criteria.

## Phase 8 — Subject Lifecycle & Bans ✅

- [x] Reset, full deletion, soft/permanent bans with ban-match embedding retention; duplicate detection integration; agentic overrides; full audit trail.

## Phase 9 — Production Hardening ✅

- [x] Schema consistency, test reliability, platform monitoring aggregates, CI/CD pipelines (GitHub Actions), replay command for evaluation.

---

## Phase 15 — OCR Pattern UI & Verify Callback Return ✅

**Goal:** Keep operator UI aligned with the OCR/metadata split and let the end-user Done/Continue action return to the requesting service using only the server-stored callback value.

- [x] Add `callback_url` to the typed `VerificationConfig` response and route verify completion through `window.location.assign(callback_url)` when configured.
- [x] Keep `/verify` ignoring query-string `callback_url` values; query params are tolerated only for old/deep-link compatibility.
- [x] Update review/session check cards to show OCR extraction source, learned pattern id, AI training metadata, and the separate informational `metadata_matching` check.
- [x] Add `MetadataMatchingCheckResult` typing and include `metadata_matching` in ordered check rendering after OCR.
- [x] Run frontend gating with `eslint` on the touched verify/check-card/API files and `tsc --noEmit`.

---

## Phase 14 — Desktop-to-Mobile Verification Handoff

**Goal:** When a user lands on `/verify` from a desktop browser, prompt them with a modal to either continue on the current device or hand off to a mobile device via a QR code. Background polling on the desktop detects when the mobile journey completes and renders the terminal result screen automatically.

**Backend impact:** None. Reuses the existing public `GET /api/v1/verifications/{id}` polling endpoint and existing `/verify?verification_id=...` deep link. No new contract endpoints.

### 14.1 Dependencies
- [x] Install `qrcode` + `@types/qrcode` in `frontend/`.

### 14.2 Device Detection
- [x] Add `src/app/verify/_hooks/use-is-mobile.ts` — SSR-safe hook using `navigator.userAgent` + `navigator.maxTouchPoints` / `matchMedia("(pointer: coarse)")`. Returns `false` during SSR to avoid layout shift; recomputes on mount.
- [x] Hook is dismissible-tolerant: any false positive is recoverable because the modal always offers "Use This Device".

### 14.3 QR Code URL Builder
- [x] Add `src/app/verify/_lib/build-verify-url.ts` that constructs the mobile verify URL from the current `window.location`, preserving `verification_id`, `external_user_id`, and `callback_url` query params.
- [x] Returns the absolute URL string to be encoded into the QR.

### 14.4 Desktop Handoff Modal
- [x] Add `src/app/verify/_components/desktop-handoff-modal.tsx` (`"use client"`) built on the existing `src/components/ui/dialog.tsx`.
- [x] Two actions: **Use This Device** (closes modal, proceeds with desktop flow) and **Open in Mobile** (renders QR code via `qrcode` library + shows polling status).
- [x] QR code rendered to a `<canvas>`; respects `prefers-reduced-motion` (QR is static so automatic).
- [x] Polling status pill: "Waiting for mobile…" spinner that updates when terminal status arrives.
- [x] Accessible: `Dialog` provides focus trap, ESC to dismiss to desktop flow, labelled QR region.

### 14.5 Background Polling Reuse
- [x] Reuse `useVerification({ verificationId, apiKey, enabled })` from `src/lib/hooks/use-verification.ts`. The hook already polls until terminal status (`approved`/`rejected`/`manual_review`).
- [x] Enable polling only while the handoff modal is open (and the desktop journey has not started). Disable once the user clicks "Use This Device" to avoid the capture state machine racing with background updates.
- [x] On terminal status observed via the background poll, dispatch `terminal` transition and render `VerifyResultStep` exactly as the existing polling branch does.

### 14.6 VerificationFlow Integration
- [x] Gate the modal: show only when `!isMobile && configQuery.isFetched && configStatus === 'pending_upload'` (initial state — not started on desktop and not yet completed on mobile).
- [x] Do NOT show the modal if the session is already `processing`, `approved`, etc. (those render their own screens; a mobile handoff is meaningless there).
- [x] On terminal status from background poll while modal open: hide modal, dispatch `{ type: "terminal", decision }`, call the existing `window.close()` / callback path used by `VerifyResultStep.onContinue`.
- [x] Persist the user's "Use This Device" choice in component state (not `localStorage`) so a same-session refresh re-evaluates device detection but never re-prompts within the same mount.

### 14.7 Documentation & ADR
- [x] Update `.agents/context/API_CONTRACTS.md` §`/verify` flow: document that the desktop-to-mobile handoff is a client-only flow reusing existing polling — no new endpoint.
- [x] Add ADR-F029 to `frontend/DECISIONS.md`: rationale for client-only handoff, QR via `qrcode` lib, and the decision to reuse `useVerification` for background polling instead of a dedicated handoff endpoint.
- [x] Update `frontend/CHANGELOG.md` with the new feature entry under an Unreleased / dated heading.

### 14.8 Tests & Gating
- [~] One vitest smoke test in `src/app/verify/page.test.tsx` covering the desktop handoff modal path (mock `useVerification` to resolve terminal status, assert modal hides and result renders). Optional per "development over testing" policy.
- [x] Run frontend gating before merging: `npx --no-install tsc --noEmit`, `npx --no-install eslint src`, `npx --no-install vitest run`.

---

## Phase 10 — Automation Efficiency Improvements ✅

**Goal:** Reduce manual review volume by 30–50% while maintaining false approve rate < 1%.

### 10.1 Timeout Recovery
- [x] Modify verification worker to detect which AI services timed out vs completed.
- [x] Introduce `timeout_recovery` flag in session context when one or more services time out.
- [x] Extend agentic graph to handle `timeout_recovery` mode: decide using available check results + document images.
- [x] Add policy gate: if critical services (face match, liveness) are missing due to timeout, agent may still auto-decide if other evidence is strong, or escalate to manual with a `timeout_incomplete` reason.
- [x] Add audit action `agentic_timeout_recovery` recording which services were missing and the final decision.
- [x] Add workflow feature flag `timeout_recovery_enabled` (default off for gradual rollout).
- [x] Update admin metrics to track `timeout_recovery_success_rate` and `timeout_recovery_manual_rate`.

### 10.2 Deterministic Duplicate Policy
- [x] Implement pre-agent duplicate decision rules in the worker:
  - same `external_user_id` → return existing session's final decision without agent.
  - active subject ban match → auto-reject with `active_subject_ban_match` reason.
  - similarity above threshold, no ban → `manual_review`.
  - low similarity → ignore as non-match.
- [x] Add audit actions: `duplicate_same_external_user_resolved`, `duplicate_ban_match_auto_rejected`, `duplicate_manual_review_triggered`.
- [x] Update duplicate search to prioritize ban-match embeddings and return `match_kind`.
- [x] Document policy in `API_CONTRACTS.md`.

### 10.3 Document Quality Check (Multimodal)
- [x] Define `DocumentQualityCheck` result schema: `readability`, `image_quality`, `missing_regions[]`, `suspected_tampering`, `retry_recommended`, `quality_confidence`.
- [x] Add `DocumentQualityService.assess(document_image)` calling the multimodal LLM provider.
- [x] Integrate into worker/upload path after document upload and before OCR/credit reservation when retake can be requested.
- [x] Include quality check in agent evidence payload.
- [x] Allow agent/upload response to return `requires_user_action` with `retake_document` if quality is poor and `retry_recommended=true`.
- [x] Update `/verify` UI to handle `requires_user_action` for document retake.
- [x] Add fallback: if quality service fails or times out, continue without it.

### 10.4 Confidence-Based Auto-Decide Expansion
- [x] `auto_decide_confidence_threshold` workflow flag, gray-zone confidence override, `auto_decide_confidence_override` audit event implemented.
- `[~]` After collecting sufficient replay data, analyze correlation between agent `confidence` and manual override rate. (Post-launch rollout task.)
- [x] Thresholds: sessions with `agent_confidence >= 0.95` and `agent_recommended_status` matches deterministic direction auto-decide even if score in [30, 60].
- [x] Add per-workflow feature flag `auto_decide_confidence_threshold` (default null = disabled).
- [x] Implement in agentic graph: after `validate_agent_output`, if confidence >= threshold and agrees with deterministic majority, set final_status directly.
- [x] Audit logging captures `auto_decide_confidence_override` event.
- `[~]` Monitor override rate after rollout; adjust threshold if false approve rate approaches 1%. (Post-launch rollout task.)

### 10.5 Client-Side Risk Signals
- [x] Extend `StartVerification` request to accept optional `client_metadata` object (`user_trust_score`, `ip_reputation`, `device_id`).
- [x] Validate caller is allowed to send metadata.
- [x] Store `client_metadata` in `VerificationSession` (JSONB).
- [x] Include `client_metadata` in agent evidence payload.
- [x] Document usage guidelines and privacy considerations.
- [x] Do not use client metadata in deterministic risk scoring (agentic only).

### 10.6 Analytics Instrumentation
- [x] Add `manual_review_analytics` table capturing: `verification_id`, `workflow_id`, `workspace_id`, `organization_id`, `enabled_services[]`, `score`, `agent_mode`, `agent_confidence`, `timeout_occurred`, `timeout_services[]`, `duplicate_outcome`, `document_type`, `country_of_issue`, `final_decision`, `manual_review` flag, `reviewer_override`, `override_reason`.
- [x] Emit analytics at terminal decision from worker and agent code.
- [x] Create admin metrics endpoints: `GET /api/v1/admin/metrics/automation` aggregated by dimension.
- [x] Build dashboard cards for clients to see manual review trends by workflow.

### Phase 10 Appendix: Replay Command
- [x] Build offline replay command (`uv run replay-historical-sessions`) running historical check payloads through deterministic vs agentic graph.
- [x] Comparison output: CSV/JSON with session_id, deterministic_decision, agent_recommendation, agent_confidence, actual_outcome, provider, latency, fallback_reason.
- [x] Add filters: by workflow, by date range, by outcome (manual reviewed only).
- [x] Document replay usage; run periodically after launch.

---

## Phase 11 — Subject Lifecycle, Bans, and Data Deletion (Completed 2026-07-03)

**Goal:** Give clients explicit control over user verification reset, full data deletion, soft bans, and permanent bans without relying on automatic 30-day session deletion.

### 11.1 Retention Policy Cleanup
- [x] Remove/retire the fixed-window biometric purge path. `purge-webhook-logs` can remain; `purge-biometrics` must not delete terminal verification sessions or embeddings automatically.
- [x] Update settings/env docs so there is no implied 30-day verification session deletion rule.
- [x] Add a migration-safe cleanup note for existing deployments that may have scheduled the old biometric purge command.

### 11.2 Schema
- [x] Add `subject_ban_kind` enum: `soft_ban`, `permanent_ban`.
- [x] Add `subject_bans` table scoped by `organization_id`, `workspace_id`, and `external_user_id`.
- [x] Add retained-ban fields to `face_embeddings`: nullable `verification_id`, optional `subject_ban_id`, `purpose`, `retained_after_subject_delete`, `deleted_at`.
- [x] Change `face_embeddings.verification_id` from `ON DELETE CASCADE` to nullable `ON DELETE SET NULL`.
- [x] Add indexes for active ban lookup and tenant-scoped ban-match vector search.

### 11.3 Services
- [x] Add `SubjectLifecycleService` owning reset, full deletion, ban create/update, ban lift, audit logging.
- [x] Reset/full deletion removes sessions, files, checks, webhook deliveries, face embeddings.
- [x] Ban create/update deletes session artifacts but retains a minimized `ban_match` embedding.
- [x] Lifting a ban removes/disables retained ban-match embeddings unless another active ban references them.
- [x] All operations idempotent and tenant-scoped.

### 11.4 API
- [x] Developer endpoints: `POST /subjects/{id}/reset-verification`, `DELETE /subjects/{id}`, `PUT/PATCH/GET /subjects/{id}/ban`.
- [x] Workspace dashboard endpoints under `/workspaces/{id}/subjects/{id}/...`.
- [x] Safe lifecycle responses with counts and ban status; never expose face vectors or raw biometric internals.
- [x] Focused smoke tests for API-key scoping, dashboard RBAC, idempotent deletion, soft-ban expiry, permanent ban, ban lift.

### 11.5 Verification Engine Integration
- [x] Duplicate detection checks active ban-match embeddings in same workspace/client scope.
- [x] Active ban matches are terminal rejection signals with safe reason codes.
- [x] Agentic adjudication terminal overrides include active ban matches.
- [x] Webhooks expose only final status and safe decision reason.

---

## Phase 12 — Credit Backlog & Deferred Processing ✅

**Goal:** Accept end-user evidence even when an active organization's wallet is temporarily empty, then resume processing automatically when credits arrive.

- [x] Add `awaiting_credits` to `verification_status` enum and migration.
- [x] Upload handling: insufficient credits stores evidence, transitions session to `awaiting_credits`, audits `credit_backlog_entered`, returns success without enqueueing worker.
- [x] Backlog drain logic: reserve newly available credits for oldest `awaiting_credits` sessions, resume as `processing`.
- [x] Trigger backlog drain after free top-up, subscription grant, purchased credits, positive platform adjustments.
- [x] Backend smoke tests for zero-credit upload, no ledger reservation while backlogged, FIFO drain, stale reservation cleanup.

---

## Phase 13 — Platform AI Provider Operations ✅

**Goal:** Let platform owners remove unused or compromised AI providers and stored provider keys.

- [x] Expose `DELETE /api/v1/admin/ai-providers/{provider_id}`.
- [x] Expose `DELETE /api/v1/admin/ai-providers/{provider_id}/keys/{key_id}`.
- [x] Expose `POST /api/v1/admin/ai-providers/{provider_id}/keys/{key_id}/test` for provider/key smoke prompt.
- [x] Reuse provider-service audit actions for deletion.

---

## Verification Flow Redesign ✅

### Backend
- [x] `GET /api/v1/verifications/{id}/config` — public endpoint returning workflow name, services, min_age, pre-computed step sequence.
- [x] `VerificationConfigResponse` and `VerifyStepConfig` Pydantic schemas.
- [x] `get_verification_config` service method.
- [x] Tests: step sequence generation, camera_only flags, public access.

### Frontend
- [x] Instruction step components: `verify-step-selfie-instruction.tsx`, `verify-step-document-instruction.tsx`.
- [x] State machine updated: `selfie_instruction`, `document_front_instruction`, `document_back_instruction` added to `VerifyStep` type.
- [x] `planSteps(services)` returns capture steps only.
- [x] `VerificationFlow` handles both `verification_id` (resume) and `workflow_id` (start) query params.
- [x] `VerifyCameraCanvas`: `cameraOnly` prop hides upload fallback; `frameType` prop (oval/rectangle).
- [x] `api-client.ts`: `VerificationConfig`, `VerifyStepConfig` types + `getVerificationConfig()` method.
- [x] Capture components accept `cameraOnly`, `frameType`, `instructionPill` props.
- [x] All 90 state-machine tests passing.

---

## Automation Strategy Context

This section preserves high-level strategic intent from `AUTOMATION_STRATEGY.md`. Implementation status is tracked above; this section documents the "why".

### Which Workflows Generate Manual Reviews?
Workflows with multiple AI services (especially selfie + liveness + document) generate the most manual reviews. Liveness detection is particularly timeout-prone. Non-Latin-script document OCR is another contributor. Aggressive risk thresholds widen the manual-review band.

### Biggest Bottleneck: Service Timeouts
Infrastructure/latency timeouts currently route sessions to `manual_review` even when sufficient evidence exists for automated decision. Timeout recovery (implemented in Phase 10.1) addresses this.

### Near-term Priority Order (post-launch)
1. Timeout recovery ✅
2. Deterministic duplicate policy ✅
3. Document quality check ✅
4. Confidence-based auto-decide expansion ✅
5. Client-side risk signals ✅
6. Analytics instrumentation ✅

### Post-MVP Future Enhancements
- Multi-modal model: feed raw images directly to a vision-language model.
- Document authenticity detection (paper, ink, security features).
- AML/PEP screening: watchlist integration for politically exposed persons.
- Behavioral biometrics: analyze interaction patterns during capture.
- Collaborative fraud network: share known-bad embeddings across workspaces (opt-in, privacy-safe).
- Self-improving prompts: use high-confidence decisions as few-shot examples.
- Client-customizable models: enterprise clients fine-tune on their own history.

### Open Questions
1. Jurisdictions requiring human-in-the-loop by law — per-region auto-decide disable?
2. Meaningful explanations for agent wrong decisions (GDPR "right to explanation").
3. Expose agent confidence to clients for step-up verification?
4. Fairness audits to detect inadvertent bias.
5. Long-term cost model: agent-assisted as paid add-on or bundled?

### Metrics to Track
- Manual review rate (overall and per workflow)
- Agent agreement rate (assist_review mode)
- Auto-decide precision/recall (from replay)
- Timeout recovery success rate
- Duplicate policy coverage
- Cost per terminal session
- Latency percentiles (deterministic vs agent-assisted)
- Provider failure rate and fallback reasons
- Reviewer efficiency (time per review)

---

## 1. Organization & Workspace Foundation

**Goal:** Move from one client account per customer to organization-first model with workspace-scoped products.

- [x] Add native enums: organization status, workspace status, member role, platform admin role, user status, API key environment.
- [x] Add `users` table for all email/password login identities.
- [x] Add `organizations` table for customer companies.
- [x] Add `organization_members` table with fixed roles: `client_owner`, `client_admin`, `client_reviewer`, `client_developer`.
- [x] Add `workspaces` table under organizations.
- [x] Backfill each existing `Client` into one `Organization` + one `Default Workspace`.
- [x] Add `organization_id` and `workspace_id` to workflows, API keys, verification sessions, webhook deliveries, audit logs, credit ledger rows where appropriate.
- [x] Keep `clients` table only as a migration bridge; document removal plan before dropping.

## 2. Client Workspace APIs

- [x] Workspace CRUD: `GET/POST /api/v1/workspaces`, `GET/PATCH /api/v1/workspaces/{workspace_id}`.
- [x] Move workflow CRUD to `/api/v1/workspaces/{workspace_id}/workflows`.
- [x] Move API key CRUD to `/api/v1/workspaces/{workspace_id}/api-keys`.
- [x] Workspace-specific API key environment support: `test` and `live`.
- [x] Move verification activity, summary, detail, evidence file, review routes under `/api/v1/workspaces/{workspace_id}/...`.
- [x] Workspace-scoped webhook endpoint management.
- [x] Workspace-scoped analytics and audit-log list endpoints.
- [x] External verification start/upload/get APIs resolve `organization_id`, `workspace_id`, `environment`, `api_key_id` from the API key; callers must not provide tenant ids.

## 3. Customer RBAC

- [x] Replace `ClientUser` auth with `User` + `OrganizationMember` auth. Legacy `/me` routes kept as compatibility wrappers.
- [x] Issue client JWTs with `user_id`, `organization_id`, member role, allowed workspace ids.
- [x] Authorization helpers for fixed permission groups.
- [x] Enforce owner/admin/developer access on API key and webhook routes.
- [x] Enforce owner/admin access on workflow and workspace settings routes.
- [x] Enforce owner/admin/reviewer access on review decision routes.
- [x] Hide sensitive KYC evidence from developers at API layer.
- [x] Audit role-sensitive actions: invites, role changes, review decisions, API key actions, webhook changes, sensitive evidence views.

## 4. Platform Admin Users & RBAC

- [x] Add `platform_admins` table with roles: `platform_owner`, `platform_business_admin`, `platform_support`, `platform_sales`.
- [x] Bootstrap first `platform_owner` from environment only when none exists.
- [x] Replace `/api/v1/auth/admin/token` with database-backed platform admin login.
- [x] Add platform admin invite/update endpoints.
- [x] Add platform admin routes: organizations, workspaces, verification lookup, billing/credits, support logs, sales notes, audit logs, system settings.
- [x] Enforce backend 403s for unauthorized platform roles.
- [x] Audit platform admin invites, role changes, disabled users, credit adjustments, organization suspension, sensitive data views.

## 5. Credits, Billing, and Usage Attribution

- [x] Migrate credit accounts from `client_id` to `organization_id`.
- [x] Add nullable `workspace_id` attribution to credit reservations and ledger entries.
- [x] Preserve free, subscription, purchased, reserved bucket semantics.
- [x] Reservation and settlement use workspace from API key or session.
- [x] Admin credit adjustment endpoint with platform-role enforcement.
- [x] Workspace usage filters in organization credit ledger reads.
- [x] Auto-release stale verification credit reservations after timeout; expose active reserved session IDs.
- [x] Wire `release_stale_credit_reservations_task` into Celery beat or external scheduler; credit reads run cleanup as safety net.

## 6. Migration & Compatibility

- [x] Idempotent migration/backfill script for existing clients.
- [x] Backfill existing client users as `client_owner` organization members.
- [x] Backfill workflows, API keys, sessions, checks, webhooks, audit logs, credit rows into each default workspace.
- [x] Keep `/api/v1/me/...` routes as compatibility wrappers until frontend fully moves to workspace routes.
- [x] Update `uv run seed` to create one organization, one owner user, at least one workspace with demo workflows and keys.
- [x] Focused smoke tests for migration, workspace scoping, role 403s, API-key-to-workspace resolution.

## 8. Test Cleanliness

- [x] `live_db` fixture + `LiveDb.tag` / `LiveDb.tag_email` API + autouse legacy-name backstop + `APP_ENV=test` guard in `conftest.py`.
- [x] Document rule in `AGENTS.md`.
- [x] Expose `uv run purge-test-data` console script.
- [x] Migrate `test_workflow_self.py`, `test_review_self.py`, `test_sessions_self.py`, `test_workspace_rbac.py`, `test_admin_service.py`, `test_verification_flow.py`, `test_db_models.py` to use `live_db.tag` explicitly.

## 9. Agentic Verification Adjudication

### 9.1 Evidence Contract & Policy Gates
- [x] Define `AgenticEvidencePayload` shape from `verification_checks`, `VerificationSession`, `Workflow`, safe session metadata.
- [x] Minimization helper strips raw OCR text, full document numbers, raw file paths, API keys, webhook secrets, raw biometric captures before any external model call.
- [x] Define `AgenticVerdict` schema: `recommended_status`, `confidence`, `reason_codes`, `human_summary`, `evidence_references`, `requires_manual_review`; optional `retake_document` user action.
- [x] Deterministic policy gate: skip LLM for clean low-risk approval, terminal deterministic reject, disabled workflow/provider, provider outage, timeout, budget cap.
- [x] Hard terminal overrides: under-age, confirmed face mismatch, confirmed liveness failure, confirmed tenant-scoped duplicate cannot be approved.
- [x] Reason-code constants for ambiguous OCR, low OCR confidence, face/liveness conflict, duplicate uncertainty, borderline risk score, invalid model output, provider fallback, budget fallback.

### 9.2 LangGraph Runtime
- [x] Backend dependencies for LangGraph via `uv`, pinned in lockfile.
- [x] `app/services/agentic_adjudication_service.py` as service boundary called by worker after deterministic checks.
- [x] Graph nodes: `load_session_context`, `normalize_evidence`, `deterministic_policy_gate`, `agentic_adjudication`, `validate_agent_output`, `finalize_recommendation`.
- [x] Run graph inside existing Celery verification pipeline; no separate agent microservice.
- [x] Stable verification-scoped `thread_id` for replay and human-in-the-loop resume.
- [x] Checkpointing disabled/in-memory for local shadow-only tests; PostgreSQL checkpointing before production.

### 9.3 Model Provider & Cost Controls
- [x] `AgenticModelProvider` protocol with no-op/deterministic fallback provider.
- [x] Replace single env-based Google provider with DB-backed `ai_providers` registry + `ai_provider_keys` (encrypted) + `ai_provider_service` (quota-aware routing).
- [x] Default configured model to Gemma 4 when available; overrideable.
- [x] Per-session timeout handling and retry for transient provider failures only.
- [x] Daily/rolling model-call budget guard falling back to deterministic.
- [x] Record model/provider name, latency, token/cost estimate, fallback reason, output validation status without persisting raw prompts.

### 9.4 Persistence, Audit, and API Shape
- [x] Store agent recommendations in `verification_checks` as new `agentic_review` check type; updated `DATABASE_SCHEMA.md`.
- [x] Persist validated structured verdict and safe evidence references for reviewer visibility.
- [x] Audit log actions: `agentic_shadow_recommended`, `agentic_auto_decided`, `agentic_fallback_used`.
- [x] Update `API_CONTRACTS.md` before exposing agent recommendation details.
- [x] Webhooks send only final status contract unless explicit contract version adds agent fields.

### 9.5 Shadow Mode, Evaluation, and Rollout
- [x] Feature flag: `disabled`, `shadow`, `assist_review`, `auto_decide`.
- [x] Shadow mode: compute and store recommendations without changing final session status.
- [x] Offline replay command (`uv run replay-historical-sessions`) for historical comparison.
- [x] Track: approval precision, rejection precision, manual-review deflection, false approve/reject rate, latency, provider failure rate, model spend per terminal session.
- [x] Unit tests for policy gating, terminal overrides, invalid model output fallback, budget fallback.
- [x] Worker smoke test for shadow-mode session recording agent recommendation without changing deterministic decision.
- [x] Reviewer feedback loop: record whether human agreed with agent recommendation (backend endpoint + persisted feedback).

## 10. Production Hardening (Post-Shadow Launch)

### 10.1 CI/CD Pipeline ✅
- [x] GitHub Actions workflows: backend (ruff, mypy, pytest) and frontend (tsc, eslint, vitest).
- [x] Database migration test in CI (apply to fresh test DB).
- [x] Preview deployment for frontend.

### 10.2 Workflow-Level Agentic Controls ✅
- [x] `agentic_mode` (disabled/shadow/assist_review/auto_decide) and `auto_decide_allowed` on Workflow model.
- [x] API CRUD for workflow agentic settings under workspace routes.
- [x] Validation: workflows cannot enable agentic review without at least one deterministic evidence service.
- [x] Worker respects workflow-level `agentic_mode`.

### 10.3 Platform Admin Monitoring Aggregates ✅
- [x] Backend aggregate endpoint: provider failure rate, budget fallback, invalid output fallback, auto-decision volume.
- [x] Query filters for agent mode and recommendation on verification activity tables.
- [x] Metrics scoped to workspace/organization with role-gated visibility.

### 10.4 Path to Auto-Decide ✅
- [x] PostgreSQL checkpointing for LangGraph (`langgraph-checkpoint-postgres`).
- [x] Human-in-the-loop interrupt/resume via `interrupt()` / `Command(resume=...)`.
- `[~]` Run replay command on post-launch data for baseline precision/deflection. (`scripts/agentic_replay.py` exists; pending production data; not a pre-release blocker.)
- [x] Rollout criteria defined: minimum sessions, precision thresholds, fallback rates before enabling auto_decide per workspace.
