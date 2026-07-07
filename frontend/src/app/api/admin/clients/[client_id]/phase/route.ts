import { backendFetch } from "@/lib/admin-proxy";

export async function POST(
  request: Request,
  context: RouteContext<"/api/admin/clients/[client_id]/phase">,
) {
  const { client_id } = await context.params;
  const body = await request.text();
  return backendFetch(`/api/v1/clients/${client_id}/phase`, {
    method: "POST",
    body,
  });
}
