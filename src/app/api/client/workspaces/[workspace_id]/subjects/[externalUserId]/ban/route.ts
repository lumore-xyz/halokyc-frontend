import { backendClientFetch } from "@/lib/client-proxy";

type Params = {
  workspace_id: string;
  externalUserId: string;
};

export async function GET(
  _request: Request,
  context: RouteContext<"/api/client/workspaces/[workspace_id]/subjects/[externalUserId]/ban">,
) {
  const { workspace_id, externalUserId } = (await context.params) as Params;
  return backendClientFetch(
    `/api/v1/workspaces/${workspace_id}/subjects/${encodeURIComponent(externalUserId)}/ban`,
  );
}

export async function PUT(
  request: Request,
  context: RouteContext<"/api/client/workspaces/[workspace_id]/subjects/[externalUserId]/ban">,
) {
  const { workspace_id, externalUserId } = (await context.params) as Params;
  const body = await request.text();
  return backendClientFetch(
    `/api/v1/workspaces/${workspace_id}/subjects/${encodeURIComponent(externalUserId)}/ban`,
    body ? { method: "PUT", body } : { method: "PUT" },
  );
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/client/workspaces/[workspace_id]/subjects/[externalUserId]/ban">,
) {
  const { workspace_id, externalUserId } = (await context.params) as Params;
  const body = await request.text();
  return backendClientFetch(
    `/api/v1/workspaces/${workspace_id}/subjects/${encodeURIComponent(externalUserId)}/ban`,
    body ? { method: "PATCH", body } : { method: "PATCH" },
  );
}
