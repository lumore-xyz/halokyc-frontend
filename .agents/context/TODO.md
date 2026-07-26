# Development Roadmap

> **Status legend:** `[x]` completed · `[-]` in progress · `[ ]` pending · `[~]` optional/deferred
> **Start here:** [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) for requirements, decision rules, and credit model. [`features/README.md`](features/README.md) for per-feature reference docs. [`API_CONTRACTS.md`](API_CONTRACTS.md) for endpoint shapes. Side-specific [`backend/ARCHITECTURE.md`](backend/ARCHITECTURE.md) / [`frontend/ARCHITECTURE.md`](frontend/ARCHITECTURE.md) for code layout.

---

## SEO Phase — Search Discovery & Organic Acquisition

**Goal:** Make the public HaloKYC marketing site and documentation discoverable, indexable, technically consistent, and aligned with validated buyer searches without exposing authenticated, verification, admin, or privacy workflows to search engines.

**Assumptions**

- The primary site is `https://halokyc.com`.
- The documentation site is `https://docs.halokyc.com`.
- English is the only supported marketing locale in this phase; hreflang is out of scope until translated content exists.
- Public claims must reflect shipped product capabilities. Compliance certifications, customer results, performance benchmarks, and regional coverage must not be invented.
- Analytics or tracking scripts require explicit approval and a privacy/compliance review before implementation.

### SEO-1 — Crawlability, indexation, and canonical URLs (launch blockers)

- [x] Define one typed production-site origin and use it for `metadataBase`, canonical URLs, sitemap entries, Open Graph URLs, and cross-domain links; fail production builds when the origin is missing or points to localhost.
- [x] Add a Next.js `robots.ts` metadata route that allows public marketing pages, references the production sitemap, and does not use crawl blocking as a substitute for `noindex`.
- [x] Add a Next.js `sitemap.ts` metadata route containing only canonical, public, 200-status marketing URLs; exclude authenticated, admin, API, verification-session, callback, account-selection, and privacy-dashboard routes.
- [x] Add self-referencing canonicals to every indexable marketing page and verify consistent HTTPS, hostname, casing, and trailing-slash behavior.
- [x] Add nested route metadata/layouts that set `noindex, nofollow` for `/admin`, `/dashboard`, `/login`, `/select-account`, `/verify`, `/privacy/dashboard`, and Google login callback/completion routes.
- [x] Decide whether legal pages (`/privacy`, `/terms`, `/data-retention`) should be indexed; encode that decision explicitly instead of inheriting root metadata.
- [x] Fix the mobile-navigation `/console` link so every rendered internal marketing link resolves to a valid 200-status route.
- [x] Add a repeatable local crawl check that verifies public route status, canonical, robots directive, unique title, unique description, and exactly one H1; keep this lightweight rather than adding a broad new test suite.

**Acceptance criteria**

- `/robots.txt` and `/sitemap.xml` return 200 with production URLs.
- Every sitemap URL returns 200, is self-canonical, and is indexable.
- Non-marketing routes render or return an explicit `noindex` directive and never appear in the sitemap.
- The local marketing crawl reports no broken internal links or canonical conflicts.

### SEO-2 — Page metadata and social previews

- [x] Add a root title template, public-site default description, Open Graph defaults, Twitter defaults, favicon/apple-icon configuration, and a production share image.
- [x] Add unique metadata to `/pricing`, `/privacy`, `/terms`, and `/data-retention`; do not let them inherit the dashboard-oriented root description.
- [x] Review metadata for `/`, `/product`, `/workflow`, `/security`, and `/credits` so each page has a distinct search intent, useful title, concise description, canonical, and social-preview copy.
- [x] Shorten the homepage meta description from its current overlong version while preserving the product value proposition and primary search topic.
- [x] Generate or design a reusable 1200x630 HaloKYC Open Graph image and verify previews for the homepage and key product pages.
- [x] Verify that metadata output is correct in rendered HTML, not only in TypeScript source.

**Acceptance criteria**

