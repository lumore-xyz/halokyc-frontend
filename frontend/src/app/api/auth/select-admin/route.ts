import { NextResponse } from "next/server";

import { backendUrl } from "@/lib/env";

export async function POST(request: Request) {
  const authHeader = (await request.headers).get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ ok: false, error: "Authorization header required" }, { status: 401 });
  }
  const response = await fetch(backendUrl("/api/v1/auth/select-admin"), {
    method: "POST",
    headers: { 
      "Authorization": authHeader,
      "Content-Type": "application/json" 
    },
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ ok: false, error: await response.text() }, { status: response.status });
  return NextResponse.json(await response.json());
}
