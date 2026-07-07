"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraFacing = "user" | "environment";

export type CameraStatus =
  | "idle"
  | "requesting"
  | "active"
  | "blocked"
  | "unsupported"
  | "error";

export type VerifyCameraBindings = {
  status: CameraStatus;
  errorMessage: string | null;
  start: () => Promise<void>;
  stop: () => void;
  capture: () => Promise<File | null>;
  videoNode: React.RefObject<HTMLVideoElement | null>;
};

export type UseVerifyCameraOptions = {
  facing: CameraFacing;
};

/**
 * Owns the camera lifecycle. The consumer attaches the returned `videoRef`
 * to a `<video>` element; capture() reads from that element.
 */
export function useVerifyCamera({
  facing,
}: UseVerifyCameraOptions): VerifyCameraBindings {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) video.srcObject = null;
    setStatus((current) => (current === "active" ? "idle" : current));
  }, []);

  const start = useCallback(async () => {
    setErrorMessage(null);
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setStatus("unsupported");
      setErrorMessage(
        "This browser cannot open the camera. Choose a photo instead.",
      );
      return;
    }
    setStatus("requesting");
    try {
      const next = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: facing } },
      });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = next;
      setStatus("active");
      requestAnimationFrame(() => {
        const video = videoRef.current;
        if (video) {
          video.srcObject = next;
          void video.play();
        }
      });
    } catch {
      setStatus("blocked");
      setErrorMessage(
        "Camera access was blocked or unavailable. Allow camera access or choose a JPEG, PNG, or WEBP instead.",
      );
    }
  }, [facing]);

  const capture = useCallback(async (): Promise<File | null> => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setErrorMessage(
        "The camera is still starting. Wait a moment and try again.",
      );
      return null;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setErrorMessage(
        "The photo could not be captured. Choose a file instead.",
      );
      return null;
    }
    context.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((next) => resolve(next), "image/jpeg", 0.92),
    );
    if (!blob) {
      setErrorMessage(
        "The photo could not be captured. Choose a file instead.",
      );
      return null;
    }
    return new File(
      [blob],
      `${facing === "user" ? "selfie" : "document"}.jpg`,
      { type: "image/jpeg" },
    );
  }, [facing]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  return { status, errorMessage, start, stop, capture, videoNode: videoRef };
}