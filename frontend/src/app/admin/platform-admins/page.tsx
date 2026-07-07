"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { AppShell } from "@/components/dashboard/app-shell";
import { PlatformRouteGuard } from "@/components/dashboard/platform-route-guard";
import { EmptyState } from "@/components/empty-state";
import { ApiError, type PlatformRole } from "@/lib/api-client";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UsersIcon } from "lucide-react";
import { formatDate } from "@/lib/format";
import {
  useAdminPlatformAdmins,
  useInviteAdminPlatformAdmin,
  useUpdateAdminPlatformAdmin,
} from "@/lib/hooks/use-admin-console";

const ROLES: PlatformRole[] = [
  "platform_owner",
  "platform_business_admin",
  "platform_support",
  "platform_sales",
];

const ROLE_LABELS: Record<PlatformRole, string> = {
  platform_owner: "Platform owner",
  platform_business_admin: "Business admin",
  platform_support: "Support",
  platform_sales: "Sales",
};

export default function AdminPlatformAdminsPage() {
  return (
    <AppShell audience="admin">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
        <PlatformRouteGuard allowedRoles={["platform_owner"]} fallbackHref="/admin">
          <PlatformAdminsHub />
        </PlatformRouteGuard>
      </main>
    </AppShell>
  );
}

function PlatformAdminsHub() {
  const query = useAdminPlatformAdmins();
  const invite = useInviteAdminPlatformAdmin();

  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteFullName, setInviteFullName] = useState("");
  const [inviteRole, setInviteRole] = useState<PlatformRole>("platform_business_admin");
  const [inviteSubmitted, setInviteSubmitted] = useState(false);

  const emailError =
    inviteSubmitted && !/.+@.+\..+/.test(inviteEmail.trim())
      ? "Enter a valid email."
      : null;
  const passwordError =
    inviteSubmitted && invitePassword.length < 8
      ? "Password must be at least 8 characters."
      : null;

  const owners = query.data?.filter(
    (admin) => admin.role === "platform_owner" && admin.status === "active",
  ).length ?? 0;

  function submitInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInviteSubmitted(true);
    if (emailError || passwordError) return;
    invite.mutate(
      {
        email: inviteEmail.trim(),
        password: invitePassword,
        full_name: inviteFullName.trim() || null,
        role: inviteRole,
      },
      {
        onSuccess: () => {
          toast.success("Platform admin invited");
          setInviteEmail("");
          setInvitePassword("");
          setInviteFullName("");
          setInviteSubmitted(false);
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            toast.error(`Invite failed: ${err.status}`);
          } else {
            toast.error("Invite failed");
          }
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        icon={UsersIcon}
        title="Platform admins"
        description="Internal HaloKYC operators. Owners can invite, change roles, and disable access here. Role changes are audited."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invite platform admin</CardTitle>
            <CardDescription>
              Send an email + password; the new admin signs in with the
              standard admin login at <code>/admin/login</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={submitInvite}
              className="grid gap-4 sm:grid-cols-2"
              noValidate
            >
              <FieldGroup className="sm:col-span-2">
                <Field data-invalid={Boolean(emailError) || undefined}>
                  <FieldLabel htmlFor="invite-email">Email</FieldLabel>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="first.last@halokyc.com"
                  />
                  {emailError ? <FieldError>{emailError}</FieldError> : null}
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field data-invalid={Boolean(passwordError) || undefined}>
                  <FieldLabel htmlFor="invite-password">Temporary password</FieldLabel>
                  <Input
                    id="invite-password"
                    type="password"
                    autoComplete="new-password"
                    value={invitePassword}
                    onChange={(event) => setInvitePassword(event.target.value)}
                    minLength={8}
                    maxLength={255}
                  />
                  <FieldDescription>
                    8+ characters. Share with the new admin over a
                    secure channel; the platform does not store it.
                  </FieldDescription>
                  {passwordError ? (
                    <FieldError>{passwordError}</FieldError>
                  ) : null}
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="invite-full-name">Full name</FieldLabel>
                  <Input
                    id="invite-full-name"
                    value={inviteFullName}
                    onChange={(event) => setInviteFullName(event.target.value)}
                    placeholder="Optional"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup className="sm:col-span-2">
                <Field>
                  <FieldLabel htmlFor="invite-role">Role</FieldLabel>
                  <select
                    id="invite-role"
                    className="border-input bg-background text-foreground focus-visible:ring-ring/50 h-10 rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
                    value={inviteRole}
                    onChange={(event) =>
                      setInviteRole(event.target.value as PlatformRole)
                    }
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                  <FieldDescription>
                    Owners can invite others. Business admins cannot
                    promote to owner.
                  </FieldDescription>
                </Field>
              </FieldGroup>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" disabled={invite.isPending}>
                  {invite.isPending ? "Inviting…" : "Send invite"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active owners</CardTitle>
            <CardDescription>
              There must be at least one active platform owner at all
              times — the role-change UI blocks demoting the last one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-semibold">{owners}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              Active platform owners across the team.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All platform admins</CardTitle>
          <CardDescription>
            Change role, name, or status by editing a row.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (query.data?.length ?? 0) === 0 ? (
            <EmptyState
              icon={UsersIcon}
              title="No platform admins"
              description="No platform admins are registered."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data?.map((admin) => (
                  <PlatformAdminRow
                    key={admin.platform_admin_id}
                    admin={admin}
                    canModifyOwner={owners > 1}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PlatformAdminRow({
  admin,
  canModifyOwner,
}: {
  admin: {
    platform_admin_id: string;
    email: string;
    full_name: string | null;
    role: PlatformRole;
    status: "active" | "disabled" | "invited";
    created_at: string;
  };
  canModifyOwner: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [role, setRole] = useState<PlatformRole>(admin.role);
  const [status, setStatus] = useState<"active" | "disabled" | "invited">(
    admin.status,
  );
  const [fullName, setFullName] = useState(admin.full_name ?? "");

  const hook = useUpdateAdminPlatformAdmin(admin.platform_admin_id);
  const isOwner = admin.role === "platform_owner";

  function save() {
    hook.mutate(
      {
        role: role !== admin.role ? role : undefined,
        status: status !== admin.status ? status : undefined,
        full_name: fullName.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("Platform admin updated");
          setEditOpen(false);
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            toast.error(`Update failed: ${err.status}`);
          } else {
            toast.error("Update failed");
          }
        },
      },
    );
  }

  return (
    <TableRow>
      <TableCell>{admin.full_name ?? "—"}</TableCell>
      <TableCell className="text-muted-foreground text-xs">
        {admin.email}
      </TableCell>
      <TableCell>
        <Badge variant={isOwner ? "default" : "outline"}>
          {ROLE_LABELS[admin.role]}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge
          variant={admin.status === "active" ? "secondary" : "destructive"}
        >
          {admin.status}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground text-xs">
        {formatDate(admin.created_at)}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditOpen(true)}
          disabled={isOwner && !canModifyOwner}
        >
          Edit
        </Button>
      </TableCell>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit platform admin</DialogTitle>
            <DialogDescription>
              {admin.email}
            </DialogDescription>
          </DialogHeader>
          {isOwner && !canModifyOwner ? (
            <Alert variant="destructive">
              <AlertTitle>This is the last active platform owner.</AlertTitle>
              <AlertDescription>
                Promote another admin to owner before demoting or
                disabling this account.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col gap-3">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`admin-full-name-${admin.platform_admin_id}`}>
                    Full name
                  </FieldLabel>
                  <Input
                    id={`admin-full-name-${admin.platform_admin_id}`}
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`admin-role-${admin.platform_admin_id}`}>
                    Role
                  </FieldLabel>
                  <select
                    id={`admin-role-${admin.platform_admin_id}`}
                    className="border-input bg-background text-foreground focus-visible:ring-ring/50 h-10 rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value as PlatformRole)
                    }
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`admin-status-${admin.platform_admin_id}`}>
                    Status
                  </FieldLabel>
                  <select
                    id={`admin-status-${admin.platform_admin_id}`}
                    className="border-input bg-background text-foreground focus-visible:ring-ring/50 h-10 rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as "active" | "disabled" | "invited")
                    }
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                    <option value="invited">Invited</option>
                  </select>
                </Field>
              </FieldGroup>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={save}
              disabled={hook.isPending || (isOwner && !canModifyOwner)}
            >
              {hook.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TableRow>
  );
}