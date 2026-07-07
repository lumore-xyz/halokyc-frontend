import { backendClientFetch } from "@/lib/client-proxy";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/client/me/verifications/[verification_id]">,
) {
  const { verification_id } = await context.params;
  return backendClientFetch(`/api/v1/me/verifications/${verification_id}`);
}
