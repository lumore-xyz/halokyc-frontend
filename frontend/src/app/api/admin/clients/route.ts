import { backendFetch } from "@/lib/admin-proxy";

export async function GET() {
  return backendFetch("/api/v1/clients");
}

export async function POST(request: Request) {
  const body = await request.text();
  return backendFetch("/api/v1/clients", {
    method: "POST",
    body,
  });
}
