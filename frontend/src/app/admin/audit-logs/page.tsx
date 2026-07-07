"use client";

import { ScrollTextIcon } from "lucide-react";

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
import { useAdminAuditLogs } from "@/lib/hooks/use-admin-console";

export default function AdminAuditLogsPage() {
  return (
    <AppShell audience="admin">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
        <PlatformRouteGuard
          allowedRoles={["platform_owner", "platform_business_admin"]}
          fallbackHref="/admin"
        >
          <AuditLogsBody />
        </PlatformRouteGuard>
      </main>
    </AppShell>
  );
}

function AuditLogsBody() {
  const query = useAdminAuditLogs({ limit: 200 });

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        icon={ScrollTextIcon}
        title="Audit logs"
        description="The platform-wide append-only audit trail. Owner and business admin only. Newest first."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => query.refetch()}
          >
            Refresh
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            Includes credit adjustments, organization status changes,
            sales notes, support notes, and platform admin actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (query.data?.length ?? 0) === 0 ? (
            <EmptyState
              icon={ScrollTextIcon}
              title="No audit events yet"
              description="Wait for platform actions (credit adjustments, org status changes, sales notes, support notes) to populate this list."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Old</TableHead>
                  <TableHead>New</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data?.map((log, index) => (
                  <TableRow key={`${log.action}-${index}-${log.created_at}`}>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs">
                      {log.old_value ? (
                        <code className="text-muted-foreground">
                          {JSON.stringify(log.old_value)}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs">
                      {log.new_value ? (
                        <code className="text-muted-foreground">
                          {JSON.stringify(log.new_value)}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(log.created_at)}
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