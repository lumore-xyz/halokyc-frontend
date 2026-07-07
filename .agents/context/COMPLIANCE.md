# Compliance & Legal Framework

This document tracks the legal and regulatory compliance requirements for HaloKYC. As an identity verification SaaS, the platform operates as a **Data Fiduciary** (for its own operations) and a **Data Processor** (for enterprise customers), adhering to GDPR, CCPA, and the Digital Personal Data Protection (DPDP) Act.

**API contract for these surfaces:** [`TODO.md`](TODO.md) compliance endpoints · backend implementation: [`backend/app/api/v1/routes/compliance.py`](backend/app/api/v1/routes/compliance.py) · frontend BFF: [`frontend/src/app/api/privacy/`](../../frontend/src/app/api/privacy) · [`frontend/src/app/api/admin/dsr/`](../../frontend/src/app/api/admin/dsr) · [`frontend/src/app/api/admin/retention/`](../../frontend/src/app/api/admin/retention) · [`frontend/src/app/privacy/dashboard/page.tsx`](../../frontend/src/app/privacy/dashboard/page.tsx) · [`frontend/src/app/admin/dsr/page.tsx`](../../frontend/src/app/admin/dsr/page.tsx) · [`frontend/src/app/admin/retention/page.tsx`](../../frontend/src/app/admin/retention/page.tsx)

