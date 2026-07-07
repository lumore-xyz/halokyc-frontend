import { backendFetch } from "@/lib/admin-proxy";

export async function GET() {
  return backendFetch("/api/v1/admin/system-settings");
}

export async function PATCH(request: Request) {
  const body = await request.text();
  return backendFetch("/api/v1/admin/system-settings", {
    method: "PATCH",
    body,
  });
}