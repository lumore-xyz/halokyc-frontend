import { redirect } from "next/navigation";

import { AppShell } from "@/components/dashboard/app-shell";
import { ClientDashboardHeader } from "./_components/client-dashboard-header";
import { OverviewDashboard } from "./_components/overview-dashboard";
import { clientSessionFromToken, getClientToken } from "@/lib/client-proxy";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const token = await getClientToken();
  const session = clientSessionFromToken(token);
  if (!session.authenticated) {
    redirect("/login");
  }

  return (
    <AppShell audience="client">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-12">
        <ClientDashboardHeader workspaceId={workspaceId} />
        <OverviewDashboard workspaceId={workspaceId} />
      </main>
    </AppShell>
  );
}