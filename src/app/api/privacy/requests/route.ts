import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendUrl } from "@/lib/env";

async function privacyFetch(request: NextRequest, init: RequestInit = {}) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ ok: false, error: "Subject token required" }, { status: 401 });
  }
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(backendUrl("/api/v1/privacy/requests"), {
    ...init,
    headers,
    cache: "no-store",
  });
  if (!response.ok) {
    return NextResponse.json({ ok: false, error: response.statusText }, { status: response.status });
  }
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function GET(request: NextRequest) {
  return privacyFetch(request);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  return privacyFetch(request, { method: "POST", body });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "Request id required" }, { status: 400 });
  }
  return privacyFetch(request, { method: "DELETE" });
}
