# Frontend Implementation Roadmap

Current focus: Compliance surfaces (per `.agents/context/COMPLIANCE.md` and
`COMPLIANCE.md`) and Phase 10 automation efficiency improvements.

Status Legend: `[x]` Complete | `[-]` In Progress | `[ ]` Not Started | `[~]` Optional Polish
| `[!]` Audit-flagged - implementation is partial, see notes
| `[D]` Deferred - see linked ADR

---

## 1. Foundation (Complete)

- [x] Landing page
- [x] `/verify` flow with dynamic steps, instruction pages, camera-only selfie/liveness, document upload fallback
- [x] Session resume via `verification_id`
- [x] Client dashboard shell with workspace routing
- [x] `/verify` consent step with explicit opt-in, policy-version audit, and `useConsentRecord` session storage (`src/app/verify/_components/consent-card.tsx`, `_hooks/use-consent-record.ts`)

## 2. Workspace- Scoped Dashboard (Complete)

- [x] Workflow management (create/edit/delete)
- [x] API key management (test/live)
- [x] Review queue (list, assigned, completed) with agent recommendation panel
- [x] Session list and detail (including upload card for pending_upload sessions)
- [x] Subject lifecycle page (reset, delete, soft/permanent ban)
- [x] Billing/credits view with workspace filter
- [x] Dodo-backed subscription and one-time credit checkout controls on billing
- [x] Platform admin billing catalog editor for Dodo product IDs, prices, credits, and plan/pack availability
- [x] Audit logs viewer
- [x] Webhooks manager
- [x] Analytics panel
- [x] Integration logs (developer-only)
- [x] API console (workspace-scoped)
- [x] Docs quickstart

## 3. Agentic Features (Complete)

- [x] Review detail agent recommendation panel
- [x] Reviewer feedback capture (agree/override)
- [x] Agent metrics cards in workspace analytics
- [x] Provider metadata display (owner/admin only)
- [x] Workflow agentic mode picker persisted to `agentic_mode` (was deferred in the prior TODO; `src/app/dashboard/[workspaceId]/workflows/_components/workflow-designer.tsx` now writes and reads the field)
- [x] URL-backed agent mode and agent recommendation filters on the verifications table (`/dashboard/[workspaceId]/sessions`)
- [x] Platform admin AI failure / budget fallback / invalid-output monitoring widgets (`src/app/admin/page.tsx` agent metrics cards)

## 4. Platform Admin Portal (Complete)

- [x] Dashboard layout and navigation
- [x] Organizations list and detail
- [x] Workspaces list and detail
- [x] Verification lookup and override
- [x] Admin review queue and decision
- [x] Billing ledger and credit adjustments
- [x] Platform admin management
- [x] AI provider configuration UI
- [x] Support hub (webhook/error logs)
- [x] Sales hub
- [x] System settings
- [x] Audit logs
- [x] DSR queue + export approval (`/admin/dsr`, awaiting backend per `.agents/context/COMPLIANCE.md` §"Future API Contract" §3)
- [x] Retention configuration (`/admin/retention`, awaiting backend per `.agents/context/COMPLIANCE.md` §"Future API Contract" §4)

## 5. Design System & Infrastructure (Complete)

- [x] shadcn/ui `base-nova` preset
- [x] Tailwind CSS v4 configuration
- [x] Dark mode tokens (future)
- [x] BFF proxy layer established
- [x] React Query data fetching
- [x] Route guards (organization, workspace, role)
- [x] useNavGroups hook
- [x] Vitest unit tests
- [x] MSW for API mocking
- [x] Playwright smoke tests (planned)
- [x] shadcn/ui `checkbox` primitive (`src/components/ui/checkbox.tsx`) for the consent card and cookie banner
- [x] `frontend/AGENTS.md` (the file the root `AGENTS.md` references) with Next.js 16 reminders

## 6. Known Gaps & Deferred Items

