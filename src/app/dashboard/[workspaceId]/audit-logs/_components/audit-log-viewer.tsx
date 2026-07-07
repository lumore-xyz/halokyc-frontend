"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  SearchIcon,
  ScrollTextIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { apiClient, type WorkspaceAuditLogItem } from "@/lib/api-client";
import { useClientSession } from "@/lib/hooks/use-client-session";

const PAGE_SIZE = 100;

type SortKey = "action" | "old_value" | "new_value" | "created_at";
type SortDirection = "asc" | "desc";

export function AuditLogViewer({ workspaceId }: { workspaceId: string }) {
  const session = useClientSession();
  const [offset, setOffset] = useState(0);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const list = useQuery({
    queryKey: ["workspace-audit-logs", workspaceId, offset],
    queryFn: () =>
      apiClient.listWorkspaceAuditLogs(workspaceId, {
        limit: PAGE_SIZE,
        offset,
      }),
    enabled: Boolean(session.data?.authenticated && workspaceId),
  });

  const entries = useMemo(() => list.data ?? [], [list.data]);
  const visibleEntries = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? entries.filter((entry) => searchableText(entry).includes(needle))
      : entries;

    return [...filtered].sort((left, right) => {
      const a = sortValue(left, sortKey);
      const b = sortValue(right, sortKey);
      const result = a.localeCompare(b);
      return sortDirection === "asc" ? result : -result;
    });
  }, [entries, query, sortDirection, sortKey]);

  function toggleSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setSortDirection(nextKey === "created_at" ? "desc" : "asc");
  }

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Audit logs</h1>
        <p className="text-muted-foreground max-w-2xl">
          Workspace events recorded for status changes, key rotations, and
          configuration updates. Owner and admin only.
        </p>
      </header>

      {list.isLoading ? (
        <Card>
          <CardContent className="flex justify-center py-12">
            <Spinner />
          </CardContent>
        </Card>
      ) : list.error ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-sm text-muted-foreground">
              Audit logs could not be loaded. Confirm your role or try again
              later.
            </p>
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={ScrollTextIcon}
          title="No audit events yet"
          description="Once your team starts configuring workflows, issuing keys, or changing statuses, every change will appear here."
        />
      ) : (
        <Card>
          <CardHeader className="gap-4">
            <div>
              <CardTitle>Recent events</CardTitle>
              <CardDescription>
                Search the current page or sort by column.
              </CardDescription>
            </div>
            <div className="relative max-w-md">
              <SearchIcon
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search actions or payloads"
                className="pl-9"
                aria-label="Search audit logs"
              />
            </div>
            <CardDescription>
              Showing {visibleEntries.length} of {entries.length} events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {visibleEntries.length === 0 ? (
              <EmptyState
                icon={SearchIcon}
                title="No matching audit events"
                description="Clear the search field or try a different action, date, or payload value."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHead
                      label="Action"
                      sortKey="action"
                      activeKey={sortKey}
                      direction={sortDirection}
                      onSort={toggleSort}
                    />
                    <SortableHead
                      label="Old"
                      sortKey="old_value"
                      activeKey={sortKey}
                      direction={sortDirection}
                      onSort={toggleSort}
                    />
                    <SortableHead
                      label="New"
                      sortKey="new_value"
                      activeKey={sortKey}
                      direction={sortDirection}
                      onSort={toggleSort}
                    />
                    <SortableHead
                      label="Created"
                      sortKey="created_at"
                      activeKey={sortKey}
                      direction={sortDirection}
                      onSort={toggleSort}
                    />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleEntries.map((entry, index) => (
                    <TableRow key={`${entry.created_at}-${entry.action}-${index}`}>
                      <TableCell>
                        <code className="font-mono text-xs">{entry.action}</code>
                      </TableCell>
                      <PayloadCell value={entry.old_value} />
                      <PayloadCell value={entry.new_value} />
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="mt-4 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                Previous
              </Button>
              <span className="text-muted-foreground text-xs">
                Page {Math.floor(offset / PAGE_SIZE) + 1}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={entries.length < PAGE_SIZE}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function SortableHead({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
}) {
  const isActive = sortKey === activeKey;
  const Icon = isActive
    ? direction === "asc"
      ? ArrowUpIcon
      : ArrowDownIcon
    : ArrowUpDownIcon;

  return (
    <TableHead>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="-ml-3 gap-2 px-2"
        onClick={() => onSort(sortKey)}
      >
        {label}
        <Icon className="size-3.5" aria-hidden />
      </Button>
    </TableHead>
  );
}

function PayloadCell({ value }: { value: Record<string, unknown> | null }) {
  return (
    <TableCell className="max-w-sm truncate text-xs">
      {value ? (
        <code className="text-muted-foreground">{JSON.stringify(value)}</code>
      ) : (
        <span className="text-muted-foreground">-</span>
      )}
    </TableCell>
  );
}

function searchableText(entry: WorkspaceAuditLogItem) {
  return [
    entry.action,
    entry.created_at,
    JSON.stringify(entry.old_value ?? {}),
    JSON.stringify(entry.new_value ?? {}),
  ]
    .join(" ")
    .toLowerCase();
}

function sortValue(entry: WorkspaceAuditLogItem, key: SortKey) {
  if (key === "old_value" || key === "new_value") {
    return JSON.stringify(entry[key] ?? {});
  }
  return entry[key];
}
