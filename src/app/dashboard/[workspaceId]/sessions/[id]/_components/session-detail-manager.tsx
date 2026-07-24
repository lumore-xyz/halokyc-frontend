"use client";

import { useQuery } from "@tanstack/react-query";
import { RefreshCwIcon, ShieldAlertIcon } from "lucide-react";
import Link from "next/link";
import {
  apiClient,
  type VerificationSessionDetail,
  type VerificationStatus,
  type VerificationUserAction,
} from "@/lib/api-client";
import { publicEnv } from "@/lib/env";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { ScoreMeter } from "@/components/score-meter";
import { StatusPill } from "@/components/status-pill";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { JsonViewer } from "@/components/json-viewer";
import { CheckCard, orderedCheckKeys } from "@/components/check-card";
import { useClientSession } from "@/lib/hooks/use-client-session";
import { TimeoutRecoveryBanner } from "@/components/timeout-recovery-banner";

import { EvidenceViewer } from "../../../_components/evidence-viewer";
import { SessionUploadCard } from "./session-upload-card";

const TERMINAL_STATUSES = new Set<VerificationStatus>([
  "approved",
  "rejected",
  "manual_review",
]);

function isTerminalStatus(status: VerificationStatus | undefined): boolean {
  return status !== undefined && TERMINAL_STATUSES.has(status);
}

