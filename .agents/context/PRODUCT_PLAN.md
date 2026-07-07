# HaloKYC — Product Requirements & Roadmap

> **Read together with** [`API_CONTRACTS.md`](API_CONTRACTS.md) (endpoint shapes), [`TODO.md`](TODO.md) (implementation status per phase), [`features/README.md`](features/README.md) (per-feature reference), side-specific [`backend/ARCHITECTURE.md`](backend/ARCHITECTURE.md) / [`frontend/ARCHITECTURE.md`](frontend/ARCHITECTURE.md), and [`pricing.md`](pricing.md) (credit model detail). Requirements are the source of truth for scope and decision rules; `TODO.md` tracks what's shipped.
>
> **Status:** Phases 1–13 implemented. Pre-launch development with 0 production users. Feature-complete; final testing before first customer onboarding.

---

## 1. What HaloKYC Is

HaloKYC is a usage-based identity verification SaaS. It combines a policy-driven deterministic verification pipeline (OCR, face match, liveness, duplicate detection, age verification, risk scoring) with a LangGraph-powered agentic adjudication layer. The platform operates three distinct loops:

| Loop | Role |
|------|------|
| **Platform Admin** | Infrastructure owner — onboards clients, monitors system health, manages billing and AI providers |
| **Client (The Orchestrator)** | Defines verification workflows, manages API keys and webhooks, performs manual reviews, controls subject lifecycle |
| **User (The Subject)** | Completes a dynamic, workflow-driven verification journey via `/verify` |

---

## 2. Core Capabilities (All Implemented)

### 2.1 Agentic Review Layer
LangGraph-powered adjudicator that reviews normalized tool outputs (OCR, face match, liveness, duplicate, age, quality) and returns a structured verdict: `recommended_status`, `confidence`, `reason_codes`, `human_summary`, `evidence_references`, `requires_manual_review`. Supports `disabled`, `shadow`, `assist_review`, and `auto_decide` modes with provider abstraction (Google Gemini / OpenAI-compatible), cost controls, and rollout criteria.

### 2.2 Deterministic Decision Rules
Risk scoring with terminal overrides (under-min-age → `REJECTED`, confirmed face mismatch → `REJECTED`, liveness failure → `REJECTED`, confirmed duplicate → `REJECTED`). Score bands: `< 30` → approved, `30–59` → manual_review, `≥ 60` → rejected.

### 2.3 AI Services
- Selfie capture with liveness detection (camera-only, heuristic anti-spoof)
- Face matching between selfie and ID image (InsightFace)
- OCR extraction from ID documents (PaddleOCR) with normalized payload
- Document quality assessment: readability, image quality, missing regions, suspected tampering, retry recommendation
- Duplicate detection using pgvector face embeddings
- Age verification (custom `min_age` per workflow)

### 2.4 Dynamic `/verify` Flow
Workflow-driven step sequence with instruction pages, camera-only for selfie/liveness, upload fallback for documents, session resume via `verification_id`. Client-side file validation (8 MB, JPEG/PNG/WEBP). Neutral terminal states with brand colors.

### 2.5 Client Review Queue
Dedicated interface for manual approve/reject with evidence viewer and agent recommendation panel. Reviewer can agree with or override the agent recommendation; all decisions are audited.

### 2.6 Subject Lifecycle Controls
- Verification reset (clears all data)
- Full data deletion (GDPR-style)
- Soft/permanent bans with ban-match embedding retention
- Duplicate detection respects active bans
- Agentic overrides for lifecycle actions
- Full audit trail on all lifecycle operations

### 2.7 Multi-Tenancy & RBAC
Organization-first model with workspace-scoped resources. Fixed customer roles (owner/admin/reviewer/developer) and platform roles (owner/business_admin/support/sales). Backend authoritative; frontend route hiding is UX only. Developers excluded from sensitive KYC evidence by default.

### 2.8 Usage Credits
Organization-level wallet with bucketed credits (free/subscription/purchased). Reservation, settlement, and credit-backed deferred processing when credits are temporarily exhausted (`awaiting_credits` state). See `TODO.md` Phase 12 for full implementation status. Credit model documented in §14 of this file.

