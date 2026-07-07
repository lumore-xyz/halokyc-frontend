# HaloKYC — Landing Page Copy (Decision-First Rewrite)

---

## Requirements

- Voice: editorial, technically credible, confident. No hype, no exclamation points.
- Length: each section is one argument delivered in 1–3 sentences. No paragraphs where a line will do.
- Structure: every section earns its place by closing a specific objection or advancing the reader toward one action.
- Style rule: features are stated as outcomes the client controls, not as internal system capabilities.

---

## 1. Hero

**Eyebrow**
The verification API

**Headline**
Stop fake users from
becoming your growth tax.

**Subheadline**
One API. Practical AI checks. A review queue your team controls. Ship it this week.

**Primary CTA**
Start free

**Secondary CTA**
See how it works

**Stats strip (3 items)**
- Same day — to first verification
- Zero vendors — to wire and maintain
- One workflow ID — to start

---

## 2. Trusted Pipeline (pager strip, above the fold)

Three stations. Reads like a table of contents.

**01 · Your workspace**
Set the rules once.
Pick the checks, set the age gate, configure the review queue. The workflow you save is the policy your product enforces.

**02 · Your user flow**
Send us the user.
One API call or a deep link. We capture the evidence; you get a signed result back.

**03 · Your backend**
Use the result.
Approved, rejected, or needs review — with a reason your team can act on.

---

## 3. The Decision Section (replaces/extends "The KYC gap")

**Eyebrow**
The build vs. buy question

**Headline**
You can verify users yourself.
The question is what it costs to get there.

---

### The argument — four cards, one per objection

**01 · The timeline**
Two senior engineers, one year. One ML engineer, six months. One backend engineer to wire it. One frontend engineer for the capture flow and the review dashboard. One devops engineer to keep the models running.

At fully loaded cost, that team runs $1.2M–$1.8M before you count infrastructure, model API costs, security audits, or legal review. That gets you to a v1. It does not include year two, year three, or year four.

**02 · The maintenance contract**
Once identity verification lives in your codebase, every future change lands on your team forever. A new ID type. A new jurisdiction's regulations. A model that needs updating. You do not own just the build. You own the maintenance.

**03 · The hidden costs you won't budget for**
The teams that build it internally describe the same arc: the first six months are exciting, the next twelve are debugging OCR on low-quality photos from regions they never tested, and the year after that is compliance requests they are unprepared for.

**04 · The switching cost**
The in-house solution you launch this year still needs an owner in year five. By then, the engineer who built it has moved on. The documentation is thin. The models are stale. You are paying to maintain infrastructure you never wanted to own.

**Pull-quote (editorial callout)**
HaloKYC is the first version of your trust stack — one API, practical checks, clear decisions, and a review queue your team controls. No procurement. No four-vendor stack. No compliance consultant required.

---

## 4. Features (kept, tightened — map to outcomes the client gets)

**Eyebrow**
Evidence primitives

**Headline**
The checks are modular.
The record is continuous.

**Subheadline**
Build each verification from the services you choose. Read the result as one audited case file.

| # | Key | Name | Body (outcome, not mechanism) |
|---|-----|------|-------------------------------|
| 01 | document | Document OCR | Name, DOB, issuing country, expiry — extracted once, structured for your review. Raw document numbers never stored in plain text. |
| 02 | selfie | Selfie capture | Guided camera flow with file fallback. Biometric frames are never persisted outside the session that created them. |
| 03 | face_match | Face match | Confirms the selfie belongs to the person in the ID. Tenant-scoped. A clear path to manual review when the AI is uncertain. |
| 04 | age | Age rule | Set a minimum per workflow. Under-age results are terminal rejects with an auditable reason. |
| 05 | duplicate | Duplicate search | Catches repeat faces across your verified users. Cross-workspace biometric leakage does not happen. |
| 06 | risk | Risk decision | Collapses check outcomes into a score, a status, and a reason your team reads. Not a black box. |
| 07 | review | Review queue | Resolve uncertain sessions with evidence, check results, and the ability to approve or reject with a required reason. |
| 08 | webhook | Signed callback | Final result delivered to your backend with an HMAC signature and a retry record. Your server verifies; no trust on faith. |
| 09 | audit | Audit trail | Every approve, reject, and retry is logged with the actor, the evidence they saw, and the timestamp. |
| 10 | policy | Workflow policy | The workflow you define in the dashboard is the only source of truth the engine consults. No hidden rules. No configuration drift. |

Bottom strip (mono, small caps): every item above is logged in the audit trail.

---

## 5. API (proof, not documentation)

