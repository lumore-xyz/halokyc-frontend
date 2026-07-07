import { backendClientFetch } from "@/lib/client-proxy";

export async function GET() {
  return backendClientFetch("/api/v1/me/workflows");
}

export async function POST(request: Request) {
  return backendClientFetch("/api/v1/me/workflows", {
    method: "POST",
    body: await request.text(),
  });
}