import { backendClientFetch } from "@/lib/client-proxy";

export async function GET() {
  return backendClientFetch("/api/v1/billing/catalog");
}
