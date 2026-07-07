import { backendClientFetch } from "@/lib/client-proxy";

type Params = {
  workspace_id: string;
};

export async function GET(
  request: Request,
  context: RouteContext<"/api/client/workspaces/[workspace_id]/api-keys">,
) {
  const { workspace_id } = (await context.params) as Params;
  const { search } = new URL(request.url);
  return backendClientFetch(
    `/api/v1/workspaces/${workspace_id}/api-keys${search}`,
  );
}

export async function POST(
  request: Request,
  context: RouteContext<"/api/client/workspaces/[workspace_id]/api-keys">,
) {
  const { workspace_id } = (await context.params) as Params;
  return backendClientFetch(`/api/v1/workspaces/${workspace_id}/api-keys`, {
    method: "POST",
    body: await request.text(),
  });
}
