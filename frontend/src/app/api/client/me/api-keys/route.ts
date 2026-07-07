import { backendClientFetch } from "@/lib/client-proxy";

export async function GET(request: Request) {
  const { search } = new URL(request.url);
  return backendClientFetch(`/api/v1/me/api-keys${search}`);
}

export async function POST(request: Request) {
  return backendClientFetch("/api/v1/me/api-keys", {
    method: "POST",
    body: JSON.stringify(await request.json()),
  });
}