### 2.9 Webhooks
Configurable callbacks for final verdict delivery. HMAC-signed payloads (`X-Verification-Signature`). URLs scoped to the session and discarded on success/failure; not persisted in `localStorage`.

### 2.10 Audit Logging
Append-only logs for all status changes and lifecycle actions. Every action records `actor_id`, `timestamp`, `previous_status`, `new_status`, and `reason`.

### 2.11 Admin Portal
Platform admin UI for org/workspace management, metrics, billing adjustments, review override, AI provider configuration, platform admin management, support hub, sales hub, system settings.

### 2.12 Provider Abstraction
DB-backed model provider registry with Google Gemma and OpenAI-compatible adapters. Per-provider quotas, cooldown, budget guard. Provider and key management UI at `/admin/ai-providers`.

---

## 3. Personas

### Platform Admin (The Governor)
Manages the SaaS platform, onboards clients, monitors system-wide performance and AI accuracy, provides admin review override but does not perform routine reviews.

### Client (The Orchestrator)
Defines verification workflows (services, min_age, agentic mode), manages API keys and webhooks, reviews "Under Review" sessions, controls subject lifecycle (reset/delete/ban), monitors usage and credits.

### User (The Subject)
Completes `/verify` flow via deep link, provides selfie, ID document, and optionally liveness evidence, sees real-time quality feedback. Session resumable via `verification_id`.

---

## 4. Organization, Workspace, and RBAC

- **Organization**: Customer company; owns members, billing, and workspaces.
- **Workspace**: Product/unit scope for workflows, API keys, verification sessions, webhooks, manual reviews, analytics, audit events.
- **Roles**: Owner (full control), Admin (operational management, no ownership transfer), Reviewer (review sessions only), Developer (integration access without sensitive KYC data). Platform: Owner, Business Admin, Support, Sales.
- **Authorization**: Backend authoritative; frontend route hiding is UX only.

---

## 5. MVP Feature Set

### Product Features
1. Client registration and onboarding (admin-provisioned)
2. API key generation and management (test/live environments)
3. Workflow Designer: create/edit workflows with service toggles and `min_age`
4. Start verification session via API key
5. Dynamic evidence capture flow (`/verify`) with instruction pages per step
6. Background AI processing: OCR, face match, liveness, duplicate search, risk scoring
7. Agentic adjudication (LangGraph) with provider abstraction, cost controls, shadow/evaluation modes
8. Client review queue with approve/reject and agent recommendation panel
9. Webhook callbacks for final status
10. Audit logging for all status changes
11. Subject lifecycle: reset, full deletion, soft ban, permanent ban
12. Usage credit wallet with reservation/settlement, organization-level billing, credit backlog for uploaded sessions waiting on new credits
13. Document quality check that can request a neutral document retake before credit reservation/processing when the uploaded document is clearly unreadable or incomplete

### Frontend Deliverables
1. Landing page (three-audience orientation)
2. Dynamic verification flow (`/verify`) with server-driven step machine, instruction pages, camera capture, file validation, terminal states
3. Client Dashboard (`/dashboard`) with workflow management, API keys, review queue, session analytics, subject lifecycle, billing/credits, webhooks manager, audit logs, API console
4. Platform Admin portal (`/admin`) with org/workspace management, verification lookup, credit adjustments, AI provider configuration, platform admin management, support hub, sales hub, system settings
5. Design system based on shadcn/ui (`base-nova`) per side-specific `DESIGN_SYSTEM.md`

### Backend API Contract (Key Endpoints)
- **Public (API-key auth):** `/workflows`, `/verifications/start`, `/verifications/{id}/upload`, `/verifications/{id}/config`, `/verifications/{id}`, `/subjects/*/reset-verification`, `/subjects/*/ban`, etc.
- **Client (cookie JWT):** `/organizations`, `/workspaces`, `/workspaces/{id}/workflows`, `/workspaces/{id}/api-keys`, `/workspaces/{id}/verifications`, `/workspaces/{id}/reviews`, `/workspaces/{id}/webhooks`, `/workspaces/{id}/analytics`, `/workspaces/{id}/audit-logs`, `/workspaces/{id}/credit/*`
- **Platform Admin (cookie JWT):** `/admin/*` (orgs, workspaces, verifications, credit-ledger, credit-adjustment, ai-providers, platform-admins, admin-review, metrics, audit-logs, webhook-deliveries, support-logs, sales-customers, system-settings)

