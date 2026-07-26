import { describe, expect, it } from "vitest";

import { safeClientReturnTo } from "@/lib/safe-return-to";

describe("safeClientReturnTo", () => {
  it("keeps a relative dashboard review destination", () => {
    expect(
      safeClientReturnTo(
        "/dashboard/11111111-1111-1111-1111-111111111111/reviews/review-id?source=email",
      ),
    ).toBe(
      "/dashboard/11111111-1111-1111-1111-111111111111/reviews/review-id?source=email",
    );
  });

  it.each([
    "https://attacker.example/dashboard",
    "//attacker.example/dashboard",
    "/admin/reviews/review-id",
    "/dashboard-impersonation",
    "dashboard/review-id",
  ])("rejects unsafe destination %s", (value) => {
    expect(safeClientReturnTo(value)).toBeNull();
  });
});
