import { backendClientFetch } from "@/lib/client-proxy";

type Params = {
  workspace_id: string;
};

export async function GET(
  _request: Request,
  context: RouteContext<"/api/client/workspaces/[workspace_id]/webhooks">,
) {
  const { workspace_id } = (await context.params) as Params;
  return backendClientFetch(`/api/v1/workspaces/${workspace_id}/webhooks`);
}

export async function POST(
  request: Request,
  context: RouteContext<"/api/client/workspaces/[workspace_id]/webhooks">,
) {
  const { workspace_id } = (await context.params) as Params;
  return backendClientFetch(`/api/v1/workspaces/${workspace_id}/webhooks`, {
    method: "POST",
    body: await request.text(),
  });
}