Full contract: `API_CONTRACTS.md`.

---

## 6. Credit Backlog Rules

- Active organizations can start verification sessions and accept evidence uploads even when the organization wallet has no available credits.
- When upload evidence is accepted but no credit can be reserved, the session status becomes `awaiting_credits`. The verification worker is not queued and no reservation ledger entry is created.
- New credits resume queued work FIFO within the organization: credits are reserved using the existing bucket order (free, then subscription, then purchased), the session moves to `processing`, and the background worker is queued.
- End-user `/verify` screens must use neutral submitted/waiting language and must not mention credits, billing, payment, or the client's plan.
- Client and platform operator surfaces may label the state as `Awaiting credits` so the reason for delay is operationally clear.

---

## 7. Decision Rules

### Risk Scoring
| Check | Score |
|-------|-------|
| `ocr_failed` | +25 |
| `ocr_low_confidence` | +15 |
| `face_mismatch` | +40 |
| `liveness_fail` | +40 |
| `duplicate_found` | +30 |
| `blurry_proxy` | +10 |

**Age** is a terminal rule: if extracted DOB is below workflow `min_age`, forces `REJECTED` with score=100.

- `score < 30` → `approved`
- `30 ≤ score < 60` → `manual_review`
- `score ≥ 60` → `rejected`

### Agentic Policy
- Deterministic checks run first; agent receives normalized payloads without raw OCR text, full document numbers, or biometric images.
- Terminal rules override model (age, face mismatch, liveness fail, confirmed duplicate).
- Model can only downgrade auto-approvals to `manual_review` or suggest `rejected`/`approved` within policy.
- Structured output required; optional user-action limited to `retake_document`.
- Workflows may set `auto_decide_confidence_threshold` for gray-zone auto-decisions: agent confidence ≥ threshold AND recommendation aligns with deterministic direction (lower half of manual band approves, upper half rejects).
- Confidence override decisions audit `auto_decide_confidence_override`.
- Fail-open to deterministic rules on model error/timeout/budget/invalid output.

### Document Quality
- Quality output: `readability`, `image_quality`, `missing_regions[]`, `suspected_tampering`, `retry_recommended`, `quality_confidence`.
- If quality check confidently recommends retry, session remains reusable; `/verify` asks for neutral retake. Credits not reserved, worker not queued.
- If quality service fails or times out, system continues with OCR and downstream checks.
- Raw document images not persisted in check payloads; agent receives only the structured quality result.

---

## 8. Tech Stack

### Backend
Python 3.14+, FastAPI, uv, PostgreSQL (pgvector), Redis, Celery. SQLAlchemy 2.0, Alembic, Pydantic v2. JWT / API-key auth. LangGraph (integrated into worker), PostgreSQL checkpointing configured.

### Frontend
Next.js 16 (App Router), React 19, TypeScript 5 (strict). Tailwind CSS v4, shadcn/ui (`base-nova`), `@base-ui/react`. `lucide-react`, `sonner`. `vitest` + `msw`. Playwright smoke tests planned.

---

## 9. Security & Data Retention

- API keys hashed (bcrypt/argon2); raw shown only once at creation
- Files stored server-side, not publicly accessible
- Audit logs for every status change and sensitive action
- Evidence minimization: agent layer never sees raw biometrics or full PII
- No automatic 30-day deletion; data retained until explicit lifecycle action or future configurable policy
- Ban retention: minimized `ban_match` embedding only; all other artifacts deleted
- RBAC enforced at API layer; developers excluded from sensitive evidence by default
- JWTs in httpOnly cookies; never exposed to `localStorage` or `document.cookie`
- API keys in per-tab `sessionStorage`; cleared on tab close
- Selfie and ID captures stay in component memory; never uploaded to third-party CDN

