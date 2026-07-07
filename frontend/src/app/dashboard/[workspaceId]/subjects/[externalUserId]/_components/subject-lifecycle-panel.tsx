"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BanIcon,
  FileClockIcon,
  HistoryIcon,
  RotateCcwIcon,
  ShieldOffIcon,
  Trash2Icon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { StatusPill } from "@/components/status-pill";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  apiClient,
  type SubjectBanKind,
  type SubjectBanStatus,
  type SubjectLifecycleResponse,
  type VerificationListItem,
  type WorkspaceAuditLogItem,
} from "@/lib/api-client";
import { formatDate, scoreLabel } from "@/lib/format";
import { useClientSession } from "@/lib/hooks/use-client-session";
import {
  subjectAuditKey,
  subjectSessionsKey,
  useDeleteSubject,
  useResetSubjectVerification,
  useSubjectBanStatus,
  useUpdateSubjectBan,
  useUpsertSubjectBan,
} from "@/lib/hooks/use-subject-lifecycle";
import { cn } from "@/lib/utils";

type ConfirmAction = "reset" | "delete" | "lift" | null;

export function SubjectLifecyclePanel({
  workspaceId,
  externalUserId,
}: {
  workspaceId: string;
  externalUserId: string;
}) {
  const session = useClientSession();
  const role = session.data?.organizationRole ?? null;
  const canMutate = role === "client_owner" || role === "client_admin";
  const banStatus = useSubjectBanStatus(workspaceId, externalUserId);
  const resetSubject = useResetSubjectVerification(workspaceId, externalUserId);
  const deleteSubject = useDeleteSubject(workspaceId, externalUserId);
  const updateBan = useUpdateSubjectBan(workspaceId, externalUserId);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [confirmReason, setConfirmReason] = useState("");
  const [banDrawerOpen, setBanDrawerOpen] = useState(false);
  const [lastResult, setLastResult] =
    useState<SubjectLifecycleResponse | null>(null);

  const sessions = useQuery({
    queryKey: subjectSessionsKey(workspaceId, externalUserId),
    queryFn: () =>
      apiClient.listWorkspaceVerifications(workspaceId, {
        external_user_id: externalUserId,
        limit: 10,
      }),
    enabled: Boolean(session.data?.authenticated && workspaceId && externalUserId),
  });

  const audit = useQuery({
    queryKey: subjectAuditKey(workspaceId, externalUserId),
    queryFn: () => apiClient.listWorkspaceAuditLogs(workspaceId, { limit: 100 }),
    enabled: Boolean(session.data?.authenticated && workspaceId && externalUserId),
  });

  const lifecycleEvents = useMemo(
    () =>
      (audit.data ?? []).filter((entry) =>
        isSubjectLifecyclePayload(entry.new_value, externalUserId),
      ),
    [audit.data, externalUserId],
  );

  async function submitConfirm() {
    if (!confirmAction) return;
    try {
      let result: SubjectLifecycleResponse;
      if (confirmAction === "reset") {
        result = await resetSubject.mutateAsync({ reason: confirmReason });
      } else if (confirmAction === "delete") {
        result = await deleteSubject.mutateAsync({ reason: confirmReason });
      } else {
        result = await updateBan.mutateAsync({
          is_active: false,
          reason: confirmReason,
        });
      }
      setLastResult(result);
      setConfirmAction(null);
      setConfirmReason("");
      toast.success(actionToast(result.action));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    }
  }

  const pending =
    resetSubject.isPending || deleteSubject.isPending || updateBan.isPending;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Subject lifecycle
        </span>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {externalUserId}
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Reset verification, delete subject data, and manage enforcement
              state for this external user id.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canMutate ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmAction("reset")}
                >
                  <RotateCcwIcon data-icon="inline-start" />
                  Reset verification
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBanDrawerOpen(true)}
                >
                  <BanIcon data-icon="inline-start" />
                  {banStatus.data?.is_active ? "Update ban" : "Create ban"}
                </Button>
                {banStatus.data?.is_active ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConfirmAction("lift")}
                  >
                    <ShieldOffIcon data-icon="inline-start" />
                    Lift ban
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setConfirmAction("delete")}
                >
                  <Trash2Icon data-icon="inline-start" />
                  Delete subject
                </Button>
              </>
            ) : (
              <Badge variant="outline">Reviewer view</Badge>
            )}
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <BanStatusCard status={banStatus.data ?? null} loading={banStatus.isLoading} />
        <LastResultCard result={lastResult} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <RecentSessionsCard
          workspaceId={workspaceId}
          sessions={sessions.data?.items ?? []}
          loading={sessions.isLoading}
          error={Boolean(sessions.error)}
        />
        <LifecycleAuditCard
          events={lifecycleEvents}
          loading={audit.isLoading}
          error={Boolean(audit.error)}
        />
      </section>

      <ConfirmLifecycleDialog
        action={confirmAction}
        externalUserId={externalUserId}
        reason={confirmReason}
        pending={pending}
        onReasonChange={setConfirmReason}
        onClose={() => setConfirmAction(null)}
        onConfirm={submitConfirm}
      />

      <BanDrawer
        workspaceId={workspaceId}
        externalUserId={externalUserId}
        status={banStatus.data ?? null}
        open={banDrawerOpen}
        onOpenChange={setBanDrawerOpen}
        onResult={setLastResult}
      />
    </div>
  );
}

