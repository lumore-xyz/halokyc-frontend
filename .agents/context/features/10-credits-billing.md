# Credits, Billing & Usage

**Status:** ✅ Implemented

Organization-level credit wallet with bucketed credits, reservation/settlement ledger, credit-backed deferred processing, and admin-managed billing catalog.

## What it does
- **Three buckets, one wallet:** `free`, `subscription`, `purchased` credits consumed FIFO
- **Reservation:** `POST /verifications/start` reserves one credit (default) before queuing the worker
- **Settlement:** worker completion releases the reservation and creates a `SETTLEMENT` ledger entry
- **Credit backlog (`awaiting_credits`):** active organizations can start sessions and upload evidence even when the wallet is empty; sessions queue and drain FIFO when new credits arrive
- **Admin credit adjustment:** `POST /admin/billing/credits/adjust` adds or removes credits manually (creates `ADJUSTMENT` entry)
- **Billing catalog:** admin-managed rows for Dodo product IDs, prices, and credit values; surfaced in client-facing `GET /billing/catalog`

## Plans (configured via `BillingCatalogItem` rows)
| Plan | Price/mo | Credits | Rollover cap |
|------|----------|---------|--------------|
| Sandbox | $0 | 1,000 | None |
| Launch | $49 | 1,500 | 15,000 |
| Growth | $149 | 6,000 | 60,000 |
| Scale | $399 | 20,000 | 200,000 |
| Enterprise | Custom | Custom | SLA + support |

## Credit packs (one-time purchase)
| Pack | Price | Credits |
|------|-------|---------|
| Starter | $25 | 500 |
| Build | $49 | 1,250 |
| Growth | $99 | 3,000 |
| Scale | $249 | 10,000 |
| Volume | $499 | 25,000 |

## Key endpoints
- `GET /api/v1/organizations/{id}/credits` — client-facing balance
- `GET /api/v1/billing/catalog` — public plans + credit packs
- `POST /api/v1/billing/checkout/subscription` — Dodo checkout for monthly plan
- `POST /api/v1/billing/checkout/credits` — Dodo checkout for credit pack
- `GET /api/v1/billing/subscription` — current subscription status
- `GET /api/admin/billing/credits` — admin ledger
- `POST /api/admin/billing/credits/adjust` — admin manual adjustment
- `GET /api/admin/billing/catalog` — admin catalog management
- `GET/PUT /api/admin/credit-ledger` — full append-only ledger

## Frontend pages
- `/dashboard/billing` — plan display, credit balance, checkout actions (subscription + credit pack)
- `/admin/billing` — admin catalog, credit adjustment, ledger

## Implementation notes
- Ledger (`credit_ledger_entries`) is the single auditable record; all displayed balances are derived from it
- Stale reservations auto-released after 60 minutes; credit reads run the same cleanup as a safety net
- Subscription credits are entitlement, not prepayment: granted by billing webhook via `grant_subscription_monthly(monthly_plan_credits)`
- Purchased credits persist until consumed; refunds via admin adjustment only
- Low-credit alert email: trigger does not exist yet (see `EMAILS_NEEDED.md`)
- Subscription lifecycle (renewal, cancellation, upgrade/downgrade) is managed externally via Dodo webhooks; HaloKYC ledger reacts to webhook events

## Related
- [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §2.8, §6 (credit backlog rules), §13 (credit model), §14 (compliance)
- [`API_CONTRACTS.md`](API_CONTRACTS.md) §Billing, §Credits
- [`backend/DATABASE_SCHEMA.md`](backend/DATABASE_SCHEMA.md) `client_credit_accounts`, `credit_ledger_entries`, `credit_reservations`, `billing_*`
- [`backend/DECISIONS.md`](backend/DECISIONS.md) ADR-024 (buckets + ledger), ADR-028 (stale release), ADR-033 (awaiting credits)
- [`TODO.md`](TODO.md) §5 (credits), §12 (credit backlog)
