"use client";

import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TriangleAlertIcon } from "lucide-react";
import { formatDate } from "@/lib/format";
import { useAdminSupportErrorLogs } from "@/lib/hooks/use-admin-console";

export function AdminSupportErrorLogs() {
  const query = useAdminSupportErrorLogs();

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  const logs = query.data ?? [];
  if (logs.length === 0) {
    return (
      <EmptyState
        icon={TriangleAlertIcon}
        title="No platform errors"
        description="The error feed is empty for now."
      />
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Timestamp</TableHead>
          <TableHead>Error</TableHead>
          <TableHead>Context</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log, index) => (
          <TableRow key={`${log.timestamp}-${index}`}>
            <TableCell className="text-muted-foreground text-xs">
              {formatDate(log.timestamp)}
            </TableCell>
            <TableCell className="text-sm font-medium">{log.error}</TableCell>
            <TableCell className="text-muted-foreground max-w-md truncate text-xs">
              {log.context ? JSON.stringify(log.context) : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}