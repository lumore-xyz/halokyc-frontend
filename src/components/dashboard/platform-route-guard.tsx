"use client";

import { type ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  PlatformAccessDenied,
} from "@/components/dashboard/route-access";
import { ApiError, type PlatformRole } from "@/lib/api-client";
import { useAdminSession } from "@/lib/hooks/use-admin-session";

export type PlatformRouteGuardProps = {
  allowedRoles: PlatformRole[];
  children: ReactNode;
  fallbackHref?: string;
};

function isApiErrorWithStatus(error: unknown, status: number): boolean {
  return error instanceof ApiError && error.status === status;
}

export function PlatformRouteGuard({
  allowedRoles,
  children,
  fallbackHref,
}: PlatformRouteGuardProps) {
  const session = useAdminSession();

  if (session.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (!session.data?.authenticated) {
    return (
      <PlatformAccessDenied
        currentRole={null}
        allowedRoles={allowedRoles}
        workspaceHref={fallbackHref}
      />
    );
  }

  const role = session.data.platformRole ?? null;
  if (!role || !allowedRoles.includes(role)) {
    return (
      <PlatformAccessDenied
        currentRole={role}
        allowedRoles={allowedRoles}
        workspaceHref={fallbackHref}
      />
    );
  }

  if (isApiErrorWithStatus(session.error, 403)) {
    return (
      <PlatformAccessDenied
        currentRole={role}
        allowedRoles={allowedRoles}
        workspaceHref={fallbackHref}
      />
    );
  }

  return <>{children}</>;
}