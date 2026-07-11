# DECISIONS.md

# Architecture Decision Records - Frontend

**Navigate:** [`TODO.md`](TODO.md) for implementation status · [`frontend/ARCHITECTURE.md`](ARCHITECTURE.md) for system layout · [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) for token/primitive decisions · [`API_CONTRACTS.md`](API_CONTRACTS.md) for contract changes · [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) for business context · [`COMPLIANCE.md`](COMPLIANCE.md) for compliance-surface ADRs (ADR-F024–F026)

This document tracks the "why" behind the HaloKYC frontend. Decisions are grouped by functional area to provide a high-level overview while maintaining the integrity of the individual ADRs.

---

## Framework & State
*The core technology choices for rendering, routing, and server-state management.*

### ADR-F001: Use Next.js 16 (App Router) with React 19 Server Components
**Status**: Accepted
**Reason**: Needs to ship three surfaces (developer console, end-user capture, operator review) sharing a design system and API client. Next.js App Router provides file-system routing, Server Components for static shells, and built-in optimizations.
**Rules**:
- Default to Server Components. Use `"use client"` only where state/effects are needed.
- Pages render the shell on the server and hydrate Client Component panes.
- MVP does not use Server Actions for data fetching; use `apiClient`.
**Date**: 2026-06-22

---

### ADR-F002: Defer a client-side state library until a second consumer appears
**Status**: Accepted
**Reason**: MVP has minimal shared state (API key). Local state, `sessionStorage`, and URL state are sufficient. Avoids premature lock-in to a state library.
**Rules**:
- Do not introduce Redux, Zustand, etc., in MVP.
- Cross-route state lives in custom hooks backed by `sessionStorage` or root context.
**Date**: 2026-06-22

---

### ADR-F012: Use `@tanstack/react-query` as the single server-state cache
**Status**: Accepted
**Reason**: Handles cache, retries, polling cadence, and mutation lifecycles without crossing into UI state. Provides `refetchInterval` for verification polling (ADR-F005).
**Rules**:
- One `QueryClient` singleton in `src/lib/query-client.ts`.
- Feature hooks in `src/lib/hooks/` are the only call sites for `useQuery` / `useMutation`.
- Not a global state store; UI state still follows ADR-F002.
**Date**: 2026-06-23

---

## Security & Authentication
*Handling sensitive credentials and protecting authenticated routes.*

### ADR-F003: Store the developer API key in `sessionStorage`, never `localStorage`
**Status**: Accepted
**Reason**: API keys are long-lived bearer credentials. `sessionStorage` scopes the key to the tab and clears it on close, reducing XSS risk.
**Rules**:
- Lives under `halokyc.apiKey`. Read via `useApiKey()` hook.
- Never logged or reflected in URL state.
- Console redirects home on 401, prompting for a fresh key.
**Date**: 2026-06-22

---

### ADR-F004: Proxy admin auth through a Next.js route handler with an httpOnly cookie
**Status**: Accepted
**Reason**: Admin JWTs are high-value. Moving the JWT from JS storage to an `httpOnly` cookie via a thin proxy handler prevents XSS-based theft.
**Rules**:
- `/api/admin/login` sets the `halokyc_admin` cookie.
- `DELETE /api/admin/login` clears it.
- `apiClient` uses `credentials: 'include'` for admin calls.
**Date**: 2026-06-22

---

### ADR-F013: Mirror the admin BFF pattern for client-user auth and self-service
**Status**: Accepted
**Reason**: Reuses the admin proxy pattern for client users to ensure consistent security (httpOnly cookies) and simplified forwarding of `Authorization: Bearer` headers.
**Rules**:
- `src/lib/client-proxy.ts` manages the `halokyc_client` cookie.
- `/api/client/login` and `/api/client/session` handle auth.
- `/dashboard` reads cookie server-side via `cookies()` and redirects if missing.
**Date**: 2026-06-23

---

## UI & Design System
*Visual guidelines, component libraries, and layout patterns.*

