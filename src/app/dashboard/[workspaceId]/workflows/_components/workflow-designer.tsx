"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BotIcon,
  CalendarClockIcon,
  CheckIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  WorkflowIcon,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

import { AppShell } from "@/components/dashboard/app-shell";
import { Metric } from "@/components/dashboard/metric";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  apiClient,
  type AgenticMode,
  type Workflow,
  type WorkflowUpdate,
} from "@/lib/api-client";
import { useClientSession } from "@/lib/hooks/use-client-session";
import { cn } from "@/lib/utils";

const ALL_SERVICES = ["selfie", "liveness", "document", "age"] as const;
const AGENTIC_MODES = [
  "disabled",
  "shadow",
  "assist_review",
  "auto_decide",
] as const;
type Service = (typeof ALL_SERVICES)[number];

const EMPTY_WORKFLOWS: Workflow[] = [];

const SERVICE_LABELS: Record<Service, string> = {
  selfie: "Selfie",
  liveness: "Liveness",
  document: "Document",
  age: "Age",
};

const AGENTIC_MODE_LABELS: Record<AgenticMode, string> = {
  disabled: "Disabled",
  shadow: "Shadow",
  assist_review: "Assist review",
  auto_decide: "Auto decide",
};

const AGENTIC_MODE_DETAILS: Record<AgenticMode, string> = {
  disabled: "Run deterministic checks only.",
  shadow: "Evaluate in the background without changing outcomes.",
  assist_review: "Recommend decisions for human review.",
  auto_decide: "Approve or reject when confidence and policy gates pass.",
};

type EditorState = {
  name: string;
  services: Service[];
  minAge: string;
  autoDecideAllowed: boolean;
  agenticMode: AgenticMode;
  confidenceThreshold: string;
};

function emptyState(): EditorState {
  return {
    name: "",
    services: [],
    minAge: "",
    autoDecideAllowed: true,
    agenticMode: "auto_decide",
    confidenceThreshold: "",
  };
}

function fromWorkflow(workflow: Workflow): EditorState {
  return {
    name: workflow.name,
    services: workflow.services.filter((service): service is Service =>
      (ALL_SERVICES as readonly string[]).includes(service),
    ),
    minAge: workflow.min_age?.toString() ?? "",
    autoDecideAllowed: workflow.auto_decide_allowed ?? true,
    agenticMode: workflow.agentic_mode ?? "disabled",
    confidenceThreshold:
      typeof workflow.auto_decide_confidence_threshold === "number"
        ? workflow.auto_decide_confidence_threshold.toFixed(2)
        : "",
  };
}

function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) return "Give the workflow a short name.";
  if (trimmed.length > 255) return "Keep the name under 255 characters.";
  return null;
}

function validateMinAge(value: string): string | null {
  if (value.trim().length === 0) return null;
  const n = Number(value);
  if (!Number.isInteger(n)) return "Enter a whole number.";
  if (n < 0 || n > 120) return "Choose a value between 0 and 120.";
  return null;
}

function validateServices(services: Service[]): string | null {
  if (services.length === 0) {
    return "Pick at least one service the workflow should run.";
  }
  return null;
}

function validateAgenticMode(
  mode: AgenticMode,
  services: Service[],
): string | null {
  if (mode === "disabled") return null;
  if (services.length === 0) {
    return "Agentic modes need at least one deterministic service selected.";
  }
  return null;
}

function validateConfidenceThreshold(
  value: string,
  mode: AgenticMode,
): string | null {
  if (mode !== "auto_decide" || value.trim().length === 0) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return "Enter a decimal between 0.0 and 1.0.";
  if (n < 0 || n > 1) return "Choose a value between 0.0 and 1.0.";
  return null;
}

