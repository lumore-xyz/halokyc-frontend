# Frontend Changelog

**Context:** [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) (phases) · [`TODO.md`](TODO.md) (task status) · [`frontend/DECISIONS.md`](DECISIONS.md) (ADRs behind each change) · [`API_CONTRACTS.md`](API_CONTRACTS.md) (changed endpoints) · [`COMPLIANCE.md`](COMPLIANCE.md) (compliance surface changes)

## [Unreleased]

### Added
- Desktop-to-mobile verification handoff. When a non-mobile device lands on
  `/verify?verification_id=...` and the session is still `pending_upload`,
  the intro step now shows a modal with two paths: "Use this device"
  (closes the modal and proceeds with the desktop capture flow) or
  "Open on mobile" (renders a QR code pointing at the same verify URL and
  polls the existing `GET /api/v1/verifications/{id}` endpoint in the
  background; on a terminal status the modal hides and the standard
  `VerifyResultStep` renders). Detection is SSR-safe in
  `src/app/verify/_hooks/use-is-mobile.ts`; the QR URL is built by
  `src/app/verify/_lib/build-verify-url.ts`, rendered through the `qrcode`
  library, and the modal lives in
  `src/app/verify/_components/desktop-handoff-modal.tsx`. No backend
  changes (see ADR-F029).
- Completed Google OAuth sign-in wiring: the callback now exchanges the
  authorization code with the backend, stores the unified auth payload, sends
  Google-only users through a token-scoped company setup screen, and returns to
  the shared `/select-account` flow to set the final httpOnly client cookie.
- Clarified `/admin/retention` copy so operators see the current behavior:
  global scheduled retention removes expired evidence files, eligible face
  embeddings, and webhook logs; scoped policies can be stored, but the current
  purge job applies the global policy.
- Phase 10 automation-efficiency UI:
  - Timeout recovery is now typed on `VerificationDetail` and rendered with a shared banner plus per-check timeout badges on workspace session detail, workspace review detail, and platform verification detail.
  - Duplicate policy traceability now includes typed `duplicate_session_id` / `duplicate_match_kind` fields, duplicate check badges, previous-session deep links, and review-queue policy badges.
  - `CheckCard` now renders `document_quality` with dedicated readability, image-quality, missing-region, tamper, retry, confidence, and provider fields, and the platform verification page uses the shared check-card renderer.
  - Workflow designer now lets owner/admin users configure `auto_decide_confidence_threshold` for `auto_decide` workflows, validates 0.0-1.0 input, sends the field in create/update payloads, and displays saved/default threshold state on workflow cards.
  - Added `/api/admin/metrics/automation` as a thin admin BFF for the backend automation aggregate, typed the API client response/filter shapes, and added workspace analytics cards for manual review rate, top review factor, timeout recovery success, and duplicate policy coverage with date-range/workflow filters.
- Synced `frontend/TODO.md` with the actual state of the codebase as of
  2026-07-03. Marked the workflow agentic mode picker, the URL-backed
  agent mode + recommendation filters on the verifications table, and
  the platform admin AI failure / budget fallback widgets as complete
  (each had landed under the prior "Production hardening for agentic
  rollout controls" entry but the TODO was still listing them as
  pending). Added audit notes for Phase 10.1-10.4 and 10.6 with the
  exact file references where the next agent should resume work
  (`VerificationDetail` types in `src/lib/api-client.ts`,
  `orderedCheckKeys()` in `src/components/check-card.tsx`, the
  workflow designer, and the workspace analytics panel). 10.5
  client_metadata is already shipped via `StartVerificationCard`. No
  new code was added in this change.