- Every indexable page has a unique, intent-aligned title and description.
- Every indexable page renders canonical, Open Graph, and Twitter metadata with absolute production URLs.
- Social preview images load successfully and include useful alt text where supported.

### SEO-3 — On-page relevance and internal architecture

- [x] Create a keyword-to-page map before changing copy. Initial topics to validate include identity verification API, KYC API for startups, document OCR, liveness detection, face matching, age checks, duplicate detection, manual review, verification workflows, and signed verification webhooks.
- [x] Align the homepage title, H1/supporting copy, first paragraph, and internal anchors around one validated primary topic while preserving the existing "fake users/growth tax" positioning.
- [x] Review `/product`, `/workflow`, `/security`, `/pricing`, and `/credits` for title/H1/URL alignment, descriptive headings, search-intent coverage, and natural related terminology.
- [x] Add descriptive internal links between the homepage, product pages, pricing, security, legal pages, and relevant documentation guides.
- [x] Ensure important public pages remain reachable within two clicks of the homepage and that new content pages are linked from relevant hubs rather than left orphaned.
- [x] Standardize public contact identity and choose one supported email/domain convention across footer, legal, billing, and security pages.

**Acceptance criteria**

- Each indexable page has one documented primary topic and does not compete with another HaloKYC page for the same intent.
- Primary page copy answers the intended buyer question without keyword stuffing or unsupported claims.
- No indexable page is orphaned.

### SEO-4 — Structured data

- [x] Define only schema types supported by visible content and product facts. Candidate types: `Organization`, `SoftwareApplication`, `FAQPage` for the visible pricing FAQ, and `BreadcrumbList` for documentation.
- [x] Implement JSON-LD as server-rendered markup with stable production URLs; do not rely on source-only or static-fetch validation.
- [x] Validate deployed structured data with Google Rich Results Test or another JavaScript-rendered validator and record any unsupported/non-rich-result schema separately.

**Acceptance criteria**

- Rendered pages contain valid JSON-LD that matches visible content.
- Rich Results Test reports no blocking structured-data errors.
- No schema contains invented ratings, prices, certifications, customers, locations, or capabilities.

### SEO-5 — Static delivery and Core Web Vitals

- [x] Remove the homepage dependency on `cookies()` so the marketing route can be statically generated and cached; simplify the auth-aware CTA rather than introducing a new data layer solely for navigation personalization.
- [x] Confirm which marketing routes are static in the production build and document any route that must remain dynamic.
- [ ] Measure homepage, product, pricing, and docs pages on mobile and desktop with PageSpeed Insights or equivalent after deployment.
- [ ] Address measured LCP, INP, and CLS failures, prioritizing the hero image, JavaScript hydration, font loading, and third-party code; do not optimize solely from guesses.
- [ ] Review the three globally loaded font families and requested weights, then retain only the variants that provide visible design value.

**Acceptance criteria**

- The homepage is emitted as a static route in the production build.
- No audited page has avoidable layout shift from images, fonts, or delayed UI.
- Field or lab evidence is recorded for LCP, INP, CLS, and TTFB, with follow-up tasks for any threshold failures.

### SEO-6 — Documentation subdomain

- [x] Make `NEXT_PUBLIC_SITE_URL=https://docs.halokyc.com` mandatory in the docs production build and remove the unsafe localhost production fallback.
- [x] Add docs-specific robots, sitemap, self-canonicals, Open Graph URLs, and Twitter metadata.
- [x] Verify that every MDX page has a unique title and description and that generated page URLs match sitemap and canonical URLs.
- [ ] Add breadcrumb structured data and contextual links from relevant documentation pages back to product, workflow, security, and pricing pages.
- [ ] Decide and document whether Markdown/content-negotiation variants should canonicalize to their HTML documentation page.

**Acceptance criteria**

- The docs sitemap contains every intended documentation page and no internal content-rewrite URL.
- All docs pages resolve metadata against `https://docs.halokyc.com`.
- HTML and Markdown variants do not create duplicate indexable URL sets.

### SEO-7 — Helpful content and trust signals

