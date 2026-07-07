import { backendFetch } from "@/lib/admin-proxy";

export async function GET(_request: Request, context: RouteContext<"/api/admin/reviews/[id]">) {
  const { id } = await context.params;
  return backendFetch(`/api/v1/admin/reviews/${id}`);
}

