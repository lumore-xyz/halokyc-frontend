import { backendClientFetch } from "@/lib/client-proxy";

type Params = {
  workspace_id: string;
  verification_id: string;
};

export async function POST(
  request: Request,
  context: RouteContext<"/api/client/workspaces/[workspace_id]/reviews/[verification_id]/decision">,
) {
  const { workspace_id, verification_id } = (await context.params) as Params;
  return backendClientFetch(
    `/api/v1/workspaces/${workspace_id}/reviews/${verification_id}/decision`,
    {
      method: "POST",
      body: await request.text(),
    },
  );
}