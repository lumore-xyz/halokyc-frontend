"use client";

import {
  ActivityIcon,
  Building2Icon,
  CircleDollarSignIcon,
  ShoppingCartIcon,
  StickyNoteIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FormEvent } from "react";

import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { AppShell } from "@/components/dashboard/app-shell";
import { PlatformRouteGuard } from "@/components/dashboard/platform-route-guard";
import { EmptyState } from "@/components/empty-state";
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
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import {
  useAdminSalesCustomers,
  useCreateAdminSalesNote,
} from "@/lib/hooks/use-admin-console";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PLAN_OPTIONS = ["starter", "growth", "scale", "enterprise", "unknown"] as const;
type SalesPlan = (typeof PLAN_OPTIONS)[number];

export default function AdminSalesPage() {
  return (
    <AppShell audience="admin">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
        <PlatformRouteGuard
          allowedRoles={["platform_owner", "platform_business_admin"]}
          fallbackHref="/admin"
        >
          <SalesHub />
        </PlatformRouteGuard>
      </main>
    </AppShell>
  );
}

function SalesHub() {
  const customers = useAdminSalesCustomers();
  const create = useCreateAdminSalesNote();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const noteError = submitted && !note.trim() ? "Note text is required." : null;

  const planSummary = useMemo(() => {
    const counts = new Map<SalesPlan, number>();
    PLAN_OPTIONS.forEach((plan) => counts.set(plan, 0));
    (customers.data ?? []).forEach((customer) => {
      const plan = (PLAN_OPTIONS as readonly string[]).includes(
        customer.plan ?? "unknown",
      )
        ? ((customer.plan ?? "unknown") as SalesPlan)
        : "unknown";
      counts.set(plan, (counts.get(plan) ?? 0) + 1);
    });
    return counts;
  }, [customers.data]);

  const totalAvailable = useMemo(
    () =>
      (customers.data ?? []).reduce(
        (sum, customer) => sum + customer.available_credits,
        0,
      ),
    [customers.data],
  );

  function submitNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!organizationId) {
      toast.error("Pick an organization first");
      return;
    }
    if (noteError) return;
    create.mutate(
      { organization_id: organizationId, note: note.trim() },
      {
        onSuccess: () => {
          toast.success("Sales note saved");
          setNote("");
          setSubmitted(false);
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            toast.error(`Could not save note: ${err.status}`);
          } else {
            toast.error("Could not save note");
          }
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        icon={ShoppingCartIcon}
        title="Sales"
        description="Customer roster, plan distribution, available-credit summary, and a sales-note capture box."
      />

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Sales summary">
        <PlanCard
          label="Customers"
          value={customers.data?.length ?? 0}
          icon={Building2Icon}
        />
        <PlanCard
          label="Available credits"
          value={totalAvailable.toLocaleString()}
          icon={CircleDollarSignIcon}
        />
        <PlanCard
          label="Plans tracked"
          value={PLAN_OPTIONS.length}
          icon={TrendingUpIcon}
          breakdown={Object.fromEntries(planSummary) as Record<SalesPlan, number>}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="size-4 text-muted-foreground" aria-hidden />
            Customers
          </CardTitle>
          <CardDescription>
            Plan and credit snapshot for every customer organization.
            Select one to record a sales note.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customers.isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (customers.data?.length ?? 0) === 0 ? (
            <EmptyState
              icon={Building2Icon}
              title="No customers yet"
              description="Customer organizations will appear here once onboarding flows fire."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Available credits</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.data?.map((customer) => (
                  <TableRow
                    key={customer.organization_id}
                    data-active={
                      customer.organization_id === organizationId
                        ? "true"
                        : undefined
                    }
                    className={cn(
                      organizationId === customer.organization_id
                        ? "bg-muted/30"
                        : "",
                    )}
                  >
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{customer.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {customer.billing_email ?? "no billing email"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {customer.plan ?? "no plan"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          customer.status === "active"
                            ? "secondary"
                            : customer.status === "suspended"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {customer.available_credits.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(customer.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={
                          organizationId === customer.organization_id
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setOrganizationId(customer.organization_id)
                        }
                      >
                        Note target
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNoteIcon className="size-4 text-muted-foreground" aria-hidden />
            Sales notes
          </CardTitle>
          <CardDescription>
            Internal-only notes attached to the audit trail. Use them to
            track renewals, inbound leads, and renewal pipeline state.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={submitNote}
            className="flex flex-col gap-4"
            noValidate
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="sales-note-org">
                  Organization
                </FieldLabel>
                <select
                  id="sales-note-org"
                  className="border-input bg-background text-foreground focus-visible:ring-ring/50 h-10 rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
                  value={organizationId ?? ""}
                  onChange={(event) => setOrganizationId(event.target.value || null)}
                >
                  <option value="">Select an organization…</option>
                  {(customers.data ?? []).map((customer) => (
                    <option
                      key={customer.organization_id}
                      value={customer.organization_id}
                    >
                      {customer.name}
                    </option>
                  ))}
                </select>
                <FieldDescription>
                  Click &ldquo;Note target&rdquo; on a customer row to auto-pick.
                </FieldDescription>
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field data-invalid={Boolean(noteError) || undefined}>
                <FieldLabel htmlFor="sales-note-body">Note</FieldLabel>
                <Textarea
                  id="sales-note-body"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Renewal due in 30 days; asked for SOC2 evidence."
                />
                {noteError ? <FieldError>{noteError}</FieldError> : null}
              </Field>
            </FieldGroup>
            <div className="flex justify-end">
              <Button type="submit" disabled={create.isPending || !organizationId}>
                {create.isPending ? "Saving…" : "Save note"}
              </Button>
            </div>
          </form>
          <div className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
            <ActivityIcon className="size-4" aria-hidden />
            New sales notes land in <code>platform_admin_sales_note_created</code> audit rows.
            Visit the customer organization for the full history.
            <Button render={<Link href={`/admin/organizations/${organizationId ?? ""}`} />} nativeButton={false} variant="ghost" size="sm" disabled={!organizationId}>
              Open organization
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PlanCard({
  label,
  value,
  icon: Icon,
  breakdown,
}: {
  label: string;
  value: number | string;
  icon: typeof UsersIcon;
  breakdown?: Record<string, number>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="text-muted-foreground size-4" aria-hidden />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {breakdown ? (
          <ul className="mt-2 flex flex-wrap gap-3 text-xs">
            {Object.entries(breakdown).map(([bucket, count]) => (
              <li key={bucket} className="flex flex-col">
                <span className="text-muted-foreground uppercase tracking-wide">
                  {bucket}
                </span>
                <span className="text-foreground font-mono text-sm">{count}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}