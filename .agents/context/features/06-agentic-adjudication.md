# Agentic Adjudication (LangGraph)

**Status:** ✅ Implemented (shadow → assist_review → auto_decide rollout path complete through Phase 10)

LangGraph-powered adjudication layer that reviews normalized tool outputs and returns a structured verdict. Runs inside the existing Celery pipeline after deterministic checks finish.

## What it does
- Receives `AgenticEvidencePayload` (stripped of raw OCR text, full document numbers, raw biometric captures, API keys, webhook secrets)
- Deterministic policy gate skips the LLM for: clean low-risk approval, terminal deterministic reject, disabled workflow/provider, provider outage, timeout, budget cap
- Hard terminal overrides: under-age, confirmed face mismatch, confirmed liveness failure, confirmed tenant-scoped duplicate cannot be approved by the model regardless of model output
- Graph nodes: `load_session_context` → `normalize_evidence` → `deterministic_policy_gate` → `agentic_adjudication` → `validate_agent_output` → `finalize_recommendation`
- Output: `AgenticVerdict` with `recommended_status`, `confidence`, `reason_codes`, `human_summary`, `evidence_references`, `requires_manual_review`; optional `retake_document` user action
- Modes: `disabled`, `shadow` (compute only, do not change decision), `assist_review` (shown to reviewer), `auto_decide` (agent decides final status within policy)

## Model provider & cost controls
- DB-backed `ai_providers` registry + `ai_provider_keys` (encrypted) + `ai_provider_service` (quota-aware routing)
- Supported providers: Google Gemma (default), OpenAI-compatible adapters
- Per-session timeout; retry for transient failures only
- Daily / rolling budget guard; falls back to deterministic when exceeded
- Recorded: provider name, latency, token/cost estimate, fallback reason, output validation status — raw prompts are never persisted

## Confidence-based auto-decide
- `auto_decide_confidence_threshold` per-workflow flag (default null = disabled)
- When set, sessions with `agent_confidence >= threshold` AND recommendation aligns with deterministic direction (lower half of manual band approves, upper half rejects) are auto-decided at `validate_agent_output` instead of routing to `manual_review`
- Audit event: `auto_decide_confidence_override`

## Timeout recovery
- `timeout_recovery` flag set when one or more AI services exceed their timeout
- Agent adjudicates using available evidence + document images; policy gate treats missing check results differently from failed ones
- Workflow feature flag `timeout_recovery_enabled` (default off for gradual rollout)
- Audit action: `agentic_timeout_recovery`

## Deterministic duplicate policy (pre-agent)
- Same `external_user_id` → respect existing session's final decision without agent involvement
- Active subject ban match → auto-reject with `active_subject_ban_match` reason
- Similarity above threshold, no ban → `manual_review`
- Low similarity → ignore as non-match

## Persistence & audit
- Recommendations stored in `verification_checks` as `agentic_review` check type
- Validated verdict persisted for reviewer visibility and auditability
- Audit actions: `agentic_shadow_recommended`, `agentic_auto_decided`, `agentic_fallback_used`
- Webhooks send only final status contract unless an explicit contract version adds agent fields

## Key endpoints (consumed by worker, no direct HTTP route)
- Called internally by Celery worker after deterministic checks
- `POST /api/v1/admin/metrics/automation` — admin aggregate: timeout recovery success rate, duplicate policy coverage, manual review rate by dimension

## Frontend surfaces
- `/dashboard/reviews/assigned` — `AgentRecommendationPanel` in review detail; shows `recommended_status`, confidence, reason codes, `human_summary` alongside deterministic check results
- Reviewers can "agree with recommendation" or "override recommendation"; feedback persisted backend-side
- `/admin/metrics/automation` — platform admin cards for provider failure rate, budget fallback, auto-decision volume

## Implementation notes
- Stable verification-scoped `thread_id` enables replay and human-in-the-loop resume
- PostgreSQL checkpointing configured (`langgraph-checkpoint-postgres`) for production interrupt/resume
- `interrupt()` / `Command(resume=...)` human-in-the-loop implemented
- Replay command: `uv run replay-historical-sessions` — runs historical payloads through deterministic vs agentic graph, outputs CSV/JSON

## Related
- [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §2.1, §7 (agentic policy), §11 (Phase 10), §12 (Phase 11)
- [`API_CONTRACTS.md`](API_CONTRACTS.md) §Verifications, §Admin Metrics, §Reviews
- [`backend/ARCHITECTURE.md`](backend/ARCHITECTURE.md) (worker + graph integration)
- [`backend/DECISIONS.md`](backend/DECISIONS.md) ADR-014 (provider abstraction), ADR-016 (shadow mode), ADR-017 (auto-decide criteria)
- [`TODO.md`](TODO.md) §9 (full agentic adjudication tasks), §10 (automation efficiency)
- [`AUTOMATION_STRATEGY.md`](AUTOMATION_STRATEGY.md) (why / trade-offs)
