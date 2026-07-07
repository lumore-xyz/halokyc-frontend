"use client";

import { type ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  DisabledAccountState,
  RouteAccessDenied,
  WorkspaceDisabledState,
} from "@/components/dashboard/route-access";
import { ApiError, type ClientRole } from "@/lib/api-client";
import { useClientSession } from "@/lib/hooks/use-client-session";
import { useWorkspace } from "@/lib/hooks/use-workspace";
import { useOrganization } from "@/lib/hooks/use-organization";

export type RouteGuardProps = {
  workspaceId: string;
  allowedRoles: ClientRole[];
  children: ReactNode;
  /** Where to send the user when access is denied. Defaults to the workspace overview. */
  fallbackHref?: string;
};

function isApiErrorWithStatus(error: unknown, status: number): boolean {
  return error instanceof ApiError && error.status === status;
}

export function RouteGuard({
  workspaceId,
  allowedRoles,
  children,
  fallbackHref,
}: RouteGuardProps) {
  const session = useClientSession();
  const workspace = useWorkspace(workspaceId);
  const organization = useOrganization();

  if (session.isLoading || workspace.isLoading || organization.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (!session.data?.authenticated) {
    return (
      <DisabledAccountState
        variant="organization"
        workspaceHref={fallbackHref}
      />
    );
  }

  // Disabled workspace (backend already enforces this, but we surface a calm state).
  if (
    workspace.data &&
    workspace.data.status !== "active"
  ) {
    return (
      <WorkspaceDisabledState
        workspaceHref={fallbackHref}
      />
    );
  }

  // Suspended or disabled organization.
  if (organization.data && organization.data.status !== "active") {
    return (
      <DisabledAccountState
        variant="organization"
        workspaceHref={fallbackHref}
      />
    );
  }

  // Backend returns 403 when the role is wrong; surface it cleanly.
  const fetchError = workspace.error;
  if (isApiErrorWithStatus(fetchError, 403)) {
    return (
      <RouteAccessDenied
        currentRole={session.data.organizationRole ?? null}
        allowedRoles={allowedRoles}
        workspaceHref={fallbackHref}
      />
    );
  }

  const role = session.data.organizationRole ?? null;
  if (!role || !allowedRoles.includes(role)) {
    return (
      <RouteAccessDenied
        currentRole={role}
        allowedRoles={allowedRoles}
        workspaceHref={fallbackHref}
      />
    );
  }

  return <>{children}</>;
}

export type OrganizationRouteGuardProps = {
  allowedRoles: ClientRole[];
  children: ReactNode;
  fallbackHref?: string;
};

export function OrganizationRouteGuard({
  allowedRoles,
  children,
  fallbackHref,
}: OrganizationRouteGuardProps) {
  const session = useClientSession();
  const organization = useOrganization();

  if (session.isLoading || organization.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (!session.data?.authenticated) {
    return (
      <DisabledAccountState
        variant="organization"
        workspaceHref={fallbackHref}
      />
    );
  }

  if (organization.data && organization.data.status !== "active") {
    return (
      <DisabledAccountState
        variant="organization"
        workspaceHref={fallbackHref}
      />
    );
  }

  const role = session.data.organizationRole ?? null;
  if (!role || !allowedRoles.includes(role)) {
    return (
      <RouteAccessDenied
        currentRole={role}
        allowedRoles={allowedRoles}
        workspaceHref={fallbackHref}
      />
    );
  }

  return <>{children}</>;
}