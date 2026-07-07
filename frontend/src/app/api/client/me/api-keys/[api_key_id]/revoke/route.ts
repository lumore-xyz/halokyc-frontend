import { backendClientFetch } from "@/lib/client-proxy";

export async function POST(
  _request: Request,
  context: RouteContext<"/api/client/me/api-keys/[api_key_id]/revoke">,
) {
  const { api_key_id } = await context.params;
  return backendClientFetch(
    `/api/v1/me/api-keys/${api_key_id}/revoke`,
    { method: "POST" },
  );
}