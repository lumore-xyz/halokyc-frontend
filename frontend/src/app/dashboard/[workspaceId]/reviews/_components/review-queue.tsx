"use client";

import NextLink from "next/link";
import {
  ArrowRightIcon,
  InboxIcon,
  RefreshCwIcon,
  ScanSearchIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/dashboard/app-shell";
import { Metric } from "@/components/dashboard/metric";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
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
import { EmptyState } from "@/components/empty-state";
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
  type AdminReviewItem,
  type DuplicateMatchKind,
} from "@/lib/api-client";
import { formatDate, scoreLabel } from "@/lib/format";
import { useClientSession } from "@/lib/hooks/use-client-session";

export function ReviewQueue({
  workspaceId,
  reviews: providedReviews,
}: {
  workspaceId: string;
  reviews?: AdminReviewItem[] | undefined;
}) {
  const session = useClientSession();
  const reviewsQuery = useQuery({
    queryKey: ["workspace-reviews", workspaceId],
    queryFn: () => apiClient.listWorkspaceReviews(workspaceId),
    enabled: session.data?.authenticated,
  });

  const isExternallyProvided = providedReviews !== undefined;
  const items = isExternallyProvided ? providedReviews : reviewsQuery.data ?? [];
  const isLoading = isExternallyProvided ? false : reviewsQuery.isLoading;
  const error = isExternallyProvided ? null : reviewsQuery.error;
  const refetch = () => {
    if (!isExternallyProvided) {
      void reviewsQuery.refetch();
    }
  };
  const isFetching = isExternallyProvided ? false : reviewsQuery.isFetching;

  const oldest = items[0];
  const highestScore = items.reduce<number | null>(
    (acc, item) =>
      typeof item.risk_score === "number" && (acc === null || item.risk_score > acc)
        ? item.risk_score
        : acc,
    null,
  );

  return (
    <AppShell audience="client">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-3">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Manual review
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-3xl font-semibold tracking-tight">
                Review queue
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Sessions the risk engine could not decide automatically. Open
                one to review its evidence and approve or reject.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={isFetching}
            >
              <RefreshCwIcon data-icon="inline-start" />
              Refresh
            </Button>
          </div>
        </header>

        <section
          className="grid gap-4 sm:grid-cols-3"
          aria-label="Queue metrics"
        >
          <Metric
            label="Waiting"
            value={isLoading ? "—" : items.length}
            icon={InboxIcon}
            description={
              items.length === 0 ? "Queue is clear" : "Sessions needing review"
            }
          />
          <Metric
            label="Oldest in queue"
            value={
              isLoading || !oldest
                ? "—"
                : formatDate(oldest.created_at)
            }
            icon={ScanSearchIcon}
            description={
              oldest ? "Opened first" : "Nothing pending"
            }
          />
          <Metric
            label="Highest risk score"
            value={
              isLoading
                ? "—"
                : highestScore === null
                  ? "—"
                  : scoreLabel(highestScore)
            }
            icon={ArrowRightIcon}
            description={
              highestScore === null
                ? "No scores yet"
                : "Worst-confidence session in queue"
            }
          />
        </section>

        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Queue could not be loaded</AlertTitle>
            <AlertDescription>
              Your session may have expired. Try refreshing; if it still
              fails, sign in again.
            </AlertDescription>
          </Alert>
        ) : items.length === 0 ? (
          <EmptyState
            icon={InboxIcon}
            title="No sessions need review"
            description="The risk engine has approved or rejected everything in flight."
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {items.length} session{items.length === 1 ? "" : "s"} awaiting
                your decision
              </CardTitle>
              <CardDescription>
                Ordered oldest first. Click any row to open the evidence and
                approve or reject.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Verification</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Risk score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Policy</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.verification_id}>
                        <TableCell className="font-mono text-xs">
                          {item.verification_id}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(item.created_at)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {scoreLabel(item.risk_score)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Needs review</Badge>
                        </TableCell>
                        <TableCell>
                          {item.duplicate_match_kind ? (
                            <Badge
                              variant={
                                item.duplicate_match_kind === "ban_match"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {formatDuplicateMatchKind(
                                item.duplicate_match_kind,
                              )}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            render={
                              <NextLink
                                href={`/dashboard/${workspaceId}/reviews/${item.verification_id}`}
                              />
                            }
                            nativeButton={false}
                            variant="outline"
                            size="sm"
                          >
                            Open
                            <ArrowRightIcon data-icon="inline-end" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </AppShell>
  );
}

function formatDuplicateMatchKind(kind: DuplicateMatchKind): string {
  if (kind === "ban_match") return "Ban match";
  if (kind === "same_external_user") return "Same external user";
  return "Ambiguous duplicate";
}
