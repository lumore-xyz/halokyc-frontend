import { backendFetch } from "@/lib/admin-proxy";

export async function POST(
  request: Request,
  context: { params: Promise<{ provider_id: string }> },
) {
  const { provider_id } = await context.params;
  return backendFetch(`/api/v1/admin/ai-providers/${provider_id}/keys`, {
    method: "POST",
    body: await request.text(),
    headers: request.headers,
  });
}
