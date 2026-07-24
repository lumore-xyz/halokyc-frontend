"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  ClockIcon,
  GitCompareArrowsIcon,
  HelpCircleIcon,
  ScanSearchIcon,
  TimerIcon,
  XCircleIcon,
} from "lucide-react";

import { Metric } from "@/components/dashboard/metric";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  apiClient,
  type DuplicateCheckResult,
  type VerificationSessionDetail,
  type VerificationStatus,
} from "@/lib/api-client";
import { useClientSession } from "@/lib/hooks/use-client-session";

const STATUS_LABEL: Record<VerificationStatus, string> = {
  pending_upload: "Awaiting upload",
  awaiting_credits: "Awaiting credits",
  processing: "Processing",
  approved: "Approved",
  rejected: "Rejected",
  manual_review: "Needs review",
};

const STATUS_ICON: Record<VerificationStatus, typeof ActivityIcon> = {
  pending_upload: ClockIcon,
  awaiting_credits: TimerIcon,
  processing: ActivityIcon,
  approved: CheckCircle2Icon,
  rejected: XCircleIcon,
  manual_review: ScanSearchIcon,
};

const ANALYTICS_WINDOWS = [
  { label: "Last 30 days", value: "30" },
  { label: "Last 7 days", value: "7" },
  { label: "Last 90 days", value: "90" },
  { label: "All time", value: "all" },
] as const;