- [ ] Validate search demand and product fit before creating dedicated feature pages for document OCR, liveness, face matching, age checks, duplicate detection, manual review, and audit/webhook delivery.
- [ ] Validate target customer segments before creating use-case pages; publish only pages with distinct, useful workflows and evidence rather than templated doorway copy.
- [x] Add an About/company trust surface with real ownership, location, contact, and operating information.
- [ ] Plan customer proof, integration examples, methodology notes, or benchmarks that can be substantiated; do not publish placeholder logos, testimonials, performance numbers, or compliance badges.
- [ ] Add author/reviewer attribution and update dates if an educational resource or blog is launched.
- [ ] Review public copy for vague "AI," "ISO-aligned," compliance, retention, biometric, and security claims against the product and compliance documentation.

**Acceptance criteria**

- Every new content page has a validated intent, unique value, a clear owner, and relevant internal links.
- Trust claims are traceable to product behavior, policy, customer permission, or verifiable certification.
- No scaled thin-content or near-duplicate page set is published.

### SEO-8 — Launch, measurement, and maintenance

- [ ] Verify ownership in Google Search Console and Bing Webmaster Tools without adding unnecessary tracking scripts.
- [ ] Submit the marketing and docs sitemaps, record the initial indexed-versus-expected count, and inspect canonical/indexing reports after recrawl.
- [ ] Record a pre-launch baseline for branded and non-branded impressions, clicks, indexed pages, top landing pages, conversions, and Core Web Vitals.
- [ ] If product analytics is approved, define the minimum conversion events and complete privacy/compliance review before adding any script or consent behavior.
- [ ] Add a monthly SEO maintenance checklist covering broken links, sitemap drift, accidental noindex changes, duplicate metadata, Search Console errors, content freshness, and Core Web Vitals regressions.
- [~] Review backlink and competitor-gap data with a reputable SEO tool after indexation is stable; do not make paid tooling a launch dependency.

**Phase definition of done**

- Public marketing and documentation URLs are discoverable, canonical, indexable, and represented accurately in submitted sitemaps.
- Private/product-operation routes are explicitly excluded from indexing.
- Core pages have unique metadata, valid social previews, one clear search intent, and no broken internal links.
- Structured data and performance are validated against rendered production pages.
- Search Console baseline and recurring ownership are documented.

---

## Transactional Email Frontend Phase — Account Verification, Invites, and Review Links

**Goal:** Complete the user-facing journeys initiated by transactional email:
verify a password-created account, accept a customer or platform-admin invite,
manage pending invitations, and land an authorized reviewer on the exact review
that needs attention.

**Implementation update — 2026-07-26**

- [x] FE-0 backend contract and credential-state blockers reconciled.
- [x] FE-1 typed public API methods, authenticated BFF routes, and route policy.
- [x] FE-2 password-account verification journey and dashboard banner.
- [x] FE-3 shared customer/platform invitation acceptance.
- [x] FE-4 customer pending-invitation management.
- [x] FE-5 platform-admin pending-invitation management.
- [x] FE-6 validated same-origin manual-review deep-link restoration.
- [x] FE-7 token scrubbing, noindex/referrer protection, and shared accessible
      account-action UI.
- [x] FE-8 architecture, API-contract, changelog, focused redirect tests, and
      frontend quality gates (`tsc`, ESLint with zero errors, 108 Vitest tests).
- [ ] Deployment-only validation remains: real SMTP inbox/incognito matrix,
      delivery rate-limit behavior, responsive browser review, and enabling
      `EMAIL_ENABLED` after production URLs are deployed. The in-app browser was
      unavailable in this session; live HTTP route/metadata/redirect checks
      passed locally.

### Product decision

**Problem**

- Email/password signup currently authenticates and redirects directly to the
  dashboard without telling the user that verification mail was sent.
- Customer and platform-admin invite forms still ask the inviter to create and
  share a password, which conflicts with the completed backend security model.
- There are no public routes for the links emitted in verification and invite
  emails.
- Pending invite rows have no resend/revoke controls and are presented like
  ordinary active/disabled users.
- Manual-review email links need to preserve workspace routing and authorization
  without exposing verification evidence in the email or URL.

