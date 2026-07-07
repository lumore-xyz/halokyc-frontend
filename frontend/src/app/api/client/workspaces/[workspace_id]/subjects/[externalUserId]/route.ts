import { backendClientFetch } from "@/lib/client-proxy";

type Params = {
  workspace_id: string;
  externalUserId: string;
};

export async function DELETE(
  request: Request,
  context: RouteContext<"/api/client/workspaces/[workspace_id]/subjects/[externalUserId]">,
) {
  const { workspace_id, externalUserId } = (await context.params) as Params;
  const body = await request.text();
  return backendClientFetch(
    `/api/v1/workspaces/${workspace_id}/subjects/${encodeURIComponent(externalUserId)}`,
    body ? { method: "DELETE", body } : { method: "DELETE" },
  );
}