- Compliance surface (per `.agents/context/COMPLIANCE.md`):
- `ConsentCard` in `/verify` gates biometric capture. The state machine
gains a new `consent` step between `intro` and the first biometric
instruction. The card collects an explicit, non-pre-ticked opt-in
checkbox, a policy-version audit (typed as `ConsentRecord`), and a
`useConsentRecord` hook that persists the record in `sessionStorage` so
a tab refresh does not silently drop the user's choice. Document-only
workflows skip the step. Recorded as ADR-F024.
- Cookie consent banner on the landing page (`/`) with two categories
(`essential` always on, `analytics` opt-in), a versioned
`halokyc.cookieConsent` localStorage key, a `useCookieConsent` hook,
and a `Customize` affordance for per-category toggles. Banner never
pre-ticks analytics. Recorded as ADR-F025.
- `/privacy/dashboard` subject-facing surface is now live. Backend
BFF routes (`/api/privacy/summary`, `/api/privacy/requests`) and the
`usePrivacySummary` / `usePrivacyRequests` hooks are active; the page
renders an auth-gated PIN form when the scoped subject token is absent.
Recorded as ADR-F026.
- `/admin/dsr` queue + export approval and `/admin/retention`
configuration are live. Typed contract in `src/lib/compliance-admin.ts`
and `src/lib/hooks/use-compliance-admin.ts` with active query/mutation
hooks; admin sidebar entries are role-gated to `platform_owner` and
`platform_business_admin`. Recorded as ADR-F026.
- Added retention configuration page (`/admin/retention`) with form-
driven global + per-client overrides, updates via `PUT`, and effective-
policy resolution wired through `/api/admin/retention/effective`.
- Added DSR management page (`/admin/dsr`) with filterable request list,
Approve / Reject actions, export-approval visibility, and empty / error
states.
  - New `src/components/ui/checkbox.tsx` shadcn primitive wrapping
    `@base-ui/react/checkbox` (used by both `ConsentCard` and the cookie
    banner). Style mirrors the existing `field.tsx` patterns.
  - `frontend/AGENTS.md` (the file the root `AGENTS.md` already
    referenced) with the Next.js 16 reminders, plus an explicit pointer
    to the compliance contract docs.
- Synced `.agents/context/COMPLIANCE.md` tracker: marked the
  privacy policy, terms, data retention, and verify-screen privacy
  notice as shipped, recorded the four new compliance items as
  implemented or stubbed, and added contract to `.agents/context/COMPLIANCE.md` §"Future API Contract"
  with the contract the backend must ship.

### Production hardening for agentic rollout controls:
  - Workflow designer now persists `agentic_mode` (`disabled`, `shadow`,
    `assist_review`, `auto_decide`) instead of rendering the mode picker as a
    disabled preview, and workflow cards show the saved effective mode.
  - Verification activity tables now expose URL-backed agent mode and agent
    recommendation filters, with typed API-client support for customer and
    platform activity requests.
  - Platform overview now includes role-gated agentic monitoring cards for
    provider failure rate, budget fallback, invalid output fallback, and
    auto-decision volume, with time-window, organization, workspace, mode, and
    recommendation scoping.
  - Added a thin `/api/admin/metrics/agentic` BFF route for the existing
    backend aggregate endpoint.
- Added `auto_decide_confidence_threshold` field to shared `Workflow` API type for confidence-based auto-decide expansion (backend feature flag visibility).
- Workflow API type support for `auto_decide_confidence_threshold` so the
  dashboard client stays aligned with confidence-based auto-decide rollout
  contracts.
- Document quality retake flow: `/verify` now understands
  `requires_user_action: retake_document`, resets document captures, and shows
  neutral retake copy without model or billing language. Shared API types now
  include `DocumentQualityCheckResult` and `VerificationUserAction`.
- Platform AI provider deletion controls: platform owners can delete a provider
  or one encrypted API key from `/admin/ai-providers`, through typed BFF routes,
  React Query mutations, and destructive confirmations.
- Platform AI provider key smoke test control: each provider key can be tested
  from `/admin/ai-providers`, showing success/error feedback without exposing
  raw credentials.
- Credit backlog UI support: added the `awaiting_credits` status to shared
  API types, status labels, status pills, cadence/analytics/session filters,
  platform verification filters, and neutral `/verify` handling for sessions
  waiting to resume.
- Planned workspace subject lifecycle controls: `/dashboard/[workspaceId]/subjects/[externalUserId]`,
  owner/admin reset and full-delete actions, soft/permanent ban create/update
  drawer, reviewer read-only ban context, BFF/API-client work, and ADR-F023
  for destructive confirmations and ban-retention copy.
