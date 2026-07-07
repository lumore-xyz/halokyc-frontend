"use client";

import { Building2Icon, FilterIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import {
  useAdminOrganizations,
  useAdminSalesCustomers,
} from "@/lib/hooks/use-admin-console";

const STATUS_OPTIONS = ["all", "active", "suspended", "disabled"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

export default function AdminOrganizationsPage() {
  return (
    <AppShell audience="admin">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
        <PlatformRouteGuard
          allowedRoles={[
            "platform_owner",
            "platform_business_admin",
            "platform_support",
          ]}
          fallbackHref="/admin"
        >
          <OrganizationsList />
        </PlatformRouteGuard>
      </main>
    </AppShell>
  );
}

function OrganizationsList() {
  const query = useAdminOrganizations();
  const sales = useAdminSalesCustomers();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const filtered = useMemo(() => {
    const orgs = query.data ?? [];
    if (filter === "all") return orgs;
    return orgs.filter((org) => org.status === filter);
  }, [filter, query.data]);

  const planFor = (organizationId: string) =>
    sales.data?.find((customer) => customer.organization_id === organizationId)
      ?.plan ?? null;

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        icon={Building2Icon}
        title="Organizations"
        description="Every customer company in the platform. Open one to see its workspaces, members, billing, and audit history."
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>All organizations</CardTitle>
              <CardDescription>
                Filter by account status to drill into active or suspended accounts.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-muted-foreground flex items-center gap-2 text-sm">
                <FilterIcon data-icon="inline-start" aria-hidden /> Status
                <select
                  className="border-input bg-background text-foreground focus-visible:ring-ring/50 h-9 rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px]"
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value as StatusFilter)
                  }
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "All statuses" : option}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => query.refetch()}
              >
                <RefreshCwIcon data-icon="inline-start" aria-hidden /> Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Building2Icon}
              title="No organizations match"
              description="Try a different status filter or wait for new clients to onboard."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Billing email</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((org) => (
                  <TableRow key={org.organization_id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{org.name}</span>
                        <span className="text-muted-foreground font-mono text-xs">
                          {org.organization_id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          org.status === "active"
                            ? "secondary"
                            : org.status === "suspended"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {org.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {planFor(org.organization_id) ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {org.billing_email ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(org.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        render={
                          <Link href={`/admin/organizations/${org.organization_id}`} />
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
  );
}