import { InboxIcon, ShieldCheckIcon, AlertTriangleIcon } from "lucide-react";

import { AppShell } from "@/components/dashboard/app-shell";
import { Metric } from "@/components/dashboard/metric";
import { AdminReviewQueue } from "../review-queue";

export default function AdminReviewsPage() {
  return (
    <AppShell audience="admin">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Review center</h1>
          <p className="max-w-2xl text-muted-foreground">
            Manage manual verification reviews and maintain platform integrity.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <Metric
            label="Pending reviews"
            value="Live"
            icon={InboxIcon}
            description="Loaded from the admin review queue"
            variant="warning"
          />
          <Metric
            label="Decision owner"
            value="Admin"
            icon={ShieldCheckIcon}
            description="Platform override for manual review"
            variant="success"
          />
          <Metric
            label="Tenant scope"
            value="Global"
            icon={AlertTriangleIcon}
            description="Review sessions across all clients"
            variant="danger"
          />
        </section>

        <AdminReviewQueue />
      </main>
    </AppShell>
  );
}