- **Agentic adjudication UI**:
  - Added `AgentRecommendationPanel` for workspace review detail, workspace
    session detail, and platform verification detail pages. It renders the
    structured verdict, confidence, reason-code labels, fallback state,
    deterministic-vs-agent comparison, safe evidence references, and privileged
    provider metadata without exposing prompts or hidden evidence.
  - Added disabled workflow-mode controls for `disabled`, `shadow`,
    `assist_review`, and `auto_decide` with cost/safety copy while workflow
    persistence waits for a backend contract.
  - Added a default-on workflow `auto_decide_allowed` switch that sends the
    workflow-level auto-decision gate in create/update payloads and displays
    the saved state on workflow cards.
  - Added workspace shadow-rollout analytics cards for agreement rate,
    manual-review deflection estimate, fallback count, and average provider
    latency from recent verification detail payloads.
  - Added formatter coverage for agent reason/fallback labels and a focused
    component test for the recommendation panel.
- **Billing reserved sessions** (`/dashboard/billing`): added a reserved
  sessions table that shows the verification/session ID, workspace, status,
  reserved amount, reservation time, and auto-release time for credits that
  are currently held.
- **Verification Flow Redesign** (`/verify`):
  - New instruction pages before each capture group: `VerifyStepSelfieInstruction` and `VerifyStepDocumentInstruction` with camera-only guidance, natural expression tips, good lighting advice, and document preparation checklists (four corners, no glare, no fingers, dark surface).
  - Dual URL support in `page.tsx`: `?verification_id=<uuid>` to resume existing sessions, `?workflow_id=<uuid>` to start new sessions.
  - State machine updated with instruction steps: `selfie_instruction`, `document_front_instruction`, `document_back_instruction` — each with dedicated UI, progress tracking, and transitions.
  - Backend-driven step sequence via `GET /api/v1/verifications/{id}/config` — consumes `VerificationConfig` with `VerifyStepConfig[]` (step, title, description, camera_only, facing_mode, frame_type, optional).
  - `VerifyCameraCanvas` now supports `frameType` prop: oval (selfie/liveness) and rectangle (document) with new `DocumentFrame` component.
  - Camera-only enforcement: `cameraOnly={true}` for selfie/liveness hides upload fallback; `cameraOnly={false}` for document allows camera + upload.
  - Progress bar accounts for instruction steps across all workflow combinations.
  - Updated `VerifySelfieStep` and `VerifyDocumentStep` to accept `cameraOnly`, `frameType`, `instructionPill` props from step config.
  - 12 updated state machine tests covering instruction step flow.
- **API Client** (`src/lib/api-client.ts`):
  - Added `VerificationConfig`, `VerifyStepConfig` types.
  - Added `getVerificationConfig(verificationId)` method.

### Changed
- `verification-flow.tsx` rewritten as a `useReducer` over the state machine;
  the previous single combined upload call is preserved (no new backend
  endpoints).
- `verify/page.tsx` slimmed down to mount `VerificationFlow` and the
  missing-workflow notice; no more `<SiteHeader>`.

### Design System
- New verify-shell styles appended to `globals.css`:
  `.verify-shell-backdrop` (radial-gradient dotted mesh, soft mask),
  `.verify-card` (card surface with the marketing shadow token),
  `.verify-step-enter` (≤ 150ms fade per ADR-F007).
- No new color tokens — terminal copy uses the existing
  `--status-approved-*`, `--status-review-*`, and `--status-rejected-*`
  status pill pairings from `globals.css`.

### Changed
- **Typography**: Replaced `Instrument Serif` with `Space Grotesk` as the
  display family, and `Geist Mono` with `JetBrains Mono` for the mono
  family. The product UI font stays `Inter`. The change supports the
  "controlled challenger" archetype (Outlaw + Control) by switching
  from an editorial serif heading voice to a sharp, technical,
  anti-abuse sans voice. The change is invisible to consumers of the
  existing `font-serif` Tailwind utility because `--font-serif` is now
  an alias of `--font-display`; landing pages re-render with the new
  face without a component diff. Recorded as ADR-F020.

