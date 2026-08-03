"use client";

import { SessionDetailContent } from "@/app/dashboard/[workspaceId]/sessions/[id]/_components/session-detail-manager";
import { EmptyState } from "@/components/empty-state";
import { AppShell } from "@/components/dashboard/app-shell";
import { PlatformRouteGuard } from "@/components/dashboard/platform-route-guard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api-client";
import { useAdminVerification } from "@/lib/hooks/use-admin-console";
import {
  useApproveAdminReview,
  useRejectAdminReview,
} from "@/lib/hooks/use-admin-reviews";
import { ScanSearchIcon, ShieldCheckIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

export default function AdminVerificationDetailPage() {
  const params = useParams<{ verificationId: string }>();

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
          <VerificationDetailBody verificationId={params.verificationId} />
        </PlatformRouteGuard>
      </main>
    </AppShell>
  );
}

function VerificationDetailBody({
  verificationId,
}: {
  verificationId: string;
}) {
  const query = useAdminVerification(verificationId);
  const approve = useApproveAdminReview(verificationId);
  const reject = useRejectAdminReview(verificationId);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);

  if (query.isLoading) {
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
        toast.error(
          err instanceof ApiError
            ? `Could not reject: ${err.status}`
            : "Could not reject verification",
        );
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
    <>
      <SessionDetailContent
        workspaceId=""
        verificationId={verificationId}
        data={detail}
        canViewEvidence={false}
        canViewSubject={false}
        canUpload={false}
        canViewRawData
        onRefresh={() => {
          void query.refetch();
        }}
        sessionHrefPrefix="/admin/verifications"
        showEvidence={false}
        sidebarExtra={
          <AdminDecisionCard
            isReviewable={isReviewable}
            isPending={approve.isPending || reject.isPending}
            onApprove={onApprove}
            onReject={() => setRejectOpen(true)}
          />
        }
      />

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this verification?</DialogTitle>
            <DialogDescription>
              Provide a short reason. The reason is logged in the audit history
              and surfaced to the customer.
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
              <Button
                type="submit"
                variant="destructive"
                disabled={reject.isPending}
              >
                {reject.isPending ? "Rejecting..." : "Reject verification"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AdminDecisionCard({
  isReviewable,
  isPending,
  onApprove,
  onReject,
}: {
  isReviewable: boolean;
  isPending: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <Card className="border-t-2 border-t-[color:var(--status-review-fg)]/40">
      <CardHeader>
        <CardTitle>Decision</CardTitle>
        <CardDescription>
          {isReviewable
            ? "Resolve this case after reviewing every section."
            : "A final decision has already been recorded."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          className="border-destructive text-destructive hover:bg-destructive/10"
          onClick={onReject}
          disabled={!isReviewable || isPending}
        >
          Reject
        </Button>
        <Button
          type="button"
          onClick={onApprove}
          disabled={!isReviewable || isPending}
        >
          <ShieldCheckIcon className="size-4" aria-hidden />
          Approve
        </Button>
      </CardContent>
    </Card>
  );
}
