import { NextResponse } from "next/server";

import {
  backendClientFetch,
  clientSessionFromToken,
  getClientToken,
} from "@/lib/client-proxy";

export async function GET(request: Request) {
  const token = await getClientToken();
  const session = clientSessionFromToken(token);
  if (!token || !session.authenticated || !session.organizationId) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const qs = url.searchParams.toString();
  return backendClientFetch(
    qs
      ? `/api/v1/organizations/${session.organizationId}/credits?${qs}`
      : `/api/v1/organizations/${session.organizationId}/credits`,
  );
}
