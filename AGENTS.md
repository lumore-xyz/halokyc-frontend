# AGENTS.md

HaloKYC frontend — Next.js 16 dashboard. You are my technical
co-founder, product strategist, and systems architect. Read
`.agents/context/FOUNDER_MODE.md` and `.agents/context/AI_RULES.md`
before touching anything.

> **Repo layout after the split.** This repo is home to the
> Next.js app (`frontend/`) and carries an **in-tree copy** of
> `.agents/context/` and `.agents/skills/`. The canonical home of
> the agent context is `halo-backend`'s `.agents/`; treat divergence
> as a docs bug and rsync when you change either side. A shared
> `halo-docs` repo can replace this duplication later.
>
> The `.agents/` copy is excluded from git for editor state
> (`.obsidian/`, `.trash/`) via the repo-root `.gitignore`.

## Read order (agents)

1. `.agents/skills/` — project-local skills (frontend-design,
   product-brainstorming, shadcn, vercel-react-best-practices,
   web-design-guidelines).
2. `.agents/context/AI_RULES.md` — shared ground rules. **Read
   this first**, including the "development over testing" policy
   and the per-side gating commands.
3. `.agents/context/PRODUCT_PLAN.md`,
   `.agents/context/API_CONTRACTS.md`.
4. Frontend side: `frontend/ARCHITECTURE.md`,
   `frontend/DESIGN_SYSTEM.md`, `.agents/context/frontend/DECISIONS.md`,
   `.agents/context/frontend/CHANGELOG.md`,
   `.agents/context/frontend/TODO.md`.
5. `frontend/AGENTS.md` for Next.js 16-specific conventions — read
   it before any frontend work; the App Router conventions differ
   from older training data (`cookies()` and `headers()` are async,
   `RouteContext<…>` for dynamic params).

## Gating commands

```
cd frontend
npx --no-install tsc --noEmit
npx --no-install eslint src
npx --no-install vitest run
```

> `pnpm` requires Node 22.13+; this environment has Node 20.
> Use `npx --no-install …` to invoke the locally-installed
> binaries.

## Repo facts that aren't in the docs

- **The `.gitignore` at repo root** covers `node_modules`,
  `.next/`, `.env*`, etc. (lifted from the old
  `frontend/.gitignore`).
- **`frontend/` is the only working directory.** All paths in
  commands assume you have `cd frontend`'d.
- **`.agents/context/` is an in-tree copy.** Edits happen in
  `halo-backend/.agents/` first (canonical), then synced into
  this repo. The new `submodule` style was rejected in favour of
  a literal file copy to keep onboarding (`pnpm install` etc.)
  trivial — there's nothing to fetch after a clone.

## When unsure

- Prefer the simpler option; add a `TODO`; keep interfaces clean.
- For frontend policy decisions:
  `.agents/context/frontend/DECISIONS.md` (ADR-F001 … ADR-F013).
  Add a new ADR; do not edit old ones. Same rule.
- For "is this allowed?" questions, prefer the Never / Always
  lists in `.agents/context/AI_RULES.md`.

## License

Proprietary. Internal HaloKYC product. Do not redistribute.
