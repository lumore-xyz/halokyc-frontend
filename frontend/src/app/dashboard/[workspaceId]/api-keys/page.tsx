import { AppShell } from "@/components/dashboard/app-shell";
import { RouteGuard } from "@/components/dashboard/route-guard";

import { ApiKeysManager } from "./_components/api-keys-manager";

export default async function ApiKeysPage({
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
      <ApiKeysManager workspaceId={workspaceId} />
    </RouteGuard>
  );
}
