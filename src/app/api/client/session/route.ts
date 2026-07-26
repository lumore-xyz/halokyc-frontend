import { clientSessionFromToken, getClientToken } from "@/lib/client-proxy";
import { backendUrl } from "@/lib/env";

export async function GET() {
  const token = await getClientToken();
  const session = clientSessionFromToken(token);
  if (!token || !session.authenticated) {
    return Response.json(session);
  }

  const response = await fetch(backendUrl("/api/v1/auth/me"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) {
    return Response.json(session);
  }
  const user = (await response.json()) as {
    email: string;
    email_verified: boolean;
  };
  return Response.json({
    ...session,
    email: user.email,
    emailVerified: user.email_verified,
  });
}
