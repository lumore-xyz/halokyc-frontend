import { backendClientFetch } from "@/lib/client-proxy";

type Params = {
  workspace_id: string;
  externalUserId: string;
};

export async function POST(
  request: Request,
  context: RouteContext<"/api/client/workspaces/[workspace_id]/subjects/[externalUserId]/reset-verification">,
) {
  const { workspace_id, externalUserId } = (await context.params) as Params;
  const body = await request.text();
  return backendClientFetch(
    `/api/v1/workspaces/${workspace_id}/subjects/${encodeURIComponent(externalUserId)}/reset-verification`,
    body ? { method: "POST", body } : { method: "POST" },
  );
}
