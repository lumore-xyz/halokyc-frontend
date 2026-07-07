import { backendClientFetch } from "@/lib/client-proxy";

export async function POST(request: Request) {
  return backendClientFetch("/api/v1/billing/checkout/credits", {
    method: "POST",
    body: await request.text(),
  });
}
