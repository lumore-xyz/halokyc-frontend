# Verification Engine (Deterministic AI Pipeline)

**Status:** ✅ Implemented

The core evidence-processing pipeline. Runs the AI services selected by the workflow, produces normalized check payloads, computes a risk score, and applies terminal rules before any agentic layer.

## What it does
- **OCR** (PaddleOCR): extracts structured identity data from uploaded documents; uses learned document extraction patterns when possible and keeps raw OCR text in memory only
- **Multimodal OCR fallback / training**: when no active pattern exists or pattern confidence is too low, sends the document image to the configured AI provider for trusted structured extraction and learns a redacted reusable pattern
- **Metadata matching**: separate informational check comparing extracted document name/DOB or age/gender against public/private session metadata without failing OCR or affecting deterministic risk scoring
- **Face matching** (InsightFace / ArcFace): compares selfie to ID photo; returns similarity score
- **Liveness** (heuristic anti-spoof): challenge-response on selfie frames; pass/fail
- **Duplicate detection** (pgvector face embeddings): searches across workspace embeddings; returns `match_kind` (`none`, `same_external_user`, `ban_match`, `ambiguous`)
- **Age verification**: extracts DOB from OCR and checks against workflow `min_age`; terminal rule (auto-reject if under)
- **Document quality check** (multimodal LLM): evaluates readability, image quality, missing regions, suspected tampering, retry recommendation before OCR runs
- **Risk scoring**: weighted score from individual check failures (see PRODUCT_PLAN §7)
- **Deterministic decision**: score bands → `approved` (<30), `manual_review` (30–59), `rejected` (≥60); terminal overrides take precedence

## Key endpoints
- `POST /api/v1/verifications/start` — creates session, reserves credit
- `POST /api/v1/verifications/{id}/upload` — accepts evidence files; triggers worker
- `GET /api/v1/verifications/{id}/config` — public; returns workflow name, services, min_age, pre-computed step sequence
- `GET /api/v1/verifications/{id}` — session detail with check results
- `GET /api/v1/verifications` — workspace activity list
- `GET /api/v1/verifications/{id}/evidence/{file_id}` — signed file download

## Worker pipeline
1. Receive session → run selected AI services in parallel (orchestrated by Celery task)
2. Persist `verification_checks` rows (one per service result)
3. Run deterministic policy gate: terminal overrides, age check, duplicate ban policy
4. If no terminal override: compute risk score and apply score-band decision
5. Emit analytics at terminal decision (timeout, services, duplicate outcome, document type, confidence)
6. Update session status; trigger webhook delivery if configured

## Implementation notes
- Services run inside the existing Celery verification pipeline; no separate agent microservice
- Document quality runs before OCR; if quality confidently recommends retry, session stays reusable (`requires_user_action` / `retake_document`) and worker is not queued
- If quality service fails or times out, the system continues without it (fail-open)
- Raw document images are not persisted in check payloads; OCR fallback stores only safe extracted fields, pattern metadata, provider/model metadata, and validation score
- OCR extraction quality is separate from identity metadata matching. Metadata mismatches persist as `metadata_matching` checks and are informational-only for risk scoring.

## Related
- [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §2.2, §7 (decision rules, agentic policy, document quality)
- [`API_CONTRACTS.md`](API_CONTRACTS.md) §Verifications
- [`backend/ARCHITECTURE.md`](backend/ARCHITECTURE.md) (worker pipeline)
- [`backend/DATABASE_SCHEMA.md`](backend/DATABASE_SCHEMA.md) `verification_sessions`, `verification_checks`, `verification_files`
- [`backend/DECISIONS.md`](backend/DECISIONS.md) ADR-002 (pgvector duplicate), ADR-005 (heuristic liveness), ADR-012 (document quality)
- [`TODO.md`](TODO.md) §10 (automation efficiency)
