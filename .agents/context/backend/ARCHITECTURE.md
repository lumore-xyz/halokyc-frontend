# ARCHITECTURE.md

# Architecture

**See also:** [`AI_RULES.md`](AI_RULES.md) (backend architecture rules) · [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §2.1–2.12 (capabilities) · [`API_CONTRACTS.md`](API_CONTRACTS.md) (route contracts) · [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) (table refs) · [`DECISIONS.md`](DECISIONS.md) (ADR index) · [`TODO.md`](TODO.md) (implementation status) · [`MONITORING.md`](MONITORING.md) (observability) · [`AUTOMATION_STRATEGY.md`](AUTOMATION_STRATEGY.md) (agentic adjudication strategy)

## Overview

This project is a budget KYC / human verification SaaS MVP.

It uses a "Policy-Driven" architecture where Clients define a **Workflow** (set of required AI services), and the system executes that specific journey for the end-user.

The system is divided into three operational loops:
1. **Platform Admin**: Infrastructure, Client onboarding, and system health.
2. **Client Orchestration**: Workflow design, API key management, and User review/decisioning.
3. **Verification Engine**: AI-powered evidence processing and risk scoring.

It uses:

- FastAPI for backend API
- PostgreSQL for persistent data
- pgvector for face embeddings
- Redis for queue broker/cache
- Celery or RQ for background AI jobs
- Local file storage for MVP
- Open-source AI models for OCR, face matching, and liveness

## Project Structure

```txt
app/
  main.py
  core/
    config.py
    security.py
    logging.py
  db/
    session.py
    models.py
    enums.py
    migrations/
  api/
    v1/
      routes/
        auth.py             # POST /auth/admin/token, /auth/login (unified)
        clients.py          # POST/GET/PATCH /clients, phase, api-keys
        client_auth.py      # POST /auth/client/token, /auth/client/signup
        client_self.py      # /me/* legacy self-service
        organizations.py    # GET/POST/PATCH /organizations/{id}/members
        verification.py
        workspaces.py       # /workspaces, /workspaces/{id}/workflows,
                            #   api-keys, reviews, verifications,
                            #   webhooks, analytics, audit-logs
        workflows.py
        admin.py            # /admin/* platform console
        health.py
  schemas/
    verification.py
    client.py
    auth.py
    admin.py
  services/
    storage_service.py
    ocr_service.py
    face_service.py
    liveness_service.py
    duplicate_service.py
    risk_service.py
    webhook_service.py
    admin_service.py
    client_service.py      # Admin client management
    organization_service.py  # Org profile + member lifecycle
    workspace_service.py   # Workspace CRUD and access checks
    authorization_service.py  # Fixed RBAC helpers
    credit_service.py      # Bucketed credit account + ledger
    auth_service.py        # User login, token creation, bootstrap
  workers/
    tasks.py
    celery_app.py
  utils/
    image.py
    errors.py
  tests/

scripts/                   # Idempotent dev seeder + retention scripts
  seed.py                  # `uv run seed` - bootstraps first platform_owner
  retention.py             # `purge-webhook-logs`; biometric purge retired by ADR-030
```

`scripts/` is shipped in the wheel (`[tool.hatch.build.targets.wheel]
packages = ["app", "scripts"]`) and exposes console scripts
`seed` and `purge-webhook-logs`. The old fixed-window biometric purge is
retired by ADR-030; biometric/session deletion now belongs to explicit subject
lifecycle actions.

## Three Identity Surfaces

Three operational identity surfaces coexist; each has its own route
namespace and authorization dependency.

```txt
User
  -> OrganizationMember (client role)
      -> Organization
          -> Workspace
              -> workflows, api_keys, verification_sessions, webhooks,
                 reviews, analytics, workspace audit logs
      -> CreditAccount (org-level wallet, free/subscription/purchased)

User
  -> PlatformAdmin (platform role)
      -> platform admin dashboard access
```

Surface contracts:

| Surface | Cookie / Header | Dependency | Bootstrap |
| --- | --- | --- | --- |
| Developer API | `X-API-Key` header | `require_api_client` / `require_api_workspace` | API key resolves `organization_id` + `workspace_id` server-side |
| Admin | `halokyc_admin` httpOnly cookie | `require_platform_admin` | Env vars bootstrap the first `platform_owner` when none exists |
| Customer member | `halokyc_client` httpOnly cookie | `require_client_member` | Signup creates the org, owner, and default workspace atomically |

Roles are fixed in code:

- Customer: `client_owner`, `client_admin`, `client_reviewer`,
  `client_developer` (`AuthorizationService`).
- Platform: `platform_owner`, `platform_business_admin`,
  `platform_support`, `platform_sales`.

Permission sets live in `app/services/authorization_service.py`
(`WORKSPACE_MANAGERS`, `INTEGRATION_MANAGERS`, `REVIEWERS`,
`SENSITIVE_EVIDENCE_VIEWERS`, `AUDIT_VIEWERS`, plus platform counterparts).
Routes call `require_role(...)` before service logic; backend 403s are
authoritative.

## Main Flow

```txt
Client defines a Workflow (e.g. "Standard-KYC")
        ↓
Client starts session via API with `workflowId`
        ↓
Backend reserves credits from the org's wallet (free → subscription → purchased)
        ↓
User lands at /verify (UI adapts to Workflow services)
        ↓
User uploads evidence based on Workflow requirements
        ↓
Files are stored securely
        ↓
Background job is queued
        ↓
AI Services run (only those defined in the Workflow)
        ↓
Risk score is calculated
        ↓
Terminal status (Approved/Rejected) or Manual Review
        ↓
If Manual Review: Client team approves/rejects via Dashboard
        ↓
Backend settles or releases the credit reservation
        ↓
Webhook is sent to client backend
```

## Backend Layers

### API Layer

Location:

```txt
app/api/v1/routes/
```

Responsibilities:

- Define HTTP endpoints
- Validate authentication
- Accept request payloads
- Return response schemas
- Call service layer

Routes should not contain heavy business logic.

### Schema Layer

Location:

```txt
app/schemas/
```

Responsibilities:

- Pydantic v2 request schemas
- Pydantic v2 response schemas
- Shared enums
- API validation

### Service Layer

Location:

```txt
app/services/
```

Responsibilities:

- Business logic
- AI model wrappers
- Risk scoring
- Webhook delivery
- Storage abstraction
- Duplicate detection

### Worker Layer

Location:

```txt
app/workers/
```

Responsibilities:

- Background verification processing
- Running OCR/face/liveness checks
- Updating verification status
- Triggering webhook delivery

### Database Layer

Location:

```txt
app/db/
```

Responsibilities:

- SQLAlchemy/SQLModel models
- DB session management
- Alembic migrations

## Infrastructure

Local development should use Docker Compose with:

- API container
- Worker container
- PostgreSQL container
- Redis container

## Storage

MVP storage:

```txt
storage/
  verifications/
    {verification_id}/
      selfie.jpg
      id_front.jpg
      id_back.jpg
```

Storage must be abstracted through:

```txt
storage_service.py
```

Do not access files directly from route handlers.

## Embeddings

Preferred:

- PostgreSQL + pgvector

Fallback:

- Qdrant only if pgvector is not practical

Face embeddings should be searchable by client only.

Duplicate detection must not leak matches across clients.

## Authentication

All three surfaces are enforced at the route layer via
`app/api/dependencies.py`. See the "Three Identity Surfaces" section
above for the full contract. Briefly:

- **Developer / API key** (`require_api_client`,
  `require_api_workspace`): header `X-API-Key`, SHA-256 hash stored in
  `api_keys.key_hash`. Active client only; revoked
  (`revoked_at IS NOT NULL`) or expired keys fail with 401.
- **Admin / JWT** (`require_platform_admin`): `Authorization: Bearer
  <jwt>` with `token_type: "admin"`. JWTs carry `user_id`,
  `platform_admin_id`, and `platform_role`, and the dependency reloads
  the active `users` / `platform_admins` rows before allowing access.
  The configured env admin credentials only bootstrap the first
  `platform_owner` when no platform owner exists.
- **Customer member / JWT** (`require_client_member`):
  `Authorization: Bearer <jwt>` with `token_type: "client"`. JWT
  carries `user_id`, `organization_id`, and `organization_member_id`.
  Inactive organization, inactive member, or disabled user returns 403.

Raw API key, member password, and admin password are never persisted.

## Logging

Use structured logging through:

```txt
app/core/logging.py
```

Do not print sensitive information.

Never log:

- Raw API keys
- Full document numbers
- Full image paths if sensitive
- Webhook secrets

## Customer Console Surface (Organization + Workspace + RBAC)

The customer surface is workspace-first inside a single organization. Each
organization owns billing, the credit wallet, members, and one or more
workspaces; each workspace owns product configuration (workflows, API keys,
webhooks, sessions, reviews).

Routes split across two namespaces:

- `/api/v1/organizations/{organization_id}` — org profile, member listing,
  invites, role changes. Owner/admin only for mutations; any active member
  may read their own org and members.
- `/api/v1/workspaces/{workspace_id}` — workspace-scoped workflows, API
  keys, webhooks, verifications, reviews, analytics, and audit logs.
  Authorization gates per route per role group; cross-org or
  cross-workspace access returns 404 to avoid leaking membership.

External verification APIs (`/api/v1/verifications/...`, `/api/v1/workflows/...`)
omit tenant ids. The API key resolves `organization_id`,
`workspace_id`, `environment`, and `api_key_id` server-side, and the
workspace's `legacy_client_id` keeps older data visible during migration.

Service ownership stays thin-route / service-heavy:

- `organization_service.py` — org profile, member lifecycle
  (list/invite/update).
- `workspace_service.py` — workspace CRUD and access checks.
- `auth_service.py` — user login, platform/member token creation, bootstrap,
  workspace API key issuance, signup that creates the first owner + default
  workspace atomically.
- `authorization_service.py` — fixed permission sets for client and platform
  roles.
- `credit_service.py` — bucketed credit wallet (free/subscription/purchased)
  with reserve / settle / release lifecycle, stale reservation timeout
  cleanup, active reserved-session reporting, and append-only ledger.

Sensitive KYC evidence access is role-filtered: only
`SENSITIVE_EVIDENCE_VIEWERS` (owner/admin/reviewer) reach
`/workspaces/{id}/verifications/{vid}/files/{file_id}`.

Subject lifecycle controls are planned as workspace-scoped service logic:
reset/full deletion remove a subject's verification sessions and embeddings,
while soft/permanent ban removes session artifacts but preserves minimized
tenant-scoped ban-match embeddings. These operations should live in a dedicated
service boundary (for example `subject_lifecycle_service.py`) called by thin
developer-API and workspace-dashboard routes, and must emit audit logs.

The legacy `clients` / `client_users` model remains migration scaffolding
during rollout but is no longer the long-term tenant boundary.

## Future Decisions
