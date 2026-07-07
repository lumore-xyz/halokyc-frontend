"use client";

import {
  AlertCircleIcon,
  BotIcon,
  CheckCircle2Icon,
  GitCompareArrowsIcon,
  ShieldAlertIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { StatusPill } from "@/components/status-pill";
import type {
  AgenticReviewCheckResult,
  AgenticReviewResult,
  CheckResult,
  VerificationStatus,
} from "@/lib/api-client";
import {
  agentFallbackLabel,
  agentReasonLabel,
  formatConfidence,
  statusLabel,
} from "@/lib/format";

type AgentRecommendationPanelProps = {
  check: CheckResult | undefined;
  deterministicStatus?: VerificationStatus;
  canViewProviderMetadata?: boolean;
  compact?: boolean;
  reviewerFeedback?: {
    agreed_with_agent: boolean;
    reviewer_user_id: string;
    recorded_at: string;
  } | null;
  onSubmitFeedback?: (agreed: boolean, notes?: string) => Promise<void>;
  isSubmittingFeedback?: boolean;
};

export function AgentRecommendationPanel({
  check,
  deterministicStatus,
  canViewProviderMetadata = false,
  compact = false,
  reviewerFeedback = null,
  onSubmitFeedback,
  isSubmittingFeedback = false,
}: AgentRecommendationPanelProps) {
  const result = getAgenticResult(check);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BotIcon className="size-4 text-muted-foreground" aria-hidden />
              Agent recommendation
            </CardTitle>
            <CardDescription>
              Advisory review of deterministic verification signals.
            </CardDescription>
          </div>
          {result ? (
            <StatusPill status={result.verdict.recommended_status} />
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {!result ? (
          <EmptyState
            icon={BotIcon}
            title="No agent recommendation"
            description="This session has deterministic check results only, or the agentic layer was disabled when it ran."
          />
        ) : (
          <div className="flex flex-col gap-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryCell
                label="Recommendation"
                value={statusLabel(result.verdict.recommended_status)}
              />
              <SummaryCell
                label="Confidence"
                value={formatConfidence(result.verdict.confidence)}
              />
              <SummaryCell
                label="Manual review"
                value={
                  result.verdict.requires_manual_review
                    ? "Required"
                    : "Not required"
                }
              />
            </div>

            <div className="rounded-lg border border-[var(--dashboard-rule)] bg-[var(--dashboard-canvas)] p-4">
              <p className="text-sm leading-6">{result.verdict.human_summary}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {result.verdict.reason_codes.length === 0 ? (
                <Badge variant="outline">No reason codes</Badge>
              ) : (
                result.verdict.reason_codes.map((code) => (
                  <Badge key={code} variant="secondary">
                    {agentReasonLabel(code)}
                  </Badge>
                ))
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ComparisonCell
                label="Deterministic decision"
                value={statusLabel(
                  result.evaluation?.deterministic_status ??
                    deterministicStatus ??
                    result.verdict.recommended_status,
                )}
                icon={GitCompareArrowsIcon}
              />
              <ComparisonCell
                label="Fallback state"
                value={agentFallbackLabel(
                  result.fallback_reason ?? result.policy_gate.skip_reason,
                )}
                icon={result.fallback_reason ? AlertCircleIcon : CheckCircle2Icon}
              />
            </div>

            {result.evaluation ? (
              <div className="grid gap-2 text-xs sm:grid-cols-3">
                <AuditFlag
                  active={result.evaluation.agreed_with_deterministic}
                  label="Agrees with deterministic decision"
                />
                <AuditFlag
                  active={result.evaluation.would_deflect_manual_review}
                  label="Would deflect manual review"
                />
                <AuditFlag
                  active={
                    result.evaluation.would_false_approve_against_deterministic ||
                    result.evaluation.would_false_reject_against_deterministic
                  }
                  label="Would conflict with terminal decision"
                  danger
                />
              </div>
            ) : null}

            {!compact && result.verdict.evidence_references.length > 0 ? (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Evidence references
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.verdict.evidence_references.map((reference) => (
                    <code
                      key={reference}
                      className="rounded-md border bg-muted/40 px-2 py-1 font-mono text-xs"
                    >
                      {reference}
                    </code>
                  ))}
                </div>
              </div>
            ) : null}

            {canViewProviderMetadata ? (
              <ProviderMetadata result={result} />
            ) : null}
            {onSubmitFeedback && !reviewerFeedback ? (
              <div className="flex flex-col gap-3 pt-2 border-t border-[var(--dashboard-rule)]">
                <p className="text-xs text-muted-foreground">
                  Was the agent recommendation helpful?
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => onSubmitFeedback(true)}
                    disabled={isSubmittingFeedback}
                  >
                    <ThumbsUpIcon className="size-3.5" aria-hidden />
                    Agree with recommendation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => onSubmitFeedback(false)}
                    disabled={isSubmittingFeedback}
                  >
                    <ThumbsDownIcon className="size-3.5" aria-hidden />
                    Override recommendation
                  </Button>
                </div>
              </div>
            ) : reviewerFeedback ? (
              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--dashboard-rule)]">
                <p className="text-xs text-muted-foreground">
                  Feedback recorded by {reviewerFeedback.reviewer_user_id} on{" "}
                  {new Date(reviewerFeedback.recorded_at).toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      reviewerFeedback.agreed_with_agent
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {reviewerFeedback.agreed_with_agent
                      ? "✓ Agreed with agent"
                      : "✗ Overrode agent"}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getAgenticResult(
  check: CheckResult | undefined,
): AgenticReviewResult | null {
  if (!check?.result || typeof check.result !== "object") return null;
  const maybe = check as AgenticReviewCheckResult;
  if (!maybe.result.verdict || !maybe.result.policy_gate) return null;
  return maybe.result;
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--dashboard-rule)] bg-background px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function ComparisonCell({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[var(--dashboard-rule)] bg-muted/30 p-3">
      <Icon className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function AuditFlag({
  active,
  label,
  danger = false,
}: {
  active: boolean;
  label: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
      <span
        className={
          active
            ? danger
              ? "size-2 rounded-full bg-destructive"
              : "size-2 rounded-full bg-emerald-600"
            : "size-2 rounded-full bg-muted-foreground/30"
        }
      />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function ProviderMetadata({ result }: { result: AgenticReviewResult }) {
  const provider = result.provider;
  return (
    <div className="rounded-lg border border-dashed p-4">
      <div className="mb-3 flex items-center gap-2">
        <ShieldAlertIcon className="size-4 text-muted-foreground" aria-hidden />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Provider metadata
        </span>
      </div>
      <dl className="grid gap-2 text-xs sm:grid-cols-2">
        <MetadataRow label="Provider" value={provider?.provider_name ?? "-"} />
        <MetadataRow label="Model" value={provider?.model_name ?? "-"} />
        <MetadataRow
          label="Latency"
          value={
            typeof provider?.latency_ms === "number"
              ? `${provider.latency_ms} ms`
              : "-"
          }
        />
        <MetadataRow
          label="Tokens"
          value={
            typeof provider?.total_tokens === "number"
              ? provider.total_tokens.toLocaleString()
              : "-"
          }
        />
        <MetadataRow
          label="Spend"
          value={
            typeof provider?.estimated_cost_usd === "number"
              ? `$${provider.estimated_cost_usd.toFixed(4)}`
              : "-"
          }
        />
        <MetadataRow
          label="Validation"
          value={
            result.output_validation_status ??
            provider?.output_validation_status ??
            "-"
          }
        />
      </dl>
    </div>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono text-foreground">{value}</dd>
    </div>
  );
}