export function WorkflowDesigner({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const session = useClientSession();
  const role = session.data?.organizationRole ?? null;
  const canEditConfidenceThreshold =
    role === "client_owner" || role === "client_admin";
  const queryClient = useQueryClient();
  const workflowsQuery = useQuery({
    queryKey: ["workspace-workflows", workspaceId],
    queryFn: () => apiClient.listWorkspaceWorkflows(workspaceId),
    enabled: Boolean(session.data?.authenticated && workspaceId),
  });
  const workflows = useMemo(
    () => workflowsQuery.data ?? EMPTY_WORKFLOWS,
    [workflowsQuery.data],
  );

  const [editor, setEditor] = useState<EditorState | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      services: Service[];
      min_age?: number;
      auto_decide_allowed?: boolean;
      agentic_mode?: AgenticMode;
      auto_decide_confidence_threshold?: number | null;
    }) => apiClient.createWorkspaceWorkflow(workspaceId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["workspace-workflows", workspaceId],
      });
      setEditor(null);
      toast.success("Workflow created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not create workflow");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      workflowId,
      payload,
    }: {
      workflowId: string;
      payload: WorkflowUpdate;
    }) =>
      apiClient.patchWorkspaceWorkflow(
        workspaceId,
        workflowId,
        payload,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["workspace-workflows", workspaceId],
      });
      setEditor(null);
      setEditingId(null);
      toast.success("Workflow updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not update workflow");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (workflowId: string) =>
      apiClient.deleteWorkspaceWorkflow(workspaceId, workflowId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["workspace-workflows", workspaceId],
      });
      setPendingDeleteId(null);
      toast.success("Workflow deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not delete workflow");
    },
  });

  const isOpen = editor !== null;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !createMutation.isPending && !updateMutation.isPending) {
        setEditor(null);
        setEditingId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, createMutation.isPending, updateMutation.isPending]);

  function openCreate() {
    setEditingId(null);
    setEditor(emptyState());
  }

  function openEdit(workflow: Workflow) {
    setEditingId(workflow.workflow_id);
    setEditor(fromWorkflow(workflow));
  }

  function closeEditor() {
    if (createMutation.isPending || updateMutation.isPending) return;
    setEditor(null);
    setEditingId(null);
  }

  function toggleService(service: Service) {
    setEditor((current) => {
      if (!current) return current;
      const has = current.services.includes(service);
      const services = has
        ? current.services.filter((entry) => entry !== service)
        : [...current.services, service];
      return {
        ...current,
        services,
        agenticMode:
          services.length === 0 && current.agenticMode !== "disabled"
            ? "disabled"
            : current.agenticMode,
      };
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    const nameError = validateName(editor.name);
    const ageError = validateMinAge(editor.minAge);
    const servicesError = validateServices(editor.services);
    const agenticError = validateAgenticMode(
      editor.agenticMode,
      editor.services,
    );
    const confidenceError = canEditConfidenceThreshold
      ? validateConfidenceThreshold(
          editor.confidenceThreshold,
          editor.agenticMode,
        )
      : null;
    if (nameError || ageError || servicesError || agenticError || confidenceError) {
      return;
    }

    const payload: WorkflowUpdate = {
      name: editor.name.trim(),
      services: editor.services,
      min_age:
        editor.minAge.trim().length > 0 ? Number(editor.minAge) : undefined,
      auto_decide_allowed: editor.autoDecideAllowed,
      agentic_mode: editor.agenticMode,
    };
    if (canEditConfidenceThreshold) {
      payload.auto_decide_confidence_threshold =
        editor.agenticMode === "auto_decide"
          ? editor.confidenceThreshold.trim().length > 0
            ? Number(editor.confidenceThreshold)
            : null
          : null;
    }

    if (editingId) {
      updateMutation.mutate({ workflowId: editingId, payload });
    } else {
      createMutation.mutate({
        name: payload.name as string,
        services: payload.services as Service[],
        min_age: payload.min_age,
        auto_decide_allowed: payload.auto_decide_allowed,
        agentic_mode: payload.agentic_mode,
        auto_decide_confidence_threshold:
          payload.auto_decide_confidence_threshold,
      });
    }
  }

  const editingWorkflow = useMemo(
    () =>
      editingId ? workflows.find((workflow) => workflow.workflow_id === editingId) ?? null : null,
    [editingId, workflows],
  );

  if (!session.data?.authenticated) {
    return (
      <AppShell audience="client">
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
          <header className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Verification policies
            </h1>
            <p className="text-muted-foreground">
              Please sign in to manage your workflows.
            </p>
          </header>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell audience="client">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-3">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Workflow designer
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-3xl font-semibold tracking-tight">
                Verification policies
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Define the checks each verification session runs. Pass a
                workflow ID to{" "}
                <code className="font-mono text-xs">/verify</code> and the
                capture wizard will adapt to its services.
              </p>
            </div>
            <Button onClick={openCreate}>
              <PlusIcon data-icon="inline-start" />
              New workflow
            </Button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Workflow metrics">
          <Metric
            label="Total workflows"
            value={workflowsQuery.isLoading ? "—" : workflows.length}
            icon={WorkflowIcon}
            description="Active policies in this workspace"
          />
          <Metric
            label="With min age"
            value={
              workflowsQuery.isLoading
                ? "—"
                : workflows.filter((w) => typeof w.min_age === "number").length
            }
            icon={CalendarClockIcon}
            description="Reject sessions below this age"
          />
          <Metric
            label="Most recent"
            value={
              workflowsQuery.isLoading || workflows.length === 0
                ? "—"
                : format(new Date(workflows[0].created_at), "MMM d")
            }
            icon={CheckIcon}
            description={
              workflows.length === 0 ? "No workflows yet" : "Most recent created date"
            }
          />
        </section>

        <section aria-label="Workflow list">
          {workflowsQuery.isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          ) : workflows.length === 0 ? (
            <EmptyWorkflows onCreate={openCreate} />
          ) : (
            <ul className="flex flex-col gap-4">
              {workflows.map((workflow) => {
                const isPendingDelete =
                  pendingDeleteId === workflow.workflow_id &&
                  deleteMutation.isPending;
                return (
                  <li key={workflow.workflow_id}>
                    <Card>
                      <CardHeader className="flex flex-row items-start justify-between gap-3">
                        <div className="flex flex-col gap-1.5 min-w-0">
                          <CardTitle className="text-base">
                            {workflow.name}
                          </CardTitle>
                          <CardDescription className="font-mono text-xs">
                            {workflow.workflow_id}
                          </CardDescription>
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(workflow)}
                          >
                            <PencilIcon data-icon="inline-start" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPendingDeleteId(workflow.workflow_id)
                            }
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2Icon data-icon="inline-start" />
                            Delete
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-3">
                        <div className="flex flex-wrap gap-1.5">
                          {workflow.services.map((service) => (
                            <Badge key={service} variant="secondary">
                              {service}
                            </Badge>
                          ))}
                          <Badge
                            variant={
                              workflow.auto_decide_allowed ?? true
                                ? "secondary"
                                : "outline"
                            }
                          >
                            Auto-decide{" "}
                            {workflow.auto_decide_allowed ?? true
                              ? "allowed"
                              : "blocked"}
                          </Badge>
                          <Badge variant="outline">
                            Agent mode:{" "}
                            {AGENTIC_MODE_LABELS[
                              workflow.agentic_mode ?? "disabled"
                            ]}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            Min age:{" "}
                            <span className="font-mono text-foreground">
                              {workflow.min_age ?? "—"}
                            </span>
                          </span>
                          <span>
                            Confidence threshold:{" "}
                            <span className="font-mono text-foreground">
                              {formatConfidenceThreshold(
                                workflow.auto_decide_confidence_threshold,
                              )}
                            </span>
                          </span>
                          <span>
                            Created{" "}
                            <span className="font-mono text-foreground">
                              {format(new Date(workflow.created_at), "PPP")}
                            </span>
                          </span>
                        </div>
                        {pendingDeleteId === workflow.workflow_id ? (
                          <div className="flex flex-col gap-3 rounded-xl border border-dashed bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium">
                                Delete this workflow?
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Sessions already created with this ID keep
                                running, but new sessions cannot use it.
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPendingDeleteId(null)}
                                disabled={isPendingDelete}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  deleteMutation.mutate(workflow.workflow_id)
                                }
                                disabled={isPendingDelete}
                              >
                                {isPendingDelete ? (
                                  <Spinner data-icon="inline-start" />
                                ) : (
                                  <Trash2Icon data-icon="inline-start" />
                                )}
                                {isPendingDelete ? "Deleting…" : "Delete"}
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      <Sheet open={isOpen} onOpenChange={(open) => !open && closeEditor()}>
        <SheetContent className="flex flex-col gap-0 p-0">
          <form
            onSubmit={submit}
            className="flex h-full flex-col"
            aria-labelledby="workflow-editor-title"
          >
            <SheetHeader className="border-b p-4">
              <SheetTitle id="workflow-editor-title">
                {editingId ? "Edit workflow" : "New workflow"}
              </SheetTitle>
              <SheetDescription>
                {editingId
                  ? `Editing ${editingWorkflow?.name ?? "a workflow"}.`
                  : "A workflow bundles the checks each verification session runs."}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-4">
              <FieldGroup>
                <WorkflowFormFields
                  editor={editor}
                  canEditConfidenceThreshold={canEditConfidenceThreshold}
                  onToggle={toggleService}
                  onChange={(patch) =>
                    setEditor((current) =>
                      current ? { ...current, ...patch } : current,
                    )
                  }
                />
              </FieldGroup>
            </div>
            <SheetFooter className="border-t p-4">
              <SheetClose render={<Button type="button" variant="ghost" />}>
                Cancel
              </SheetClose>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Spinner data-icon="inline-start" />
                ) : null}
                {editingId ? "Save changes" : "Create workflow"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

function WorkflowFormFields({
  editor,
  canEditConfidenceThreshold,
  onChange,
  onToggle,
}: {
  editor: EditorState | null;
  canEditConfidenceThreshold: boolean;
  onToggle: (service: Service) => void;
  onChange: (patch: Partial<EditorState>) => void;
}) {
  if (!editor) {
    return (
      <Field>
        <FieldLabel>Loading…</FieldLabel>
      </Field>
    );
  }
  const nameError = validateName(editor.name);
  const ageError = validateMinAge(editor.minAge);
  const servicesError = validateServices(editor.services);
  const agenticError = validateAgenticMode(
    editor.agenticMode,
    editor.services,
  );
  const confidenceError = canEditConfidenceThreshold
    ? validateConfidenceThreshold(editor.confidenceThreshold, editor.agenticMode)
    : null;
  const hasDeterministicService = editor.services.length > 0;
  return (
    <>
      <Field data-invalid={Boolean(nameError) || undefined}>
        <FieldLabel htmlFor="workflow-name">Name</FieldLabel>
        <Input
          id="workflow-name"
          value={editor.name}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="Standard KYC"
          autoComplete="off"
          maxLength={255}
          aria-invalid={Boolean(nameError)}
        />
        <FieldDescription>
          Visible in the dashboard and surfaced on the verify page.
        </FieldDescription>
        {nameError ? <FieldError>{nameError}</FieldError> : null}
      </Field>

      <Field data-invalid={Boolean(servicesError) || undefined}>
        <FieldLabel>Services</FieldLabel>
        <div
          role="group"
          aria-label="Workflow services"
          className="flex flex-wrap gap-2"
        >
          {ALL_SERVICES.map((service) => {
            const active = editor.services.includes(service);
            return (
              <button
                key={service}
                type="button"
                onClick={() => onToggle(service)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                )}
              >
                {active ? (
                  <CheckIcon className="size-3.5" aria-hidden />
                ) : null}
                {SERVICE_LABELS[service]}
              </button>
            );
          })}
        </div>
        <FieldDescription>
          {servicesError ? (
            <span className="text-destructive">{servicesError}</span>
          ) : (
            "Each service is one family of AI checks. Sessions run all of them."
          )}
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel>Agentic decisioning</FieldLabel>
        <button
          type="button"
          role="switch"
          aria-checked={editor.autoDecideAllowed}
          onClick={() => {
            const nextAllowed = !editor.autoDecideAllowed;
            onChange({
              autoDecideAllowed: nextAllowed,
              agenticMode: nextAllowed ? "auto_decide" : "disabled",
            });
          }}
          className={cn(
            "flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-4 text-left",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            editor.autoDecideAllowed
              ? "border-primary/40 bg-primary/5"
              : "border-border bg-muted/30",
          )}
        >
          <span className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              Automatic decisions
            </span>
            <span className="text-xs text-muted-foreground">
              On by default. Deterministic safeguards still block approvals for
              under-age users, face mismatch, liveness failure, and tenant
              duplicate cases.
            </span>
          </span>
          <span
            aria-hidden
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
              editor.autoDecideAllowed
                ? "border-primary bg-primary"
                : "border-border bg-muted",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-5 rounded-full bg-background shadow-sm transition-transform",
                editor.autoDecideAllowed ? "translate-x-5" : "translate-x-0.5",
              )}
            />
          </span>
        </button>
        <div
          role="group"
          aria-label="Agentic decisioning mode"
          className="grid gap-3"
        >
          {AGENTIC_MODES.map((mode) => {
            const isCurrent = mode === editor.agenticMode;
            const isUnavailable =
              mode !== "disabled" && !hasDeterministicService && !isCurrent;
            const isBlocked = mode === "auto_decide" && !editor.autoDecideAllowed;
            return (
              <button
                key={mode}
                type="button"
                onClick={() =>
                  onChange({
                    agenticMode: mode,
                    autoDecideAllowed:
                      mode === "auto_decide" ? true : editor.autoDecideAllowed,
                  })
                }
                disabled={isUnavailable}
                aria-disabled={isUnavailable}
                aria-pressed={isCurrent}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isCurrent
                    ? "border-primary/40 bg-primary/5 text-foreground"
                    : "border-border bg-muted/30 text-muted-foreground",
                  isUnavailable ? "opacity-50" : "hover:border-foreground/40",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border",
                    isCurrent
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground",
                  )}
                >
                  <BotIcon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {AGENTIC_MODE_LABELS[mode]}
                    </span>
                    {mode === "auto_decide" ? (
                      <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                        Recommended
                      </Badge>
                    ) : null}
                    {isCurrent ? (
                      <Badge className="h-5 px-1.5 text-[10px]">
                        Selected
                      </Badge>
                    ) : null}
                    {isBlocked ? (
                      <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                        Blocked
                      </Badge>
                    ) : null}
                  </span>
                  <span className="text-muted-foreground mt-1 block text-xs leading-5">
                    {AGENTIC_MODE_DETAILS[mode]}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <FieldDescription>
          {agenticError ? (
            <span className="text-destructive">{agenticError}</span>
          ) : (
            "Existing OCR, face, liveness, duplicate, and age tools run first. Model calls are reserved for ambiguous cases. Auto-decide can be allowed at the workflow level, but the backend still applies provider, budget, and deterministic override gates."
          )}
        </FieldDescription>
      </Field>

      {canEditConfidenceThreshold && editor.agenticMode === "auto_decide" ? (
        <Field data-invalid={Boolean(confidenceError) || undefined}>
          <FieldLabel htmlFor="workflow-confidence-threshold">
            Auto-decide confidence threshold
          </FieldLabel>
          <Input
            id="workflow-confidence-threshold"
            type="number"
            inputMode="decimal"
            min={0}
            max={1}
            step={0.01}
            value={editor.confidenceThreshold}
            onChange={(event) =>
              onChange({ confidenceThreshold: event.target.value })
            }
            placeholder="0.95"
            aria-invalid={Boolean(confidenceError)}
          />
          <FieldDescription>
            Recommended range is 0.90-0.99. Leave blank to use the default
            score bands.
          </FieldDescription>
          {confidenceError ? <FieldError>{confidenceError}</FieldError> : null}
        </Field>
      ) : null}

      <Field data-invalid={Boolean(ageError) || undefined}>
        <FieldLabel htmlFor="workflow-min-age">
          Minimum age{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </FieldLabel>
        <Input
          id="workflow-min-age"
          type="number"
          inputMode="numeric"
          min={0}
          max={120}
          value={editor.minAge}
          onChange={(event) => onChange({ minAge: event.target.value })}
          aria-invalid={Boolean(ageError)}
        />
        <FieldDescription>
          Sessions whose extracted age is below this are rejected
          automatically.
        </FieldDescription>
        {ageError ? <FieldError>{ageError}</FieldError> : null}
      </Field>
    </>
  );
}

function EmptyWorkflows({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>No workflows yet</CardTitle>
        <CardDescription>
          A workflow is the policy you pass to{" "}
          <code className="font-mono text-xs">/verify?workflow_id=...</code> to
          say which checks each session runs. Without one, the verify page
          will not start.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onCreate}>
          <PlusIcon data-icon="inline-start" />
          Create your first workflow
        </Button>
      </CardContent>
    </Card>
  );
}

function formatConfidenceThreshold(value: number | null | undefined): string {
  if (typeof value !== "number") {
    return "Not configured - using the default score bands";
  }
  return value.toFixed(2);
}
