"use client";

import {
  ActivityIcon,
  Building2Icon,
  CircleDollarSignIcon,
  Loader2Icon,
  ShieldOffIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { AppShell } from "@/components/dashboard/app-shell";
import { PlatformRouteGuard } from "@/components/dashboard/platform-route-guard";
import { EmptyState } from "@/components/empty-state";
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
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import {
  useAdjustAdminBillingCredits,
  useAdminBillingCredits,
  useAdminOrganization,
  useAdminSalesCustomers,
  useAdminWorkspaces,
  useUpdateAdminOrganization,
} from "@/lib/hooks/use-admin-console";

export default function AdminOrganizationDetailPage() {
  const params = useParams<{ organizationId: string }>();
  const organizationId = params.organizationId;

  return (
    <AppShell audience="admin">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
        <PlatformRouteGuard
          allowedRoles={[
            "platform_owner",
            "platform_business_admin",
            "platform_support",
          ]}
          fallbackHref="/admin/organizations"
        >
          <OrganizationDetailBody organizationId={organizationId} />
        </PlatformRouteGuard>
      </main>
    </AppShell>
  );
}

function OrganizationDetailBody({ organizationId }: { organizationId: string }) {
  const org = useAdminOrganization(organizationId);
  const workspaces = useAdminWorkspaces();
  const sales = useAdminSalesCustomers();
  const credits = useAdminBillingCredits({ organizationId });
  const update = useUpdateAdminOrganization(organizationId);
  const adjust = useAdjustAdminBillingCredits();
  const [name, setName] = useState("");
  const [pendingStatus, setPendingStatus] = useState<"active" | "suspended" | "disabled" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustBucket, setAdjustBucket] = useState<"free" | "subscription" | "purchased">("free");
  const [adjustDescription, setAdjustDescription] = useState("");
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [adjustSubmitted, setAdjustSubmitted] = useState(false);
  const nameError =
    submitted && name.trim().length === 0 ? "Enter a name to rename the organization." : null;

  const customer = sales.data?.find((c) => c.organization_id === organizationId) ?? null;
  const orgWorkspaces = (workspaces.data ?? []).filter(
    (ws) => ws.organization_id === organizationId,
  );

  function submitUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    const trimmed = name.trim();
    if (!trimmed) return;
    update.mutate(
      { name: trimmed },
      {
        onSuccess: () => {
          toast.success("Organization updated");
          setName("");
          setSubmitted(false);
        },
        onError: () => toast.error("Could not update organization"),
      },
    );
  }

  function changeStatus(next: "active" | "suspended" | "disabled") {
    setPendingStatus(next);
    update.mutate(
      { status: next },
      {
        onSuccess: () => {
          toast.success(`Organization marked ${next}`);
          setPendingStatus(null);
        },
        onError: () => {
          toast.error("Could not update status");
          setPendingStatus(null);
        },
      },
    );
  }

  function submitAdjust(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdjustSubmitted(true);
    const amount = Number.parseInt(adjustAmount, 10);
    if (!Number.isFinite(amount) || amount === 0) {
      setAdjustError("Amount must be a non-zero integer (negative to remove).");
      return;
    }
    if (!adjustDescription.trim()) {
      setAdjustError("Add a description; it lands in the credit ledger.");
      return;
    }
    setAdjustError(null);
    adjust.mutate(
      {
        organization_id: organizationId,
        amount,
        bucket: adjustBucket,
        description: adjustDescription.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Credits adjusted");
          setAdjustAmount("");
          setAdjustDescription("");
          setAdjustSubmitted(false);
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            setAdjustError(`Could not adjust credits: ${err.status}`);
          } else {
            setAdjustError("Could not adjust credits");
          }
        },
      },
    );
  }

  if (org.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!org.data) {
    return (
      <EmptyState
        icon={Building2Icon}
        title="Organization not found"
        description="It may have been removed, or your role cannot view this record."
        action={
          <Button render={<Link href="/admin/organizations" />} nativeButton={false} variant="outline">
            Back to organizations
          </Button>
        }
      />
    );
  }

  const status = org.data.status;

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        icon={Building2Icon}
        title={org.data.name}
        description={`Organization id ${org.data.organization_id}. Created ${formatDate(org.data.created_at)}.`}
        meta={
          <>
            <Badge
              variant={
                status === "active"
                  ? "secondary"
                  : status === "suspended"
                    ? "destructive"
                    : "outline"
              }
            >
              {status}
            </Badge>
            {customer ? (
              <Badge variant="outline" className="font-mono">
                {customer.plan ?? "no-plan"}
              </Badge>
            ) : null}
          </>
        }
        actions={
          <Button render={<Link href="/admin/organizations" />} nativeButton={false} variant="outline">
            Back to list
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivityIcon className="size-4 text-muted-foreground" aria-hidden />
              Profile
            </CardTitle>
            <CardDescription>
              Update the visible name and the account status. Status changes write an audit-log entry.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitUpdate} className="flex flex-col gap-4">
              <FieldGroup>
                <Field data-invalid={Boolean(nameError) || undefined}>
                  <FieldLabel htmlFor={`org-name-${organizationId}`}>
                    Display name
                  </FieldLabel>
                  <Input
                    id={`org-name-${organizationId}`}
                    value={name}
                    placeholder={org.data.name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={255}
                  />
                  <FieldDescription>
                    Only the visible name updates immediately. Other profile fields stay here for reference.
                  </FieldDescription>
                  {nameError ? <FieldError>{nameError}</FieldError> : null}
                </Field>
              </FieldGroup>
              <div className="flex items-center gap-2">
                <Button type="submit" disabled={update.isPending}>
                  {update.isPending ? (
                    <Loader2Icon data-icon="inline-start" className="animate-spin" aria-hidden />
                  ) : null}
                  Save name
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldOffIcon className="size-4 text-muted-foreground" aria-hidden />
              Account status
            </CardTitle>
            <CardDescription>
              Suspend or disable to block new verifications. Reactivate to lift the hold.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={status === "active" ? "default" : "outline"}
                onClick={() => changeStatus("active")}
                disabled={update.isPending || status === "active"}
              >
                Active
              </Button>
              <Button
                variant={status === "suspended" ? "destructive" : "outline"}
                onClick={() => changeStatus("suspended")}
                disabled={update.isPending || status === "suspended"}
              >
                Suspended
              </Button>
              <Button
                variant={status === "disabled" ? "destructive" : "outline"}
                onClick={() => changeStatus("disabled")}
                disabled={update.isPending || status === "disabled"}
              >
                Disabled
              </Button>
            </div>
            {pendingStatus ? (
              <p className="text-muted-foreground text-xs">
                Saving {pendingStatus}…
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">
                The status change is audited and visible to platform owners.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleDollarSignIcon className="size-4 text-muted-foreground" aria-hidden />
              Billing snapshot
            </CardTitle>
            <CardDescription>
              The organization-level credit wallet. Drill in for the ledger.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {credits.isLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <SnapshotRow
                  label="Available"
                  value={credits.data?.balance.available_credits ?? 0}
                />
                <SnapshotRow
                  label="Reserved"
                  value={credits.data?.balance.reserved_credits ?? 0}
                />
                <SnapshotRow
                  label="Free"
                  value={credits.data?.balance.free_credits ?? 0}
                />
                <SnapshotRow
                  label="Subscription"
                  value={credits.data?.balance.subscription_credits ?? 0}
                />
                <SnapshotRow
                  label="Purchased"
                  value={credits.data?.balance.purchased_credits ?? 0}
                />
                <SnapshotRow
                  label="Total"
                  value={credits.data?.balance.total_credits ?? 0}
                />
              </div>
            )}
            <div className="mt-3 flex justify-end">
              <Button
                render={<Link href="/admin/billing" />}
                nativeButton={false}
                variant="ghost"
                size="sm"
              >
                Open billing & credits
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="size-4 text-muted-foreground" aria-hidden />
              Workspaces
            </CardTitle>
            <CardDescription>
              The workspaces that belong to this organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workspaces.isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : orgWorkspaces.length === 0 ? (
              <EmptyState
                icon={UsersIcon}
                title="No workspaces"
                description="This organization has no workspaces yet."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Open</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orgWorkspaces.map((ws) => (
                    <TableRow key={ws.workspace_id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{ws.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {ws.slug}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{ws.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          render={
                            <Link href={`/admin/workspaces/${ws.workspace_id}`} />
                          }
                          nativeButton={false}
                          variant="ghost"
                          size="sm"
                        >
                          Open
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {status !== "active" ? (
        <Alert variant="destructive">
          <AlertTitle>This organization is {status}.</AlertTitle>
          <AlertDescription>
            New verifications cannot be started until the status returns to active.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleDollarSignIcon className="size-4 text-muted-foreground" aria-hidden />
            Adjust credits
          </CardTitle>
          <CardDescription>
            Record a manual credit change. Negative amounts remove credit;
            the entry lands in the credit ledger with your user id attached.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={submitAdjust}
            className="grid gap-4 sm:grid-cols-[120px_160px_1fr_auto] sm:items-start"
            noValidate
          >
            <FieldGroup>
              <Field
                data-invalid={
                  (adjustSubmitted && !adjustAmount.trim()) || undefined
                }
              >
                <FieldLabel htmlFor={`adjust-amount-${organizationId}`}>
                  Amount
                </FieldLabel>
                <Input
                  id={`adjust-amount-${organizationId}`}
                  type="number"
                  inputMode="numeric"
                  step={1}
                  value={adjustAmount}
                  onChange={(event) => {
                    setAdjustAmount(event.target.value);
                    if (adjustError) setAdjustError(null);
                  }}
                  placeholder="e.g. 500"
                />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={`adjust-bucket-${organizationId}`}>
                  Bucket
                </FieldLabel>
                <select
                  id={`adjust-bucket-${organizationId}`}
                  className="border-input bg-background text-foreground focus-visible:ring-ring/50 h-10 rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
                  value={adjustBucket}
                  onChange={(event) =>
                    setAdjustBucket(
                      event.target.value as "free" | "subscription" | "purchased",
                    )
                  }
                >
                  <option value="free">Free</option>
                  <option value="subscription">Subscription</option>
                  <option value="purchased">Purchased</option>
                </select>
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field
                data-invalid={
                  (adjustSubmitted && !adjustDescription.trim()) || undefined
                }
              >
                <FieldLabel htmlFor={`adjust-desc-${organizationId}`}>
                  Description
                </FieldLabel>
                <Input
                  id={`adjust-desc-${organizationId}`}
                  value={adjustDescription}
                  onChange={(event) => {
                    setAdjustDescription(event.target.value);
                    if (adjustError) setAdjustError(null);
                  }}
                  placeholder="Manual goodwill credit"
                  maxLength={255}
                />
                <FieldDescription>
                  Use a short reason; it is captured in the audit trail.
                </FieldDescription>
              </Field>
            </FieldGroup>
            <div className="flex items-end">
              <Button type="submit" disabled={adjust.isPending}>
                {adjust.isPending ? (
                  <Loader2Icon data-icon="inline-start" className="animate-spin" aria-hidden />
                ) : (
                  <CircleDollarSignIcon data-icon="inline-start" aria-hidden />
                )}
                Apply adjustment
              </Button>
            </div>
            {adjustError ? (
              <p className="text-destructive text-xs sm:col-span-4">
                {adjustError}
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SnapshotRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-muted/40 flex items-center justify-between rounded-md border px-3 py-2">
      <span className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </span>
      <span className="text-foreground font-mono text-sm">
        {value.toLocaleString()}
      </span>
    </div>
  );
}