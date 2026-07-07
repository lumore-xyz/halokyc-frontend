"use client";

import {
  ActivityIcon,
  AlertTriangleIcon,
  BotIcon,
  Building2Icon,
  CircleDollarSignIcon,
  FilterIcon,
  InboxIcon,
  KeyRoundIcon,
  PlusIcon,
  RefreshCwIcon,
  ScanSearchIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  StickyNoteIcon,
  UsersIcon,
  WebhookIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Metric } from "@/components/dashboard/metric";
import { AdminPageHeader, AdminPageSkeleton } from "@/app/admin/_components/admin-page-header";
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
import { useAdminSession } from "@/lib/hooks/use-admin-session";
import {
  useAdminAuditLogs,
  useAdminAgenticMonitoring,
  useAdminBillingCredits,
  useAdminOrganizations,
  useAdminSupportWebhookLogs,
  useAdminVerifications,
  useAdminWorkspaces,
} from "@/lib/hooks/use-admin-console";
import { formatDate } from "@/lib/format";
import type { AgenticMode, AgenticRecommendationFilter } from "@/lib/api-client";

export default function AdminOverviewPage() {
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
          <AdminOverview />
        </PlatformRouteGuard>
      </main>
    </AppShell>
  );
}

function AdminOverview() {
  const session = useAdminSession();
  const orgs = useAdminOrganizations();
  const workspaces = useAdminWorkspaces();
  const credits = useAdminBillingCredits();
  const verifications = useAdminVerifications({ limit: 5 });
  const webhookLogs = useAdminSupportWebhookLogs({ limit: 5 });
  const auditLogs = useAdminAuditLogs({ limit: 5 });
  const [agentWindow, setAgentWindow] = useState("24h");
  const [agentOrganizationId, setAgentOrganizationId] = useState("");
  const [agentWorkspaceId, setAgentWorkspaceId] = useState("");
  const [agentMode, setAgentMode] = useState<"" | AgenticMode>("");
  const [agentRecommendation, setAgentRecommendation] = useState<
    "" | AgenticRecommendationFilter
  >("");
  const agentSince = useMemo(() => windowToSince(agentWindow), [agentWindow]);
  const canSeeProviderMetrics =
    session.data?.platformRole === "platform_owner" ||
    session.data?.platformRole === "platform_business_admin";
  const agenticMetrics = useAdminAgenticMonitoring({
    organizationId: agentOrganizationId || null,
    workspaceId: agentWorkspaceId || null,
    since: agentSince,
    agenticMode: agentMode || null,
    agenticRecommendation: agentRecommendation || null,
  }, { enabled: canSeeProviderMetrics });

  const totalOrgs = orgs.data?.length ?? 0;
  const activeOrgs = useMemo(
    () => orgs.data?.filter((o) => o.status === "active").length ?? 0,
    [orgs.data],
  );
  const suspendedOrgs = useMemo(
    () => orgs.data?.filter((o) => o.status !== "active").length ?? 0,
    [orgs.data],
  );
  const totalAvailable = credits.data?.balance.available_credits ?? 0;
  const totalReserved = credits.data?.balance.reserved_credits ?? 0;
  const scopedWorkspaces = useMemo(
    () =>
      (workspaces.data ?? []).filter((workspace) =>
        agentOrganizationId
          ? workspace.organization_id === agentOrganizationId
          : true,
      ),
    [agentOrganizationId, workspaces.data],
  );

  const failedDeliveries = useMemo(
    () =>
      webhookLogs.data?.filter((log) => log.delivered === false).length ?? 0,
    [webhookLogs.data],
  );

  if (session.isLoading) {
    return <AdminPageSkeleton />;
  }

  if (!session.data?.authenticated) {
    return (
      <EmptyState
        icon={ShieldCheckIcon}
        title="Sign in to view the operator console"
        description="Internal tools require a platform admin session."
        action={
          <Button render={<Link href="/admin/login" />} nativeButton={false}>
            Sign in
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        icon={ShieldCheckIcon}
        title="Platform overview"
        description="At-a-glance health of organizations, verifications, billing, and webhook delivery."
        meta={
          <Badge variant="outline" className="font-mono text-xs">
            {session.data.platformRole}
          </Badge>
        }
      />

      <section
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Platform metrics"
      >
        <Metric
          label="Organizations"
          value={orgs.isLoading ? "-" : totalOrgs}
          icon={Building2Icon}
          description={`${activeOrgs} active · ${suspendedOrgs} suspended`}
          variant="info"
        />
        <Metric
          label="Available credits"
          value={credits.isLoading ? "-" : totalAvailable.toLocaleString()}
          icon={CircleDollarSignIcon}
          description={`${totalReserved.toLocaleString()} reserved platform-wide`}
          variant="success"
        />
        <Metric
          label="Verifications"
          value={verifications.isLoading ? "-" : verifications.data?.total ?? 0}
          icon={ScanSearchIcon}
          description="Total sessions across the platform"
          variant="default"
        />
        <Metric
          label="Webhook deliveries"
          value={webhookLogs.isLoading ? "-" : webhookLogs.data?.length ?? 0}
          icon={WebhookIcon}
          description={`${failedDeliveries} failed in the latest window`}
          variant={failedDeliveries > 0 ? "warning" : "default"}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <InboxIcon className="size-4 text-muted-foreground" aria-hidden />
                  Recent verifications
                </CardTitle>
                <CardDescription>
                  Latest sessions from every workspace.
                </CardDescription>
              </div>
              <Button render={<Link href="/admin/verifications" />} nativeButton={false} variant="outline" size="sm">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {verifications.isLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (verifications.data?.items.length ?? 0) === 0 ? (
              <EmptyState
                icon={ScanSearchIcon}
                title="No verifications yet"
                description="Once clients start sessions they will appear here."
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
                  {verifications.data?.items.map((item) => (
                    <TableRow key={item.verification_id}>
                      <TableCell>
                        <Link
                          href={`/admin/verifications/${item.verification_id}`}
                          className="text-foreground hover:underline"
                        >
                          <span className="font-mono text-xs">
                            {item.verification_id.slice(0, 8)}…
                          </span>
                          <span className="text-muted-foreground block text-xs">
                            {item.external_user_id}
                          </span>
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheckIcon className="size-4 text-muted-foreground" aria-hidden />
                  Latest audit activity
                </CardTitle>
                <CardDescription>
                  Audit-log snapshot for platform-level actions.
                </CardDescription>
              </div>
              <Button render={<Link href="/admin/audit-logs" />} nativeButton={false} variant="outline" size="sm">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {auditLogs.isLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (auditLogs.data?.length ?? 0) === 0 ? (
              <EmptyState
                icon={ActivityIcon}
                title="No audit events yet"
                description="Actions by platform admins will be captured here."
              />
            ) : (
              <ul className="flex flex-col gap-3 text-sm">
                {auditLogs.data?.map((log, index) => (
                  <li
                    key={`${log.action}-${index}-${log.created_at}`}
                    className="flex flex-col gap-1 border-b pb-3 last:border-b-0 last:pb-0"
                  >
                    <span className="font-medium">{log.action}</span>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(log.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {canSeeProviderMetrics ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BotIcon className="text-muted-foreground size-4" aria-hidden />
                  Agentic rollout health
                </CardTitle>
                <CardDescription>
                  Provider fallback, validation, and auto-decision volume for
                  the selected operating window.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Agentic metrics time window"
                  className="border-input bg-background text-foreground focus-visible:ring-ring/50 h-9 rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px]"
                  value={agentWindow}
                  onChange={(event) => setAgentWindow(event.target.value)}
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="all">All time</option>
                </select>
                <select
                  aria-label="Agentic metrics organization"
                  className="border-input bg-background text-foreground focus-visible:ring-ring/50 h-9 rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px]"
                  value={agentOrganizationId}
                  onChange={(event) => {
                    setAgentOrganizationId(event.target.value);
                    setAgentWorkspaceId("");
                  }}
                >
                  <option value="">All organizations</option>
                  {orgs.data?.map((organization) => (
                    <option
                      key={organization.organization_id}
                      value={organization.organization_id}
                    >
                      {organization.name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Agentic metrics workspace"
                  className="border-input bg-background text-foreground focus-visible:ring-ring/50 h-9 rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px]"
                  value={agentWorkspaceId}
                  onChange={(event) => setAgentWorkspaceId(event.target.value)}
                >
                  <option value="">All workspaces</option>
                  {scopedWorkspaces.map((workspace) => (
                    <option
                      key={workspace.workspace_id}
                      value={workspace.workspace_id}
                    >
                      {workspace.name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Agentic metrics mode"
                  className="border-input bg-background text-foreground focus-visible:ring-ring/50 h-9 rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px]"
                  value={agentMode}
                  onChange={(event) =>
                    setAgentMode(event.target.value as "" | AgenticMode)
                  }
                >
                  <option value="">All modes</option>
                  <option value="disabled">Disabled</option>
                  <option value="shadow">Shadow</option>
                  <option value="assist_review">Assist review</option>
                  <option value="auto_decide">Auto decide</option>
                </select>
                <select
                  aria-label="Agentic metrics recommendation"
                  className="border-input bg-background text-foreground focus-visible:ring-ring/50 h-9 rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px]"
                  value={agentRecommendation}
                  onChange={(event) =>
                    setAgentRecommendation(
                      event.target.value as "" | AgenticRecommendationFilter,
                    )
                  }
                >
                  <option value="">All recommendations</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="manual_review">Manual review</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AgentMetric
              label="Provider failure rate"
              value={
                agenticMetrics.isLoading
                  ? "-"
                  : formatPercent(
                      agenticMetrics.data?.totals.provider_failure_rate ?? 0,
                    )
              }
              description={`${agenticMetrics.data?.totals.provider_failures ?? 0} provider fallbacks`}
            />
            <AgentMetric
              label="Budget fallbacks"
              value={
                agenticMetrics.isLoading
                  ? "-"
                  : agenticMetrics.data?.totals.budget_fallbacks ?? 0
              }
              description="Deterministic fallback after budget guard"
            />
            <AgentMetric
              label="Invalid output fallbacks"
              value={
                agenticMetrics.isLoading
                  ? "-"
                  : agenticMetrics.data?.totals.invalid_output_fallbacks ?? 0
              }
              description="Schema validation failed closed"
            />
            <AgentMetric
              label="Auto decisions"
              value={
                agenticMetrics.isLoading
                  ? "-"
                  : agenticMetrics.data?.totals.auto_decisions ?? 0
              }
              description={`${agenticMetrics.data?.totals.agentic_reviews ?? 0} agentic reviews`}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRoundIcon className="size-4 text-muted-foreground" aria-hidden />
            Operator shortcuts
          </CardTitle>
          <CardDescription>
            Common tasks for your platform role.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Button render={<Link href="/admin/organizations" />} nativeButton={false} variant="outline">
            <Building2Icon data-icon="inline-start" aria-hidden /> Organizations
          </Button>
          <Button render={<Link href="/admin/workspaces" />} nativeButton={false} variant="outline">
            <FilterIcon data-icon="inline-start" aria-hidden /> Workspaces
          </Button>
          <Button render={<Link href="/admin/billing" />} nativeButton={false} variant="outline">
            <CircleDollarSignIcon data-icon="inline-start" aria-hidden /> Billing & credits
          </Button>
          <Button render={<Link href="/admin/support" />} nativeButton={false} variant="outline">
            <StickyNoteIcon data-icon="inline-start" aria-hidden /> Support notes
          </Button>
          <Button render={<Link href="/admin/sales" />} nativeButton={false} variant="outline">
            <ShoppingCartIcon data-icon="inline-start" aria-hidden /> Sales
          </Button>
          <Button render={<Link href="/admin/reviews" />} nativeButton={false} variant="outline">
            <InboxIcon data-icon="inline-start" aria-hidden /> Review queue
          </Button>
          <Button render={<Link href="/admin/ledger" />} nativeButton={false} variant="outline">
            <ActivityIcon data-icon="inline-start" aria-hidden /> Platform ledger
          </Button>
          <Button render={<Link href="/admin/platform-admins" />} nativeButton={false} variant="outline">
            <UsersIcon data-icon="inline-start" aria-hidden /> Platform admins
          </Button>
          <Button render={<Link href="/admin/audit-logs" />} nativeButton={false} variant="outline">
            <ShieldCheckIcon data-icon="inline-start" aria-hidden /> Audit logs
          </Button>
          <Button render={<Link href="/admin/system-settings" />} nativeButton={false} variant="outline">
            <AlertTriangleIcon data-icon="inline-start" aria-hidden /> System settings
          </Button>
          <Button
            onClick={() => {
              orgs.refetch();
              credits.refetch();
              verifications.refetch();
              webhookLogs.refetch();
              auditLogs.refetch();
            }}
            variant="ghost"
          >
            <RefreshCwIcon data-icon="inline-start" aria-hidden /> Refresh all
          </Button>
          <Button render={<Link href="/admin/clients" />} nativeButton={false} variant="ghost">
            <PlusIcon data-icon="inline-start" aria-hidden /> Legacy client onboarding
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function windowToSince(value: string): string | null {
  if (value === "all") return null;
  const now = Date.now();
  const durationMs =
    value === "30d"
      ? 30 * 24 * 60 * 60 * 1000
      : value === "7d"
        ? 7 * 24 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000;
  return new Date(now - durationMs).toISOString();
}

function formatPercent(value: number): string {
  return `${Math.round(value * 1000) / 10}%`;
}

function AgentMetric({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="flex min-h-28 flex-col justify-between rounded-lg border bg-background p-4">
      <span className="text-muted-foreground text-xs font-medium">
        {label}
      </span>
      <span className="font-mono text-2xl font-semibold tabular-nums text-[var(--dashboard-ink)]">
        {value}
      </span>
      <span className="text-muted-foreground text-xs">{description}</span>
    </div>
  );
}
