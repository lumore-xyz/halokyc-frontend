import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { backendFetch } from "@/lib/admin-proxy";
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

describe("admin backend proxy", () => {
  beforeEach(() => {
    cookieStore.get.mockReset();
    cookieStore.set.mockReset();
    cookieStore.get.mockReturnValue({ value: "admin-token" });
  });

  it("mirrors empty backend success responses without parsing JSON", async () => {
    let authorization: string | null = null;
    server.use(
      http.delete(`${base}/api/v1/admin/empty-success`, ({ request }) => {
        authorization = request.headers.get("Authorization");
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const response = await backendFetch("/api/v1/admin/empty-success", {
      method: "DELETE",
    });

    expect(response.status).toBe(204);
    await expect(response.text()).resolves.toBe("");
    expect(authorization).toBe("Bearer admin-token");
  });
});
