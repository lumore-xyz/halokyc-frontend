"use client";

import Link from "next/link";
import { InboxIcon, RefreshCwIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { StatusPill } from "@/components/status-pill";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, scoreLabel } from "@/lib/format";
import { useAdminReviews } from "@/lib/hooks/use-admin-reviews";
import { useAdminSession } from "@/lib/hooks/use-admin-session";

export function AdminReviewQueue() {
  const session = useAdminSession();
  const reviews = useAdminReviews();

  if (session.isLoading || reviews.isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!session.data?.authenticated) {
    return (
      <EmptyState
        icon={InboxIcon}
        title="Sign in to view the queue"
        description="Admin review uses a secure httpOnly session cookie."
        action={
          <Button render={<Link href="/admin/login" />} nativeButton={false}>Sign in</Button>
        }
      />
    );
  }

  if (reviews.error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Queue could not be loaded</AlertTitle>
        <AlertDescription>
          The admin session may have expired. Sign in again if refresh fails.
        </AlertDescription>
      </Alert>
    );
  }

  if (!reviews.data?.length) {
    return (
      <EmptyState
        icon={InboxIcon}
        title="No sessions need review"
        description="The manual-review queue is clear."
        action={<Button type="button" variant="outline" onClick={() => reviews.refetch()}><RefreshCwIcon data-icon="inline-start" />Refresh</Button>}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{reviews.data.length} waiting</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => reviews.refetch()}>
            <RefreshCwIcon data-icon="inline-start" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Verification ID</TableHead>
                <TableHead className="font-medium">Created</TableHead>
                <TableHead className="font-medium">Risk Score</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="text-right font-medium">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.data.map((item) => (
                <TableRow key={item.verification_id} className="group">
                  <TableCell className="font-mono text-xs">
                    {item.verification_id}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(item.created_at)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {scoreLabel(item.risk_score)}
                  </TableCell>
                  <TableCell>
                    <StatusPill status={item.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      render={<Link href={`/admin/reviews/${item.verification_id}`} />}
                      nativeButton={false}
                      variant="ghost"
                      size="sm"
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