---

## 10. Non-Goals (Post-MVP)

- Mobile SDKs
- Self-service client onboarding wizard (admin-provisioned in MVP)
- Customer-facing billing portal
- Real-time push (SSE/WebSockets); polling sufficient
- Internationalisation beyond `en-US`
- Per-client branding theming
- Video-based liveness
- Unbounded paid AI usage (feature-flagged and cost-controlled)

---

## 11. Roadmap Beyond MVP

### Phase 10 — Automation Efficiency Improvements ✅ (implemented)

Target: Reduce manual review volume by 30–50% while maintaining false approve rate < 1%.

- Timeout recovery: agent adjudicates after service timeouts using available evidence + document images
- Deterministic duplicate policy: auto-decide clear-cut duplicates without agent involvement
- Document quality assessment: multimodal LLM evaluates image quality, readability, suspected tampering, retry recommendation
- Confidence-based auto-decide: enable auto-decide for high-confidence gray-zone sessions after replay validation
- Client-side risk signals: optional trusted metadata from clients (trust score, IP reputation, device ID)
- Analytics instrumentation: track manual review rates segmented by workflow, service, timeout, document type, country, duplicate outcome, agent confidence

### Phase 11 — Subject Lifecycle & Bans ✅ (implemented 2026-07-03)

- Reset, full deletion, soft/permanent bans
- Ban-match embedding retention
- Duplicate detection integration with ban enforcement
- Agentic overrides for lifecycle actions
- Full audit trail

### Phase 12 — Credit Backlog & Deferred Processing ✅ (implemented)

- `awaiting_credits` session state
- FIFO backlog drain when credits arrive
- Neutral user experience (no billing language in `/verify`)
- Ledger integrity: reservation/settlement only when credits actually available

### Phase 13 — Platform AI Provider Operations ✅ (implemented)

- Delete unused or compromised AI provider routes and stored keys
- Smoke-test endpoint for provider/key validation

### Phase 14 — Future Enhancements

- Multi-modal vision-language model for holistic image reasoning
- Document authenticity detection (paper, ink, security features)
- AML/PEP screening: watchlist integration
- Behavioral biometrics
- Collaborative fraud network (opt-in shared embeddings)
- Dynamic prompt improvement from high-confidence decisions
- Enterprise client-customizable models

---

## 12. Success Criteria (MVP Validation)

| Metric | Target |
|--------|--------|
| End-to-end conversion rate | > 80% from session start to terminal status |
| Decision speed (P95) | < 60 seconds from upload to verdict |
| Reviewer efficiency | < 2 minutes average per manual review |
| False approve rate | < 1% |
| False reject rate | < 5% on test data |
| Agentic deflections | ≥ 30% of sessions previously requiring manual review now auto-decided in shadow mode |
| Model cost per terminal session | < $0.02 (shadow mode for evaluation) |
| Web Interface Guidelines review | Every page passes |
| Lighthouse mobile score | ≥ 90 on core flows |
| Test data leakage | Zero — `live_db` tagging enforced |

---

### Credit Buckets

| Bucket | Source | Rollover cap | Stacks month-to-month? | Refundable? |
|--------|--------|-------------|------------------------|-------------|
| `free` | Platform signup bonus + monthly top-up (Sandbox only) | None — resets to 1,000 each month | No — resets to 1,000 each month | No |
| `subscription` | Successful subscription payment | `10 × monthly_plan_credits` | Yes, up to cap | No |
| `purchased` | One-time credit pack purchases | None | Yes, indefinitely | No |

### Credit Flow: Lifecycle Events

```
SIGNUP FREE TOP-UP SUBSCRIPTION GRANT PURCHASE
│     │       │           │            ▼
▼     ▼       ▼           ▼
ClientCreditAccount credit_service credit_service credit_service
created at → .top_up_free_ → .grant_subscription_ → .add_purchased_
org creation   monthly()      monthly()             credits()
```

