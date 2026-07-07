import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import { server } from "@/test/msw/server";

import { AdminLoginForm } from "./admin-login-form";

const router = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false, gcTime: 0 },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

describe("AdminLoginForm", () => {
  it("validates required credentials before submitting", async () => {
    const user = userEvent.setup();
    render(<AdminLoginForm />, { wrapper: createWrapper() });

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText("Enter the admin username.")).toBeVisible();
    expect(screen.getByText("Enter the admin password.")).toBeVisible();
  });

  it("submits credentials and returns the operator to the queue", async () => {
    const user = userEvent.setup();
    let capturedBody: unknown = null;
    server.use(
      http.post(`${window.location.origin}/api/admin/login`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ ok: true });
      }),
    );
    render(<AdminLoginForm />, { wrapper: createWrapper() });

    await user.type(screen.getByLabelText("Username"), "admin");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/admin"));
    expect(capturedBody).toEqual({ username: "admin", password: "secret" });
  });
});
