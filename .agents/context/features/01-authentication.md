# Authentication & Account Selection

**Status:** ✅ Implemented

Database-backed login for both client (organization) members and platform admins. Users who hold both roles see a selector screen on first visit.

## What it does
- Email/password authentication backed by the `users` table
- Separate JWT issuance paths for client sessions (cookie) and platform admin sessions (cookie)
- Account switcher for users who are both organization members and platform admins
- Session hooks expose `userId`, `organizationId`, member role, and available workspaces (client) or `userId` and platform role (admin)

## Key endpoints
- `POST /api/v1/auth/login` — client or admin credential check
- `POST /api/v1/auth/select-account` — pick client or admin profile
- `POST /api/v1/auth/admin/token` — platform admin login (database-backed)
- `GET /api/v1/auth/me` — current client member profile
- `GET /api/v1/auth/admin/me` — current platform admin profile

## Frontend pages
- `/login` — login form
- `/select-account` — account switcher

## Implementation notes
- JWTs are stored in httpOnly cookies; browser JavaScript never reads them directly
- Legacy `/me` routes kept as compatibility wrappers
- Client JWTs carry `user_id`, `organization_id`, member role, and allowed workspace ids
- Platform admin JWTs carry `user_id` and platform role

## Related
- [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §2.7 (RBAC), §3 (Personas)
- [`API_CONTRACTS.md`](API_CONTRACTS.md) §Auth
- [`backend/DECISIONS.md`](backend/DECISIONS.md) ADR-007 (JWT cookie storage), ADR-009 (database-backed admin auth)
- [`frontend/DECISIONS.md`](frontend/DECISIONS.md) ADR-F001 (account selection UX)
