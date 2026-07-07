"use client";

import {
  RefreshCwIcon,
  ShieldAlertIcon,
  TriangleAlertIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { AppShell } from "@/components/dashboard/app-shell";
import { PlatformRouteGuard } from "@/components/dashboard/platform-route-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { AdminSupportErrorLogs } from "./_components/support-error-logs";
import { AdminSupportNotes } from "./_components/support-notes";
import { AdminSupportWebhookLogs } from "./_components/support-webhook-logs";

type SupportTab = "webhook-logs" | "error-logs" | "notes";

const TABS: { id: SupportTab; label: string; icon: typeof RefreshCwIcon }[] = [
  { id: "webhook-logs", label: "Webhook logs", icon: RefreshCwIcon },
  { id: "error-logs", label: "Error logs", icon: TriangleAlertIcon },
  { id: "notes", label: "Support notes", icon: ShieldAlertIcon },
];

export default function AdminSupportPage() {
  return (
    <AppShell audience="admin">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
        <PlatformRouteGuard
          allowedRoles={[
            "platform_owner",
            "platform_business_admin",
            "platform_support",
          ]}
          fallbackHref="/admin"
        >
          <SupportHub />
        </PlatformRouteGuard>
      </main>
    </AppShell>
  );
}

function SupportHub() {
  const [tab, setTab] = useState<SupportTab>("webhook-logs");
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        icon={ShieldAlertIcon}
        title="Support"
        description="Webhook delivery, platform error feed, and the support notes attached to verification sessions. Support notes are platform_owner / business_admin / support only."
      />

      <div className="border-border flex flex-wrap gap-2 border-b">
        {TABS.map((entry) => {
          const Icon = entry.icon;
          const active = tab === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => setTab(entry.id)}
              className={cn(
                "hover:text-foreground flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-foreground text-foreground"
                  : "text-muted-foreground border-transparent",
              )}
              aria-pressed={active}
            >
              <Icon className="size-4" aria-hidden /> {entry.label}
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>{TABS.find((t) => t.id === tab)?.label}</CardTitle>
              <CardDescription>
                {tab === "webhook-logs"
                  ? "Webhook deliveries across every organization."
                  : tab === "error-logs"
                    ? "Platform-level error feed."
                    : "Internal notes attached to verification sessions."}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">platform_owner · business_admin · support</Badge>
              <Button render={<Link href="/admin/verifications" />} nativeButton={false} variant="ghost" size="sm">
                Open verifications
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tab === "webhook-logs" ? <AdminSupportWebhookLogs /> : null}
          {tab === "error-logs" ? <AdminSupportErrorLogs /> : null}
          {tab === "notes" ? <AdminSupportNotes /> : null}
        </CardContent>
      </Card>
    </div>
  );
}