### ADR-F006: Adopt shadcn/ui (`base-nova`) as the only component source
**Status**: Accepted
**Reason**: High-quality primitives as source code. Allows ownership of variants via CVA and keeps bundles small by avoiding a runtime library.
**Rules**:
- `src/components/ui/` is the only folder allowed to import `@base-ui/react`.
- New primitives added via `pnpm shadcn add`.
- Variants are extended via CVA, never by forking components.
**Date**: 2026-06-22

---

### ADR-F007: Default to no animations; respect `prefers-reduced-motion`
**Status**: Accepted
**Reason**: Brand is calm and evidence-driven. Excessive animation reads as "AI-generated" and undermines auditability.
**Rules**:
- No animation on state change beyond 150ms.
- Use Tailwind `motion-safe:` and `motion-reduce:` utilities.
**Date**: 2026-06-22

---

### ADR-F010: Ship light theme only in MVP
**Status**: Accepted
**Reason**: Focuses review on the three MVP flows. Palette uses `oklch` to make a future dark theme a simple token swap.
**Rules**:
- `next-themes` is wired but forced to `light` in MVP.
- All colors use `oklch` in `globals.css`.
**Date**: 2026-06-22

---

### ADR-F014: Adopt a shared AppShell with collapsible sidebar for dashboard routes
**Status**: Accepted
**Reason**: As the product expands to a multi-surface platform, a sidebar provides better navigation and consistent UX across roles (Client vs. Admin).
**Rules**:
- Use `AppShell` for all authenticated routes.
- Public routes retain `SiteHeader` + single-column layout.
- Sidebar state persisted via `sidebar_state` cookie.
**Date**: 2026-06-23

---

### ADR-F015: Use drawers for authenticated create/edit forms that collect user input
**Status**: Accepted
**Reason**: Operational surfaces should remain stable. Drawers allow users to create/edit records while keeping the list context visible.
**Rules**:
- Open a drawer/sheet for any authenticated action requiring user input.
- Compose from shadcn `Sheet` and form primitives.
- Exception: One-time raw API key display remains in the post-submit state.
**Date**: 2026-06-25

---

## API & Integration
*Communication patterns between the frontend and the backend.*

### ADR-F005: Use polling, not websockets, for verification status
**Status**: Accepted
**Reason**: Backend uses Celery workers with no native push channel. Polling every 2.5s is sufficient for MVP and keeps the frontend stateless.
**Rules**:
- `useVerification(id)` polls every `NEXT_PUBLIC_VERIFICATION_POLL_MS` (2500ms).
- Stops on terminal status or tab visibility change.
**Date**: 2026-06-22

---

### ADR-F008: Use a single typed `apiClient` for every backend call
**Status**: Accepted
**Reason**: Mirrors the versioned backend contract in TypeScript. Provides a single place for auth, error parsing, and retries.
**Rules**:
- `src/lib/api-client.ts` is the only file that calls `fetch`.
- Every route has a typed wrapper.
- Errors throw `ApiError`, handled via `error.tsx` or inline banners.
**Date**: 2026-06-22

---

## Testing & Quality
*Strategy for ensuring reliability and visual consistency.*

### ADR-F009: Use vitest + Testing Library + msw for unit and integration tests
**Status**: Accepted
**Reason**: Vitest is fast and ESM-native. `msw` mocks the network layer, ensuring the `apiClient` wrapper is tested realistically.
**Rules**:
- Unit tests next to files; integration tests in `src/test/`.
- Every shared hook must have happy-path and failure-path tests.
- No snapshot tests for shadcn; assert on variant class names.
**Date**: 2026-06-22

---

### ADR-F011: Defer Storybook and per-component unit tests
**Status**: Accepted
**Reason**: Storybook setup cost is high for <10 primitives. Per-component tests are too expensive for the return; most bugs are caught at integration boundaries.
**Rules**:
- F2 ships without Storybook.
- Critical-path tests only: `apiClient`, `useVerification`, and pure helpers.
- Component coverage comes from Playwright E2E sweeps (Phase F6).
**Date**: 2026-06-23

---

## Product Experience
*Layout and workflow decisions for the end-user and operator.*

