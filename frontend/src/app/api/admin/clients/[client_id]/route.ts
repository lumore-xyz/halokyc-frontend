import { backendFetch } from "@/lib/admin-proxy";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/admin/clients/[client_id]">,
) {
  const { client_id } = await context.params;
  return backendFetch(`/api/v1/clients/${client_id}`);
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/admin/clients/[client_id]">,
) {
  const { client_id } = await context.params;
  const body = await request.text();
  return backendFetch(`/api/v1/clients/${client_id}`, {
    method: "PATCH",
    body,
  });
}
