import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./_components/verification-flow", () => ({
  VerificationFlow: ({
    initialVerificationId,
  }: {
    initialVerificationId?: string;
  }) => (
    <div
      data-testid="verification-flow"
      data-verification-id={initialVerificationId}
    />
  ),
}));

import VerifyPage from "./page";

describe("VerifyPage", () => {
  it("renders the missing-session notice when no verification_id is supplied", async () => {
    const element = await VerifyPage({
      searchParams: Promise.resolve({}),
    });
    render(element);

    expect(
      screen.getByRole("heading", { name: /Verification session required/i }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("verification-flow")).not.toBeInTheDocument();
  });

  it("renders the flow with the verification_id from the URL", async () => {
    const element = await VerifyPage({
      searchParams: Promise.resolve({
        verification_id: "11111111-2222-3333-4444-555555555555",
      }),
    });
    render(element);

    const flow = screen.getByTestId("verification-flow");
    expect(flow).toBeInTheDocument();
    expect(flow.dataset.verificationId).toBe(
      "11111111-2222-3333-4444-555555555555",
    );
  });

  it("ignores callback_url query values", async () => {
    const element = await VerifyPage({
      searchParams: Promise.resolve({
        verification_id: "11111111-2222-3333-4444-555555555555",
        callback_url: "https://example.com/done",
      }),
    });
    render(element);

    const flow = screen.getByTestId("verification-flow");
    expect(flow).not.toHaveAttribute("data-callback-url");
  });

  it("uses the first value when verification_id is duplicated", async () => {
    const element = await VerifyPage({
      searchParams: Promise.resolve({
        verification_id: ["first-uuid", "second-uuid"],
      }),
    });
    render(element);

    const flow = screen.getByTestId("verification-flow");
    expect(flow.dataset.verificationId).toBe("first-uuid");
  });
});
