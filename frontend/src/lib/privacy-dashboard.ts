/**
 * Typed contract for the subject-facing privacy dashboard.
 *
 * COMPLIANCE.md §4.2 requires a `/privacy/dashboard` surface that
 * shows the user's data, lets them request erasure / export /
 * withdrawal, and visualises the status of in-flight DSRs.
 *
 * The backend endpoints behind this contract are proxied by
 * `src/app/api/privacy/*` BFF route handlers. The first subject-token
 * implementation accepts the signed URL token as `?token=...`.
 */

export type PrivacyDataField = {
  key: string;
  label: string;
  purpose: string;
  source: "verification" | "profile" | "device" | "auth";
  captured_at: string;
};

export type PrivacyDataSummary = {
  subject_id: string;
  fields: PrivacyDataField[];
  data_categories: ("identity_docs" | "biometrics" | "pii" | "device_meta")[];
  last_updated: string;
};

export type PrivacyRequestKind = "erasure" | "export" | "withdraw_consent";
export type PrivacyRequestStatus =
  | "pending"
  | "processing"
  | "completed"
  | "rejected";

export type PrivacyRequest = {
  id: string;
  kind: PrivacyRequestKind;
  status: PrivacyRequestStatus;
  created_at: string;
  updated_at: string;
  reason: string | null;
  resolution_notes: string | null;
};

export type PrivacyRequestTimelineStep = {
  status: PrivacyRequestStatus | "submitted";
  label: string;
  at: string | null;
};

export type PrivacyRequestTimeline = {
  request: PrivacyRequest;
  steps: PrivacyRequestTimelineStep[];
};

export type CreatePrivacyRequestInput = {
  kind: PrivacyRequestKind;
  reason?: string;
};

export type PrivacyDashboardError = { code: "REQUEST_FAILED"; message: string };

export const PRIVACY_BACKEND_STATUS: PrivacyDashboardError = {
  code: "REQUEST_FAILED",
  message:
    "Open this dashboard from your verification privacy link so HaloKYC can scope the data request to your session.",
};

export async function fetchPrivacySummary(): Promise<PrivacyDataSummary> {
  return privacyRequest<PrivacyDataSummary>("/api/privacy/summary");
}

export async function fetchPrivacyRequests(): Promise<PrivacyRequest[]> {
  return privacyRequest<PrivacyRequest[]>("/api/privacy/requests");
}

export async function createPrivacyRequest(
  input: CreatePrivacyRequestInput,
): Promise<PrivacyRequest> {
  return privacyRequest<PrivacyRequest>("/api/privacy/requests", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

async function privacyRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = currentSubjectToken();
  const url = new URL(path, window.location.origin);
  if (token) url.searchParams.set("token", token);
  const response = await fetch(url, {
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
      message: `Privacy request failed with ${response.status}`,
    } satisfies PrivacyDashboardError;
  }
  return (await response.json()) as T;
}

function currentSubjectToken(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("token");
}
