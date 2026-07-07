import { backendFetch } from "@/lib/admin-proxy";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/admin/clients/[client_id]/api-keys">,
) {
  const { client_id } = await context.params;
  return backendFetch(`/api/v1/clients/${client_id}/api-keys`);
}

export async function POST(
  _request: Request,
  context: RouteContext<"/api/admin/clients/[client_id]/api-keys">,
) {
  const { client_id } = await context.params;
  return backendFetch(`/api/v1/clients/${client_id}/api-keys`, {
    method: "POST",
  });
}
