import { backendFetch } from "@/lib/admin-proxy";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ provider_id: string; key_id: string }> },
) {
  const { provider_id, key_id } = await context.params;
  return backendFetch(
    `/api/v1/admin/ai-providers/${provider_id}/keys/${key_id}`,
    {
      method: "PATCH",
      body: await request.text(),
      headers: request.headers,
    },
  );
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ provider_id: string; key_id: string }> },
) {
  const { provider_id, key_id } = await context.params;
  return backendFetch(
    `/api/v1/admin/ai-providers/${provider_id}/keys/${key_id}`,
    { method: "DELETE" },
  );
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ provider_id: string; key_id: string }> },
) {
  const { provider_id, key_id } = await context.params;
  return backendFetch(
    `/api/v1/admin/ai-providers/${provider_id}/keys/${key_id}/test`,
    { method: "POST" },
  );
}