**Eyebrow**
Current contract

**Headline**
Start with a
workflow ID.
Finish with a signed decision.

**Subheadline**
Your dashboard defines the policy. The API starts a session against it. The user capture flow adapts to the enabled services automatically.

**The three calls that matter (horizontal list)**
- POST /verifications/start
- GET /verifications/{id}
- WEBHOOK · POST signed

**Right column — code + payload + headers (existing layout, copy tightened)**

*request · start.ts*
```
POST /api/v1/verifications/start
X-API-Key: <your key>

{
  external_user_id: "user_123",
  workflow_id: "wf_standard_kyc",
  callback_url: "https://app.example.com/hooks/kyc"
}
```

*payload · ver_8f41c2*
```json
{
  "status": "approved",
  "risk_score": 18,
  "decision_reason": "All required checks passed",
  "checks": {
    "ocr": { "status": "pass" },
    "face_match": { "status": "pass", "score": 0.82 },
    "liveness": { "status": "pass", "score": 0.91 },
    "age": { "status": "pass" },
    "duplicate": { "status": "pass" }
  }
}
```

*headers · webhook*
```
X-HaloKYC-Event: verification.completed
X-HaloKYC-Sig: sha256=9e2b…07c
X-HaloKYC-Delivery: 4f7a…21b
```

---

## 6. Workflow (the path, not the process)

**Eyebrow**
Policy → verdict

**Headline**
Every verification follows the same
auditable route.

**Subheadline**
The flow is sequential because accountability is sequential: define the rule, collect evidence, run checks, write the result, then notify the product that asked for it.

**Six steps (card grid)**
1. Design policy — You choose selfie, liveness, document, age, and thresholds in the workflow editor. The workflow you save is the enforcement surface.
2. Start session — Your backend sends external_user_id, workflow_id, and an optional callback_url. The API returns a verification ID and a URL.
3. Capture evidence — The user completes only the screens required by that workflow. No skipped steps, no confusion about what is needed.
4. Run checks — OCR, face match, liveness, duplicate, age run asynchronously in the order that produces the cleanest audit trail.
5. Resolve decision — Approved, rejected, or manual review with a readable risk reason. The reviewer sees the evidence, the check results, and the agent's recommendation when agentic mode is active.
6. Notify app — Final result sent through a signed webhook and available by API. Your backend acts on it without calling us.

Each card ends with: persisted event.

---

## 7. Use Cases

**Eyebrow**
Where HaloKYC fits

**Headline**
Made for products where
fake users are expensive.

**Subheadline**
The integration does not change shape between industries. The checks you turn on and the threshold you set do.

**Six cards**
1. Dating and social — Block duplicate profiles, age-restricted users, and suspicious identity patterns before they reach your community.
2. Marketplaces — Verify sellers, freelancers, delivery partners, and high-risk counterparties without slowing the funnel.
3. Fintech MVPs — Add practical KYC before scaling into deeper compliance. Start with the basics, swap in heavier vendors later.
4. Web3 and crypto — Reduce sybil abuse and duplicate accounts without standing up an identity stack of your own.
5. Communities — Keep private or age-gated spaces safer with human verification and an audit trail of every check.
6. Internal tools — Verify contractors, agents, and internal users before granting access to sensitive systems.

Body copy per card: one sentence. What the product prevents, not what the feature does.

---

## 8. Client Control

**Eyebrow**
Your rules, your decisions

**Headline**
Keep control of how
verification works in your product.

**Subheadline**
You define the workflow and set the thresholds. We supply the evidence and the audit trail. Your team keeps the final operating control.

**What your workspace gives you (left column, bordered list)**
- Choose the verification workflow before a session starts
- Turn checks on or off without changing the capture code
- Approve or reject unclear sessions from your review queue
- Receive signed results your backend can verify without calling us

**Right column — client workspace preview (existing mock)**
Workspace card showing:
- A · Policy settings: workflow ID, services, minimum_age, decision_mode
- B · Review decision: OCR / Liveness / Face match / Duplicate with status labels
- Footer: Approve / Reject buttons and a stamp reading "review"

---

## 9. Pricing

**Eyebrow**
KYC pricing

**Headline**
Pricing that grows with your
real users.

**Subheadline**
Every fake account that passes through your product costs you money in support, trust damage, and platform risk. HaloKYC is priced so that stopping one fake user pays for the month.

**Credit value line**
1 credit = 1 completed verification.
Public price: $0.05 per credit. Effective range: $0.02–$0.05 per verification depending on volume.

**Four plans (editorial 4-column on desktop)**

