# Automation Strategy: Reducing Human Involvement in KYC Verification

**Implementation status:** Tracked in [`TODO.md`](TODO.md) Phases 10–13.
**Product context:** [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §11–14.
**Code locations:** [`backend/app/services/agentic_adjudication_service.py`](backend/app/services/agentic_adjudication_service.py) · [`backend/app/services/risk_engine.py`](backend/app/services/risk_engine.py)

## Vision

HaloKYC exists to minimize human labor in identity verification while maintaining or improving accuracy. Every manual review is a cost center and a friction point. This document explores how to make our automated decisions smarter, more confident, and reduce the manual review volume.

---

## Current State

- **Verification engine**: Deterministic tool pipeline (OCR, face match, liveness, duplicate) → risk scoring → agentic adjudication (LangGraph) → final decision
- **Manual review trigger**: Sessions with `30 ≤ score < 60` (configurable) and those where the agent flags `requires_manual_review`
- **Reviewers**: Client team members with `client_reviewer` or higher role
- **Agent modes**: `disabled`, `shadow`, `assist_review`, `auto_decide` (workflow feature flag)
- **Current manual review rate**: Unknown (0 production users). The first KPI after launch is to establish the baseline manual review rate with a statistically meaningful sample.
- **Target**: Once baseline is established, reduce manual review volume by 30–50% while keeping false approve rate < 1%.

---

## Which Workflows Generate Manual Reviews? (Design Analysis)

Since HaloKYC is pre-launch, we lack production data. However, from the current implementation design, we can predict which workflow configurations will produce the highest manual review rates:

**Workflows with multiple AI services** are the primary source. Each additional service increases the probability of:
- Timeouts (each service has its own latency profile)
- Low-confidence outputs (OCR on poor images, liveness on ambiguous motion)
- Conflicting signals (face match passes but liveness fails, duplicate found but age under threshold)
- Incomplete evidence (document uploaded but no selfie, etc.)

Examples:
- Workflows enabling **selfie + liveness + document + duplicate detection** will generate more manual reviews than **document-only + age**.
- Workflows with **liveness detection** are particularly prone to timeouts and manual review due to heuristic frame analysis.

**Workflows requiring OCR on certain document types or countries** known to be challenging (e.g., non-Latin scripts, older IDs, regions with non-standard layouts) will also contribute disproportionately to manual review volume.

**Workflows with aggressive risk thresholds** (e.g., risk score band 25–55 widened) will capture more gray-zone sessions that need human judgment.

These hypotheses should be validated after launch by tracking manual review rates **per workflow ID** and **per enabled service combination**.

---

## Biggest Bottleneck: Service Timeouts

From the current implementation, one of the largest contributors to manual review is **service timeout**, not uncertainty in fraud detection.

**Current behavior**: If one or more AI services exceed the configured timeout, the workflow falls back to `manual_review` even if sufficient high-quality evidence exists for an automated decision. This creates unnecessary reviewer workload for operational failures rather than genuine verification ambiguity.

**Impact**: Timeouts are infrastructure- or load-related, not an indication of suspicious activity. Routing all timeouts to manual review inflates the manual review rate and reviewer cost without improving accuracy.

---

## Recommendation 1 — Timeout Recovery via Agent

Instead of immediately sending timed-out sessions to manual review, introduce a timeout recovery stage where the agent adjudicates using **available evidence** (completed services) plus the **raw document images**.

### Flow

```
AI Services Start
        │
        ▼
Wait up to 2 minutes
        │
        ├── All services complete
        │       │
        │       ▼
        │ Normal deterministic decision
        │
        └── Timeout
                │
                ▼
         Agentic Adjudication
                │
      Uses available evidence +
      document images +
      policy rules
                │
        ├── High confidence
        │        │
        │        ▼
        │ Auto Approve / Reject
        │
        └── Low confidence
                 │
                 ▼
           Manual Review
```

### Why this makes sense

Modern multimodal LLMs can reason over document images, selfies, and partially completed evidence. If deterministic services fail because of latency rather than poor input quality, the agent can often still reach a confident decision by directly inspecting the images.

This transforms timeout from an infrastructure issue into a recoverable workflow, significantly reducing manual reviews without compromising safety.

**Implementation considerations**:
- Agent must be aware of which services timed out vs which completed.
- Policy gate must treat missing check results differently (e.g., "OCR unavailable" vs "OCR failed").
- Timeout recovery should be feature-flagged per workflow to allow clients to opt in.
- Audit log must capture `timeout_recovery` event with list of missing checks.

---

## Recommendation 2 — Deterministic Duplicate Session Policy

Duplicate detection can become much more deterministic, reducing agent burden and manual reviews for clear-cut cases.

### Case 1: Duplicate found, same `external_user_id`
- **Existing verification found with identical external_user_id**
- Subject is **not banned**
- **Decision**: `approved` or `rejected` according to existing session outcome
- **Reason**: The client is re-verifying the same user. No fraud indicator; respect the existing verification history.

### Case 2: Duplicate face embedding, different `external_user_id`, subject banned
- Face match above ban threshold in same workspace
- Subject has an **active ban**
- **Decision**: Auto-reject with `active_subject_ban_match`
- **Reason**: Previously banned individual attempting to register under a new identity.

### Case 3: Duplicate face embedding, different `external_user_id`, not banned
- Face match above duplicate threshold but no active ban
- **Decision**: `manual_review` (or agent-assisted review)
- **Reason**: Could represent family members, shared accounts, legitimate account migration, or identity sharing. Human judgment appropriate.

### Case 4: Low-confidence duplicate (similarity near threshold)
- **Decision**: `manual_review` or agent with high uncertainty
- **Reason**: Ambiguous matches require caution.

These deterministic rules can be implemented **before** agentic adjudication, shrinking the manual review queue for the most common duplicate scenarios.

---

## Recommendation 3 — LLM-Based Document Quality Assessment

Currently, OCR confidence contributes to the risk score. However, OCR confidence alone cannot distinguish many quality issues that humans easily spot:

- Glare or flash reflection
- Cropped or truncated document
- Folded or crumpled corners
- Expired ID (date visible but not parsed)
- Poor lighting or motion blur
- Suspected tampering (font inconsistencies, altered text)
- Unsupported document format
- Missing required fields (even if present text is clear)

A multimodal LLM can evaluate these visual characteristics directly and return structured outputs:

- `document_readability`: `readable` | `partially_unreadable` | `unreadable`
- `image_quality`: `good` | `fair` | `poor`
- `missing_regions`: array of region types (e.g., `["photo", "signature", "machine_readable_zone"]`)
- `suspected_tampering`: boolean + reason codes
- `retry_recommended`: boolean
- `quality_confidence`: 0–1

This gives the agent richer evidence than OCR confidence alone and can reduce manual reviews caused by ambiguous document quality.

**Implementation**: Add a `DocumentQualityCheck` that runs on the uploaded image via the same multimodal provider used for agentic adjudication. Output becomes a new check in the payload. Agent can then auto-decide "retake" quality failures by returning a `requires_user_action` status with a `retake_document` reason, prompting the user to recapture without human involvement.

---

## Analytics to Capture After Launch

To answer the original question with real data and track improvement, HaloKYC must record manual review rates segmented by the following dimensions:

| Dimension                   | Why                                                               |
| --------------------------- | ----------------------------------------------------------------- |
| `workflow_id`               | Identify poorly performing verification policies                  |
| `enabled_services[]`        | Measure which service combinations increase manual reviews        |
| `timeout_occurred`          | Distinguish infrastructure failures from verification uncertainty |
| `document_type` (if detectable) | Find problematic document formats                                 |
| `country_of_issue`          | Identify regional OCR or document issues                          |
| `duplicate_outcome`         | Validate duplicate policy effectiveness                           |
| `agent_recovery_success`    | Measure how many timeout cases were automatically resolved        |
| `agent_confidence` bucket   | Correlate confidence with manual override rate                    |
| `ocr_confidence` bucket     | Determine if OCR quality is a leading indicator                   |

Additionally, record reviewer overrides:
- `original_decision` vs `reviewer_decision`
- `override_reason` (structured: `agent_wrong`, `evidence_missing`, `fraud_suspected`, `policy_override`, etc.)

These analytics will allow us to:
1. Establish baseline manual review rate by workflow composition
2. Identify the top contributors to manual reviews
3. Measure impact of each recommendation (timeout recovery, duplicate policy, document quality)
4. Prioritize further automation efforts

---

## Near-term Opportunities (Priority Order)

Based on the current architecture, here are the most impactful near-term improvements:

1. **Timeout recovery** (Recommendation 1): Likely the single biggest reduction in unnecessary manual reviews.
2. **Deterministic duplicate policy** (Recommendation 2): Clear rules for common duplicate scenarios can auto-decide many sessions currently sent to manual.
3. **Document quality check** (Recommendation 3): Gives agent additional signal to avoid manual review for poor-quality captures; can also prompt user retry.
4. **Expand auto-decide confidence thresholds**: After replay, enable agent auto-decide for high-confidence gray-zone sessions.
5. **Add client-side risk signals**: Allow clients to pass `user_trust_score` etc. to reduce uncertainty for their known-good users.

---

## Evaluation & Monitoring

### Metrics to Track

- **Manual review rate** (overall and per workflow)
- **Agent agreement rate** (in `assist_review` mode)
- **Auto-decide precision/recall** (from replay and shadow comparison)
- **Timeout recovery success rate** (percent of timeouts that agent auto-decided confidently)
- **Duplicate policy coverage** (percent of duplicate sessions handled deterministically)
- **Cost per terminal session** (model spend)
- **Latency percentiles** (deterministic vs agent-assisted)
- **Provider failure rate** and **fallback reasons**
- **Reviewer efficiency** (time per review; may improve with agent pre-population)

### Replay Command

- Run historical check payloads through deterministic vs agentic graph.
- Output: session ID, deterministic decision, agent recommendation, actual outcome (if reviewed), agent confidence, reason codes, evidence references, provider used, latency, token count.
- Use to:
  - Set confidence thresholds for auto-decide
  - Identify systematic disagreements
  - Quantify potential manual review reduction from each recommendation

---

## Rollout Strategy

1. **Shadow mode** (complete): Agent runs but does not affect final decision. Collect agent recommendations and reviewer feedback.
2. **Assist review** (complete): Agent recommendation shown to reviewer. Measure agreement rate. Reviewer can override.
3. **Timeout recovery** pilot: Enable for 1–2 workspaces. Compare manual review rate delta.
4. **Deterministic duplicate policy** rollout: Deploy to all workflows; monitor duplicate-triggered manual reviews.
5. **Document quality check** pilot: Add quality check to a subset of workflows; measure impact on manual review rate and retry requests.
6. **Confidence-based auto-decide**: Enable `auto_decide` only for sessions with deterministic score < 20 or > 70 **and** agent confidence > 95%. Gradual rollout per workspace.
7. **Full auto-decide** for workflows that meet precision/recall criteria (precision > 99.5%, recall > 95% on replay).

Always keep the ability to revert a workspace to `assist_review` or `disabled` instantly.

---

## Risk Mitigation

- **Safety rails**: Terminal rules (under-age, confirmed face mismatch, liveness failure, active ban) must never be auto-approved by agent.
- **Budget caps**: Daily provider spend limits with immediate fallback to deterministic.
- **Provider redundancy**: Automatic fallback to secondary provider if primary fails.
- **Shadow monitoring**: Even in auto-decide mode, keep a small percentage (5%) in shadow to continuously validate.
- **Auditability**: Store agent's structured verdict, provider metadata, and chain of evidence references. Never expose raw prompts or full OCR text to model by default.
- **Explainability**: Generate a human-readable summary (`human_summary`) for every agent decision to include in webhooks and audit logs. Helps with support and compliance.

---

## Future Enhancements (Post-MVP)

- **Multi-modal model**: Feed raw images directly to a vision-language model. More holistic but costlier and less interpretable.
- **Document authenticity detection**: Specialized forgery detection (paper, ink, security features).
- **AML/PEP screening**: Watchlist integration for politically exposed persons.
- **Behavioral biometrics**: Analyze user interaction patterns during capture.
- **Collaborative fraud network**: Share known bad actor embeddings across workspaces (with opt-in and privacy safeguards).
- **Self-improving prompts**: Use high-confidence decisions as few-shot examples to dynamically update agent prompts.
- **Client-customizable models**: Enterprise clients fine-tune workspace-specific models on their history.

---

## Open Questions

1. Do we need to support jurisdictions that legally require human-in-the-loop? Per-region disable auto-decide?
2. How to provide meaningful explanations for agent wrong decisions (GDPR "right to explanation")?
3. Should we expose agent confidence to clients? They might use it for step-up verification.
4. Are we inadvertently introducing bias? Need fairness audits.
5. Long-term cost model: Should agent-assisted be a paid add-on or bundled?

---

## Action Items

- [ ] Implement timeout recovery stage (Recommendation 1) with feature flag and audit event.
- [ ] Implement deterministic duplicate policy (Recommendation 2): case 1 & 2 logic in worker.
- [ ] Research and prototype document quality check (Recommendation 3) using multimodal provider.
- [ ] Define analytics schema and add instrumentation for manual review dimensions.
- [ ] Update agent payload contract to include service timeouts and missing checks.
- [ ] Add `timeout_recovery` and `duplicate_policy_applied` audit actions.
- [ ] Create admin metrics endpoint for manual review rate by workflow and services.
- [ ] Run first post-launch replay after 1000+ sessions to establish baseline and identify top manual review contributors.

---

**Related Documents**:
- `PRODUCT_PLAN.md` – Implementation phases
- `PRODUCT_PLAN.md` – Core capabilities and roadmap
- `backend/TODO.md` – Agentic adjudication tasks
- `frontend/DECISIONS.md` – UI considerations for agent recommendations
