import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { CLIENT_COOKIE, clientSessionFromToken } from "@/lib/auth-session";
import { backendUrl } from "@/lib/env";

type BackendErrorBody = {
  detail?: unknown;
};

export type ClientTokenPayload = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
};

export async function getClientToken(): Promise<string | null> {
  return (await cookies()).get(CLIENT_COOKIE)?.value ?? null;
}

export async function setClientCookie(token: string, maxAge: number) {
  (await cookies()).set(CLIENT_COOKIE, token, {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax",
    secure: true,
  });
}

export async function setClientSession(token: string, maxAge: number) {
  await setClientCookie(token, maxAge);
  return NextResponse.json({ ok: true });
}

export async function clearClientCookie() {
  (await cookies()).set(CLIENT_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: true,
  });
}

export async function backendClientFetch(path: string, init: RequestInit = {}) {
  const token = await getClientToken();
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

export async function backendClientRawFetch(
  path: string,
  init: RequestInit = {},
) {
  const token = await getClientToken();
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 },
    );
  }
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(backendUrl(path), {
    ...init,
    headers,
    cache: "no-store",
  });
  if (!response.ok) {
    return mirrorBackendError(response);
  }

  const outboundHeaders = new Headers();
  for (const header of [
    "content-type",
    "content-length",
    "content-disposition",
  ]) {
    const value = response.headers.get(header);
    if (value) outboundHeaders.set(header, value);
  }
  outboundHeaders.set("Cache-Control", "private, no-store");
  return new Response(response.body, {
    status: response.status,
    headers: outboundHeaders,
  });
}

export async function postClientLogin(email: string, password: string) {
  const response = await fetch(backendUrl("/api/v1/auth/client/token"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  if (!response.ok) return mirrorBackendError(response);
  const token = (await response.json()) as ClientTokenPayload;
  await setClientCookie(token.access_token, token.expires_in);
  return NextResponse.json({ ok: true });
}

export async function postClientSignup(
  email: string,
  password: string,
  company_name: string,
) {
  const response = await fetch(backendUrl("/api/v1/auth/client/signup"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, company_name }),
    cache: "no-store",
  });
  if (!response.ok) return mirrorBackendError(response);
  const token = (await response.json()) as ClientTokenPayload;
  await setClientCookie(token.access_token, token.expires_in);
  return NextResponse.json({ ok: true });
}

export async function getClientProfile() {
  return backendClientFetch("/api/v1/me");
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

export type { ClientSessionPayload } from "@/lib/auth-session";
export { clientSessionFromToken };