- [D] Country/document-type picker on `/verify` (ADR-F022 - requires new `Workflow` schema field, admin surface, and backend endpoint; not in scope for MVP)
- [D] Video-based liveness UI (backend does not yet support video liveness; `/verify` uses selfie capture + heuristic liveness)
- [D] Real-time push notifications (SSE/WebSockets) - polling sufficient for MVP per ADR-F005

---

## 7. Compliance Surfaces

Per `.agents/context/COMPLIANCE.md` §"Future API Contract". Subject-facing consent, cookie banner, and typed stubs for DSR + retention are in the frontend. The actual data endpoints land when the backend catches up.

- [x] Privacy Policy page (`/privacy`)
- [x] End User Terms page (`/terms`)
- [x] Data Retention page (`/data-retention`)
- [x] Privacy Notice + Terms link in `/verify` intro and selfie instruction
- [x] `ConsentCard` in `/verify` (per ADR-F024) - explicit opt-in, policy version audit, session-storage persistence
- [x] Cookie consent banner on `/` (per ADR-F025) - `essential` always on, `analytics` opt-in, versioned localStorage key
- [x] `/privacy/dashboard` subject surface (per ADR-F026) - card-based pillars + awaiting-backend state
- [x] `/admin/dsr` queue + export approval (per ADR-F026) - typed contract + awaiting-backend state
- [x] `/admin/retention` config (per ADR-F026) - typed contract + awaiting-backend state
- [~] Backend endpoints from `.agents/context/COMPLIANCE.md` §"Future API Contract" - flip `enabled: false` in `src/lib/hooks/use-privacy-dashboard.ts` and `src/lib/hooks/use-compliance-admin.ts` once the compliance routes are live. Deferred until backend implementation; current hooks intentionally stay disabled.

---

## Phase 10: Automation Efficiency Improvements

Audit as of 2026-07-03. The backend has shipped the data; the frontend
work breaks down into "done", "partial - type exists, UI missing", and
"not started". Items marked `[!]` are audit-flagged for the next agent.

### 10.1 Timeout Recovery UX [x]

Backend has shipped the `timeout_recovery` flag, `timed_out_services`
list, and `agentic_timeout_recovery` audit action. The frontend does
not yet surface them.

- [x] Extend `VerificationDetail` in `src/lib/api-client.ts` with `timeout_recovery: boolean` and `timed_out_services: string[]` (or co-locate the flag on the agentic check result - mirror the backend payload)
- [x] Render a banner on the three detail pages (workspace session detail, workspace review detail, platform verification detail): *"Some AI services timed out; decision made by agent using available evidence."* with the list of timed-out services
- [x] In the evidence view, badge each timed-out check as "Timed out - agent decided on available evidence"
- [x] No new state machine steps; just communication around the existing decision

### 10.2 Deterministic Duplicate Policy UI [x]

Backend has shipped `duplicate_found`, `match_kind` (`ban_match` |
`same_external_user` | `ambiguous`), and a `duplicate_session_id`
link target. The frontend has the duplicate `CheckResult` key but
does not render the match kind or the previous-session link.

- [x] Extend `VerificationDetail` in `src/lib/api-client.ts` with `duplicate_session_id: string | null` and `duplicate_match_kind: "ban_match" | "same_external_user" | "ambiguous" | null`
- [x] In the `CheckCard` for `duplicate` (or a new dedicated card), render the match kind as a labeled badge and link to the previous session when `duplicate_session_id` is present
- [x] Highlight sessions in the review queue that were auto-decided by duplicate policy (filter on the workspace review queue)
- [x] Auditor traceability: the link should deep-link to the workspace session detail (or admin verification detail for platform owners)

### 10.3 Document Quality Assessment [x]

Backend has shipped the `document_quality` check row. The TypeScript
type exists in `src/lib/api-client.ts:80-90`
(`DocumentQualityCheckResult`) but the UI's `orderedCheckKeys()`
helper in `src/components/check-card.tsx:122-124` is hardcoded to
`ocr | face_match | liveness | duplicate | age`, so the quality
check is never rendered.

