import { clearAdminCookie, postAdminLogin } from "@/lib/admin-proxy";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    username?: unknown;
    password?: unknown;
  } | null;
  if (typeof body?.username !== "string" || typeof body.password !== "string") {
    return Response.json({ ok: false, error: "Username and password are required" }, { status: 400 });
  }
  return postAdminLogin(body.username, body.password);
}

export async function DELETE() {
  await clearAdminCookie();
  return Response.json({ ok: true });
}

