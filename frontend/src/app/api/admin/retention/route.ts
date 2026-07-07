import { backendFetch } from "@/lib/admin-proxy";

export async function GET() {
  return backendFetch("/api/v1/admin/retention");
}

export async function PUT(request: Request) {
  const body = await request.text();
  return backendFetch("/api/v1/admin/retention", {
    method: "PUT",
    body,
  });
}
