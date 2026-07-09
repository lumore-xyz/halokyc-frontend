# Dynamic /verify Capture Flow

**Status:** ✅ Implemented

Workflow-driven end-user verification flow served at `/verify`. The step sequence is computed server-side and rendered client-side through a state-machine reducer; no new backend endpoints beyond the existing verification API.

## What it does
- Accepts two URL modes: `?workflow_id=` (start new session) or `?verification_id=` (resume existing session)
- Server-driven step machine pre-computes the capture sequence from workflow services (`selfie`, `liveness`, `document`, `age`)
- Instruction pages before each capture step (selfie instruction, document front instruction, document back instruction)
- Camera-only capture for selfie and liveness; document screens use the guided capture/upload path without flashlight or visible file-select affordances
- Oval capture frame for selfie/liveness; rectangular frame for documents
- Client-side file validation: MIME `image/jpeg|image/png|image/webp`, ≤ 8 MB, aspect-ratio warning above 4:1
- Document retake flow: if the document quality check recommends retry, `/verify` resets document capture state and shows neutral retake copy (no credit or billing language)
- Client-side compression targets a small WebP payload before upload. Raw JPEG, PNG, and WebP images may be up to 50 MB; the backend still enforces the final compressed-size cap.
- Session resumable via `verification_id`; progress bar persists across page refreshes
- Polls for results using the existing `GET /api/v1/verifications/{id}` endpoint

## Step sequence (for `services: ["selfie", "liveness", "document"]`)
1. Intro → 2. Selfie Instruction → 3. Selfie Capture → 4. Liveness Instruction → 5. Liveness Capture → 6. Document Front Instruction → 7. Document Front Capture → 8. Document Back Instruction → 9. Document Back Capture (optional) → 10. Submitting → 11. Processing → 12. Result

## Key endpoints consumed
- `GET /api/v1/verifications/{id}/config` (public, no auth) — step sequence, workflow name, services, min_age, `camera_only`, `facing_mode`, `frame_type`, `optional` per step
- `POST /api/v1/verifications/start` — begins a new session
- `POST /api/v1/verifications/{id}/upload` — submits captured files
- `GET /api/v1/verifications/{id}` — polls for terminal status

## Frontend files (key)
- `src/app/verify/page.tsx` — entry; handles both `workflow_id` and `verification_id` query params
- `src/app/verify/_components/verification-flow.tsx` — orchestrates step transitions
- `src/app/verify/_components/verify-state-machine.ts` — pure reducer + `planSteps()` helper
- `src/app/verify/_components/verify-camera-canvas.tsx` — `cameraOnly` and `frameType` props
- `src/app/verify/_components/verify-step-{selfie,document}-instruction.tsx` — instruction screens
- `src/app/verify/_components/verify-step-{selfie,document}.tsx` — capture components

## Implementation notes
- State transitions are ≤ 150 ms and respect `prefers-reduced-motion`
- `VerifyShell` renders a centered card with dotted backdrop on desktop; full-bleed on mobile
- `/verify` ignores `callback_url` query param for security (ADR-F027); browser return navigation requires a server-side contract
- Selfie and ID captures stay in component memory; object URLs revoked on unmount; never rendered via `<img src>` or uploaded to a third-party CDN
- Verification-session upload and polling require only `verification_id`; `/verify` never asks the end user for API keys, session keys, or workspace credentials

## Related
- [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §2.4, §5 (Decision Rules), §6 (Credit Backlog Rules — neutral UX)
- [`API_CONTRACTS.md`](API_CONTRACTS.md) §Verifications
- [`frontend/ARCHITECTURE.md`](frontend/ARCHITECTURE.md) (data flow)
- [`frontend/DECISIONS.md`](frontend/DECISIONS.md) ADR-F021 (verify shell), ADR-F022 (deferred country picker), ADR-F027 (callback URL security)
- [`TODO.md`](TODO.md) §4 (frontend UX), §"Verification Flow Redesign" section
