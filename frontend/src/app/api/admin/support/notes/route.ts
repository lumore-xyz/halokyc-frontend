import type { NextRequest } from "next/server";

import { backendFetch } from "@/lib/admin-proxy";

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams.toString();
  const path = params
    ? `/api/v1/admin/support/notes?${params}`
    : "/api/v1/admin/support/notes";
  return backendFetch(path);
}

export async function POST(request: Request) {
  const body = await request.text();
  return backendFetch("/api/v1/admin/support/notes", {
    method: "POST",
    body,
  });
}