import { AppShell } from "@/components/dashboard/app-shell";
import { RouteGuard } from "@/components/dashboard/route-guard";
import { WebhooksManager } from "./_components/webhooks-manager";

export default async function WebhooksPage({
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
          allowedRoles={["client_owner", "client_admin", "client_developer"]}
          fallbackHref={`/dashboard/${workspaceId}`}
        >
          <WebhooksManager workspaceId={workspaceId} />
        </RouteGuard>
      </main>
    </AppShell>
  );
}