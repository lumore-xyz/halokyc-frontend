import { adminSessionFromToken, getAdminToken } from "@/lib/admin-proxy";

export async function GET() {
  return Response.json(adminSessionFromToken(await getAdminToken()));
}

