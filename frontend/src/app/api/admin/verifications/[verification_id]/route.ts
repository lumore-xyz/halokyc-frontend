import { backendFetch } from "@/lib/admin-proxy";

export async function GET(
  _request: Request,
  context: { params: Promise<{ verification_id: string }> },
) {
  const { verification_id } = await context.params;
  return backendFetch(`/api/v1/admin/verifications/${verification_id}`);
}