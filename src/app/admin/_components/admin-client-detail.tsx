"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  Building2Icon,
  CheckCircle2Icon,
  KeyRoundIcon,
  SaveIcon,
  ShieldAlertIcon,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { Metric } from "@/components/dashboard/metric";
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
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ApiKeyListItem, ClientDetail, Phase } from "@/lib/api-client";
import {
  useAdminClient,
  useAdminClientApiKeys,
  useCreateAdminClientApiKey,
  useUpdateAdminClient,
  useUpdateAdminClientPhase,
} from "@/lib/hooks/use-admin-clients";
import { formatDate } from "@/lib/format";

const PHASES: Phase[] = [
  "onboarding",
  "sandbox",
  "kyc_verification",
  "production",
  "suspended",
];

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

export function AdminClientDetail({ clientId }: { clientId: string }) {
  const clientQuery = useAdminClient(clientId);
  const keysQuery = useAdminClientApiKeys(clientId);
  const createKey = useCreateAdminClientApiKey(clientId);

  const client = clientQuery.data;

  if (clientQuery.isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (clientQuery.error || !client) {
    return (
      <EmptyState
        icon={Building2Icon}
        title="Client not found"
        description="The client may have been removed or your admin session expired."
        action={
          <Button render={<Link href="/admin" />} nativeButton={false}>
            <ArrowLeftIcon data-icon="inline-start" />
            Back to clients
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Button
          render={<Link href="/admin" />}
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="w-fit"
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Clients
        </Button>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {client.name}
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Manage this client account, onboarding phase, and issued API keys.
          </p>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Client metrics">
        <Metric
          label="API keys"
          value={client.api_key_count}
          icon={KeyRoundIcon}
          description="Issued by platform admins"
        />
        <Metric
          label="Recent sessions"
          value={client.recent_verification_count}
          icon={CheckCircle2Icon}
          description="Verification traffic in the recent window"
          variant="info"
        />
        <Metric
          label="Account status"
          value={client.is_active ? "Active" : "Inactive"}
          icon={client.is_active ? Building2Icon : ShieldAlertIcon}
          description={phaseLabel(client.phase)}
          variant={client.is_active ? "success" : "warning"}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <ClientProfileCard key={`profile-${client.client_id}`} client={client} />
        <ClientPhaseCard key={`phase-${client.client_id}`} client={client} />
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>API keys</CardTitle>
              <CardDescription>
                Admin view of every key issued to this client. Raw keys appear
                only once after creation.
              </CardDescription>
            </div>
            <Button
              type="button"
              onClick={() =>
                createKey.mutate(undefined, {
                  onSuccess: () => toast.success("API key created"),
                  onError: () => toast.error("Could not create API key"),
                })
              }
              disabled={createKey.isPending || !client.is_active}
            >
              {createKey.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <KeyRoundIcon data-icon="inline-start" />
              )}
              Create key
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {createKey.data ? (
            <Alert>
              <KeyRoundIcon className="size-4" />
              <AlertTitle>Copy the API key now</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <code className="select-all break-all rounded-lg border bg-secondary px-3 py-2 font-mono text-xs text-foreground">
                  {createKey.data.api_key}
                </code>
                It will not be shown again.
              </AlertDescription>
            </Alert>
          ) : null}
          {keysQuery.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : !keysQuery.data?.length ? (
            <EmptyState
              icon={KeyRoundIcon}
              title="No API keys yet"
              description="Create a key once this client is ready to integrate."
            />
          ) : (
            <ApiKeyTable keys={keysQuery.data} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ClientProfileCard({ client }: { client: ClientDetail }) {
  const updateClient = useUpdateAdminClient(client.client_id);
  const [name, setName] = useState(client.name);
  const [isActive, setIsActive] = useState(client.is_active);
  const [submitted, setSubmitted] = useState(false);
  const nameError =
    submitted && name.trim().length === 0 ? "Enter a client name." : null;

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    const trimmed = name.trim();
    if (!trimmed) return;
    updateClient.mutate(
      { name: trimmed, is_active: isActive },
      {
        onSuccess: () => toast.success("Client profile updated"),
        onError: () => toast.error("Could not update client"),
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Name and active status used by authentication and operator views.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={saveProfile}>
          <FieldGroup>
            <Field data-invalid={Boolean(nameError) || undefined}>
              <FieldLabel htmlFor="client-name">Client name</FieldLabel>
              <Input
                id="client-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={255}
                aria-invalid={Boolean(nameError)}
              />
              {nameError ? <FieldError>{nameError}</FieldError> : null}
            </Field>
            <Field orientation="horizontal">
              <input
                id="client-active"
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="mt-0.5 size-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
              <div className="flex flex-col gap-1">
                <FieldLabel htmlFor="client-active">Active account</FieldLabel>
                <FieldDescription>
                  Inactive clients cannot use newly issued credentials.
                </FieldDescription>
              </div>
            </Field>
            <Button
              type="submit"
              className="w-fit"
              disabled={updateClient.isPending}
            >
              {updateClient.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <SaveIcon data-icon="inline-start" />
              )}
              Save profile
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

function ClientPhaseCard({ client }: { client: ClientDetail }) {
  const updatePhase = useUpdateAdminClientPhase(client.client_id);
  const [phase, setPhase] = useState<Phase>(client.phase);

  function savePhase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updatePhase.mutate(phase, {
      onSuccess: () => toast.success("Client phase updated"),
      onError: () => toast.error("Could not update phase"),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phase</CardTitle>
        <CardDescription>
          Move the account through onboarding and production readiness.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={savePhase} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="client-phase">Current phase</FieldLabel>
            <select
              id="client-phase"
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={phase}
              onChange={(event) => setPhase(event.target.value as Phase)}
            >
              {PHASES.map((entry) => (
                <option key={entry} value={entry}>
                  {phaseLabel(entry)}
                </option>
              ))}
            </select>
            <FieldDescription>
              Last changed{" "}
              <span className="font-mono">
                {client.phase_changed_at
                  ? formatDate(client.phase_changed_at)
                  : "never"}
              </span>
              .
            </FieldDescription>
          </Field>
          <Button type="submit" disabled={updatePhase.isPending}>
            {updatePhase.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <SaveIcon data-icon="inline-start" />
            )}
            Save phase
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ApiKeyTable({ keys }: { keys: ApiKeyListItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Key ID</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Last used</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keys.map((key) => (
          <TableRow key={key.api_key_id}>
            <TableCell className="font-mono text-xs">{key.api_key_id}</TableCell>
            <TableCell>{formatDate(key.created_at)}</TableCell>
            <TableCell>
              {key.last_used_at ? formatDate(key.last_used_at) : "Never"}
            </TableCell>
            <TableCell>
              {key.expires_at ? formatDate(key.expires_at) : "No expiry"}
            </TableCell>
            <TableCell>
              <Badge variant={key.revoked_at ? "destructive" : "secondary"}>
                {key.revoked_at ? "Revoked" : "Active"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
