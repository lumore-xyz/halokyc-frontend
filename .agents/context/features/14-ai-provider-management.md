# AI Provider Management

**Status:** ✅ Implemented

Platform admin surfaces for managing AI model providers and their stored API keys. Supports multi-provider routing for the agentic adjudication layer.

## What it does
- View registered AI providers and their associated keys
- Delete unused or compromised providers
- Delete individual provider keys
- Smoke-test a provider/key pair: sends a tiny prompt to validate the credential
- Toggle provider status (active / inactive) for maintenance or budget control
- Per-provider quota, cooldown, and budget guard enforced in `ai_provider_service`

## Key endpoints
- `GET /api/v1/admin/ai-providers` — list providers
- `POST /api/v1/admin/ai-providers` — register provider
- `PATCH /api/v1/admin/ai-providers/{provider_id}` — update
- `DELETE /api/v1/admin/ai-providers/{provider_id}` — remove provider
- `DELETE /api/v1/admin/ai-providers/{provider_id}/keys/{key_id}` — remove key
- `POST /api/v1/admin/ai-providers/{provider_id}/keys/{key_id}/test` — smoke test

## Frontend pages
- `/admin/ai-providers` — provider list + management

## Implementation notes
- Provider credentials stored encrypted in `ai_provider_keys`
- Default configured model: Gemma 4 (when available in the selected Google API account); overrideable
- Provider create/edit/key drawers must use an internal scroll area so long forms remain reachable on short viewports
- Provider/key metadata (name, latency, token/cost estimate, fallback reason) shown only to `platform_owner` and `platform_business_admin`
- Budget and quota guard runs before every model call; no-cost fallback to deterministic risk engine when exceeded

## Related
- [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §2.1 (agentic review layer), §9 (security)
- [`API_CONTRACTS.md`](API_CONTRACTS.md) §Admin — AI providers
- [`backend/DATABASE_SCHEMA.md`](backend/DATABASE_SCHEMA.md) `ai_providers`, `ai_provider_keys`
- [`backend/DECISIONS.md`](backend/DECISIONS.md) ADR-014 (multi-provider registry)
- [`TODO.md`](TODO.md) §9.3 (model provider & cost controls), §13 (platform AI provider operations)
