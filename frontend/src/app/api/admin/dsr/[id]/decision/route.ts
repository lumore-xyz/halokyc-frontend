import { backendFetch } from "@/lib/admin-proxy";

export async function POST(
  request: Request,
  context: RouteContext<"/api/admin/dsr/[id]/decision">,
) {
  const { id } = await context.params;
  const body = await request.text();
  return backendFetch(`/api/v1/admin/dsr/${id}/decision`, {
    method: "POST",
    body,
  });
}