**Assumptions**

- Google-created accounts do not see email-verification UX.
- Email action tokens are bearer secrets. They may arrive in the query string
  from email, but must be captured into memory and removed from the visible URL
  before API submission or further navigation.
- Invite acceptance is public; authentication happens after acceptance.
- Existing users must not be forced to replace a usable password. New
  passwordless invitees must set and confirm a password.
- Verification and invite pages use the existing public/auth visual language,
  are explicitly `noindex, nofollow`, and do not load analytics or third-party
  scripts.

**Options considered**

1. Build a different page and state model for every email template.
2. Build one reusable public account-action shell with separate typed flows.
3. Auto-submit every token and show only a generic success page.
4. Require login before verification or invite acceptance.
5. Forward raw tokens through new Next.js BFF routes.
6. Submit public token requests directly from `apiClient` to the backend with
   tokens in request bodies.
7. Remove acceptance pages and ask recipients to navigate manually after email.

**Recommendation — confidence: high**

Use options 2 and 6. Share the visual/state primitives, but retain distinct
routes and typed mutations for email verification, organization invite, and
platform-admin invite. Public token calls should go directly through
`apiClient` to the backend so tokens are not copied into BFF access logs or
cookies. Capture each query token once, immediately call
`history.replaceState` to remove it, and keep it only in component memory until
the action completes.

Do not start UI implementation against the current invite contract. The backend
audit found launch-blocking gaps listed in FE-0; resolving them first is cheaper
and safer than teaching the frontend to guess invite type, target id, or
password requirements.

### FE-0 — Backend contract reconciliation (launch blockers)

- [ ] Document the implemented verification and invite endpoints, request
      bodies, response bodies, typed error codes, expiry behavior, and rate
      limits in the shared `API_CONTRACTS.md`, then sync the backend/frontend
      `.agents` copies.
- [ ] Add a public organization-invite acceptance route. The
      `OrganizationService.accept_invite` service and
      `OrganizationMemberAcceptRequest` schema exist, but no API route currently
      calls them.
- [ ] Make platform-admin invitation acceptance addressable from the emailed
      URL. The email currently contains only `token`, while
      `POST /api/v1/admin/platform-admins/{platform_admin_id}/accept` also
      requires an opaque `platform_admin_id`.
- [ ] Prefer one public, purpose-bound invitation contract:
      `POST /api/v1/invitations/inspect` and
      `POST /api/v1/invitations/accept`. Inspect should return only safe fields:
      invite type, organization/display context, role, expiry,
      `requires_password`, and the post-accept login destination.
- [ ] Replace placeholder-password hash comparison with an explicit,
      reliable `requires_password`/usable-credential decision. Comparing a
      stored salted password hash with a newly salted `hash_password("")`
      cannot identify placeholder credentials.
- [ ] Define platform-admin credential behavior explicitly. Because Google
      login is not offered on the admin login surface, a Google-linked user
      invited as a platform admin still needs a usable admin password.
- [ ] Expose `email_verified` on the authenticated client-session/current-user
      contract and return a stable machine-readable error code when an
      unverified user attempts a protected action. Do not make the frontend
      infer verification state from message text.
- [ ] Wire `enqueue_manual_review_email` into the first transition to
      `manual_review`; it is currently defined but not called by the
      verification worker/services.
- [ ] Generate manual-review links with the owning workspace id:
      `/dashboard/{workspaceId}/reviews/{verificationId}`. Confirm that the
      recipient roles match the route authorization matrix.
- [ ] Set and verify the production backend `FRONTEND_BASE_URL` against the
      canonical frontend origin. Eliminate `halokyc.com` versus
      `www.halokyc.com` link drift before sending production mail.

**FE-0 exit criteria**

- An incognito browser can inspect and accept either invite type using only the
  received token.
- The inspect response determines whether a password is required without
  revealing whether unrelated accounts exist.
- Verification state is available after refresh.
- A real `manual_review` transition queues one email containing a valid
  workspace review URL.

### FE-1 — Typed API client and route policy

