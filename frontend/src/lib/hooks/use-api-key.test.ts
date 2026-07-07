import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useApiKey } from "@/lib/hooks/use-api-key";

const STORAGE_KEY = "halokyc.apiKey";

afterEach(() => {
  window.sessionStorage.clear();
});

describe("useApiKey", () => {
  it("starts with no key when storage is empty", () => {
    const { result } = renderHook(() => useApiKey());
    expect(result.current.apiKey).toBeNull();
  });

  it("hydrates from sessionStorage on mount", () => {
    window.sessionStorage.setItem(STORAGE_KEY, "test_key_123");
    const { result } = renderHook(() => useApiKey());
    expect(result.current.apiKey).toBe("test_key_123");
  });

  it("stores and exposes the trimmed key", () => {
    const { result } = renderHook(() => useApiKey());
    act(() => {
      result.current.setApiKey("  live_abc  ");
    });
    expect(result.current.apiKey).toBe("live_abc");
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBe("live_abc");
  });

  it("clears the key and storage on clear", () => {
    window.sessionStorage.setItem(STORAGE_KEY, "test_key_123");
    const { result } = renderHook(() => useApiKey());
    act(() => {
      result.current.clearApiKey();
    });
    expect(result.current.apiKey).toBeNull();
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("ignores whitespace-only input on set", () => {
    const { result } = renderHook(() => useApiKey());
    act(() => {
      result.current.setApiKey("   ");
    });
    expect(result.current.apiKey).toBeNull();
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});