**Signup Bonus** (one-time)
- Amount: `SIGNUP_BONUS_CREDITS` = 1,000. Triggered by onboarding flow (or `uv run seed`).
- Idempotent; ledger entry type: `signup_bonus`. Lands in `free` bucket.

**Monthly Free Top-Up** (recurring, Sandbox only)
- Amount: up to `FREE_MONTHLY_CREDITS` = 1,000. Triggered when calendar month changes since last top-up.
- Only if current total available credits are below 1,000. Does not roll over. Ledger: `free_top_up`.

**Subscription Monthly Grant**
- Triggered by external billing system calling `grant_subscription_monthly(monthly_plan_credits)`.
- Rollover cap: `10 × monthly_plan_credits`. Ledger: `subscription_grant`.
- Paid plans (Launch, Growth, Scale) only; Sandbox does not receive subscription credits.

**Purchased Credits**
- Triggered by payment webhook or admin action calling `add_purchased_credits(amount, payment_reference)`.
- No cap; persist until consumed or refunded via `POST /admin/billing/credits/adjust`. Ledger: `purchase`.

### Plans

| Plan | Price/mo | Credits/mo | Effective | Rollover cap |
|------|----------|------------|-----------|--------------|
| Sandbox | $0 | 1,000 | Free | None |
| Launch | $49 | 1,500 | $0.033 | 15,000 |
| Growth | $149 | 6,000 | $0.025 | 60,000 |
| Scale | $399 | 20,000 | $0.020 | 200,000 |
| Enterprise | Custom | Custom | Custom | SLA + support |

Credit purchase packs (minimum $25): 500, 1,250, 3,000, 10,000, 25,000.

### How Credits Are Consumed

- Default: **1 credit per verification session** (`credit_cost_per_verification`, default = 1). Admin-configurable at runtime.
- **Reservation:** `POST /verifications/start` → `reserve_for_verification()` → ledger `RESERVATION` → session = `processing`.
- **Settlement:** Worker detects complete → `settle_verification()` → ledger `SETTLEMENT` → final state (approved/rejected/manual_review).
- **Release (timeout/failure):** 60-minute timeout → `release_stale_reservations()` → ledger `RELEASE` → session → `manual_review`.

**FIFO Backlog Drain:** When credits hit zero, sessions enter `awaiting_credits`. New credits (purchase, subscription grant, top-up, adjustment) drain the backlog FIFO: oldest queued session → reserve → `processing`.

### Bucket Priority (Hard-Coded)
1. Consume `free` credits first
2. Then `subscription`
3. Then `purchased`

If total < required: raise `InsufficientCreditsError` immediately.

### Admin Credit Adjustment
`POST /admin/billing/credits/adjust` — positive adds, negative removes. Creates `ADJUSTMENT` ledger entry. Does not trigger backlog drain.

### Services That Consume Credits
| Service | Credit cost |
|---------|------------|
| Any verification session | 1 credit (default) |

All check types (OCR, face match, liveness, age, duplicate, quality) consume the same 1 credit. No tiered pricing by complexity.

### Low-Credit Alert (Planned)
When org's available credits drop below threshold (suggested: 100), system should send low-credit alert email. No trigger exists yet.

### File Reference
| File | Content |
|------|---------|
| `backend/app/services/credit_service.py` | All bucket logic, reserve/settle/drain |
| `backend/app/db/models.py` | `ClientCreditAccount`, `CreditLedgerEntry`, `CreditReservation` |
| `backend/app/api/v1/routes/admin.py` | `POST /admin/billing/credits/adjust`, balance reads |

---

## 14. Compliance

See `COMPLIANCE.md` for the full legal/regulatory framework, data governance tables, user consent requirements, privacy dashboard spec, and compliance console operator surfaces.

Key principles:
- **Data Fiduciary** (platform operations) and **Data Processor** (enterprise customer processing)
- Adheres to GDPR, CCPA, and DPDP Act
- Evidence minimization: agent layer never sees raw biometrics or full PII
- Audit logs permanent; all status changes immutable
- No automatic 30-day deletion
- Consent captured and persisted with `policy_version`, `consent_timestamp`, `ip_address`, `device_id`, `session_id`