export function AnalyticsPanel({ workspaceId }: { workspaceId: string }) {
  const [windowDays, setWindowDays] = useState("30");
  const [workflowId, setWorkflowId] = useState("all");
  const [windowReferenceTime, setWindowReferenceTime] = useState(() =>
    Date.now(),
  );
  const session = useClientSession();

  const since = useMemo(() => {
    if (windowDays === "all") return undefined;
    const days = Number(windowDays);
    if (!Number.isFinite(days)) return undefined;
    return new Date(
      windowReferenceTime - days * 24 * 60 * 60 * 1000,
    ).toISOString();
  }, [windowDays, windowReferenceTime]);

  const query = useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: () => apiClient.getWorkspaceAnalytics(workspaceId),
    enabled: Boolean(session.data?.authenticated && workspaceId),
  });

  const workflowsQuery = useQuery({
    queryKey: ["workspace-workflows", workspaceId],
    queryFn: () => apiClient.listWorkspaceWorkflows(workspaceId),
    enabled: Boolean(session.data?.authenticated && workspaceId),
  });

  const automationQuery = useQuery({
    queryKey: [
      "workspace-automation-analytics",
      workspaceId,
      since ?? "all",
      workflowId,
    ],
    enabled: Boolean(session.data?.authenticated && workspaceId),
    queryFn: async () => {
      const list = await apiClient.listWorkspaceVerifications(workspaceId, {
        since,
        limit: 100,
      });
      const items =
        workflowId === "all"
          ? list.items
          : list.items.filter((item) => item.workflow_id === workflowId);
      const details = await Promise.all(
        items.map((item) =>
          apiClient.getWorkspaceVerification(workspaceId, item.verification_id),
        ),
      );
      return {
        automation: summarizeAutomation(details),
      };
    },
  });

  const counts = (query.data?.by_status ?? {}) as Partial<
    Record<VerificationStatus, number>
  >;
  const total = query.data?.total ?? 0;

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground max-w-2xl">
          Workspace-scoped counts of verification outcomes. Updated whenever a
          session reaches a terminal state.
        </p>
      </header>

      {query.isLoading ? (
        <Card>
          <CardContent className="flex justify-center py-12">
            <Spinner />
          </CardContent>
        </Card>
      ) : query.error ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-sm text-muted-foreground">
              Analytics could not be loaded. Refresh the page or return to the
              workspace overview.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric
              label="Total sessions"
              value={total}
              icon={HelpCircleIcon}
              description="All sessions started by this workspace"
            />
            {(Object.keys(STATUS_LABEL) as VerificationStatus[]).map((status) => {
              const Icon = STATUS_ICON[status];
              return (
                <Metric
                  key={status}
                  label={STATUS_LABEL[status]}
                  value={counts[status] ?? 0}
                  icon={Icon}
                  description={`Sessions in ${STATUS_LABEL[status].toLowerCase()}`}
                />
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Status breakdown</CardTitle>
              <CardDescription>
                Numerical share of each status. The terminal counts dominate the
                long-run distribution; manual review shrinks as your reviewers
                drain the queue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(STATUS_LABEL) as VerificationStatus[]).map(
                  (status) => {
                    const value = counts[status] ?? 0;
                    const percent =
                      total > 0 ? Math.round((value / total) * 100) : 0;
                    return (
                      <div
                        key={status}
                        className="flex items-center justify-between rounded-lg border border-[var(--dashboard-rule)] bg-[var(--dashboard-canvas)] px-4 py-3"
                      >
                        <dt className="text-sm">{STATUS_LABEL[status]}</dt>
                        <dd className="text-muted-foreground text-sm tabular-nums">
                          {value} / {percent}%
                        </dd>
                      </div>
                    );
                  },
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitCompareArrowsIcon className="size-4 text-muted-foreground" aria-hidden />
                Automation rollout
              </CardTitle>
              <CardDescription>
                Derived from recent verification details for the selected
                workspace window.
              </CardDescription>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
                Date range
                <select
                  className="h-9 rounded-md border border-[var(--dashboard-rule)] bg-[var(--dashboard-panel)] px-3 text-sm text-foreground"
                  value={windowDays}
                  onChange={(event) => {
                    setWindowDays(event.target.value);
                    setWindowReferenceTime(Date.now());
                  }}
                >
                  {ANALYTICS_WINDOWS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
                Workflow
                <select
                  className="h-9 rounded-md border border-[var(--dashboard-rule)] bg-[var(--dashboard-panel)] px-3 text-sm text-foreground"
                  value={workflowId}
                  onChange={(event) => setWorkflowId(event.target.value)}
                >
                  <option value="all">All workflows</option>
                  {(workflowsQuery.data ?? []).map((workflow) => (
                    <option
                      key={workflow.workflow_id}
                      value={workflow.workflow_id}
                    >
                      {workflow.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {automationQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : automationQuery.error ? (
            <p className="text-sm text-muted-foreground">
              Automation metrics could not be loaded. Verification status
              analytics are still available above.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Metric
                  label="Manual review rate"
                  value={`${automationQuery.data?.automation.manualReviewRate ?? 0}%`}
                  icon={ScanSearchIcon}
                  description={`${automationQuery.data?.automation.manualReviewTotal ?? 0} of ${automationQuery.data?.automation.sessionsTotal ?? 0} sampled sessions`}
                  variant={
                    (automationQuery.data?.automation.manualReviewRate ?? 0) > 25
                      ? "warning"
                      : "default"
                  }
                />
                <Metric
                  label="Timeout recovery"
                  value={`${automationQuery.data?.automation.timeoutRecoverySuccessRate ?? 0}%`}
                  icon={TimerIcon}
                  description={`${automationQuery.data?.automation.timeoutRecoverySuccess ?? 0} resolved without review`}
                  variant="info"
                />
                <Metric
                  label="Duplicate coverage"
                  value={`${automationQuery.data?.automation.duplicateCoverage ?? 0}%`}
                  icon={GitCompareArrowsIcon}
                  description={`${automationQuery.data?.automation.duplicateAutoDecisions ?? 0} duplicate decisions automated`}
                />
                <Metric
                  label="Top review factor"
                  value={automationQuery.data?.automation.topFactor ?? "-"}
                  icon={AlertTriangleIcon}
                  description="Most common reason in manual-review samples"
                  variant={
                    automationQuery.data?.automation.topFactor
                      ? "warning"
                      : "default"
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
          </Card>
        </>
      )}
    </>
  );
}

type AutomationSummary = {
  sessionsTotal: number;
  manualReviewTotal: number;
  manualReviewRate: number;
  timeoutRecoverySuccess: number;
  timeoutRecoverySuccessRate: number;
  duplicateAutoDecisions: number;
  duplicateCoverage: number;
  topFactor: string | null;
};

function summarizeAutomation(
  details: VerificationSessionDetail[],
): AutomationSummary {
  const sessionsTotal = details.length;
  const manualReviews = details.filter((detail) => detail.status === "manual_review");
  const timeoutRecoveries = details.filter((detail) => hasTimeoutRecovery(detail));
  const timeoutRecoverySuccess = timeoutRecoveries.filter(
    (detail) => detail.status !== "manual_review",
  ).length;
  const duplicatePolicySessions = details.filter((detail) =>
    hasDuplicatePolicySignal(detail),
  );
  const duplicateAutoDecisions = duplicatePolicySessions.filter(
    (detail) => detail.status !== "manual_review",
  ).length;
  const factorCounts = new Map<string, number>();

  for (const detail of manualReviews) {
    for (const factor of manualReviewFactors(detail)) {
      factorCounts.set(factor, (factorCounts.get(factor) ?? 0) + 1);
    }
  }

  const topFactor =
    [...factorCounts.entries()].sort(
      ([aName, aCount], [bName, bCount]) =>
        bCount - aCount || aName.localeCompare(bName),
    )[0]?.[0] ?? null;

  return {
    sessionsTotal,
    manualReviewTotal: manualReviews.length,
    manualReviewRate: percentage(manualReviews.length, sessionsTotal),
    timeoutRecoverySuccess,
    timeoutRecoverySuccessRate: percentage(
      timeoutRecoverySuccess,
      timeoutRecoveries.length,
    ),
    duplicateAutoDecisions,
    duplicateCoverage: percentage(
      duplicateAutoDecisions,
      duplicatePolicySessions.length,
    ),
    topFactor: topFactor ? formatFactor(topFactor) : null,
  };
}

function hasTimeoutRecovery(detail: VerificationSessionDetail): boolean {
  return (
    detail.timeout_recovery === true ||
    (Array.isArray(detail.timed_out_services) &&
      detail.timed_out_services.length > 0)
  );
}

function hasDuplicatePolicySignal(detail: VerificationSessionDetail): boolean {
  if (detail.duplicate_session_id || detail.duplicate_match_kind) return true;
  const duplicate = detail.checks.duplicate as DuplicateCheckResult | undefined;
  return duplicate?.result?.duplicate_found === true;
}

function manualReviewFactors(detail: VerificationSessionDetail): string[] {
  const factors: string[] = [];
  if (hasTimeoutRecovery(detail)) factors.push("timeout_recovery");
  if (hasDuplicatePolicySignal(detail)) factors.push("duplicate_policy");
  if (
    typeof detail.risk_score === "number" &&
    detail.risk_score >= 30 &&
    detail.risk_score <= 60
  ) {
    factors.push("risk_score_gray_band");
  }
  if (detail.requires_user_action) factors.push("user_action_required");
  if (factors.length === 0) factors.push("policy_manual_review");
  return factors;
}

function formatFactor(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function percentage(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}