function BanStatusCard({
  status,
  loading,
}: {
  status: SubjectBanStatus | null;
  loading: boolean;
}) {
  if (loading) return <Skeleton className="h-44 rounded-2xl" />;
  const label = subjectBanLabel(status);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Ban status</CardTitle>
            <CardDescription>
              Safe enforcement state for future verification attempts.
            </CardDescription>
          </div>
          <BanBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/40 px-4 py-3">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {status?.reason ?? "No operator reason recorded."}
          </p>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <Meta label="Retained match" value={status?.retained_face_embedding ? "Yes" : "No"} />
          <Meta label="Created" value={status ? formatDate(status.created_at) : "-"} />
          <Meta label="Updated" value={status ? formatDate(status.updated_at) : "-"} />
        </div>
      </CardContent>
    </Card>
  );
}

function LastResultCard({ result }: { result: SubjectLifecycleResponse | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Last action</CardTitle>
        <CardDescription>
          Counts are safe operational totals; biometric vectors are never shown.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result ? (
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <Meta label="Action" value={humanize(result.action)} />
            <Meta label="Deleted sessions" value={String(result.deleted_verification_count)} />
            <Meta label="Deleted embeddings" value={String(result.deleted_face_embedding_count)} />
            <Meta label="Deleted files" value={String(result.deleted_file_count)} />
            <Meta label="Retained ban match" value={String(result.retained_face_embedding_count)} />
            <Meta label="Audit log" value={result.audit_log_id?.slice(0, 8) ?? "-"} />
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Lifecycle action results will appear here after a reset, delete,
            ban update, or ban lift.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function RecentSessionsCard({
  workspaceId,
  sessions,
  loading,
  error,
}: {
  workspaceId: string;
  sessions: VerificationListItem[];
  loading: boolean;
  error: boolean;
}) {
  if (loading) return <Skeleton className="h-72 rounded-2xl" />;
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Sessions could not be loaded</AlertTitle>
        <AlertDescription>Refresh the page or sign in again.</AlertDescription>
      </Alert>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent sessions</CardTitle>
        <CardDescription>
          Latest verification sessions for this external user id.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <EmptyState
            icon={FileClockIcon}
            title="No sessions found"
            description="This subject has no current verification sessions in this workspace."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Verification</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((item) => (
                <TableRow key={item.verification_id}>
                  <TableCell className="font-mono text-xs">
                    <Button
                      render={
                        <Link
                          href={`/dashboard/${workspaceId}/sessions/${item.verification_id}`}
                        />
                      }
                      nativeButton={false}
                      variant="link"
                      className="h-auto p-0 font-mono text-xs"
                    >
                      {item.verification_id.slice(0, 12)}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <StatusPill status={item.status} />
                  </TableCell>
                  <TableCell className="text-sm">{scoreLabel(item.risk_score)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDate(item.created_at)}
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

function LifecycleAuditCard({
  events,
  loading,
  error,
}: {
  events: WorkspaceAuditLogItem[];
  loading: boolean;
  error: boolean;
}) {
  if (loading) return <Skeleton className="h-72 rounded-2xl" />;
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Audit events could not be loaded</AlertTitle>
        <AlertDescription>Confirm your role or try again later.</AlertDescription>
      </Alert>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lifecycle audit</CardTitle>
        <CardDescription>Workspace audit entries for this subject.</CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No lifecycle audit events"
            description="Reset, delete, ban update, and lift events will appear here."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {events.slice(0, 8).map((event, index) => (
              <div
                key={`${event.created_at}-${event.action}-${index}`}
                className="rounded-lg border px-3 py-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <code className="font-mono text-xs">{event.action}</code>
                  <span className="text-muted-foreground text-xs">
                    {formatDate(event.created_at)}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 truncate text-xs">
                  {safeAuditSummary(event.new_value)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ConfirmLifecycleDialog({
  action,
  externalUserId,
  reason,
  pending,
  onReasonChange,
  onClose,
  onConfirm,
}: {
  action: ConfirmAction;
  externalUserId: string;
  reason: string;
  pending: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const copy = action ? confirmCopy(action) : null;
  return (
    <Dialog open={action !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{copy?.title ?? "Confirm action"}</DialogTitle>
          <DialogDescription>{copy?.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/40 px-3 py-2 font-mono text-xs">
            {externalUserId}
          </div>
          <Field>
            <FieldLabel htmlFor="subject-confirm-reason">Reason</FieldLabel>
            <Textarea
              id="subject-confirm-reason"
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              placeholder="Operator reason"
              rows={3}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={action === "lift" ? "default" : "destructive"}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? <Spinner className="size-3" aria-hidden /> : null}
            {copy?.button ?? "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BanDrawer({
  workspaceId,
  externalUserId,
  status,
  open,
  onOpenChange,
  onResult,
}: {
  workspaceId: string;
  externalUserId: string;
  status: SubjectBanStatus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResult: (result: SubjectLifecycleResponse) => void;
}) {
  const upsertBan = useUpsertSubjectBan(workspaceId, externalUserId);
  const [kind, setKind] = useState<SubjectBanKind>(() =>
    status?.kind ?? "soft_ban"
  );
  const [expiresAt, setExpiresAt] = useState(() =>
    toLocalDateTime(status?.ban_expires_at)
  );
  const [reason, setReason] = useState(() => status?.reason ?? "");
  const [metadata, setMetadata] = useState("{}");
  const [metadataError, setMetadataError] = useState<string | null>(null);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      initializedRef.current = false;
      return;
    }
    if (initializedRef.current) return;
    initializedRef.current = true;
    setKind(status?.kind ?? "soft_ban");
    setExpiresAt(toLocalDateTime(status?.ban_expires_at));
    setReason(status?.reason ?? "");
    setMetadata("{}");
    setMetadataError(null);
  }, [open, status]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMetadataError(null);
    let parsed: Record<string, unknown> = {};
    try {
      const raw = metadata.trim() ? JSON.parse(metadata) : {};
      if (raw === null || Array.isArray(raw) || typeof raw !== "object") {
        throw new Error("Metadata must be a JSON object.");
      }
      parsed = raw as Record<string, unknown>;
    } catch (error) {
      setMetadataError(error instanceof Error ? error.message : "Invalid JSON");
      return;
    }
    if (kind === "soft_ban" && !expiresAt) {
      setMetadataError("Soft bans require an end date.");
      return;
    }
    upsertBan.mutate(
      {
        kind,
        reason: reason.trim() || undefined,
        ban_expires_at:
          kind === "soft_ban" && expiresAt
            ? new Date(expiresAt).toISOString()
            : null,
        metadata: parsed,
      },
      {
        onSuccess: (result) => {
          onResult(result);
          onOpenChange(false);
          toast.success(actionToast(result.action));
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Ban update failed");
        },
      },
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b p-6">
          <SheetTitle>{status?.is_active ? "Update ban" : "Create ban"}</SheetTitle>
          <SheetDescription>
            Ban actions delete session artifacts and retain only the
            tenant-scoped ban-match signal while the ban is active.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="flex flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto p-6">
            <FieldGroup>
              <Field>
                <FieldLabel>Ban kind</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {(["soft_ban", "permanent_ban"] as SubjectBanKind[]).map(
                    (option) => (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={kind === option}
                        onClick={() => setKind(option)}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                          kind === option
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background hover:bg-muted",
                        )}
                      >
                        {option === "soft_ban" ? "Soft ban" : "Permanent ban"}
                      </button>
                    ),
                  )}
                </div>
              </Field>
              {kind === "soft_ban" ? (
                <Field>
                  <FieldLabel htmlFor="subject-ban-expiry">Ban end date</FieldLabel>
                  <Input
                    id="subject-ban-expiry"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(event) => setExpiresAt(event.target.value)}
                  />
                </Field>
              ) : null}
              <Field>
                <FieldLabel htmlFor="subject-ban-reason">Reason</FieldLabel>
                <Textarea
                  id="subject-ban-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Repeat abuse, policy violation, chargeback pattern"
                  rows={4}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="subject-ban-metadata">Metadata</FieldLabel>
                <Textarea
                  id="subject-ban-metadata"
                  value={metadata}
                  onChange={(event) => setMetadata(event.target.value)}
                  className="font-mono text-xs"
                  rows={5}
                />
                <FieldDescription>
                  Optional JSON object. Do not include private evidence or raw
                  biometric data.
                </FieldDescription>
                {metadataError ? (
                  <p className="text-sm text-destructive">{metadataError}</p>
                ) : null}
              </Field>
            </FieldGroup>
          </div>
          <SheetFooter className="border-t p-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={upsertBan.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={upsertBan.isPending}>
              {upsertBan.isPending ? <Spinner className="size-3" aria-hidden /> : null}
              Save ban
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium tabular-nums">{value}</p>
    </div>
  );
}

function BanBadge({ status }: { status: SubjectBanStatus | null }) {
  if (!status) return <Badge variant="secondary">No active ban</Badge>;
  if (!status.is_active) return <Badge variant="outline">Ban lifted</Badge>;
  if (status.kind === "permanent_ban") {
    return <Badge variant="destructive">Permanent ban</Badge>;
  }
  return <Badge variant="outline">Soft ban</Badge>;
}

function subjectBanLabel(status: SubjectBanStatus | null) {
  if (!status) return "No active ban";
  if (!status.is_active) return "Ban lifted";
  if (status.kind === "permanent_ban") return "Permanent ban";
  return `Soft ban until ${status.ban_expires_at ? formatDate(status.ban_expires_at) : "end date missing"}`;
}

function confirmCopy(action: Exclude<ConfirmAction, null>) {
  if (action === "reset") {
    return {
      title: "Reset verification",
      description:
        "This removes sessions, files, checks, webhook deliveries, and face embeddings for this subject. Future duplicate matching for this subject is removed.",
      button: "Reset verification",
    };
  }
  if (action === "delete") {
    return {
      title: "Delete subject data",
      description:
        "This removes HaloKYC-held subject data, sessions, evidence files, checks, webhook deliveries, and face embeddings for this subject.",
      button: "Delete subject",
    };
  }
  return {
    title: "Lift ban",
    description:
      "This disables retained ban-match embeddings unless another active ban needs them. Future attempts will no longer match this ban.",
    button: "Lift ban",
  };
}

function actionToast(action: string) {
  return `${humanize(action)} completed`;
}

function humanize(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function safeAuditSummary(value: Record<string, unknown> | null) {
  if (!value) return "No payload";
  const parts = [
    value.reason ? `Reason: ${String(value.reason)}` : null,
    typeof value.deleted_verification_count === "number"
      ? `Deleted sessions: ${value.deleted_verification_count}`
      : null,
    typeof value.retained_face_embedding_count === "number"
      ? `Retained ban match: ${value.retained_face_embedding_count}`
      : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" | ") : "Safe lifecycle event recorded";
}

function isSubjectLifecyclePayload(
  value: Record<string, unknown> | null,
  externalUserId: string,
) {
  return (
    value !== null &&
    typeof value.external_user_id === "string" &&
    value.external_user_id === externalUserId
  );
}

function toLocalDateTime(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}
