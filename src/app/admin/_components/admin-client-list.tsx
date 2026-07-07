"use client";

import {
  Building2Icon,
  FilterIcon,
  KeyRoundIcon,
  PlusIcon,
  RefreshCwIcon,
  ShieldAlertIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

import { Metric } from "@/components/dashboard/metric";
import { EmptyState } from "@/components/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
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
import type { ClientListItem, Phase } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import {
  useAdminClients,
  useCreateAdminClient,
} from "@/lib/hooks/use-admin-clients";
import { useAdminSession } from "@/lib/hooks/use-admin-session";

const EMPTY_CLIENTS: ClientListItem[] = [];

const PHASES = [
  "all",
  "onboarding",
  "sandbox",
  "kyc_verification",
  "production",
  "suspended",
] as const;

type PhaseFilter = (typeof PHASES)[number];

const PHASE_LABELS: Record<Phase, string> = {
  onboarding: "Onboarding",
  sandbox: "Sandbox",
  kyc_verification: "KYC verification",
  production: "Production",
  suspended: "Suspended",
};

function phaseLabel(phase: Phase): string {
  return PHASE_LABELS[phase];
}

function phaseBadgeVariant(
  phase: Phase,
): "default" | "secondary" | "destructive" | "outline" {
  if (phase === "production") return "default";
  if (phase === "suspended") return "destructive";
  if (phase === "sandbox" || phase === "kyc_verification") return "secondary";
  return "outline";
}

export function AdminClientList() {
  const session = useAdminSession();
  const clientsQuery = useAdminClients();
  const createClient = useCreateAdminClient();
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const clients = clientsQuery.data ?? EMPTY_CLIENTS;
  const filteredClients = useMemo(
    () =>
      phaseFilter === "all"
        ? clients
        : clients.filter((client) => client.phase === phaseFilter),
    [clients, phaseFilter],
  );

  const activeCount = clients.filter((client) => client.is_active).length;
  const suspendedCount = clients.filter(
    (client) => client.phase === "suspended" || !client.is_active,
  ).length;
  const productionCount = clients.filter(
    (client) => client.phase === "production",
  ).length;
  const nameError =
    submitted && name.trim().length === 0 ? "Enter a client name." : null;

  function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    const trimmed = name.trim();
    if (!trimmed) return;
    createClient.mutate(
      { name: trimmed },
      {
        onSuccess: () => {
          setName("");
          setSubmitted(false);
          toast.success("Client created");
        },
        onError: () => {
          toast.error("Could not create client");
        },
      },
    );
  }

  if (session.isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (!session.data?.authenticated) {
    return (
      <EmptyState
        icon={UsersIcon}
        title="Sign in to manage clients"
        description="Client onboarding uses the platform admin session."
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
      <section
        className="grid gap-4 sm:grid-cols-3"
        aria-label="Client metrics"
      >
        <Metric
          label="Active clients"
          value={clientsQuery.isLoading ? "-" : activeCount}
          icon={Building2Icon}
          description="Can issue and use API keys"
          variant="success"
        />
        <Metric
          label="Production"
          value={clientsQuery.isLoading ? "-" : productionCount}
          icon={KeyRoundIcon}
          description="Cleared for live verification traffic"
          variant="info"
        />
        <Metric
          label="Blocked"
          value={clientsQuery.isLoading ? "-" : suspendedCount}
          icon={ShieldAlertIcon}
          description="Suspended phase or inactive status"
          variant={suspendedCount > 0 ? "warning" : "default"}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Onboard a client</CardTitle>
          <CardDescription>
            Create the account first, then issue its first API key from the
            detail page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitCreate}>
            <FieldGroup className="sm:grid sm:grid-cols-[1fr_auto] sm:items-start">
              <Field data-invalid={Boolean(nameError) || undefined}>
                <Input
                  id="admin-client-name"
                  value={name}
                  placeholder="Client Name"
                  onChange={(event) => setName(event.target.value)}
                  maxLength={255}
                  autoComplete="organization"
                  aria-invalid={Boolean(nameError)}
                />
                <FieldDescription>
                  This is the company name operators and client users will see.
                </FieldDescription>
                {nameError ? <FieldError>{nameError}</FieldError> : null}
              </Field>
              <Button type="submit" disabled={createClient.isPending}>
                <PlusIcon data-icon="inline-start" />
                {createClient.isPending ? "Creating" : "Create client"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {clientsQuery.error ? (
        <Alert variant="destructive">
          <AlertTitle>Clients could not be loaded</AlertTitle>
          <AlertDescription>
            The admin session may have expired. Sign in again if refresh fails.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Clients</CardTitle>
              <CardDescription>
                Scan onboarding phase, active status, and creation date.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-muted-foreground flex items-center gap-2 text-sm">
                <FilterIcon data-icon="inline-start" />
                <select
                  className="border-input bg-background text-foreground focus-visible:ring-ring/50 h-9 rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px]"
                  value={phaseFilter}
                  onChange={(event) =>
                    setPhaseFilter(event.target.value as PhaseFilter)
                  }
                >
                  {PHASES.map((phase) => (
                    <option key={phase} value={phase}>
                      {phase === "all" ? "All phases" : phaseLabel(phase)}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => clientsQuery.refetch()}
              >
                <RefreshCwIcon data-icon="inline-start" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {clientsQuery.isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredClients.length === 0 ? (
            <EmptyState
              icon={UsersIcon}
              title="No clients in this phase"
              description="Change the phase filter or create the first client."
            />
          ) : (
            <ClientTable clients={filteredClients} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ClientTable({ clients }: { clients: ClientListItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Phase</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.client_id}>
            <TableCell>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="font-medium">{client.name}</span>
                <span className="text-muted-foreground font-mono text-xs">
                  {client.client_id}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={phaseBadgeVariant(client.phase)}>
                {phaseLabel(client.phase)}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={client.is_active ? "secondary" : "destructive"}>
                {client.is_active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(client.created_at)}
            </TableCell>
            <TableCell className="text-right">
              <Button
                render={<Link href={`/admin/clients/${client.client_id}`} />}
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
  );
}
