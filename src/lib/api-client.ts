import { publicEnv } from "@/lib/env";

/**
 * Shape of the public backend health probe. Mirrors the FastAPI
 * `/api/v1/health` response in `backend/app/api/v1/routes/health.py`.
 */
export type HealthStatus = {
  status: "ok" | "degraded" | "down";
  version: string;
};

/**
 * Status of a verification session. Mirrors the `verification_status`
 * enum in `backend/.agents/context/DATABASE_SCHEMA.md`.
 */
export type VerificationStatus =
  | "pending_upload"
  | "awaiting_credits"
  | "processing"
  | "approved"
  | "rejected"
  | "manual_review";

export type AgenticMode =
  | "disabled"
  | "shadow"
  | "assist_review"
  | "auto_decide";

export type AgenticRecommendationFilter = Extract<
  VerificationStatus,
  "approved" | "rejected" | "manual_review"
>;

export type VerificationUserAction = {
  action: "retake_document";
  reason: string;
  fields: ("id_front" | "id_back")[];
};

export type VerifyStepConfig = {
  step: string;
  title: string;
  description: string;
  camera_only: boolean;
  facing_mode: "user" | "environment";
  frame_type: "oval" | "rectangle" | null;
  optional: boolean;
};

export type VerificationConfig = {
  verification_id: string;
  status: VerificationStatus;
  workflow_name: string;
  services: ("selfie" | "liveness" | "document" | "age")[];
  min_age?: number;
  callback_url?: string | null;
  step_sequence: VerifyStepConfig[];
  requires_user_action?: VerificationUserAction | null;
};

export type StartVerificationRequest = {
  external_user_id: string;
  metadata?: Record<string, unknown>;
  callback_url?: string;
  workflow_id: string;
};

export type StartVerificationResponse = {
  verification_id: string;
  status: VerificationStatus;
};

export type CheckResult = {
  status: "pass" | "fail" | "manual_review" | "pending" | "skipped";
  score?: number | null;
  detail?: Record<string, unknown>;
  result?: Record<string, unknown>;
};

export type DocumentQualityCheckResult = Omit<CheckResult, "result"> & {
  result: {
    readability: "good" | "fair" | "poor";
    image_quality: "good" | "fair" | "poor";
    missing_regions: string[];
    suspected_tampering: boolean;
    retry_recommended: boolean;
    quality_confidence: number;
    provider: "heuristic" | "multimodal_llm" | "unavailable";
  };
};

export type MetadataMatchingCheckResult = Omit<CheckResult, "result"> & {
  result: {
    status: "pass" | "fail" | "manual_review" | "pending" | "skipped";
    mismatches: string[];
    skipped_fields: string[];
    comparisons: Array<{
      field: string;
      expected: unknown;
      actual: unknown;
      matched: boolean;
    }>;
    informational_only: boolean;
  };
};

export type DuplicateMatchKind =
  | "ban_match"
  | "same_external_user"
  | "ambiguous";

export type DuplicateCheckResult = Omit<CheckResult, "result"> & {
  result?: Record<string, unknown> & {
    status?: "pass" | "fail" | "manual_review";
    duplicate_found?: boolean;
    matched_external_user_id?: string | null;
    similarity?: number | null;
    match_kind?: DuplicateMatchKind | "duplicate" | null;
    reason_code?: string | null;
  };
};

export type AgenticVerdict = {
  recommended_status: VerificationStatus;
  confidence: number;
  reason_codes: string[];
  human_summary: string;
  evidence_references: string[];
  requires_manual_review: boolean;
  requires_user_action?: VerificationUserAction | null;
};

export type AgenticReviewEvaluation = {
  deterministic_status: VerificationStatus;
  agentic_recommended_status: VerificationStatus;
  agreed_with_deterministic: boolean;
  would_deflect_manual_review: boolean;
  would_false_approve_against_deterministic: boolean;
  would_false_reject_against_deterministic: boolean;
};

