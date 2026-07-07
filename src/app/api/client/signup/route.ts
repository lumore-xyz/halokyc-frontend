import { NextResponse } from "next/server";

import { postClientSignup } from "@/lib/client-proxy";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    password?: unknown;
    company_name?: unknown;
  } | null;
  if (
    typeof body?.email !== "string" ||
    typeof body.password !== "string" ||
    typeof body.company_name !== "string"
  ) {
    return NextResponse.json(
      { ok: false, error: "Email, password, and company name are required" },
      { status: 400 },
    );
  }
  return postClientSignup(body.email, body.password, body.company_name);
}