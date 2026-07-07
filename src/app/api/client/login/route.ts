import { clearClientCookie, postClientLogin } from "@/lib/client-proxy";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    password?: unknown;
  } | null;
  if (typeof body?.email !== "string" || typeof body.password !== "string") {
    return Response.json(
      { ok: false, error: "Email and password are required" },
      { status: 400 },
    );
  }
  return postClientLogin(body.email, body.password);
}

export async function DELETE() {
  await clearClientCookie();
  return Response.json({ ok: true });
}