### Added
- **Platform Admin Console** (`/admin`):
  - Role-aware sidebar with an "Operator" group filtered by platform role
    (owner / business admin / support / sales) plus a legacy "Admin" group
    (`clients`, `ledger`, `review queue`).
  - Admin overview (`/admin`) showing organization count, available credits,
    verification totals, webhook delivery health, latest audit events, and
    quick links.
  - Organizations list (`/admin/organizations`) with status filter and a new
    organization detail page (`/admin/organizations/[organizationId]`)
    covering profile, status toggles, billing snapshot, workspaces, and a
    manual credit-adjust form.
  - Workspaces list (`/admin/workspaces`) with status filter and workspace
    detail page (`/admin/workspaces/[workspaceId]`).
  - Verifications list (`/admin/verifications`) with status + external-user
    search plus a verification detail page (`/admin/verifications/[verificationId]`)
    with check breakdown, risk summary, audit trail, and approve/reject
    actions for the platform review queue.
  - Billing & credits (`/admin/billing`) with organization filter, balance
    cards (available / reserved / total / per-bucket), and a full ledger
    table including reserved deltas per row.
  - Support hub (`/admin/support`) with three sub-tabs: webhook logs,
    error logs, and support notes (operator note capture attached to a
    verification id).
  - Sales hub (`/admin/sales`) with customer roster (plan + available
    credits), plan distribution breakdown, sales-note capture box, and
    organisation selector for note attribution.
  - Platform admins management (`/admin/platform-admins`, owner only)
    with invite + role/status/full-name mutation and last-active-owner
    guard surfaced as a destructive alert.
  - Audit logs (`/admin/audit-logs`) covering platform-wide actions with
    diff columns for old/new JSON payloads.
  - System settings (`/admin/system-settings`, owner only) for the credit
    cost per verification and JWT access token TTL.
  - New `<PlatformRouteGuard>` component and `<PlatformAccessDenied>`
    shared state. Every page renders an explicit "role denied" or
    unauthenticated state when the cookie role is missing or wrong.
- New BFF routes under `/api/admin/{organizations,workspaces,verifications,
  billing/credits,billing/credits/adjust,support/webhook-logs,
  support/error-logs,support/notes,sales/customers,sales/notes,
  platform-admins,platform-admins/invite,platform-admins/[id],
  audit-logs,system-settings}`.
- New platform role types (`PlatformRole`, `PlatformAdminUser`,
  `PlatformAdminInviteRequest`, `PlatformAdminUpdateRequest`,
  `AdminSystemSettings`, `AdminOrganizationRead`,
  `AdminOrganizationUpdateRequest`, `AdminCreditAdjustmentRequest`,
  `AdminWebhookDelivery`, `AdminErrorLog`, `AdminSalesCustomer`,
  `AdminSalesNoteRequest`, `AdminSalesNoteResponse`,
  `AdminSupportNote`, `AdminSupportNoteRequest`) mirrored from the
  backend OpenAPI.
- Backend supports notes endpoints + schemas
  (`GET /admin/support/notes`, `POST /admin/support/notes`) so the
  support hub can list and create platform support notes (audit rows
  tagged `platform_admin_support_note_created`).
- **Organization Billing & Usage** (`/dashboard/billing`): owner and admin only.
  - Org-level credit balance surfaces available, reserved, free, and combined subscription + purchased buckets.
  - Full ledger table with workspace attribution column and a workspace filter (all workspaces or one specific workspace).
  - Every entry type (`signup_bonus`, `free_top_up`, `subscription_grant`, `purchase`, `reservation`, `settlement`, `release`, `adjustment`) renders with both an operator-friendly label and the underlying type description.
  - Reserved-bucket deltas are now shown alongside the free, subscription, and purchased columns so reservation, settlement, and release rows are easy to read.
  - Backend organization credits accept a `workspace_id` query parameter; the `CreditLedgerEntryRead` schema now exposes `workspace_id` for client and admin endpoints.
  - Frontend BFF (`/api/client/me/credits`) forwards to the organization-scoped backend credits route for the current org-member token.
  - Removed the redundant `/dashboard/[workspaceId]/usage` page; usage attribution is now a single source of truth under `/dashboard/billing`.
- **Customer Role-Based UI**:
  - Role-filtered sidebar driven by `useNavGroups(audience, { role })`. Owner/admin/reviewer/developer each see the spec'd subset of sidebar entries; developers never see sensitive surfaces like Audit logs or Team.
  - New role-aware nav config (`components/dashboard/app-nav-config.ts`) with `roles` and `scope` fields. Workspace-scoped entries are rewritten by the active workspace id; organization-scoped entries (Team, Workspaces, Billing, Settings) keep their URL.
  - `<RouteGuard>` and `<OrganizationRouteGuard>` components handle 401, 403, disabled-account, disabled-workspace, and disabled-organization states per page. Backend 403s are authoritative.
  - Reusable unauthorized/disabled state components under `components/dashboard/route-access.tsx`.
