import { backendClientFetch } from "@/lib/client-proxy";

export async function GET() {
  return backendClientFetch("/api/v1/billing/customer-portal");
}

export async function POST() {
  return backendClientFetch("/api/v1/billing/customer-portal", {
    method: "POST",
  });
}
