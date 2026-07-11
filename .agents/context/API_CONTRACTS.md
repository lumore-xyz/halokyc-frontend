# API_CONTRACTS.md

# API Contracts

This document is the canonical contract for every HTTP endpoint exposed by HaloKYC (backend v1 API + Next.js BFF route handlers under `src/app/api/`). The frontend and backend both read it.

**Rule of thumb:** anything the system calls must appear here. If either side exposes a new endpoint, update this file in the same change. Nobody invents endpoints.

Related: [`AI_RULES.md`](AI_RULES.md) · [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §5 (endpoint inventory) · [`TODO.md`](TODO.md) (implemented endpoints per phase) · [`COMPLIANCE.md`](COMPLIANCE.md) §"Future API Contract" (privacy/compliance endpoints) · [`backend/DATABASE_SCHEMA.md`](backend/DATABASE_SCHEMA.md) (request/response column sources) · [`pricing.md`](pricing.md) (billing endpoint credit values)

## Conventions

- All backend paths are relative to `publicEnv.apiBaseUrl`
  (`NEXT_PUBLIC_API_BASE_URL`, default `http://localhost:8000`).
- All non-204 backend responses parse as JSON when possible; the
  wrapper in `src/lib/api-client.ts` exposes both `status` and
  `body` on error.
- Frontend BFF paths are relative to `window.location.origin`
  (`/api/admin/...`, `/api/client/...`).
- Timestamps are ISO 8601 strings.
- All IDs are UUID v4 strings.
- JWTs (`halokyc_admin`, `halokyc_client`) are **never** set from
  browser JavaScript. They are set only by the BFF route handlers
  in `src/app/api/admin/login` and `src/app/api/client/login`, and
  sent only by those same handlers as `Authorization: Bearer <jwt>`
  when proxying to the backend.

## Auth Surfaces

| Surface         | Browser sends                       | Set / cleared by             |
| --------------- | ----------------------------------- | ---------------------------- |
| Developer API   | `X-API-Key: live_...`                 | Pasted into the site header  |
| Admin (browser) | `Cookie: halokyc_admin=...`           | `POST/DELETE /api/admin/login` |
| Client (browser)| `Cookie: halokyc_client=...`          | `POST/DELETE /api/client/login` |
| Unified (temp)  | `Authorization: Bearer <temp_jwt>`    | `POST /api/auth/login`       |


Only the **BFF route handlers** read the cookies and forward them
as `Authorization: Bearer <jwt>` to the backend. The browser never
sees a JWT.

## Shared Types

```ts
type HealthStatus = {
  status: "ok" | "degraded" | "down";
  version: string;
};

type VerificationStatus =
  | "pending_upload"
  | "awaiting_credits"
  | "processing"
  | "approved"
  | "rejected"
  | "manual_review";

type SubjectBanKind = "soft_ban" | "permanent_ban";

type SubjectLifecycleAction =
  | "verification_reset"
  | "subject_deleted"
  | "soft_banned"
  | "permanently_banned"
  | "ban_updated"
  | "ban_lifted";

type CheckResult = {
  status: "pass" | "fail" | "manual_review" | "pending" | "skipped";
  score?: number | null;
  detail?: Record<string, unknown>;
  result?: Record<string, unknown>;
};

type DocumentQualityCheckResult = CheckResult & {
  result: {
    readability: "good" | "fair" | "poor";
    image_quality: "good" | "fair" | "poor";
    missing_regions: string[];
    suspected_tampering: boolean;
    retry_recommended: boolean;
    quality_confidence: number; // 0.0 - 1.0
    provider: "heuristic" | "multimodal_llm" | "unavailable";
  };
};

type VerificationUserAction =
  | {
      action: "retake_document";
      reason: string;
      fields: ("id_front" | "id_back")[];
    };

type DuplicateCheckResult = CheckResult & {
  result: {
    status: "pass" | "fail" | "manual_review";
    duplicate_found: boolean;
    matched_external_user_id: string | null;
    similarity: number | null;
    match_kind: "ban_match" | "same_external_user" | "ambiguous" | null;
    reason_code: "duplicate_face_match" | "active_subject_ban_match" | null;
  };
};

type AgenticVerdict = {
  recommended_status: VerificationStatus;
  confidence: number;
  reason_codes: string[];
  human_summary: string;
  evidence_references: string[];
  requires_manual_review: boolean;
  requires_user_action?: VerificationUserAction | null;
};

type AgenticReviewCheckResult = CheckResult & {
  result: {
    verdict: AgenticVerdict;
    policy_gate: {
      should_call_model: boolean;
      skip_reason: string | null;
      reason_codes: string[];
      terminal_overrides: string[];
    };
    provider: {
      provider_name: string | null;
      model_name: string | null;
      latency_ms: number | null;
      prompt_tokens: number | null;
      completion_tokens: number | null;
      total_tokens: number | null;
      estimated_cost_usd: number | null;
      fallback_reason: string | null;
      model_called: boolean;
      output_validation_status: string | null;
    };
    thread_id: string;
    evaluation: {
      deterministic_status: VerificationStatus;
      agentic_recommended_status: VerificationStatus;
      agreed_with_deterministic: boolean;
      would_deflect_manual_review: boolean;
      would_false_approve_against_deterministic: boolean;
      would_false_reject_against_deterministic: boolean;
    };
    reviewer_feedback: {
      agreed_with_agent: boolean;
      reviewer_user_id: string;
      recorded_at: string;
    } | null;
  };
};

type NormalizedDocumentField = {
  value: string | null;
  confidence: number;
  source: "ocr";
  label: string | null;
};

type NormalizedDocument = {
  document_type: "passport" | "national_id" | "drivers_license" | "unknown" | string;
  issuing_country: string | null; // ISO 3166-1 alpha-2 when detected.
  full_name: NormalizedDocumentField;
  date_of_birth: NormalizedDocumentField; // ISO date when detected.
  gender: NormalizedDocumentField;
  document_number: NormalizedDocumentField; // HMAC hash, never raw number.
  expiry_date: NormalizedDocumentField;
  issue_date: NormalizedDocumentField;
  nationality: NormalizedDocumentField;
  address: NormalizedDocumentField;
};

type OCRCheckResult = CheckResult & {
  result: {
    status: "pass" | "fail" | "manual_review";
    confidence: number;
    name: string | null;
    dob: string | null; // Legacy-compatible alias of document.date_of_birth.value.
    document_number_hash: string | null;
    document: NormalizedDocument;
    extraction_source?: "pattern" | "ai_training" | "ocr_heuristic";
    document_pattern_id?: string | null;
    ai_extraction?: {
      attempted: boolean;
      status: "completed" | "failed" | "skipped";
      provider?: string;
      model?: string | null;
      latency_ms?: number;
      reason?: string;
      validation?: {
        status: "matched" | "mismatch" | "uncertain";
        score: number;
        mismatch_fields: string[];
        reason: string | null;
      };
    };
  };
};

type MetadataMatchingCheckResult = CheckResult & {
  result: {
    status: "pass" | "fail" | "skipped";
    informational_only: true;
    mismatches: ("name" | "dob" | "age" | "gender")[];
    skipped_fields: ("name" | "dob" | "age" | "gender")[];
    comparisons: {
      field: "name" | "dob" | "age" | "gender";
      expected: unknown;
      actual: unknown;
      matched: boolean;
    }[];
  };
};

type VerificationDetail = {
  verification_id: string;
  external_user_id: string;
  metadata: Record<string, unknown>;
  status: VerificationStatus;
  checks: Partial<Record<"ocr" | "face_match" | "liveness" | "age" | "agentic_review", CheckResult>> & {
    duplicate?: DuplicateCheckResult;
    document_quality?: DocumentQualityCheckResult;
    metadata_matching?: MetadataMatchingCheckResult;
  };
  timeout_recovery?: boolean;
  timed_out_services?: string[];
  duplicate_session_id?: string | null;
  duplicate_match_kind?: "ban_match" | "same_external_user" | "ambiguous" | null;
  requires_user_action?: VerificationUserAction | null;
  risk_score: number | null;
  decision_reason: string | null;
  created_at: string;
  updated_at: string;
};

type SubjectBanStatus = {
  ban_id: string;
  external_user_id: string;
  organization_id: string;
  workspace_id: string;
  kind: SubjectBanKind;
  is_active: boolean;
  reason: string | null;
  ban_expires_at: string | null; // null for permanent ban.
  retained_face_embedding: boolean;
  created_at: string;
  updated_at: string;
  lifted_at: string | null;
};

type SubjectLifecycleResponse = {
  external_user_id: string;
  organization_id: string;
  workspace_id: string;
  action: SubjectLifecycleAction;
  deleted_verification_count: number;
  deleted_face_embedding_count: number;
  deleted_file_count: number;
  retained_face_embedding_count: number;
  ban: SubjectBanStatus | null;
  audit_log_id: string | null;
};

type SubjectDeleteRequest = {
  reason?: string;
};

type SubjectBanRequest = {
  kind: SubjectBanKind;
  reason?: string;
  ban_expires_at?: string | null; // Required for soft_ban, ignored for permanent_ban.
  metadata?: Record<string, unknown>;
};

type SubjectBanUpdateRequest = {
  kind?: SubjectBanKind;
  reason?: string | null;
  ban_expires_at?: string | null;
  metadata?: Record<string, unknown>;
  is_active?: boolean; // false lifts the ban.
};

type AdminReviewItem = {
  verification_id: string;
  status: VerificationStatus;
  risk_score: number | null;
  duplicate_session_id?: string | null;
  duplicate_match_kind?: "ban_match" | "same_external_user" | "ambiguous" | null;
  created_at: string;
};

type VerificationStatusCounts = {
  pending_upload: number;
  awaiting_credits: number;
  processing: number;
  approved: number;
  rejected: number;
  manual_review: number;
};

type VerificationSummaryResponse = {
  total: number;
  by_status: VerificationStatusCounts;
  recent_sessions: AdminReviewItem[];
  recent_reviews: AdminReviewItem[];
};

type AdminAuditLogItem = {
  action: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
};

type AdminReviewDetail = VerificationDetail & {
  audit_logs: AdminAuditLogItem[];
};

type VerificationEvidenceFile = {
  id: string;
  verification_id: string;
  file_type: "selfie" | "id_front" | "id_back";
  mime_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
};

type DuplicateSessionReference = {
  verification_id: string;
  external_user_id: string;
  status: VerificationStatus;
  risk_score: number | null;
  decision_reason: string | null;
  similarity: number | null;
  created_at: string;
  updated_at: string;
};

type VerificationSessionDetail = VerificationDetail & {
  files: VerificationEvidenceFile[];
  audit_logs: AdminAuditLogItem[];
  duplicate_sessions: DuplicateSessionReference[];
};

type AdminDecisionResponse = {
  verification_id: string;
  status: "approved" | "rejected";
};

type AdminTokenResponse = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
};

type OrganizationOption = {
  organization_id: string;
  name: string;
  role: ClientRole;
};

type UnifiedLoginResponse = {
  user_id: string;
  is_platform_admin: boolean;
  organizations: OrganizationOption[];
  temp_token: string;
};

type AdminSession = {
  authenticated: boolean;
  expiresAt?: string;
};

// Phase D1+ client schema. Mirrors `backend/app/db/enums.py:Phase`.
type Phase =
  | "onboarding"
  | "sandbox"
  | "kyc_verification"
  | "production"
  | "suspended";

type ClientListItem = {
  client_id: string;
  name: string;
  is_active: boolean;
  phase: Phase;
  created_at: string;
};

type ClientDetail = ClientListItem & {
  api_key_count: number;
  recent_verification_count: number;
  phase_changed_at: string | null;
};

type ClientUpdate = {
  name?: string;          // 1..255 chars if present
  is_active?: boolean;
};

type PhaseUpdateRequest = {
  phase: Phase;
};

type UserStatus = "active" | "disabled" | "invited";

type OrganizationStatus = "active" | "suspended" | "disabled";

type WorkspaceStatus = "active" | "disabled" | "archived";

type ClientRole =
  | "client_owner"
  | "client_admin"
  | "client_reviewer"
  | "client_developer";

type PlatformRole =
  | "platform_owner"
  | "platform_business_admin"
  | "platform_support"
  | "platform_sales";

type ApiKeyEnvironment = "test" | "live";

type AgenticMode = "disabled" | "shadow" | "assist_review" | "auto_decide";

type Organization = {
  organization_id: string;
  name: string;
  legal_name: string | null;
  website: string | null;
  billing_email: string | null;
  contact_person_name: string | null;
  contact_phone: string | null;
  status: OrganizationStatus;
  created_at: string;
  updated_at: string;
};

type OrganizationUpdateRequest = {
  name?: string;
  contact_person_name?: string | null;
  contact_phone?: string | null;
};

type Workspace = {
  workspace_id: string;
  organization_id: string;
  name: string;
  slug: string;
  description: string | null;
  status: WorkspaceStatus;
  created_at: string;
  updated_at: string;
};

type WebhookEndpoint = {
  webhook_endpoint_id: string;
  organization_id: string;
  workspace_id: string;
  target_url: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type WebhookEndpointCreate = {
  target_url: string;
  description?: string | null;
};

type WorkspaceAnalyticsResponse = {
  total: number;
  by_status: Record<VerificationStatus, number>;
  generated_at: string;
  manual_review_rate: number;
  by_workflow: {
    workflow_id: string;
    workflow_name: string;
    total_sessions: number;
    manual_review_count: number;
    manual_review_rate: number;
    confidence_override_count: number;
    confidence_override_rate: number;
    auto_decide_count: number;
    auto_decide_rate: number;
    approved_count: number;
    rejected_count: number;
  }[];
};

type WorkspaceReviewDecisionRequest = {
  decision: "approve" | "reject";
  reason?: string;
  notes?: string;
};

type OrganizationMember = {
  organization_member_id: string;
  organization_id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: ClientRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
};

type PlatformAdminUser = {
  platform_admin_id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: PlatformRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
};

type AdminSupportNote = {
  verification_id: string;
  note: string;
  actor_user_id: string;
  created_at: string;
};

type AdminSupportNoteRequest = {
  verification_id: string;
  note: string;
};

type ClientSession = {
  authenticated: boolean;
  userId?: string;
  organizationId?: string;
  organizationRole?: ClientRole;
  expiresAt?: string;
};

type ClientProfileResponse = {
  email: string;
  company_name: string;
  contact_person_name: string | null;
  contact_phone: string | null;
  phase: Phase;
  is_active: boolean;
};

type Workflow = {
  workflow_id: string;
  name: string;
  services: ("selfie" | "liveness" | "document" | "age")[];
  min_age?: number;
  auto_decide_allowed: boolean; // Defaults true; gates agentic auto_decide per workflow.
  agentic_mode: AgenticMode; // Defaults disabled; workflow-level rollout mode.
  auto_decide_confidence_threshold?: number | null; // 0.0-1.0; null disables gray-zone confidence override.
  created_at: string;
  updated_at: string;
};

type PlatformAdminInviteRequest = {
  email: string;
  password: string;
  full_name?: string | null;
  role: PlatformRole;
};

type PlatformAdminUpdateRequest = {
  full_name?: string | null;
  role?: PlatformRole;
  status?: UserStatus;
};

type WorkflowCreate = {
  name: string;
  services: ("selfie" | "liveness" | "document" | "age")[];
  min_age?: number;
  auto_decide_allowed?: boolean; // Defaults true when omitted.
  agentic_mode?: AgenticMode; // Defaults disabled when omitted.
  auto_decide_confidence_threshold?: number | null; // Set only after replay validation.
};

type WorkflowUpdate = {
  name?: string;
  services?: ("selfie" | "liveness" | "document" | "age")[];
  min_age?: number;
  auto_decide_allowed?: boolean;
  agentic_mode?: AgenticMode;
  auto_decide_confidence_threshold?: number | null; // null clears/disables the override.
};

type ApiKeyListItem = {
  api_key_id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
};

type ApiKeyCreate = {
  name: string;            // 1..255 chars
};

type ApiKeyCreateResponse = {
  api_key_id: string;
  name: string;
  api_key: string;        // returned once, never again
  created_at: string;
};

type AiFailureCheckCounters = {
  total: number;
  pass: number;
  fail: number;
  manual_review: number;
  pending: number;
  skipped: number;
  // fail / (pass + fail + manual_review), 0.0 when the denominator is 0.
  failure_rate: number;
};

type AiFailureByType = {
  [K in "ocr" | "face_match" | "liveness" | "duplicate" | "age" | "document_quality" | "agentic_review"]:
    AiFailureCheckCounters;
};

type AiFailureTotals = {
  checks: number;          // total verification_checks rows in the window
  by_type: AiFailureByType;
};

type AiFailureClientRow = {
  client_id: string;
  name: string;
  is_active: boolean;
  by_type: AiFailureByType;
};

type AiFailureMetrics = {
  window: {
    since: string | null;   // ISO 8601, or null when no time filter
    generated_at: string;   // ISO 8601, server-side timestamp
  };
  totals: AiFailureTotals;
  clients: AiFailureClientRow[];
};

type AgenticMonitoringMetrics = {
  window: {
    since: string | null;
    generated_at: string;
  };
  scope: {
    organization_id: string | null;
    workspace_id: string | null;
    agentic_mode: AgenticMode | null;
    recommended_status: VerificationStatus | null;
  };
  totals: {
    agentic_reviews: number;
    model_called: number;
    provider_failures: number;
    provider_failure_rate: number;
    budget_fallbacks: number;
    invalid_output_fallbacks: number;
    auto_decisions: number;
    by_mode: Record<string, number>;
    by_recommendation: Partial<Record<VerificationStatus, number>>;
  };
};

type AiModelProviderType =
  | "google_gemma"
  | "nvidia"
  | "ollama_cloud"
  | "openai_compatible";

type AiModelProviderKey = {
  key_id: string;
  label: string;
  key_last4: string;
  enabled: boolean;
  daily_limit: number | null;
  daily_used: number;
  monthly_limit: number | null;
  monthly_used: number;
  cooldown_until: string | null;
  last_error_code: string | null;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
};

type AiModelProvider = {
  provider_id: string;
  provider_type: AiModelProviderType;
  display_name: string;
  base_url: string | null;
  model_name: string | null;
  purpose: "agentic_adjudication" | string;
  enabled: boolean;
  priority: number;
  timeout_seconds: number | null;
  max_tokens: number | null;
  keys: AiModelProviderKey[];
  created_at: string;
  updated_at: string;
};

type AiModelProviderCreate = {
  provider_type: AiModelProviderType;
  display_name: string;
  base_url?: string | null;
  model_name?: string | null;
  enabled?: boolean;
  priority?: number;
  timeout_seconds?: number | null;
  max_tokens?: number | null;
};

type AiModelProviderUpdate = Partial<
  Pick<
    AiModelProviderCreate,
    "display_name" | "base_url" | "model_name" | "enabled" | "priority" | "timeout_seconds" | "max_tokens"
  >
>;

type AiModelProviderKeyCreate = {
  label: string;
  api_key: string; // accepted once, never returned
  enabled?: boolean;
  daily_limit?: number | null;
  monthly_limit?: number | null;
};

type AiModelProviderKeyUpdate = {
  label?: string;
  enabled?: boolean;
  daily_limit?: number | null;
  monthly_limit?: number | null;
  clear_cooldown?: boolean;
};

type AiModelProviderKeyTestResult = {
  provider_id: string;
  key_id: string;
  ok: boolean;
  provider_type: AiModelProviderType;
  model_name: string | null;
  latency_ms: number | null;
  response_preview: string | null;
  error_code: string | null;
};

type CreditLedgerEntryType =
  | "signup_bonus"
  | "free_top_up"
  | "subscription_grant"
  | "purchase"
  | "reservation"
  | "settlement"
  | "release"
  | "adjustment";

type CreditBalance = {
  available_credits: number;
  reserved_credits: number;
  total_credits: number;
  free_credits: number;
  subscription_credits: number;
  purchased_credits: number;
};

type CreditLedgerEntry = {
  ledger_entry_id: string;
  organization_id: string;
  workspace_id: string | null; // null for org-wide grants (signup bonus, monthly top-up, subscription grant, manual adjustment).
  verification_id: string | null;
  entry_type: CreditLedgerEntryType;
  free_delta: number;
  subscription_delta: number;
  purchased_delta: number;
  reserved_free_delta: number;
  reserved_subscription_delta: number;
  reserved_purchased_delta: number;
  balance_after: number;
  free_balance_after: number;
  subscription_balance_after: number;
  purchased_balance_after: number;
  reserved_balance_after: number;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

type CreditReservedSession = {
  verification_id: string;
  workspace_id: string | null;
  status: VerificationStatus;
  reserved_credits: number;
  reserved_at: string;
  timeout_at: string;
};

type CreditLedgerResponse = {
  balance: CreditBalance;
  reserved_sessions: CreditReservedSession[];
  entries: CreditLedgerEntry[];
};

type BillingCatalogItem = {
  key: string;
  name: string;
  kind: "subscription" | "credit_pack";
  price_usd_cents: number;
  credits: number;
  effective_price_usd_cents: number;
  rollover_cap: number | null;
  dodo_configured: boolean;
};

type BillingCatalogResponse = {
  subscriptions: BillingCatalogItem[];
  credit_packs: BillingCatalogItem[];
};

type BillingCheckoutRequest = {
  catalog_key: string;
};

type BillingCheckoutResponse = {
  checkout_session_id: string;
  dodo_session_id: string;
  checkout_url: string;
};

type BillingSubscriptionRead = {
  subscription_id: string;
  plan_key: string;
  status: string;
  monthly_credits: number;
  current_period_end: string | null;
  dodo_customer_id: string | null;
};

type AdminBillingCatalogItem = {
  catalog_item_id: string;
  key: string;
  name: string;
  kind: "subscription" | "credit_pack";
  dodo_product_id: string | null;
  price_usd_cents: number;
  credits: number;
  rollover_cap: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type AdminBillingCatalogItemUpdate = Partial<{
  name: string;
  dodo_product_id: string | null;
  price_usd_cents: number;
  credits: number;
  rollover_cap: number | null;
  is_active: boolean;
  sort_order: number;
}>;
```

`CheckResult` keys are: `ocr`, `face_match`, `liveness`, `duplicate`,
`age`, `document_quality`, and `agentic_review`. The frontend reads them through
`verification.checks.<key>` and never indexes by raw JSON keys.

The `document_quality` check stores only safe quality signals:
readability, image quality, missing document regions, suspected tampering,
retry recommendation, quality confidence, and provider class. It never exposes
raw images, file paths, model prompts, or provider credentials. When
`retry_recommended=true`, upload/config/detail responses may include
`requires_user_action: { action: "retake_document", ... }`; the end-user
surface asks for a new document image without mentioning models or internal
quality scoring.

The OCR check's `result.document` is the canonical normalized
document-understanding payload for downstream checks. Raw OCR text
lines are never persisted in the API response; sensitive identifiers
such as document numbers are exposed only as HMAC hashes.

The `agentic_review` check's `result` exposes only a validated verdict,
safe evidence references, policy-gate metadata, provider/cost metadata,
the LangGraph `thread_id`, deterministic-vs-agentic evaluation fields,
and a nullable `reviewer_feedback` placeholder for the future review UI.
It never exposes raw prompts, raw OCR text, full document numbers, raw
file paths, API keys, webhook secrets, or biometric captures.

### SSO / Google OAuth

Google "Sign in with Google" is available as an optional client-user
sign-in path. `POST /api/v1/auth/google` accepts a Google authorization
`code`, verifies it server-side via `https://oauth2.googleapis.com/token`,
fetches the user profile via `https://www.googleapis.com/oauth2/v2/userinfo`,
and returns the same `UnifiedLoginResponse` shape used by email/password
login. The frontend redirects the browser to Google's OAuth consent page
and handles the callback at `/login/google/callback`.

---

### Verification Flow Types (New)

```ts
// Enhanced step types with workflow integration
type VerifyStepType =
  | "intro"
  | "selfie_instruction"
  | "selfie_capture"
  | "liveness_instruction"
  | "liveness_capture"
  | "document_front_instruction"
  | "document_front_capture"
  | "document_back_instruction"
  | "document_back_capture"
  | "submitting"
  | "processing"
  | "approved"
  | "rejected"
  | "manual_review"
  | "error";

// Workflow-specific config
interface VerifyStepConfig {
  step: VerifyStepType;
  title: string;
  description: string;
  dynamic?: boolean; // New: Steps can be workflow-specific
  workflowId?: string;
  servicesRequired: ("selfie" | "liveness" | "document" | "age")[];
};
```

```ts
// Verification step types for the /verify flow
type VerifyStepType =
  | "intro"
  | "selfie_instruction"
  | "selfie_capture"
  | "liveness_instruction"
  | "liveness_capture"
  | "document_front_instruction"
  | "document_front_capture"
  | "document_back_instruction"
  | "document_back_capture"
  | "submitting"
  | "processing"
  | "approved"
  | "rejected"
  | "manual_review"
  | "error";

type VerifyStepConfig = {
  step: VerifyStepType;
  title: string;
  description: string;
  camera_only: boolean;      // true for selfie/liveness - no upload fallback
  facing_mode: "user" | "environment"; // user = front camera, environment = back camera
  frame_type?: "oval" | "rectangle" | null;   // Visual frame guide
  optional?: boolean;        // Can be skipped (e.g., document back)
};

// Workflow-driven step plan returned by GET /api/v1/workflows/{id}/verify-plan
type VerifyPlanResponse = {
  workflow_id: string;
  workflow_name: string;
  steps: VerifyStepConfig[];
  estimated_duration_seconds: number;
};

type VerificationConfigResponse = {
  verification_id: string;
  status: VerificationStatus;
  workflow_name: string;
  services: ("selfie" | "liveness" | "document" | "age")[];
  min_age?: number | null;
  callback_url?: string | null; // Stored session callback used by Done/Continue browser navigation.
  step_sequence: VerifyStepConfig[];
};

// Session start response includes verification_id for deep linking
type StartVerificationResponse = {
  verification_id: string;
  status: VerificationStatus;
  verify_url: string;  // Full URL to open in new tab: /verify?verification_id=<uuid>
};
```

---

## Backend Endpoints (browser-callable, developer API)

These are called directly from the browser via `apiClient.*` and
authenticated with `X-API-Key`.

### `GET /api/v1/health`
Public. Used by the landing page to render a status dot.
Response: `HealthStatus`

### `GET /api/v1/health/live`
Public. Liveness probe. Returns `200 OK` with empty body.

### `POST /api/v1/verifications/start`
Auth: `X-API-Key`
Request:
```ts
type StartVerificationRequest = {
  external_user_id: string;
  metadata?: Record<string, unknown>;
  client_metadata?: Record<string, unknown>;
  callback_url?: string; // Stored server-to-server webhook URL; also returned by config for browser Done/Continue navigation.
  workflow_id: string; // Mandatory: links session to client-defined workflow
};
```
The optional `client_metadata` object allows the calling integration to attach
server-side risk signals (e.g., `user_trust_score`, `ip_reputation`, `device_id`,
`account_age_days`, `risk_flags`) that the agentic adjudicator may consider.
This data is **not** used by the deterministic risk engine and is only surfaced
to the agentic layer. The client is responsible for the accuracy and privacy
compliance of any metadata they send. Keys are not validated by the API, and
clients should send this object only from trusted server-side integrations, not
from end-user-controlled browser input.
The optional `callback_url` is stored on the session for signed
server-to-server webhook delivery. It is also returned by the public config
endpoint so `/verify` can navigate the browser back to the requesting service
from the Done/Continue button. `/verify` must ignore query-string
`callback_url` values; only the server-stored value is trusted.
Response: `StartVerificationResponse` (includes `verify_url` for deep linking)

### `GET /api/v1/workflows/{workflow_id}/verify-plan`
Auth: `X-API-Key` (or public for verify page)
Returns the step-by-step plan for the verify flow based on workflow services.
Response: `VerifyPlanResponse`

### `GET /api/v1/verifications/{verification_id}/config`
Public. Returns the session status plus workflow services and the step sequence
for the `/verify` page. Reopened links use `status` to render an already
submitted or terminal screen instead of repeating capture.
The response includes the server-stored `callback_url` when configured so the
Done/Continue action can use a normal top-level navigation. `/verify` must not
redirect to query-string-supplied callback URLs.

> **Desktop-to-mobile handoff (client-only flow):** The `/verify` page may
> render a "Continue on mobile" modal when the session is `pending_upload`
> and the user is on a non-mobile device. The modal encodes the same
> `/verify?verification_id=...` URL into a QR code; the desktop page polls
> `GET /api/v1/verifications/{verification_id}` (the existing authenticated
> polling endpoint) in the background while the modal is open and renders
> the standard terminal result screen once a terminal status arrives. No
> new backend endpoint is required — the handoff reuses the existing
> verification config + status polling contracts.
Response: `VerificationConfigResponse`

### `POST /api/v1/verifications/{verification_id}/upload`
Public verification-session endpoint. The path `verification_id` is the only
credential required for the end-user upload flow; callers do not send API keys,
session keys, or workspace identifiers.
Content-Type: `multipart/form-data`
Fields: `selfie_image` (req), `id_front_image` (req), `id_back_image` (opt).
JPEG, PNG, and WebP images up to 50 MB raw are accepted. The backend normalizes
EXIF orientation, converts to WebP, and compresses stored evidence to the
configured post-compression cap (currently 300 KB). If the image cannot be
compressed under the cap, the API returns `413`.
Only accepted while the session is `pending_upload`; reused submitted links
return `409 Conflict`.
If credits are available, the backend reserves them and returns `processing`.
If no credits are available, the backend stores the evidence, returns
`awaiting_credits`, and queues no worker until credits are later granted or
purchased. Exhausted credits do not return `402` for active organizations.
Response: `{ verification_id: string; status: "processing" | "awaiting_credits" }`

### `GET /api/v1/verifications/{verification_id}`
Public verification-session status/detail endpoint for the end-user flow. The
path `verification_id` is sufficient; no API key or session key is required.
Response: `VerificationDetail`

### Subject Lifecycle APIs
Auth: `X-API-Key`

These APIs operate on the API key's resolved
`organization_id`/`workspace_id`; callers never send tenant ids. The path
`external_user_id` must be URL encoded.

- `POST /api/v1/subjects/{external_user_id}/reset-verification`
  - Request: `SubjectDeleteRequest`
  - Response: `SubjectLifecycleResponse`
  - Deletes all verification sessions, evidence files, checks, webhook
    deliveries, and face embeddings for the subject. Intended for legitimate
    re-verification after the client changes user attributes such as DOB,
    name, or gender.
- `DELETE /api/v1/subjects/{external_user_id}`
  - Request: `SubjectDeleteRequest`
  - Response: `SubjectLifecycleResponse`
  - Full client-requested subject deletion. Same data-removal semantics as
    reset, with action `subject_deleted`.
- `PUT /api/v1/subjects/{external_user_id}/ban`
  - Request: `SubjectBanRequest`
  - Response: `SubjectLifecycleResponse`
  - Creates or replaces a soft/permanent ban. Deletes session artifacts and
    PII-like verification data but retains a minimized tenant-scoped face
    embedding marker for future ban matching.
- `PATCH /api/v1/subjects/{external_user_id}/ban`
  - Request: `SubjectBanUpdateRequest`
  - Response: `SubjectLifecycleResponse`
  - Updates reason, expiry, soft/permanent mode, metadata, or lifts the ban
    with `is_active: false`.
- `GET /api/v1/subjects/{external_user_id}/ban`
  - Response: `SubjectBanStatus | null`
  - Returns active or historical ban status without exposing biometric
    vectors.

Subject lifecycle mutations are idempotent at the semantic level: repeating a
delete/reset after data is gone returns zero deleted sessions, and repeating a
ban update returns the current ban state. Every mutation writes an audit log.

### Webhook payload shape
Callbacks continue to send only the final status contract:
`{ verification_id, external_user_id, status, risk_score, decision_reason }`.
Agentic recommendation fields are intentionally omitted unless a later
explicit webhook contract version adds them.

## Backend Endpoints (Unified Auth)
Auth: `halokyc_client` cookie through BFF, or `Authorization: Bearer <temp_jwt>`.

- `POST /api/v1/auth/login`: Unified login. Request: `{ email, password }`. Response: `UnifiedLoginResponse`.
- `POST /api/v1/auth/google`: Exchange Google authorization code for `UnifiedLoginResponse`. Request: `GoogleAuthRequest` (`{ code }`). See "Google OAuth" section below.
- `POST /api/v1/auth/google/complete-signup`: Exchange temp token + `GoogleCompleteSignupRequest` (`{ company_name }`) for a fresh `UnifiedLoginResponse` after provisioning the user's first organization/default workspace.
- `POST /api/v1/auth/select-admin`: Exchange temp token for admin JWT. Response: `TokenResponse`.
- `POST /api/v1/auth/select-client`: Exchange temp token + `organization_id` for client JWT. Response: `TokenResponse`.

---

## Backend Endpoints (admin proxy, via BFF cookies)


These are only called through the Next.js BFF route handlers.

### `POST /api/v1/auth/admin/token`
Request: `{ username: string; password: string }`
Response: `AdminTokenResponse`
BFF sets `halokyc_admin` httpOnly cookie. The backend validates database-backed
`platform_admins`; when no `platform_owner` exists, matching env bootstrap
credentials create the first active `platform_owner`.

### `DELETE /api/admin/login`
Clears the cookie. Returns `{ ok: true }`.

### `GET /api/admin/session`
Returns `AdminSession`.

---

## Backend Endpoints (client self-service proxy, via BFF cookies)

Phase D2+ client-user auth and self-service management.

### `POST /api/v1/auth/client/token`
Request: `{ email: string; password: string }`
Response: `AdminTokenResponse`
BFF sets `halokyc_client` httpOnly cookie.

### `POST /api/v1/auth/client/signup`
Request: `{ email: string; password: string; company_name: string }`
Response: `AdminTokenResponse`
Creates one active user, one organization, one `client_owner` membership, and
one default workspace.

### `DELETE /api/client/login`
Clears the cookie. Returns `{ ok: true }`.

### `GET /api/client/session`
Returns `ClientSession`.

### `GET /api/client/me`
Response: `ClientProfileResponse`

### `PATCH /api/client/me`
Request: `{ name?: string; contact_person_name?: string | null; contact_phone?: string | null }`
Response: `ClientProfileResponse`

### `GET /api/client/me/api-keys`
Response: `ApiKeyListItem[]`
Optional query params:
- `include_revoked=true` - include revoked keys. Defaults to active
  keys only.

### `POST /api/v1/me/api-keys`
Request: `ApiKeyCreate`
Response: `ApiKeyCreateResponse`

### `POST /api/v1/me/api-keys/{api_key_id}/revoke`
Response: `204 No Content`

### Workflow Management
Auth: `halokyc_client` cookie.
- `GET /api/v1/me/workflows`: Returns `Workflow[]`.
- `POST /api/v1/me/workflows`: Request `WorkflowCreate`, Response `Workflow`.
- `PATCH /api/v1/me/workflows/{id}`: Request `WorkflowUpdate`, Response `Workflow`.
- `DELETE /api/v1/me/workflows/{id}`: Response `204`.
- `GET /api/v1/workflows/{id}`: Public/Auth. Returns `Workflow` config for the `/verify` page.

### Client Review Queue
Auth: `halokyc_client` cookie.
- `GET /api/v1/me/verifications`: Returns paginated session activity.
  Optional query params: `status`, `external_user_id`, `since`, `until`,
  `agentic_mode=disabled|shadow|assist_review|auto_decide`,
  `agentic_recommendation=approved|rejected|manual_review`, `limit`,
  `offset`.
- `GET /api/v1/me/verifications/summary`: Returns
  `VerificationSummaryResponse` with tenant-scoped per-status counts
  plus up to 64 recent sessions for cadence bars and up to five oldest
  manual-review sessions for the dashboard overview.
- `GET /api/v1/me/verifications/{id}`: Returns
  `VerificationSessionDetail` for any session owned by the caller's
  client, including check results, audit logs, safe file metadata, and
  same-client duplicate session references when the duplicate check
  matched an existing external user id.
- `GET /api/v1/me/verifications/{id}/files/{file_id}`: Streams one
  uploaded evidence image owned by the caller's client. Response is
  binary image data (`image/jpeg` or `image/png`) and is not public;
  callers must use the client BFF so the httpOnly JWT is forwarded.
- `GET /api/v1/organizations/{organization_id}/credits`: Returns the caller's unified credit
  balance plus active reserved sessions and tenant-scoped ledger rows.
  Stale active reservations are released before the response is generated.
  Optional query params:
  - `limit` (1..200, default 100)
  - `offset` (>=0, default 0)
  - `workspace_id` (uuid) - filter ledger rows to one workspace. The
    balance snapshot is always the full organisation-level balance; the
    workspace filter only scopes ledger rows. Unknown or out-of-org
    workspace ids return 404.
- `GET /api/v1/billing/catalog`: Returns subscription plans and one-time
  credit packs sourced from `PRODUCT_PLAN.md` §14 plan table
  ID configuration. Allowed: any active organization member.
- `GET /api/v1/billing/subscription`: Returns the organization's latest local
  Dodo subscription mirror, or `null` when no subscription webhook has been
  processed. Allowed: any active organization member.
- `POST /api/v1/billing/checkout/subscription`: Request
  `BillingCheckoutRequest`, Response `BillingCheckoutResponse`. Creates a
  hosted Dodo checkout session for a subscription product. Allowed:
  organization owner/admin.
- `POST /api/v1/billing/checkout/credits`: Request
  `BillingCheckoutRequest`, Response `BillingCheckoutResponse`. Creates a
  hosted Dodo checkout session for a one-time credit pack. Allowed:
  organization owner/admin.
- `POST /api/v1/billing/webhooks/dodo`: Public Dodo webhook receiver. The
  backend verifies `webhook-id`, `webhook-signature`, and `webhook-timestamp`
  with the official Dodo SDK before processing. Successful subscription events
  grant subscription credits through `CreditService`; successful one-time
  payments add purchased credits through the same ledger.
- `GET /api/v1/me/reviews`: Returns `AdminReviewItem[]` (sessions needing review).
- `GET /api/v1/me/reviews/{id}`: Returns `AdminReviewDetail`.
- `POST /api/v1/me/reviews/{id}/approve`: Response `AdminDecisionResponse`.
- `POST /api/v1/me/reviews/{id}/reject`: Request `{ reason: string }`, Response `AdminDecisionResponse`.

---

## Backend Endpoints (admin client-management proxy, via BFF cookies)

Auth: `halokyc_admin` cookie.
- `POST /api/v1/clients`: Create client.
- `GET /api/v1/clients`: List clients.
- `GET /api/v1/clients/{id}`: Client detail.
- `PATCH /api/v1/clients/{id}`: Update client.
- `POST /api/v1/clients/{id}/phase`: Change client phase.
- `GET /api/v1/clients/{id}/api-keys`: List all keys for client.
- `POST /api/v1/clients/{id}/api-keys`: Provision key.

### Platform Monitoring (admin)
- `GET /api/v1/admin/metrics/ai-failures`: Per-check-type pass / fail
  counts plus failure rate (`fail / (pass + fail + manual_review)`)
  for OCR, face-match, liveness, duplicate, and age checks. Admin
  only. Optional query params:
  - `client_id=<uuid>` - drill into one client. When supplied,
    `clients` contains exactly one entry if the client exists,
    otherwise an empty array; `totals` always reflects the filter
    scope.
  - `since=<iso8601>` - limit the aggregation to checks whose
    `created_at` is at or after the timestamp.
  Response: `AiFailureMetrics`. For the global response, `clients`
  includes every active client (even with zero checks) plus any
  inactive client that has checks in the window, sorted by
  `ocr.failure_rate` then `face_match.failure_rate` descending.
  `pending` and `skipped` are exposed but excluded from
  `failure_rate`. Full contract in
  `.agents/context/backend/MONITORING.md`.
- `GET /api/v1/admin/metrics/agentic`: Agentic rollout health metrics.
  Admin/support only. Optional query params:
  - `organization_id=<uuid>`
  - `workspace_id=<uuid>`
  - `since=<iso8601>`
  - `agentic_mode=disabled|shadow|assist_review|auto_decide`
  - `agentic_recommendation=approved|rejected|manual_review`
  Response: `AgenticMonitoringMetrics`, including provider failure rate,
  budget fallback count, invalid output fallback count, auto-decision volume,
  and by-mode / by-recommendation counts.
- `GET /api/v1/admin/metrics/automation`: Automation efficiency metrics from
  `manual_review_analytics_recorded` audit events. Admin/support only.
  Optional query params:
  - `organization_id=<uuid>`
  - `workspace_id=<uuid>`
  - `workflow_id=<uuid>`
  - `since=<iso8601>`
  - `until=<iso8601>`
  Response: `AutomationMetricsResponse`, including request window/scope,
  manual-review total/rate, timeout recovery total/success/rate, duplicate
  policy total/auto-decided/coverage, top manual-review factors, and a daily
  `series` with the same totals per bucket.
- `GET /api/v1/admin/metrics/manual-review-analytics`: Audit-log backed manual
  review analytics rows for rollout analysis. Admin/support only. Optional
  query params:
  - `organization_id=<uuid>`
  - `workspace_id=<uuid>`
  - `since=<iso8601>`
  - `until=<iso8601>`
  - `limit` (1..500, default 100)
  - `offset` (>=0, default 0)
  Response rows include workflow/workspace/org ids, enabled services, score,
  agent mode/confidence, timeout fields, duplicate outcome, OCR document type
  and country, final decision, manual-review flag, reviewer override, and
  override reason.
- `GET /api/v1/admin/credit-ledger`: Platform credit ledger rows,
  newest first. Admin only. Optional query params:
  - `client_id=<uuid>` - filter to one client. When supplied,
    `balance` is that client's current bucket balance.
  - `limit` (1..200, default 100)
  - `offset` (>=0, default 0)
  Response: `CreditLedgerResponse`. Without `client_id`, `entries`
  contains platform rows and `balance` is zeroed because there is no
  single platform account balance.

---

## Frontend Route Handlers (`src/app/api/`)

Thin handlers that set httpOnly cookies and proxy to backend.

### Admin BFF
- `POST /api/admin/login` $\rightarrow$ `POST /api/v1/auth/admin/token`
- `DELETE /api/admin/login` $\rightarrow$ `DELETE /api/admin/login`
- `GET /api/admin/session` $\rightarrow$ `GET /api/admin/session`

### Client BFF
- `POST /api/auth/login` $\rightarrow$ `POST /api/v1/auth/login`
- `POST /api/auth/select-admin` $\rightarrow$ `POST /api/v1/auth/select-admin`
- `POST /api/auth/select-client` $\rightarrow$ `POST /api/v1/auth/select-client`
- `POST /api/client/login` $\rightarrow$ `POST /api/v1/auth/client/token`
- `DELETE /api/client/login` $\rightarrow$ `DELETE /api/client/login`

- `GET /api/client/session` $\rightarrow$ `GET /api/client/session`
- `GET /api/client/me` $\rightarrow$ `GET /api/v1/organizations/{organization_id}` + `GET /api/v1/organizations/{organization_id}/members`
- `PATCH /api/client/me` $\rightarrow$ `PATCH /api/v1/organizations/{organization_id}`
- `GET /api/client/me/api-keys` $\rightarrow$ `GET /api/v1/me/api-keys`
- `POST /api/client/me/api-keys` $\rightarrow$ `POST /api/v1/me/api-keys`
- `POST /api/client/me/api-keys/{id}/revoke` $\rightarrow$ `POST /api/v1/me/api-keys/{id}/revoke`
- `GET /api/client/me/workflows` $\rightarrow$ `GET /api/v1/me/workflows`
- `POST /api/client/me/workflows` $\rightarrow$ `POST /api/v1/me/workflows`
- `PATCH /api/client/me/workflows/{id}` $\rightarrow$ `PATCH /api/v1/me/workflows/{id}`
- `DELETE /api/client/me/workflows/{id}` $\rightarrow$ `DELETE /api/v1/me/workflows/{id}`
- `GET /api/client/me/reviews` $\rightarrow$ `GET /api/v1/me/reviews`
- `GET /api/client/me/reviews/{id}` $\rightarrow$ `GET /api/v1/me/reviews/{id}`
- `POST /api/client/me/reviews/{id}/approve` $\rightarrow$ `POST /api/v1/me/reviews/{id}/approve`
- `POST /api/client/me/reviews/{id}/reject` $\rightarrow$ `POST /api/v1/me/reviews/{id}/reject`
- `GET /api/client/me/verifications` $\rightarrow$ `GET /api/v1/me/verifications`
- `GET /api/client/me/verifications/summary` $\rightarrow$ `GET /api/v1/me/verifications/summary`
- `GET /api/client/me/verifications/{id}` $\rightarrow$ `GET /api/v1/me/verifications/{id}`
- `GET /api/client/me/verifications/{id}/files/{file_id}` $\rightarrow$ `GET /api/v1/me/verifications/{id}/files/{file_id}`
- `GET /api/client/me/credits` $\rightarrow$ `GET /api/v1/organizations/{organization_id}/credits`
- `GET /api/client/billing/catalog` $\rightarrow$ `GET /api/v1/billing/catalog`
- `GET /api/client/billing/subscription` $\rightarrow$ `GET /api/v1/billing/subscription`
- `POST /api/client/billing/checkout/subscription` $\rightarrow$ `POST /api/v1/billing/checkout/subscription`
- `POST /api/client/billing/checkout/credits` $\rightarrow$ `POST /api/v1/billing/checkout/credits`
- `POST /api/client/workspaces/{workspace_id}/subjects/{external_user_id}/reset-verification` $\rightarrow$ `POST /api/v1/workspaces/{workspace_id}/subjects/{external_user_id}/reset-verification`
- `DELETE /api/client/workspaces/{workspace_id}/subjects/{external_user_id}` $\rightarrow$ `DELETE /api/v1/workspaces/{workspace_id}/subjects/{external_user_id}`
- `PUT /api/client/workspaces/{workspace_id}/subjects/{external_user_id}/ban` $\rightarrow$ `PUT /api/v1/workspaces/{workspace_id}/subjects/{external_user_id}/ban`
- `PATCH /api/client/workspaces/{workspace_id}/subjects/{external_user_id}/ban` $\rightarrow$ `PATCH /api/v1/workspaces/{workspace_id}/subjects/{external_user_id}/ban`
- `GET /api/client/workspaces/{workspace_id}/subjects/{external_user_id}/ban` $\rightarrow$ `GET /api/v1/workspaces/{workspace_id}/subjects/{external_user_id}/ban`
- `GET /api/client/organizations/{organization_id}` $\rightarrow$ `GET /api/v1/organizations/{organization_id}`
- `GET /api/client/organizations/{organization_id}/members` $\rightarrow$ `GET /api/v1/organizations/{organization_id}/members`
- `POST /api/client/organizations/{organization_id}/members` $\rightarrow$ `POST /api/v1/organizations/{organization_id}/members`
- `PATCH /api/client/organizations/{organization_id}/members/{member_id}` $\rightarrow$ `PATCH /api/v1/organizations/{organization_id}/members/{member_id}`

### Admin BFF (continued)
- `GET /api/admin/ledger` $\rightarrow$ `GET /api/v1/admin/credit-ledger`
- `GET /api/admin/metrics/agentic` $\rightarrow$ `GET /api/v1/admin/metrics/agentic`
- `GET /api/admin/metrics/automation` $\rightarrow$ `GET /api/v1/admin/metrics/automation`
- `GET /api/admin/billing/catalog` $\rightarrow$ `GET /api/v1/admin/billing/catalog`
- `PATCH /api/admin/billing/catalog/{catalog_item_id}` $\rightarrow$ `PATCH /api/v1/admin/billing/catalog/{catalog_item_id}`

---

## Polling Contract
`useVerification(id)` polls `GET /verifications/{id}` until terminal status.
`awaiting_credits` is non-terminal and should render like a neutral submitted
or long-running processing state to end users. Operator dashboards may label it
as `Awaiting credits`.

---

## Errors
- 400: Inline form error.
- 401: Unauthorized (redirect to login).
- 403: Inactive account.
- 404: Not found.
- 409: Conflict (e.g. client inactive).
- 413: File too large.
- 422: Validation error.
- 5xx: Server error.

---


## Workspace/RBAC Endpoints

These contracts are the Organizations, Workspaces, and RBAC target. Workspace
CRUD, workspace workflow CRUD, workspace API-key CRUD, workspace activity,
review, webhook endpoint management, analytics, audit-log routes, and external
verification API-key scope are implemented. Remaining platform-admin routes are planned.
Existing `/api/v1/me/...` routes remain compatibility routes until the
frontend fully moves to workspace URLs.

### Customer Organization APIs

Auth: `halokyc_client` cookie through BFF, or `Authorization: Bearer <jwt>`
server-side.

- `GET /api/v1/organizations/{organization_id}`: Return the caller's own
  organization record. Allowed: any active member.
- `PATCH /api/v1/organizations/{organization_id}`: Update the caller's own
  organization profile. Allowed: owner/admin. Request:
  `OrganizationUpdateRequest`.
- `GET /api/v1/organizations/{organization_id}/credits`: Return organization
  credit balance and ledger rows. Allowed: any active member. Query:
  `limit`, `offset`, optional `workspace_id`.
- `GET /api/v1/organizations/{organization_id}/members`: List organization
  members. Allowed: any active member of the same organization.
- `POST /api/v1/organizations/{organization_id}/members`: Invite new
  member. Allowed: owner/admin. Request: `OrganizationMemberInviteRequest`.
- `PATCH /api/v1/organizations/{organization_id}/members/{member_id}`:
  Update member role/status. Allowed: owner/admin. Request:
  `OrganizationMemberUpdateRequest`.

### Customer Workspace APIs


Auth: `halokyc_client` cookie through BFF, or `Authorization: Bearer <jwt>`
server-side.

- `GET /api/v1/workspaces`: list workspaces the current organization member can access.
- `POST /api/v1/workspaces`: create workspace. Allowed: owner/admin.
- `GET /api/v1/workspaces/{workspace_id}`: workspace detail.
- `PATCH /api/v1/workspaces/{workspace_id}`: update workspace. Allowed: owner/admin.
- `GET /api/v1/workspaces/{workspace_id}/workflows`: list workflows.
- `POST /api/v1/workspaces/{workspace_id}/workflows`: create workflow. Allowed: owner/admin.
- `PATCH /api/v1/workspaces/{workspace_id}/workflows/{workflow_id}`: update workflow. Allowed: owner/admin.
- `DELETE /api/v1/workspaces/{workspace_id}/workflows/{workflow_id}`: delete workflow. Allowed: owner/admin.
- `GET /api/v1/workspaces/{workspace_id}/api-keys`: list workspace API keys. Allowed: owner/admin/developer.
- `POST /api/v1/workspaces/{workspace_id}/api-keys`: create workspace API key with `environment: "test" | "live"`. Allowed: owner/admin/developer.
- `POST /api/v1/workspaces/{workspace_id}/api-keys/{api_key_id}/revoke`: revoke key. Allowed: owner/admin/developer.
- `GET /api/v1/workspaces/{workspace_id}/verifications`: workspace session activity.
  Optional query params: `status`, `external_user_id`, `since`, `until`,
  `agentic_mode=disabled|shadow|assist_review|auto_decide`,
  `agentic_recommendation=approved|rejected|manual_review`, `limit`,
  `offset`.
- `GET /api/v1/workspaces/{workspace_id}/verifications/summary`: workspace dashboard summary.
- `GET /api/v1/workspaces/{workspace_id}/verifications/{verification_id}`: workspace session detail. Sensitive evidence is role-filtered; `client_developer` callers receive an empty `files` array by default.
- `GET /api/v1/workspaces/{workspace_id}/verifications/{verification_id}/files/{file_id}`: authenticated evidence stream. Developers denied by default.
- `GET /api/v1/workspaces/{workspace_id}/reviews`: review queue. Allowed: owner/admin/reviewer.
- `GET /api/v1/workspaces/{workspace_id}/reviews/{verification_id}`: review detail. Allowed: owner/admin/reviewer.
- `POST /api/v1/workspaces/{workspace_id}/reviews/{verification_id}/decision`: `{ decision: "approve" | "reject", reason?: string, notes?: string }`. Allowed: owner/admin/reviewer.
- `GET /api/v1/workspaces/{workspace_id}/webhooks`: list webhook endpoints. Allowed: owner/admin/developer.
- `POST /api/v1/workspaces/{workspace_id}/webhooks`: create webhook endpoint. Allowed: owner/admin/developer.
- `GET /api/v1/workspaces/{workspace_id}/analytics`: workspace analytics.
- `GET /api/v1/workspaces/{workspace_id}/audit-logs`: workspace audit log. Allowed: owner/admin. Query: `limit` 1..200, `offset` >= 0.
- `POST /api/v1/workspaces/{workspace_id}/subjects/{external_user_id}/reset-verification`: dashboard equivalent of the developer API reset. Allowed: owner/admin.
- `DELETE /api/v1/workspaces/{workspace_id}/subjects/{external_user_id}`: dashboard equivalent of full subject deletion. Allowed: owner/admin.
- `PUT /api/v1/workspaces/{workspace_id}/subjects/{external_user_id}/ban`: dashboard create/replace soft or permanent ban. Allowed: owner/admin.
- `PATCH /api/v1/workspaces/{workspace_id}/subjects/{external_user_id}/ban`: dashboard update/lift ban. Allowed: owner/admin.
- `GET /api/v1/workspaces/{workspace_id}/subjects/{external_user_id}/ban`: dashboard read of ban status. Allowed: owner/admin/reviewer.

External verification APIs continue to omit tenant ids. The API key resolves
`organization_id`, `workspace_id`, `environment`, and `api_key_id` server-side.

### Platform Admin APIs

Auth: `halokyc_admin` cookie through BFF, backed by database platform users.

- `GET /api/v1/admin/organizations`
- `GET /api/v1/admin/organizations/{organization_id}`
- `GET /api/v1/admin/workspaces`
- `GET /api/v1/admin/workspaces/{workspace_id}`
- `GET /api/v1/admin/verifications`
  - Optional query params: `organization_id`, `workspace_id`,
    `agentic_mode`, `agentic_recommendation`.
- `GET /api/v1/admin/verifications/{verification_id}`
- `GET /api/v1/admin/billing/credits`
- `POST /api/v1/admin/billing/credits/adjust`
- `GET /api/v1/admin/billing/catalog`: Lists all subscription and one-time
  credit-pack catalog rows. Platform operator access.
- `PATCH /api/v1/admin/billing/catalog/{catalog_item_id}`: Updates name,
  Dodo product ID, price, credits, rollover cap, active state, and sort order.
  Platform owner access.
- `GET /api/v1/admin/support/webhook-logs`
- `GET /api/v1/admin/support/error-logs`
- `GET /api/v1/admin/support/notes`
- `POST /api/v1/admin/support/notes`
- `GET /api/v1/admin/sales/customers`
- `POST /api/v1/admin/sales/notes`
- `GET /api/v1/admin/platform-admins`: list internal admins. Allowed: platform owner.
- `POST /api/v1/admin/platform-admins/invite`: create an internal admin. Request: `PlatformAdminInviteRequest`. Allowed: platform owner.
- `PATCH /api/v1/admin/platform-admins/{platform_admin_id}`: update full name, role, or status. Request: `PlatformAdminUpdateRequest`. Allowed: platform owner. The last active `platform_owner` cannot be demoted or disabled.
- `GET /api/v1/admin/ai-providers`: list platform-owned model providers and safe key metadata. Allowed: platform owner.
- `POST /api/v1/admin/ai-providers`: create a provider route for agentic adjudication. Request: `AiModelProviderCreate`. Response: `AiModelProvider`. Allowed: platform owner.
- `PATCH /api/v1/admin/ai-providers/{provider_id}`: update provider display/config/routing state. Request: `AiModelProviderUpdate`. Response: `AiModelProvider`. Allowed: platform owner.
- `DELETE /api/v1/admin/ai-providers/{provider_id}`: delete a provider and its stored API keys. Response: `204 No Content`. Allowed: platform owner.
- `POST /api/v1/admin/ai-providers/{provider_id}/keys`: add an encrypted provider API key. Request: `AiModelProviderKeyCreate`. Response: `AiModelProviderKey`. Raw keys are accepted once and never returned. Allowed: platform owner.
- `PATCH /api/v1/admin/ai-providers/{provider_id}/keys/{key_id}`: update key label, enablement, quota limits, or clear cooldown. Request: `AiModelProviderKeyUpdate`. Response: `AiModelProviderKey`. Allowed: platform owner.
- `POST /api/v1/admin/ai-providers/{provider_id}/keys/{key_id}/test`: sends a tiny provider smoke prompt with that encrypted key. Response: `AiModelProviderKeyTestResult`. Allowed: platform owner.
- `DELETE /api/v1/admin/ai-providers/{provider_id}/keys/{key_id}`: delete one stored provider API key. Response: `204 No Content`. Allowed: platform owner.
- `GET /api/v1/admin/audit-logs`
- `GET /api/v1/admin/system-settings`
- `PATCH /api/v1/admin/system-settings`

---

## Google OAuth ("Sign in with Google")

### Backend

`POST /api/v1/auth/google`
Request body:

```ts
type GoogleAuthRequest = {
  code: string;
};
```

Response: `UnifiedLoginResponse`

`POST /api/v1/auth/google/complete-signup`
Headers: `Authorization: Bearer <UnifiedLoginResponse.temp_token>`
Request body:

```ts
type GoogleCompleteSignupRequest = {
  company_name: string;
};
```

Response: `UnifiedLoginResponse`

Rules:

- Google's stable account identifier (`sub` from OpenID userinfo, or `id` from
  Google OAuth v2 userinfo) is stored in `users.google_id`; repeated logins on
  the same Google account reuse the existing `User` row.
- If `users.email` already matches case-insensitively and `google_id` is unset,
  the row is linked.
- If no account is found, a new `User` is created with `email_verified_at=now()`
  and `organizations=[]`. The frontend handles the "no workspace yet" flow.
- Google-linked accounts that already have a platform-admin membership return
  `is_platform_admin: true`, identical to email/password.
- Google-only users with no organization complete setup through
  `/api/v1/auth/google/complete-signup`; the endpoint validates the short-lived
  unified token, creates one organization plus a default workspace, returns a
  fresh `UnifiedLoginResponse`, and lets `/select-account` issue the final
  client cookie.

### Frontend BFF

No proxy endpoint needed. Google redirects back to the Next.js app and
`GoogleCallbackHandler` at `/login/google/callback` forwards the `code`
directly to `POST /api/v1/auth/google` and follows the same unified-login
handshake (store in `sessionStorage["unified_auth"]`, navigate to
`/select-account` or `/login/google/complete`).

## What's Not Here
- Webhook config UIs (captured per-session in MVP).
- Audit-log browsing pages (visible only on detail pages).
- Public file downloads.
- Custom role builder / per-permission management UI.
- Forgot-password.
