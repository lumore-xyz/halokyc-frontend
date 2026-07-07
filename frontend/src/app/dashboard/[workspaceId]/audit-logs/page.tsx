import { AppShell } from "@/components/dashboard/app-shell";
import { RouteGuard } from "@/components/dashboard/route-guard";
import { AuditLogViewer } from "./_components/audit-log-viewer";

export default async function AuditLogsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return (
    <AppShell audience="client">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
        <RouteGuard
          workspaceId={workspaceId}
          allowedRoles={["client_owner", "client_admin"]}
          fallbackHref={`/dashboard/${workspaceId}`}
        >
          <AuditLogViewer workspaceId={workspaceId} />
        </RouteGuard>
      </main>
    </AppShell>
  );
}
