import { backendClientFetch } from "@/lib/client-proxy";

type Params = {
  workspace_id: string;
  api_key_id: string;
};

export async function POST(
  _request: Request,
  context: RouteContext<"/api/client/workspaces/[workspace_id]/api-keys/[api_key_id]/revoke">,
) {
  const { workspace_id, api_key_id } = (await context.params) as Params;
  return backendClientFetch(
    `/api/v1/workspaces/${workspace_id}/api-keys/${api_key_id}/revoke`,
    { method: "POST" },
  );
}
