import { backendFetch } from "@/lib/admin-proxy";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ provider_id: string }> },
) {
  const { provider_id } = await context.params;
  const body = await request.text();
  return backendFetch(`/api/v1/admin/ai-providers/${provider_id}`, {
    method: "PATCH",
    body,
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ provider_id: string }> },
) {
  const { provider_id } = await context.params;
  return backendFetch(`/api/v1/admin/ai-providers/${provider_id}`, {
    method: "DELETE",
  });
}