- **Team Management** (`/dashboard/team`): list, invite, change role, disable/re-enable members. Restricted to owner/admin via the route guard. Drawer mirrors the workflow / API key forms.
- **Workspace Management** (`/dashboard/workspaces`): list, create, edit workspaces. Restricted to owner/admin. Auto-navigates the creator into the new workspace.
- **Organization-Level Routes** (owner/admin only):
  - `/dashboard/team` — invite teammates and change roles.
  - `/dashboard/workspaces` — manage workspaces from the organization context.
  - `/dashboard/billing` — organization-level credit balance surface.
- **Workspace Operations** (new workspace-scoped pages):
  - `/dashboard/[workspaceId]/webhooks` — list/add webhook endpoints with HMAC-signed payloads.
  - `/dashboard/[workspaceId]/analytics` — status count breakdown for owner/admin.
  - `/dashboard/[workspaceId]/audit-logs` — paginated audit log surface for owner/admin.
  - `/dashboard/[workspaceId]/integration-logs` — developer-only activity view.
  - `/dashboard/[workspaceId]/docs` — workspace-aware quickstart guide.
  - `/dashboard/[workspaceId]/reviews/assigned` — reviewer-only "Assigned reviews" tab.
  - `/dashboard/[workspaceId]/reviews/completed` — reviewer-only "Completed reviews" tab.
- **Sensitive Evidence Viewer**: `EvidenceViewer` in the session detail page renders uploaded files via the workspace BFF when the role is owner/admin/reviewer. Developers see a clear "Hidden by role" panel instead.
- **Proxy Allow-List**: organization-scoped paths (`/dashboard/team`, `/dashboard/workspaces`, `/dashboard/billing`, `/dashboard/settings`) bypass the legacy "non-UUID workspace" redirect.
- **Backend Endpoints**:
  - `GET /api/v1/organizations/{organization_id}` and `GET /api/v1/organizations/{organization_id}/members` listing the caller's organization and members.
  - Frontend BFF: `/api/client/organizations/[organization_id]`, `/api/client/organizations/[organization_id]/members`, `/api/client/organizations/[organization_id]/members/[member_id]`, `/api/client/workspaces/[workspace_id]/webhooks`, `/api/client/workspaces/[workspace_id]/audit-logs`, `/api/client/workspaces/[workspace_id]/analytics`, `/api/client/workspaces/[workspace_id]/verifications/[verification_id]/files/[file_id]`.
- **Workspace-Scoped Dashboard**:
  - Implemented dynamic routing via `[workspaceId]` for all core dashboard surfaces.
  - Added workspace selection/redirect logic at `/dashboard`.
  - Refactored Overview, Workflows, API Keys, Reviews, and Sessions pages to be workspace-scoped.
  - Developed detailed view managers for sessions and reviews within the workspace context.
- **Workspace Switcher**: `AppWorkspaceSwitcher` rendered in the sidebar for the client audience — shows current org + workspace, lists all member workspaces, switches via URL state (`/dashboard/[workspaceId]`). Reads from `useWorkspaces` + new `useClientProfile` hook.
- **Workspace-Scoped BFF Routes**: Added 6 missing Next.js route handlers under `/api/client/workspaces/[workspace_id]/...` that proxy to the backend workspace-scoped endpoints — `verifications`, `verifications/summary`, `verifications/[verification_id]`, `reviews`, `reviews/[verification_id]`, and the new `reviews/[verification_id]/decision` (POST). Eliminates the `404 Not Found` errors that surfaced when navigating the dashboard.
- **Unified Authentication**: Implemented single-identity login flow, including `/login` and `/select-account` pages, `apiClient` updates, and BFF routes for secure `httpOnly` token exchange.
- **Platform Admin Portal**:
  - Rebuilt `/admin` into a client-management portal with phase tracking and member management.
  - Integrated Admin Review Queue for platform-wide verification decisions.
