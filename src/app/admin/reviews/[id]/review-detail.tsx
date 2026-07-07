"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, XIcon } from "lucide-react";

import { CheckCard, orderedCheckKeys } from "@/components/check-card";
import { JsonViewer } from "@/components/json-viewer";
import { ScoreMeter } from "@/components/score-meter";
import { StatusPill } from "@/components/status-pill";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";
import { useAdminReview, useApproveAdminReview, useRejectAdminReview } from "@/lib/hooks/use-admin-reviews";

export function AdminReviewDetail({ verificationId }: { verificationId: string }) {
  const review = useAdminReview(verificationId);

  if (review.isLoading) {
    return <Skeleton className="h-96 w-full lg:col-span-2" />;
  }
  if (review.error || !review.data) {
    return (
      <Alert variant="destructive" className="lg:col-span-2">
        <AlertTitle>Review could not be loaded</AlertTitle>
        <AlertDescription>Sign in again or return to the queue.</AlertDescription>
      </Alert>
    );
  }

  const data = review.data;
  return (
    <>
      <section className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <StatusPill status={data.status} />
                <CardTitle>{data.external_user_id}</CardTitle>
                <CardDescription className="font-mono">{data.verification_id}</CardDescription>
              </div>
              <p className="text-muted-foreground text-sm">Created {formatDate(data.created_at)}</p>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ScoreMeter score={data.risk_score} />
            {data.decision_reason ? <p className="bg-muted/40 rounded-lg border px-4 py-3 text-sm">{data.decision_reason}</p> : null}
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          {orderedCheckKeys().map((key) => (
            <CheckCard key={key} checkKey={key} result={data.checks[key]} />
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Audit trail</CardTitle>
            <CardDescription>State changes recorded for this verification.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.audit_logs.length ? (
              <ol className="flex flex-col gap-3">
                {data.audit_logs.map((entry) => (
                  <li key={`${entry.action}-${entry.created_at}`} className="rounded-lg border p-3">
                    <p className="font-medium">{entry.action}</p>
                    <p className="text-muted-foreground text-xs">{formatDate(entry.created_at)}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-muted-foreground text-sm">No audit entries were returned for this session.</p>
            )}
          </CardContent>
        </Card>
        <JsonViewer value={data} title="Raw admin response" />
      </section>
      <DecisionPane verificationId={verificationId} currentStatus={data.status} />
    </>
  );
}

function DecisionPane({ verificationId, currentStatus }: { verificationId: string; currentStatus: string }) {
  const router = useRouter();
  const approve = useApproveAdminReview(verificationId);
  const reject = useRejectAdminReview(verificationId);
  const [reason, setReason] = useState("");
  const [submittedReject, setSubmittedReject] = useState(false);
  const disabled = currentStatus !== "manual_review" || approve.isPending || reject.isPending;

  async function submitReject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedReject(true);
    if (!reason.trim()) return;
    await reject.mutateAsync(reason.trim());
    router.push("/admin/reviews");
  }

  async function submitApprove() {
    await approve.mutateAsync();
    router.push("/admin/reviews");
  }

  const reasonInvalid = submittedReject && !reason.trim();
  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <Card>
        <CardHeader>
          <CardTitle>Decision</CardTitle>
          <CardDescription>Approve only when the evidence supports the user’s identity.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button type="button" disabled={disabled} onClick={submitApprove}>
            <CheckIcon data-icon="inline-start" />
            Approve
          </Button>
          <form onSubmit={submitReject} className="flex flex-col gap-4">
            <FieldGroup>
              <Field data-invalid={reasonInvalid || undefined}>
                <FieldLabel htmlFor="reject-reason">Reject reason</FieldLabel>
                <Textarea id="reject-reason" value={reason} onChange={(event) => setReason(event.target.value)} aria-invalid={reasonInvalid} disabled={disabled} />
                <FieldDescription>Shown in the audit trail. Keep it factual.</FieldDescription>
                {reasonInvalid ? <FieldError>Enter a reason before rejecting.</FieldError> : null}
              </Field>
            </FieldGroup>
            <Button type="submit" variant="destructive" disabled={disabled}>
              <XIcon data-icon="inline-start" />
              Reject
            </Button>
          </form>
          {approve.error || reject.error ? (
            <Alert variant="destructive">
              <AlertTitle>Decision was not saved</AlertTitle>
              <AlertDescription>This session may no longer be in manual review. Refresh the queue.</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
        <CardFooter>
          <Button type="button" variant="outline" className="w-full" onClick={() => router.push("/admin/reviews")}>
            Back to queue
          </Button>
        </CardFooter>
      </Card>
    </aside>
  );
}
