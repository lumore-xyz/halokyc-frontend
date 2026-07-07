# frontend/AGENTS.md

Frontend-specific notes for agents working in `frontend/`. The
shared rules live in `../AGENTS.md` and `.agents/context/AI_RULES.md`;
this file adds the rules that are specific to Next.js 16.

## Next.js 16 — read the docs first

This codebase ships Next.js 16, not the version in older training
data. Before writing any routing, data fetching, or metadata code,
read the relevant guide under
`frontend/node_modules/next/dist/docs/`. The deprecation notices in
that folder are the source of truth for what is removed in 16.

The two patterns that catch agents most often:

- `cookies()` and `headers()` are **async**. Always `await` them.
- Dynamic route params come through `RouteContext<'/path/[id]'>` with
  an async `params` field. Pattern:

  ```ts
  type PageProps = { params: Promise<{ id: string }> };
  export default async function Page({ params }: PageProps) {
    const { id } = await params;
    // ...
  }
  ```

## Component conventions

- Default to Server Components. Add `"use client"` only when state,
  effects, browser APIs, or event handlers are needed.
- Props are typed with `type`, never `interface`, except when
  extending a third-party contract.
- Use named exports, not default exports, for everything except
  `page.tsx` and `layout.tsx` (Next.js routing requires a default
  export there).
- Compose, do not duplicate: a new variant is a CVA entry, not a
  forked component.
- Co-locate feature components under `src/app/<route>/_components/`
  (Next.js private folder convention).
- `src/components/ui/` is the only folder allowed to import from
  `@base-ui/react`. Feature code consumes `ui/*` instead.

## Forms

- Native `<form>` + React 19 `useActionState` for server-validated
  submissions.
- Client-only forms use local state + `sonner` for error feedback.
- Validation mirrors the backend Pydantic schema where one exists.
- Every form has an accessible label association and a visible focus
  state.

## Data flow

- All HTTP goes through `src/lib/api-client.ts`. Do not call `fetch`
  from feature code.
- React Query owns the cache. Feature hooks under
  `src/lib/hooks/` are the only call sites for `useQuery` /
  `useMutation`.
- API keys live in `sessionStorage` (`halokyc.apiKey`); admin and
  client JWTs live in httpOnly cookies set by the BFF.
- Do not introduce a server-side data layer (Route Handlers, Server
  Actions, RSC fetch caching) before the API contract is stable.

## Compliance surfaces

- The `/verify` consent capture, the `/privacy/dashboard` subject surface, the `/admin/dsr` queue, and the cookie consent banner are documented in `.agents/context/COMPLIANCE.md`. Read it before touching any of these routes.
- Selfie and ID captures stay in component memory. They are never
  rendered through `<img src=>` and never uploaded to a third-party
  CDN. Object URLs are revoked on unmount.

## Gating

Before declaring done, run the frontend gating commands (per root
`AGENTS.md`):

```
npx --no-install tsc --noEmit
npx --no-install eslint src
npx --no-install vitest run
```

`pnpm` requires Node 22.13+; this environment has Node 20, so the
local binaries are invoked directly through `npx --no-install`.
