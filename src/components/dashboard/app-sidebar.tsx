"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/brand-logo";
import {
  APP_AUDIENCE_META,
  type AppNavAudience,
  type AppNavGroup,
  type AppNavItem,
} from "@/components/dashboard/app-nav-config";
import { AppWorkspaceSwitcher } from "@/components/dashboard/app-workspace-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAdminSession } from "@/lib/hooks/use-admin-session";
import { useClientSession } from "@/lib/hooks/use-client-session";
import { useNavGroups } from "@/lib/hooks/use-nav-groups";

type AppSidebarProps = {
  audience: AppNavAudience;
};

function isItemActive(pathname: string, item: AppNavItem): boolean {
  if (item.exact) {
    return pathname === item.url;
  }
  if (pathname === item.url) return true;
  return pathname.startsWith(`${item.url}/`);
}

function isGroupActive(pathname: string, group: AppNavGroup): boolean {
  return group.items.some((item) => isItemActive(pathname, item));
}

export function AppSidebar({ audience }: AppSidebarProps) {
  const pathname = usePathname();
  const clientSession = useClientSession();
  const adminSession = useAdminSession();
  const session = audience === "admin" ? adminSession : clientSession;
  const visibleGroups = useNavGroups(audience, {
    role: clientSession.data?.organizationRole ?? null,
    platformRole: adminSession.data?.platformRole ?? null,
  });
  const meta = APP_AUDIENCE_META[audience];

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-sidebar-border/70 border-b p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/" />}
              size="lg"
              tooltip="HaloKYC"
              className="h-14 rounded-lg"
            >
              <BrandLogo
                variant="icon-color"
                className="size-8 shadow-sm"
                imageClassName="object-cover"
              />
              <div className="flex flex-col items-start gap-0 group-data-[collapsible=icon]:hidden">
                <span className="text-sidebar-foreground text-sm font-semibold tracking-tight">
                  HaloKYC
                </span>
                <span className="text-sidebar-foreground/62 text-xs">
                  {meta.label}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {audience === "client" ? <AppWorkspaceSwitcher /> : null}
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-1 py-3">
        {visibleGroups.map((group) => {
          const groupActive = isGroupActive(pathname, group);
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel
                className={
                  groupActive
                    ? "text-sidebar-foreground"
                    : "text-sidebar-foreground/55"
                }
              >
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(pathname, item);
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          render={<Link href={item.url} />}
                          isActive={active}
                          tooltip={item.title}
                          className="data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground data-active:shadow-sm"
                        >
                          <Icon aria-hidden />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border/70 border-t p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/" />}
              size="sm"
              tooltip="Back to marketing site"
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
            >
              <span className="text-xs font-medium">HaloKYC ↗</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
