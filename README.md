# HaloKYC Dashboard (Frontend)

This is a [Next.js](https://nextjs.org) 16 dashboard for HaloKYC - start verifications, inspect results, manage client API keys, and operate the manual-review queue.

## Getting Started

First, install dependencies and start the dev server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Backend Configuration

The frontend communicates with the HaloKYC FastAPI backend via:
- `NEXT_PUBLIC_API_BASE_URL` env var
- Cookie-based auth (`halokyc_admin`/`halokyc_client`)

### `NEXT_PUBLIC_API_BASE_URL`
Default: `http://localhost:8000`. Override in `.env.local`.

### Cookie Security
The dashboard uses two `httpOnly`, `Secure` cookies set by the BFF:
| Cookie           | Set by                                | Security Notes |
| ---------------- | ------------------------------------- | -------------- |
| `halokyc_admin`  | `POST /api/admin/login`               | `SameSite=Lax` |
| `halokyc_client` | `POST /api/client/login`              | `SameSite=Lax` |

## Manual Review Queue

Admins can access pending/scheduled verifications through the dashboard at `/admin/review`:

1. Filter by status (`pending`, `manual_review`, `processing`)
2. Sort by risk score, creation date, or submission time
3. View batch-level statistics (total pending, average review time)
4. Adjust single/multi-selection decisions:
   - Approve: Sets status to `approved` with audit log
   - Reject: Sets status to `rejected` with required `reason` field
   - Assign to team: Move to specific operator's review queue
5. Expose evidence details for each verification:
   - Document hash, DOB, risk score, and audit trail
6. Support batch operations:
   - Bulk approve/reject with filters
   - Export to CSV with evidence hashes
7. Audit trail visibility:
   - Click-through to `/admin/audit-logs` for cascading context
8. Alert system:
   - Email notifications for new manual reviews
   - Dashboard badges for un-reviewed sessions## Verifying Without the Backend

Use `pnpm typecheck`, `pnpm lint`, and `pnpm test` to validate without running the API.

## Project Scripts

| Script           | What it does                                            |
| ---------------- | ------------------------------------------------------- |
| `pnpm dev`       | Start the Next.js dev server on port 3000               |
| `pnpm build`     | Production build                                         |
| `pnpm start`     | Run the production build                                 |
| `pnpm lint`      | ESLint                                                   |
| `pnpm typecheck` | `tsc --noEmit`                                           |
| `pnpm test`      | Vitest run (watch mode)                                  |

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [HaloKYC backend README](../backend/README.md)

## Deploy on Vercel

Set `NEXT_PUBLIC_API_BASE_URL` to your backend's URL before deployment.