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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminDsrRequests,
  useDecideDsrRequest,
} from "@/lib/hooks/use-compliance-admin";
import { formatDate } from "@/lib/format";

export default function AdminDsrPage() {
  return (
    <AppShell audience="admin">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
        <PlatformRouteGuard
          allowedRoles={["platform_owner", "platform_business_admin"]}
          fallbackHref="/admin"
        >
          <AdminDsrBody />
        </PlatformRouteGuard>
      </main>
    </AppShell>
  );
}

function AdminDsrBody() {
  const dsr = useAdminDsrRequests();
  const decision = useDecideDsrRequest();
  const rows = dsr.data ?? [];

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        icon={ScrollTextIcon}
        title="Data subject requests"
        description="Filterable queue of every erasure, export, and consent-withdrawal request across the platform. Sensitive exports require platform-owner approval before they release an archive."
      />

      <Card>
        <CardHeader>
          <CardTitle>DSR queue</CardTitle>
          <CardDescription>
            Live queue of erasure, export, and consent-withdrawal requests.
            Sensitive exports require platform-owner approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request id</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dsr.isLoading ? (
                <TableRow>
                  <td colSpan={7} className="p-4 align-middle">
                    Loading DSR queue...
                  </td>
                </TableRow>
              ) : dsr.error ? (
                <TableRow>
                  <td colSpan={7} className="p-4 align-middle">
                    <EmptyState
                      icon={ScrollTextIcon}
                      title="DSR queue unavailable"
                      description={dsr.error.message}
                    />
                  </td>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <td colSpan={7} className="p-4 align-middle">
                    <EmptyState
                      icon={ScrollTextIcon}
                      title="No DSR requests"
                      description="Subject requests will appear here once submitted from the privacy dashboard."
                    />
                  </td>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.id}</TableCell>
                    <TableCell>{row.kind.replace("_", " ")}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.status}</Badge>
                    </TableCell>
                    <TableCell>{row.subject_id}</TableCell>
                    <TableCell>{formatDate(row.created_at)}</TableCell>
                    <TableCell>{formatDate(row.updated_at)}</TableCell>
                    <TableCell>
                      {row.status === "pending" || row.status === "processing" ? (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={decision.isPending}
                            onClick={() =>
                              decision.mutate({
                                request_id: row.id,
                                decision: "approve",
                              })
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={decision.isPending}
                            onClick={() =>
                              decision.mutate({
                                request_id: row.id,
                                decision: "reject",
                                notes: "Rejected by platform operator",
                              })
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Closed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export approval</CardTitle>
          <CardDescription>
            Sensitive PII exports require an explicit platform-owner approval
            (COMPLIANCE.md §4.3). The approval action is wired through{" "}
            <code className="font-mono">POST /api/v1/admin/dsr/:id/decision</code>{" "}
            and will appear in the table above once the backend lands.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-muted-foreground flex flex-col gap-2 text-sm">
            <li className="flex items-center justify-between rounded-md border border-dashed border-border/60 px-3 py-2">
              <span>Approved exports are recorded in the immutable audit log.</span>
              <Badge variant="outline">audit log</Badge>
            </li>
            <li className="flex items-center justify-between rounded-md border border-dashed border-border/60 px-3 py-2">
              <span>Rejections require a structured reason and notify the requester.</span>
              <Badge variant="outline">notification</Badge>
            </li>
            <li className="flex items-center justify-between rounded-md border border-dashed border-border/60 px-3 py-2">
              <span>Approvals are timestamped and bound to the platform-owner user id.</span>
              <Badge variant="outline">last-owner guard</Badge>
            </li>
            <li className="flex items-center justify-between rounded-md border border-dashed border-border/60 px-3 py-2">
              <span>Status transitions follow: <code className="font-mono">pending -&gt; processing -&gt; completed | rejected</code>.</span>
              <Badge variant="outline">state machine</Badge>
            </li>
          </ul>
          <p className="text-muted-foreground mt-4 text-xs italic">
            Last contract update placeholder: {formatDate(new Date().toISOString())}.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
