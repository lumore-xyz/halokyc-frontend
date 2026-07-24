"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ActivityIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  ShieldAlertIcon,
  ListChecksIcon,
  RotateCcwIcon,
  SearchIcon,
} from "lucide-react";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";

import { AppShell } from "@/components/dashboard/app-shell";
import { Metric } from "@/components/dashboard/metric";
import { RouteGuard } from "@/components/dashboard/route-guard";
import { EmptyState } from "@/components/empty-state";
import { StatusPill } from "@/components/status-pill";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  apiClient,
  type VerificationListItem,
  type VerificationStatus,
} from "@/lib/api-client";
import { formatDate, scoreLabel } from "@/lib/format";
import { useClientSession } from "@/lib/hooks/use-client-session";
import { cn } from "@/lib/utils";

const ALL_STATUSES: VerificationStatus[] = [
  "pending_upload",
  "awaiting_credits",
  "processing",
  "approved",
  "rejected",
  "manual_review",
];

const STATUS_LABEL: Record<VerificationStatus, string> = {
  pending_upload: "Awaiting upload",
  awaiting_credits: "Awaiting credits",
  processing: "Processing",
  approved: "Approved",
  rejected: "Rejected",
  manual_review: "Needs review",
};

const PAGE_SIZE = 25;

type FilterForm = {
  status: "" | VerificationStatus;
  external_user_id: string;
  since: string;
  until: string;
};

function readFilters(params: URLSearchParams): FilterForm & { page: number } {
  const statusRaw = params.get("status") ?? "";
  const status = ALL_STATUSES.includes(statusRaw as VerificationStatus)
    ? (statusRaw as VerificationStatus)
    : "";
  return {
    status,
    external_user_id: params.get("external_user_id") ?? "",
    since: params.get("since") ?? "",
    until: params.get("until") ?? "",
    page: Math.max(1, Number(params.get("page") ?? "1") || 1),
  };
}

function applyFilters(filters: FilterForm, page: number) {
  const offset = (page - 1) * PAGE_SIZE;
  return {
    status: filters.status ? filters.status : undefined,
    external_user_id: filters.external_user_id.trim() || undefined,
    since: filters.since || undefined,
    until: filters.until || undefined,
    limit: PAGE_SIZE,
    offset,
  };
}

