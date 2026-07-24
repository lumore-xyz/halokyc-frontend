"use client";

import { type FormEvent, useId, useState } from "react";
import NextLink from "next/link";
import { MoreHorizontalIcon, PlusIcon, UserPlusIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  apiClient,
  type ApiError,
  type ClientRole,
  type OrganizationMember,
  type OrganizationMemberInviteRequest,
  type OrganizationMemberUpdateRequest,
  type UserStatus,
} from "@/lib/api-client";
import { useClientSession } from "@/lib/hooks/use-client-session";
import { useBillingEntitlements } from "@/lib/hooks/use-billing";
import { useOrganization, useOrganizationMembers } from "@/lib/hooks/use-organization";

const ROLE_LABEL: Record<ClientRole, string> = {
  client_owner: "Owner",
  client_admin: "Admin",
  client_reviewer: "Reviewer",
  client_developer: "Developer",
};

const STATUS_LABEL: Record<UserStatus, string> = {
  active: "Active",
  disabled: "Disabled",
  invited: "Invited",
};

export function TeamManager() {
  const session = useClientSession();
  const organizationId = session.data?.organizationId ?? null;
  const organization = useOrganization();
  const members = useOrganizationMembers();
  const entitlements = useBillingEntitlements();
  const [inviteOpen, setInviteOpen] = useState(false);

  const ownerCount = (members.data ?? []).filter(
    (member) => member.role === "client_owner" && member.status === "active",
  ).length;
  const currentMemberId = session.data?.organizationMemberId ?? null;
  const memberLimit = entitlements.data?.limits.members ?? null;
  const memberLimitReached =
    memberLimit !== null &&
    (entitlements.data?.usage.members ?? members.data?.length ?? 0) >=
      memberLimit;

  return (
    <>
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Team</h1>
          <p className="text-muted-foreground max-w-2xl">
            Invite teammates and decide who can review verifications, manage
            integration settings, or view sensitive evidence. Owner and admin
            only.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setInviteOpen(true)}
          disabled={
            !organizationId ||
            members.isLoading ||
            organization.data?.status !== "active" ||
            memberLimitReached
          }
        >
          <UserPlusIcon data-icon="inline-start" />
          Invite teammate
        </Button>
      </header>

      {memberLimitReached ? (
        <Alert>
          <AlertTitle>Sandbox team limit reached</AlertTitle>
          <AlertDescription>
            Your plan includes {memberLimit} team member.{" "}
            <NextLink href="/dashboard/billing" className="underline">
              Upgrade to Launch
            </NextLink>{" "}
            to invite teammates.
          </AlertDescription>
        </Alert>
      ) : null}

      <OrganizationSummaryCard
        name={organization.data?.name ?? null}
        memberCount={members.data?.length ?? 0}
        ownerCount={ownerCount}
      />

      {members.error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load team members</AlertTitle>
          <AlertDescription>
            Confirm your session and try refreshing the page.
          </AlertDescription>
        </Alert>
      ) : null}

      {members.isLoading ? (
        <Card>
          <CardContent className="flex justify-center py-12">
            <Spinner />
          </CardContent>
        </Card>
      ) : (members.data ?? []).length === 0 ? (
        <EmptyState
          icon={UserPlusIcon}
          title="No teammates yet"
          description="Invite the first teammate to share access to this organization."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              Newest first. Click an entry to change role or disable access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(members.data ?? []).map((member) => (
                  <MemberRow
                    key={member.organization_member_id}
                    member={member}
                    isSelf={member.organization_member_id === currentMemberId}
                    ownerCount={ownerCount}
                    onUpdate={() => members.refetch()}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <InviteSheet open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}

function OrganizationSummaryCard({
  name,
  memberCount,
  ownerCount,
}: {
  name: string | null;
  memberCount: number;
  ownerCount: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization</CardTitle>
        <CardDescription>
          The HaloKYC account this team belongs to.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <SummaryField label="Name" value={name ?? "—"} />
        <SummaryField label="Members" value={String(memberCount)} />
        <SummaryField label="Active owners" value={String(ownerCount)} />
      </CardContent>
    </Card>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function MemberRow({
  member,
  isSelf,
  ownerCount,
  onUpdate,
}: {
  member: OrganizationMember;
  isSelf: boolean;
  ownerCount: number;
  onUpdate: () => void;
}) {
  const session = useClientSession();
  const organizationId = session.data?.organizationId ?? null;
  const update = useMutation<
    OrganizationMember,
    ApiError,
    OrganizationMemberUpdateRequest
  >({
    mutationFn: (payload) => {
      if (!organizationId) {
        throw new Error("Not signed in");
      }
      return apiClient.updateOrganizationMember(
        organizationId,
        member.organization_member_id,
        payload,
      );
    },
    onSuccess: () => {
      toast.success(`${member.email} updated.`);
      onUpdate();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Could not update member.",
      );
    },
  });

  const isLastOwner =
    member.role === "client_owner" &&
    member.status === "active" &&
    ownerCount <= 1;

  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {member.full_name ?? member.email}
            {isSelf ? (
              <Badge variant="secondary" className="ml-2">
                You
              </Badge>
            ) : null}
          </span>
          <span className="text-muted-foreground text-xs">{member.email}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{ROLE_LABEL[member.role]}</Badge>
      </TableCell>
      <TableCell>
        <Badge
          variant={member.status === "active" ? "default" : "destructive"}
        >
          {STATUS_LABEL[member.status]}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground text-xs">
        {format(new Date(member.created_at), "PP")}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Manage ${member.email}`}
                disabled={isSelf || update.isPending}
              />
            }
          >
            <MoreHorizontalIcon className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Change role</DropdownMenuLabel>
              {(Object.keys(ROLE_LABEL) as ClientRole[]).map((role) => (
                <DropdownMenuItem
                  key={role}
                  disabled={role === member.role || (isLastOwner && role !== "client_owner")}
                  onClick={() =>
                    update.mutate({
                      role,
                      full_name: member.full_name,
                      status: member.status,
                    })
                  }
                >
                  {ROLE_LABEL[role]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuItem
                disabled={isLastOwner}
                onClick={() =>
                  update.mutate({
                    status: member.status === "active" ? "disabled" : "active",
                    full_name: member.full_name,
                    role: member.role,
                  })
                }
              >
                {member.status === "active" ? "Disable account" : "Re-enable account"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function InviteSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const session = useClientSession();
  const queryClient = useQueryClient();
  const organizationId = session.data?.organizationId ?? null;
  const emailId = useId();
  const nameId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<ClientRole>("client_developer");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const invite = useMutation<
    OrganizationMember,
    ApiError,
    OrganizationMemberInviteRequest
  >({
    mutationFn: (payload) => {
      if (!organizationId) {
        throw new Error("Not signed in");
      }
      return apiClient.inviteOrganizationMember(organizationId, payload);
    },
    onSuccess: (data) => {
      toast.success(`${data.email} invited.`);
      onClose();
      setEmail("");
      setName("");
      setPassword("");
      setEmailError(null);
      setPasswordError(null);
      void queryClient.invalidateQueries({
        queryKey: ["organization-members", organizationId],
      });
    },
  });

  function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setPasswordError("Use at least 8 characters.");
      return;
    }
    setEmailError(null);
    setPasswordError(null);
    invite.mutate({
      email: normalizedEmail,
      full_name: name.trim() || null,
      password,
      role,
    });
  }

  function closeSheet() {
    if (invite.isPending) return;
    onClose();
    setEmail("");
    setName("");
    setPassword("");
    setEmailError(null);
    setPasswordError(null);
    invite.reset();
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
          onSubmit={handleInvite}
          aria-labelledby="team-invite-title"
        >
          <SheetHeader className="border-b p-4">
            <SheetTitle id="team-invite-title">Invite teammate</SheetTitle>
            <SheetDescription>
              HaloKYC creates a new user account and adds the member to your
              organization with the role you select.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <FieldGroup>
              <Field data-invalid={emailError ? true : undefined}>
                <FieldLabel htmlFor={emailId}>Email</FieldLabel>
                <Input
                  id={emailId}
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (emailError) setEmailError(null);
                    if (invite.error) invite.reset();
                  }}
                  autoComplete="email"
                  autoFocus
                  disabled={invite.isPending}
                  required
                />
                {emailError ? (
                  <FieldError id={`${emailId}-error`}>{emailError}</FieldError>
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor={nameId}>Full name (optional)</FieldLabel>
                <Input
                  id={nameId}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={invite.isPending}
                  maxLength={255}
                />
              </Field>
              <Field data-invalid={passwordError ? true : undefined}>
                <FieldLabel htmlFor={passwordId}>Initial password</FieldLabel>
                <Input
                  id={passwordId}
                  type="text"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (passwordError) setPasswordError(null);
                    if (invite.error) invite.reset();
                  }}
                  autoComplete="new-password"
                  disabled={invite.isPending}
                  minLength={8}
                />
                <FieldDescription>
                  Share this once with the new teammate. They can change it
                  after signing in.
                </FieldDescription>
                {passwordError ? (
                  <FieldError id={`${passwordId}-error`}>
                    {passwordError}
                  </FieldError>
                ) : null}
              </Field>
              <Field>
                <FieldLabel>Role</FieldLabel>
                <div
                  role="radiogroup"
                  aria-label="Role"
                  className="flex flex-wrap gap-2"
                >
                  {(Object.keys(ROLE_LABEL) as ClientRole[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={role === key}
                      onClick={() => setRole(key)}
                      disabled={invite.isPending}
                      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[active=true]:border-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                      data-active={role === key}
                    >
                      {ROLE_LABEL[key]}
                    </button>
                  ))}
                </div>
                <FieldDescription>
                  Owners and admins manage members, workspaces, and billing.
                  Reviewers decide manual reviews. Developers handle integration
                  setup.
                </FieldDescription>
              </Field>
              {invite.error ? (
                <Alert variant="destructive">
                  <AlertTitle>Could not invite teammate</AlertTitle>
                  <AlertDescription>
                    {invite.error instanceof Error
                      ? invite.error.message
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
            <Button type="submit" disabled={invite.isPending}>
              {invite.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <PlusIcon data-icon="inline-start" />
              )}
              Invite
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