- **Marketing & Branding**:
  - Redesigned landing page around a "verification case file" motif with custom CSS animations.
  - Implemented brand logo system and a refreshed Dashboard chrome (warm paper palette).
- **Core Infrastructure**:
  - Established BFF proxy pattern for secure session management.
  - Integrated React Query for server-state caching and polling.
  - Added route error boundaries and a comprehensive accessibility/motion sweep.

### Changed
- **Settings** (`/dashboard/settings`): renamed the page title to
  "Settings" and added editable contact person name and phone number fields
  backed by `/api/client/me`.
- **Workspace Audit Logs** (`/dashboard/[workspaceId]/audit-logs`): replaced
  the stacked event list with a searchable, sortable table for action,
  old payload, new payload, and created time.
- **Verification capture screens**: selfie and document capture now use an
  immersive camera surface capped inside the viewport, with title, guidance,
  frame, shutter/upload controls, and `Secured by HaloKYC` rendered as overlays
  on the camera view. The shared verify shell is capped at `100dvh` to prevent
  `/verify` screens from exceeding viewport height.
- **API Console** (`/dashboard/[workspaceId]/console`): the gate now reads workspace-scoped API keys via `useWorkspaceApiKeys(workspaceId)` instead of the legacy `useMyApiKeys`, surfaces the live/test environment for every active key in the authorize sheet, and points the empty state to the workspace API keys page. The start-verification card now lists workspace workflows and redirects to `/dashboard/[workspaceId]/sessions/[verification_id]`. Recent sessions also resolve to the workspace session detail page.
- **API Key Manager**: API key rows now expose an `Environment` column with a live or test badge; the create sheet adds a live/test radio group that maps to `environment: "live" | "test"` on the create payload.
- **Review Decision API**: Replaced `apiClient.approveWorkspaceReview` + `rejectWorkspaceReview` with a single `apiClient.submitWorkspaceReviewDecision({ decision: "approve" | "reject", reason?, notes? })` matching the backend's unified `POST /workspaces/{id}/reviews/{vid}/decision` endpoint. Updated `review-detail-manager.tsx` to use the new method.

### Fixed
- `/verify` now ignores `callback_url` query values and no longer redirects
  the browser to caller-supplied URLs from submitted or terminal states. The
  backend `callback_url` remains server-to-server webhook configuration only.
- Admin BFF proxy now mirrors backend `204 No Content` responses without
  attempting to parse JSON, fixing platform AI provider/key deletion routes
  that previously surfaced as frontend 500s after successful backend deletes.
- **Workspace review detail evidence**: `/dashboard/[workspaceId]/reviews/[id]`
  now loads the full workspace verification detail alongside the review detail,
  renders captured evidence through the shared workspace evidence viewer, and
  shows the session audit log on the review screen. Review decisions now
  invalidate both review and verification caches.
- **Client profile BFF** (`/api/client/me`): `GET` now supports the current
  organization-member client JWT by composing the legacy profile response from
  organization and member endpoints, instead of proxying to the legacy
  `/api/v1/me` route that requires old client-user token claims.
- **Client credits BFF** (`/api/client/me/credits`): now supports the current
  organization-member client JWT by forwarding to the organization-scoped
  credits endpoint.
- **Verification session reuse**: `/verify` now reads the session `status` from
  the public config response. Reopened links for `processing` sessions render
  the submitted/thank-you receipt immediately, and terminal sessions render the
  final result instead of letting the user repeat the capture flow.
- **Verification completion UX**: after evidence upload succeeds, `/verify` now
  shows a friendly submitted/thank-you screen instead of making users wait on
  the backend review polling screen. The new state explains that photos were
  received, checks continue in the background, and the requesting service will
  receive the result when ready.
- **Verification deep-link flow**: `/verify` is now driven by
  `verification_id` only. Removed the old workflow-id start/setup path from the
  verify page, and the intro step now enables Continue from the already-loaded
  `GET /api/v1/verifications/{id}/config` response instead of waiting for a
  separate workflow fetch.
