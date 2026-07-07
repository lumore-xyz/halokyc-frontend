import type { NextRequest } from "next/server";

import { backendFetch } from "@/lib/admin-proxy";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const params = url.searchParams.toString();
  const path = params
    ? `/api/v1/admin/credit-ledger?${params}`
    : "/api/v1/admin/credit-ledger";
  return backendFetch(path);
}
