import type { NextRequest } from "next/server";

import { backendFetch } from "@/lib/admin-proxy";

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams.toString();
  const path = params
    ? `/api/v1/admin/billing/credits?${params}`
    : "/api/v1/admin/billing/credits";
  return backendFetch(path);
}