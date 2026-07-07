import { backendFetch } from "@/lib/admin-proxy";

export async function GET(
  _request: Request,
  context: { params: Promise<{ workspace_id: string }> },
) {
  const { workspace_id } = await context.params;
  return backendFetch(`/api/v1/admin/workspaces/${workspace_id}`);
}