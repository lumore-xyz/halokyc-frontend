# Compliance Surfaces

**Status:** ✅ Implemented

Privacy dashboard, data subject request (DSR) queue, retention configuration, consent capture, and cookie consent banner. Backend routes, frontend BFF handlers, and pages are all live. The data export engine and retention engine are also shipped.

## What it does

### Privacy Dashboard (subject-facing)
- Data summary: shows what personal data is held, why, and when it was captured
- DSR creation: subjects can submit erasure, export, or withdraw-consent requests
- Subject PIN gate: `POST /api/v1/privacy/access-token` validates a 6-digit PIN against the scoped session and mints a short-lived bearer token
- Request status timeline: pending → processing → completed

### DSR Management (operator-facing)
- Filterable DSR queue for platform admins
- Export approval workflow: sensitive exports require `platform_owner` role to approve
- Rejection notes for declined requests
- Erasure dispatch: `ComplianceEngine.process_approved_request` deletes session, file, embedding, and webhook rows scoped to the subject

### Data Export Engine
- `ComplianceEngine.build_export_archive` builds a subject-scoped ZIP under `storage_root/exports/<request_id>.zip` with `summary.json` manifest
- Export approval triggers synchronous generation inside the DSR decision transaction; rollback removes partial archives

### Retention Engine
- `purge_expired_evidence()` reads the effective `RetentionPolicy` and deletes expired `VerificationFile` rows + on-disk files, orphaned `FaceEmbedding` rows not held for active bans, and webhook/audit log rows past their retention window
- Configurable per scope: global, organization, or workspace
- Policy changes take effect on the next run only; do not retroactively purge already-committed evidence

### Consent Capture (`/verify`)
- `ConsentCard` step in `/verify` before biometric capture
- Explicit non-pre-ticked checkbox gating the "Proceed" affordance
- Audit record: `policy_version`, `consent_timestamp`, `device_id`, `session_id` stored in `sessionStorage` and re-collected on re-entry; IP captured server-side
- Document-only workflows skip the consent step (no biometric processing = no consent required)

### Cookie Consent Banner
- Selective category opt-in on `/` (public landing only)
- `essential` always on; `analytics` default off, opt-in
- Preference persisted in `localStorage` under `halokyc.cookieConsent`; versioned with `policy_version`

## Key endpoints
- `POST /api/v1/privacy/access-token` — subject PIN → bearer token
- `GET /api/v1/privacy/summary` — subject data summary
- `GET /api/v1/privacy/requests` — subject DSR list
- `POST /api/v1/privacy/requests` — subject DSR creation
- `GET /api/v1/admin/dsr` — platform DSR queue
- `POST /api/v1/admin/dsr/{request_id}/decision` — approve / reject
- `GET /api/v1/admin/retention` — retention policy list
- `PUT /api/v1/admin/retention` — update retention policy
- `GET /api/v1/admin/retention/effective` — resolve effective policy for a scope

## Frontend pages
- `/privacy` — public privacy policy
- `/privacy/dashboard` — subject-facing DSR surface (gated behind `enablePrivacyDashboard` env flag; defaults `false` in non-production)
- `/admin/dsr` — platform admin DSR queue
- `/admin/retention` — retention policy configuration

## Implementation notes
- Frontend BFF routes exist at `src/app/api/privacy/summary`, `src/app/api/privacy/requests`, `src/app/api/admin/dsr`, `src/app/api/admin/dsr/[id]/decision`, `src/app/api/admin/retention`, `src/app/api/admin/retention/effective`
- Hooks in `src/lib/hooks/use-privacy-dashboard.ts` and `src/lib/hooks/use-compliance-admin.ts` are the only call sites for the typed fetchers
- Destructive actions wired with `useMutation` but mutationFn throws until backend exists; buttons stay disabled with a tooltip explaining why
- `/privacy/dashboard` page renders a friendly "not yet available" placeholder when `enablePrivacyDashboard` is `false`

## Related
- [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §2.10, §9, §14 (compliance)
- [`API_CONTRACTS.md`](API_CONTRACTS.md) §Compliance (Future API Contract section)
- [`COMPLIANCE.md`](COMPLIANCE.md) full legal framework, data governance, future API contract, implementation tracker
- [`frontend/DECISIONS.md`](frontend/DECISIONS.md) ADR-F024 (consent step), ADR-F025 (cookie banner), ADR-F026 (stub-then-activate)
- [`TODO.md`](TODO.md) §5 (compliance and security)