### ADR-F016: Move the API console inside the client dashboard
**Status**: Accepted
**Reason**: Integrates the integration journey. Housing the console under `/dashboard/console` keeps policy selection and API key management in one workspace.
**Rules**:
- `/dashboard/console` is the canonical route.
- Uses client `AppShell` and requires client session cookie.
**Date**: 2026-06-25

---

### ADR-F017: Make the customer console workspace-first and role-filtered
**Status**: Accepted
**Reason**: Customers operating multiple products need separated operational data (workflows, sessions) while sharing organization-level billing.
**Rules**:
- Use dynamic route segments `/dashboard/[workspaceId]/...` to anchor the workspace context in the URL.
- `/dashboard` acts as the entry point for workspace selection and redirection.
- Sidebar and page content are filtered by the active workspace and the user's role.
**Date**: 2026-06-28

---

### ADR-F018: Keep the navigation the only source of role hints; render explicit role-denied states on every page
**Status**: Accepted
**Reason**: Customer roles (`client_owner`, `client_admin`, `client_reviewer`, `client_developer`) are fixed in code, but the existing nav and per-page logic does not actually enforce role access. Hidden nav items alone are insufficient: a user typing a URL or a stale bookmark must see a calm explanation rather than a stack trace or a blank page.
**Rules**:
- `useNavGroups(audience, { role })` filters nav entries by their `roles` allow-list; entries without `roles` are visible to everyone.
- Every workspace route is wrapped in `<RouteGuard workspaceId={...} allowedRoles={...}>`; the guard surfaces 401/403/disabled-account/disabled-organization/disabled-workspace states without crashing.
- Backend 403s remain authoritative: the guard renders the same unauthorized state regardless of whether the frontend filter or the backend rejected the call.
- Sensitive KYC evidence (selfie, ID images) is hidden from `client_developer` by default; the `EvidenceViewer` shows a "Hidden by role" panel for developers and renders images via the workspace BFF for owner/admin/reviewer.
- Organization-scoped pages (`/dashboard/team`, `/dashboard/workspaces`, `/dashboard/billing`, `/dashboard/settings`) use `<OrganizationRouteGuard>` instead of the workspace-scoped variant; they live alongside workspace pages but are not subject to workspace-id rewriting.
**Date**: 2026-06-28

---

### ADR-F019: Mirror the admin RBAC contract on the platform surface
**Status**: Accepted
**Reason**: Platform admins also need role-segregated navigation and route guards. Customer-side `RouteGuard` and `OrganizationRouteGuard` are scoped to the organization/workspace hierarchy and would either surface the wrong copy or hold the wrong session. The platform surface is logically separate, so its own guard sits next to the customer variants and operates on `PlatformRole`.
**Rules**:
- `useNavGroups(audience, { role, platformRole })` filters entries that declare a `platformRoles` allow-list. Customer entries are hidden when an admin session is active, and platform entries are hidden for unauthenticated previews.
- `AppSidebar(audience="admin")` reads `useAdminSession().data?.platformRole` and forwards it to the filter.
- Every `/admin/**` route is wrapped in `<PlatformRouteGuard allowedRoles={...}>` which renders `<PlatformAccessDenied>` (a calm `EmptyState` keyed off the same role matrix) on 401, role mismatch, or 403 from the backend.
- The four platform roles share the same allow-list semantics as the backend's `require_platform_role(...)` helper: `platform_owner` supersedes everything; `platform_business_admin` gets Operators + Billing; `platform_support` gets Operators (read-only); `platform_sales` reaches Sales + audit-aware pages. Last-active-owner guards are reflected in the UI so the platform admin cannot demote itself.
- The legacy "Admin" group (`/admin/clients`, `/admin/ledger`, `/admin/reviews`) stays until customer surfaces fully migrate to the workspace-first paths.
**Date**: 2026-06-29

---

