import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AppNavItem } from "@/components/dashboard/app-nav-config";
import { navItemBelongsToRole, useNavGroups } from "@/lib/hooks/use-nav-groups";

const mockPathnameRef = { current: "/dashboard" };

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathnameRef.current,
}));

afterEach(() => {
  mockPathnameRef.current = "/dashboard";
});

function item(partial: Partial<AppNavItem>): AppNavItem {
  return {
    title: "x",
    url: "/x",
    icon: (() => null) as unknown as AppNavItem["icon"],
    ...partial,
  } as AppNavItem;
}

describe("useNavGroups", () => {
  it("returns the customer sidebar groups for the client audience", () => {
    mockPathnameRef.current = "/dashboard";
    const { result } = renderHook(() =>
      useNavGroups("client", { role: "client_owner" }),
    );

    const labels = result.current.map((group) => group.label);
    expect(labels).toEqual(
      expect.arrayContaining(["Workspace", "Organization", "Account", "Developer"]),
    );
    // No platform "Operator" group leaks into the customer sidebar.
    expect(labels).not.toContain("Operator");
  });

  it("hides owner/admin-only entries from a reviewer", () => {
    const { result } = renderHook(() =>
      useNavGroups("client", { role: "client_reviewer" }),
    );
    const titles = result.current.flatMap((group) =>
      group.items.map((item) => item.title),
    );

    expect(titles).toContain("Assigned reviews");
    expect(titles).toContain("Completed reviews");
    expect(titles).not.toContain("Workflows");
    expect(titles).not.toContain("API keys");
    expect(titles).not.toContain("Billing");
    expect(titles).not.toContain("Team");
  });

  it("hides developer-only entries from an owner", () => {
    const { result } = renderHook(() =>
      useNavGroups("client", { role: "client_owner" }),
    );
    const titles = result.current.flatMap((group) =>
      group.items.map((item) => item.title),
    );

    expect(titles).toContain("Integration logs");
    expect(titles).not.toContain("Assigned reviews");
  });

  it("rewrites workspace-scoped URLs to include the active workspace id", () => {
    mockPathnameRef.current =
      "/dashboard/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/sessions";
    const { result } = renderHook(() =>
      useNavGroups("client", { role: "client_owner" }),
    );
    const sessions = result.current
      .flatMap((group) => group.items)
      .find((item) => item.title === "Verifications");

    expect(sessions?.url).toBe(
      "/dashboard/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/sessions",
    );
  });

  it("leaves organization-scoped URLs untouched when a workspace is active", () => {
    mockPathnameRef.current = "/dashboard/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
    const { result } = renderHook(() =>
      useNavGroups("client", { role: "client_owner" }),
    );
    const billing = result.current
      .flatMap((group) => group.items)
      .find((item) => item.title === "Billing");

    expect(billing?.url).toBe("/dashboard/billing");
  });

  it("renders operator entries for the admin audience filtered by platform role", () => {
    mockPathnameRef.current = "/admin";
    const { result } = renderHook(() =>
      useNavGroups("admin", { platformRole: "platform_support" }),
    );
    const titles = result.current
      .flatMap((group) => group.items)
      .map((item) => item.title);

    expect(titles).toContain("Support");
    expect(titles).toContain("Verifications");
    expect(titles).not.toContain("Billing & credits");
    expect(titles).not.toContain("Sales");
    expect(titles).not.toContain("Platform admins");
  });

  it("falls back to the operator overview for the platform owner", () => {
    mockPathnameRef.current = "/admin";
    const { result } = renderHook(() =>
      useNavGroups("admin", { platformRole: "platform_owner" }),
    );
    const titles = result.current
      .flatMap((group) => group.items)
      .map((item) => item.title);

    expect(titles).toEqual(
      expect.arrayContaining([
        "Overview",
        "Organizations",
        "Workspaces",
        "Verifications",
        "Billing & credits",
        "Support",
        "Sales",
        "Platform admins",
        "Audit logs",
        "System settings",
      ]),
    );
  });
});

describe("navItemBelongsToRole", () => {
  it("returns true when the item has no role allow-list", () => {
    expect(navItemBelongsToRole(item({}), "client_reviewer")).toBe(true);
  });

  it("returns true when the role is in the allow-list", () => {
    expect(
      navItemBelongsToRole(
        item({ roles: ["client_owner", "client_admin"] }),
        "client_admin",
      ),
    ).toBe(true);
  });

  it("returns false when the role is missing or not allowed", () => {
    expect(navItemBelongsToRole(item({ roles: ["client_owner"] }), null)).toBe(
      false,
    );
    expect(
      navItemBelongsToRole(item({ roles: ["client_owner"] }), "client_developer"),
    ).toBe(false);
  });
});