- [ ] Mirror the finalized backend contracts in `src/lib/api-client.ts`:
      verification request/resend response, invitation inspect/accept response,
      password requirement, and typed action errors.
- [ ] Remove `password` from `OrganizationMemberInviteRequest` and
      `PlatformAdminInviteRequest`.
- [ ] Add public `apiClient` methods for verify email, resend verification,
      inspect invite, and accept invite. Send tokens only in POST bodies.
- [ ] Add authenticated BFF handlers and `apiClient` methods for organization
      invite resend/revoke and platform-admin invite resend/revoke; reuse the
      existing httpOnly client/admin cookies.
- [ ] Update React Query hooks with narrow cache invalidation:
      organization-member list after invite/resend/revoke and platform-admin
      list after invite/resend/revoke.
- [ ] Update `src/proxy.ts` so `/admin/accept-invite` is public while all other
      protected `/admin/**` routes retain current enforcement. Add
      `/verify-email`, `/resend-verification`, and `/accept-invite` to the
      explicit public route policy.
- [ ] Add route metadata/layout coverage marking every email-action route
      `noindex, nofollow` and excluding it from sitemap generation.

### FE-2 — Password-account verification journey

- [ ] After successful email/password signup, replace the immediate dashboard
      redirect with `/verify-email/sent`. Keep the authenticated cookie, but
      explain that sensitive actions remain unavailable until verification.
- [ ] Do not put the signup email in the URL. If the same-mount UI displays a
      masked address, keep it ephemeral; the page must remain useful after a
      refresh without it.
- [ ] Add `/verify-email?token=...` using the shared public account-action shell.
      Capture and scrub the token, submit exactly once, and render processing,
      generic completion, network-retry, and missing-token states.
- [ ] Respect the backend's anti-enumeration contract: do not claim a token was
      valid when the response is intentionally generic. Use safe copy such as
      “Verification request processed” with a sign-in/dashboard action.
- [ ] Add `/resend-verification` with an email form and the same generic success
      message for existing, missing, Google, and already-verified accounts.
      Handle `429`/`Retry-After` without revealing account existence.
- [ ] Expose resend from the sent page and login surface.
- [ ] Add a persistent, dismissible verification banner in the authenticated
      client shell when `email_verified=false`, with resend action and clear
      explanation of restricted operations. Remove it immediately after session
      refresh reports verification.
- [ ] Ensure Google signup/login bypasses every verification-sent redirect and
      banner.

### FE-3 — Public invite acceptance

- [ ] Add `/accept-invite?token=...` and
      `/admin/accept-invite?token=...`, backed by a shared
      `InviteAcceptance` component and route-specific post-success destination.
- [ ] On mount, capture the raw token, scrub it from the address bar, then call
      invitation inspect. Never persist it in cookies, local storage, session
      storage, React Query cache, error telemetry, or toast text.
- [ ] Show only backend-approved context: inviter/display name, organization
      when applicable, role, and expiry. Do not decode or infer data from the
      token.
- [ ] Render password plus confirmation only when
      `requires_password=true`; use `autocomplete="new-password"` and mirror the
      backend minimum/maximum constraints.
- [ ] For existing credentialed users, present a single “Accept invitation”
      action and do not ask for or overwrite a password.
- [ ] Prevent duplicate submits and distinguish recoverable network errors from
      terminal invalid, expired, revoked, or already-used states using typed
      backend codes.
- [ ] After customer invite acceptance, direct the user to `/login` (including
      Google sign-in when applicable). After platform-admin acceptance, direct
      the user to `/admin/login`.
- [ ] Do not automatically log the recipient in from an invite bearer token;
      invite acceptance and authentication remain separate trust steps.

### FE-4 — Customer team invitation management

- [ ] Remove the initial-password field, state, validation, and explanatory copy
      from `InviteSheet`. Explain that HaloKYC emails a secure seven-day
      acceptance link and the recipient chooses credentials when required.
- [ ] On successful invite, show “Invitation sent” and refresh the member/plan
      usage data because invited seats count toward limits.
- [ ] Present `invited` with a neutral/warning pending style, not the current
      destructive style used for disabled access.