export type AgenticReviewProvider = {
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

export type AgenticReviewResult = Record<string, unknown> & {
  verdict: AgenticVerdict;
  policy_gate: {
    should_call_model: boolean;
    skip_reason: string | null;
    reason_codes: string[];
    terminal_overrides: string[];
  };
  provider: AgenticReviewProvider | null;
  thread_id: string;
  fallback_reason: string | null;
  model_called: boolean;
  output_validation_status: string | null;
  evaluation?: AgenticReviewEvaluation;
  reviewer_feedback: {
    agreed_with_agent: boolean;
    reviewer_user_id: string;
    recorded_at: string;
  } | null;
};

export type AgenticReviewFeedbackRequest = {
  agreed_with_agent: boolean;
  notes?: string;
};

export type AgenticReviewCheckResult = Omit<CheckResult, "result"> & {
  result: AgenticReviewResult;
};

export type VerificationDetail = {
  verification_id: string;
  external_user_id: string;
  metadata: Record<string, unknown>;
  status: VerificationStatus;
  checks: Partial<Record<string, CheckResult>> & {
    duplicate?: DuplicateCheckResult;
    document_quality?: DocumentQualityCheckResult;
    metadata_matching?: MetadataMatchingCheckResult;
  };
  timeout_recovery?: boolean;
  timed_out_services?: string[];
  duplicate_session_id?: string | null;
  duplicate_match_kind?: DuplicateMatchKind | null;
  requires_user_action?: VerificationUserAction | null;
  risk_score: number | null;
  decision_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type UploadVerificationFilesInput = {
  selfie: File;
  idFront: File;
  idBack?: File;
};

export type UploadVerificationResponse = {
  verification_id: string;
  status: Extract<
    VerificationStatus,
    "pending_upload" | "processing" | "awaiting_credits"
  >;
  requires_user_action?: VerificationUserAction | null;
};

export type ConsentCaptureRequest = {
  policy_version: string;
  consent_timestamp: string;
  device_id: string | null;
  session_id: string | null;
};

export type ConsentCaptureResponse = {
  ok: true;
  recorded_at: string;
};

export type AdminSession = {
  authenticated: boolean;
  userId?: string;
  platformAdminId?: string;
  platformRole?:
    | "platform_owner"
    | "platform_business_admin"
    | "platform_support"
    | "platform_sales";
  expiresAt?: string;
};

export type ClientSession = {
  authenticated: boolean;
  userId?: string;
  organizationId?: string;
  organizationMemberId?: string;
  organizationRole?: ClientRole;
  expiresAt?: string;
};

export type ClientRole =
  | "client_owner"
  | "client_admin"
  | "client_reviewer"
  | "client_developer";

export type UserStatus = "active" | "disabled" | "invited";

export type OrganizationStatus = "active" | "suspended" | "disabled";

export type Organization = {
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

export type OrganizationMember = {
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

export type OrganizationMemberInviteRequest = {
  email: string;
  password: string;
  full_name?: string | null;
  role: ClientRole;
};

export type OrganizationMemberUpdateRequest = {
  full_name?: string | null;
  role?: ClientRole;
  status?: UserStatus;
};

export type WorkspaceStatus = "active" | "disabled" | "archived";

export type ApiKeyEnvironment = "test" | "live";

export type Workspace = {
  workspace_id: string;
  organization_id: string;
  name: string;
  slug: string;
  description: string | null;
  status: WorkspaceStatus;
  created_at: string;
  updated_at: string;
};

export type WorkspaceCreate = {
  name: string;
  description?: string | null;
};

export type WorkspaceUpdate = {
  name?: string;
  description?: string | null;
};

export type WebhookEndpoint = {
  webhook_endpoint_id: string;
  organization_id: string;
  workspace_id: string;
  target_url: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type WebhookEndpointCreate = {
  target_url: string;
  description?: string | null;
};

export type WorkspaceAuditLogItem = {
  action: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
};

export type WorkspaceAnalytics = {
  total: number;
  by_status: Record<VerificationStatus, number>;
  generated_at: string;
};

export type ApiKeyListItem = {
  api_key_id: string;
  name: string;
  environment: ApiKeyEnvironment;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
};

export type ApiKeyCreate = {
  name: string;
  environment?: ApiKeyEnvironment;
};

export type ApiKeyCreateResponse = {
  api_key_id: string;
  name: string;
  api_key: string;
  created_at: string;
};

export type Phase =
  | "onboarding"
  | "sandbox"
  | "kyc_verification"
  | "production"
  | "suspended";

export type ClientListItem = {
  client_id: string;
  name: string;
  is_active: boolean;
  phase: Phase;
  created_at: string;
};

export type ClientDetail = ClientListItem & {
  api_key_count: number;
  recent_verification_count: number;
  phase_changed_at: string | null;
};

export type ClientCreateResponse = {
  client_id: string;
  name: string;
  created_at: string;
};

export type ClientUpdate = {
  name?: string;
  is_active?: boolean;
};

export type ClientProfileResponse = {
  email: string;
  company_name: string;
  contact_person_name: string | null;
  contact_phone: string | null;
  phase: Phase;
  is_active: boolean;
};

export type Workflow = {
  workflow_id: string;
  name: string;
  services: ("selfie" | "liveness" | "document" | "age")[];
  min_age?: number;
  auto_decide_allowed: boolean;
  agentic_mode: AgenticMode;
  auto_decide_confidence_threshold?: number | null;
  created_at: string;
  updated_at: string;
};

export type WorkflowCreate = {
  name: string;
  services: ("selfie" | "liveness" | "document" | "age")[];
  min_age?: number;
  auto_decide_allowed?: boolean;
  agentic_mode?: AgenticMode;
  auto_decide_confidence_threshold?: number | null;
};

export type WorkflowUpdate = {
  name?: string;
  services?: ("selfie" | "liveness" | "document" | "age")[];
  min_age?: number;
  auto_decide_allowed?: boolean;
  agentic_mode?: AgenticMode;
  auto_decide_confidence_threshold?: number | null;
};

export type AdminReviewItem = {
  verification_id: string;
  status: VerificationStatus;
  risk_score: number | null;
  duplicate_session_id?: string | null;
  duplicate_match_kind?: DuplicateMatchKind | null;
  created_at: string;
};

export type AdminAuditLogItem = {
  action: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
};

export type AdminReviewDetail = VerificationDetail & {
  audit_logs: AdminAuditLogItem[];
};

export type VerificationEvidenceFile = {
  id: string;
  verification_id: string;
  file_type: "selfie" | "id_front" | "id_back";
  mime_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
};

export type DuplicateSessionReference = {
  verification_id: string;
  external_user_id: string;
  status: VerificationStatus;
  risk_score: number | null;
  decision_reason: string | null;
  similarity: number | null;
  created_at: string;
  updated_at: string;
};

export type VerificationSessionDetail = VerificationDetail & {
  workflow_id?: string | null;
  files: VerificationEvidenceFile[];
  audit_logs: AdminAuditLogItem[];
  duplicate_sessions: DuplicateSessionReference[];
};

export type AdminDecisionResponse = {
  verification_id: string;
  status: "approved" | "rejected";
};

export type VerificationListItem = {
  verification_id: string;
  external_user_id: string;
  workflow_id: string | null;
  status: VerificationStatus;
  risk_score: number | null;
  decision_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type VerificationListResponse = {
  items: VerificationListItem[];
  total: number;
  limit: number;
  offset: number;
};

export type VerificationStatusCounts = {
  pending_upload: number;
  awaiting_credits: number;
  processing: number;
  approved: number;
  rejected: number;
  manual_review: number;
};

export type VerificationSummaryResponse = {
  total: number;
  by_status: VerificationStatusCounts;
  recent_sessions: AdminReviewItem[];
  recent_reviews: AdminReviewItem[];
};

export type SubjectBanKind = "soft_ban" | "permanent_ban";

export type SubjectBanStatus = {
  ban_id: string;
  external_user_id: string;
  organization_id: string;
  workspace_id: string;
  kind: SubjectBanKind;
  is_active: boolean;
  reason: string | null;
  ban_expires_at: string | null;
  retained_face_embedding: boolean;
  created_at: string;
  updated_at: string;
  lifted_at: string | null;
};

export type SubjectLifecycleAction =
  | "verification_reset"
  | "subject_deleted"
  | "soft_banned"
  | "permanently_banned"
  | "ban_updated"
  | "ban_lifted";

export type SubjectLifecycleResponse = {
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

export type SubjectDeleteRequest = {
  reason?: string;
};

export type SubjectBanRequest = {
  kind: SubjectBanKind;
  reason?: string;
  ban_expires_at?: string | null;
  metadata?: Record<string, unknown>;
};

export type SubjectBanUpdateRequest = {
  kind?: SubjectBanKind;
  reason?: string | null;
  ban_expires_at?: string | null;
  metadata?: Record<string, unknown>;
  is_active?: boolean;
};

export type CreditLedgerEntryType =
  | "signup_bonus"
  | "free_top_up"
  | "subscription_grant"
  | "purchase"
  | "reservation"
  | "settlement"
  | "release"
  | "adjustment";

export type CreditBalance = {
  available_credits: number;
  reserved_credits: number;
  total_credits: number;
  free_credits: number;
  subscription_credits: number;
  purchased_credits: number;
};

export type CreditLedgerEntry = {
  ledger_entry_id: string;
  organization_id: string;
  workspace_id: string | null;
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

export type CreditReservedSession = {
  verification_id: string;
  workspace_id: string | null;
  status: VerificationStatus;
  reserved_credits: number;
  reserved_at: string;
  timeout_at: string;
};

export type CreditLedgerResponse = {
  balance: CreditBalance;
  reserved_sessions: CreditReservedSession[];
  entries: CreditLedgerEntry[];
};

export type BillingCatalogItem = {
  key: string;
  name: string;
  kind: "subscription" | "credit_pack";
  price_usd_cents: number;
  credits: number;
  effective_price_usd_cents: number;
  rollover_cap: number | null;
  dodo_configured: boolean;
};

export type BillingCatalogResponse = {
  subscriptions: BillingCatalogItem[];
  credit_packs: BillingCatalogItem[];
};

export type BillingCheckoutResponse = {
  checkout_session_id: string;
  dodo_session_id: string;
  checkout_url: string;
};

export type BillingSubscriptionRead = {
  subscription_id: string;
  plan_key: string;
  status: string;
  monthly_credits: number;
  current_period_end: string | null;
  dodo_customer_id: string | null;
};

export type PlatformRole =
  | "platform_owner"
  | "platform_business_admin"
  | "platform_support"
  | "platform_sales";

export type PlatformAdminUser = {
  platform_admin_id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: PlatformRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
};

export type PlatformAdminInviteRequest = {
  email: string;
  password: string;
  full_name?: string | null;
  role: PlatformRole;
};

export type PlatformAdminUpdateRequest = {
  full_name?: string | null;
  role?: PlatformRole;
  status?: UserStatus;
};

export type AdminSystemSettings = {
  credit_cost_per_verification: number;
  jwt_access_token_expire_minutes: number;
};

export type AdminOrganizationRead = {
  organization_id: string;
  name: string;
  legal_name: string | null;
  website: string | null;
  billing_email: string | null;
  status: OrganizationStatus;
  created_at: string;
  updated_at: string;
};

export type AdminOrganizationUpdateRequest = {
  name?: string;
  status?: OrganizationStatus;
};

export type AdminCreditAdjustmentRequest = {
  organization_id: string;
  amount: number;
  bucket: "free" | "subscription" | "purchased";
  description: string;
};

export type AdminBillingCatalogItem = {
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

export type AdminBillingCatalogItemUpdate = {
  name?: string;
  dodo_product_id?: string | null;
  price_usd_cents?: number;
  credits?: number;
  rollover_cap?: number | null;
  is_active?: boolean;
  sort_order?: number;
};

export type AdminWebhookDelivery = {
  id: string;
  verification_id: string;
  organization_id: string | null;
  workspace_id: string | null;
  target_url: string;
  http_status: number | null;
  attempt_count: number;
  delivered: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminErrorLog = {
  timestamp: string;
  error: string;
  context?: Record<string, unknown> | null;
};

export type AdminSalesCustomer = {
  organization_id: string;
  name: string;
  status: OrganizationStatus;
  plan: string | null;
  billing_email: string | null;
  available_credits: number;
  created_at: string;
};

export type AdminSalesNoteRequest = {
  organization_id: string;
  note: string;
};

export type AdminSalesNoteResponse = {
  organization_id: string;
  note: string;
  actor_user_id: string;
  created_at: string;
};

export type AdminSupportNote = {
  verification_id: string;
  note: string;
  actor_user_id: string;
  created_at: string;
};

export type AdminSupportNoteRequest = {
  verification_id: string;
  note: string;
};

export type AgenticMonitoringMetrics = {
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

export type AgenticMonitoringFilters = {
  organizationId?: string | null;
  workspaceId?: string | null;
  since?: string | null;
  agenticMode?: AgenticMode | null;
  agenticRecommendation?: AgenticRecommendationFilter | null;
};

export type AutomationMetrics = {
  window: {
    since: string | null;
    until: string | null;
    generated_at: string;
  };
  scope: {
    organization_id: string | null;
    workspace_id: string | null;
    workflow_id: string | null;
  };
  totals: AutomationMetricTotals;
  series: Array<{
    bucket_start: string;
    bucket_end: string;
    totals: AutomationMetricTotals;
  }>;
};

export type AutomationMetricTotals = {
  sessions_total: number;
  manual_review_total: number;
  manual_review_rate: number;
  timeout_recovery_total: number;
  timeout_recovery_success: number;
  timeout_recovery_success_rate: number;
  duplicate_policy_total: number;
  duplicate_policy_auto_decided: number;
  duplicate_policy_coverage: number;
  top_manual_review_factors: Array<{
    factor: string;
    count: number;
    share: number;
  }>;
};

export type AutomationMetricsFilters = {
  organizationId?: string | null;
  workspaceId?: string | null;
  workflowId?: string | null;
  since?: string | null;
  until?: string | null;
};

export const ALLOWED_UPLOAD_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
export const MAX_OPTIMIZED_UPLOAD_BYTES = 300 * 1024;
const OPTIMIZE_UPLOAD_TARGET_BYTES = 200 * 1024;
const OPTIMIZE_UPLOAD_MAX_EDGES = [1800, 1500, 1200, 1000, 850, 720, 640];
const OPTIMIZE_UPLOAD_QUALITIES = [0.82, 0.72, 0.62, 0.52, 0.44, 0.36];

export type ClientValidationError = {
  kind: "client-validation";
  field: string;
  message: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function joinUrl(path: string): string {
  return `${publicEnv.apiBaseUrl.replace(/\/$/, "")}${path}`;
}

function buildHeaders(init: RequestInit, apiKey?: string): Headers {
  const headers = new Headers(init.headers);
  const body = init.body;
  if (
    !headers.has("Content-Type") &&
    body !== undefined &&
    !(typeof FormData !== "undefined" && body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }
  if (apiKey) {
    headers.set("X-API-Key", apiKey);
  }
  return headers;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  apiKey?: string,
): Promise<T> {
  const response = await fetch(joinUrl(path), {
    ...init,
    headers: buildHeaders(init, apiKey),
  });
  if (!response.ok) {
    let body: unknown = undefined;
    try {
      body = await response.json();
    } catch {
      // ignore body parse errors
    }
    throw new ApiError(
      `API ${init.method ?? "GET"} ${path} failed with ${response.status}`,
      response.status,
      body,
    );
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

async function browserRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(resolveBrowserPath(path), {
    ...init,
    credentials: "include",
    headers: buildHeaders(init),
  });
  if (!response.ok) {
    let body: unknown = undefined;
    try {
      body = await response.json();
    } catch {
      // ignore body parse errors
    }
    throw new ApiError(
      `Browser API ${init.method ?? "GET"} ${path} failed with ${response.status}`,
      response.status,
      body,
    );
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

function resolveBrowserPath(path: string): string {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function validateUploadFile(
  file: File,
  field: string,
  maxBytes = MAX_UPLOAD_BYTES,
): void {
  if (
    !ALLOWED_UPLOAD_MIME.includes(
      file.type as (typeof ALLOWED_UPLOAD_MIME)[number],
    )
  ) {
    const err: ClientValidationError = {
      kind: "client-validation",
      field,
      message: `${field} must be JPEG, PNG, or WEBP (got ${file.type || "unknown"}).`,
    };
    throw new ApiError(err.message, 0, err);
  }
  if (file.size > maxBytes) {
    const err: ClientValidationError = {
      kind: "client-validation",
      field,
      message: `${field} is too large. Max ${formatBytes(maxBytes)}.`,
    };
    throw new ApiError(err.message, 0, err);
  }
  if (file.size === 0) {
    const err: ClientValidationError = {
      kind: "client-validation",
      field,
      message: `${field} is empty.`,
    };
    throw new ApiError(err.message, 0, err);
  }
}

async function optimizeUploadImage(file: File): Promise<File> {
  if (
    file.size <= OPTIMIZE_UPLOAD_TARGET_BYTES ||
    !ALLOWED_UPLOAD_MIME.includes(
      file.type as (typeof ALLOWED_UPLOAD_MIME)[number],
    ) ||
    typeof document === "undefined" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    let bestBlob: Blob | null = null;

    for (const maxEdge of OPTIMIZE_UPLOAD_MAX_EDGES) {
      const scale = Math.min(
        1,
        maxEdge / Math.max(image.naturalWidth, image.naturalHeight),
      );
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return file;
      context.drawImage(image, 0, 0, width, height);

      for (const quality of OPTIMIZE_UPLOAD_QUALITIES) {
        const blob = await canvasToBlob(canvas, quality);
        if (!blob) continue;
        if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;
        if (blob.size <= OPTIMIZE_UPLOAD_TARGET_BYTES) {
          bestBlob = blob;
          break;
        }
      }

      if (bestBlob && bestBlob.size <= OPTIMIZE_UPLOAD_TARGET_BYTES) break;
    }

    if (!bestBlob || bestBlob.size >= file.size) return file;
    const basename = file.name.replace(/\.[^.]+$/, "") || "evidence";
    return new File([bestBlob], `${basename}.jpg`, {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be decoded"));
    image.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });
}

async function optimizeUploadFiles(
  files: UploadVerificationFilesInput,
): Promise<UploadVerificationFilesInput> {
  const [selfie, idFront, idBack] = await Promise.all([
    optimizeUploadImage(files.selfie),
    optimizeUploadImage(files.idFront),
    files.idBack
      ? optimizeUploadImage(files.idBack)
      : Promise.resolve(undefined),
  ]);
  return { selfie, idFront, idBack };
}

export function validateUploadFiles(files: UploadVerificationFilesInput): void {
  validateUploadFile(files.selfie, "selfie_image");
  validateUploadFile(files.idFront, "id_front_image");
  if (files.idBack) {
    validateUploadFile(files.idBack, "id_back_image");
  }
}

function validateOptimizedUploadFiles(
  files: UploadVerificationFilesInput,
): void {
  validateUploadFile(files.selfie, "selfie_image", MAX_OPTIMIZED_UPLOAD_BYTES);
  validateUploadFile(
    files.idFront,
    "id_front_image",
    MAX_OPTIMIZED_UPLOAD_BYTES,
  );
  if (files.idBack) {
    validateUploadFile(
      files.idBack,
      "id_back_image",
      MAX_OPTIMIZED_UPLOAD_BYTES,
    );
  }
}

export type UnifiedLoginResponse = {
  user_id: string;
  is_platform_admin: boolean;
  organizations: {
    organization_id: string;
    name: string;
    role: ClientRole;
  }[];
  temp_token: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type AiModelProviderType =
  | "google_gemma"
  | "nvidia"
  | "ollama_cloud"
  | "openai_compatible";

export type AiModelProviderKey = {
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

export type AiModelProvider = {
  provider_id: string;
  provider_type: AiModelProviderType;
  display_name: string;
  base_url: string | null;
  model_name: string | null;
  purpose: string;
  enabled: boolean;
  priority: number;
  timeout_seconds: number | null;
  max_tokens: number | null;
  keys: AiModelProviderKey[];
  created_at: string;
  updated_at: string;
};

export type AiModelProviderCreate = {
  provider_type: AiModelProviderType;
  display_name: string;
  base_url?: string | null;
  model_name?: string | null;
  enabled?: boolean;
  priority?: number;
  timeout_seconds?: number | null;
  max_tokens?: number | null;
};

export type AiModelProviderUpdate = Partial<
  Pick<
    AiModelProviderCreate,
    | "display_name"
    | "base_url"
    | "model_name"
    | "enabled"
    | "priority"
    | "timeout_seconds"
    | "max_tokens"
  >
>;

export type AiModelProviderKeyCreate = {
  label: string;
  api_key: string;
  enabled?: boolean;
  daily_limit?: number | null;
  monthly_limit?: number | null;
};

export type AiModelProviderKeyUpdate = {
  label?: string;
  enabled?: boolean;
  daily_limit?: number | null;
  monthly_limit?: number | null;
  clear_cooldown?: boolean;
};

export type AiModelProviderKeyTestResult = {
  provider_id: string;
  key_id: string;
  ok: boolean;
  provider_type: AiModelProviderType;
  model_name: string | null;
  latency_ms: number | null;
  response_preview: string | null;
  error_code: string | null;
};

export const apiClient = {
  health: () => request<HealthStatus>("/api/v1/health"),

  unifiedLogin: (payload: { email: string; password: string }) =>
    browserRequest<UnifiedLoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  selectAdmin: (tempToken: string) =>
    browserRequest<TokenResponse>("/api/auth/select-admin", {
      method: "POST",
      headers: { Authorization: `Bearer ${tempToken}` },
    }),

  selectClient: (tempToken: string, organizationId: string) => {
  return browserRequest<TokenResponse>("/api/auth/select-client", {
      method: "POST",
      body: JSON.stringify({ organization_id: organizationId }),
      headers: { Authorization: `Bearer ${tempToken}` },
    });
  },
  googleAuth: (payload: { code: string }) =>
    request<UnifiedLoginResponse>("/api/v1/auth/google", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  googleCompleteSignup: (tempToken: string, payload: { company_name: string }) =>
    request<UnifiedLoginResponse>("/api/v1/auth/google/complete-signup", {
      method: "POST",
      headers: { Authorization: `Bearer ${tempToken}` },
      body: JSON.stringify(payload),
    }),

  startVerification: (payload: StartVerificationRequest, apiKey: string) =>
    request<StartVerificationResponse>(
      "/api/v1/verifications/start",
      { method: "POST", body: JSON.stringify(payload) },
      apiKey,
    ),

  uploadVerificationFiles: async (
    verificationId: string,
    files: UploadVerificationFilesInput,
  ): Promise<UploadVerificationResponse> => {
    validateUploadFiles(files);
    const optimizedFiles = await optimizeUploadFiles(files);
    validateOptimizedUploadFiles(optimizedFiles);
    const form = new FormData();
    form.append(
      "selfie_image",
      optimizedFiles.selfie,
      optimizedFiles.selfie.name,
    );
    form.append(
      "id_front_image",
      optimizedFiles.idFront,
      optimizedFiles.idFront.name,
    );
    if (optimizedFiles.idBack) {
      form.append(
        "id_back_image",
        optimizedFiles.idBack,
        optimizedFiles.idBack.name,
      );
    }
    return request<UploadVerificationResponse>(
      `/api/v1/verifications/${verificationId}/upload`,
      { method: "POST", body: form },
    );
  },

  getVerification: (verificationId: string) =>
    request<VerificationDetail>(
      `/api/v1/verifications/${verificationId}`,
    ),

  captureConsent: (
    verificationId: string,
    payload: ConsentCaptureRequest,
    apiKey: string,
  ) =>
    request<ConsentCaptureResponse>(
      `/api/v1/verifications/${verificationId}/consent`,
      { method: "POST", body: JSON.stringify(payload) },
      apiKey,
    ),

  captureConsentPublic: (
    verificationId: string,
    payload: ConsentCaptureRequest,
  ) =>
    request<ConsentCaptureResponse>(
      `/api/v1/verifications/public/${verificationId}/consent`,
      { method: "POST", body: JSON.stringify(payload) },
    ),

  getVerificationConfig: (verificationId: string) =>
    request<VerificationConfig>(
      `/api/v1/verifications/${verificationId}/config`,
    ),

  getWorkflow: (workflowId: string, apiKey: string) =>
    request<Workflow>(`/api/v1/workflows/${workflowId}`, undefined, apiKey),

  adminLogin: (payload: { username: string; password: string }) =>
    browserRequest<{ ok: true }>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  adminLogout: () =>
    browserRequest<{ ok: true }>("/api/admin/login", { method: "DELETE" }),

  getAdminSession: () => browserRequest<AdminSession>("/api/admin/session"),

  listAdminReviews: () =>
    browserRequest<AdminReviewItem[]>("/api/admin/reviews"),

  getAdminReview: (verificationId: string) =>
    browserRequest<AdminReviewDetail>(`/api/admin/reviews/${verificationId}`),

  approveAdminReview: (verificationId: string) =>
    browserRequest<AdminDecisionResponse>(
      `/api/admin/reviews/${verificationId}/approve`,
      { method: "POST" },
    ),

  rejectAdminReview: (verificationId: string, reason: string) =>
    browserRequest<AdminDecisionResponse>(
      `/api/admin/reviews/${verificationId}/reject`,
      { method: "POST", body: JSON.stringify({ reason }) },
    ),

  listAdminClients: () =>
    browserRequest<ClientListItem[]>("/api/admin/clients"),

  createAdminClient: (payload: { name: string }) =>
    browserRequest<ClientCreateResponse>("/api/admin/clients", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getAdminClient: (clientId: string) =>
    browserRequest<ClientDetail>(`/api/admin/clients/${clientId}`),

  updateAdminClient: (clientId: string, payload: ClientUpdate) =>
    browserRequest<ClientDetail>(`/api/admin/clients/${clientId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  updateAdminClientPhase: (clientId: string, phase: Phase) =>
    browserRequest<ClientDetail>(`/api/admin/clients/${clientId}/phase`, {
      method: "POST",
      body: JSON.stringify({ phase }),
    }),

  listAdminClientApiKeys: (clientId: string) =>
    browserRequest<ApiKeyListItem[]>(`/api/admin/clients/${clientId}/api-keys`),

  createAdminClientApiKey: (clientId: string) =>
    browserRequest<ApiKeyCreateResponse>(
      `/api/admin/clients/${clientId}/api-keys`,
      {
        method: "POST",
      },
    ),

  getAdminCreditLedger: (filters: { organizationId?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.organizationId)
      params.set("organization_id", filters.organizationId);
    const qs = params.toString();
    return browserRequest<CreditLedgerResponse>(
      qs ? `/api/admin/ledger?${qs}` : "/api/admin/ledger",
    );
  },

  clientLogin: (payload: { email: string; password: string }) =>
    browserRequest<{ ok: true }>("/api/client/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  clientLogout: () =>
    browserRequest<{ ok: true }>("/api/client/login", { method: "DELETE" }),

  getClientSession: () => browserRequest<ClientSession>("/api/client/session"),
  listWorkspaces: () => browserRequest<Workspace[]>("/api/client/workspaces"),
  createWorkspace: (payload: WorkspaceCreate) =>
    browserRequest<Workspace>("/api/client/workspaces", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getWorkspace: (workspaceId: string) =>
    browserRequest<Workspace>(`/api/client/workspaces/${workspaceId}`),
  updateWorkspace: (workspaceId: string, payload: WorkspaceUpdate) =>
    browserRequest<Workspace>(`/api/client/workspaces/${workspaceId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  getOrganization: (organizationId: string) =>
    browserRequest<Organization>(`/api/client/organizations/${organizationId}`),
  listOrganizationMembers: (organizationId: string) =>
    browserRequest<OrganizationMember[]>(
      `/api/client/organizations/${organizationId}/members`,
    ),
  inviteOrganizationMember: (
    organizationId: string,
    payload: OrganizationMemberInviteRequest,
  ) =>
    browserRequest<OrganizationMember>(
      `/api/client/organizations/${organizationId}/members`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),
  updateOrganizationMember: (
    organizationId: string,
    memberId: string,
    payload: OrganizationMemberUpdateRequest,
  ) =>
    browserRequest<OrganizationMember>(
      `/api/client/organizations/${organizationId}/members/${memberId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),
  listWorkspaceWebhooks: (workspaceId: string) =>
    browserRequest<WebhookEndpoint[]>(
      `/api/client/workspaces/${workspaceId}/webhooks`,
    ),
  createWorkspaceWebhook: (
    workspaceId: string,
    payload: WebhookEndpointCreate,
  ) =>
    browserRequest<WebhookEndpoint>(
      `/api/client/workspaces/${workspaceId}/webhooks`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),
  listWorkspaceAuditLogs: (
    workspaceId: string,
    filters: { limit?: number; offset?: number } = {},
  ) => {
    const params = new URLSearchParams();
    if (typeof filters.limit === "number") {
      params.set("limit", String(filters.limit));
    }
    if (typeof filters.offset === "number") {
      params.set("offset", String(filters.offset));
    }
    const qs = params.toString();
    return browserRequest<WorkspaceAuditLogItem[]>(
      qs
        ? `/api/client/workspaces/${workspaceId}/audit-logs?${qs}`
        : `/api/client/workspaces/${workspaceId}/audit-logs`,
    );
  },
  getWorkspaceAnalytics: (workspaceId: string) =>
    browserRequest<WorkspaceAnalytics>(
      `/api/client/workspaces/${workspaceId}/analytics`,
    ),
  getClientProfile: () =>
    browserRequest<ClientProfileResponse>("/api/client/me"),
  updateClientProfile: (payload: {
    name?: string;
    contact_person_name?: string | null;
    contact_phone?: string | null;
  }) =>
    browserRequest<ClientProfileResponse>("/api/client/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  clientSignup: (payload: {
    email: string;
    password: string;
    company_name: string;
  }) =>
    browserRequest<{ ok: true }>("/api/client/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listMyApiKeys: (filters: { includeRevoked?: boolean } = {}) => {
    const params = new URLSearchParams();
    if (filters.includeRevoked) params.set("include_revoked", "true");
    const qs = params.toString();
    return browserRequest<ApiKeyListItem[]>(
      qs ? `/api/client/me/api-keys?${qs}` : "/api/client/me/api-keys",
    );
  },

  listWorkspaceApiKeys: (
    workspaceId: string,
    filters: { includeRevoked?: boolean } = {},
  ) => {
    const params = new URLSearchParams();
    if (filters.includeRevoked) params.set("include_revoked", "true");
    const qs = params.toString();
    return browserRequest<ApiKeyListItem[]>(
      qs
        ? `/api/client/workspaces/${workspaceId}/api-keys?${qs}`
        : `/api/client/workspaces/${workspaceId}/api-keys`,
    );
  },

  createWorkspaceApiKey: (workspaceId: string, payload: ApiKeyCreate) =>
    browserRequest<ApiKeyCreateResponse>(
      `/api/client/workspaces/${workspaceId}/api-keys`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  revokeWorkspaceApiKey: (workspaceId: string, apiKeyId: string) =>
    browserRequest<undefined>(
      `/api/client/workspaces/${workspaceId}/api-keys/${apiKeyId}/revoke`,
      { method: "POST" },
    ),

  createMyApiKey: (payload: ApiKeyCreate) =>
    browserRequest<ApiKeyCreateResponse>("/api/client/me/api-keys", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  revokeMyApiKey: (apiKeyId: string) =>
    browserRequest<undefined>(`/api/client/me/api-keys/${apiKeyId}/revoke`, {
      method: "POST",
    }),

  listMyWorkflows: () => browserRequest<Workflow[]>("/api/client/me/workflows"),

  listWorkspaceWorkflows: (workspaceId: string) =>
    browserRequest<Workflow[]>(
      `/api/client/workspaces/${workspaceId}/workflows`,
    ),

  createWorkspaceWorkflow: (workspaceId: string, payload: WorkflowCreate) =>
    browserRequest<Workflow>(
      `/api/client/workspaces/${workspaceId}/workflows`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  patchWorkspaceWorkflow: (
    workspaceId: string,
    workflowId: string,
    payload: WorkflowUpdate,
  ) =>
    browserRequest<Workflow>(
      `/api/client/workspaces/${workspaceId}/workflows/${workflowId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),

  deleteWorkspaceWorkflow: (workspaceId: string, workflowId: string) =>
    browserRequest<undefined>(
      `/api/client/workspaces/${workspaceId}/workflows/${workflowId}`,
      { method: "DELETE" },
    ),

  createMyWorkflow: (payload: WorkflowCreate) =>
    browserRequest<Workflow>("/api/client/me/workflows", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  patchMyWorkflow: (workflowId: string, payload: WorkflowUpdate) =>
    browserRequest<Workflow>(`/api/client/me/workflows/${workflowId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteMyWorkflow: (workflowId: string) =>
    browserRequest<undefined>(`/api/client/me/workflows/${workflowId}`, {
      method: "DELETE",
    }),

  listMyReviews: () =>
    browserRequest<AdminReviewItem[]>("/api/client/me/reviews"),

  listWorkspaceReviews: (workspaceId: string) =>
    browserRequest<AdminReviewItem[]>(
      `/api/client/workspaces/${workspaceId}/reviews`,
    ),

  getWorkspaceReview: (workspaceId: string, verificationId: string) =>
    browserRequest<AdminReviewDetail>(
      `/api/client/workspaces/${workspaceId}/reviews/${verificationId}`,
    ),

  getMyReview: (verificationId: string) =>
    browserRequest<AdminReviewDetail>(
      `/api/client/me/reviews/${verificationId}`,
    ),

  approveMyReview: (verificationId: string) =>
    browserRequest<AdminDecisionResponse>(
      `/api/client/me/reviews/${verificationId}/approve`,
      { method: "POST" },
    ),

  submitWorkspaceReviewDecision: (
    workspaceId: string,
    verificationId: string,
    decision: {
      decision: "approve" | "reject";
      reason?: string;
      notes?: string;
    },
  ) =>
    browserRequest<AdminDecisionResponse>(
      `/api/client/workspaces/${workspaceId}/reviews/${verificationId}/decision`,
      { method: "POST", body: JSON.stringify(decision) },
    ),

  submitAgenticReviewFeedback: (
    workspaceId: string,
    verificationId: string,
    feedback: { agreed_with_agent: boolean; notes?: string },
  ) =>
    browserRequest<AdminDecisionResponse>(
      `/api/client/workspaces/${workspaceId}/reviews/${verificationId}/agentic-feedback`,
      { method: "POST", body: JSON.stringify(feedback) },
    ),

  rejectMyReview: (verificationId: string, reason: string) =>
    browserRequest<AdminDecisionResponse>(
      `/api/client/me/reviews/${verificationId}/reject`,
      { method: "POST", body: JSON.stringify({ reason }) },
    ),

  listMyVerifications: (
    filters: {
      status?: VerificationStatus;
      external_user_id?: string;
      since?: string;
      until?: string;
      agentic_mode?: AgenticMode;
      agentic_recommendation?: AgenticRecommendationFilter;
      limit?: number;
      offset?: number;
    } = {},
  ) => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.external_user_id) {
      params.set("external_user_id", filters.external_user_id);
    }
    if (filters.since) params.set("since", filters.since);
    if (filters.until) params.set("until", filters.until);
    if (filters.agentic_mode) params.set("agentic_mode", filters.agentic_mode);
    if (filters.agentic_recommendation) {
      params.set("agentic_recommendation", filters.agentic_recommendation);
    }
    if (typeof filters.limit === "number") {
      params.set("limit", String(filters.limit));
    }
    if (typeof filters.offset === "number") {
      params.set("offset", String(filters.offset));
    }
    const qs = params.toString();
    return browserRequest<VerificationListResponse>(
      qs
        ? `/api/client/me/verifications?${qs}`
        : "/api/client/me/verifications",
    );
  },

  listWorkspaceVerifications: (
    workspaceId: string,
    filters: {
      status?: VerificationStatus;
      external_user_id?: string;
      since?: string;
      until?: string;
      agentic_mode?: AgenticMode;
      agentic_recommendation?: AgenticRecommendationFilter;
      limit?: number;
      offset?: number;
    } = {},
  ) => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.external_user_id) {
      params.set("external_user_id", filters.external_user_id);
    }
    if (filters.since) params.set("since", filters.since);
    if (filters.until) params.set("until", filters.until);
    if (filters.agentic_mode) params.set("agentic_mode", filters.agentic_mode);
    if (filters.agentic_recommendation) {
      params.set("agentic_recommendation", filters.agentic_recommendation);
    }
    if (typeof filters.limit === "number") {
      params.set("limit", String(filters.limit));
    }
    if (typeof filters.offset === "number") {
      params.set("offset", String(filters.offset));
    }
    const qs = params.toString();
    return browserRequest<VerificationListResponse>(
      qs
        ? `/api/client/workspaces/${workspaceId}/verifications?${qs}`
        : `/api/client/workspaces/${workspaceId}/verifications`,
    );
  },

  getMyVerificationSummary: () =>
    browserRequest<VerificationSummaryResponse>(
      "/api/client/me/verifications/summary",
    ),

  getWorkspaceVerificationSummary: (workspaceId: string) =>
    browserRequest<VerificationSummaryResponse>(
      `/api/client/workspaces/${workspaceId}/verifications/summary`,
    ),

  getMyCreditLedger: (filters: {
    workspaceId?: string | null;
    limit?: number;
    offset?: number;
  } = {}) => {
    const params = new URLSearchParams();
    if (filters.workspaceId) {
      params.set("workspace_id", filters.workspaceId);
    }
    if (typeof filters.limit === "number") {
      params.set("limit", String(filters.limit));
    }
    if (typeof filters.offset === "number") {
      params.set("offset", String(filters.offset));
    }
    const qs = params.toString();
    return browserRequest<CreditLedgerResponse>(
      qs ? `/api/client/me/credits?${qs}` : "/api/client/me/credits",
    );
  },

  getBillingCatalog: () =>
    browserRequest<BillingCatalogResponse>("/api/client/billing/catalog"),

  getBillingSubscription: () =>
    browserRequest<BillingSubscriptionRead | null>(
      "/api/client/billing/subscription",
    ),

  createSubscriptionCheckout: (catalogKey: string) =>
    browserRequest<BillingCheckoutResponse>(
      "/api/client/billing/checkout/subscription",
      {
        method: "POST",
        body: JSON.stringify({ catalog_key: catalogKey }),
      },
    ),

  createCreditPackCheckout: (catalogKey: string) =>
    browserRequest<BillingCheckoutResponse>(
      "/api/client/billing/checkout/credits",
      {
        method: "POST",
        body: JSON.stringify({ catalog_key: catalogKey }),
      },
    ),

  getMyVerification: (verificationId: string) =>
    browserRequest<VerificationSessionDetail>(
      `/api/client/me/verifications/${verificationId}`,
    ),

  getWorkspaceVerification: (workspaceId: string, verificationId: string) =>
    browserRequest<VerificationSessionDetail>(
      `/api/client/workspaces/${workspaceId}/verifications/${verificationId}`,
    ),

  getMyVerificationFileUrl: (verificationId: string, fileId: string) =>
    `/api/client/me/verifications/${verificationId}/files/${fileId}`,

  resetWorkspaceSubjectVerification: (
    workspaceId: string,
    externalUserId: string,
    payload: SubjectDeleteRequest,
  ) =>
    browserRequest<SubjectLifecycleResponse>(
      `/api/client/workspaces/${workspaceId}/subjects/${encodeURIComponent(externalUserId)}/reset-verification`,
      { method: "POST", body: JSON.stringify(payload) },
    ),

  deleteWorkspaceSubject: (
    workspaceId: string,
    externalUserId: string,
    payload: SubjectDeleteRequest,
  ) =>
    browserRequest<SubjectLifecycleResponse>(
      `/api/client/workspaces/${workspaceId}/subjects/${encodeURIComponent(externalUserId)}`,
      { method: "DELETE", body: JSON.stringify(payload) },
    ),

  getWorkspaceSubjectBan: (workspaceId: string, externalUserId: string) =>
    browserRequest<SubjectBanStatus | null>(
      `/api/client/workspaces/${workspaceId}/subjects/${encodeURIComponent(externalUserId)}/ban`,
    ),

  upsertWorkspaceSubjectBan: (
    workspaceId: string,
    externalUserId: string,
    payload: SubjectBanRequest,
  ) =>
    browserRequest<SubjectLifecycleResponse>(
      `/api/client/workspaces/${workspaceId}/subjects/${encodeURIComponent(externalUserId)}/ban`,
      { method: "PUT", body: JSON.stringify(payload) },
    ),

  updateWorkspaceSubjectBan: (
    workspaceId: string,
    externalUserId: string,
    payload: SubjectBanUpdateRequest,
  ) =>
    browserRequest<SubjectLifecycleResponse>(
      `/api/client/workspaces/${workspaceId}/subjects/${encodeURIComponent(externalUserId)}/ban`,
      { method: "PATCH", body: JSON.stringify(payload) },
    ),

// --- AI providers (platform admin surface) -------------------------------
listAdminAiProviders: () =>
  browserRequest<AiModelProvider[]>("/api/admin/ai-providers"),
createAdminAiProvider: (payload: AiModelProviderCreate) =>
  browserRequest<AiModelProvider>("/api/admin/ai-providers", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
updateAdminAiProvider: (
  providerId: string,
  payload: AiModelProviderUpdate,
) =>
  browserRequest<AiModelProvider>(
    `/api/admin/ai-providers/${providerId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  ),
deleteAdminAiProvider: (providerId: string) =>
  browserRequest<void>(`/api/admin/ai-providers/${providerId}`, {
    method: "DELETE",
  }),
createAdminAiProviderKey: (
  providerId: string,
  payload: AiModelProviderKeyCreate,
) =>
  browserRequest<AiModelProviderKey>(
    `/api/admin/ai-providers/${providerId}/keys`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  ),
updateAdminAiProviderKey: (
  providerId: string,
  keyId: string,
  payload: AiModelProviderKeyUpdate,
) =>
  browserRequest<AiModelProviderKey>(
    `/api/admin/ai-providers/${providerId}/keys/${keyId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  ),
deleteAdminAiProviderKey: (providerId: string, keyId: string) =>
  browserRequest<void>(
    `/api/admin/ai-providers/${providerId}/keys/${keyId}`,
    {
      method: "DELETE",
    },
  ),
testAdminAiProviderKey: (providerId: string, keyId: string) =>
  browserRequest<AiModelProviderKeyTestResult>(
    `/api/admin/ai-providers/${providerId}/keys/${keyId}`,
    {
      method: "POST",
    },
  ),

// --- Platform admin surface --------------------------------------------
listAdminOrganizations: () =>
    browserRequest<AdminOrganizationRead[]>("/api/admin/organizations"),
  getAdminOrganization: (organizationId: string) =>
    browserRequest<AdminOrganizationRead>(
      `/api/admin/organizations/${organizationId}`,
    ),
  updateAdminOrganization: (
    organizationId: string,
    payload: AdminOrganizationUpdateRequest,
  ) =>
    browserRequest<AdminOrganizationRead>(
      `/api/admin/organizations/${organizationId}`,
      { method: "PATCH", body: JSON.stringify(payload) },
    ),
  listAdminWorkspaces: () =>
    browserRequest<Workspace[]>("/api/admin/workspaces"),
  getAdminWorkspace: (workspaceId: string) =>
    browserRequest<Workspace>(`/api/admin/workspaces/${workspaceId}`),
  listAdminVerifications: (filters: {
    organizationId?: string | null;
    workspaceId?: string | null;
    agenticMode?: AgenticMode | null;
    agenticRecommendation?: AgenticRecommendationFilter | null;
    limit?: number;
    offset?: number;
  } = {}) => {
    const params = new URLSearchParams();
    if (filters.organizationId) {
      params.set("organization_id", filters.organizationId);
    }
    if (filters.workspaceId) {
      params.set("workspace_id", filters.workspaceId);
    }
    if (filters.agenticMode) {
      params.set("agentic_mode", filters.agenticMode);
    }
    if (filters.agenticRecommendation) {
      params.set("agentic_recommendation", filters.agenticRecommendation);
    }
    if (typeof filters.limit === "number") {
      params.set("limit", String(filters.limit));
    }
    if (typeof filters.offset === "number") {
      params.set("offset", String(filters.offset));
    }
    const qs = params.toString();
    return browserRequest<VerificationListResponse>(
      qs ? `/api/admin/verifications?${qs}` : "/api/admin/verifications",
    );
  },
  getAdminAgenticMonitoring: (filters: AgenticMonitoringFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.organizationId) {
      params.set("organization_id", filters.organizationId);
    }
    if (filters.workspaceId) {
      params.set("workspace_id", filters.workspaceId);
    }
    if (filters.since) {
      params.set("since", filters.since);
    }
    if (filters.agenticMode) {
      params.set("agentic_mode", filters.agenticMode);
    }
    if (filters.agenticRecommendation) {
      params.set("agentic_recommendation", filters.agenticRecommendation);
    }
    const qs = params.toString();
    return browserRequest<AgenticMonitoringMetrics>(
      qs
        ? `/api/admin/metrics/agentic?${qs}`
        : "/api/admin/metrics/agentic",
    );
  },
  getAdminAutomationMetrics: (filters: AutomationMetricsFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.organizationId) {
      params.set("organization_id", filters.organizationId);
    }
    if (filters.workspaceId) {
      params.set("workspace_id", filters.workspaceId);
    }
    if (filters.workflowId) {
      params.set("workflow_id", filters.workflowId);
    }
    if (filters.since) {
      params.set("since", filters.since);
    }
    if (filters.until) {
      params.set("until", filters.until);
    }
    const qs = params.toString();
    return browserRequest<AutomationMetrics>(
      qs
        ? `/api/admin/metrics/automation?${qs}`
        : "/api/admin/metrics/automation",
    );
  },
  getAdminVerification: (verificationId: string) =>
    browserRequest<VerificationSessionDetail>(
      `/api/admin/verifications/${verificationId}`,
    ),
  getAdminBillingCredits: (filters: {
    organizationId?: string | null;
    workspaceId?: string | null;
    limit?: number;
    offset?: number;
  } = {}) => {
    const params = new URLSearchParams();
    if (filters.organizationId) {
      params.set("organization_id", filters.organizationId);
    }
    if (filters.workspaceId) {
      params.set("workspace_id", filters.workspaceId);
    }
    if (typeof filters.limit === "number") {
      params.set("limit", String(filters.limit));
    }
    if (typeof filters.offset === "number") {
      params.set("offset", String(filters.offset));
    }
    const qs = params.toString();
    return browserRequest<CreditLedgerResponse>(
      qs
        ? `/api/admin/billing/credits?${qs}`
        : "/api/admin/billing/credits",
    );
  },
  adjustAdminBillingCredits: (payload: AdminCreditAdjustmentRequest) =>
    browserRequest<CreditLedgerEntry>("/api/admin/billing/credits/adjust", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listAdminBillingCatalog: () =>
    browserRequest<AdminBillingCatalogItem[]>("/api/admin/billing/catalog"),

  updateAdminBillingCatalogItem: (
    catalogItemId: string,
    payload: AdminBillingCatalogItemUpdate,
  ) =>
    browserRequest<AdminBillingCatalogItem>(
      `/api/admin/billing/catalog/${catalogItemId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),
  listAdminSupportWebhookLogs: (filters: {
    limit?: number;
    offset?: number;
  } = {}) => {
    const params = new URLSearchParams();
    if (typeof filters.limit === "number") {
      params.set("limit", String(filters.limit));
    }
    if (typeof filters.offset === "number") {
      params.set("offset", String(filters.offset));
    }
    const qs = params.toString();
    return browserRequest<AdminWebhookDelivery[]>(
      qs
        ? `/api/admin/support/webhook-logs?${qs}`
        : "/api/admin/support/webhook-logs",
    );
  },
  listAdminSupportErrorLogs: () =>
    browserRequest<AdminErrorLog[]>("/api/admin/support/error-logs"),
  listAdminSalesCustomers: () =>
    browserRequest<AdminSalesCustomer[]>("/api/admin/sales/customers"),
  createAdminSalesNote: (payload: AdminSalesNoteRequest) =>
    browserRequest<AdminSalesNoteResponse>("/api/admin/sales/notes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listAdminSupportNotes: (filters: {
    verificationId?: string | null;
    limit?: number;
  } = {}) => {
    const params = new URLSearchParams();
    if (filters.verificationId) {
      params.set("verification_id", filters.verificationId);
    }
    if (typeof filters.limit === "number") {
      params.set("limit", String(filters.limit));
    }
    const qs = params.toString();
    return browserRequest<AdminSupportNote[]>(
      qs ? `/api/admin/support/notes?${qs}` : "/api/admin/support/notes",
    );
  },
  createAdminSupportNote: (payload: AdminSupportNoteRequest) =>
    browserRequest<AdminSupportNote>("/api/admin/support/notes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listAdminPlatformAdmins: () =>
    browserRequest<PlatformAdminUser[]>("/api/admin/platform-admins"),
  inviteAdminPlatformAdmin: (payload: PlatformAdminInviteRequest) =>
    browserRequest<PlatformAdminUser>(
      "/api/admin/platform-admins/invite",
      { method: "POST", body: JSON.stringify(payload) },
    ),
  updateAdminPlatformAdmin: (
    platformAdminId: string,
    payload: PlatformAdminUpdateRequest,
  ) =>
    browserRequest<PlatformAdminUser>(
      `/api/admin/platform-admins/${platformAdminId}`,
      { method: "PATCH", body: JSON.stringify(payload) },
    ),
  listAdminAuditLogs: (filters: { limit?: number; offset?: number } = {}) => {
    const params = new URLSearchParams();
    if (typeof filters.limit === "number") {
      params.set("limit", String(filters.limit));
    }
    if (typeof filters.offset === "number") {
      params.set("offset", String(filters.offset));
    }
    const qs = params.toString();
    return browserRequest<AdminAuditLogItem[]>(
      qs
        ? `/api/admin/audit-logs?${qs}`
        : "/api/admin/audit-logs",
    );
  },
  getAdminSystemSettings: () =>
    browserRequest<AdminSystemSettings>("/api/admin/system-settings"),
  updateAdminSystemSettings: (payload: AdminSystemSettings) =>
    browserRequest<AdminSystemSettings>("/api/admin/system-settings", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
