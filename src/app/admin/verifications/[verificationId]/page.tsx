"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EmptyState,
} from "@/components/empty-state";
import { ScanSearchIcon, ShieldCheckIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDate } from "@/lib/format";
import {
  useAdminVerification,
} from "@/lib/hooks/use-admin-console";
import {
  useApproveAdminReview,
  useRejectAdminReview,
} from "@/lib/hooks/use-admin-reviews";
import { FormEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { AppShell } from "@/components/dashboard/app-shell";
import { PlatformRouteGuard } from "@/components/dashboard/platform-route-guard";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { CheckCard, orderedCheckKeys } from "@/components/check-card";
import { TimeoutRecoveryBanner } from "@/components/timeout-recovery-banner";

export default function AdminVerificationDetailPage() {
  const params = useParams<{ verificationId: string }>();
  const verificationId = params.verificationId;
  return (
    <AppShell audience="admin">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
        <PlatformRouteGuard
          allowedRoles={[
            "platform_owner",
            "platform_business_admin",
            "platform_support",
          ]}
          fallbackHref="/admin/verifications"
        >
          <VerificationDetailBody verificationId={verificationId} />
        </PlatformRouteGuard>
      </main>
    </AppShell>
  );
}

function VerificationDetailBody({ verificationId }: { verificationId: string }) {
  const query = useAdminVerification(verificationId);
  const approve = useApproveAdminReview(verificationId);
  const reject = useRejectAdminReview(verificationId);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!query.data) {
    return (
      <EmptyState
        icon={ScanSearchIcon}
        title="Verification not found"
        description="It may have been removed, or your role cannot view this record."
        action={
          <Button
            render={<Link href="/admin/verifications" />}
            nativeButton={false}
            variant="outline"
          >
            Back to verifications
          </Button>
        }
      />
    );
  }

  const detail = query.data;
  const isReviewable = detail.status === "manual_review";
  const timedOutServices = detail.timed_out_services ?? [];
  const duplicateSessionHref = detail.duplicate_session_id
    ? `/admin/verifications/${detail.duplicate_session_id}`
    : undefined;

  function submitReject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = rejectReason.trim();
    if (!trimmed) {
      setRejectError("Enter a reason for the rejection.");
      return;
    }
    reject.mutate(trimmed, {
      onSuccess: () => {
        toast.success("Verification rejected");
        setRejectOpen(false);
        setRejectReason("");
        setRejectError(null);
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          toast.error(`Could not reject: ${err.status}`);
        } else {
          toast.error("Could not reject verification");
        }
      },
    });
  }

  function onApprove() {
    approve.mutate(undefined, {
      onSuccess: () => toast.success("Verification approved"),
      onError: () => toast.error("Could not approve verification"),
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        icon={ScanSearchIcon}
        title={`Verification ${detail.verification_id.slice(0, 8)}…`}
        description={`External user ${detail.external_user_id}. Created ${formatDate(detail.created_at)}.`}
        meta={
          <Badge
            variant={
              detail.status === "approved"
                ? "secondary"
                : detail.status === "rejected"
                  ? "destructive"
                  : detail.status === "manual_review"
                    ? "default"
                    : "outline"
            }
          >
            {detail.status.replace("_", " ")}
          </Badge>
        }
        actions={
          <>
            <Button
              render={<Link href="/admin/verifications" />}
              nativeButton={false}
              variant="outline"
            >
              Back
            </Button>
            {isReviewable ? (
              <>
                <Button
                  onClick={onApprove}
                  disabled={approve.isPending}
                  variant="default"
                >
                  <ShieldCheckIcon data-icon="inline-start" aria-hidden />
                  Approve
                </Button>
                <Button
                  onClick={() => setRejectOpen(true)}
                  variant="destructive"
                >
                  Reject…
                </Button>
              </>
            ) : null}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
            <CardDescription>
              Per-check status from the worker pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <TimeoutRecoveryBanner
                timeoutRecovery={detail.timeout_recovery}
                timedOutServices={timedOutServices}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {orderedCheckKeys().map((key) => (
                  <CheckCard
                    key={key}
                    checkKey={key}
                    result={detail.checks?.[key]}
                    verificationStatus={detail.status}
                    timedOut={timedOutServices.includes(key)}
                    duplicateSessionHref={
                      key === "duplicate" ? duplicateSessionHref : undefined
                    }
                    duplicateMatchKind={
                      key === "duplicate" ? detail.duplicate_match_kind : null
                    }
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk</CardTitle>
            <CardDescription>
              Aggregated decision score, reasons, and metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <SnapshotRow
              label="Risk score"
              value={
                typeof detail.risk_score === "number"
                  ? String(detail.risk_score)
                  : "—"
              }
            />
            <SnapshotRow
              label="Decision reason"
              value={detail.decision_reason ?? "—"}
              mono={false}
            />
            <SnapshotRow
              label="Updated"
              value={formatDate(detail.updated_at)}
              mono={false}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit log</CardTitle>
          <CardDescription>
            Status-change trail for this verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {detail.audit_logs.length === 0 ? (
            <EmptyState
              icon={ScanSearchIcon}
              title="No audit entries"
              description="The worker has not yet logged any state transition for this session."
            />
          ) : (
            <ul className="flex flex-col gap-3 text-sm">
              {detail.audit_logs.map((entry, index) => (
                <li
                  key={`${entry.action}-${index}-${entry.created_at}`}
                  className="flex flex-col gap-1 border-b pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{entry.action}</span>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>
                  {entry.new_value ? (
                    <pre className="bg-muted/40 text-muted-foreground overflow-x-auto rounded-md p-2 text-xs">
                      {JSON.stringify(entry.new_value, null, 2)}
                    </pre>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this verification?</DialogTitle>
            <DialogDescription>
              Provide a short reason. The reason is logged in the audit
              history and surfaced to the customer.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={submitReject}
            className="flex flex-col gap-3"
            noValidate
          >
            <Textarea
              value={rejectReason}
              onChange={(event) => {
                setRejectReason(event.target.value);
                if (rejectError) setRejectError(null);
              }}
              placeholder="e.g. selfie does not match the ID document"
              rows={3}
              maxLength={500}
              aria-invalid={Boolean(rejectError) || undefined}
            />
            {rejectError ? (
              <p className="text-destructive text-xs">{rejectError}</p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRejectOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={reject.isPending}>
                {reject.isPending ? "Rejecting…" : "Reject verification"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SnapshotRow({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="bg-muted/40 flex items-start justify-between gap-3 rounded-md border px-3 py-2">
      <span className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </span>
      <span
        className={cn(
          mono ? "font-mono" : "",
          "max-w-md text-right text-sm",
        )}
      >
        {value}
      </span>
    </div>
  );
}