- [ ] For invited rows, replace generic enable/disable behavior with “Resend
      invite” and “Revoke invite.” Require confirmation before revocation because
      it frees the plan seat and invalidates the link.
- [ ] Disable resend while pending, surface rate-limit guidance, and avoid
      optimistic “sent” copy until the backend accepts the resend request.
- [ ] Keep role editing only if the finalized backend contract guarantees the
      pending token/email reflects the updated role; otherwise lock role changes
      until acceptance or revoke/reinvite.
- [ ] Preserve last-owner guards and prevent invited members from being counted
      as active owners.

### FE-5 — Platform-admin invitation management

- [ ] Remove the temporary-password field and all “share over a secure channel”
      copy from `/admin/platform-admins`.
- [ ] Update the invite form payload and success copy to the email-link model.
- [ ] Add pending-row resend and revoke actions for platform owners, with cache
      refresh, typed error feedback, and revocation confirmation.
- [ ] Do not allow a pending admin to be manually switched to active through the
      generic edit dialog; activation occurs only through invite acceptance.
- [ ] Present active, invited, disabled, and revoked/removed outcomes distinctly
      without introducing new design tokens.
- [ ] Keep platform-owner role guards in both the UI and BFF routes; hiding an
      action is not authorization.

### FE-6 — Manual-review email deep links

- [ ] Verify a notification link opens the exact
      `/dashboard/{workspaceId}/reviews/{verificationId}` page for an authorized
      owner, admin, or reviewer.
- [ ] Preserve the full intended path through login when the recipient is signed
      out, using a validated same-origin `returnTo` value. Reject external,
      protocol-relative, admin/client-crossing, and malformed redirect targets.
- [ ] After login/account selection, restore the review destination only when
      the selected membership can access its workspace; otherwise fall back to
      the workspace picker with a clear access message.
- [ ] Reuse existing review loading, not-found, already-decided, role-denied,
      and backend-error states. Email arrival may race another reviewer's
      decision and must not imply the item is still pending.
- [ ] Confirm no email-only query data (reason, subject, PII, or status) is
      trusted or rendered; the authenticated review endpoint remains the source
      of truth.

### FE-7 — Security, accessibility, and UX quality

- [ ] Centralize token capture/scrubbing in a small route-local helper and verify
      browser history/back navigation does not restore the secret URL.
- [ ] Ensure referrer policy prevents token-bearing URLs from being sent to
      other origins before scrubbing. Do not add analytics/session replay to
      these pages.
- [ ] Add accessible headings, associated labels/errors, live status for async
      processing, keyboard focus management, and non-color status cues.
- [ ] Reuse existing `Alert`, `Card`, `Field`, `Input`, `Button`, `Spinner`,
      `Badge`, and HaloKYC brand shell; update `frontend/DESIGN_SYSTEM.md` only
      if a genuinely new reusable primitive or token is introduced.
- [ ] Keep copy operational and precise: distinguish “email queued,”
      “invitation accepted,” “link expired,” and “sign in to continue.”
- [ ] Verify responsive behavior at narrow mobile widths and
      `prefers-reduced-motion`.

### FE-8 — Documentation, tests, and rollout

- [ ] Update `frontend/ARCHITECTURE.md` with public account-action routes, token
      handling, proxy allow-listing, session verification state, and authenticated
      deep-link restoration.
- [ ] Append frontend ADRs for direct public token submission/token scrubbing
      and safe same-origin `returnTo` restoration.
- [ ] Update `frontend/CHANGELOG.md` as each non-trivial slice lands.
- [~] Add one focused smoke test for email verification, one shared invite
      acceptance smoke covering conditional password behavior, and one
      team/admin pending-invite management smoke. Keep tests narrow per the
      development-over-testing policy.
- [ ] Manually test new user, existing password user, Google-linked customer
      user, platform-admin invitee, expired/revoked/used token, resend rate
      limit, signed-out review link, wrong-workspace review link, and
      already-reviewed session.
