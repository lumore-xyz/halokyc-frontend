"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDownIcon, PlayIcon, WorkflowIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { apiClient, type Workflow } from "@/lib/api-client";
import { useApiKey } from "@/lib/hooks/use-api-key";
import { useClientSession } from "@/lib/hooks/use-client-session";
import { useRecentSessions } from "@/lib/hooks/use-recent-sessions";
import { useStartVerification } from "@/lib/hooks/use-start-verification";
import { cn } from "@/lib/utils";

import { InlineError } from "./console-shared";

const DEFAULT_METADATA = `{
  "name": "Jane Doe",
  "dob": "1995-02-28",
  "gender": "male"
}`;

const EMPTY_WORKFLOWS: Workflow[] = [];

function isValidUrl(value: string): boolean {
  if (value.length === 0) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function parseMetadata(value: string): {
  data?: Record<string, unknown>;
  error?: string;
} {
  const trimmed = value.trim();
  if (!trimmed) return { data: {} };
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (
      parsed === null ||
      Array.isArray(parsed) ||
      typeof parsed !== "object"
    ) {
      return { error: "Metadata must be a JSON object." };
    }
    return { data: parsed as Record<string, unknown> };
  } catch {
    return {
      error: 'Enter valid JSON, for example { "name": "Kritik Sah" }.',
    };
  }
}

