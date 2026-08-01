"use client";

import { CheckCard, orderedCheckKeys } from "@/components/check-card";
import { EmptyState } from "@/components/empty-state";
import { JsonViewer } from "@/components/json-viewer";
import { ScoreMeter } from "@/components/score-meter";
import { StatusPill } from "@/components/status-pill";
import { TimeoutRecoveryBanner } from "@/components/timeout-recovery-banner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  apiClient,
  type AdminAuditLogItem,
  type DuplicateCheckResult,
  type DuplicateSessionReference,
  type VerificationSessionDetail,
  type VerificationStatus,
  type VerificationUserAction,
} from "@/lib/api-client";
import { publicEnv } from "@/lib/env";
import { formatDate } from "@/lib/format";
import { useClientSession } from "@/lib/hooks/use-client-session";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRightIcon,
  FingerprintIcon,
  RefreshCwIcon,
  ScrollTextIcon,
  ShieldAlertIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { EvidenceViewer } from "../../../_components/evidence-viewer";
import { DeviceNetworkCard } from "./device-network-card";
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
    queryFn: () =>
      apiClient.getWorkspaceVerification(workspaceId, verificationId),
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

  return (
    <SessionDetailContent
      workspaceId={workspaceId}
      verificationId={verificationId}
      data={data}
      canViewEvidence={canViewEvidence}
      canViewSubject={canViewSubject}
      canUpload={canUpload}
      canViewRawData={canViewRawData}
      isPolling={isPolling}
      onRefresh={() => {
        void refetch();
      }}
    />
  );
}

