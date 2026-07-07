import { backendFetch } from "@/lib/admin-proxy";

export async function GET(
  _request: Request,
  context: { params: Promise<{ organization_id: string }> },
) {
  const { organization_id } = await context.params;
  return backendFetch(`/api/v1/admin/organizations/${organization_id}`);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ organization_id: string }> },
) {
  const { organization_id } = await context.params;
  const body = await request.text();
  return backendFetch(`/api/v1/admin/organizations/${organization_id}`, {
    method: "PATCH",
    body,
  });
}