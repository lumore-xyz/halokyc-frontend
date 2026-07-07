# Webhooks

**Status:** ✅ Implemented

HMAC-signed, session-scoped callback delivery for final verification verdicts. Webhook URLs are entered on the client dashboard and scoped to the session — not persisted in `localStorage`.

## What it does
- Each verification session can carry one callback URL
- Worker dispatches the final verdict after terminal decision (approved / rejected / manual_review / awaiting_credits)
- Payload signed with HMAC; signature delivered in `X-Verification-Signature` header
- Delivery attempts tracked in `webhook_deliveries` table; retries handled by the worker
- Callback URLs are scoped to the session and discarded on success/failure; never persisted in browser storage

## Key endpoints
- `POST /api/v1/workspaces/{workspace_id}/webhooks` — register callback URL
- `GET /api/v1/workspaces/{workspace_id}/webhooks` — list registered webhooks
- `DELETE /api/v1/workspaces/{workspace_id}/webhooks/{webhook_id}` — remove

## Frontend pages
- `/dashboard/webhooks` — webhook registration + log viewer

## Implementation notes
- Webhook secret is workspace-scoped and shared across the workspace's sessions
- Frontend redacts the last 4 chars of any webhook secret in debug surfaces
- Server-side `WebhookDelivery` rows record: `verification_id`, `url`, `status_code`, `attempt_count`, `last_attempt_at`, `error_message`
- Platform admin can view webhook delivery logs across all tenants at `/admin/webhook-deliveries`

## Related
- [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §2.9
- [`API_CONTRACTS.md`](API_CONTRACTS.md) §Webhooks
- [`backend/DATABASE_SCHEMA.md`](backend/DATABASE_SCHEMA.md) `webhook_deliveries`
- [`backend/DECISIONS.md`](backend/DECISIONS.md) ADR-004 (HMAC signing)
- [`AI_RULES.md`](AI_RULES.md) §"Security Rules" (webhook signing)
