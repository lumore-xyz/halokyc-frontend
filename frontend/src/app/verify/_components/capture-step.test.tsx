import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CaptureStep } from "./capture-step";

const defaultProps = {
  acceptCamera: "user" as const,
  file: null,
  hint: "Center your face.",
  livenessPrompt: true,
  onChange: vi.fn(),
  title: "Take a selfie",
};

describe("CaptureStep", () => {
  const createObjectURL = vi.fn(() => "blob:preview");
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
  });

  it("opens the front-facing camera and stops its track on unmount", async () => {
    const stop = vi.fn();
    const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream;
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });
    const { unmount } = render(<CaptureStep {...defaultProps} />);

    await userEvent.click(screen.getByRole("button", { name: "Use camera" }));

    await waitFor(() =>
      expect(getUserMedia).toHaveBeenCalledWith({
        audio: false,
        video: { facingMode: { ideal: "user" } },
      }),
    );
    expect(screen.getByRole("button", { name: "Take photo" })).toBeVisible();
    unmount();
    expect(stop).toHaveBeenCalledOnce();
  });

  it("keeps the file picker available when camera permission is denied", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    render(<CaptureStep {...defaultProps} />);

    await userEvent.click(screen.getByRole("button", { name: "Use camera" }));

    expect(await screen.findByText(/Camera access was blocked/)).toBeVisible();
    expect(screen.getByText("Choose photo")).toBeVisible();
  });

  it("creates and revokes a preview object URL", () => {
    const file = new File(["image"], "selfie.jpg", { type: "image/jpeg" });
    const { unmount } = render(<CaptureStep {...defaultProps} file={file} />);

    expect(screen.getByRole("img", { name: "Take a selfie preview" })).toHaveAttribute(
      "src",
      "blob:preview",
    );
    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });

  it("passes a selected fallback image to the wizard", () => {
    const onChange = vi.fn();
    const file = new File(["image"], "selfie.png", { type: "image/png" });
    const { container } = render(
      <CaptureStep {...defaultProps} onChange={onChange} />,
    );
    const input = container.querySelector('input[type="file"]');
    expect(input).not.toBeNull();

    fireEvent.change(input!, { target: { files: [file] } });

    expect(onChange).toHaveBeenCalledWith(file);
  });
});
