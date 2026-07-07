"use client";

import { useMemo, useState } from "react";
import { CoinsIcon, ScrollTextIcon } from "lucide-react";

import { AppShell } from "@/components/dashboard/app-shell";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { useAdminClients } from "@/lib/hooks/use-admin-clients";
import { useAdminCreditLedger } from "@/lib/hooks/use-credit-ledger";

export default function AdminLedgerPage() {
  // TODO(admin-ledger): the dropdown selects legacy ClientListItem.client_id,
  // but the ledger endpoint filters on Organization.id. Map Client.id →
  // Organization.id via Organization.legacy_client_id before passing to the
  // hook. Until then, the filter is effectively a no-op (backend returns no
  // matching rows for the legacy id) but the page renders without error.
  const [clientId, setClientId] = useState("");
  const clients = useAdminClients();
  const ledger = useAdminCreditLedger(clientId || undefined);
  const entries = ledger.data?.entries ?? [];
  const selectedClient = useMemo(
    () => clients.data?.find((client) => client.client_id === clientId),
    [clients.data, clientId],
  );

  return (
    <AppShell audience="admin">
      <div className="flex flex-col gap-6 p-6">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Ledger
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Credit ledger
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Audit credit grants, reservations, settlements, releases, and
            purchases across client accounts.
          </p>
        </header>

        <Card className="app-shell-panel">
          <CardHeader>
            <CardTitle>Client filter</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:max-w-sm">
            <Label htmlFor="client-filter">Client</Label>
            <select
              id="client-filter"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
            >
              <option value="">All clients</option>
              {(clients.data ?? []).map((client) => (
                <option key={client.client_id} value={client.client_id}>
                  {client.name}
                </option>
              ))}
            </select>
            {selectedClient ? (
              <p className="text-xs text-muted-foreground">
                Showing account balance for {selectedClient.name}.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Select a client to inspect its current bucket balance.
              </p>
            )}
          </CardContent>
        </Card>

        {clientId && ledger.data?.balance ? (
          <div className="grid gap-4 md:grid-cols-4">
            <BalanceTile title="Available" value={ledger.data.balance.available_credits} />
            <BalanceTile title="Free" value={ledger.data.balance.free_credits} />
            <BalanceTile
              title="Subscription"
              value={ledger.data.balance.subscription_credits}
            />
            <BalanceTile title="Purchased" value={ledger.data.balance.purchased_credits} />
          </div>
        ) : null}

        <Card className="app-shell-panel">
          <CardHeader>
            <CardTitle>Ledger records</CardTitle>
          </CardHeader>
          <CardContent>
            {ledger.isLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : entries.length === 0 ? (
              <EmptyState
                icon={ScrollTextIcon}
                title="No ledger records"
                description="Credit movement will appear here after top-ups, purchases, reservations, or settlements."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead className="text-right">Free</TableHead>
                    <TableHead className="text-right">Subscription</TableHead>
                    <TableHead className="text-right">Purchased</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.ledger_entry_id}>
                      <TableCell className="font-mono text-xs">
                        {formatDate(entry.created_at)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {entry.organization_id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {entry.entry_type.replaceAll("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {entry.verification_id
                          ? entry.verification_id.slice(0, 8)
                          : "None"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatDelta(entry.free_delta)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatDelta(entry.subscription_delta)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatDelta(entry.purchased_delta)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {entry.balance_after.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function BalanceTile({ title, value }: { title: string; value: number }) {
  return (
    <Card className="app-shell-panel">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <CoinsIcon aria-hidden="true" className="text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">
          {value.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

function formatDelta(value: number) {
  if (value === 0) return "0";
  return value > 0 ? `+${value.toLocaleString()}` : value.toLocaleString();
}
