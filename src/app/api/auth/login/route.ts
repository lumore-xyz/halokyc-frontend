import { NextResponse } from "next/server";

import { backendUrl } from "@/lib/env";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;
  if (typeof body?.email !== "string" || typeof body?.password !== "string") {
    return NextResponse.json({ ok: false, error: "Email and password are required" }, { status: 400 });
  }
  const response = await fetch(backendUrl("/api/v1/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ ok: false, error: await response.text() }, { status: response.status });
  return NextResponse.json(await response.json());
}
