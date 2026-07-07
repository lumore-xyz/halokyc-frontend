"use client";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { AppTopbar } from "@/components/dashboard/app-topbar";
import type { AppNavAudience } from "@/components/dashboard/app-nav-config";

type AppShellProps = {
  children: React.ReactNode;
  audience: AppNavAudience;
};

export function AppShell({ children, audience }: AppShellProps) {
  return (
    <SidebarProvider className="app-shell">
      <AppSidebar audience={audience} />
      <SidebarInset className="bg-transparent">
        <AppTopbar />
        <main className="flex-1">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
