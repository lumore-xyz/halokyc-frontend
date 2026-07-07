import { setAdminSession } from "@/lib/admin-proxy";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    token?: string;
    expiresIn?: number;
  } | null;
  if (typeof body?.token !== "string") {
    return Response.json({ ok: false, error: "Token is required" }, { status: 400 });
  }
  return setAdminSession(body.token, body.expiresIn ?? 3600);
}
