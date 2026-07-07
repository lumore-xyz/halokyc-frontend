"use client";

import { LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ClientSessionPayload } from "@/lib/client-proxy";
import { useAdminLogout, useAdminSession } from "@/lib/hooks/use-admin-session";
import { useClientProfile } from "@/lib/hooks/use-client-profile";
import {
  useClientLogout,
  useClientSession,
} from "@/lib/hooks/use-client-session";
import { usePathname, useRouter } from "next/navigation";

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

export function AppUserMenu() {
  const adminSession = useAdminSession();
  const adminLogout = useAdminLogout();
  const clientSession = useClientSession();
  const clientProfile = useClientProfile();
  const clientLogout = useClientLogout();
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = adminSession.data?.authenticated;
  const isClient = clientSession.data?.authenticated;
  const activeWorkspaceId = isClient
    ? activeWorkspaceIdFromPath(pathname)
    : null;
  const settingsHref = isClient ? `/dashboard/settings` : "/dashboard";

  async function handleLogout(logoutFn: {
    mutateAsync: () => Promise<unknown>;
  }) {
    await logoutFn.mutateAsync();
    router.push("/login");
  }

  if (!isAdmin && !isClient) {
    return (
      <Button
        render={<Link href="/login" />}
        nativeButton={false}
        size="sm"
        variant="outline"
      >
        Sign in
      </Button>
    );
  }

  const session = (isAdmin ? adminSession.data : clientSession.data) as
    | ClientSessionPayload
    | undefined;
  const logout = isAdmin ? adminLogout : clientLogout;
  const role = isAdmin ? "Admin" : "Client";
  const profile = isClient ? clientProfile.data : null;
  const displayName = isAdmin ? "Admin" : (profile?.company_name ?? "Client");
  const secondaryLabel = isAdmin
    ? "Admin"
    : (profile?.email ?? session?.userId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="sm" variant="ghost" className="gap-2">
            <div className="bg-muted flex size-6 items-center justify-center rounded-full">
              <UserIcon className="size-3" />
            </div>
            <span className="max-w-[100px] truncate text-xs font-medium">
              {displayName}
            </span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">{role} Account</span>
              <span className="text-muted-foreground truncate text-xs">
                {secondaryLabel}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href={settingsHref} />}>
            <SettingsIcon />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            onClick={() => handleLogout(logout)}
            disabled={logout.isPending}
          >
            <LogOutIcon />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
