import { backendClientFetch } from "@/lib/client-proxy";

export async function GET() {
  return backendClientFetch("/api/v1/workspaces");
}

export async function POST(request: Request) {
  return backendClientFetch("/api/v1/workspaces", {
    method: "POST",
    body: await request.text(),
  });
}
