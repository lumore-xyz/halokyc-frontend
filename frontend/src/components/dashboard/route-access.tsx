"use client";

import { BanIcon, LockKeyholeIcon, ShieldOffIcon } from "lucide-react";
import NextLink from "next/link";

import { EmptyState } from "@/components/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { ClientRole, PlatformRole } from "@/lib/api-client";

const ROLE_LABELS: Record<ClientRole, string> = {
  client_owner: "Owner",
  client_admin: "Admin",
  client_reviewer: "Reviewer",
  client_developer: "Developer",
};

const PLATFORM_ROLE_LABELS: Record<PlatformRole, string> = {
  platform_owner: "Platform owner",
  platform_business_admin: "Business admin",
  platform_support: "Support",
  platform_sales: "Sales",
};

export type RouteAccessProps = {
  currentRole: ClientRole | null | undefined;
  allowedRoles: ClientRole[];
  /** Workspace context to redirect to when access is denied. */
  workspaceHref?: string;
  workspaceLabel?: string;
};

export function RouteAccessDenied({
  currentRole,
  allowedRoles,
  workspaceHref,
  workspaceLabel = "Workspace overview",
}: RouteAccessProps) {
  const currentLabel = currentRole ? ROLE_LABELS[currentRole] : "your role";
  const allowedLabels = allowedRoles
    .map((role) => ROLE_LABELS[role])
    .join(", ");

  return (
    <EmptyState
      icon={LockKeyholeIcon}
      title="This page is not part of your role"
      description={`Your current role is ${currentLabel}. This page is reserved for ${allowedLabels}. Ask an organization owner or admin to grant your role access, or pick a different task from the sidebar.`}
      action={
        workspaceHref ? (
          <NextLink
            href={workspaceHref}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            {workspaceLabel}
          </NextLink>
        ) : null
      }
    />
  );
}

export type DisabledAccountProps = {
  variant?: "organization" | "member";
  workspaceHref?: string;
};

export function DisabledAccountState({
  variant = "member",
  workspaceHref,
}: DisabledAccountProps) {
  const title =
    variant === "organization"
      ? "Organization is suspended"
      : "This account is disabled";
  const description =
    variant === "organization"
      ? "Your organization has been suspended. New verifications cannot be started until an administrator re-enables the account."
      : "Your account has been disabled by an organization owner. You can still see the workspace structure, but the actions that require an active account are not available.";

  return (
    <EmptyState
      icon={BanIcon}
      title={title}
      description={description}
      action={
        workspaceHref ? (
          <NextLink
            href={workspaceHref}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Back to workspace overview
          </NextLink>
        ) : (
          <Button variant="outline" type="button" disabled>
            Contact your organization owner
          </Button>
        )
      }
    />
  );
}

export type WorkspaceDisabledProps = {
  workspaceHref?: string;
};

export function WorkspaceDisabledState({
  workspaceHref,
}: WorkspaceDisabledProps) {
  return (
    <EmptyState
      icon={ShieldOffIcon}
      title="Workspace is disabled"
      description="This workspace is not accepting new verifications. Reach out to your organization owner to reactivate it."
      action={
        workspaceHref ? (
          <NextLink
            href={workspaceHref}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Back to workspaces
          </NextLink>
        ) : null
      }
    />
  );
}

export type PlatformAccessProps = {
  currentRole: PlatformRole | null | undefined;
  allowedRoles: PlatformRole[];
  workspaceHref?: string;
  workspaceLabel?: string;
};

export function PlatformAccessDenied({
  currentRole,
  allowedRoles,
  workspaceHref,
  workspaceLabel = "Admin overview",
}: PlatformAccessProps) {
  const currentLabel = currentRole
    ? PLATFORM_ROLE_LABELS[currentRole]
    : "your platform role";
  const allowedLabels = allowedRoles
    .map((role) => PLATFORM_ROLE_LABELS[role])
    .join(", ");

  return (
    <EmptyState
      icon={LockKeyholeIcon}
      title="This page is not part of your platform role"
      description={`Your current role is ${currentLabel}. This page is reserved for ${allowedLabels}. Ask a platform owner to update your role, or pick a different task from the sidebar.`}
      action={
        workspaceHref ? (
          <NextLink
            href={workspaceHref}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            {workspaceLabel}
          </NextLink>
        ) : null
      }
    />
  );
}