**01 · Sandbox**
Validate your integration at zero cost.
- 1,000 credits total (does not roll over)
- 1 workspace
- 1 team member
- Full API access
- Developer console
- Live verification sessions
- AI risk scoring with readable reasons
- Webhook testing with HMAC inspection
CTA: Start free
Price: $0/mo

Note: Paid plans have no caps on workspaces or team members. Subscription credits roll over up to 10x the monthly grant.

**02 · Launch** (highlighted, cyan border, "Popular" chip)
For products with real users and real risk.
- 1,500 credits per month (rolls over up to 15,000)
- Everything in Sandbox
- Live verification sessions
- AI risk scoring with readable reasons
- Your team's review queue
- Webhook retry delivery
CTA: Get started
Price: $49/mo (~$0.033/verification)

**03 · Growth**
For teams that have found product-market fit.
- 6,000 credits per month (rolls over up to 60,000)
- Everything in Launch
- Higher volume throughput
- Priority support
CTA: Get started
Price: $149/mo (~$0.025/verification)

**04 · Scale**
For products operating at scale.
- 20,000 credits per month (rolls over up to 200,000)
- Everything in Growth
- Custom service thresholds
- Dedicated integration support
- SLA review
- Retention policy configuration
CTA: Get started
Price: $399/mo (~$0.020/verification)

**Buy credits (credit packs)**
Available for any plan. Purchased credits do not expire and are not subject to the rollover cap.

| Pack | Price | Credits | Effective price |
|------------|------:|-------------:|-----------------:|
| Starter | $25 | 500 | $0.050 |
| Build | $49 | 1,250 | $0.039 |
| Growth | $99 | 3,000 | $0.033 |
| Scale | $249 | 10,000 | $0.025 |
| Volume | $499 | 25,000 | $0.020 |

**Footer note**
No per-check charges. No hidden overage tiers. No annual commitments. Buy more, pay less per verification.

---

## 10. Security / Data Handling

**Eyebrow**
Data handling

**Headline**
We take your users' data
personally.

**Subheadline**
Identity files are the most sensitive data your product touches. We built the system around what gets deleted, who can see what, and why the audit trail exists — before the first line of AI code was written.

**Eight defaults (two-column list on the right)**

01. Rejected users cannot silently re-verify
Soft and permanent bans keep a face embedding on file so a new selfie does not restart the process without your team noticing.

02. Raw biometrics never leave the worker
Selfie and ID images are processed, checked, then discarded. Biometric embeddings are tenant-scoped and never cross workspaces.

03. No public URLs for identity files
Evidence lives under a private storage layer. Object URLs are revoked on unmount. The file path is never exposed to the browser.

04. Document numbers stay out of plain text
Only a verified hash and the extracted fields needed for the check are stored. Raw document numbers are never persisted or surfaced in any API response.

05. Reviewer decisions are fully accountable
Every approve, reject, and override is logged with the reviewer's identity, the evidence they saw, and the reason they wrote.

06. Callbacks cannot be spoofed
Every webhook is signed with HMAC-SHA256. Your backend fails closed on any payload that does not verify — no exceptions.

07. No hidden background costs
Verification work runs asynchronously. Long-processing sessions do not block your API, and sessions queued while credits are empty show a neutral waiting state to the user.

08. Credit and billing metadata stay yours
Wallet, ledger, and reservation records are taggable and auditable. Compliance exports include every credit movement without manual reconstruction.

**Left column stat strip (four items)**
- ISO-aligned — Construction, not certification
- Tenant-scoped — Data isolated per workspace
- Ephemeral — Object URLs revoked on unmount
- Signed — HMAC-SHA256 · SHA-256

---

## 11. Final CTA

**Eyebrow**
Ship before fraud becomes your growth tax

**Headline**
Add identity verification to your product
before next week.

**Body**
Use the sandbox with your own workflow. Run your first real verification with a test key. Hand the review queue to your support lead. No procurement, no four-vendor stack, no compliance consultant required.

**Primary CTA**
Start building with HaloKYC

**Secondary CTA**
Read the docs

**Closing stat strip**
- First call — 15 minutes
- First session — same day
- First review — next morning
- Pricing — no quotes required to start

---

## Page Title and Meta

**Page title**
HaloKYC — Stop fake users before they cost you

**Meta description**
One API for identity verification: selfie capture, document OCR, liveness, face match, age checks, duplicate detection, risk scoring, and a review queue your team controls. Ship verification this week.

**OG title**
HaloKYC — Stop fake users before they cost you

**OG description**
One API. Practical identity checks. Your team keeps the final decision. No enterprise procurement cycle.
