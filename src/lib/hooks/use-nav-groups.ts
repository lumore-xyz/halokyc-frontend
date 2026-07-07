"use client";

import { usePathname } from "next/navigation";

import {
  APP_NAV_GROUPS,
  type AppNavAudience,
  type AppNavGroup,
  type AppNavItem,
} from "@/components/dashboard/app-nav-config";
import type { ClientRole, PlatformRole } from "@/lib/api-client";

const WORKSPACE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function activeWorkspaceIdFromPath(pathname: string | null): string | null {
  if (!pathname) return null;
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "dashboard") return null;
  const candidate = segments[1];
  if (!candidate || !WORKSPACE_ID_PATTERN.test(candidate)) return null;
  return candidate;
}

function isClientRoleAllowed(item: AppNavItem, role: ClientRole | null | undefined) {
  if (!item.roles || item.roles.length === 0) return true;
  if (!role) return false;
  return item.roles.includes(role);
}

function isPlatformRoleAllowed(
  item: AppNavItem,
  role: PlatformRole | null | undefined,
) {
  if (!item.platformRoles || item.platformRoles.length === 0) return true;
  if (!role) return false;
  return item.platformRoles.includes(role);
}

function filterByRole(
  groups: AppNavGroup[],
  options: {
    role?: ClientRole | null;
    platformRole?: PlatformRole | null;
  },
): AppNavGroup[] {
  const { role, platformRole } = options;
  if (role && !platformRole) {
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (group.audience === "admin") {
            return isPlatformRoleAllowed(item, null);
          }
          return isClientRoleAllowed(item, role) && isPlatformRoleAllowed(item, null);
        }),
      }))
      .filter((group) => group.items.length > 0);
  }
  if (platformRole && !role) {
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (group.audience === "admin") {
            return isPlatformRoleAllowed(item, platformRole);
          }
          return isClientRoleAllowed(item, null) && isPlatformRoleAllowed(item, null);
        }),
      }))
      .filter((group) => group.items.length > 0);
  }
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const clientOk = isClientRoleAllowed(item, role ?? null);
        const platformOk = isPlatformRoleAllowed(item, platformRole ?? null);
        return clientOk && platformOk;
      }),
    }))
    .filter((group) => group.items.length > 0);
}

function rewriteWorkspaceUrls(
  groups: AppNavGroup[],
  workspaceId: string,
): AppNavGroup[] {
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      if (item.scope === "organization") {
        return item;
      }
      if (item.url === "/dashboard") {
        return { ...item, url: `/dashboard/${workspaceId}` };
      }
      const tail = item.url.replace(/^\/dashboard\/?/, "");
      const nextUrl = tail
        ? `/dashboard/${workspaceId}/${tail}`
        : `/dashboard/${workspaceId}`;
      return { ...item, url: nextUrl };
    }),
  }));
}

export type UseNavGroupsOptions = {
  role?: ClientRole | null;
  platformRole?: PlatformRole | null;
};

export function useNavGroups(
  audience: AppNavAudience,
  options: UseNavGroupsOptions = {},
): AppNavGroup[] {
  const pathname = usePathname();
  const visibleGroups = APP_NAV_GROUPS.filter(
    (group) => group.audience === audience || group.audience === "shared",
  );
  const roleFiltered = filterByRole(visibleGroups, {
    role: options.role,
    platformRole: options.platformRole,
  });
  if (audience !== "client") {
    return roleFiltered;
  }
  const workspaceId = activeWorkspaceIdFromPath(pathname);
  if (!workspaceId) {
    // Render organization-scoped items even without a workspace id so
    // owners can navigate Team / Workspaces / Billing before picking a
    // workspace. The rewrite step below leaves them alone.
    return roleFiltered;
  }
  return rewriteWorkspaceUrls(roleFiltered, workspaceId);
}

export function navItemBelongsToRole(
  item: AppNavItem,
  role: ClientRole | null | undefined,
): boolean {
  if (!item.roles || item.roles.length === 0) return true;
  if (!role) return false;
  return item.roles.includes(role);
}