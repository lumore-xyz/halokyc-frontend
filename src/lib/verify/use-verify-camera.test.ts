import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useVerifyCamera } from "./use-verify-camera";

function makeStream(stop = vi.fn()): MediaStream {
  return { getTracks: () => [{ stop }] } as unknown as MediaStream;
}

describe("useVerifyCamera", () => {
  const originalMediaDevices = navigator.mediaDevices;

  beforeEach(() => {
    vi.stubGlobal(
      "requestAnimationFrame",
      (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      },
    );
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  });

  afterEach(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: originalMediaDevices,
    });
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("starts the camera and exposes an active status", async () => {
    const stop = vi.fn();
    const stream = makeStream(stop);
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });

    const { result } = renderHook(() => useVerifyCamera({ facing: "user" }));
    // Simulate the canvas attaching a video element via the ref.
    result.current.videoNode.current = document.createElement("video");
    await act(async () => {
      await result.current.start();
    });

    expect(result.current.status).toBe("active");
    expect(getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: { facingMode: { ideal: "user" } },
    });
  });

  it("reports a blocked status when getUserMedia rejects", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockRejectedValue(new Error("denied")) },
    });

    const { result } = renderHook(() => useVerifyCamera({ facing: "user" }));
    await act(async () => {
      await result.current.start();
    });

    expect(result.current.status).toBe("blocked");
    expect(result.current.errorMessage).toMatch(/blocked/i);
  });

  it("reports unsupported when getUserMedia is unavailable", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() =>
      useVerifyCamera({ facing: "environment" }),
    );
    await act(async () => {
      await result.current.start();
    });

    expect(result.current.status).toBe("unsupported");
    expect(result.current.errorMessage).toMatch(/choose a photo/i);
  });

  it("stops the active stream on unmount", async () => {
    const stop = vi.fn();
    const stream = makeStream(stop);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });

    const { result, unmount } = renderHook(() =>
      useVerifyCamera({ facing: "user" }),
    );
    result.current.videoNode.current = document.createElement("video");
    await act(async () => {
      await result.current.start();
    });

    unmount();
    expect(stop).toHaveBeenCalled();
  });
});