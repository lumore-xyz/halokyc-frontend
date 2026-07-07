"use client";

import { BoxesIcon, FilterIcon, RefreshCwIcon } from "lucide-react";
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
  useAdminWorkspaces,
} from "@/lib/hooks/use-admin-console";

const STATUS_OPTIONS = ["all", "active", "disabled", "archived"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

export default function AdminWorkspacesPage() {
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
          <WorkspacesList />
        </PlatformRouteGuard>
      </main>
    </AppShell>
  );
}

function WorkspacesList() {
  const query = useAdminWorkspaces();
  const orgs = useAdminOrganizations();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const filtered = useMemo(() => {
    const workspaces = query.data ?? [];
    if (filter === "all") return workspaces;
    return workspaces.filter((ws) => ws.status === filter);
  }, [filter, query.data]);

  function orgName(orgId: string) {
    return orgs.data?.find((org) => org.organization_id === orgId)?.name ?? orgId;
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        icon={BoxesIcon}
        title="Workspaces"
        description="Every workspace across every organization. Use the filter to surface disabled or archived workspaces."
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>All workspaces</CardTitle>
              <CardDescription>
                Cross-tenant view for support and billing investigations.
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
              icon={BoxesIcon}
              title="No workspaces match"
              description="Try a different status filter or wait for new organizations to onboard."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((ws) => (
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
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{orgName(ws.organization_id)}</span>
                        <span className="text-muted-foreground font-mono text-xs">
                          {ws.organization_id.slice(0, 8)}…
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ws.status === "active" ? "secondary" : "outline"}>
                        {ws.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(ws.created_at)}
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
  );
}