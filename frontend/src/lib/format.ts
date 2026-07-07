import type { VerificationStatus } from "@/lib/api-client";

const STATUS_LABEL: Record<VerificationStatus, string> = {
  pending_upload: "Pending upload",
  awaiting_credits: "Awaiting credits",
  processing: "Processing",
  approved: "Approved",
  rejected: "Rejected",
  manual_review: "Needs review",
};

export function statusLabel(status: VerificationStatus): string {
  return STATUS_LABEL[status];
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return DATE_FORMATTER.format(date);
}

export type ScoreBand = "low" | "medium" | "high" | "unknown";

export function scoreBand(score: number | null | undefined): ScoreBand {
  if (score == null) return "unknown";
  if (score < 30) return "low";
  if (score < 60) return "medium";
  return "high";
}

const SCORE_LABEL: Record<ScoreBand, string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
  unknown: "No score",
};

export function scoreLabel(score: number | null | undefined): string {
  return SCORE_LABEL[scoreBand(score)];
}

const AGENT_REASON_LABELS: Record<string, string> = {
  ambiguous_ocr: "Ambiguous OCR",
  low_ocr_confidence: "Low OCR confidence",
  face_liveness_conflict: "Face/liveness conflict",
  duplicate_uncertainty: "Duplicate uncertainty",
  borderline_risk_score: "Borderline risk score",
  invalid_model_output: "Invalid model output",
  provider_fallback: "Provider fallback",
  budget_fallback: "Budget fallback",
};

const AGENT_FALLBACK_LABELS: Record<string, string> = {
  clean_low_risk_approval: "Deterministic low-risk approval",
  terminal_deterministic_reject: "Terminal deterministic reject",
  workflow_disabled: "Workflow disabled",
  provider_disabled: "Provider disabled",
  provider_outage: "Provider unavailable",
  timeout: "Provider timeout",
  budget_cap: "Budget cap reached",
  invalid_model_output: "Invalid model output",
  provider_fallback: "Provider fallback",
  budget_fallback: "Budget fallback",
};

export function agentReasonLabel(code: string): string {
  return AGENT_REASON_LABELS[code] ?? humanizeToken(code);
}

export function agentFallbackLabel(reason: string | null | undefined): string {
  if (!reason) return "No fallback";
  return AGENT_FALLBACK_LABELS[reason] ?? humanizeToken(reason);
}

export function formatConfidence(value: number | null | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return `${Math.round(value * 100)}%`;
}

function humanizeToken(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
