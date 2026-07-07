# AI_RULES.md

# AI Coding Rules

This file is mandatory reading before generating or modifying any code in this repository. See also: [`FOUNDER_MODE.md`](FOUNDER_MODE.md) · [`COMPLIANCE.md`](COMPLIANCE.md) · [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) · [`TODO.md`](TODO.md) · [`API_CONTRACTS.md`](API_CONTRACTS.md) · [`AUTOMATION_STRATEGY.md`](AUTOMATION_STRATEGY.md)

---

## Operating Mode: Founder Mode

Every agent working this repo also reads [`FOUNDER_MODE.md`](FOUNDER_MODE.md). Those rules are not preferences — they are the quality bar for every output.

**When in doubt:**
- Prefer simpler architectures over clever ones.
- Optimize for shipping and learning, not perfection.
- Challenge weak proposals instead of validating them.
- Separate facts, assumptions, and recommendations in every output.
- Never rewrite large systems unless the benefits clearly outweigh migration cost.
- Use the output structure in FOUNDER_MODE.md for any material recommendation:

> ### Problem · ### Assumptions · ### Options · ### Trade-offs · ### Recommendation · ### Risks · ### Future Considerations · ### Next Actions

Engineering decisions here must consider: scalability, operational cost, developer experience, reliability, observability, migration complexity, security, and future maintenance — in that order.

## Read Order

Before coding, always read:

1. `.agents/context/PRODUCT_PLAN.md` — requirements, decision rules, credit model, success criteria (replaces separate REQUIREMENTS.md)
2. `.agents/context/ARCHITECTURE.md` (the side you are working on; see `.agents/context/backend/ARCHITECTURE.md` or `.agents/context/frontend/ARCHITECTURE.md`)
3. `.agents/context/API_CONTRACTS.md`
4. `.agents/context/DESIGN_SYSTEM.md` (frontend only)
5. `.agents/context/DECISIONS.md` (the side you are working on)
6. `.agents/context/CHANGELOG.md` (the side you are working on)
7. `.agents/context/TODO.md` — unified roadmap (replaces separate backend/frontend TODO and TODO_VERIFICATION_FLOW.md)

Always cross-reference:

- `.agents/context/backend/DATABASE_SCHEMA.md` — shapes the Python models and the TypeScript types
- `.agents/context/backend/DECISIONS.md` — explains backend trade-offs the frontend has to accommodate (and vice versa)
- `.agents/context/COMPLIANCE.md` — legal/regulatory requirements, data governance, and future compliance API contracts (replaces separate COMPLIANCE_FUTURE_API.md)
- `.agents/context/PRODUCT_PLAN.md` §14 — credit flow, bucket semantics, plan tiers, billing boundaries
- `.agents/context/AUTOMATION_STRATEGY.md` — strategic intent for automation efficiency improvements (context for Phase 10+ roadmap items in TODO.md)

## Project Policy: Development Over Testing

> Effective 2026-06-23: development is the priority over test
> coverage. Each new handler / hook / page gets at most one smoke
> test, and only when the smoke is the cheapest way to verify a
> non-obvious boundary. Skip tests entirely where a `curl`
> roundtrip, a manual browser walkthrough, or a `tsc` pass gives
> the same confidence. Existing passing tests stay; do not delete
> them.

When writing code that touches both sides, run the side-specific
gating checks before declaring done:

- **Backend**: `uv run ruff check app scripts && uv run mypy app scripts && uv run pytest --no-cov`.
- **Frontend**: `pnpm lint && pnpm typecheck && pnpm build` (use
  `npx --no-install …` if `pnpm` cannot run on this Node version).

## Never Do This

Do not:

- Replace FastAPI with another backend framework
- Replace PostgreSQL unless explicitly asked
- Replace Next.js App Router with another frontend framework
- Replace shadcn/ui + Tailwind v4 with another component library
  without approval
- Add paid AI APIs
- Add paid UI libraries (paid shadcn registries, paid icon packs,
  paid font hosts)
- Add client-side state libraries (Redux, Zustand, Jotai, Recoil)
  before the first real consumer appears
