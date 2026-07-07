import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendUrl } from "@/lib/env";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ ok: false, error: "Subject token required" }, { status: 401 });
  }
  const response = await fetch(backendUrl("/api/v1/privacy/summary"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) {
    return NextResponse.json({ ok: false, error: response.statusText }, { status: response.status });
  }
  return NextResponse.json(await response.json());
}