### ADR-F020: Replace editorial serif with a controlled challenger sans
**Status**: Accepted
**Reason**: The previous display family (`Instrument Serif`) gave HaloKYC the "Sage / Ruler / Fintech" voice of a Mercury editorial brand. The product is an anti-abuse infrastructure for serious products, not a banking app for first-time savers. A sharp contemporary sans reads closer to Cloudflare / Linear / Stripe and matches the "Outlaw + Control" archetype: challenger, technical, and not afraid to call out fraud.
**Rules**:
- Display family is now `Space Grotesk`. Mono family is now `JetBrains Mono`. UI stays on `Inter`. No fourth family.
- `Space Grotesk` is reserved for landing-page hero and section headlines, legal pages (terms / privacy / data-retention), and audit-log detail page titles. It never appears in dashboard cards, buttons, sidebar, topbar, forms, status pills, or section H2s.
- The historical `font-serif` Tailwind utility keeps working because `--font-serif` now aliases `--font-display` in `globals.css`. No re-tag of existing components is needed; the landing page re-renders with the new face.
- `JetBrains Mono` replaces `Geist Mono` everywhere. Tabular glyphs stay on; risk score, verification id, and event timestamp columns align in audit rows.
- The dashboard never uses a display family; page titles stay on Inter. The Outlaw + Control voice lives on the landing page, not in operator screens.
**Date**: 2026-06-29

---

### ADR-F021: Ship `/verify` Phase 2 as a brand shell over the existing flow, not a Didit clone
**Status**: Accepted
**Reason**: The current `/verify?workflow_id=` flow already integrates with the real backend (`apiClient.getWorkflow`, `startVerification`, `uploadVerificationFiles`, `getVerification`). The previous "Didit-inspired" brainstorm draft proposed 7 new endpoints that don't exist (`/api/verify/sessions/:id`, `/document/front`, `/document/back`, `/selfie`, `/submit`, `/status`) plus a parallel `lib/verifyApi.ts`. Building against those endpoints would produce a UI with no backend, and adding a parallel client would violate ADR-F008. The Phase 2 scope is therefore a **visual and UX upgrade of the existing flow**, not a rewrite.
**Rules**:
- `/verify` keeps its current `?workflow_id=&external_user_id=&callback_url=` URL contract. No `:sessionId` route. No new BFF handlers.
- Capture is still a single combined `POST /api/v1/verifications/{id}/upload` with `selfie_image`, `id_front_image`, optional `id_back_image`. No per-side routes.
- All fetches go through `src/lib/api-client.ts`. Do **not** introduce `lib/verifyApi.ts` or any other fetch wrapper.
- `VerifyShell` is the only new wrapper component. It renders a centered card on desktop, full-bleed on mobile, with a CSS radial-gradient dotted backdrop, the existing `BrandLogo`, a top progress bar, and a `Secured by HaloKYC` footer.
- Capture sequence is driven by a pure `verify-state-machine.ts` reducer keyed off `Workflow.services` (`selfie` / `liveness` → selfie step; `document` → front step, optional back step). The current `CaptureStep` component is reused; it gains a static liveness frame, a retake/use split, and client-side file validation.
- Result step reuses `StatusPill` and the design-system status tokens. The four color pairings (`approved`, `rejected`, `manual_review`, `processing`) are reused as-is — no new colors.
- All transitions stay ≤ 150ms and respect `prefers-reduced-motion` per ADR-F007.
- Client-side file validation: MIME `image/jpeg|image/png|image/webp`, ≤ 8 MB (matches `PRODUCT_PLAN.md`), aspect ratio warning above 4:1. Backend re-validates — these are hints, not gates.
**Date**: 2026-06-30

---

### ADR-F022: Defer a country / document-type picker on `/verify` to v2 (placeholder)
**Status**: Accepted (deferred)
**Reason**: A "Choose your verification document" screen (Didit Screen 2) requires a `Workflow` config field for `allowedCountries` and `supportedDocuments`, a new admin surface to manage it, and at least one new backend endpoint. None of those exist. Shipping a hardcoded picker in the UI would (a) invent API surface the backend has no schema for, (b) force every customer to re-author their workflows, and (c) commit us to a config model before the OCR pipeline has been benchmarked across countries.
**Rules**:
- Country picker and document-type picker are **out of scope** for Phase 2. The `/verify` flow infers document type from the captured image (current behavior).
- Resuming this work requires:
  - A new `Workflow` schema field (e.g. `document_config: { allowed_countries: ISO_3166_1[], allowed_types: string[] }`) plus a migration.
  - A new admin surface to manage the field.
  - A new backend endpoint or expanded `GET /api/v1/workflows/{id}` response shape.
  - Updated `API_CONTRACTS.md` types.
