import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DELETE, POST } from "@/app/api/client/login/route";
import { GET } from "@/app/api/client/session/route";
import { publicEnv } from "@/lib/env";
import { server } from "@/test/msw/server";

const cookieStore = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

const base = publicEnv.apiBaseUrl.replace(/\/$/, "");

function tokenWithExp(
  exp: number,
  userId = "11111111-1111-1111-1111-111111111111",
): string {
  const payload = Buffer.from(
    JSON.stringify({
      exp,
      user_id: userId,
      organization_id: "33333333-3333-3333-3333-333333333333",
      organization_member_id: "44444444-4444-4444-4444-444444444444",
      organization_role: "client_owner",
      token_type: "client",
    }),
  ).toString("base64url");
  return `header.${payload}.signature`;
}

describe("client auth route handlers", () => {
  beforeEach(() => {
    cookieStore.get.mockReset();
    cookieStore.set.mockReset();
  });

  it("proxies login to the backend and stores the JWT in an httpOnly cookie", async () => {
    const token = tokenWithExp(Math.floor(Date.now() / 1000) + 3600);
    let capturedBody: unknown = null;
    server.use(
      http.post(`${base}/api/v1/auth/client/token`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          access_token: token,
          token_type: "bearer",
          expires_in: 3600,
        });
      }),
    );

    const response = await POST(
      new Request("http://localhost/api/client/login", {
        method: "POST",
        body: JSON.stringify({ email: "user@example.com", password: "secret" }),
      }),
    );

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(capturedBody).toEqual({
      email: "user@example.com",
      password: "secret",
    });
    expect(cookieStore.set).toHaveBeenCalledWith(
      "halokyc_client",
      token,
      expect.objectContaining({
        httpOnly: true,
        maxAge: 3600,
        path: "/",
        sameSite: "lax",
        secure: true,
      }),
    );
  });

  it("clears the client cookie on sign out", async () => {
    const response = await DELETE();

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(cookieStore.set).toHaveBeenCalledWith(
      "halokyc_client",
      "",
      expect.objectContaining({ maxAge: 0 }),
    );
  });

  it("returns the client session from a valid JWT cookie", async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    cookieStore.get.mockReturnValue({
      value: tokenWithExp(exp, "22222222-2222-2222-2222-222222222222"),
    });

    const response = await GET();

    await expect(response.json()).resolves.toEqual({
      authenticated: true,
      userId: "22222222-2222-2222-2222-222222222222",
      organizationId: "33333333-3333-3333-3333-333333333333",
      organizationMemberId: "44444444-4444-4444-4444-444444444444",
      organizationRole: "client_owner",
      expiresAt: new Date(exp * 1000).toISOString(),
    });
  });
});