- Add analytics scripts, tracking pixels, or session replay tools
- Add a global error-monitoring SDK without approval
- Add unnecessary microservices
- Create new database tables without updating
  `DATABASE_SCHEMA.md`
- Change API request/response contracts without updating
  `API_CONTRACTS.md`
- Update `PRODUCT_PLAN.md` if either side changes scope, decision rules, or success criteria (replaces `REQUIREMENTS.md`)
- Over-engineer the MVP
- Store full document numbers in plain text
- Store API keys in plain text
- Expose uploaded files publicly
- Embed raw API keys, JWTs, or webhook secrets in the bundle
- Persist the admin JWT in `localStorage`; use an httpOnly cookie
  or short-lived session storage at most
- Persist user biometrics (selfie previews, captured ID images)
  outside the session that created them
- Bypass the typed `apiClient` in `src/lib/api-client.ts`; do not
  call `fetch` from feature code
- Hardcode the backend URL anywhere outside `src/lib/env.ts`
- Introduce a server-side data layer (Next.js Route Handlers,
  Server Actions, RSC fetch caching) before the API contract is
  stable
- Call backend routes the backend docs do not yet define - either
  extend the contract first or wrap the existing one
- Generate fake content (lorem ipsum, placeholder users) inside
  shipped UI

## Always Do This

Always:

- Keep implementation simple and production-minded
- Use clean modular architecture
  - Put business logic inside services (backend) / custom hooks
    (frontend)
  - Keep routes thin (backend) and components presentational
    (frontend)
  - Use Pydantic schemas for request/response validation (backend)
  - Use Alembic for schema changes
  - Use background jobs for AI processing (backend)
  - Use audit logs for status changes
  - Update the respective `CHANGELOG.md` (backend or frontend) immediately after completing every non-trivial task
  - Add `TODO` comments where real AI model weights are needed
  - Update `CHANGELOG.md` after meaningful changes
  - Update `DECISIONS.md` for new architectural decisions

- Update `DECISIONS.md` for new architectural decisions
- Update `API_CONTRACTS.md` if either side adds or assumes a new
  endpoint
- Update `DESIGN_SYSTEM.md` before introducing a new frontend
  component, token, or layout primitive
- Honour `prefers-reduced-motion` and keyboard focus on every
  interactive surface (frontend)
- Match the design tokens defined in `DESIGN_SYSTEM.md`; do not
  introduce one-off hex values (frontend)

## Architecture Rules

### Backend
The backend manages three distinct operational loops:
1. **Platform Admin**: Infrastructure and Client onboarding.
2. **Client Orchestration**: Workflow management, API key issuance, and User session triggering.
3. **Verification Engine**: AI processing of User evidence based on the linked Workflow.

`app/` should only contain business logic. The layout is defined in
`backend/.agents/context/backend/ARCHITECTURE.md`.


Routes should only handle:

- Request validation
- Auth checks
- Calling services
- Returning responses

Services should handle:

- OCR logic
- Face matching
- Liveness logic
- Duplicate detection
- Risk scoring
- Webhook delivery
- Storage abstraction

Database models should not contain business logic.

### Frontend

`src/app/` should only contain:

- Route files (`page.tsx`, `layout.tsx`, `error.tsx`,
  `loading.tsx`, `not-found.tsx`)
- Route-scoped private folders (`_components/`, `_lib/`, `_hooks/`)
- Route-level metadata and SEO config
- Route handlers **only** if explicitly added to the contract

`src/components/ui/` is the only place that may import from
`@base-ui/react`. Feature code must consume `src/components/ui/*`
instead.

`src/lib/` owns:

- `api-client.ts` - typed backend client, the only place that
  calls `fetch`
- `env.ts` - typed `NEXT_PUBLIC_*` access
- `utils.ts` - generic helpers (`cn`, formatters)
- `format.ts` - display formatters (status labels, timestamps,
  scores)
- `hooks/` - reusable client hooks (`useVerification`,
  `useReviewQueue`, etc.)

Services must not be called from Server Components - the API
requires a browser-supplied `X-API-Key` and a browser-supplied
admin JWT.

## AI Model Rules

For MVP:

