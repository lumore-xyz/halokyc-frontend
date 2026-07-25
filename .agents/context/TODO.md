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

(End of file - total 138 lines)