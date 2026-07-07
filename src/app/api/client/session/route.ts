import { clientSessionFromToken, getClientToken } from "@/lib/client-proxy";

export async function GET() {
  return Response.json(clientSessionFromToken(await getClientToken()));
}