- Until those land, `verify-state-machine.ts` does **not** model country/type selection. New screens must not introduce hardcoded country lists.
**Date**: 2026-06-30

---

### ADR-F023: Add subject lifecycle controls as workspace-owned operator actions
**Status**: Planned
**Reason**: Clients need to reset legitimate users for clean re-verification, delete user data for account/privacy deletion, and ban abusive users while retaining only the fraud-matching signal required for future attempts. These actions are operationally sensitive and belong beside session activity/review context, not in generic settings.
**Rules**:
- The canonical dashboard surface is `/dashboard/[workspaceId]/subjects/[externalUserId]`, linked from session detail and activity rows.
- Owner/admin can reset verification, fully delete subject data, soft-ban, permanently ban, update bans, and lift bans.
- Reviewer can view ban status/history for review context but cannot mutate lifecycle state.
- Developer navigation hides the subject lifecycle surface; backend authorization remains authoritative.
- Reset and full deletion use destructive confirmations that show the exact `external_user_id` and explain whether future duplicate matching will be removed.
- Ban create/update uses a drawer with kind, optional expiry, reason, and metadata fields. The drawer must make the retention effect explicit: session artifacts are deleted, only the ban-match embedding is retained while the ban is active.
- The UI never renders biometric vectors, embedding ids, or low-level matching internals.
**Date**: 2026-07-02

---

## Compliance & Consent

*Subject-facing and operator-facing compliance surfaces. These ship against the contract in `.agents/context/COMPLIANCE.md` §"Future API Contract".*

### ADR-F024: Insert a `consent` step in `/verify` before biometric capture
**Status**: Accepted
**Reason**: COMPLIANCE.md §4.1 requires explicit, informed, purpose-specific consent before biometric processing, with a policy-version audit. The previous flow's "by continuing, you accept the End User Terms and Privacy Notice" paragraph in `verify-step-intro` satisfied neither the explicit opt-in nor the audit requirement. Adding a dedicated step is the simplest way to (a) require a non-pre-ticked checkbox that gates the "Proceed" affordance, (b) capture the policy version the subject agreed to, and (c) give auditors a single immutable record per session.
**Rules**:
- The state machine gains a new `consent` step between `intro` and the first biometric instruction. Document-only workflows skip it (no biometric = no consent required).
- The `consent` step is bound to the existing `VerifyShell`; it does not introduce a new visual language. The card uses the warm-paper surface and the existing typography tokens.
- The `ConsentCard` is a `type` (not `interface`), uses a `Checkbox` primitive (new `src/components/ui/checkbox.tsx`), and submits via a native `<form>` so `enter` works on the keyboard.
- The audit record (`policy_version`, `consent_timestamp`, `device_id`, `session_id`) is persisted in `sessionStorage` for the lifetime of the tab and re-collected on every `consent` step entry. The IP is captured server-side when the backend lands (see `.agents/context/COMPLIANCE.md` §"Future API Contract" §1).
- A persisted consent record auto-advances past the `consent` step on re-entry (refresh / re-open) without re-prompting — the version is checked by the backend at submit time.
- The "Privacy Notice" link points to `/privacy` (existing public policy page). The withdrawal copy points to `/privacy/dashboard`.
**Date**: 2026-07-03

---