export function StartVerificationCard({ workspaceId }: { workspaceId: string }) {
  const { apiKey } = useApiKey();
  const session = useClientSession();
  const router = useRouter();
  const mutation = useStartVerification();
  const { recordSession } = useRecentSessions();
  const [externalUserId, setExternalUserId] = useState("");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("");
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [metadataJson, setMetadataJson] = useState(DEFAULT_METADATA);
  const [callbackUrl, setCallbackUrl] = useState("");
  const [touched, setTouched] = useState(false);

  const workflowsQuery = useQuery({
    queryKey: ["workspace-workflows", workspaceId],
    queryFn: () => apiClient.listWorkspaceWorkflows(workspaceId),
    enabled: session.data?.authenticated,
  });
  const workflows = workflowsQuery.data ?? EMPTY_WORKFLOWS;
  const selectedWorkflow = useMemo(
    () =>
      workflows.find((workflow) => workflow.workflow_id === selectedWorkflowId),
    [workflows, selectedWorkflowId],
  );
  const parsedMetadata = useMemo(
    () => parseMetadata(metadataJson),
    [metadataJson],
  );

  const externalUserError =
    externalUserId.trim().length === 0
      ? "External ID is required."
      : externalUserId.length > 255
        ? "External ID must be 255 characters or fewer."
        : null;
  const workflowIdError =
    selectedWorkflowId.length === 0
      ? "Workflow is required."
      : selectedWorkflow
        ? null
        : "Select one of your saved workflows.";
  const metadataError = parsedMetadata.error ?? null;
  const callbackUrlError =
    callbackUrl.length > 0 && !isValidUrl(callbackUrl)
      ? "Must be a valid URL."
      : null;
  const hasErrors =
    externalUserError !== null ||
    workflowIdError !== null ||
    metadataError !== null ||
    callbackUrlError !== null;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (!apiKey || hasErrors || !parsedMetadata.data) return;
    try {
      const result = await mutation.mutateAsync({
        external_user_id: externalUserId.trim(),
        metadata: parsedMetadata.data,
        workflow_id: selectedWorkflowId,
        callback_url:
          callbackUrl.trim().length > 0 ? callbackUrl.trim() : undefined,
        apiKey,
      });
      toast.success(
        `Verification ${result.verification_id.slice(0, 8)} started`,
      );
      recordSession({
        verification_id: result.verification_id,
        external_user_id: externalUserId.trim(),
        created_at: new Date().toISOString(),
      });
      setExternalUserId("");
      setSelectedWorkflowId("");
      setMetadataJson(DEFAULT_METADATA);
      setCallbackUrl("");
      setTouched(false);
      router.push(
        `/verify?verification_id=${result.verification_id}&external_user_id=${encodeURIComponent(
          externalUserId.trim(),
        )}&callback_url=${encodeURIComponent(
          callbackUrl.trim(),
        )}&workflow_id=${selectedWorkflowId}`,
      );
    } catch {
      toast.error("Could not start verification");
    }
  }

  const showExternalError = touched && externalUserError !== null;
  const showWorkflowIdError = touched && workflowIdError !== null;
  const showMetadataError = touched && metadataError !== null;
  const showCallbackError = touched && callbackUrlError !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start a verification</CardTitle>
        <CardDescription>
          Creates a new session in{" "}
          <code className="font-mono">pending_upload</code>. You will be
          redirected to the detail page where you can upload the selfie and ID.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
          <FieldGroup>
            <Field data-invalid={showExternalError || undefined}>
              <FieldLabel htmlFor="external_user_id">External ID</FieldLabel>
              <Input
                id="external_user_id"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={showExternalError ? "true" : undefined}
                aria-describedby={
                  showExternalError ? "external_user_id-error" : undefined
                }
                placeholder="user_123"
                value={externalUserId}
                onChange={(event) => setExternalUserId(event.target.value)}
              />
              <FieldDescription>
                Your stable user or account identifier. HaloKYC uses it for
                activity lookup, duplicate checks, and callback payloads.
              </FieldDescription>
              {showExternalError ? (
                <FieldError id="external_user_id-error">
                  {externalUserError}
                </FieldError>
              ) : null}
            </Field>

            <Field data-invalid={showWorkflowIdError || undefined}>
              <FieldLabel htmlFor="workflow_id">Workflow</FieldLabel>
              <Popover open={workflowOpen} onOpenChange={setWorkflowOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      id="workflow_id"
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={workflowOpen}
                      aria-invalid={showWorkflowIdError ? "true" : undefined}
                      aria-describedby={
                        showWorkflowIdError ? "workflow_id-error" : undefined
                      }
                      disabled={
                        workflowsQuery.isLoading || workflows.length === 0
                      }
                      className="w-full justify-between"
                    />
                  }
                >
                  <span
                    className={cn(
                      "truncate",
                      !selectedWorkflow && "text-muted-foreground",
                    )}
                  >
                    {selectedWorkflow
                      ? selectedWorkflow.name
                      : workflowsQuery.isLoading
                        ? "Loading workflows..."
                        : "Search and select a workflow"}
                  </span>
                  <ChevronsUpDownIcon data-icon="inline-end" />
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-[min(28rem,calc(100vw-2rem))] p-0"
                >
                  <Command>
                    <CommandInput placeholder="Search workflows..." />
                    <CommandList>
                      <CommandEmpty>No workflows found.</CommandEmpty>
                      <CommandGroup heading="Workflows">
                        {workflows.map((workflow) => (
                          <CommandItem
                            key={workflow.workflow_id}
                            value={workflow.workflow_id}
                            keywords={[workflow.name, ...workflow.services]}
                            data-checked={
                              selectedWorkflowId === workflow.workflow_id
                                ? "true"
                                : undefined
                            }
                            onSelect={() => {
                              setSelectedWorkflowId(workflow.workflow_id);
                              setWorkflowOpen(false);
                            }}
                          >
                            <span className="flex min-w-0 flex-col gap-1">
                              <span className="truncate font-medium">
                                {workflow.name}
                              </span>
                              <span className="text-muted-foreground truncate font-mono text-xs">
                                {workflow.workflow_id}
                              </span>
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FieldDescription>
                Select one of your saved verification policies. The selected
                workflow determines which evidence and AI checks this session
                runs.
              </FieldDescription>
              {selectedWorkflow ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedWorkflow.services.map((service) => (
                    <Badge key={service} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              ) : null}
              {showWorkflowIdError ? (
                <FieldError id="workflow_id-error">
                  {workflowIdError}
                </FieldError>
              ) : null}
              {session.data?.authenticated &&
              !workflowsQuery.isLoading &&
              workflows.length === 0 ? (
                <Alert>
                  <WorkflowIcon />
                  <AlertTitle>No workflows yet</AlertTitle>
                  <AlertDescription className="flex flex-col gap-3">
                    Create a workflow first, then return here to start a
                    verification against that policy.
                    <Button
                      render={<Link href={`/dashboard/${workspaceId}/workflows`} />}
                      nativeButton={false}
                      variant="outline"
                      size="sm"
                    >
                      <WorkflowIcon data-icon="inline-start" />
                      Create workflow
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}
            </Field>

            <Field data-invalid={showMetadataError || undefined}>
              <FieldLabel htmlFor="metadata">Metadata</FieldLabel>
              <Textarea
                id="metadata"
                spellCheck={false}
                value={metadataJson}
                onChange={(event) => setMetadataJson(event.target.value)}
                aria-invalid={showMetadataError ? "true" : undefined}
                aria-describedby={
                  showMetadataError ? "metadata-error" : undefined
                }
                className="min-h-32 font-mono text-xs"
              />
              <FieldDescription>
                Optional JSON object copied onto the session for your own
                reconciliation, such as name, DOB, gender, plan, or region.
              </FieldDescription>
              {showMetadataError ? (
                <FieldError id="metadata-error">{metadataError}</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={showCallbackError || undefined}>
              <FieldLabel htmlFor="callback_url">
                Callback URL{" "}
                <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Input
                id="callback_url"
                type="url"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={showCallbackError ? "true" : undefined}
                aria-describedby={
                  showCallbackError ? "callback_url-error" : undefined
                }
                placeholder="https://example.com/webhook"
                value={callbackUrl}
                onChange={(event) => setCallbackUrl(event.target.value)}
              />
              <FieldDescription>
                A per-session webhook endpoint. HaloKYC sends the final decision
                here when the pipeline reaches approved, rejected, or review.
              </FieldDescription>
              {showCallbackError ? (
                <FieldError id="callback_url-error">
                  {callbackUrlError}
                </FieldError>
              ) : null}
            </Field>
          </FieldGroup>

          {mutation.error ? (
            <InlineError
              error={mutation.error}
              title="Could not start verification"
              onRetry={() => {
                setTouched(true);
              }}
            />
          ) : null}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!apiKey || mutation.isPending}
              aria-disabled={!apiKey || mutation.isPending}
            >
              <PlayIcon data-icon="inline-start" />
              {mutation.isPending ? "Starting..." : "Start verification"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
