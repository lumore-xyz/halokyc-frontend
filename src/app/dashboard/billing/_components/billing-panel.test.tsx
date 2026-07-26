import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BillingPanel } from "@/app/dashboard/billing/_components/billing-panel";
import { apiClient } from "@/lib/api-client";

const state = vi.hoisted(() => ({
  portalAvailable: true,
  portalReason: null as
    | "no_successful_payment"
    | "billing_identity_conflict"
    | null,
  portalRefetch: vi.fn(),
}));

vi.mock("@/lib/hooks/use-client-session", () => ({
  useClientSession: () => ({
    data: { authenticated: true, organizationRole: "client_owner" },
  }),
}));

vi.mock("@/lib/hooks/use-workspaces", () => ({
  useWorkspaces: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/lib/hooks/use-credit-ledger", () => ({
  useMyCreditLedger: () => ({
    data: {
      balance: {
        available_credits: 100,
        reserved_credits: 0,
        free_credits: 100,
        subscription_credits: 0,
        purchased_credits: 0,
      },
      entries: [],
      reserved_sessions: [],
    },
    isLoading: false,
  }),
}));

vi.mock("@/lib/hooks/use-billing", () => ({
  useBillingCatalog: () => ({
    data: { subscriptions: [], credit_packs: [] },
    isLoading: false,
  }),
  useBillingSubscription: () => ({ data: null, isLoading: false }),
  useBillingEntitlements: () => ({
    data: { plan_name: "Sandbox" },
    isLoading: false,
  }),
  useBillingPortalStatus: () => ({
    data: {
      available: state.portalAvailable,
      unavailable_reason: state.portalReason,
    },
    isLoading: false,
    isError: false,
    refetch: state.portalRefetch,
  }),
  useCreateSubscriptionCheckout: () => ({ mutateAsync: vi.fn() }),
  useCreateCreditPackCheckout: () => ({ mutateAsync: vi.fn() }),
}));

describe("BillingPanel customer portal", () => {
  beforeEach(() => {
    state.portalAvailable = true;
    state.portalReason = null;
    state.portalRefetch.mockReset();
    vi.restoreAllMocks();
  });

  it("explains why billing history is unavailable before payment", () => {
    state.portalAvailable = false;
    state.portalReason = "no_successful_payment";

    render(<BillingPanel />);

    expect(
      screen.getByRole("button", { name: "Manage billing & invoices" }),
    ).toBeDisabled();
    expect(
      screen.getByText(/available after Dodo confirms your first successful/i),
    ).toBeInTheDocument();
  });

  it("creates a fresh portal session and navigates the current tab", async () => {
    const assign = vi.fn();
    vi.stubGlobal("location", { assign });
    vi.spyOn(apiClient, "createBillingPortalSession").mockResolvedValue({
      portal_url: "https://test.customer.dodopayments.com/session/test",
    });

    render(<BillingPanel />);
    fireEvent.click(
      screen.getByRole("button", { name: "Manage billing & invoices" }),
    );

    await waitFor(() => {
      expect(apiClient.createBillingPortalSession).toHaveBeenCalledTimes(1);
      expect(assign).toHaveBeenCalledWith(
        "https://test.customer.dodopayments.com/session/test",
      );
    });
  });
});