export function SessionsManager({ workspaceId }: { workspaceId: string }) {
  const session = useClientSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = session.data?.organizationRole ?? null;
  const canViewSubject =
    role === "client_owner" ||
    role === "client_admin" ||
    role === "client_reviewer";

  const initial = useMemo(() => readFilters(searchParams), [searchParams]);
  const [form, setForm] = useState<FilterForm>({
    status: initial.status,
    external_user_id: initial.external_user_id,
    since: initial.since,
    until: initial.until,
  });

  const query = useQuery({
    queryKey: ["workspace-verifications", workspaceId, initial],
    queryFn: () =>
      apiClient.listWorkspaceVerifications(
        workspaceId,
        applyFilters(initial, initial.page),
      ),
    enabled: session.data?.authenticated,
  });

  function writeParams(next: FilterForm & { page?: number }) {
    const params = new URLSearchParams();
    if (next.status) params.set("status", next.status);
    if (next.external_user_id.trim()) {
      params.set("external_user_id", next.external_user_id.trim());
    }
    if (next.since) params.set("since", next.since);
    if (next.until) params.set("until", next.until);
    if (next.page && next.page > 1) params.set("page", String(next.page));
    const qs = params.toString();
    router.push(
      qs
        ? `/dashboard/${workspaceId}/sessions?${qs}`
        : `/dashboard/${workspaceId}/sessions`,
    );
  }

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    writeParams({ ...form, page: 1 });
  }

  function reset() {
    setForm({
      status: "",
      external_user_id: "",
      since: "",
      until: "",
    });
    router.push(`/dashboard/${workspaceId}/sessions`);
  }

  function setPage(page: number) {
    writeParams({ ...form, page });
  }

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const startIndex = total === 0 ? 0 : (initial.page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(startIndex + items.length - 1, total);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Activity
        </span>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-semibold tracking-tight">
              Verification activity
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Read-only log of every verification your integration has started.
              Filter by status, date, or external user id. Click any row to
              inspect its checks.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
          >
            <RotateCcwIcon data-icon="inline-start" />
            Refresh
          </Button>
        </div>
      </header>

      <form
        onSubmit={apply}
        aria-label="Filter verifications"
        className="bg-card flex flex-col gap-4 rounded-2xl border p-4 md:p-6"
      >
        <FieldGroup>
          <Field>
            <FieldLabel>Status</FieldLabel>
            <div
              role="group"
              aria-label="Status filter"
              className="flex flex-wrap gap-2"
            >
              {ALL_STATUSES.map((status) => {
                const active = form.status === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        status: active ? "" : status,
                      }))
                    }
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                    )}
                  >
                    {STATUS_LABEL[status]}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="filter-external-user-id">
              External user id
            </FieldLabel>
            <div className="relative">
              <SearchIcon className="text-muted-foreground absolute top-1/2 left-2 size-3.5 -translate-y-1/2" />
              <Input
                id="filter-external-user-id"
                value={form.external_user_id}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    external_user_id: event.target.value,
                  }))
                }
                placeholder="user_123"
                className="pl-7"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <FieldDescription>
              Exact match. Use the value the requesting service sent as the
              external user id.
            </FieldDescription>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="filter-since">From</FieldLabel>
              <Input
                id="filter-since"
                type="datetime-local"
                value={form.since}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    since: event.target.value,
                  }))
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="filter-until">To</FieldLabel>
              <Input
                id="filter-until"
                type="datetime-local"
                value={form.until}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    until: event.target.value,
                  }))
                }
              />
            </Field>
          </div>
        </FieldGroup>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
          <Button type="submit" size="sm">
            <FilterIcon data-icon="inline-start" />
            Apply filters
          </Button>
        </div>
      </form>

      <section
        className="grid gap-4 sm:grid-cols-3"
        aria-label="Activity metrics"
      >
        <Metric
          label="Total matches"
          value={query.isLoading ? "—" : total}
          icon={ListChecksIcon}
          description="Sessions matching the current filter"
        />
        <Metric
          label="Oldest match"
          value={
            query.isLoading || items.length === 0
              ? "—"
              : formatDate(items[items.length - 1].created_at)
          }
          icon={ActivityIcon}
          description="Oldest session visible on this page"
        />
        <Metric
          label="Showing"
          value={
            query.isLoading || total === 0
              ? "—"
              : `${startIndex} - ${endIndex} of ${total}`
          }
          icon={ActivityIcon}
          description={
            total === 0 ? "No matches" : `Page ${initial.page} of ${totalPages}`
          }
        />
      </section>

      {query.isLoading ? (
        <Skeleton className="h-64" />
      ) : query.error ? (
        <Alert variant="destructive">
          <AlertTitle>Activity could not be loaded</AlertTitle>
          <AlertDescription>
            Your session may have expired. Try refreshing; if it still fails,
            sign in again.
          </AlertDescription>
        </Alert>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ActivityIcon}
          title={
            hasAnyFilter(initial)
              ? "No sessions match these filters"
              : "No verification activity yet"
          }
          description={
            hasAnyFilter(initial)
              ? "Try widening the date range or clearing the external user id."
              : "Once your integration starts sending sessions, each one will appear here."
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
            <CardDescription>
              Newest first. Click a row to inspect the session in detail with
              uploaded files and check results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Verification</TableHead>
                    <TableHead>External user id</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk score</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Subject</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <SessionRow
                      key={item.verification_id}
                      item={item}
                      workspaceId={workspaceId}
                      canViewSubject={canViewSubject}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {total > 0 ? (
        <nav
          className="flex items-center justify-between gap-2"
          aria-label="Pagination"
        >
          <span className="text-muted-foreground font-mono text-xs tabular-nums">
            {startIndex} - {endIndex} of {total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage(initial.page - 1)}
              disabled={initial.page <= 1}
            >
              <ChevronLeftIcon data-icon="inline-start" />
              Previous
            </Button>
            <span className="font-mono text-xs tabular-nums">
              Page {initial.page} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage(initial.page + 1)}
              disabled={initial.page >= totalPages}
            >
              Next
              <ChevronRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}

function SessionRow({
  item,
  workspaceId,
  canViewSubject,
}: {
  item: VerificationListItem;
  workspaceId: string;
  canViewSubject: boolean;
}) {
  return (
    <TableRow>
      <TableCell className="font-mono text-xs">
        <Button
          render={
            <NextLink
              href={`/dashboard/${workspaceId}/sessions/${item.verification_id}`}
            />
          }
          nativeButton={false}
          variant="link"
          className="h-auto p-0 font-mono text-xs"
        >
          {item.verification_id}
        </Button>
      </TableCell>
      <TableCell className="font-mono text-xs">
        {item.external_user_id}
      </TableCell>
      <TableCell>
        <StatusPill status={item.status} />
      </TableCell>
      <TableCell className="font-mono text-sm">
        {scoreLabel(item.risk_score)}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {format(new Date(item.created_at), "PPp")}
      </TableCell>
      <TableCell>
        {canViewSubject ? (
          <Button
            render={
              <NextLink
                href={`/dashboard/${workspaceId}/subjects/${encodeURIComponent(item.external_user_id)}`}
              />
            }
            nativeButton={false}
            variant="ghost"
            size="sm"
          >
            <ShieldAlertIcon data-icon="inline-start" />
            Subject
          </Button>
        ) : (
          <span className="text-muted-foreground text-xs">Hidden</span>
        )}
      </TableCell>
    </TableRow>
  );
}

function hasAnyFilter(filters: FilterForm & { page: number }): boolean {
  return Boolean(
    filters.status ||
    filters.external_user_id.trim() ||
    filters.since ||
    filters.until,
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return (
    <AppShell audience="client">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
        <RouteGuard
          workspaceId={workspaceId}
          allowedRoles={[
            "client_owner",
            "client_admin",
            "client_reviewer",
            "client_developer",
          ]}
          fallbackHref={`/dashboard/${workspaceId}`}
        >
          <Suspense fallback={<SessionsPageFallback />}>
            <SessionsManager workspaceId={workspaceId} />
          </Suspense>
        </RouteGuard>
      </main>
    </AppShell>
  );
}

function SessionsPageFallback() {
  return (
    <>
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-56 rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </>
  );
}
