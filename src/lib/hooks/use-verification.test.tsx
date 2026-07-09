import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it } from "vitest";
import type { ReactNode } from "react";

import { publicEnv } from "@/lib/env";
import { useVerification } from "@/lib/hooks/use-verification";
import { server } from "@/test/msw/server";

const base = publicEnv.apiBaseUrl.replace(/\/$/, "");

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

afterEach(() => {
  server.resetHandlers();
});

describe("useVerification", () => {
  it("returns data on a successful fetch", async () => {
    const { result } = renderHook(
      () => useVerification({ verificationId: "abc" }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
    expect(result.current.data?.status).toBe("processing");
  });

  it("does not fetch when verificationId is missing", async () => {
    const { result } = renderHook(
      () => useVerification({ verificationId: "" }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeUndefined();
  });

  it("surfaces a 404 error", async () => {
    server.use(
      http.get(`${base}/api/v1/verifications/:id`, () =>
        HttpResponse.json({ detail: "Not found" }, { status: 404 }),
      ),
    );
    const { result } = renderHook(
      () => useVerification({ verificationId: "missing" }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error).not.toBeNull();
    expect((result.current.error as Error).message.length).toBeGreaterThan(0);
  });

  it("stops polling once the status is terminal", async () => {
    let requestCount = 0;
    server.use(
      http.get(`${base}/api/v1/verifications/:id`, () => {
        requestCount += 1;
        return HttpResponse.json({
          verification_id: "abc",
          external_user_id: "user_1",
          metadata: {},
          status: "approved",
          checks: {},
          risk_score: 5,
          decision_reason: "All checks passed",
          created_at: "2026-06-23T10:00:00Z",
          updated_at: "2026-06-23T10:00:30Z",
        });
      }),
    );
    const { result } = renderHook(
      () => useVerification({ verificationId: "abc" }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => {
      expect(result.current.data?.status).toBe("approved");
    });
    const initialCount = requestCount;
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(requestCount).toBe(initialCount);
  });
});
