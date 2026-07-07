import { backendFetch } from "@/lib/admin-proxy";

export async function POST(request: Request, context: RouteContext<"/api/admin/reviews/[id]/reject">) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { reason?: unknown } | null;
  if (typeof body?.reason !== "string" || body.reason.trim().length === 0) {
    return Response.json({ ok: false, error: "A rejection reason is required" }, { status: 400 });
  }
  return backendFetch(`/api/v1/admin/reviews/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason: body.reason }),
  });
}

