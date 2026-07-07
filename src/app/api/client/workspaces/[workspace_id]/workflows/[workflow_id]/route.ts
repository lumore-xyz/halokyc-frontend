import { backendClientFetch } from "@/lib/client-proxy";

type Params = {
  workspace_id: string;
  workflow_id: string;
};

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/client/workspaces/[workspace_id]/workflows/[workflow_id]">,
) {
  const { workspace_id, workflow_id } = (await context.params) as Params;
  return backendClientFetch(
    `/api/v1/workspaces/${workspace_id}/workflows/${workflow_id}`,
    {
      method: "PATCH",
      body: await request.text(),
    },
  );
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/client/workspaces/[workspace_id]/workflows/[workflow_id]">,
) {
  const { workspace_id, workflow_id } = (await context.params) as Params;
  return backendClientFetch(
    `/api/v1/workspaces/${workspace_id}/workflows/${workflow_id}`,
    { method: "DELETE" },
  );
}