- OCR service can use PaddleOCR or EasyOCR
- Face service should use InsightFace/ArcFace
- Liveness service should be interface-first
- If real model integration is difficult, create a mocked
  implementation with clear `TODO`
- Never block the whole MVP because of model integration

## Security Rules

### API keys (both sides)

- Show raw API key only once during creation
- Store only hash in database
- Validate using secure comparison

### Files

- Store locally under `storage/` for MVP
- Use storage abstraction so S3 can be added later
- Validate MIME type
- Validate file size
- Never expose direct local paths in API responses
- Selfie and ID captures stay in component memory; do not upload
  them to a third-party CDN or paste them into the clipboard
  (frontend)
- Object URLs must be revoked on unmount (frontend)
- Never render a server-side `<img>` for biometric captures
  (frontend)

### Webhooks

- Sign payload using HMAC
- Send signature in `X-Verification-Signature` header
- Store delivery attempts
- Webhook URLs entered on `/verify` are scoped to the session and
  discarded on success/failure; do not persist them in
  `localStorage` (frontend)

### JWTs (frontend)

- Read from `httpOnly` cookie set by a thin login route handler
- Never expose to `document.cookie` or `localStorage`
- Forwarded by the backend only; the frontend never reads it
  directly

### API key (frontend)

- Read from a per-tab in-memory store backed by `sessionStorage`;
  clear on tab close
- Never log the key; redact the last 4 chars in any debug surface

## Component Conventions (frontend)

- Every component file starts with the `"use client"` directive
  only when it actually needs client features. Default to Server
  Components.
- Props are typed with `type`, never `interface`, except when
  extending a third-party contract.
- Use named exports, not default exports, for all components
  except `page.tsx` and `layout.tsx` (Next.js routing
  requirement).
- Compose, do not duplicate: a new variant is a CVA entry, not a
  forked component.
- Headings, captions, and labels use semantic HTML elements
  (`<h1>`, `<figcaption>`, `<label>`); never use styled `<div>` in
  their place.
- Mirror backend contracts as TypeScript types in
  `src/lib/api-client.ts`; never duplicate the shape inside a
  feature folder.
- Co-locate feature components under
  `src/app/<route>/_components/` (private folder) so they stay
  out of the routing surface.
- Use the shadcn/ui primitives in `src/components/ui/`; extend
  them, do not fork them.
- Prefer Server Components for static shells and Client
  Components (`"use client"`) only where state, browser APIs, or
  event handlers are needed.
- Use `sonner` for all non-blocking notifications; do not
  introduce another toast library.

## Forms (frontend)

- Use native `<form>` with React 19's `useActionState` for
  submissions that need server validation.
- Client-only forms use local state + `sonner` for error feedback.
- Validation mirrors the backend Pydantic schema where one
  exists.
- Every form has an accessible label association and a visible
  focus state.

## Next.js 16 Specifics (frontend)

- Read the relevant guide in
  `node_modules/next/dist/docs/` before writing Next.js code -
  this is Next.js 16, not the version in training data.
- Read the deprecation notices in the docs folder; do not use
  APIs marked removed.
- `cookies()` and `headers()` are async - always `await` them.
- Use `RouteContext<'/path/[id]'>` typed context for dynamic
  segments.

## Testing Requirements

Per the "development over testing" policy above, this is the
minimum expectation:

**Backend**

- Unit tests for risk decision logic
- Mocked tests for OCR service
- Mocked tests for face service
- API tests for verification flow
- Webhook signing test
- One sanity test per new endpoint / service method that touches a
  non-obvious boundary

**Frontend**

- One msw smoke per new route handler module (not per handler).
- One happy-path component test per new page (skip if the
  `curl` / browser walkthrough gives the same confidence).
- New tests are tagged `[~]` (optional) in the relevant TODO; do
  not treat them as gating.

## If Unsure

If unsure about implementation:

- Prefer the simpler option
- Add a `TODO` comment
- Keep interfaces clean
- Do not invent new product requirements
- Defer to `.agents/context/PRODUCT_PLAN.md` for scope/decision rules and `.agents/context/COMPLIANCE.md` for regulatory requirements