"use client";

import { AppBreadcrumb } from "@/components/dashboard/app-breadcrumb";
import { AppUserMenu } from "@/components/dashboard/app-user-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppTopbar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[var(--dashboard-rule)] bg-[color-mix(in_oklch,var(--background)_78%,white)]/85 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-[color-mix(in_oklch,var(--background)_72%,white)]/72">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <Separator
          orientation="vertical"
          className="h-6 bg-(--dashboard-rule)"
        />
        <AppBreadcrumb />
      </div>
      <AppUserMenu />
    </header>
  );
}
