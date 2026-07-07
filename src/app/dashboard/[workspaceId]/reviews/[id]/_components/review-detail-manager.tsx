"use client";

import { useState } from "react";
import { ScrollTextIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiClient,
  type AdminAuditLogItem,
  type VerificationSessionDetail,
  type AgenticReviewFeedbackRequest,
} from "@/lib/api-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreMeter } from "@/components/score-meter";
import { StatusPill } from "@/components/status-pill";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { formatDate } from "@/lib/format";
import { JsonViewer } from "@/components/json-viewer";
import { CheckCard, orderedCheckKeys } from "@/components/check-card";
import { useClientSession } from "@/lib/hooks/use-client-session";
import { AgentRecommendationPanel } from "@/components/agent-recommendation-panel";
import { TimeoutRecoveryBanner } from "@/components/timeout-recovery-banner";

import { EvidenceViewer } from "../../../_components/evidence-viewer";

export function ReviewDetailManager({
  workspaceId,
  verificationId,
}: {
  workspaceId: string;
  verificationId: string;
}) {
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();
  const session = useClientSession();
  const role = session.data?.organizationRole ?? null;
  const canViewEvidence =
    role === "client_owner" ||
    role === "client_admin" ||
    role === "client_reviewer";
  const canViewProviderMetadata =
    role === "client_owner" || role === "client_admin";

  const reviewQuery = useQuery({
    queryKey: ["workspace-review", workspaceId, verificationId],
    queryFn: () => apiClient.getWorkspaceReview(workspaceId, verificationId),
  });

  const sessionQuery = useQuery({
    queryKey: ["workspace-verification", workspaceId, verificationId],
    queryFn: () => apiClient.getWorkspaceVerification(workspaceId, verificationId),
  });

  const feedbackMutation = useMutation({
    mutationFn: (feedback: AgenticReviewFeedbackRequest) =>
      apiClient.submitAgenticReviewFeedback(workspaceId, verificationId, feedback),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["workspace-review", workspaceId, verificationId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["workspace-verification", workspaceId, verificationId],
      });
    },
  });

  const decideMutation = useMutation({
    mutationFn: (input: { decision: "approve" | "reject"; reason?: string }) =>
      apiClient.submitWorkspaceReviewDecision(workspaceId, verificationId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["workspace-review", workspaceId, verificationId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["workspace-verification", workspaceId, verificationId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["workspace-reviews", workspaceId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["workspace-verifications", workspaceId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["workspace-verification-summary", workspaceId],
      });
    },
  });

  if (reviewQuery.isLoading) {
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

  if (reviewQuery.error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load review details</AlertTitle>
        <AlertDescription>
          An error occurred while fetching the review. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!reviewQuery.data) return null;

  const data = sessionQuery.data ?? reviewQuery.data;
  const auditLogs =
    sessionQuery.data?.audit_logs ?? reviewQuery.data.audit_logs ?? [];
  const timedOutServices = data.timed_out_services ?? [];
  const duplicateSessionHref = data.duplicate_session_id
    ? `/dashboard/${workspaceId}/sessions/${data.duplicate_session_id}`
    : undefined;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Review Detail
        </span>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                {data.external_user_id}
              </h1>
              <StatusPill status={data.status} />
            </div>
            <p className="text-muted-foreground font-mono text-xs">
              ID: {data.verification_id}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="text-sm font-medium">{formatDate(data.created_at)}</p>
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
                The risk score is calculated based on the results of all performed checks.
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

          <AgentRecommendationPanel
            check={data.checks?.agentic_review}
            deterministicStatus={data.status}
            canViewProviderMetadata={canViewProviderMetadata}
            reviewerFeedback={
              (data.checks?.agentic_review?.result?.reviewer_feedback as
                | { agreed_with_agent: boolean; reviewer_user_id: string; recorded_at: string }
                | undefined) ?? null
            }
            onSubmitFeedback={async (agreed) => {
              await feedbackMutation.mutateAsync({ agreed_with_agent: agreed });
            }}
            isSubmittingFeedback={feedbackMutation.isPending}
          />

          {sessionQuery.error ? (
            <Alert variant="destructive">
              <AlertTitle>Could not load captured evidence</AlertTitle>
              <AlertDescription>
                The review details loaded, but the session evidence endpoint
                did not respond. Refresh the page or open the verification from
                the activity log.
              </AlertDescription>
            </Alert>
          ) : sessionQuery.isLoading ? (
            <Card>
              <CardHeader>
                <CardTitle>Captured evidence</CardTitle>
                <CardDescription>
                  Loading uploaded files for this verification.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-72 rounded-xl" />
              </CardContent>
            </Card>
          ) : sessionQuery.data ? (
            <EvidenceViewer
              workspaceId={workspaceId}
              session={sessionQuery.data as VerificationSessionDetail}
              canViewEvidence={canViewEvidence}
            />
          ) : null}

          <AuditLogCard logs={auditLogs} />
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Decision</CardTitle>
              <CardDescription>
                Review the evidence and make a decision on this verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground">Reason</label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => decideMutation.mutate({ decision: "reject", reason })}
                  disabled={decideMutation.isPending || !reason}
                >
                  Reject
                </Button>
                <Button
                  variant="default"
                  onClick={() => decideMutation.mutate({ decision: "approve" })}
                  disabled={decideMutation.isPending}
                >
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Raw Data</CardTitle>
              <CardDescription>
                The full API response for this review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JsonViewer value={data} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AuditLogCard({ logs }: { logs: AdminAuditLogItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Session audit log</CardTitle>
        <CardDescription>
          Status changes and reviewer actions recorded for this verification.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <EmptyState
            icon={ScrollTextIcon}
            title="No audit events"
            description="No audit-log entries are attached to this verification session yet."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Old</TableHead>
                <TableHead>New</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, index) => (
                <TableRow key={`${log.created_at}-${log.action}-${index}`}>
                  <TableCell>
                    <code className="font-mono text-xs">{log.action}</code>
                  </TableCell>
                  <AuditPayloadCell value={log.old_value} />
                  <AuditPayloadCell value={log.new_value} />
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDate(log.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function AuditPayloadCell({ value }: { value: Record<string, unknown> | null }) {
  return (
    <TableCell className="max-w-xs truncate text-xs">
      {value ? (
        <code className="text-muted-foreground">{JSON.stringify(value)}</code>
      ) : (
        <span className="text-muted-foreground">-</span>
      )}
    </TableCell>
  );
}
