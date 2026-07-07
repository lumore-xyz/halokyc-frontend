import { backendClientRawFetch } from "@/lib/client-proxy";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ verification_id: string; file_id: string }> },
) {
  const { verification_id, file_id } = await context.params;
  return backendClientRawFetch(
    `/api/v1/me/verifications/${verification_id}/files/${file_id}`,
  );
}
