"use client";

import { FormEvent, useId, useState } from "react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { AppShell } from "@/components/dashboard/app-shell";
import { PlatformRouteGuard } from "@/components/dashboard/platform-route-guard";
import { EmptyState } from "@/components/empty-state";
import { ApiError } from "@/lib/api-client";
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
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { BrainCircuitIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { formatDate } from "@/lib/format";
import {
  useAdminAiProviders,
  useCreateAdminAiProvider,
  useCreateAdminAiProviderKey,
  useDeleteAdminAiProvider,
  useDeleteAdminAiProviderKey,
  useTestAdminAiProviderKey,
  type AiModelProvider,
  type AiModelProviderKey,
  type AiModelProviderKeyCreate,
  type AiModelProviderType,
} from "@/lib/hooks/use-admin-console";

const PROVIDER_TYPE_LABELS: Record<string, string> = {
  google_gemma: "Google Gemma",
  nvidia: "NVIDIA",
  ollama_cloud: "Ollama Cloud",
  openai_compatible: "OpenAI compatible",
};

export default function AdminAiProvidersPage() {
  return (
    <AppShell audience="admin">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
        <PlatformRouteGuard
          allowedRoles={["platform_owner"]}
          fallbackHref="/admin"
        >
          <AiProvidersHub />
        </PlatformRouteGuard>
      </main>
    </AppShell>
  );
}

function AiProvidersHub() {
  const query = useAdminAiProviders();
  const createProvider = useCreateAdminAiProvider();
  const createKey = useCreateAdminAiProviderKey();

  const [providerOpen, setProviderOpen] = useState(false);
  const [keyProviderId, setKeyProviderId] = useState<string | null>(null);

  const [providerName, setProviderName] = useState("");
  const [providerType, setProviderType] = useState<AiModelProviderType>("google_gemma");
  const [providerPriority, setProviderPriority] = useState<string>("100");
  const [providerBaseUrl, setProviderBaseUrl] = useState("");
  const [providerModel, setProviderModel] = useState("");
  const [providerSubmitted, setProviderSubmitted] = useState(false);

  const [keyLabel, setKeyLabel] = useState("");
  const [keyApiKey, setKeyApiKey] = useState("");
  const [keyDaily, setKeyDaily] = useState("");
  const [keyMonthly, setKeyMonthly] = useState("");
  const [keySubmitted, setKeySubmitted] = useState(false);

  const providers = query.data ?? [];

  const openProvider = () => {
    setProviderName("");
    setProviderType("google_gemma");
    setProviderPriority("100");
    setProviderBaseUrl("");
    setProviderModel("");
    setProviderSubmitted(false);
    setProviderOpen(true);
  };

  const openKey = (provider: AiModelProvider) => {
    setKeyProviderId(provider.provider_id);
    setKeyLabel("");
    setKeyApiKey("");
    setKeyDaily("");
    setKeyMonthly("");
    setKeySubmitted(false);
  };

  const submitProvider = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProviderSubmitted(true);

    const priority = Number.parseInt(providerPriority, 10);
    if (!providerName.trim()) {
      toast.error("Display name is required.");
      return;
    }
    if (!Number.isFinite(priority) || priority < 0 || priority > 10000) {
      toast.error("Priority must be between 0 and 10000.");
      return;
    }

    createProvider.mutate(
      {
        provider_type: providerType,
        display_name: providerName.trim(),
        priority,
        base_url: providerBaseUrl.trim() || null,
        model_name: providerModel.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("Provider created");
          setProviderOpen(false);
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            toast.error(`Create failed: ${err.status}`);
            return;
          }
          toast.error("Create failed");
        },
      },
    );
  };

  const submitKey = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setKeySubmitted(true);

    if (!keyLabel.trim() || !keyApiKey.trim()) {
      toast.error("Label and API key are required.");
      return;
    }

    if (!keyProviderId) {
      toast.error("Provider not selected.");
      return;
    }

    const payload: AiModelProviderKeyCreate = {
      label: keyLabel.trim(),
      api_key: keyApiKey,
      enabled: true,
    };

    const daily = Number.parseInt(keyDaily, 10);
    const monthly = Number.parseInt(keyMonthly, 10);

    if (keyDaily.trim()) {
      payload.daily_limit = Number.isFinite(daily) ? daily : null;
    }
    if (keyMonthly.trim()) {
      payload.monthly_limit = Number.isFinite(monthly) ? monthly : null;
    }

    createKey.mutate(
      { provider_id: keyProviderId, ...payload },
      {
        onSuccess: () => {
          toast.success("Key added");
          setKeyProviderId(null);
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            toast.error(`Add key failed: ${err.status}`);
            return;
          }
          toast.error("Add key failed");
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        icon={BrainCircuitIcon}
        title="AI providers"
        description="Platform-owned model providers and keys used for AI-assisted document processing. Keys are stored encrypted; only the last 4 characters are visible."
        actions={
          <Button type="button" size="sm" onClick={openProvider}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            Add provider
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Configured providers</CardTitle>
              <CardDescription>
                Only one provider is selected per purpose; multiple keys let
                the router rotate on quota or outage.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => query.refetch()}
              disabled={query.isLoading}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : providers.length === 0 ? (
            <EmptyState
              icon={BrainCircuitIcon}
              title="No providers"
              description="Add a Google, NVIDIA, Ollama Cloud, or OpenAI-compatible provider to enable AI-assisted document processing."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Keys</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <ProviderRow
                    key={provider.provider_id}
                    provider={provider}
                    onAddKey={() => openKey(provider)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={providerOpen} onOpenChange={setProviderOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add AI provider</SheetTitle>
            <SheetDescription>
              Create a new model provider entry. You can add keys immediately
              after.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={submitProvider} className="flex min-h-0 flex-1 flex-col gap-4">
            <FieldGroup className="-mr-1 min-h-0 flex-1 overflow-y-auto pr-1">
              <Field data-invalid={providerSubmitted && !providerName.trim() ? true : undefined}>
                <FieldLabel htmlFor="provider-name">Display name</FieldLabel>
                <Input
                  id="provider-name"
                  value={providerName}
                  onChange={(event) => setProviderName(event.target.value)}
                  placeholder="Primary Gemma 4 provider"
                />
                {providerSubmitted && !providerName.trim() ? (
                  <FieldError>Display name is required.</FieldError>
                ) : null}
              </Field>

              <Field>
                <FieldLabel htmlFor="provider-type">Provider type</FieldLabel>
                <select
                  id="provider-type"
                  className="border-input bg-background text-foreground focus-visible:ring-ring/50 h-10 rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
                  value={providerType}
                  onChange={(event) =>
                    setProviderType(event.target.value as AiModelProviderType)
                  }
                >
                  {Object.keys(PROVIDER_TYPE_LABELS).map((value) => (
                    <option key={value} value={value}>
                      {PROVIDER_TYPE_LABELS[value]}
                    </option>
                  ))}
                </select>
                <FieldDescription>
                  Determines how the backend calls this provider.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="provider-model">Model name</FieldLabel>
                <Input
                  id="provider-model"
                  value={providerModel}
                  onChange={(event) => setProviderModel(event.target.value)}
                  placeholder="gemma-4-3b"
                />
                <FieldDescription>
                  Optional override sent to the provider.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="provider-base-url">Base URL</FieldLabel>
                <Input
                  id="provider-base-url"
                  value={providerBaseUrl}
                  onChange={(event) => setProviderBaseUrl(event.target.value)}
                  placeholder="https://ai.googleapis.com/v1beta"
                />
                <FieldDescription>
                  Required for OpenAI-compatible providers.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="provider-priority">Priority</FieldLabel>
                <Input
                  id="provider-priority"
                  type="number"
                  min={0}
                  max={10000}
                  value={providerPriority}
                  onChange={(event) => setProviderPriority(event.target.value)}
                />
                <FieldDescription>
                  Lower numbers are tried first.
                </FieldDescription>
              </Field>
            </FieldGroup>

            <SheetFooter className="shrink-0 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setProviderOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createProvider.isPending}>
                {createProvider.isPending ? "Creating…" : "Create provider"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AddKeySheet
        open={Boolean(keyProviderId)}
        onOpenChange={(open) => {
          if (!open) setKeyProviderId(null);
        }}
        onSubmit={submitKey}
        isSubmitting={createKey.isPending}
        keyLabel={keyLabel}
        setKeyLabel={setKeyLabel}
        keyApiKey={keyApiKey}
        setKeyApiKey={setKeyApiKey}
        keyDaily={keyDaily}
        setKeyDaily={setKeyDaily}
        keyMonthly={keyMonthly}
        setKeyMonthly={setKeyMonthly}
        submitted={keySubmitted}
      />
    </div>
  );
}

function ProviderRow({
  provider,
  onAddKey,
}: {
  provider: AiModelProvider;
  onAddKey: () => void;
}) {
  const [keysOpen, setKeysOpen] = useState(false);
  const descriptionId = useId();
  const [confirmProviderDelete, setConfirmProviderDelete] = useState(false);
  const [confirmKeyDeleteId, setConfirmKeyDeleteId] = useState<string | null>(
    null,
  );
  const deleteProvider = useDeleteAdminAiProvider();
  const deleteKey = useDeleteAdminAiProviderKey();
  const testKey = useTestAdminAiProviderKey();

  const keys = provider.keys ?? [];
  const hasUsableKeys = keys.some((key) => key.enabled);
  const isDeletingProvider = deleteProvider.isPending;

  const handleProviderDelete = () => {
    deleteProvider.mutate(provider.provider_id, {
      onSuccess: () => {
        toast.success("Provider deleted");
        setConfirmProviderDelete(false);
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          toast.error(`Delete failed: ${err.status}`);
          return;
        }
        toast.error("Delete failed");
      },
    });
  };

  const handleKeyDelete = (keyId: string) => {
    deleteKey.mutate(
      { provider_id: provider.provider_id, key_id: keyId },
      {
        onSuccess: () => {
          toast.success("Key deleted");
          setConfirmKeyDeleteId(null);
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            toast.error(`Delete key failed: ${err.status}`);
            return;
          }
          toast.error("Delete key failed");
        },
      },
    );
  };

  const handleKeyTest = (keyId: string) => {
    testKey.mutate(
      { provider_id: provider.provider_id, key_id: keyId },
      {
        onSuccess: (result) => {
          if (result.ok) {
            toast.success(
              `Provider replied${result.response_preview ? `: ${result.response_preview}` : "."}`,
            );
            return;
          }
          toast.error(`Provider test failed: ${result.error_code ?? "unknown"}`);
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            toast.error(`Provider test failed: ${err.status}`);
            return;
          }
          toast.error("Provider test failed");
        },
      },
    );
  };

  return (
    <>
    <TableRow>
      <TableCell>
        <div className="flex flex-col gap-1">
          <span className="font-medium">{provider.display_name}</span>
          <span className="text-muted-foreground font-mono text-xs">
            {provider.provider_id}
          </span>
        </div>
      </TableCell>

      <TableCell>{PROVIDER_TYPE_LABELS[provider.provider_type] ?? provider.provider_type}</TableCell>

      <TableCell className="text-muted-foreground text-xs">
        {provider.model_name ?? (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>

      <TableCell className="text-xs">{provider.priority}</TableCell>

      <TableCell>
        {provider.enabled ? (
          <Badge variant={hasUsableKeys ? "secondary" : "outline"}>
            {hasUsableKeys ? "Enabled" : "No usable keys"}
          </Badge>
        ) : (
          <Badge variant="outline">Disabled</Badge>
        )}
      </TableCell>

      <TableCell className="text-xs">
        <button
          type="button"
          className="text-foreground underline"
          onClick={() => setKeysOpen(true)}
        >
          {keys.length} key{keys.length === 1 ? "" : "s"}
        </button>

        <Sheet open={keysOpen} onOpenChange={setKeysOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Keys</SheetTitle>
              <SheetDescription id={descriptionId}>
                {provider.display_name} — only last 4 characters visible.
              </SheetDescription>
            </SheetHeader>

            <div className="-mr-1 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
              {keys.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No keys yet. Add one to enable routing to this provider.
                </p>
              ) : (
                keys.map((key: AiModelProviderKey) => (
                  <Card key={key.key_id}>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        {key.label}{" "}
                        <span className="font-mono text-muted-foreground">
                          ••••{key.key_last4}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        Added {formatDate(key.created_at)}
                      </CardDescription>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleKeyTest(key.key_id)}
                        disabled={testKey.isPending || deleteKey.isPending}
                      >
                        {testKey.isPending ? (
                          <Spinner data-icon="inline-start" />
                        ) : (
                          <BrainCircuitIcon data-icon="inline-start" />
                        )}
                        {testKey.isPending ? "Testing..." : "Test key"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmKeyDeleteId(key.key_id)}
                        disabled={deleteKey.isPending || testKey.isPending}
                      >
                        <Trash2Icon data-icon="inline-start" className="text-destructive" />
                        Delete key
                      </Button>
                    </CardHeader>
                    <CardContent className="grid gap-2 text-xs">
                      <StatusRow label="Enabled" value={key.enabled ? "Yes" : "No"} />
                      <StatusRow
                        label="Daily usage"
                        value={`${key.daily_used}${key.daily_limit ? ` / ${key.daily_limit}` : ""}`}
                      />
                      <StatusRow
                        label="Monthly usage"
                        value={`${key.monthly_used}${key.monthly_limit ? ` / ${key.monthly_limit}` : ""}`}
                      />
                      <StatusRow
                        label="Cooldown"
                        value={key.cooldown_until ? formatDate(key.cooldown_until) : "—"}
                      />
                      <StatusRow
                        label="Last used"
                        value={key.last_used_at ? formatDate(key.last_used_at) : "—"}
                      />
                      {key.last_error_code ? (
                        <Alert variant="destructive">
                          <AlertTitle>Last error</AlertTitle>
                          <AlertDescription>{key.last_error_code}</AlertDescription>
                        </Alert>
                      ) : null}
                      {confirmKeyDeleteId === key.key_id ? (
                        <div className="mt-2 flex flex-col gap-3 rounded-lg border border-dashed bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-muted-foreground text-xs">
                            Delete this encrypted provider key from routing?
                          </span>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmKeyDeleteId(null)}
                              disabled={deleteKey.isPending}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleKeyDelete(key.key_id)}
                              disabled={deleteKey.isPending}
                            >
                              {deleteKey.isPending ? (
                                <Spinner data-icon="inline-start" />
                              ) : (
                                <Trash2Icon data-icon="inline-start" />
                              )}
                              {deleteKey.isPending ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <SheetFooter className="shrink-0 border-t pt-4">
              <Button type="button" size="sm" onClick={onAddKey}>
                <PlusIcon data-icon="inline-start" aria-hidden />
                Add key
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setKeysOpen(false)}
              >
                Close
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </TableCell>

      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddKey}
            disabled={!provider.enabled || isDeletingProvider}
          >
            <PlusIcon data-icon="inline-start" aria-hidden />
            Add key
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${provider.display_name}`}
            onClick={() => setConfirmProviderDelete(true)}
            disabled={isDeletingProvider}
          >
            <Trash2Icon className="text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
    {confirmProviderDelete ? (
      <TableRow>
        <td colSpan={7} className="p-4 align-middle">
          <div className="flex flex-col gap-3 rounded-xl border border-dashed bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">
                Delete {provider.display_name}?
              </span>
              <span className="text-muted-foreground text-xs">
                This removes the provider route and all encrypted keys under
                it. AI-assisted processing will use the next configured route.
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmProviderDelete(false)}
                disabled={isDeletingProvider}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleProviderDelete}
                disabled={isDeletingProvider}
              >
                {isDeletingProvider ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <Trash2Icon data-icon="inline-start" />
                )}
                {isDeletingProvider ? "Deleting..." : "Delete provider"}
              </Button>
            </div>
          </div>
        </td>
      </TableRow>
    ) : null}
    </>
  );
}

function AddKeySheet({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  keyLabel,
  setKeyLabel,
  keyApiKey,
  setKeyApiKey,
  keyDaily,
  setKeyDaily,
  keyMonthly,
  setKeyMonthly,
  submitted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  keyLabel: string;
  setKeyLabel: (value: string) => void;
  keyApiKey: string;
  setKeyApiKey: (value: string) => void;
  keyDaily: string;
  setKeyDaily: (value: string) => void;
  keyMonthly: string;
  setKeyMonthly: (value: string) => void;
  submitted: boolean;
}) {
  const dailyError = submitted && keyDaily.trim() && Number.isNaN(Number.parseInt(keyDaily, 10));
  const monthlyError =
    submitted && keyMonthly.trim() && Number.isNaN(Number.parseInt(keyMonthly, 10));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add key</SheetTitle>
          <SheetDescription>
            Raw API keys are stored encrypted and shown only once. Only the
            last 4 characters are visible after creation.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col gap-4">
          <FieldGroup className="-mr-1 min-h-0 flex-1 overflow-y-auto pr-1">
            <Field data-invalid={submitted && !keyLabel.trim() ? true : undefined}>
              <FieldLabel htmlFor="key-label">Label</FieldLabel>
              <Input
                id="key-label"
                value={keyLabel}
                onChange={(event) => setKeyLabel(event.target.value)}
                placeholder="Free tier key 1"
              />
              {submitted && !keyLabel.trim() ? (
                <FieldError>Label is required.</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={submitted && !keyApiKey.trim() ? true : undefined}>
              <FieldLabel htmlFor="key-api-key">API key</FieldLabel>
              <Input
                id="key-api-key"
                type="password"
                value={keyApiKey}
                onChange={(event) => setKeyApiKey(event.target.value)}
                placeholder="Paste provider API key"
              />
              {submitted && !keyApiKey.trim() ? (
                <FieldError>API key is required.</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={dailyError ? true : undefined}>
              <FieldLabel htmlFor="key-daily">Daily limit</FieldLabel>
              <Input
                id="key-daily"
                type="number"
                min={1}
                value={keyDaily}
                onChange={(event) => setKeyDaily(event.target.value)}
                placeholder="Optional"
              />
              {dailyError ? <FieldError>Enter a valid number.</FieldError> : null}
            </Field>

            <Field data-invalid={monthlyError ? true : undefined}>
              <FieldLabel htmlFor="key-monthly">Monthly limit</FieldLabel>
              <Input
                id="key-monthly"
                type="number"
                min={1}
                value={keyMonthly}
                onChange={(event) => setKeyMonthly(event.target.value)}
                placeholder="Optional"
              />
              {monthlyError ? (
                <FieldError>Enter a valid number.</FieldError>
              ) : null}
            </Field>
          </FieldGroup>

          <SheetFooter className="shrink-0 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save key"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-xs">{value ?? "—"}</span>
    </div>
  );
}
