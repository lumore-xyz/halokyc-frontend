# ARCHITECTURE.md

# Architecture

**See also:** [`AI_RULES.md`](AI_RULES.md) (frontend rules) · [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §2.4, §2.5, §2.7 (frontend deliverables) · [`API_CONTRACTS.md`](API_CONTRACTS.md) (BFF + API shapes) · [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) (tokens and primitives) · [`DECISIONS.md`](DECISIONS.md) (ADR index) · [`TODO.md`](TODO.md) (implementation status)

## Overview

HaloKYC's frontend is a Next.js 16 App Router application that consumes the
FastAPI backend defined in `backend/`. It is a thin shell - business logic,
AI, and persistence live on the server. The frontend's job is to render
three distinct surfaces (end-user capture flow, client dashboard with its
API console, and platform admin portal) on top of one typed HTTP client.

Stack:

- Next.js 16 (App Router) with React 19 Server Components
- TypeScript 5 in strict mode
- Tailwind CSS v4 + shadcn/ui (`base-nova` style)
- `@base-ui/react` for headless primitives
- `lucide-react` for icons, `sonner` for toasts
- `next-themes` wired but light-only for MVP
- `vitest` + Testing Library for unit tests (Phase F2)
- `playwright` for end-to-end tests (Phase F6)
- No client-side state library in MVP - local state and URL state are
  sufficient

## Top-Level Layout

```
frontend/
  src/
    app/                    # Routes (App Router)
      layout.tsx            # Root layout, fonts, toaster
      page.tsx              # Landing / overview
      verify/               # End-user capture flow
        page.tsx
        _components/        # Private feature components
        _hooks/             # Private feature hooks
      admin/                # Platform Admin portal
        page.tsx               # Client management list
        clients/[id]/          # Client detail & phase management
        _components/
        _hooks/
        login/                 # Admin sign-in
      login/                # Client-user sign-in
        page.tsx
        client-login-form.tsx
        select-account/        # Unified account picker
      dashboard/            # Customer console (workspace + organization)
        page.tsx               # Workspace picker / auto-redirect
        team/                  # Organization-scoped (owner/admin)
        workspaces/            # Organization-scoped (owner/admin)
        billing/               # Organization-scoped (owner/admin)
        [workspaceId]/
          page.tsx               # Workspace overview
          workflows/
          api-keys/
          webhooks/              # Owner/admin/developer
          reviews/
            page.tsx             # Review queue (owner/admin/reviewer)
            [id]/page.tsx        # Review detail + decision
            assigned/page.tsx    # Reviewer-only
            completed/page.tsx   # Reviewer-only
          sessions/              # Activity (all roles)
          subjects/              # Subject lifecycle: reset, delete, ban status/actions
          analytics/             # Owner/admin
          audit-logs/            # Owner/admin
          console/               # Developer console
          integration-logs/      # Developer-only
          docs/                  # Workspace-aware docs
          settings/
          _components/
      api/                  # Route handlers (thin auth-only bridges)
        admin/              #   - login -> set httpOnly cookie
        client/             #   - login + self-service + organization + workspace proxies
    components/             # Cross-feature UI
      ui/                   # shadcn/ui primitives (the only place that
                            # imports from @base-ui/react)
      dashboard/
        app-shell.tsx              # Sidebar + topbar layout
        app-sidebar.tsx
        app-nav-config.ts          # Role-filtered nav groups
        app-workspace-switcher.tsx
        app-user-menu.tsx
        app-topbar.tsx
        app-breadcrumb.tsx
        route-guard.tsx           # <RouteGuard> + <OrganizationRouteGuard>
        route-access.tsx           # <RouteAccessDenied> + <DisabledAccountState> + <WorkspaceDisabledState>
        metric.tsx
      site-header.tsx
      status-pill.tsx
      score-meter.tsx
      check-card.tsx
      json-viewer.tsx
      empty-state.tsx
      route-error-state.tsx
    lib/
      api-client.ts         # Typed fetch wrapper - the only place that
                            # calls fetch from the browser
      admin-proxy.ts        # BFF helpers: admin cookie set / clear / forward
      client-proxy.ts       # BFF helpers: client cookie set / clear / forward
      auth-session.ts       # JWT payload decoding (admin + client)
      query-client.ts       # Singleton QueryClient + sane defaults
      query-provider.tsx    # Client-side QueryClientProvider + Devtools
      env.ts                # Typed NEXT_PUBLIC_* config
      utils.ts              # cn(), small generic helpers
      format.ts             # Display formatters (status, dates, scores)
      hooks/                # Reusable client hooks
        use-verification.ts
        use-review-queue.ts
        use-admin-session.ts
        use-client-session.ts
        use-my-api-keys.ts
        use-api-key.ts
        use-debounced-value.ts
        use-workspaces.ts        # Workspace list / create / update
        use-workspace.ts         # Single workspace read
        use-organization.ts      # Org profile + members
    test/                   # Test setup, msw handlers, fixtures
  public/                   # Static assets (favicons, og images)
  src/proxy.ts              # Auth + workspace-id proxy
  AGENTS.md                 # Next.js 16 warning
  components.json           # shadcn config (base-nova)
  next.config.ts
  postcss.config.mjs
  tailwind.config           # imported via @theme inline in globals.css
  tsconfig.json
  package.json
  README.md
```

## Routing Model

| Path | Audience | Rendering |
| --- | --- | --- |
| `/` | Everyone | Server Component |
| `/verify` | End user | Client Component (dynamic steps, camera, polling) |
| `/verify/success` | End user | Server Component |
| `/login` | Client user | Client Component (unified form) |
| `/select-account` | Client user / Platform admin | Client Component (account picker after unified login) |
| `/admin/login` | Plat. Admin | Client Component (form) |
| `/admin` | Plat. Admin | Server Component shell + Client list |
| `/admin/clients/[id]` | Plat. Admin | Server Component shell + Client detail |
| `/admin/ledger` | Plat. Admin | Client Component ledger pane in AppShell |
| `/admin/reviews` | Plat. Admin | Client Component ledger pane in AppShell |
| `/dashboard` | Customer | Server Component shell + workspace picker / auto-redirect |
| `/dashboard/team` | Owner / Admin | Client Component (organization-scoped) |
| `/dashboard/workspaces` | Owner / Admin | Client Component (organization-scoped) |
| `/dashboard/billing` | Owner / Admin | Client Component (organization-scoped) |
| `/dashboard/[workspaceId]` | Workspace member | Server Component shell + overview |
| `/dashboard/[workspaceId]/workflows` | Owner / Admin / Developer | Server Component shell + workflow designer |
| `/dashboard/[workspaceId]/api-keys` | Owner / Admin / Developer | Server Component shell + API key manager |
| `/dashboard/[workspaceId]/webhooks` | Owner / Admin / Developer | Server Component shell + webhook list |
| `/dashboard/[workspaceId]/reviews` | Owner / Admin / Reviewer | Server Component shell + review queue |
| `/dashboard/[workspaceId]/reviews/[id]` | Owner / Admin / Reviewer | Server Component shell + review detail + decision |
| `/dashboard/[workspaceId]/reviews/assigned` | Reviewer only | Server Component shell + assigned queue tab |
| `/dashboard/[workspaceId]/reviews/completed` | Reviewer only | Server Component shell + completed queue tab |
| `/dashboard/[workspaceId]/sessions` | All workspace roles | Server Component shell + activity log |
| `/dashboard/[workspaceId]/sessions/[id]` | All workspace roles | Server Component shell + session detail + evidence viewer |
| `/dashboard/[workspaceId]/subjects/[externalUserId]` | Owner / Admin / Reviewer | Server Component shell + subject lifecycle detail |
| `/dashboard/[workspaceId]/analytics` | Owner / Admin | Server Component shell + status breakdown |
| `/dashboard/[workspaceId]/audit-logs` | Owner / Admin | Server Component shell + audit log viewer |
| `/dashboard/[workspaceId]/console` | Owner / Admin / Developer | Server Component shell + console access gate |
| `/dashboard/[workspaceId]/integration-logs` | Developer only | Server Component shell + activity log surface |
| `/dashboard/[workspaceId]/docs` | Owner / Admin / Developer | Server Component shell + workspace-aware docs |
| `/dashboard/[workspaceId]/settings` | All workspace roles | Client Component (organization-scoped via JWT) |

The landing page is the only fully static surface. `/verify`, `/admin`,
`/login`, and `/dashboard` are mostly dynamic but the shell, header, and
metadata can render on the server. `/dashboard` and its sub-routes read
the `halokyc_client` httpOnly cookie server-side via `cookies()` (Next.js
16 async API) and redirect to `/login` when the JWT is missing or
expired. `/admin` and its sub-routes read the `halokyc_admin` cookie
similarly.

`src/proxy.ts` runs ahead of every navigation. It enforces auth,
redirects authenticated visitors away from `/login`, and protects the
legacy "non-UUID workspace" redirect: `/dashboard/team`,
`/dashboard/workspaces`, `/dashboard/billing`, and `/dashboard/settings`
are explicitly allow-listed as organization-scoped routes.

`useSearchParams` is the only query-string API in MVP. We do not
introduce client-side routing state on top of Next's router.

## Component Layers

### `src/components/ui/`

The shadcn/ui primitives. The only folder allowed to import from
`@base-ui/react`. Each primitive is a thin styled wrapper around a base-ui
component and uses `class-variance-authority` for variants.

Adding a new primitive:

1. Run `pnpm shadcn add <name>` (or hand-write one when the registry is
   out of date)
2. Drop the file into `src/components/ui/`
3. Add the Storybook story in Phase F2
4. Document the variant table in `DESIGN_SYSTEM.md`

### `src/components/`

Shared feature-agnostic components (status pill, score meter, empty
state, header). Compose `ui/*`; never import from `@base-ui/react` here.

### `src/app/<route>/_components/`

Route-private components. They are not exported and never imported from
outside their route folder. This is the Next.js App Router convention for
private folders.

### `src/app/<route>/_hooks/`

Route-private hooks that wrap the shared hooks in `src/lib/hooks/` with
route-specific defaults.

## Form Presentation

Authenticated create/edit actions that collect user input use a
right-side drawer/sheet, matching the workflow designer. The page
keeps a concise trigger button in the toolbar/header, while the form
fields, validation errors, submit button, and cancel/close affordance
live inside the drawer.

This applies to `/dashboard`, `/admin`, and `/dashboard/console` product
surfaces. API key creation is included because the user names the key
before issuing it. Inline controls are reserved for zero-input actions,
filters, search, and quick toggles that do not create or edit records.

## Data Flow

```
+--------+        +-------------+        +-----------------+
| Page / |  hooks | api-client  |  fetch | Backend FastAPI |
| Form   | <----- | (typed)     | -----> | /api/v1/...     |
+--------+        +-------------+        +-----------------+
   |   ^                                       ^
   |   |------------ React Query ---------------|
   v                                             |
QueryClient (singleton, QueryClientProvider      |
in <RootLayout />'s Client Component)            |
                                                |
sessionStorage / cookie ---- (X-API-Key / admin JWT)
```

- All HTTP goes through `apiClient` in `src/lib/api-client.ts`.
- React Query owns the cache, retries, polling cadence, and mutation
  lifecycle. Feature hooks under `src/lib/hooks/` are thin wrappers
  around `useQuery` / `useMutation` that bind query keys to API calls.
- API keys live in `sessionStorage` under a single namespaced key
  (`halokyc.apiKey`) and are read by a custom hook (`useApiKey`).
- The admin JWT lives in an httpOnly cookie set by `/api/admin/login`
  (Phase F5) and is never readable from JS.
- `useVerification(id)` uses `useQuery` with `refetchInterval` driven
  by `publicEnv.verificationPollMs`. The query function throws when
  the status is terminal so the poller stops automatically.
- Optimistic UI is only used for admin approve/reject via
  `useMutation` with `onMutate` cache updates and rollback on error.

## State

MVP deliberately avoids Redux, Zustand, Jotai, etc. State lives in:

- **URL** - the active verification ID, the admin route, the search box
- **Component state** - form values, modal open, capture progress
- **`sessionStorage`** - the developer API key
- **httpOnly cookie** - the admin JWT
- **React Query cache** - server state for every backend call

React Query is the only client-side cache. It is configured with:

- `staleTime`: 30s for reads (we still refetch on focus)
- `gcTime`: 5 minutes for inactive queries
- `retry`: 1 for reads, 0 for mutations
- `refetchOnWindowFocus`: true for the verification detail, false
  for the review queue (the queue is user-initiated refresh)
- `refetchIntervalInBackground`: false everywhere (matches ADR-F005)

If a route ever needs cross-route server state, it is exposed via a
hook under `src/lib/hooks/` rather than introducing a new global
store. ADR-002 captures the trigger condition for adding a state
library; React Query does not count because it is owned by the
backend contract, not by the UI.

## Authentication Surfaces

### Developer API key

- Stored in `sessionStorage` under `halokyc.apiKey`
- Cleared on tab close
- Surfaced via a "Settings" sheet in the site header
- The user pastes the key once and the console reuses it for every call

### Admin JWT

- Obtained via `POST /api/v1/auth/admin/token` from a client-side form
- The form posts to a thin Next.js route handler (`/api/admin/login`)
  that calls the backend, sets the JWT in an httpOnly `Secure` cookie
  named `halokyc_admin`, and returns `{ ok: true }`
- The same route handler exposes a `DELETE` for sign-out
- The backend never receives the JWT directly from the browser - we
  proxy it through the route handler so the cookie is set with the
  right flags
  
### Client-user JWT

- Obtained via `POST /api/v1/auth/client/token` (email + password) from
  the `/login` form
- The form posts to a thin Next.js route handler (`/api/client/login`)
  that calls the backend, sets the JWT in an httpOnly `Secure` cookie
  named `halokyc_client`, and returns `{ ok: true }`
- The same route handler exposes a `DELETE` for sign-out
- BFF handlers under `/api/client/me/...` re-read the cookie,
  forward it as `Authorization: Bearer <jwt>`, and proxy the
  self-service backend endpoints (workflows, api-keys, reviews)
- The `/dashboard` page and its sub-routes read the cookie server-side via
  `cookies()` (Next.js 16 async API) and redirect to `/login` when
  the JWT is missing or expired

### End-user capture flow

- No authentication. The flow is opened with a `verification_id` query
  parameter for an already-created session.
- `/verify` ignores `callback_url` query values and never redirects the
  browser to caller-supplied URL params. When the backend config response
  includes the server-stored session `callback_url`, the Done/Continue action
  navigates there with `window.location.assign`; otherwise it falls back to
  closing the tab/window.
- The end user's identity is the session's `external_user_id`; the developer's
  identity is the API key embedded in a build-time env var or injected
  by the host page. The MVP ships a "paste your API key" prompt for the
  end-user flow to keep the demo self-contained.

## Polling

- `useVerification(id)` polls `GET /verifications/{id}` every
  `publicEnv.verificationPollMs` ms until status is terminal
  (`approved`, `rejected`, `manual_review`)
- The hook stops polling on unmount and on tab visibility change to
  `hidden` (to avoid hammering the backend)
- A "Refresh" button always re-fetches on demand
- A banner appears after 10s of `processing` to set expectations

## Error Handling

- `apiClient` throws `ApiError` with `status` and parsed `body`
- Each route has an `error.tsx` boundary that renders an `EmptyState`
  with a retry button
- Network failures during polling show an inline banner, not a toast
- 401 on admin routes triggers a redirect to `/admin/login`
- 401 on client routes triggers a redirect to `/login`
- 403 (inactive client or client user) shows an actionable message
  ("This account is disabled. Contact your admin.")
- 404 on a verification ID renders a "Not found" page with a link back
  to `/dashboard/console`
- 409 (admin review or self-service against an inactive client)
  surfaces an inline banner with the backend's detail message

## Build and Run

```
pnpm install
pnpm dev              # next dev, port 3000
pnpm build            # next build
pnpm start            # next start, port 3000
pnpm lint             # eslint .
pnpm typecheck        # tsc --noEmit
pnpm format           # prettier --write .
pnpm test             # vitest run (Phase F2)
pnpm test:e2e         # playwright test (Phase F6)
```

Environment variables (consumed in `src/lib/env.ts`):

| Var | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | Backend origin |
| `NEXT_PUBLIC_VERIFICATION_POLL_MS` | `2500` | Poll cadence |
| `NEXT_PUBLIC_ENABLE_ADMIN_CONSOLE` | `true` | Feature flag for the admin surface |

These are the only variables the browser reads. Anything backend-side
(`WEBHOOK_SECRET`, `ADMIN_PASSWORD_HASH`, etc.) is never exposed.

## Folder Conventions

- Co-locate test files: `use-verification.ts` next to
  `use-verification.test.ts`.
- Co-locate styles: prefer Tailwind utilities; if a component needs
  scoped CSS, use a CSS module named `<component>.module.css`.
- Co-locate fixtures: `src/test/fixtures/` for shared test data.
- Each route's `_components/` and `_hooks/` folders are private and
  must not export symbols to other routes.

## What This App Does Not Do

- It does not implement authentication itself. Admin auth is a thin
  proxy to the backend's `/auth/admin/token` route.
- It does not implement liveness. The selfie capture screen shows a
  visual prompt only; the actual liveness check is a backend service.
- It does not persist anything outside `sessionStorage` and the
  server-set cookie. No `localStorage`, no IndexedDB, no Service Worker
  in MVP.
- It does not run a background sync. Polling stops when the tab is
  hidden and resumes when it returns.

## Customer Console: Workspace + Organization + RBAC

The customer console is workspace-first inside an organization. The
selected workspace lives in the URL as `/dashboard/[workspaceId]/...`;
organization-scoped routes (Team, Workspaces, Billing, Settings) live
under `/dashboard/<feature>` without a workspace id, and the
`useNavGroups` hook rewrites only workspace-scoped entries with the
active workspace id.

### Navigation Filtering

`useNavGroups(audience, { role })` filters each nav entry by its
`roles` allow-list (`ClientRole` value). The full role matrix lives in
`src/components/dashboard/app-nav-config.ts`:

- Owner / Admin: Overview, Verifications, Manual Review, Workflows, API
  Keys, Webhooks, Analytics, Audit Logs, Workspaces, Team, Billing,
  Settings, API console, Docs.
- Reviewer: Overview, Verifications, Review Queue, Assigned Reviews,
  Completed Reviews, Settings, API console.
- Developer: Overview, Verifications, Workflows, API Keys, Webhooks,
  Integration Logs, Docs, Settings.

Hidden entries are a clarity affordance, not a security boundary. The
backend returns 403 when a role is wrong; the frontend guard renders an
explicit unauthorized state regardless of which side rejects the call.

### Route Guards

Every workspace and organization route wraps its content in
`<RouteGuard>` or `<OrganizationRouteGuard>`
(`src/components/dashboard/route-guard.tsx`). The guard:

1. Loads the client session, workspace, and organization.
2. Detects 401 (`client_inactive`), 403 (`require_role` rejected),
   disabled workspace (`status !== "active"`), and suspended / disabled
   organization.
3. Renders the matching shared state component from
   `src/components/dashboard/route-access.tsx`:
   `<RouteAccessDenied>`, `<DisabledAccountState>` (org vs member
   variants), `<WorkspaceDisabledState>`.
4. Falls through to the page only when the role is in the
   `allowedRoles` list and every upstream fetch succeeded.

### Sensitive KYC Evidence

The session detail page mounts an `<EvidenceViewer>` panel that loads
uploaded files via the workspace BFF
(`/api/client/workspaces/[workspace_id]/verifications/[verification_id]/files/[file_id]`).
Owners, admins, and reviewers see rendered evidence (revoked object
URLs, no server `<img>`). Developers see a "Hidden by role" panel with
an `EyeOffIcon` and an explanation that backend 403s are enforced on
direct fetches.

### Subject Lifecycle Actions

Subject lifecycle controls are planned under the workspace dashboard and must
use the same AppShell, route guards, React Query hooks, and typed `apiClient`
path as the rest of the customer console.

- Session detail links to the subject lifecycle surface for the session's
  `external_user_id`.
- Owner/admin can reset verification, fully delete subject data, create/update
  soft bans, create/update permanent bans, and lift bans.
- Reviewer can view ban status and lifecycle history but cannot mutate it.
- Developer does not get the subject lifecycle surface in navigation because
  it can reveal enforcement policy, though developer-owned API keys may still
  call the external subject lifecycle API from the client's backend.
- Reset/delete use explicit destructive confirmations with the external user id
  visible. Ban create/update uses a drawer/sheet with `kind`, optional expiry,
  reason, and safe metadata fields.
- Ban status is displayed with clear labels: `Soft ban until <date>`,
  `Permanent ban`, `Ban lifted`, or `No active ban`. The UI never displays
  face embeddings, vector ids, or biometric internals.

### Workspace Switcher

Lives at the top of the customer sidebar
(`AppWorkspaceSwitcher`). Shows the selected workspace name as the
primary label and organization name as the secondary label. Switching
workspace navigates to `/dashboard/{workspaceId}`; the active
workspace id is then read from the URL by `useNavGroups` and used to
rewrite workspace-scoped sidebar entries. Organization-scoped entries
are not rewritten.

### Team and Workspace Management

- `/dashboard/team` (`OrganizationRouteGuard`, owner/admin only):
  invite drawer, role / status mutator, last-owner guard.
- `/dashboard/workspaces` (`OrganizationRouteGuard`, owner/admin only):
  list, create sheet (auto-navigates the creator into the new
  workspace), edit sheet.

## Planned Platform Admin Role Filtering

Platform admin routes will become role-filtered under the existing
`/admin` shell. Database-backed platform sessions expose `userId` and
`platformRole`; sidebar entries and route guards derive from that role
while backend 403s remain the source of truth.