- [ ] Run frontend gates:
      `npx --no-install tsc --noEmit`,
      `npx --no-install eslint src`, and
      `npx --no-install vitest run`.
- [ ] Roll out in this order: verification pages → customer invites →
      platform-admin invites → manual-review deep links → persistent
      verification banner.
- [ ] Enable backend email sending for each template only after its production
      frontend URL and incognito end-to-end journey pass.

**Phase definition of done**

- Password signups clearly enter a verification journey; Google signups do not.
- Verification and invite links work from an incognito browser, scrub bearer
  tokens from the URL, and never persist them client-side.
- Inviters no longer create or share passwords.
- Pending customer/admin invitations can be resent or revoked but not manually
  activated.
- Manual-review email links survive authentication and account selection, then
  open the correct authorized workspace review.
- All public email-action routes are noindexed, accessible, responsive, and use
  typed backend contracts rather than parsing error strings.

**Risks**

- Building before FE-0 would force insecure guesses and later rework.
- Query tokens can leak through browser history, referrers, screenshots, or
  telemetry if scrubbing happens late.
- A global verification banner without a server-backed verification flag will
  become stale after refresh.
- Unvalidated `returnTo` handling would create an open redirect.
- Resend controls without clear rate-limit behavior can train users to spam the
  mailbox and reduce deliverability.

**Future considerations**

- Notification preferences and immediate-versus-digest manual-review delivery.
- Password reset and password creation outside invite acceptance.
- Admin delivery history/replay UI after a persistent backend outbox exists.
- Tenant-branded email landing pages only after there is validated enterprise
  demand.

---

## Dodo Customer Portal Frontend Phase — Invoices and Billing Self-Service

**Goal:** Give verified organization owners and admins a safe, clear route from
HaloKYC billing to Dodo's hosted billing history, downloadable invoices,
payment methods, and subscription management.

### Product decision

- Dodo remains the invoice and receipt system of record. The frontend does not
  render, proxy, cache, or store invoice PDFs or payment-method details.
- HaloKYC requests a short-lived portal session through its authenticated BFF
  and immediately navigates the current tab to the returned Dodo URL.
- The action is owner/admin-only and unavailable until the backend has a
  verified organization-to-Dodo-customer mapping.
- Receipt copy states that Dodo emails invoices after successful payments; it
  does not promise that HaloKYC SMTP sends a second receipt.

### DP-FE-0 — Backend contract dependency

- [x] Finalize and consume backend contracts:
      `GET /api/v1/billing/customer-portal` →
      `{ available: boolean, unavailable_reason:
      "no_successful_payment" | "billing_identity_conflict" | null }` and
      `POST /api/v1/billing/customer-portal` →
      `{ portal_url: string }`.
- [x] Mirror typed error codes for unavailable customer, rate limiting,
      provider failure, configuration failure, authentication, verification,
      and role denial. Do not parse human-readable messages.
- [x] Confirm the backend returns only an allow-listed HTTPS Dodo portal URL
      and never returns a Dodo customer id, invoice data, or payment details.
- [x] Confirm the Dodo portal return target is the canonical
      `/dashboard/billing` URL in each environment.

### DP-FE-1 — Typed client, BFF, and query hooks

- [x] Add `BillingPortalStatus` and `BillingPortalSessionResponse` types to
      `src/lib/api-client.ts`.
- [x] Add `GET /api/client/billing/customer-portal` and
      `POST /api/client/billing/customer-portal` BFF handlers using
      `backendClientFetch` and the existing httpOnly client cookie.
- [x] Add `apiClient.getBillingPortalStatus()` and
      `apiClient.createBillingPortalSession()`. The create request accepts no
      browser-supplied customer id, email, organization id, return URL, or
      redirect URL.
- [x] Add `useBillingPortalStatus` in `src/lib/hooks/use-billing.ts`. Create the
      portal session with a direct `apiClient` call plus component-local pending
      state so the bearer URL never enters the React Query mutation cache.
- [x] Do not store the returned portal URL in React Query cache, local storage,
      session storage, cookies, analytics, error telemetry, or toast text.

### DP-FE-2 — Billing-page experience

