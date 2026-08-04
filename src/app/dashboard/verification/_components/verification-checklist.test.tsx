import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { VerificationChecklist } from "./verification-checklist";

vi.mock("@/lib/hooks/use-client-session", () => ({
  useClientSession: () => ({
    data: {
      authenticated: true,
      email: "owner@example.com",
      emailVerified: true,
    },
    isLoading: false,
  }),
}));

vi.mock("@/lib/hooks/use-account-verification", () => ({
  useAccountVerification: () => ({
    data: { configured: true, status: "approved" },
    isLoading: false,
  }),
  useStartAccountVerification: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}));

describe("VerificationChecklist", () => {
  it("shows both completed verification steps", () => {
    render(<VerificationChecklist />);

    expect(screen.getByText("Verify email")).toBeInTheDocument();
    expect(screen.getByText("Identity verification")).toBeInTheDocument();
    expect(screen.getAllByText("Verified")).toHaveLength(2);
    expect(
      screen.getByText(/sensitive actions are unlocked/i),
    ).toBeInTheDocument();
  });
});
