# Transactional Email Frontend Decisions

> Supplemental ADR record. The legacy `DECISIONS.md` contains non-UTF-8 control
> bytes and cannot be safely patched without normalizing unrelated historical
> content.

## ADR-F031: Submit public email-action tokens directly and scrub their URLs

**Status:** Accepted
**Date:** 2026-07-26

Verification and invitation bearer tokens are submitted from public route
components directly to backend POST endpoints. A shared hook captures the token
in component memory and removes it from the address bar before inspection or
acceptance. Public actions do not traverse the authenticated Next.js BFF,
cookies, browser storage, React Query keys, or telemetry.

## ADR-F032: Restore only validated client dashboard destinations

**Status:** Accepted  
**Date:** 2026-07-26

The login proxy may preserve an intended client destination only when it is a
relative `/dashboard` path. Protocol-relative, absolute, malformed,
admin-crossing, and dashboard-prefix lookalike destinations are rejected. The
destination is held temporarily in session storage through unified account
selection, consumed once for a client account, and cleared for an admin account.

## ADR-F033: Navigate directly to a server-brokered Dodo portal

**Status:** Accepted  
**Date:** 2026-07-26

Only the authenticated BFF may request a Dodo portal session. The browser sends
no customer identity or redirect target. The billing page uses component-local
pending state—not a React Query mutation—to receive the short-lived bearer URL
and immediately navigates the current tab. Dodo remains the invoice/PDF and
payment-management authority; HaloKYC's ledger remains the entitlement record.

## ADR-F034: Present account assurance as one ordered verification journey

**Status:** Accepted
**Date:** 2026-08-04

Account navigation exposes `/dashboard/verification` before Settings. The page
shows verified email first and account identity second; step 2 stays locked
until email verification completes. The persistent dashboard banner links to
this page and disappears only after both checks complete. UI state guides the
customer, while backend authorization remains final.
