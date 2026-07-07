"use client";

import NextLink from "next/link";
import {
  ArrowRightIcon,
  KeyRoundIcon,
  ListTreeIcon,
  ScanSearchIcon,
  TerminalIcon,
  WorkflowIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Metric } from "@/components/dashboard/metric";
import { StatusPill } from "@/components/status-pill";

import { apiClient } from "@/lib/api-client";
import { useClientSession } from "@/lib/hooks/use-client-session";
import { cn } from "@/lib/utils";

import { Cadence } from "./cadence";

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-72 lg:col-span-2" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}

export function OverviewDashboard({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const session = useClientSession();

  const keysQuery = useQuery({
    queryKey: ["workspace-api-keys", workspaceId, "all"],
    queryFn: () => apiClient.listWorkspaceApiKeys(workspaceId, { includeRevoked: true }),
    enabled: session.data?.authenticated,
  });

  const workflowsQuery = useQuery({
    queryKey: ["workspace-workflows", workspaceId],
    queryFn: () => apiClient.listWorkspaceWorkflows(workspaceId),
    enabled: session.data?.authenticated,
  });

  const summaryQuery = useQuery({
    queryKey: ["workspace-verification-summary", workspaceId],
    queryFn: () => apiClient.getWorkspaceVerificationSummary(workspaceId),
    enabled: session.data?.authenticated,
  });

  const isLoading =
    keysQuery.isLoading ||
    workflowsQuery.isLoading ||
    summaryQuery.isLoading;

  if (!session.data?.authenticated || isLoading) {
    return <DashboardSkeleton />;
  }

  const keys = keysQuery.data ?? [];
  const workflows = workflowsQuery.data ?? [];
  const summary = summaryQuery.data;
  const reviews = summary?.recent_reviews ?? [];

  const activeKeys = keys.filter((k) => !k.revoked_at).length;
  const pendingReviews = summary?.by_status.manual_review ?? 0;
  const cadenceBars =
    summary?.recent_sessions.map((sessionItem) => ({
      status: sessionItem.status,
    })) ?? [];

  return (
    <div className="flex flex-col gap-10">
      <Cadence sessions={cadenceBars} counts={summary?.by_status} />

      <section
        className="grid gap-4 sm:grid-cols-3"
        aria-label="Workspace metrics"
      >
        <Metric
          label="Active keys"
          value={activeKeys}
          icon={KeyRoundIcon}
          description={
            activeKeys === 0
              ? "Issue a key to start sending sessions"
              : `${keys.length} total, ${activeKeys} active`
          }
        />
        <Metric
          label="Verification policies"
          value={workflows.length}
          icon={WorkflowIcon}
          description={
            workflows.length === 0
              ? "No workflows yet"
              : "Sets the checks each session runs"
          }
        />
        <Metric
          label="Needs your review"
          value={pendingReviews}
          icon={ScanSearchIcon}
          description={
            pendingReviews === 0
              ? "Queue is clear"
              : "Oldest session first"
          }
        />
      </section>

      <section
        className="grid gap-6 lg:grid-cols-3"
        aria-label="Pipeline and review"
      >
        <Card className="app-shell-panel border border-[var(--dashboard-rule)] ring-0 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">Verification policies</CardTitle>
              <p className="text-sm text-muted-foreground">
                The set of checks each new session will run.
              </p>
            </div>
            <NextLink href={`/dashboard/${workspaceId}/console`} className="shrink-0">
              <Button variant="ghost" size="sm">
                Open console
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </NextLink>
          </CardHeader>
          <CardContent>
            {workflows.length === 0 ? (
              <EmptyPoliciesHint workspaceId={workspaceId} />
            ) : (
              <ul className="flex flex-col divide-y divide-[var(--dashboard-rule)]">
                {workflows.slice(0, 4).map((workflow) => (
                  <li
                    key={workflow.workflow_id}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="font-medium text-sm truncate">
                        {workflow.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {workflow.services.length} service
                        {workflow.services.length === 1 ? "" : "s"} · min age{" "}
                        {workflow.min_age ?? "—"}
                      </span>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                      {workflow.services.map((service) => (
                        <Badge key={service} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </li>
                ))}
                {workflows.length > 4 ? (
                  <li className="pt-3 text-xs text-muted-foreground">
                    +{workflows.length - 4} more in the console
                  </li>
                ) : null}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="app-shell-panel border border-[var(--dashboard-rule)] ring-0">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">Review queue</CardTitle>
              <p className="text-sm text-muted-foreground">
                Sessions waiting on a decision.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No sessions are waiting for your decision. The risk engine
                has approved or rejected everything in flight.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-[var(--dashboard-rule)]">
                {reviews.slice(0, 5).map((item) => (
                  <li
                    key={item.verification_id}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <code className="font-mono text-xs truncate">
                        {item.verification_id.slice(0, 8)}
                      </code>
                      <span className="text-xs text-muted-foreground">
                        {formatRelative(item.created_at)}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusPill status={item.status} />
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {item.risk_score ?? "—"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <section
        className="grid gap-4 sm:grid-cols-3"
        aria-label="Quick actions"
      >
        <QuickAction
          href={`/dashboard/${workspaceId}/api-keys`}
          icon={KeyRoundIcon}
          title="Manage API keys"
          body={
            activeKeys === 0
              ? "Issue your first key to authenticate requests"
              : `Rotate or revoke keys for ${keys.length} credential${keys.length === 1 ? "" : "s"}`
          }
          ctaLabel="Open keys"
        />
        <QuickAction
          href={`/dashboard/${workspaceId}/console`}
          icon={TerminalIcon}
          title="Run a verification"
          body="Open the developer console to start a session and inspect the response."
          ctaLabel="Open console"
        />
        <QuickAction
          href={`/dashboard/${workspaceId}/settings`}
          icon={ListTreeIcon}
          title="Workspace settings"
          body="Update your company name, contact email, or account status."
          ctaLabel="Open settings"
        />
      </section>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  body,
  ctaLabel,
}: {
  href: string;
  icon: typeof KeyRoundIcon;
  title: string;
  body: string;
  ctaLabel: string;
}) {
  return (
    <Card className="app-shell-panel group border border-[var(--dashboard-rule)] ring-0 transition-colors hover:border-[color-mix(in_oklch,var(--dashboard-blue)_42%,var(--dashboard-rule))]">
      <CardContent className="flex h-full flex-col gap-4 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg border border-[var(--dashboard-rule)] bg-[var(--dashboard-canvas)] p-2 text-[var(--dashboard-blue)]">
            <Icon className="size-4" />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="font-medium text-sm">{title}</span>
            <p className="text-xs text-muted-foreground">{body}</p>
          </div>
        </div>
        <NextLink href={href} className="mt-auto">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-full justify-between",
              "group-hover:border-foreground/40",
            )}
          >
            {ctaLabel}
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </NextLink>
      </CardContent>
    </Card>
  );
}

function EmptyPoliciesHint({ workspaceId }: { workspaceId: string }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-[var(--dashboard-rule)] bg-[var(--dashboard-canvas)] p-5">
      <div className="flex items-center gap-2 text-sm font-medium">
        <WorkflowIcon className="size-4 text-muted-foreground" />
        No policies yet
      </div>
      <p className="text-xs text-muted-foreground">
        A workflow bundles the AI checks a session runs (selfie, document,
        liveness, age). Without one, the API cannot start a verification.
        Open the console to create your first policy.
      </p>
      <NextLink href={`/dashboard/${workspaceId}/console`}>
        <Button size="sm" variant="outline">
          Create a policy
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </NextLink>
    </div>
  );
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} d ago`;
}
