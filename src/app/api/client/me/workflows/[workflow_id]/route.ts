import { backendClientFetch } from "@/lib/client-proxy";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ workflow_id: string }> },
) {
  const { workflow_id } = await context.params;
  return backendClientFetch(
    `/api/v1/me/workflows/${workflow_id}`,
    {
      method: "PATCH",
      body: await request.text(),
    },
  );
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ workflow_id: string }> },
) {
  const { workflow_id } = await context.params;
  return backendClientFetch(
    `/api/v1/me/workflows/${workflow_id}`,
    { method: "DELETE" },
  );
}