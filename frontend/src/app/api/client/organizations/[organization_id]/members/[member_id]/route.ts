import { backendClientFetch } from "@/lib/client-proxy";

type Params = {
  organization_id: string;
  member_id: string;
};

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/client/organizations/[organization_id]/members/[member_id]">,
) {
  const { organization_id, member_id } = (await context.params) as Params;
  return backendClientFetch(
    `/api/v1/organizations/${organization_id}/members/${member_id}`,
    {
      method: "PATCH",
      body: await request.text(),
    },
  );
}