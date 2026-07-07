import { backendFetch } from "@/lib/admin-proxy";

export async function POST(request: Request) {
  const body = await request.text();
  return backendFetch("/api/v1/admin/billing/credits/adjust", {
    method: "POST",
    body,
  });
}