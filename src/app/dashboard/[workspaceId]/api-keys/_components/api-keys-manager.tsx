"use client";

import { type FormEvent, useId, useState } from "react";
import {
  CheckIcon,
  ClipboardIcon,
  ListFilterIcon,
  KeyIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import { AppShell } from "@/components/dashboard/app-shell";
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { useClientSession } from "@/lib/hooks/use-client-session";
import {
  apiClient,
  type ApiError,
  type ApiKeyCreate,
  type ApiKeyCreateResponse,
} from "@/lib/api-client";

export function ApiKeysManager({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const session = useClientSession();
  const nameInputId = useId();
  const environmentGroupId = useId();
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [showAllKeys, setShowAllKeys] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [environment, setEnvironment] = useState<"live" | "test">("live");
  const [nameError, setNameError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<ApiKeyCreateResponse | null>(
    null,
  );
  const [copiedKey, setCopiedKey] = useState(false);

  const {
    data: keys,
    isLoading: keysLoading,
    refetch: refetchKeys,
  } = useQuery({
    queryKey: ["workspace-api-keys", workspaceId, showAllKeys],
    queryFn: () =>
      apiClient.listWorkspaceApiKeys(workspaceId, {
        includeRevoked: showAllKeys,
      }),
    enabled: Boolean(session.data?.authenticated && workspaceId),
  });

  const createKey = useMutation<ApiKeyCreateResponse, ApiError, ApiKeyCreate>({
    mutationFn: (payload) =>
      apiClient.createWorkspaceApiKey(workspaceId, payload),
    onSuccess: (data) => {
      setCreatedKey(data);
      setKeyName("");
      setEnvironment("live");
      setNameError(null);
      setCopiedKey(false);
      setCreateSheetOpen(false);
      void refetchKeys();
    },
  });

  const revokeKey = useMutation<void, ApiError, string>({
    mutationFn: (apiKeyId) =>
      apiClient.revokeWorkspaceApiKey(workspaceId, apiKeyId),
    onSuccess: () => {
      void refetchKeys();
    },
  });

  if (!session.data?.authenticated) {
    return (
      <AppShell audience="client">
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">API Keys</h1>
            <p className="text-muted-foreground">
              Please sign in to manage your keys.
            </p>
          </div>
        </main>
      </AppShell>
    );
  }

  function handleCreateKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = keyName.trim();
    if (!name) {
      setNameError("Name your key before creating it.");
      return;
    }
    if (name.length > 255) {
      setNameError("Key names must be 255 characters or fewer.");
      return;
    }
    createKey.mutate({ name, environment });
  }

  function openCreateSheet() {
    setCreateSheetOpen(true);
    setKeyName("");
    setEnvironment("live");
    setNameError(null);
    createKey.reset();
  }

  function closeCreateSheet() {
    if (createKey.isPending) return;
    setCreateSheetOpen(false);
    setKeyName("");
    setEnvironment("live");
    setNameError(null);
  }

  async function copyCreatedKey() {
    const rawKey = createdKey?.api_key;
    if (!rawKey) return;
    try {
      await navigator.clipboard.writeText(rawKey);
      setCopiedKey(true);
      toast.success("API key copied.");
    } catch {
      toast.error("Could not copy the API key.");
    }
  }

  return (
    <AppShell audience="client">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">API Keys</h1>
            <p className="text-muted-foreground">
              Manage the keys used to authenticate your integration with HaloKYC.
            </p>
          </div>
          <Button onClick={openCreateSheet}>
            <PlusIcon data-icon="inline-start" />
            New key
          </Button>
        </header>

        {createdKey && (
          <Alert>
            <KeyIcon />
            <AlertTitle>Key created successfully!</AlertTitle>
            <AlertDescription className="flex flex-col gap-3">
              <span>
                Copy <span className="font-medium">{createdKey.name}</span>{" "}
                now. The raw key will not be shown again.
              </span>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="min-w-0 flex-1 select-all rounded-lg border bg-background px-3 py-2 font-mono text-xs">
                  {createdKey.api_key}
                </code>
                <Button type="button" variant="outline" onClick={copyCreatedKey}>
                  {copiedKey ? (
                    <CheckIcon data-icon="inline-start" />
                  ) : (
                    <ClipboardIcon data-icon="inline-start" />
                  )}
                  {copiedKey ? "Copied" : "Copy"}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {revokeKey.error && (
          <Alert variant="destructive">
            <AlertTitle>Error revoking key</AlertTitle>
            <AlertDescription>
              {revokeKey.error instanceof Error
                ? revokeKey.error.message
                : "An unexpected error occurred."}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Your Keys</CardTitle>
<CardDescription>
              {showAllKeys
                ? "A list of active and revoked API keys issued to this workspace. Each key is bound to either the live or test environment."
                : "A list of active API keys issued to this workspace. Each key is bound to either the live or test environment."}
            </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={showAllKeys}
              onClick={() => setShowAllKeys((value) => !value)}
            >
              <ListFilterIcon data-icon="inline-start" />
              {showAllKeys ? "All keys" : "Active only"}
            </Button>
          </CardHeader>
          <CardContent>
            {keysLoading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : keys && keys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <KeyIcon className="mb-4 size-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {showAllKeys
                    ? "No API keys found. Create one to get started."
                    : "No active API keys found. Create one to get started."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys?.map((key) => (
                    <TableRow key={key.api_key_id}>
                      <TableCell className="text-sm font-medium">
                        {key.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            key.environment === "live" ? "default" : "secondary"
                          }
                        >
                          {key.environment}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(key.created_at), "PPP")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {key.last_used_at
                          ? format(new Date(key.last_used_at), "PPP")
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        {key.revoked_at ? (
                          <Badge variant="destructive">Revoked</Badge>
                        ) : (
                          <Badge variant="outline">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!key.revoked_at && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => revokeKey.mutate(key.api_key_id)}
                              disabled={revokeKey.isPending}
                              aria-label={`Revoke ${key.name}`}
                            >
                              <Trash2Icon className="text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <Sheet
        open={createSheetOpen}
        onOpenChange={(open) => {
          if (open) {
            setCreateSheetOpen(true);
            return;
          }
          closeCreateSheet();
        }}
      >
        <SheetContent className="flex flex-col gap-0 p-0">
          <form
            className="flex h-full flex-col"
            onSubmit={handleCreateKey}
            aria-labelledby="api-key-create-title"
          >
            <SheetHeader className="border-b p-4">
              <SheetTitle id="api-key-create-title">New API key</SheetTitle>
              <SheetDescription>
                Name this key so your team can identify where it is used.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-4">
              <FieldGroup>
                <Field data-invalid={nameError ? true : undefined}>
                  <FieldLabel htmlFor={nameInputId}>Key name</FieldLabel>
                  <Input
                    id={nameInputId}
                    value={keyName}
                    onChange={(event) => {
                      setKeyName(event.target.value);
                      if (nameError) setNameError(null);
                      if (createKey.error) createKey.reset();
                    }}
                    placeholder="Production backend"
                    aria-invalid={nameError ? true : undefined}
                    aria-describedby={
                      nameError ? `${nameInputId}-error` : undefined
                    }
                    disabled={createKey.isPending}
                    maxLength={255}
                    autoComplete="off"
                    autoFocus
                  />
                  <FieldDescription>
                    Use a name tied to the environment, service, or app that
                    will hold this key.
                  </FieldDescription>
                  {nameError ? (
                    <FieldError id={`${nameInputId}-error`}>
                      {nameError}
                    </FieldError>
                  ) : null}
                </Field>
                <Field>
                  <FieldLabel id={`${environmentGroupId}-label`}>
                    Environment
                  </FieldLabel>
                  <div
                    role="radiogroup"
                    aria-labelledby={`${environmentGroupId}-label`}
                    className="flex gap-2"
                  >
                    {(["live", "test"] as const).map((value) => {
                      const checked = environment === value;
                      return (
                        <label
                          key={value}
                          className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-[var(--dashboard-rule)] bg-[var(--dashboard-canvas)] px-3 py-2 text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--ring)]"
                          data-checked={checked ? "true" : undefined}
                        >
                          <input
                            type="radio"
                            name={environmentGroupId}
                            value={value}
                            checked={checked}
                            disabled={createKey.isPending}
                            onChange={() => setEnvironment(value)}
                            className="size-4 accent-[var(--ring)]"
                          />
                          <span className="font-medium capitalize">
                            {value}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {value === "live"
                              ? "Production traffic"
                              : "Sandbox only"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <FieldDescription>
                    Live keys serve real sessions and consume credits. Test keys
                    stay in the sandbox bucket for integration development.
                  </FieldDescription>
                </Field>
                {createKey.error ? (
                  <Alert variant="destructive">
                    <AlertTitle>Error creating key</AlertTitle>
                    <AlertDescription>
                      {createKey.error instanceof Error
                        ? createKey.error.message
                        : "An unexpected error occurred."}
                    </AlertDescription>
                  </Alert>
                ) : null}
              </FieldGroup>
            </div>
            <SheetFooter className="border-t p-4">
              <SheetClose render={<Button type="button" variant="ghost" />}>
                Cancel
              </SheetClose>
              <Button type="submit" disabled={createKey.isPending}>
                {createKey.isPending ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <PlusIcon data-icon="inline-start" />
                )}
                Create key
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