- [x] Extend `CheckCard` to detect a `DocumentQualityCheckResult` and render dedicated quality metrics: readability, image quality, missing regions, suspected tampering, retry recommended
- [x] If `retry_recommended === true`, show a call-to-action: *"Retake document"* (only meaningful on the upload card path; for terminal sessions show guidance copy)
- [x] Add `document_quality` to `orderedCheckKeys()` so the card appears in the three detail pages (workspace session, workspace review, platform verification)
- [~] Add a small `DocumentQualityBadge` for use in the sessions list filter / activity rows (optional polish)

### 10.4 Confidence-Based Auto-Decide [x]

Backend has shipped the `workflows.auto_decide_confidence_threshold`
field. The TypeScript type exists on `Workflow`
(`src/lib/api-client.ts:375`) but the workflow designer
(`src/app/dashboard/[workspaceId]/workflows/_components/workflow-designer.tsx`)
does not yet render or persist the threshold.

- [x] Add a `confidence_threshold` field to the designer state, with input range validation (0.0-1.0, recommended 0.90-0.99)
- [x] Render the field in the designer (owner/admin only; gated by `AgenticMode` being `auto_decide` or higher)
- [x] Send `auto_decide_confidence_threshold` in the create / update payload
- [x] Display the current threshold on the workflow card and the workflow detail panel
- [x] When `null`, show "Not configured - using the default score bands"

### 10.5 Client-Side Risk Signals [x]

- [x] `StartVerificationCard` already accepts a `client_metadata` JSON object (`src/components/console/start-verification-card.tsx` lines 51-90, 342-362). The payload is sent via `startVerification` and persists in `VerificationSession.metadata`
- [x] `apiClient.startVerification` types `metadata: Record<string, unknown>` (line 61-66 of `src/lib/api-client.ts`)
- [~] Show stored metadata in session detail (for debugging) - low priority, only ship if backend `VerificationSession.metadata` is exposed on the detail payload

### 10.6 Analytics Instrumentation [x]

The backend now exposes aggregate automation metrics for platform-admin use,
and the workspace analytics page renders the same release-health signals from
workspace-scoped verification details.

- [x] Backend contract: add `GET /api/v1/admin/metrics/automation` returning per-window counts for `manual_review_total`, `timeout_recovery_total`, `timeout_recovery_success`, `duplicate_policy_total`, `duplicate_policy_auto_decided`, top manual-review factors, and a daily series.
- [x] Add a BFF route at `src/app/api/admin/metrics/automation/route.ts` (mirroring `/api/admin/metrics/agentic`)
- [x] Render four cards on the workspace analytics page: Manual review rate, Top factors contributing to manual review, Timeout recovery success rate, Duplicate policy coverage
- [x] Add date-range and workflow filters on workspace analytics; workspace scoping is provided by the current `/dashboard/[workspaceId]` route, and the platform admin aggregate supports `organization_id`, `workspace_id`, and `workflow_id` query filters.
- [~] Charts: kept to metric cards for the release path; no new charting library introduced. Sparklines/progress bars remain optional polish per `DESIGN_SYSTEM.md`.

---

## 8. Post-Phase 10 Possibilities

- Video liveness capture UI (if backend adds video support)
- Real-time verification progress via SSE/WebSocket
- Multi-language support (i18n)
- Client-branded white-label themes
- Mobile SDKs (native iOS/Android) - outside scope of this Next.js dashboard

---

## Notes

- The frontend is largely complete for MVP; Phase 10 work is incremental.
- The prior 10.6 blocker is complete: the backend automation aggregate,
  admin BFF route, and workspace analytics cards are now implemented.
- Keep changes minimal and well-audited; many Phase 10 features are
  backend-only with existing UI coverage (e.g., check results, analytics).
- When 10.1-10.4 land, mirror the changes across the three detail
  pages: `src/app/dashboard/[workspaceId]/sessions/[id]/_components/session-detail-manager.tsx`,
  `src/app/dashboard/[workspaceId]/reviews/[id]/_components/review-detail-manager.tsx`,
  and `src/app/admin/verifications/[verificationId]/page.tsx`. A small
  shared `CheckCard` enhancement carries most of the work.
