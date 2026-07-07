"use client";

import {
  FilterIcon,
  RefreshCwIcon,
  ScanSearchIcon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { Suspense, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type AgenticMode,
  type AgenticRecommendationFilter,
  type VerificationStatus,
} from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { useAdminVerifications } from "@/lib/hooks/use-admin-console";

const STATUS_OPTIONS: ("all" | VerificationStatus)[] = [
  "all",
  "pending_upload",
  "awaiting_credits",
  "processing",
  "approved",
  "rejected",
  "manual_review",
];
const AGENTIC_MODE_OPTIONS: ("all" | AgenticMode)[] = [
  "all",
  "disabled",
  "shadow",
  "assist_review",
  "auto_decide",
];
const AGENTIC_RECOMMENDATION_OPTIONS: (
  | "all"
  | AgenticRecommendationFilter
)[] = ["all", "approved", "rejected", "manual_review"];

type StatusFilter = (typeof STATUS_OPTIONS)[number];
type AgenticModeFilter = (typeof AGENTIC_MODE_OPTIONS)[number];
type AgenticRecommendationFilterValue =
  (typeof AGENTIC_RECOMMENDATION_OPTIONS)[number];

const STATUS_LABELS: Record<VerificationStatus, string> = {
  pending_upload: "Pending upload",
  awaiting_credits: "Awaiting credits",
  processing: "Processing",
  approved: "Approved",
  rejected: "Rejected",
  manual_review: "Manual review",
};
const AGENTIC_MODE_LABELS: Record<AgenticMode, string> = {
  disabled: "Disabled",
  shadow: "Shadow",
  assist_review: "Assist review",
  auto_decide: "Auto decide",
};
const AGENTIC_RECOMMENDATION_LABELS: Record<
  AgenticRecommendationFilter,
  string
> = {
  approved: "Approved",
  rejected: "Rejected",
  manual_review: "Manual review",
};

function readFilters(params: URLSearchParams) {
  const statusRaw = params.get("status") ?? "all";
  const agenticModeRaw = params.get("agentic_mode") ?? "all";
  const agenticRecommendationRaw =
    params.get("agentic_recommendation") ?? "all";
  return {
    status: STATUS_OPTIONS.includes(statusRaw as StatusFilter)
      ? (statusRaw as StatusFilter)
      : "all",
    externalUser: params.get("external_user_id") ?? "",
    agenticMode: AGENTIC_MODE_OPTIONS.includes(
      agenticModeRaw as AgenticModeFilter,
    )
      ? (agenticModeRaw as AgenticModeFilter)
      : "all",
    agenticRecommendation: AGENTIC_RECOMMENDATION_OPTIONS.includes(
      agenticRecommendationRaw as AgenticRecommendationFilterValue,
    )
      ? (agenticRecommendationRaw as AgenticRecommendationFilterValue)
      : "all",
  };
}

export default function AdminVerificationsPage() {
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
          <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
            <VerificationsList />
          </Suspense>
        </PlatformRouteGuard>
      </main>
    </AppShell>
  );
}

function VerificationsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = useMemo(() => readFilters(searchParams), [searchParams]);
  const query = useAdminVerifications({
    limit: 100,
    agenticMode:
      initial.agenticMode === "all" ? undefined : initial.agenticMode,
    agenticRecommendation:
      initial.agenticRecommendation === "all"
        ? undefined
        : initial.agenticRecommendation,
  });
  const [status, setStatus] = useState<StatusFilter>(initial.status);
  const [userQuery, setUserQuery] = useState(initial.externalUser);
  const [agenticMode, setAgenticMode] = useState<AgenticModeFilter>(
    initial.agenticMode,
  );
  const [agenticRecommendation, setAgenticRecommendation] =
    useState<AgenticRecommendationFilterValue>(
      initial.agenticRecommendation,
    );

  const filtered = useMemo(() => {
    const items = query.data?.items ?? [];
    const normalizedUserQuery = userQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (status !== "all" && item.status !== status) return false;
      if (
        normalizedUserQuery &&
        !item.external_user_id.toLowerCase().includes(normalizedUserQuery)
      ) {
        return false;
      }
      return true;
    });
  }, [query.data, status, userQuery]);

  function writeParams(next: {
    status: StatusFilter;
    externalUser: string;
    agenticMode: AgenticModeFilter;
    agenticRecommendation: AgenticRecommendationFilterValue;
  }) {
    const params = new URLSearchParams();
    if (next.status !== "all") params.set("status", next.status);
    if (next.externalUser.trim()) {
      params.set("external_user_id", next.externalUser.trim());
    }
    if (next.agenticMode !== "all") {
      params.set("agentic_mode", next.agenticMode);
    }
    if (next.agenticRecommendation !== "all") {
      params.set("agentic_recommendation", next.agenticRecommendation);
    }
    const qs = params.toString();
    router.push(qs ? `/admin/verifications?${qs}` : "/admin/verifications");
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    writeParams({
      status,
      externalUser: userQuery,
      agenticMode,
      agenticRecommendation,
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        icon={ScanSearchIcon}
        title="Verifications"
        description="Every verification session across the platform. Drill into one for the full evidence trail."
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>All sessions</CardTitle>
              <CardDescription>
                Filter by status or by external user id; the platform
                ledger records every match.
              </CardDescription>
            </div>
            <form
              className="flex flex-wrap items-center gap-2"
              onSubmit={applyFilters}
            >
              <label className="text-muted-foreground flex items-center gap-2 text-sm">
                <SearchIcon className="size-4" aria-hidden />
                <Input
                  type="search"
                  placeholder="external_user_id"
                  value={userQuery}
                  onChange={(event) => setUserQuery(event.target.value)}
                  className="h-9 w-56 text-sm"
                />
              </label>
              <label className="text-muted-foreground flex items-center gap-2 text-sm">
                <FilterIcon data-icon="inline-start" aria-hidden /> Status
                <select
                  className="border-input bg-background text-foreground focus-visible:ring-ring/50 h-9 rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px]"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as StatusFilter)}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "All statuses" : STATUS_LABELS[option]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-muted-foreground flex items-center gap-2 text-sm">
                Agent mode
                <select
                  className="border-input bg-background text-foreground focus-visible:ring-ring/50 h-9 rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px]"
                  value={agenticMode}
                  onChange={(event) =>
                    setAgenticMode(event.target.value as AgenticModeFilter)
                  }
                >
                  {AGENTIC_MODE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === "all"
                        ? "All modes"
                        : AGENTIC_MODE_LABELS[option]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-muted-foreground flex items-center gap-2 text-sm">
                Recommendation
                <select
                  className="border-input bg-background text-foreground focus-visible:ring-ring/50 h-9 rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px]"
                  value={agenticRecommendation}
                  onChange={(event) =>
                    setAgenticRecommendation(
                      event.target.value as AgenticRecommendationFilterValue,
                    )
                  }
                >
                  {AGENTIC_RECOMMENDATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === "all"
                        ? "All recommendations"
                        : AGENTIC_RECOMMENDATION_LABELS[option]}
                    </option>
                  ))}
                </select>
              </label>
              <Button type="submit" variant="secondary" size="sm">
                <FilterIcon data-icon="inline-start" aria-hidden /> Apply
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => query.refetch()}
              >
                <RefreshCwIcon data-icon="inline-start" aria-hidden /> Refresh
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={ScanSearchIcon}
              title="No sessions match"
              description="Try a different status or external-user search; the platform ledger is empty otherwise."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Verification</TableHead>
                  <TableHead>External user</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.verification_id}>
                    <TableCell>
                      <span className="font-mono text-xs">
                        {item.verification_id.slice(0, 8)}…
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-xs">
                        {item.external_user_id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(item.status)}>
                        {STATUS_LABELS[item.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">
                        {item.risk_score ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(item.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        render={
                          <Link href={`/admin/verifications/${item.verification_id}`} />
                        }
                        nativeButton={false}
                        variant="ghost"
                        size="sm"
                      >
                        Open
                      </Button>
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

function statusBadgeVariant(
  status: VerificationStatus,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "approved") return "default";
  if (status === "rejected") return "destructive";
  if (status === "manual_review") return "secondary";
  return "outline";
}
