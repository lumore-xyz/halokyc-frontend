import { backendFetch } from "@/lib/admin-proxy";

export async function POST(_request: Request, context: RouteContext<"/api/admin/reviews/[id]/approve">) {
  const { id } = await context.params;
  return backendFetch(`/api/v1/admin/reviews/${id}/approve`, { method: "POST" });
}

