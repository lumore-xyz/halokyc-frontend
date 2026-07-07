import { backendClientFetch } from "@/lib/client-proxy";

type Params = {
  organization_id: string;
};

export async function GET(
  _request: Request,
  context: RouteContext<"/api/client/organizations/[organization_id]">,
) {
  const { organization_id } = (await context.params) as Params;
  return backendClientFetch(`/api/v1/organizations/${organization_id}`);
}