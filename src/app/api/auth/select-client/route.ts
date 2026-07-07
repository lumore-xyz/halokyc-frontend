import { NextResponse } from "next/server";

import { backendUrl } from "@/lib/env";

export async function POST(request: Request) {
  const authHeader = (await request.headers).get("Authorization");
  const body = (await request.json().catch(() => null)) as {
    organization_id?: string;
  } | null;
  if (!authHeader) {
    return NextResponse.json({ ok: false, error: "Authorization header required" }, { status: 401 });
  }
  if (!body?.organization_id) {
    return NextResponse.json({ ok: false, error: "organization_id is required" }, { status: 400 });
  }
  const url = new URL(backendUrl("/api/v1/auth/select-client"));
  url.searchParams.set("organization_id", body.organization_id);
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Authorization": authHeader,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ ok: false, error: await response.text() }, { status: response.status });
  return NextResponse.json(await response.json());
}