- [x] Add a `Manage billing & invoices` action to the Current plan/billing
      management area using existing `Button`, `Card`, `Alert`, and `Spinner`
      primitives.
- [x] Show the action only inside the existing owner/admin billing route. UI
      visibility supplements—never replaces—backend authorization.
- [x] While availability loads, render a stable loading state without
      shifting the card layout.
- [x] When `available=false`, disable portal navigation and show precise copy:
      billing history becomes available after Dodo confirms the first
      successful purchase. Do not imply that a failed/pending checkout has an
      invoice.
- [x] On click, disable duplicate submissions, request a fresh session, then
      use `window.location.assign(portal_url)` in the current tab. Do not open a
      blank tab before the URL exists.
- [x] Explain that Dodo emails invoices after successful subscription,
      renewal, and credit-pack payments and that past invoices can be
      downloaded from the portal.
- [x] On return from Dodo, refetch subscription, entitlements, portal status,
      and credit ledger so cancellation/payment changes do not leave stale UI.
- [x] Render actionable typed failures:
      retry after rate limit/provider failure, finish a successful purchase when
      no customer exists, verify email when required, and contact support for a
      billing-identity integrity block.
- [ ] Manually verify narrow-mobile wrapping and reduced-motion behavior.

### DP-FE-3 — Checkout and receipt clarity

- [x] Add checkout copy stating which successful events generate a Dodo invoice
      without claiming that an invoice exists before webhook confirmation.
- [x] After returning from checkout, use server-backed subscription/ledger
      state as the source of truth. Do not trust Dodo return query parameters to
      mark payment successful or grant credits.
- [x] Provide a neutral processing state when the browser returns before the
      webhook, with a refresh/retry path instead of an optimistic “paid” toast.
- [x] Do not create a separate HaloKYC invoice-history table or duplicate Dodo
      invoice rows in the credit-ledger UI.
- [x] Keep HaloKYC credit-ledger entries distinct from financial receipts:
      ledger rows explain entitlement movement; Dodo invoices prove payment.

### DP-FE-4 — Tests, documentation, and rollout

- [x] Add focused API/BFF tests for status, successful portal-session proxying,
      typed failures, and absence of browser-controlled customer/redirect data.
- [x] Add focused BillingPanel tests covering unavailable state, successful
      session creation, and current-tab navigation. Duplicate submission and
      provider-error behavior are enforced in the component and remain part of
      the manual journey below.
- [x] Verify owner/admin route scoping and rely on the backend's tested
      reviewer/developer denial without expanding frontend authorization.
- [x] Update `API_CONTRACTS.md`, `frontend/ARCHITECTURE.md`, append a frontend
      ADR, update `features/10-credits-billing.md`, and
      `frontend/CHANGELOG.md`.
- [x] Run frontend gates:
      `npx --no-install tsc --noEmit`,
      `npx --no-install eslint src`, and
      `npx --no-install vitest run`.
- [ ] Manually test test-mode subscription purchase, renewal fixture,
      credit-pack purchase, invoice email, portal download, cancellation,
      payment-method update, signed-out access, wrong-role access, no-customer
      state, provider failure, and return to HaloKYC.
- [ ] Enable the frontend action only after the backend migration and canonical
      customer-id population are deployed and test-mode portal journeys pass.

**Phase definition of done**

- A verified owner/admin can open the correct Dodo portal from HaloKYC with one
  action and return safely to the billing page.
- Customers can find and download subscription and credit-pack invoices without
  contacting support.
- The UI clearly distinguishes HaloKYC credit-ledger activity from Dodo payment
  receipts and never marks a return-query parameter as payment truth.
- No customer id, portal bearer URL, invoice PDF, or payment-method detail is
  persisted or exposed by frontend code.

**Risks**

- Portal sessions are bearer links with financial-management capability.
- Checkout return can race webhook delivery and temporarily show stale state.
- External Dodo email/branding configuration can drift without a code change.
- “Receipt,” “invoice,” and “credit ledger” are different artifacts and unclear
  copy will create support and accounting confusion.

(End of file)
