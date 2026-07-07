import { AppShell } from "@/components/dashboard/app-shell";
import { OrganizationRouteGuard } from "@/components/dashboard/route-guard";
import { BillingPanel } from "./_components/billing-panel";

export default function BillingPage() {
  return (
    <AppShell audience="client">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
        <OrganizationRouteGuard
          allowedRoles={["client_owner", "client_admin"]}
          fallbackHref="/dashboard"
        >
          <BillingPanel />
        </OrganizationRouteGuard>
      </main>
    </AppShell>
  );
}