export function SessionDetailContent({
  workspaceId,
  verificationId,
  data,
  canViewEvidence,
  canViewSubject,
  canUpload,
  canViewRawData,
  isPolling = false,
  onRefresh,
  sidebarExtra,
}: {
  workspaceId: string;
  verificationId: string;
  data: VerificationSessionDetail;
  canViewEvidence: boolean;
  canViewSubject: boolean;
  canUpload: boolean;
  canViewRawData: boolean;
  isPolling?: boolean;
  onRefresh: () => void;
  sidebarExtra?: ReactNode;
}) {
  const timedOutServices = data.timed_out_services ?? [];
  const duplicateSessionHref = data.duplicate_session_id
    ? `/dashboard/${workspaceId}/sessions/${data.duplicate_session_id}`
    : undefined;
  const duplicateResult = data.checks.duplicate?.result;
  const duplicateFound = duplicateResult?.duplicate_found === true;
  const duplicateSessions = data.duplicate_sessions ?? [];
  const displayStatus =
    duplicateFound && data.status !== "rejected"
      ? "manual_review"
      : data.status;
  const displayDecisionReason = duplicateFound
    ? "Duplicate face match detected. Manual review takes priority over the automated risk score."
    : data.decision_reason;
  const visibleCheckKeys = orderedCheckKeys().filter(
    (key) => data.checks?.[key] !== undefined,
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Verification Detail
        </span>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                {data.external_user_id}
              </h1>
              <StatusPill status={displayStatus} />
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
              onClick={onRefresh}
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
              <p className="text-muted-foreground text-xs">Created</p>
              <p className="text-sm font-medium">
                {formatDate(data.created_at)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {duplicateFound || duplicateSessions.length > 0 ? (
        <DuplicateMatchesCard
          workspaceId={workspaceId}
          result={duplicateResult}
          sessions={duplicateSessions}
        />
      ) : null}

      <DeviceNetworkCard context={data.device_context} />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-6 md:col-span-2">
          <TimeoutRecoveryBanner
            timeoutRecovery={data.timeout_recovery}
            timedOutServices={timedOutServices}
          />

          <Card>
            <CardHeader>
              <CardTitle>Risk assessment</CardTitle>
              <CardDescription>
                Automated scoring context for the reviewer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {duplicateFound ? (
                <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-stretch">
                  <div className="border-border bg-muted/20 min-w-36 rounded-xl border p-4">
                    <p className="text-muted-foreground text-xs">
                      Automated risk score
                    </p>
                    <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">
                      {typeof data.risk_score === "number"
                        ? Math.round(data.risk_score)
                        : "-"}
                      <span className="text-muted-foreground text-sm font-normal">
                        /100
                      </span>
                    </p>
                  </div>
                  <div className="border-border rounded-xl border bg-[color:var(--status-review-bg)] p-4">
                    <p className="font-medium text-[color:var(--status-review-fg)]">
                      Manual review overrides this score
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      The score remains visible as context, but the duplicate
                      match must be resolved by a reviewer.
                    </p>
                  </div>
                </div>
              ) : (
                <ScoreMeter score={data.risk_score} />
              )}
              {!duplicateFound && displayDecisionReason ? (
                <div className="border-border bg-muted/40 rounded-md border px-4 py-3 text-sm">
                  {displayDecisionReason}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <section aria-labelledby="check-results-title" className="space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  id="check-results-title"
                  className="font-display text-xl font-semibold tracking-tight"
                >
                  Check results
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Evidence from the checks performed for this session.
                </p>
              </div>
              <Badge variant="outline">
                {visibleCheckKeys.length} result
                {visibleCheckKeys.length === 1 ? "" : "s"}
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {visibleCheckKeys.map((key) => (
                <CheckCard
                  key={key}
                  checkKey={key}
                  result={data.checks[key]}
                  verificationStatus={data.status}
                  timedOut={timedOutServices.includes(key)}
                  duplicateMatchKind={
                    key === "duplicate" ? data.duplicate_match_kind : null
                  }
                  className={
                    key === "duplicate" && duplicateFound
                      ? "border-[color:var(--status-review-fg)]/30 sm:col-span-2"
                      : undefined
                  }
                />
              ))}
            </div>
          </section>

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

          <AuditLogCard logs={data.audit_logs ?? []} />
        </div>

        <div className="flex flex-col gap-6">
          <SessionCaseSummaryCard
            data={data}
            fileCount={(data as VerificationSessionDetail).files?.length ?? 0}
            duplicateSessionHref={duplicateSessionHref}
            duplicateFound={duplicateFound}
          />

          {sidebarExtra}

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

function DuplicateMatchesCard({
  workspaceId,
  result,
  sessions,
}: {
  workspaceId: string;
  result: DuplicateCheckResult["result"];
  sessions: DuplicateSessionReference[];
}) {
  const matchedExternalUserId = result?.matched_external_user_id;
  const similarity = result?.similarity;
  const matchCount = sessions.length;

  return (
    <Card className="overflow-hidden border-t-2 border-[color:var(--status-review-fg)]/30">
      <CardHeader className="gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--status-review-bg)] text-[color:var(--status-review-fg)]">
              <FingerprintIcon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-[color:var(--status-review-fg)] uppercase">
                Duplicate investigation
              </p>
              <CardTitle className="mt-1">
                {matchCount === 0
                  ? "Face match needs review"
                  : `${matchCount} linked session${matchCount === 1 ? "" : "s"} found`}
              </CardTitle>
              <CardDescription className="mt-1">
                Compare the prior session history before deciding this case.
              </CardDescription>
            </div>
          </div>
          <StatusPill status="manual_review" />
        </div>
        <dl className="border-border bg-muted/20 sm:divide-border grid overflow-hidden rounded-xl border text-sm sm:grid-cols-3 sm:divide-x">
          <DuplicateMetric
            label="Matched subject"
            value={
              typeof matchedExternalUserId === "string"
                ? matchedExternalUserId
                : "Not reported"
            }
          />
          <DuplicateMetric
            label="Face similarity"
            value={
              typeof similarity === "number"
                ? `${Math.round(similarity * 100)}%`
                : "Not reported"
            }
          />
          <DuplicateMetric label="Required action" value="Review and decide" />
        </dl>
      </CardHeader>
      <CardContent className="border-border border-t p-0">
        {sessions.length === 0 ? (
          <EmptyState
            icon={FingerprintIcon}
            title="No linked session records"
            description="A face match was detected, but no retained session for the matched subject is available."
            className="bg-muted/30 m-4 border-0"
          />
        ) : (
          <ul
            aria-label="Duplicate sessions"
            className="divide-border divide-y"
          >
            {sessions.map((session) => (
              <li key={session.verification_id}>
                <Link
                  href={`/dashboard/${workspaceId}/sessions/${session.verification_id}`}
                  className="group hover:bg-muted/30 focus-visible:bg-muted/30 grid gap-3 px-6 py-4 transition-colors outline-none sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">
                        {session.external_user_id}
                      </span>
                      <ArrowUpRightIcon
                        className="text-muted-foreground size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                        aria-hidden
                      />
                    </div>
                    <p className="text-muted-foreground mt-1 truncate font-mono text-xs">
                      {session.verification_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <StatusPill status={session.status} />
                    {typeof session.risk_score === "number" ? (
                      <span className="text-muted-foreground font-mono text-xs tabular-nums">
                        Risk {Math.round(session.risk_score)}
                      </span>
                    ) : null}
                  </div>
                  <time
                    dateTime={session.created_at}
                    className="text-muted-foreground text-xs sm:text-right"
                  >
                    {formatDate(session.created_at)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function DuplicateMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1 font-medium break-words">{value}</dd>
    </div>
  );
}

function AuditLogCard({ logs }: { logs: AdminAuditLogItem[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Session audit log</CardTitle>
            <CardDescription className="mt-1">
              Immutable status changes and system actions for this session.
            </CardDescription>
          </div>
          <Badge variant="outline">
            {logs.length} event{logs.length === 1 ? "" : "s"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <EmptyState
            icon={ScrollTextIcon}
            title="No audit events"
            description="No audit-log entries are attached to this verification session yet."
            className="bg-muted/30 border-0"
          />
        ) : (
          <ol className="border-border relative ml-2 border-l">
            {logs.map((log, index) => (
              <li
                key={`${log.created_at}-${log.action}-${index}`}
                className="relative pb-6 pl-6 last:pb-0"
              >
                <span className="border-card absolute top-1.5 -left-1.5 size-3 rounded-full border-2 bg-[color:var(--status-review-fg)]" />
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <p className="font-medium">{formatAuditAction(log.action)}</p>
                  <time
                    dateTime={log.created_at}
                    className="text-muted-foreground shrink-0 font-mono text-xs tabular-nums"
                  >
                    {formatDate(log.created_at)}
                  </time>
                </div>
                {log.new_value ? (
                  <p className="text-muted-foreground mt-1 text-sm">
                    {summarizeAuditPayload(log.new_value)}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

function SessionCaseSummaryCard({
  data,
  fileCount,
  duplicateSessionHref,
  duplicateFound,
}: {
  data: VerificationSessionDetail;
  fileCount: number;
  duplicateSessionHref?: string;
  duplicateFound: boolean;
}) {
  const completedChecks = Object.values(data.checks ?? {}).filter(
    (check) =>
      check && check.status !== "pending" && check.status !== "skipped",
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

        {duplicateFound || data.decision_reason ? (
          <div className="border-border bg-muted/30 rounded-md border p-3 text-sm">
            <p className="font-medium">Decision note</p>
            <p className="text-muted-foreground mt-1">
              {duplicateFound
                ? "Duplicate face match detected. A reviewer must decide this session."
                : data.decision_reason}
            </p>
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
      <dd className="font-medium break-words">{value}</dd>
    </div>
  );
}

function formatMachineLabel(value: string): string {
  return value.replaceAll("_", " ");
}

function formatAuditAction(value: string): string {
  const label = formatMachineLabel(value);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function summarizeAuditPayload(value: Record<string, unknown>): string {
  const entries = Object.entries(value).filter(
    ([, entryValue]) => entryValue !== null && entryValue !== undefined,
  );
  if (entries.length === 0) return "No recorded changes";

  return entries
    .slice(0, 3)
    .map(
      ([key, entryValue]) =>
        `${formatMachineLabel(key)}: ${formatAuditValue(entryValue)}`,
    )
    .join("; ");
}

function formatAuditValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  if (typeof value === "string") return formatMachineLabel(value);
  if (Array.isArray(value)) {
    return `${value.length} item${value.length === 1 ? "" : "s"}`;
  }
  if (value && typeof value === "object") {
    const count = Object.keys(value).length;
    return `${count} field${count === 1 ? "" : "s"}`;
  }
  return "Not provided";
}

function formatUserAction(action: VerificationUserAction): string {
  if (action.action === "retake_document") {
    const fields = action.fields.map(formatMachineLabel).join(", ");
    return `Retake document${fields ? ` (${fields})` : ""}`;
  }
  return formatMachineLabel(action.action);
}
