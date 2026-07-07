"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronsUpDownIcon, PlusIcon, CheckIcon } from "lucide-react";

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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useWorkspaces } from "@/lib/hooks/use-workspaces";
import { useClientProfile } from "@/lib/hooks/use-client-profile";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function activeWorkspaceIdFromPath(pathname: string | null): string | null {
  if (!pathname) return null;
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "dashboard") return null;
  const candidate = segments[1];
  if (!candidate || !UUID_PATTERN.test(candidate)) return null;
  return candidate;
}

type AppWorkspaceSwitcherProps = {
  showCreate?: boolean;
};

export function AppWorkspaceSwitcher({
  showCreate = false,
}: AppWorkspaceSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const workspaces = useWorkspaces();
  const profile = useClientProfile();

  const activeId = activeWorkspaceIdFromPath(pathname);
  const active =
    workspaces.data?.find((workspace) => workspace.workspace_id === activeId) ??
    null;
  const orgName = profile.data?.company_name ?? null;

  function handleSelect(workspaceId: string) {
    router.push(`/dashboard/${workspaceId}`);
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                tooltip="Switch workspace"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <span className="text-xs font-semibold">
                {(active?.name ?? orgName ?? "?").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col items-start gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
              <span className="text-sidebar-foreground text-sm font-semibold tracking-tight">
                {active?.name ?? "Select workspace"}
              </span>
              <span className="text-sidebar-foreground/62 text-xs">
                {orgName ?? workspaces.data?.length
                  ? `${workspaces.data?.length ?? 0} workspace${workspaces.data?.length === 1 ? "" : "s"}`
                  : "Loading…"}
              </span>
            </div>
            <ChevronsUpDownIcon
              className="ml-auto size-4 group-data-[collapsible=icon]:hidden"
              aria-hidden
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="right"
            sideOffset={4}
            className="min-w-64"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">
                    Organization
                  </span>
                  <span className="text-sm font-semibold">
                    {orgName ?? "—"}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <span className="text-xs text-muted-foreground">
                  Workspaces
                </span>
              </DropdownMenuLabel>
              {workspaces.isLoading ? (
                <DropdownMenuItem disabled>
                  Loading workspaces…
                </DropdownMenuItem>
              ) : (workspaces.data?.length ?? 0) === 0 ? (
                <DropdownMenuItem disabled>No workspaces yet</DropdownMenuItem>
              ) : (
                workspaces.data?.map((workspace) => {
                  const isActive = workspace.workspace_id === activeId;
                  return (
                    <DropdownMenuItem
                      key={workspace.workspace_id}
                      onClick={() => handleSelect(workspace.workspace_id)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">
                          {workspace.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {workspace.slug}
                        </span>
                      </div>
                      {isActive ? (
                        <CheckIcon className="size-4" aria-hidden />
                      ) : null}
                    </DropdownMenuItem>
                  );
                })
              )}
            </DropdownMenuGroup>
            {showCreate ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    render={
                      <Link
                        href="/dashboard"
                        onClick={() => router.refresh()}
                      />
                    }
                  >
                    <PlusIcon aria-hidden />
                    <span>Create workspace</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}