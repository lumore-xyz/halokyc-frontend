import { backendClientRawFetch } from "@/lib/client-proxy";

type Params = {
  workspace_id: string;
  verification_id: string;
  file_id: string;
};

export async function GET(
  _request: Request,
  context: { params: Promise<Params> },
) {
  const { workspace_id, verification_id, file_id } = await context.params;
  return backendClientRawFetch(
    `/api/v1/workspaces/${workspace_id}/verifications/${verification_id}/files/${file_id}`,
  );
}
