"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient, type VerificationSessionDetail } from "@/lib/api-client";
import { useClientSession } from "@/lib/hooks/use-client-session";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { SessionDetailContent } from "../../../sessions/[id]/_components/session-detail-manager";

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
  const canViewRawData = role === "client_owner" || role === "client_admin";
  const canUpload =
    role === "client_owner" ||
    role === "client_admin" ||
    role === "client_developer";

  const verificationQuery = useQuery({
    queryKey: ["workspace-verification", workspaceId, verificationId],
    queryFn: () =>
      apiClient.getWorkspaceVerification(workspaceId, verificationId),
  });

  const decideMutation = useMutation({
    mutationFn: (input: { decision: "approve" | "reject"; reason?: string }) =>
      apiClient.submitWorkspaceReviewDecision(
        workspaceId,
        verificationId,
        input,
      ),
    onSuccess: () => {
      setReason("");
      for (const queryKey of [
        ["workspace-verification", workspaceId, verificationId],
        ["workspace-review", workspaceId, verificationId],
        ["workspace-reviews", workspaceId],
        ["workspace-verifications", workspaceId],
        ["workspace-verification-summary", workspaceId],
      ]) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
  });

  if (verificationQuery.isLoading) {
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

  if (verificationQuery.error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load review details</AlertTitle>
        <AlertDescription>
          The verification detail could not be loaded. Refresh the page and try
          again.
        </AlertDescription>
      </Alert>
    );
  }

  const data = verificationQuery.data;
  if (!data) return null;

  return (
    <SessionDetailContent
      workspaceId={workspaceId}
      verificationId={verificationId}
      data={data as VerificationSessionDetail}
      canViewEvidence={canViewEvidence}
      canViewSubject={canViewEvidence}
      canUpload={canUpload}
      canViewRawData={canViewRawData}
      onRefresh={() => {
        void verificationQuery.refetch();
      }}
      sidebarExtra={
        <DecisionCard
          status={data.status}
          reason={reason}
          onReasonChange={setReason}
          pending={decideMutation.isPending}
          error={decideMutation.isError}
          onApprove={() => decideMutation.mutate({ decision: "approve" })}
          onReject={() =>
            decideMutation.mutate({
              decision: "reject",
              reason: reason.trim(),
            })
          }
        />
      }
    />
  );
}

function DecisionCard({
  status,
  reason,
  onReasonChange,
  pending,
  error,
  onApprove,
  onReject,
}: {
  status: VerificationSessionDetail["status"];
  reason: string;
  onReasonChange: (value: string) => void;
  pending: boolean;
  error: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const reviewable = status === "manual_review";

  return (
    <Card className="border-t-2 border-t-[color:var(--status-review-fg)]/40">
      <CardHeader>
        <CardTitle>Decision</CardTitle>
        <CardDescription>
          {reviewable
            ? "Resolve this case after reviewing every section."
            : "A final decision has already been recorded."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Decision not saved</AlertTitle>
            <AlertDescription>Refresh the case and try again.</AlertDescription>
          </Alert>
        ) : null}
        <div className="grid gap-2">
          <label
            htmlFor="review-decision-reason"
            className="text-muted-foreground text-xs font-medium"
          >
            Rejection reason
          </label>
          <Input
            id="review-decision-reason"
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder="Required when rejecting"
            disabled={!reviewable || pending}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10"
            onClick={onReject}
            disabled={!reviewable || pending || !reason.trim()}
          >
            Reject
          </Button>
          <Button
            type="button"
            onClick={onApprove}
            disabled={!reviewable || pending}
          >
            Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
