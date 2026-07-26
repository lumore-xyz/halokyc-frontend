import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "@/app/api/client/billing/customer-portal/route";
import { publicEnv } from "@/lib/env";
import { server } from "@/test/msw/server";

const cookieStore = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

const base = publicEnv.apiBaseUrl.replace(/\/$/, "");

describe("customer billing portal BFF", () => {
  beforeEach(() => {
    cookieStore.get.mockReset();
    cookieStore.get.mockReturnValue({ value: "client-token" });
  });

  it("returns safe availability without exposing a customer id", async () => {
    server.use(
      http.get(`${base}/api/v1/billing/customer-portal`, ({ request }) => {
        expect(request.headers.get("authorization")).toBe(
          "Bearer client-token",
        );
        return HttpResponse.json(
          { available: true, unavailable_reason: null },
          { headers: { "Cache-Control": "no-store" } },
        );
      }),
    );

    const response = await GET();

    await expect(response.json()).resolves.toEqual({
      available: true,
      unavailable_reason: null,
    });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("creates a portal session without accepting browser-owned identity", async () => {
    let requestBody: string | null = null;
    server.use(
      http.post(
        `${base}/api/v1/billing/customer-portal`,
        async ({ request }) => {
          requestBody = await request.text();
          expect(request.headers.get("authorization")).toBe(
            "Bearer client-token",
          );
          return HttpResponse.json(
            {
              portal_url: "https://test.customer.dodopayments.com/session/test",
            },
            { headers: { "Cache-Control": "no-store" } },
          );
        },
      ),
    );

    const response = await POST();

    expect(requestBody).toBe("");
    await expect(response.json()).resolves.toEqual({
      portal_url: "https://test.customer.dodopayments.com/session/test",
    });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("preserves typed errors and retry guidance", async () => {
    server.use(
      http.post(`${base}/api/v1/billing/customer-portal`, () =>
        HttpResponse.json(
          {
            detail: {
              code: "billing_portal_rate_limited",
              message: "Try again later.",
            },
          },
          {
            status: 429,
            headers: { "Retry-After": "300" },
          },
        ),
      ),
    );

    const response = await POST();

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("300");
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({
      ok: false,
      error: expect.any(String),
      detail: {
        code: "billing_portal_rate_limited",
        message: "Try again later.",
      },
    });
  });
});
