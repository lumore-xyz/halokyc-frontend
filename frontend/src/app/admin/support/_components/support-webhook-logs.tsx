"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { WebhookIcon } from "lucide-react";
import { formatDate } from "@/lib/format";
import { useAdminSupportWebhookLogs } from "@/lib/hooks/use-admin-console";

export function AdminSupportWebhookLogs() {
  const query = useAdminSupportWebhookLogs({ limit: 100 });

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  const logs = query.data ?? [];
  if (logs.length === 0) {
    return (
      <EmptyState
        icon={WebhookIcon}
        title="No webhook deliveries"
        description="No webhook events fired in the current window."
      />
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Verification</TableHead>
          <TableHead>Target</TableHead>
          <TableHead>HTTP status</TableHead>
          <TableHead>Attempts</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last attempt</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell>
              <span className="font-mono text-xs">
                {log.verification_id.slice(0, 8)}…
              </span>
            </TableCell>
            <TableCell className="max-w-sm truncate text-xs">
              {log.target_url}
            </TableCell>
            <TableCell>
              {log.http_status === null ? (
                <span className="text-muted-foreground text-xs">—</span>
              ) : (
                <Badge
                  variant={
                    log.http_status >= 200 && log.http_status < 300
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {log.http_status}
                </Badge>
              )}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {log.attempt_count}
            </TableCell>
            <TableCell>
              <Badge variant={log.delivered ? "secondary" : "destructive"}>
                {log.delivered ? "Delivered" : "Failed"}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {formatDate(log.updated_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}