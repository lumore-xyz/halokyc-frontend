import { backendFetch } from "@/lib/admin-proxy";

export async function GET() {
  return backendFetch("/api/v1/admin/ai-providers");
}

export async function POST(request: Request) {
  return backendFetch("/api/v1/admin/ai-providers", {
    method: "POST",
    body: await request.text(),
    headers: await (async () => {
      const h = new Headers(await (async () => {
        try {
          return request.headers;
        } catch {
          return new Headers();
        }
      })());
      h.set("content-type", request.headers.get("content-type") ?? "application/json");
      return h;
    })(),
  });
}
