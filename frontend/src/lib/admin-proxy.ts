import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE, adminSessionFromToken } from "@/lib/auth-session";
import { backendUrl } from "@/lib/env";

type BackendErrorBody = {
  detail?: unknown;
};

export type AdminTokenPayload = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
};

export async function getAdminToken(): Promise<string | null> {
  return (await cookies()).get(ADMIN_COOKIE)?.value ?? null;
}

export async function setAdminCookie(token: string, maxAge: number) {
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax",
    secure: true,
  });
}

export async function setAdminSession(token: string, maxAge: number) {
  await setAdminCookie(token, maxAge);
  return NextResponse.json({ ok: true });
}

export async function clearAdminCookie() {
  (await cookies()).set(ADMIN_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: true,
  });
}

export async function backendFetch(path: string, init: RequestInit = {}) {
  const token = await getAdminToken();
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 },
    );
  }
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(backendUrl(path), {
    ...init,
    headers,
    cache: "no-store",
  });
  if (!response.ok) {
    return mirrorBackendError(response);
  }
  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }
  return NextResponse.json(await response.json());
}

export async function postAdminLogin(username: string, password: string) {
  const response = await fetch(backendUrl("/api/v1/auth/admin/token"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });
  if (!response.ok) return mirrorBackendError(response);
  const token = (await response.json()) as AdminTokenPayload;
  await setAdminCookie(token.access_token, token.expires_in);
  return NextResponse.json({ ok: true });
}

async function mirrorBackendError(response: Response) {
  let error = response.statusText || "Request failed";
  try {
    const body = (await response.json()) as BackendErrorBody;
    if (typeof body.detail === "string") error = body.detail;
  } catch {
    // keep status text fallback
  }
  return NextResponse.json({ ok: false, error }, { status: response.status });
}

export { adminSessionFromToken };
