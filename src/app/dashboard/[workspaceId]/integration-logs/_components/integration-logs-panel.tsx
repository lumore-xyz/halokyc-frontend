"use client";

import NextLink from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RefreshCwIcon,
} from "lucide-react";
import { format } from "date-fns";

import { Metric } from "@/components/dashboard/metric";
import { StatusPill } from "@/components/status-pill";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient, type VerificationListItem } from "@/lib/api-client";
import { scoreLabel } from "@/lib/format";
import { useClientSession } from "@/lib/hooks/use-client-session";

const PAGE_SIZE = 25;

export function IntegrationLogsPanel({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const session = useClientSession();
  const list = useQuery({
    queryKey: ["workspace-integrations-logs", workspaceId],
    queryFn: () =>
      apiClient.listWorkspaceVerifications(workspaceId, {
        limit: PAGE_SIZE,
        offset: 0,
      }),
    enabled: Boolean(session.data?.authenticated && workspaceId),
  });

  const items = list.data?.items ?? [];
  const total = list.data?.total ?? 0;

  return (
    <>
      <header className="flex flex-col gap-3">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Integration
        </span>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-semibold tracking-tight">
              Integration logs
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Every verification request your workspace sends. Sensitive
              evidence is intentionally hidden from the developer role.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => list.refetch()}
            disabled={list.isFetching}
          >
            <RefreshCwIcon data-icon="inline-start" />
            Refresh
          </Button>
        </div>
      </header>

      <section
        className="grid gap-4 sm:grid-cols-3"
        aria-label="Integration metrics"
      >
        <Metric
          label="Sessions"
          value={list.isLoading ? "—" : total}
          icon={ActivityIcon}
          description="Total sessions in this workspace"
        />
        <Metric
          label="Showing"
          value={list.isLoading ? "—" : items.length}
          icon={ActivityIcon}
          description="First page of latest sessions"
        />
        <Metric
          label="Last sync"
          value={list.isLoading || items.length === 0 ? "—" : "Just now"}
          icon={ActivityIcon}
          description="Polled on demand from the workspace"
        />
      </section>

      {list.isLoading ? (
        <Card>
          <CardContent className="flex justify-center py-12">
            <Spinner />
          </CardContent>
        </Card>
      ) : list.error ? (
        <Alert variant="destructive">
          <AlertTitle>Logs could not be loaded</AlertTitle>
          <AlertDescription>
            Confirm your session is active and try again.
          </AlertDescription>
        </Alert>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ActivityIcon}
          title="No integration traffic yet"
          description="Once your key starts a verification, the request will appear here."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent sessions</CardTitle>
            <CardDescription>
              Open the full activity log for filter and pagination controls.
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <LogRow key={item.verification_id} item={item} workspaceId={workspaceId} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Pagination total={total} />
    </>
  );
}

function LogRow({
  item,
  workspaceId,
}: {
  item: VerificationListItem;
  workspaceId: string;
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
      <TableCell className="font-mono text-xs">{item.external_user_id}</TableCell>
      <TableCell>
        <StatusPill status={item.status} />
      </TableCell>
      <TableCell className="font-mono text-sm">
        {scoreLabel(item.risk_score)}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {format(new Date(item.created_at), "PPp")}
      </TableCell>
    </TableRow>
  );
}

function Pagination({ total }: { total: number }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (total === 0) return null;
  return (
    <nav className="flex items-center justify-between" aria-label="Pagination">
      <span className="text-muted-foreground text-xs">
        Page 1 of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled>
          <ChevronLeftIcon data-icon="inline-start" />
          Previous
        </Button>
        <Button type="button" variant="outline" size="sm" disabled>
          Next
          <ChevronRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </nav>
  );
}