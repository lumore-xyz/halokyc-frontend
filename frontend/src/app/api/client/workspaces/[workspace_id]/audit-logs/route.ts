import { backendClientFetch } from "@/lib/client-proxy";

type Params = {
  workspace_id: string;
};

export async function GET(
  request: Request,
  context: RouteContext<"/api/client/workspaces/[workspace_id]/audit-logs">,
) {
  const { workspace_id } = (await context.params) as Params;
  const url = new URL(request.url);
  const qs = url.searchParams.toString();
  return backendClientFetch(
    qs
      ? `/api/v1/workspaces/${workspace_id}/audit-logs?${qs}`
      : `/api/v1/workspaces/${workspace_id}/audit-logs`,
  );
}