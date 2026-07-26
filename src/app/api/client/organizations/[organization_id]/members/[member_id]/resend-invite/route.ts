import { backendClientFetch } from "@/lib/client-proxy";

export async function POST(
  _request: Request,
  context: RouteContext<"/api/client/organizations/[organization_id]/members/[member_id]/resend-invite">,
) {
  const { organization_id, member_id } = await context.params;
  return backendClientFetch(
    `/api/v1/organizations/${organization_id}/members/${member_id}/resend-invite`,
    { method: "POST" },
  );
}
