import { backendFetch } from "@/lib/admin-proxy";

export async function POST(
  _request: Request,
  context: RouteContext<"/api/admin/platform-admins/[platform_admin_id]/resend-invite">,
) {
  const { platform_admin_id } = await context.params;
  return backendFetch(
    `/api/v1/admin/platform-admins/${platform_admin_id}/resend-invite`,
    { method: "POST" },
  );
}