export function SessionDetailManager({
  workspaceId,
  verificationId,
}: {
  workspaceId: string;
  verificationId: string;
}) {
  const session = useClientSession();
  const role = session.data?.organizationRole ?? null;
  const canViewEvidence =
    role === "client_owner" ||
    role === "client_admin" ||
    role === "client_reviewer";
  const canViewSubject =
    role === "client_owner" ||
    role === "client_admin" ||
    role === "client_reviewer";
  const canUpload =
    role === "client_owner" ||
    role === "client_admin" ||
    role === "client_developer";
  const canViewRawData = role === "client_owner" || role === "client_admin";

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ["workspace-verification", workspaceId, verificationId],
    queryFn: () => apiClient.getWorkspaceVerification(workspaceId, verificationId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (isTerminalStatus(status)) {
        return false;
      }
      if (typeof document !== "undefined" && document.hidden) {
        return false;
      }
      return publicEnv.verificationPollMs;
    },
    refetchIntervalInBackground: false,
  });

  const isPolling = isFetching && !isTerminalStatus(data?.status);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 rounded-2xl md:col-span-2" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load session details</AlertTitle>
        <AlertDescription>
          An error occurred while fetching the verification session. Please try
          again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  const timedOutServices = data.timed_out_services ?? [];
  const duplicateSessionHref = data.duplicate_session_id
    ? `/dashboard/${workspaceId}/sessions/${data.duplicate_session_id}`
    : undefined;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Verification Detail
        </span>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                {data.external_user_id}
              </h1>
              <StatusPill status={data.status} />
              {isPolling ? (
                <span
                  className="text-muted-foreground flex items-center gap-1.5 text-xs"
                  aria-live="polite"
                >
                  <Spinner className="size-3" aria-hidden />
                  Polling
                </span>
              ) : null}
            </div>
            <p className="text-muted-foreground font-mono text-xs">
              ID: {data.verification_id}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 sm:items-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                void refetch();
              }}
              aria-label="Refresh verification"
            >
              <RefreshCwIcon className="size-4" aria-hidden />
              Refresh
            </Button>
            {canViewSubject ? (
              <Button
                render={
                  <Link
                    href={`/dashboard/${workspaceId}/subjects/${encodeURIComponent(data.external_user_id)}`}
                  />
                }
                nativeButton={false}
                type="button"
                variant="outline"
                size="sm"
              >
                <ShieldAlertIcon className="size-4" aria-hidden />
                Subject lifecycle
              </Button>
            ) : null}
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-medium">
                {formatDate(data.created_at)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-6 md:col-span-2">
          <TimeoutRecoveryBanner
            timeoutRecovery={data.timeout_recovery}
            timedOutServices={timedOutServices}
          />

          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>
                The risk score is calculated based on the results of all
                performed checks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ScoreMeter score={data.risk_score} />
              {data.decision_reason && (
                <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm">
                  {data.decision_reason}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Check Results</CardTitle>
              <CardDescription>
                Detailed breakdown of each verification check performed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {orderedCheckKeys().map((key) => (
                  <CheckCard
                    key={key}
                    checkKey={key}
                    result={data.checks?.[key]}
                    verificationStatus={data.status}
                    timedOut={timedOutServices.includes(key)}
                    duplicateSessionHref={
                      key === "duplicate" ? duplicateSessionHref : undefined
                    }
                    duplicateMatchKind={
                      key === "duplicate" ? data.duplicate_match_kind : null
                    }
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {canUpload && data.status === "pending_upload" ? (
            <SessionUploadCard
              workspaceId={workspaceId}
              verificationId={verificationId}
            />
          ) : null}

          <EvidenceViewer
            workspaceId={workspaceId}
            session={data as VerificationSessionDetail}
            canViewEvidence={canViewEvidence}
          />
        </div>

        <div className="flex flex-col gap-6">
          <SessionCaseSummaryCard
            data={data}
            fileCount={(data as VerificationSessionDetail).files?.length ?? 0}
            duplicateSessionHref={duplicateSessionHref}
          />

          {canViewRawData ? (
            <Card>
              <CardHeader>
                <CardTitle>Technical payload</CardTitle>
                <CardDescription>
                  Full API response. Visible only to workspace owners and
                  admins.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JsonViewer
                  value={data}
                  initiallyCollapsed
                  title="Raw response"
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SessionCaseSummaryCard({
  data,
  fileCount,
  duplicateSessionHref,
}: {
  data: VerificationSessionDetail;
  fileCount: number;
  duplicateSessionHref?: string;
}) {
  const completedChecks = Object.values(data.checks ?? {}).filter(
    (check) => check && check.status !== "pending" && check.status !== "skipped",
  ).length;
  const needsAction = data.requires_user_action
    ? formatUserAction(data.requires_user_action)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Case summary</CardTitle>
        <CardDescription>
          Reviewer-safe session context without raw API payloads.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{completedChecks} checks complete</Badge>
          <Badge variant="outline">{fileCount} files uploaded</Badge>
          {data.timeout_recovery ? (
            <Badge variant="outline">Recovered from timeout</Badge>
          ) : null}
        </div>

        <dl className="grid gap-3 text-sm">
          <SummaryRow label="Subject" value={data.external_user_id} />
          <SummaryRow
            label="Risk score"
            value={
              typeof data.risk_score === "number"
                ? `${Math.round(data.risk_score)} / 100`
                : "Not scored yet"
            }
          />
          <SummaryRow label="Updated" value={formatDate(data.updated_at)} />
          {needsAction ? (
            <SummaryRow label="User action" value={needsAction} />
          ) : null}
          {duplicateSessionHref ? (
            <div className="grid gap-1">
              <dt className="text-muted-foreground">Duplicate match</dt>
              <dd>
                <Link
                  href={duplicateSessionHref}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Open matched session
                </Link>
              </dd>
            </div>
          ) : null}
        </dl>

        {data.decision_reason ? (
          <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
            <p className="font-medium">Decision note</p>
            <p className="mt-1 text-muted-foreground">{data.decision_reason}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words font-medium">{value}</dd>
    </div>
  );
}

function formatMachineLabel(value: string): string {
  return value.replaceAll("_", " ");
}

function formatUserAction(action: VerificationUserAction): string {
  if (action.action === "retake_document") {
    const fields = action.fields.map(formatMachineLabel).join(", ");
    return `Retake document${fields ? ` (${fields})` : ""}`;
  }
  return formatMachineLabel(action.action);
}
