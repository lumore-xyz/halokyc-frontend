import { backendFetch } from "@/lib/admin-proxy";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ platform_admin_id: string }> },
) {
  const { platform_admin_id } = await context.params;
  const body = await request.text();
  return backendFetch(`/api/v1/admin/platform-admins/${platform_admin_id}`, {
    method: "PATCH",
    body,
  });
}