### ADR-F025: Ship the cookie consent banner as a client-side state machine, not a server contract
**Status**: Accepted
**Reason**: COMPLIANCE.md §4.1 lists a "Cookie Consent Banner - selective category opt-in on landing page". Cookie preferences are a per-visitor choice, not a per-account record. Persisting them in `localStorage` is GDPR/CCPA/DPDP-compliant (the consent is granted by the visitor on the visitor's device), avoids inventing a backend contract for state the platform has no operational interest in, and keeps the decision reversible from the same device.
**Rules**:
- The banner lives on `/` only (the public landing page). Authenticated surfaces (`/dashboard`, `/admin`, `/console`, `/verify`) do not show the banner because they do not run third-party trackers.
- Categories: `essential` (always on, disabled checkbox) and `analytics` (default off, opt-in). The banner never pre-ticks analytics.
- Storage key is `halokyc.cookieConsent` in `localStorage`. The shape is versioned with a `policy_version` so a material change to the notice re-prompts visitors.
- The banner uses a native `<button>`/`<input type="checkbox">`/`<form>` pattern. No third-party consent SDK.
- The hook (`useCookieConsent`) is the only entry point; features never read `localStorage` directly.
**Date**: 2026-07-03

---

### ADR-F026: Ship `/privacy/dashboard` and `/admin/dsr` as typed stubs that activate when the backend lands
**Status**: Accepted
**Reason**: COMPLIANCE.md §4.2 and §4.3 require subject-facing and operator-facing compliance surfaces. None of the corresponding backend endpoints exist in `API_CONTRACTS.md` yet, but the UX contract is well-defined. Shipping the UI as a typed stub (placeholder fetchers that throw a `NOT_IMPLEMENTED` error, queries with `enabled: false`, and an "awaiting backend contract" empty state) lets the product owner review the surfaces today and turns the backend into a flip-switch integration: when the endpoints land, the queries are flipped to `enabled: true` and the BFF route handlers are added.
**Rules**:
- The frontend mirrors the contract in `.agents/context/COMPLIANCE.md` §"Future API Contract". If the contract drifts, the contract doc is updated first, the TypeScript types second.
- The hooks in `src/lib/hooks/use-privacy-dashboard.ts` and `src/lib/hooks/use-compliance-admin.ts` are the only call sites for the typed fetchers. No feature code calls the fetchers directly.
- The admin sidebar exposes the new routes only to `platform_owner` and `platform_business_admin`. The pages render an explicit empty state with the backend error, never a fake table.
- Destructive actions (DSR approval, retention changes) are wired with `useMutation` but their `mutationFn` throws until the backend exists, so the buttons stay disabled with a tooltip explaining why.
**Date**: 2026-07-03

---

### ADR-F027: Treat verification callback URLs as server webhooks only
**Status**: Accepted
**Reason**: `/verify` previously accepted a `callback_url` query value and used it for browser navigation after submitted or terminal states. That made HaloKYC a trusted open redirect whenever a verification link was copied or modified. The backend `callback_url` also already means "server-to-server webhook target", so reusing the same field for browser return navigation created unsafe product semantics.
**Rules**:
- `/verify` is opened by `verification_id` only. It may tolerate stale `callback_url` query values for backwards compatibility, but it must ignore them.
- Browser return navigation may use only the callback URL stored server-side on the verification session and returned by `VerificationConfigResponse`. Query-string-only return URLs are not allowed.
- Backend `callback_url` remains the signed server-to-server webhook target, and the same stored value may drive terminal verify UI Done/Continue navigation.
- Terminal and submitted states navigate with `window.location.assign(config.callback_url)` when the config response includes one; otherwise they may close the tab/window or show a neutral `Done` action.
**Date**: 2026-07-04


---

### ADR-F028: Add a Google sign-in button to the unified login page; complete sign-up in a follow-up screen
**Status**: Accepted
**Reason**: Customers want to skip password setup. Google is the dominant workplace IdP. Adding it as an **alternative** identity on the existing `/login` page keeps email/password as the default and minimises new UX surface.
**Date**: 2026-07-04
**Rules**:

- The Google button is rendered on `/login` (and `/login` only). It is **never** added to `/admin/login`; platform admins keep username/password.
- The button uses the official Google branding mark and label "Continue with Google". It respects the same focus / prefers-reduced-motion rules as every other button on the page.
- Clicking it triggers the Google OAuth authorization-code flow. The frontend constructs the Google consent URL client-side from `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID` and the configured redirect URI, then redirects the browser to Google.
- The Google redirect lands at `/login/google/callback?code=<authorization_code>`. The callback page renders a client handler that reads the authorization code from `useSearchParams()`.
- `GoogleCallbackHandler` calls `apiClient.googleAuth({ code })` (which posts to `POST /api/v1/auth/google`) and receives a `UnifiedLoginResponse`.
  - If `organizations.length > 0` -> store in `sessionStorage["unified_auth"]` and navigate to `/select-account` (same flow as email/password).
  - If `organizations.length === 0` -> navigate to `/login/google/complete` where the user enters a `company_name` to finish sign-up. The completion screen calls `apiClient.googleCompleteSignup(temp_token, { company_name })` to provision the org + workspace and receives a fresh `UnifiedLoginResponse`.
- The frontend never receives or stores a Google access/ID token. It only forwards the one-time `code` to the backend and then handles the HaloKYC `temp_token` exactly like the email/password unified flow.
- Failure states (Google says no, network error, backend `409` conflict) render a neutral inline error on the callback handler and link back to `/login`; they never silently auto-create an account.

**Status: Implemented (2026-07-04)**

---

### ADR-F029: Desktop-to-mobile verification handoff via QR code with client-only polling
**Status**: Accepted
**Date**: 2026-07-05
**Reason**: Desktop users landing on /verify have working cameras but a phone camera is materially easier for selfie and document capture. We want to offer a one-tap handoff without standing up a new backend service. The existing public config endpoint, the existing authenticated status-polling endpoint, and the existing /verify?verification_id=... deep link already cover everything the handoff needs.

**Rules**:
- The handoff is purely client-side. No new backend endpoint and no new contract.
- Detection lives in src/app/verify/_hooks/use-is-mobile.ts. It is SSR-safe (returns alse during SSR/first render), uses 
avigator.userAgent + a coarse-pointer media query, and is dismissible � any false positive is recoverable because the modal always offers "Use This Device".
- The QR URL is built from window.location plus the existing erification_id (and tolerated external_user_id / callback_url query params) by src/app/verify/_lib/build-verify-url.ts. The QR is not a separate deep-link contract; it just re-encodes the current page URL with a stable erification_id.
- Background polling reuses useVerification (ADR-F012) with enabled gated to "modal open AND config.status === pending_upload AND not dismissed AND state.step === intro". We do not poll once the desktop capture journey has started, to avoid racing the capture state machine.
- On a terminal status observed via the background poll, dispatch the existing { type: "terminal", decision } transition and let the existing VerifyResultStep render. The terminal action mirrors what VerifyResultStep.onContinue already does: navigate to the server-stored callback URL when present, otherwise close the window.
- The user's "Use This Device" choice lives in component state only (not localStorage). A same-mount refresh re-evaluates device detection but never re-prompts within the same mount.
- The QR code is rendered through the qrcode library to a <canvas> (a static image; no animation, so prefers-reduced-motion is automatically honoured). No selfie/ID data touches the QR; it is just a URL.
- Modal accessibility uses the shared Dialog primitive (focus trap, ESC dismisses to the desktop flow, labelled QR region via ole="img" + ria-label).


---

### ADR-F030: Keep verification journey public by verification_id and hide raw diagnostics from normal users

**Status**: Accepted
**Date**: 2026-07-10
**Reason**: End users should only need the verification link they were given. Asking for API/session keys in the verify journey creates support friction and unnecessary credential exposure. Operators need readable review evidence, while raw JSON is useful mainly for owners/admins and diagnostics.

**Rules**:
- `/verify` upload, polling, and config flows use `verification_id` only.
- Document capture screens do not expose flashlight or generic file-select controls; they present a guided capture/upload path.
- Large images are compressed client-side before upload, while the backend remains the final authority for raw and compressed size limits.
- Normal session/review detail pages render human-readable check summaries. Raw JSON is reserved for owner/admin/platform diagnostic contexts.
- Long admin/workflow drawers must have internal scroll areas so primary actions remain reachable on short viewports.

