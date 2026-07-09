"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CameraIcon, RotateCcwIcon, UploadIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CaptureStepProps = {
  acceptCamera: "user" | "environment";
  file: File | null;
  hint: string;
  livenessPrompt?: boolean;
  onChange: (file: File | null) => void;
  title: string;
};

export function CaptureStep({
  acceptCamera,
  file,
  hint,
  livenessPrompt = false,
  onChange,
  title,
}: CaptureStepProps) {
  const fileInputId = `file-${acceptCamera}-${livenessPrompt ? "selfie" : title.includes("front") ? "front" : "back"}`;
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }, []);

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  async function openCamera() {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("This browser cannot open the camera. Choose a photo instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: acceptCamera } },
      });
      streamRef.current = stream;
      setCameraActive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      setCameraError(
        "Camera access was blocked or unavailable. Choose a JPEG, PNG, or WEBP instead.",
      );
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("The camera is still starting. Wait a moment and try again.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("The photo could not be captured. Choose a file instead.");
          return;
        }
        onChange(new File([blob], `${acceptCamera === "user" ? "selfie" : "id"}.jpg`, { type: "image/jpeg" }));
        stopCamera();
      },
      "image/jpeg",
      0.92,
    );
  }

  function retake() {
    stopCamera();
    setCameraError(null);
    onChange(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-sm">{hint}</p>
      </div>

      {livenessPrompt ? (
        <Alert>
          <CameraIcon />
          <AlertTitle>Blink twice before the photo</AlertTitle>
          <AlertDescription>
            Look straight at the camera, blink twice, then hold still. This is
            a visual guide; the secure check happens after upload.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-xl border">
        {file ? (
          <ObjectUrlImage key={`${file.name}-${file.size}-${file.lastModified}`} file={file} alt={`${title} preview`} />
        ) : (
          <video
            ref={videoRef}
            aria-label={`${title} camera preview`}
            autoPlay
            muted
            playsInline
            className={cameraActive ? "size-full object-cover" : "hidden"}
          />
        )}
        {!file && !cameraActive ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
            <CameraIcon aria-hidden className="text-muted-foreground size-8" strokeWidth={1.75} />
            <p className="text-muted-foreground text-sm">
              Keep the subject centered, fully visible, and free from glare.
            </p>
          </div>
        ) : null}
      </div>

      {cameraError ? (
        <Alert variant="destructive">
          <AlertTitle>Camera unavailable</AlertTitle>
          <AlertDescription>{cameraError}</AlertDescription>
        </Alert>
      ) : null}

      {file ? (
        <Button type="button" variant="outline" onClick={retake}>
          <RotateCcwIcon data-icon="inline-start" />
          Retake photo
        </Button>
      ) : cameraActive ? (
        <div className="flex gap-2">
          <Button type="button" className="flex-1" onClick={capturePhoto}>
            <CameraIcon data-icon="inline-start" />
            Take photo
          </Button>
          <Button type="button" variant="outline" onClick={stopCamera}>
            Cancel
          </Button>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <Button type="button" onClick={openCamera}>
            <CameraIcon data-icon="inline-start" />
            Use camera
          </Button>
          <Button
            type="button"
            variant="outline"
            nativeButton={false}
            render={<label htmlFor={fileInputId} />}
          >
            <UploadIcon data-icon="inline-start" />
            Choose photo
          </Button>
          <Input
            id={fileInputId}
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture={acceptCamera}
            onChange={(event) => onChange(event.target.files?.[0] ?? null)}
          />
        </div>
      )}
    </div>
  );
}

function ObjectUrlImage({ file, alt }: { file: File; alt: string }) {
  const [objectUrl] = useState(() => URL.createObjectURL(file));

  useEffect(() => () => URL.revokeObjectURL(objectUrl), [objectUrl]);

  // A local object URL is the only source here; next/image cannot optimize it.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={objectUrl} alt={alt} className="size-full object-cover" />;
}