- **Workspace session detail upload**: sessions in `pending_upload` status now show an `Upload documents` panel inside `/dashboard/[workspaceId]/sessions/[id]`. Owners, admins, and developers can authorize a workspace API key (sessionStorage, cleared on tab close) and upload the selfie and ID photos without leaving the dashboard. Reviewers see no upload panel (their role does not allow it). The upload mutation invalidates `workspace-verification`, `workspace-verifications`, `workspace-verification-summary`, and `workspace-analytics` queries so the session detail, activity list, overview cadence, and analytics refresh once the upload settles.
- **Workspace session detail polling**: `/dashboard/[workspaceId]/sessions/[id]` now polls the workspace verification endpoint every `NEXT_PUBLIC_VERIFICATION_POLL_MS` (default 2500 ms) while the status is non-terminal. Polling stops automatically on `approved`, `rejected`, or `manual_review`, when the browser tab is hidden, and on unmount. A `Refresh` button next to the status pill forces an immediate refetch, and a subtle `Polling` chip next to the status pill makes the background refresh visible.
- **Workspace Switcher Dropdown Crash**: `AppWorkspaceSwitcher` was rendering shadcn `DropdownMenuLabel` (which is `MenuPrimitive.GroupLabel` under the hood) outside a `DropdownMenuGroup` ancestor. Base UI threw `MenuGroupContext is missing`, which propagated to the dashboard's `error.tsx` and rendered the "Dashboard unavailable" state on every workspace-scoped page. Wrapped each labelled section in `DropdownMenuGroup`.
- **Sidebar URLs Missing Workspace ID**: The static nav config (`APP_NAV_GROUPS`) referenced `/dashboard/<feature>` without a workspace ID segment. Clicking any sidebar item caused Next.js's `[workspaceId]` catch-all to match the feature name as the workspace, leading to 422 errors from the backend (e.g. `api/client/workspaces/usage/...` → 422). Added `useNavGroups(audience)` hook that rewrites each item URL to `/dashboard/<active-workspace>/<feature>` based on the current pathname; sidebar nav renders no client items when no workspace is active. Result: 6+ console 422 errors gone.
- **Proxy Redirect for Legacy URLs**: Added a guard in `proxy.ts` that 302-redirects `/dashboard/<non-uuid>/...` to `/dashboard`, so any stale bookmark, dead inline link, or external URL pointing at the legacy routes resolves to the workspace picker instead of rendering with a fake workspace ID.
- **Dead Legacy Inline URLs**: Replaced 7 inline `href` strings that pointed at legacy `/dashboard/console/...` and `/dashboard/workflows` paths with their workspace-scoped or public-sandbox equivalents (`/dashboard/${workspaceId}/console`, `/console/verifications/...`, etc.).

### Design System
- Rewrote §"Planned Workspace And Role Navigation" in `DESIGN_SYSTEM.md`
  into §"Workspace Switcher" + §"Role-Filtered Navigation" so the docs
  mirror the implemented `AppWorkspaceSwitcher`, `useNavGroups`,
  customer (`RouteGuard`, `OrganizationRouteGuard`, `RouteAccessDenied`,
  `DisabledAccountState`, `WorkspaceDisabledState`) and platform
  (`PlatformRouteGuard`, `PlatformAccessDenied`) guards, and the
  role-aware sidebar reference tables for both audiences.

### Quality
- Added `src/lib/hooks/use-nav-groups.test.ts` (10 cases) covering
  audience filter, role filter, workspace-id URL rewrite,
  organization-scope preservation, and the `navItemBelongsToRole`
  helper. Vitest total now 63 tests across 14 files.
- Resolved 6 ESLint errors (4 unescaped quote characters in `dashboard`,
  `privacy`, `terms` pages; `catch (e: any)` in `unified-login-form`).
  All three frontend gating commands (`tsc --noEmit`, `eslint src`,
  `vitest run`) now exit 0.

---

## [0.1.0] - 2026-06-21

### Added
- **Frontend Foundation**:
  - Initialized Next.js 16 project with App Router and TypeScript.
  - Implemented core AppShell, navigation sidebar, and layout patterns.
  - Established base dashboard surfaces for verification monitoring and client management.

---

## Changelog Rules

Whenever code changes:
1. Update `CHANGELOG.md`.
2. Update `DECISIONS.md` if architecture changed.
3. Update `API_CONTRACTS.md` if the API changed.
4. Update `DESIGN_SYSTEM.md` if the design changed.
