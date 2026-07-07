import { AppShell } from "@/components/dashboard/app-shell";
import { RouteGuard } from "@/components/dashboard/route-guard";

import { ConsoleAccessGate } from "./_components/console-access-gate";

export default async function DashboardConsolePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return (
    <AppShell audience="client">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
        <RouteGuard
          workspaceId={workspaceId}
          allowedRoles={[
            "client_owner",
            "client_admin",
            "client_developer",
          ]}
          fallbackHref={`/dashboard/${workspaceId}`}
        >
          <header className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              API console
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Paste your API key below, then start a verification, upload files,
              and watch the worker pipeline land on a decision.
            </p>
          </header>
          <ConsoleAccessGate workspaceId={workspaceId} />
        </RouteGuard>
      </main>
    </AppShell>
  );
}