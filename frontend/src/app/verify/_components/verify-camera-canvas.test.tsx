import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { VerifyCameraCanvas } from "./verify-camera-canvas";

const defaultProps = {
  facing: "user" as const,
  file: null,
  onChange: vi.fn(),
};

describe("VerifyCameraCanvas", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("hides the file-picker fallback when cameraOnly is true", async () => {
    const stop = vi.fn();
    const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream;
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });

    render(<VerifyCameraCanvas {...defaultProps} cameraOnly />);

    expect(screen.queryByText("Choose photo")).toBeNull();
    expect(screen.queryByText(/choose a file/i)).toBeNull();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /take selfie|take photo/i }),
      ).toBeVisible(),
    );
    expect(screen.queryByText("Choose photo")).toBeNull();
  });

  it("shows camera startup and Choose photo when cameraOnly is false", async () => {
    render(<VerifyCameraCanvas {...defaultProps} />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /open camera|opening camera/i }),
      ).toBeVisible(),
    );
    expect(screen.getByRole("button", { name: "Choose photo" })).toBeVisible();
  });

  it("falls back to a single Open camera button on cameraOnly when unsupported", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: undefined,
    });
    render(<VerifyCameraCanvas {...defaultProps} cameraOnly />);

    expect(
      await screen.findByText(/this browser cannot open the camera/i),
    ).toBeVisible();
    expect(screen.queryByText("Choose photo")).toBeNull();
  });

  it("renders a preview when a file is provided", () => {
    if (
      typeof URL.createObjectURL !== "function" ||
      typeof URL.revokeObjectURL !== "function"
    ) {
      return;
    }
    const file = new File(["image"], "selfie.jpg", { type: "image/jpeg" });
    render(<VerifyCameraCanvas {...defaultProps} file={file} />);
    const img = screen.getByRole("img", { name: "Captured preview" });
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src") ?? "").toMatch(/^blob:/);
  });

  it("invokes onChange when the file input emits a file", async () => {
    if (
      typeof URL.createObjectURL !== "function" ||
      typeof URL.revokeObjectURL !== "function"
    ) {
      return;
    }
    const onChange = vi.fn();
    render(<VerifyCameraCanvas {...defaultProps} onChange={onChange} />);
    const input = document.querySelector('input[type="file"]');
    expect(input).not.toBeNull();
    const file = new File(["x"], "selfie.png", { type: "image/png" });
    fireEvent.change(input!, { target: { files: [file] } });
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(file));
  });
});
