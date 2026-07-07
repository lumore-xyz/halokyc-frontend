/**
 * Typed contract for the platform-admin DSR + retention surfaces.
 *
 * COMPLIANCE.md §4.3 requires:
 *   - a DSR queue showing every erasure/export request
 *   - an export-approval workflow for sensitive exports
 *   - a retention-config panel for global or per-client evidence
 *     retention period (in days)
 *
 * The backend endpoints behind this contract are proxied through
 * `src/app/api/admin/*` route handlers and use the platform-admin
 * httpOnly cookie.
 */

export type DsrKind = "erasure" | "export" | "withdraw_consent";
export type DsrStatus = "pending" | "processing" | "completed" | "rejected";

export type DsrRequest = {
  id: string;
  subject_id: string;
  organization_id: string | null;
  workspace_id: string | null;
  kind: DsrKind;
  status: DsrStatus;
  reason: string | null;
  resolution_notes: string | null;
  approval_required: boolean;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
};

export type DsrDecision = "approve" | "reject";
export type DsrDecisionInput = {
  request_id: string;
  decision: DsrDecision;
  notes?: string;
};

export type RetentionScope = "global" | "organization" | "workspace";

export type RetentionPolicy = {
  id: string;
  scope: RetentionScope;
  scope_id: string | null;
  evidence_retention_days: number;
  embedding_retention_days: number | null;
  webhook_log_retention_days: number | null;
  audit_log_retention_days: number | null;
  updated_at: string;
  updated_by: string | null;
};

export type UpdateRetentionInput = {
  scope: RetentionScope;
  scope_id?: string | null;
  evidence_retention_days: number;
  embedding_retention_days?: number | null;
  webhook_log_retention_days?: number | null;
  audit_log_retention_days?: number | null;
};

export type ComplianceBackendError = {
  code: "REQUEST_FAILED";
  message: string;
};

export const COMPLIANCE_BACKEND_STATUS: ComplianceBackendError = {
  code: "REQUEST_FAILED",
  message:
    "Compliance backend request failed. Refresh the page or check platform-admin permissions.",
};

export async function listDsrRequests(_filter?: {
  status?: DsrStatus;
  kind?: DsrKind;
}): Promise<DsrRequest[]> {
  const params = new URLSearchParams();
  if (_filter?.status) params.set("status", _filter.status);
  if (_filter?.kind) params.set("kind", _filter.kind);
  const query = params.toString();
  return adminComplianceRequest<DsrRequest[]>(
    query ? `/api/admin/dsr?${query}` : "/api/admin/dsr",
  );
}

export async function decideDsrRequest(
  input: DsrDecisionInput,
): Promise<DsrRequest> {
  return adminComplianceRequest<DsrRequest>(
    `/api/admin/dsr/${input.request_id}/decision`,
    {
      method: "POST",
      body: JSON.stringify({ decision: input.decision, notes: input.notes }),
    },
  );
}

export async function listRetentionPolicies(): Promise<RetentionPolicy[]> {
  return adminComplianceRequest<RetentionPolicy[]>("/api/admin/retention");
}

export async function updateRetentionPolicy(
  input: UpdateRetentionInput,
): Promise<RetentionPolicy> {
  return adminComplianceRequest<RetentionPolicy>("/api/admin/retention", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

async function adminComplianceRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!response.ok) {
    throw {
      code: "REQUEST_FAILED",
      message: `Compliance request failed with ${response.status}`,
    } satisfies ComplianceBackendError;
  }
  return (await response.json()) as T;
}
