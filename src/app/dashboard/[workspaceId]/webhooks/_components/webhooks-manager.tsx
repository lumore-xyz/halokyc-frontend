"use client";

import { type FormEvent, useId, useState } from "react";
import { PlusIcon, WebhookIcon } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
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
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import {
  apiClient,
  type ApiError,
  type WebhookEndpoint,
  type WebhookEndpointCreate,
} from "@/lib/api-client";
import { useClientSession } from "@/lib/hooks/use-client-session";

export function WebhooksManager({ workspaceId }: { workspaceId: string }) {
  const session = useClientSession();
  const queryClient = useQueryClient();
  const targetInputId = useId();
  const descriptionInputId = useId();
  const [createOpen, setCreateOpen] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");
  const [description, setDescription] = useState("");
  const [targetError, setTargetError] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ["workspace-webhooks", workspaceId],
    queryFn: () => apiClient.listWorkspaceWebhooks(workspaceId),
    enabled: Boolean(session.data?.authenticated && workspaceId),
  });

  const create = useMutation<WebhookEndpoint, ApiError, WebhookEndpointCreate>({
    mutationFn: (payload) =>
      apiClient.createWorkspaceWebhook(workspaceId, payload),
    onSuccess: () => {
      toast.success("Webhook endpoint added.");
      setCreateOpen(false);
      setTargetUrl("");
      setDescription("");
      setTargetError(null);
      void queryClient.invalidateQueries({
        queryKey: ["workspace-webhooks", workspaceId],
      });
    },
  });

  const endpoints = list.data ?? [];

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = targetUrl.trim();
    if (!trimmed) {
      setTargetError("Enter the URL HaloKYC should POST to.");
      return;
    }
    try {
      const parsed = new URL(trimmed);
      if (!/^https?:$/.test(parsed.protocol)) {
        setTargetError("Webhook URL must use http or https.");
        return;
      }
    } catch {
      setTargetError("Webhook URL is not a valid URL.");
      return;
    }
    setTargetError(null);
    create.mutate({
      target_url: trimmed,
      description: description.trim() ? description.trim() : null,
    });
  }

  function openSheet() {
    setCreateOpen(true);
    setTargetError(null);
    create.reset();
  }

  function closeSheet() {
    if (create.isPending) return;
    setCreateOpen(false);
    setTargetUrl("");
    setDescription("");
    setTargetError(null);
  }

  return (
    <>
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Webhooks</h1>
          <p className="text-muted-foreground max-w-2xl">
            Send verification status updates to a URL you control. We sign each
            request with the workspace HMAC secret.
          </p>
        </div>
        <Button type="button" onClick={openSheet}>
          <PlusIcon data-icon="inline-start" />
          Add endpoint
        </Button>
      </header>

      {create.error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not add webhook</AlertTitle>
          <AlertDescription>
            {create.error instanceof Error
              ? create.error.message
              : "An unexpected error occurred."}
          </AlertDescription>
        </Alert>
      ) : null}

      {list.isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex justify-center">
              <Spinner />
            </div>
          </CardContent>
        </Card>
      ) : endpoints.length === 0 ? (
        <EmptyState
          icon={WebhookIcon}
          title="No webhook endpoints"
          description="Add a URL to start receiving signed verification updates for this workspace."
          action={
            <Button type="button" onClick={openSheet}>
              <PlusIcon data-icon="inline-start" />
              Add endpoint
            </Button>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Endpoints</CardTitle>
            <CardDescription>
              Each request is signed with the workspace HMAC secret and retried
              on transient failures.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {endpoints.map((endpoint) => (
                  <TableRow key={endpoint.webhook_endpoint_id}>
                    <TableCell className="font-mono text-xs">
                      {endpoint.target_url}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {endpoint.description ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {endpoint.is_active ? "Active" : "Paused"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(endpoint.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Sheet
        open={createOpen}
        onOpenChange={(open) => {
          if (open) {
            openSheet();
            return;
          }
          closeSheet();
        }}
      >
        <SheetContent className="flex flex-col gap-0 p-0">
          <form
            className="flex h-full flex-col"
            onSubmit={handleCreate}
            aria-labelledby="webhook-create-title"
          >
            <SheetHeader className="border-b p-4">
              <SheetTitle id="webhook-create-title">Add webhook</SheetTitle>
              <SheetDescription>
                HaloKYC POSTs verification status updates to the URL below.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-4">
              <FieldGroup>
                <Field data-invalid={targetError ? true : undefined}>
                  <FieldLabel htmlFor={targetInputId}>Target URL</FieldLabel>
                  <Input
                    id={targetInputId}
                    value={targetUrl}
                    onChange={(event) => {
                      setTargetUrl(event.target.value);
                      if (targetError) setTargetError(null);
                      if (create.error) create.reset();
                    }}
                    placeholder="https://hooks.example.com/halokyc"
                    inputMode="url"
                    autoComplete="off"
                    spellCheck={false}
                    disabled={create.isPending}
                    aria-invalid={targetError ? true : undefined}
                    aria-describedby={
                      targetError ? `${targetInputId}-error` : undefined
                    }
                    autoFocus
                  />
                  <FieldDescription>
                    Use https:// for production endpoints. HaloKYC signs every
                    request with the workspace HMAC secret.
                  </FieldDescription>
                  {targetError ? (
                    <FieldError id={`${targetInputId}-error`}>
                      {targetError}
                    </FieldError>
                  ) : null}
                </Field>
                <Field>
                  <FieldLabel htmlFor={descriptionInputId}>
                    Description
                  </FieldLabel>
                  <Input
                    id={descriptionInputId}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Production webhook"
                    disabled={create.isPending}
                    maxLength={2000}
                  />
                  <FieldDescription>
                    Optional. Helps your team recognise where each endpoint is
                    consumed.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </div>
            <SheetFooter className="border-t p-4">
              <SheetClose render={<Button type="button" variant="ghost" />}>
                Cancel
              </SheetClose>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <PlusIcon data-icon="inline-start" />
                )}
                Add webhook
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}