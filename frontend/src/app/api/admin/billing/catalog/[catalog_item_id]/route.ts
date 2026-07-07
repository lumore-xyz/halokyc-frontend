import { backendFetch } from "@/lib/admin-proxy";

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/admin/billing/catalog/[catalog_item_id]">,
) {
  const { catalog_item_id } = await context.params;
  return backendFetch(`/api/v1/admin/billing/catalog/${catalog_item_id}`, {
    method: "PATCH",
    body: await request.text(),
  });
}
