import { StrictMode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useAccountActionToken } from "./use-account-action-token";

describe("useAccountActionToken", () => {
  it("retains the token while scrubbing it from the URL in Strict Mode", async () => {
    window.history.replaceState({}, "", "/verify-email?token=one-time-token");

    const { result } = renderHook(() => useAccountActionToken(), {
      wrapper: StrictMode,
    });

    await waitFor(() => expect(result.current).toBe("one-time-token"));
    expect(window.location.search).toBe("");
  });
});
