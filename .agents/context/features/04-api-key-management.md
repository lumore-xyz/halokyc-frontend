# API Key Management

**Status:** ✅ Implemented

Workspace-scoped API keys authenticate public verification requests. Each key carries an environment (`test` / `live`), a workspace assignment, and usage attribution.

## What it does
- Create / rotate / revoke API keys per workspace
- Keys are hashed (bcrypt/argon2) in the database; raw key shown only once at creation
- Environment support: `test` keys for sandbox, `live` keys for production
- Keys resolve `organization_id`, `workspace_id`, `environment`, and `api_key_id`; callers never provide tenant ids
- Developer-visible only; sensitive KYC evidence access is excluded by default

## Key endpoints
- `GET/POST /api/v1/workspaces/{workspace_id}/api-keys`
- `GET/PATCH/DELETE /api/v1/workspaces/{workspace_id}/api-keys/{key_id}`
- External (no JWT): `/api/v1/verifications/start`, `/api/v1/verifications/{id}/upload`, `/api/v1/verifications/{id}/config`, `/api/v1/verifications/{id}` — auth via `X-API-Key` header

## Frontend pages
- `/dashboard/api-keys` — key management (list + create + revoke)

## Implementation notes
- API keys live in `sessionStorage` (`halokyc.apiKey`) on the frontend; cleared on tab close
- Never logged; last 4 characters redacted in any debug surface
- Compliance audit log entry for every key creation, rotation, and revocation

## Related
- [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §2.9 (webhooks share auth model)
- [`API_CONTRACTS.md`](API_CONTRACTS.md) §API Keys, §Verifications (public)
- [`backend/DATABASE_SCHEMA.md`](backend/DATABASE_SCHEMA.md) `api_keys`
- [`AI_RULES.md`](AI_RULES.md) §"Security Rules" (API keys)
