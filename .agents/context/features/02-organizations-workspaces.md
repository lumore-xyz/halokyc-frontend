# Organization & Workspace Management

**Status:** ✅ Implemented

Client organizations own members, billing, and workspaces. Workspaces scope all product resources (workflows, API keys, verification sessions, webhooks, reviews, analytics, audit events).

## What it does
- Organization CRUD with status lifecycle (active, suspended, etc.)
- Workspace CRUD scoped under an organization
- Organization member management with fixed roles: `client_owner`, `client_admin`, `client_reviewer`, `client_developer`
- Workspace switcher in the client sidebar showing selected workspace and parent organization
- Route guards redirect to workspace selection when the current route is unavailable to the user's role or workspace

## Key endpoints
- `GET/POST /api/v1/organizations`
- `GET/PATCH /api/v1/organizations/{id}`
- `GET/POST /api/v1/workspaces`
- `GET/PATCH /api/v1/workspaces/{workspace_id}`
- `POST /api/v1/organizations/{id}/members` (invite / role assignment)
- Workspace-scoped child resources: workflows, API keys, verifications, reviews, webhooks, audit-logs, credit

## Frontend pages
- `/dashboard/workspaces` — workspace list
- `/dashboard/team` — organization members
- `/dashboard/settings` — organization settings

## Implementation notes
- URL state persists the selected workspace; no global client-state library introduced
- Backend is authoritative for workspace scoping; frontend route hiding is UX only
- Existing `clients` table retained as a migration bridge during backfill
- Existing `/me` routes kept as compatibility wrappers

## Related
- [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §4 (Organization, Workspace, RBAC)
- [`API_CONTRACTS.md`](API_CONTRACTS.md) §Organizations, §Workspaces
- [`backend/DATABASE_SCHEMA.md`](backend/DATABASE_SCHEMA.md) `organizations`, `workspaces`, `organization_members`
- [`backend/DECISIONS.md`](backend/DECISIONS.md) ADR-010 (organization-first model)
- [`frontend/DECISIONS.md`](frontend/DECISIONS.md) ADR-F007 (workspace switcher)
