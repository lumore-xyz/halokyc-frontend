"use client";

import { BoxesIcon, Building2Icon, ScanSearchIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

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
  useAdminOrganization,
  useAdminVerifications,
  useAdminWorkspace,
} from "@/lib/hooks/use-admin-console";

export default function AdminWorkspaceDetailPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;
  return (
    <AppShell audience="admin">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
        <PlatformRouteGuard
          allowedRoles={[
            "platform_owner",
            "platform_business_admin",
            "platform_support",
          ]}
          fallbackHref="/admin/workspaces"
        >
          <WorkspaceDetailBody workspaceId={workspaceId} />
        </PlatformRouteGuard>
      </main>
    </AppShell>
  );
}

function WorkspaceDetailBody({ workspaceId }: { workspaceId: string }) {
  const workspace = useAdminWorkspace(workspaceId);
  const orgId = workspace.data?.organization_id ?? null;
  const org = useAdminOrganization(orgId);
  const verifications = useAdminVerifications({ limit: 50 });

  const wsVerifications = (verifications.data?.items ?? []).filter(
    (item) => item.verification_id,
  );

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        icon={BoxesIcon}
        title={workspace.data?.name ?? "Workspace"}
        description={
          workspace.data
            ? `Workspace id ${workspace.data.workspace_id}. Slug ${workspace.data.slug}.`
            : "Loading workspace details…"
        }
        meta={
          workspace.data ? (
            <Badge
              variant={
                workspace.data.status === "active" ? "secondary" : "outline"
              }
            >
              {workspace.data.status}
            </Badge>
          ) : null
        }
        actions={
          <Button render={<Link href="/admin/workspaces" />} nativeButton={false} variant="outline">
            Back to workspaces
          </Button>
        }
      />

      {workspace.isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : !workspace.data ? (
        <EmptyState
          icon={BoxesIcon}
          title="Workspace not found"
          description="It may have been removed, or your role cannot view this record."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2Icon className="size-4 text-muted-foreground" aria-hidden />
                Organization
              </CardTitle>
              <CardDescription>
                Cross-link back to the parent organization for billing and members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {org.isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : org.data ? (
                <div className="flex flex-col gap-2">
                  <span className="text-lg font-semibold">{org.data.name}</span>
                  <span className="text-muted-foreground text-xs">
                    Status: {org.data.status} · Created{" "}
                    {formatDate(org.data.created_at)}
                  </span>
                  <Button
                    render={
                      <Link
                        href={`/admin/organizations/${org.data.organization_id}`}
                      />
                    }
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                    className="w-fit"
                  >
                    Open organization
                  </Button>
                </div>
              ) : (
                <EmptyState
                  icon={Building2Icon}
                  title="Organization missing"
                  description="The owning organization could not be loaded."
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScanSearchIcon className="size-4 text-muted-foreground" aria-hidden />
                Latest verifications
              </CardTitle>
              <CardDescription>
                Most recent sessions across the workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {verifications.isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : wsVerifications.length === 0 ? (
                <EmptyState
                  icon={ScanSearchIcon}
                  title="No sessions yet"
                  description="New sessions will appear as soon as the workspace starts running traffic."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Verification</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wsVerifications.slice(0, 5).map((item) => (
                      <TableRow key={item.verification_id}>
                        <TableCell>
                          <Link
                            href={`/admin/verifications/${item.verification_id}`}
                            className="font-mono text-xs hover:underline"
                          >
                            {item.verification_id.slice(0, 8)}…
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.status}</Badge>
                        </TableCell>
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
        </div>
      )}
    </div>
  );
}