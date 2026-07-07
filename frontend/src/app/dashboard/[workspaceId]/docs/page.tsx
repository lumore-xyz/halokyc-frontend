import { AppShell } from "@/components/dashboard/app-shell";
import { RouteGuard } from "@/components/dashboard/route-guard";
import { DocsPanel } from "./_components/docs-panel";

export default async function DocsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return (
    <AppShell audience="client">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
        <RouteGuard
          workspaceId={workspaceId}
          allowedRoles={["client_developer", "client_owner", "client_admin"]}
          fallbackHref={`/dashboard/${workspaceId}`}
        >
          <DocsPanel workspaceId={workspaceId} />
        </RouteGuard>
      </main>
    </AppShell>
  );
}