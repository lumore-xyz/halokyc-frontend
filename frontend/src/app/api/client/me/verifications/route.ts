import type { NextRequest } from "next/server";

import { backendClientFetch } from "@/lib/client-proxy";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const params = url.searchParams.toString();
  const path = params
    ? `/api/v1/me/verifications?${params}`
    : "/api/v1/me/verifications";
  return backendClientFetch(path);
}