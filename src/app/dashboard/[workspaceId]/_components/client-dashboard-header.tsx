"use client";

import { Badge } from "@/components/ui/badge";

export function ClientDashboardHeader({
  workspaceId,
}: {
  workspaceId: string;
}) {
  return (
    <header className="app-shell-panel relative overflow-hidden rounded-2xl border border-[var(--dashboard-rule)] p-6 sm:p-8">
      <div className="dashboard-evidence-strip absolute inset-x-0 top-0 h-1" />
      <div className="relative flex flex-col gap-4">
        <Badge
          variant="secondary"
          className="w-fit border border-[var(--dashboard-rule)] bg-[var(--dashboard-canvas)] text-foreground"
        >
          Workspace: {workspaceId}
        </Badge>
        <div className="grid gap-5 lg:grid-cols-[1fr_18rem] lg:items-end">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Your verification pipeline
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Issue API keys, define the checks each session runs, and clear
              the review queue. Everything below reflects the latest state of
              your integration.
            </p>
          </div>
          <div className="hidden rounded-xl border border-[var(--dashboard-rule)] bg-[var(--dashboard-canvas)] p-4 lg:block">
            <div className="mb-3 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span>Policy file</span>
              <span className="font-mono">Live</span>
            </div>
            <div className="space-y-2">
              <span className="block h-2 rounded-full bg-[color-mix(in_oklch,var(--dashboard-blue)_32%,white)]" />
              <span className="block h-2 w-4/5 rounded-full bg-[color-mix(in_oklch,var(--dashboard-mint)_34%,white)]" />
              <span className="block h-2 w-3/5 rounded-full bg-[color-mix(in_oklch,var(--dashboard-amber)_36%,white)]" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
