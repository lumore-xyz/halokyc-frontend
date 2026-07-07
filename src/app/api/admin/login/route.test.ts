import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DELETE, POST } from "@/app/api/admin/login/route";
import { GET } from "@/app/api/admin/session/route";
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

function tokenWithExp(exp: number): string {
  const payload = Buffer.from(
    JSON.stringify({ exp, token_type: "admin" }),
  ).toString("base64url");
  return `header.${payload}.signature`;
}

describe("admin auth route handlers", () => {
  beforeEach(() => {
    cookieStore.get.mockReset();
    cookieStore.set.mockReset();
  });

  it("proxies login to the backend and stores the JWT in an httpOnly cookie", async () => {
    const token = tokenWithExp(Math.floor(Date.now() / 1000) + 3600);
    let capturedBody: unknown = null;
    server.use(
      http.post(`${base}/api/v1/auth/admin/token`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          access_token: token,
          token_type: "bearer",
          expires_in: 3600,
        });
      }),
    );

    const response = await POST(
      new Request("http://localhost/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ username: "admin", password: "secret" }),
      }),
    );

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(capturedBody).toEqual({ username: "admin", password: "secret" });
    expect(cookieStore.set).toHaveBeenCalledWith(
      "halokyc_admin",
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

  it("clears the admin cookie on sign out", async () => {
    const response = await DELETE();

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(cookieStore.set).toHaveBeenCalledWith(
      "halokyc_admin",
      "",
      expect.objectContaining({ maxAge: 0 }),
    );
  });

  it("returns the current session from a valid JWT cookie", async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    cookieStore.get.mockReturnValue({ value: tokenWithExp(exp) });

    const response = await GET();

    await expect(response.json()).resolves.toEqual({
      authenticated: true,
      expiresAt: new Date(exp * 1000).toISOString(),
    });
  });
});
