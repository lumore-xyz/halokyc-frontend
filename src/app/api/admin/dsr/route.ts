import type { NextRequest } from "next/server";

import { backendFetch } from "@/lib/admin-proxy";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams.toString();
  return backendFetch(params ? `/api/v1/admin/dsr?${params}` : "/api/v1/admin/dsr");
}
