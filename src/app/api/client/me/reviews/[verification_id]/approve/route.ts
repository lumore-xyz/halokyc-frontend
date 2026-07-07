import { backendClientFetch } from "@/lib/client-proxy";

export async function POST(
  _request: Request,
  context: { params: Promise<{ verification_id: string }> },
) {
  const { verification_id } = await context.params;
  return backendClientFetch(
    `/api/v1/me/reviews/${verification_id}/approve`,
    { method: "POST" },
  );
}