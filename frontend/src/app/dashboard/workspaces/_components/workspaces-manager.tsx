"use client";

import { type FormEvent, useId, useState } from "react";
import { format } from "date-fns";
import NextLink from "next/link";
import {
  ArrowRightIcon,
  BoxesIcon,
  MoreHorizontalIcon,
  PlusIcon,
} from "lucide-react";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  type Workspace,
  type WorkspaceCreate,
  type WorkspaceUpdate,
} from "@/lib/api-client";
import { useClientSession } from "@/lib/hooks/use-client-session";
import { useWorkspaces } from "@/lib/hooks/use-workspaces";

const STATUS_LABEL: Record<Workspace["status"], string> = {
  active: "Active",
  disabled: "Disabled",
  archived: "Archived",
};

export function WorkspacesManager() {
  const session = useClientSession();
  const workspaces = useWorkspaces();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Workspace | null>(null);
  const workspacesData = workspaces.data ?? [];

  return (
    <>
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground max-w-2xl">
            Group verifications, API keys, and reviews by product. Owner and
            admin only.
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          New workspace
        </Button>
      </header>

      {workspaces.error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load workspaces</AlertTitle>
          <AlertDescription>
            Confirm your session and try refreshing the page.
          </AlertDescription>
        </Alert>
      ) : null}

      {workspaces.isLoading ? (
        <Card>
          <CardContent className="flex justify-center py-12">
            <Spinner />
          </CardContent>
        </Card>
      ) : workspacesData.length === 0 ? (
        <EmptyState
          icon={BoxesIcon}
          title="No workspaces yet"
          description="Create your first workspace to organise verifications, keys, and reviews."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Workspaces</CardTitle>
            <CardDescription>
              Newest first. Open a workspace to see its verification activity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workspacesData.map((workspace) => (
                  <WorkspaceRow
                    key={workspace.workspace_id}
                    workspace={workspace}
                    onEdit={() => setEditing(workspace)}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <CreateSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(created) => {
          setCreateOpen(false);
          toast.success(`${created.name} created.`);
          if (session.data?.authenticated) {
            // Best-effort: route the user into the new workspace.
            window.location.href = `/dashboard/${created.workspace_id}`;
          }
        }}
      />

      {editing ? (
        <EditSheet
          workspace={editing}
          onClose={() => setEditing(null)}
          onUpdated={() => {
            setEditing(null);
            void workspaces.refetch();
          }}
        />
      ) : null}
    </>
  );
}

function WorkspaceRow({
  workspace,
  onEdit,
}: {
  workspace: Workspace;
  onEdit: () => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">{workspace.name}</span>
          {workspace.description ? (
            <span className="text-muted-foreground line-clamp-1 text-xs">
              {workspace.description}
            </span>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="font-mono text-xs">{workspace.slug}</TableCell>
      <TableCell>
        <Badge variant={workspace.status === "active" ? "default" : "outline"}>
          {STATUS_LABEL[workspace.status]}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground text-xs">
        {format(new Date(workspace.created_at), "PP")}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Manage ${workspace.name}`}
              />
            }
          >
            <MoreHorizontalIcon className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
              <DropdownMenuItem render={<NextLink href={`/dashboard/${workspace.workspace_id}`} />}>
                <ArrowRightIcon />
                <span>Open workspace</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <span>Edit details</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuItem disabled>
                <span className="text-muted-foreground text-xs">
                  Pause and reactivate from the edit panel.
                </span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function CreateSheet({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (workspace: Workspace) => void;
}) {
  const nameId = useId();
  const descriptionId = useId();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  const create = useMutation<Workspace, ApiError, WorkspaceCreate>({
    mutationFn: apiClient.createWorkspace,
    onSuccess: (data) => {
      setName("");
      setDescription("");
      setNameError(null);
      onCreated(data);
    },
  });

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Workspace needs a name.");
      return;
    }
    if (trimmed.length > 255) {
      setNameError("Workspace name must be 255 characters or fewer.");
      return;
    }
    setNameError(null);
    create.mutate({
      name: trimmed,
      description: description.trim() || null,
    });
  }

  function closeSheet() {
    if (create.isPending) return;
    onClose();
    setName("");
    setDescription("");
    setNameError(null);
    create.reset();
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (next) return;
        closeSheet();
      }}
    >
      <SheetContent className="flex flex-col gap-0 p-0">
        <form
          className="flex h-full flex-col"
          onSubmit={handleCreate}
          aria-labelledby="workspace-create-title"
        >
          <SheetHeader className="border-b p-4">
            <SheetTitle id="workspace-create-title">New workspace</SheetTitle>
            <SheetDescription>
              Group verifications, API keys, and reviews under one workspace.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <FieldGroup>
              <Field data-invalid={nameError ? true : undefined}>
                <FieldLabel htmlFor={nameId}>Name</FieldLabel>
                <Input
                  id={nameId}
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (nameError) setNameError(null);
                    if (create.error) create.reset();
                  }}
                  disabled={create.isPending}
                  maxLength={255}
                  autoFocus
                />
                {nameError ? (
                  <FieldError id={`${nameId}-error`}>{nameError}</FieldError>
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor={descriptionId}>
                  Description (optional)
                </FieldLabel>
                <Input
                  id={descriptionId}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={create.isPending}
                  maxLength={2000}
                />
                <FieldDescription>
                  Helps teammates know which workspace to use for a specific
                  product or environment.
                </FieldDescription>
              </Field>
              {create.error ? (
                <Alert variant="destructive">
                  <AlertTitle>Could not create workspace</AlertTitle>
                  <AlertDescription>
                    {create.error instanceof Error
                      ? create.error.message
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
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <PlusIcon data-icon="inline-start" />
              )}
              Create workspace
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function EditSheet({
  workspace,
  onClose,
  onUpdated,
}: {
  workspace: Workspace;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const queryClient = useQueryClient();
  const nameId = useId();
  const descriptionId = useId();
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description ?? "");
  const [nameError, setNameError] = useState<string | null>(null);

  const update = useMutation<Workspace, ApiError, WorkspaceUpdate>({
    mutationFn: (payload) => apiClient.updateWorkspace(workspace.workspace_id, payload),
    onSuccess: (data) => {
      toast.success(`${data.name} updated.`);
      void queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      onUpdated();
    },
  });

  function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Workspace needs a name.");
      return;
    }
    if (trimmed.length > 255) {
      setNameError("Workspace name must be 255 characters or fewer.");
      return;
    }
    setNameError(null);
    update.mutate({
      name: trimmed,
      description: description.trim() || null,
    });
  }

  function closeSheet() {
    if (update.isPending) return;
    onClose();
    update.reset();
  }

  return (
    <Sheet
      open
      onOpenChange={(next) => {
        if (next) return;
        closeSheet();
      }}
    >
      <SheetContent className="flex flex-col gap-0 p-0">
        <form
          className="flex h-full flex-col"
          onSubmit={handleUpdate}
          aria-labelledby="workspace-edit-title"
        >
          <SheetHeader className="border-b p-4">
            <SheetTitle id="workspace-edit-title">
              Edit {workspace.name}
            </SheetTitle>
            <SheetDescription>
              HaloKYC derives a URL-safe slug from the workspace name. Slug
              changes are not supported in MVP.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <FieldGroup>
              <Field data-invalid={nameError ? true : undefined}>
                <FieldLabel htmlFor={nameId}>Name</FieldLabel>
                <Input
                  id={nameId}
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (nameError) setNameError(null);
                    if (update.error) update.reset();
                  }}
                  disabled={update.isPending}
                  maxLength={255}
                />
                {nameError ? (
                  <FieldError id={`${nameId}-error`}>{nameError}</FieldError>
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor={descriptionId}>Description</FieldLabel>
                <Input
                  id={descriptionId}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={update.isPending}
                  maxLength={2000}
                />
              </Field>
              {update.error ? (
                <Alert variant="destructive">
                  <AlertTitle>Could not update workspace</AlertTitle>
                  <AlertDescription>
                    {update.error instanceof Error
                      ? update.error.message
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
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <PlusIcon data-icon="inline-start" />
              )}
              Save changes
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}