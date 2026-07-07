import { AppShell } from "@/components/dashboard/app-shell";
import { RouteGuard } from "@/components/dashboard/route-guard";

import { WorkflowDesigner } from "./_components/workflow-designer";

export default async function WorkflowsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return (
    <RouteGuard
      workspaceId={workspaceId}
      allowedRoles={["client_owner", "client_admin", "client_developer"]}
      fallbackHref={`/dashboard/${workspaceId}`}
    >
      <WorkflowDesigner workspaceId={workspaceId} />
    </RouteGuard>
  );
}