Related: [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §2.9 (audit logging), §9 (security) · [`AI_RULES.md`](AI_RULES.md) (evidence minimization rules) · [`TODO.md`](TODO.md) §Phase 5 (compliance implementation)

## 1. Regulatory Framework & Governance

### Role Definition
- **Data Fiduciary**: HaloKYC determines the purpose and means of processing for platform-level operations.
- **Data Processor**: HaloKYC processes personal data on behalf of Client Organizations based on their specific workflows and mandates.

### Core Principles
- **Lawfulness & Consent**: Data is processed only with explicit, informed, and purpose-specific consent.
- **Purpose Limitation**: Personal data is collected for a specified, explicit, and legitimate purpose (Identity Verification) and not processed further in a manner incompatible with those purposes.
- **Data Minimization**: Only the minimum data necessary for the verification objective is collected and persisted.

---

## 2. Data Governance

### Data Minimization & Inventory
| Data Category | Fields | Purpose | Storage/Handling |
| :--- | :--- | :--- | :--- |
| **Identity Docs** | Aadhaar, PAN, Passport, DL, Voter ID | Identity proof | Hashed/Fingerprinted; originals stored encrypted |
| **Biometrics** | Selfie, Face Embeddings | Face verification | Embeddings encrypted; originals purged after processing |
| **PII** | Name, DOB, Gender, Email, Phone | Canonical identity | Normalized fields stored in DB |
| **Device/Meta** | IP, Browser, Device ID, Geo-location | Fraud detection | Logged for session auditing |

**Strict Constraints:**
- **No Raw OCR**: Raw OCR text is not persisted; only normalized canonical fields are stored.
- **No Plain-text IDs**: Full document numbers are never stored in plain text; only safe hashes/fingerprints.
- **Session Isolation**: Selfie and ID captures stay in component memory during the session and are not uploaded to third-party CDNs.

### Data Retention Policy
| Data Type | Retention Period | Justification |
| :--- | :--- | :--- |
| **Verification Evidence** | Until client lifecycle deletion or configurable legal policy | Auditability for reviews, disputes, and regulatory checks |
| **Face Embeddings** | Until client reset/full deletion; ban-matches kept for active bans | Duplicate detection and fraud enforcement |
| **Audit Logs** | Permanent | Regulatory compliance and dispute resolution |
| **Final Verdicts** | Permanent | Compliance audit trails |
| **API Keys** | Until deleted by client | Service authentication |

---

## 3. Technical & Security Controls

### Authentication & Access
- **API Keys**: All API keys are hashed in the database. Raw keys are shown only once during creation.
- **Access Control**: Sensitive KYC evidence access is strictly role-filtered (RBAC).
- **JWTs**: Admin JWTs are stored in `httpOnly` cookies and never exposed to `localStorage`.

### Infrastructure Security
- **Encryption**: AES-256 encryption at rest for all PII and biometric evidence.
- **Transport**: TLS 1.2+ for all data in transit.
- **File Storage**: Uploaded documents are never publicly accessible. S3 access is managed via short-lived Signed URLs.
- **Validation**: All uploads are validated for MIME type and size (max 8 MB).

---

## 4. User Rights & Consent (UX/UI Requirements)

### 4.1 Consent Flow (`/verify` Wizard)
Consent must be free, informed, purpose-specific, and as easy to withdraw as it is to give.

**UI/UX Requirements:**
- **Component**: `ConsentCard` integrated into the verification flow before biometric capture.
- **Visuals**: Use a clear, non-pre-ticked checkbox with a bold "Privacy Notice" heading.
- **Content**: Explicitly state *what* is collected, *why*, *how long* it's kept, and *who* sees it.
- **Linkage**: Provide a direct link to the full Privacy Policy opening in a new tab.
- **Interaction**: The "Proceed" button remains disabled until the consent checkbox is explicitly checked.
- **Audit**: Store `consent_timestamp`, `ip_address`, `device_id`, `policy_version`, and `session_id` upon acceptance.

### 4.2 Privacy Dashboard (Subject Facing)
A dedicated surface (`/privacy/dashboard`) where users can manage their data rights.

**Status:** Implemented. Backed by `GET /api/v1/privacy/summary`, `GET /api/v1/privacy/requests`, `POST /api/v1/privacy/requests`, and `POST /api/v1/privacy/access-token` (subject PIN gate). The API contract is defined in §"Future API Contract" below and is now live.

**UI/UX Requirements:**
- **Layout**: Card-based design focusing on three primary pillars: "Your Data", "Your Rights", and "Request Status".
- **"Your Data" Section**: A read-only list of the personal data fields collected during their session and the associated purpose.
- **"Your Rights" Section**:
  - **Request Erasure**: A button triggering a confirmation modal that, once accepted, initiates the lifecycle deletion process.
  - **Export My Data**: A button that triggers a PII export. User is notified via email/webhook when the archive is ready.
  - **Withdraw Consent**: A mechanism to revoke consent for future processing.
- **"Request Status" Section**: A visual timeline (e.g., `Pending` $\rightarrow$ `Processing` $\rightarrow$ `Completed`) for active DSRs.

### 4.3 Compliance Console (Operator Facing)
Admin tools for managing compliance and data subject requests (DSR).

**UI/UX Requirements:**
- **DSR Queue**: A filterable table showing all erasure/export requests, their status, and timestamps.
- **Export Approval**: A workflow for Admin approval of sensitive data exports.
- **Retention Config**: A settings panel to configure the global or per-client evidence retention period (days).
- **Audit Viewer**: A high-fidelity log viewer for all PII access and status changes.

---

## 5. Audit & Compliance Logic

### Verification Logic
- **Risk Scoring**: Decisions are based on weighted scores (OCR failure, Face mismatch, Liveness failure, Duplicate detection).
- **Terminal Rules**: Age verification is a terminal rule; users below `min_age` are automatically rejected.
- **Human-in-the-Loop**: Ambiguous scores are routed to a `manual_review` queue for Client Orchestrator decision.

### Auditability
- Every status change in a verification session must generate an immutable audit log entry.
- Logs must include: `actor_id`, `timestamp`, `previous_status`, `new_status`, and `reason`.

---

## 6. Implementation Tracker

| Feature | Status | Note |
| :--- | :--- | :--- |
| **Lifecycle Deletion** | ✅ Completed | Implementation of reset, full deletion, and ban logic |
| **RBAC** | ✅ Completed | Role-filtered access to sensitive evidence |
| **Audit Logging** | ✅ Completed | Status change tracking for all sessions |
| **Evidence Minimization** | ✅ Completed | No raw OCR, hashed document numbers |
| **Privacy Policy Page** | ✅ Completed | Public surface at `/privacy` |
| **End User Terms** | ✅ Completed | Public surface at `/terms` |
| **Data Retention Policy** | ✅ Completed | Public surface at `/data-retention` |
| **Privacy Notice in `/verify`** | ✅ Completed | Intro screen links to `/privacy` + `/terms` (verify-step-intro, verify-step-selfie-instruction) |
| **Consent Card UI** | ✅ Completed | `ConsentCard` in `/verify` gates biometric capture with explicit opt-in and policy-version audit; recorded as ADR-F024 |
| **Cookie Consent Banner** | ✅ Completed | Selective category opt-in banner on `/`; `essential` always on, `analytics` opt-in; preference persisted in `localStorage` under `halokyc.cookieConsent` |
| **Privacy Dashboard** | ✅ Implemented | Backend routes live (`privacy/summary`, `privacy/requests`, `privacy/access-token`); frontend BFF routes exist; privacy dashboard page gated behind `enablePrivacyDashboard` env flag in `frontend/src/lib/env.ts` (defaults `false` in non-production) |
| **DSR Management UI** | ✅ Implemented | Backend routes live (`/admin/dsr`, `/admin/dsr/{id}/decision`); frontend BFF routes `/api/admin/dsr`, `/api/admin/dsr/[id]/decision` live; DSR page exists at `/admin/dsr` |
| **Data Export Engine** | ✅ Implemented | `ComplianceEngine.build_export_archive` builds a subject-scoped ZIP archive under `storage_root/exports/` with a `summary.json` manifest; export approval triggers synchronous generation inside the DSR decision transaction |
| **Retention Engine** | ✅ Implemented | `purge_expired_evidence()` scheduled job reads configured `RetentionPolicy` and purges expired evidence, webhook logs, and audit logs per scope |
| **External Security Audit** | ⏳ Pending | SOC2 readiness review |
