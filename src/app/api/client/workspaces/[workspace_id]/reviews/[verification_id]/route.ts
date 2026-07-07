import { backendClientFetch } from "@/lib/client-proxy";

type Params = {
  workspace_id: string;
  verification_id: string;
};

export async function GET(
  _request: Request,
  context: RouteContext<"/api/client/workspaces/[workspace_id]/reviews/[verification_id]">,
) {
  const { workspace_id, verification_id } = (await context.params) as Params;
  return backendClientFetch(
    `/api/v1/workspaces/${workspace_id}/reviews/${verification_id}`,
  );
}