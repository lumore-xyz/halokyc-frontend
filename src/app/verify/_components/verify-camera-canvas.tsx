"use client";

import {
  ArrowLeftIcon,
  CameraIcon,
  EyeIcon,
  FileImageIcon,
  GlassesIcon,
  LightbulbIcon,
  LockKeyholeIcon,
  ScanFaceIcon,
  RefreshCcwIcon,
  ShieldCheckIcon,
  SlashIcon,
  SunIcon,
} from "lucide-react";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  checkImageAspect,
  validateVerifyFile,
} from "@/lib/verify/file-validation";

type CameraStatus =
  | "idle"
  | "requesting"
  | "active"
  | "blocked"
  | "unsupported";

type VerifyCameraCanvasProps = {
  facing: "user" | "environment";
  file: File | null;
  frameType?: "oval" | "rectangle";
  instructionPill?: string;
  acceptMime?: string;
  cameraOnly?: boolean;
  title?: string;
  guidance?: string[];
  captureLabel?: string;
  continueLabel?: string;
  skipLabel?: string;
  showBack?: boolean;
  onBack?: () => void;
  onChange: (file: File | null) => void;
  onContinue?: () => void;
  onSkip?: () => void;
};

export function VerifyCameraCanvas({
  facing,
  file,
  frameType = "oval",
  instructionPill,
  acceptMime = "image/jpeg,image/png,image/webp",
  cameraOnly = false,
  title = facing === "user" ? "Selfie capture" : "Document capture",
  guidance,
  captureLabel,
  continueLabel = "Continue",
  skipLabel,
  showBack = true,
  onBack,
  onChange,
  onContinue,
  onSkip,
}: VerifyCameraCanvasProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraStatus((current) => (current === "active" ? "idle" : current));
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setCameraStatus("unsupported");
      setCameraError(
        cameraOnly
          ? "This browser cannot open the camera. Try again from a device with camera access."
          : "This browser cannot open the camera. Choose a photo instead.",
      );
      return;
    }
    setCameraStatus("requesting");
    try {
      const next = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: facing } },
      });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = next;
      setCameraStatus("active");
      requestAnimationFrame(() => {
        const video = videoRef.current;
        if (video) {
          video.srcObject = next;
          void video.play();
        }
      });
    } catch {
      setCameraStatus("blocked");
      setCameraError(
        cameraOnly
          ? "Camera access was blocked or unavailable. Allow camera access in your browser settings and try again."
          : "Camera access was blocked or unavailable. Allow camera access or choose a JPEG, PNG, or WEBP instead.",
      );
    }
  }, [cameraOnly, facing]);

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError(
        "The camera is still starting. Wait a moment and try again.",
      );
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setCameraError("The photo could not be captured. Try again.");
      return;
    }
    ctx.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((next) => resolve(next), "image/jpeg", 0.92),
    );
    if (!blob) {
      setCameraError("The photo could not be captured. Try again.");
      return;
    }
    onChange(
      new File([blob], `${facing === "user" ? "selfie" : "document"}.jpg`, {
        type: "image/jpeg",
      }),
    );
    stopCamera();
  }, [facing, onChange, stopCamera]);

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    },
    [],
  );

  useEffect(() => {
    if (file || cameraStatus !== "idle") return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void startCamera();
    });
    return () => {
      cancelled = true;
    };
  }, [cameraStatus, file, startCamera]);

  const isActive = cameraStatus === "active";
  const showError = !file && Boolean(cameraError);
  const activeGuidance =
    guidance ??
    (frameType === "oval"
      ? [
          "Find an area with good lighting",
          "Remove anything that covers your face",
          "Look directly at the camera",
        ]
      : [
          "All four corners visible",
          "Keep text sharp and readable",
          "Avoid glare or shadows",
        ]);

  if (frameType === "oval") {
    return (
      <SelfieCaptureCanvas
        file={file}
        videoRef={videoRef}
        isActive={isActive}
        cameraStatus={cameraStatus}
        cameraError={cameraError}
        acceptMime={acceptMime}
        cameraOnly={cameraOnly}
        captureLabel={captureLabel}
        continueLabel={continueLabel}
        showBack={showBack}
        onBack={onBack}
        onCapture={capturePhoto}
        onChange={onChange}
        onContinue={onContinue}
        onRetry={startCamera}
        onStop={stopCamera}
      />
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden bg-slate-950 text-white">
      {file ? (
        <PreviewImage file={file} alt="Captured preview" />
      ) : (
        <video
          ref={videoRef}
          aria-label="Camera preview"
          autoPlay
          muted
          playsInline
          className={cn(
            "absolute inset-0 size-full object-cover",
            !isActive && "opacity-0",
          )}
        />
      )}

      {!file && !isActive ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(37,99,235,0.22),transparent_36%),linear-gradient(160deg,rgba(15,23,42,0.95),rgba(17,24,39,0.86))]" />
      ) : null}
      <div className="absolute inset-0 bg-black/38" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/65 to-transparent" />

      <div className="pointer-events-none absolute inset-0">
        <DocumentFrame
          instruction={
            instructionPill ?? "Position the document inside the frame"
          }
          visible={isActive || Boolean(file)}
        />
      </div>

      <div className="relative z-30 flex min-h-0 flex-1 flex-col px-5 py-5">
        <div className="grid grid-cols-[40px_1fr_40px] items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            disabled={!showBack || !onBack}
            aria-label="Go back"
            className={cn(
              "flex size-10 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-0",
            )}
          >
            <ArrowLeftIcon className="size-5" strokeWidth={1.75} />
          </button>
          <h2 className="truncate text-center text-sm font-semibold text-white/95">
            {title}
          </h2>
          <div aria-hidden className="size-10" />
        </div>

        {frameType === "rectangle" ? (
          <div className="mt-8 flex flex-col items-center gap-4 text-center">
            <span className="rounded-full bg-black/35 px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur-md">
              Government ID
            </span>
            <GuidanceList items={activeGuidance} />
          </div>
        ) : null}

        {!file && !isActive ? (
          <div className="mx-auto mt-auto mb-auto flex max-w-xs flex-col items-center gap-4 text-center">
            <CameraIcon className="size-10 text-white/80" strokeWidth={1.5} />
            <div className="flex flex-col gap-2">
              <p className="text-lg font-semibold">
                {facing === "user" ? "Open your camera" : "Ready to capture"}
              </p>
              <p className="text-sm leading-6 text-white/72">
                {facing === "user"
                  ? "Hold the phone steady and face the camera."
                  : "Lay the document flat. The camera opens automatically."}
              </p>
            </div>
          </div>
        ) : null}

        {showError ? (
          <Alert
            variant="destructive"
            className="mt-auto border-white/20 bg-black/55 text-white backdrop-blur-md [&>svg]:text-white"
          >
            <AlertTitle>Camera unavailable</AlertTitle>
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="mt-auto flex flex-col gap-4">
          {file ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={() => {
                  stopCamera();
                  onChange(null);
                }}
              >
                <RefreshCcwIcon data-icon="inline-start" />
                Retake
              </Button>
              <Button type="button" onClick={onContinue}>
                {continueLabel}
              </Button>
            </div>
          ) : isActive ? (
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              {!cameraOnly ? (
                <UploadFallback
                  inputId={`upload-${facing}`}
                  acceptMime={acceptMime}
                  onChange={onChange}
                  iconOnly
                />
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={capturePhoto}
                aria-label={captureLabel ?? "Take photo"}
                className="flex size-20 items-center justify-center rounded-full border-4 border-white/90 bg-white/10 shadow-[0_0_0_8px_rgba(255,255,255,0.12)] transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none"
              >
                <span className="size-14 rounded-full bg-white" />
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="justify-self-end rounded-full bg-black/35 px-4 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-md transition hover:bg-black/45 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="grid gap-2">
              <Button
                type="button"
                onClick={startCamera}
                disabled={cameraStatus === "unsupported"}
                className="w-full"
              >
                <CameraIcon data-icon="inline-start" />
                {cameraStatus === "requesting"
                  ? "Opening camera..."
                  : "Open camera"}
              </Button>
              {!cameraOnly ? (
                <UploadFallback
                  inputId={`upload-${facing}`}
                  acceptMime={acceptMime}
                  onChange={onChange}
                />
              ) : null}
              {skipLabel && onSkip ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-white hover:bg-white/10 hover:text-white"
                  onClick={onSkip}
                >
                  {skipLabel}
                </Button>
              ) : null}
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-xs text-white/58">
            <ShieldCheckIcon
              className="size-3.5"
              strokeWidth={1.75}
              aria-hidden
            />
            <span>Secured by</span>
            <BrandLogo variant="icon-color" className="size-4" />
            <span className="font-medium text-white">HaloKYC</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelfieCaptureCanvas({
  file,
  videoRef,
  isActive,
  cameraStatus,
  cameraError,
  acceptMime,
  cameraOnly,
  captureLabel,
  continueLabel,
  showBack,
  onBack,
  onCapture,
  onChange,
  onContinue,
  onRetry,
  onStop,
}: {
  file: File | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  cameraStatus: CameraStatus;
  cameraError: string | null;
  acceptMime: string;
  cameraOnly: boolean;
  captureLabel?: string;
  continueLabel: string;
  showBack: boolean;
  onBack?: () => void;
  onCapture: () => void;
  onChange: (file: File | null) => void;
  onContinue?: () => void;
  onRetry: () => void;
  onStop: () => void;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col overflow-y-auto bg-white px-6 py-5 text-slate-900 sm:px-9 sm:py-7">
      <header className="grid grid-cols-[40px_1fr_40px] items-start">
        <button
          type="button"
          onClick={onBack}
          disabled={!showBack || !onBack}
          aria-label="Go back"
          className="flex size-10 items-center justify-center rounded-full transition hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-0"
        >
          <ArrowLeftIcon className="size-6" strokeWidth={1.75} />
        </button>
        <div className="pt-1 text-center">
          <h2 className="font-display text-base font-semibold tracking-[-0.02em]">
            Selfie capture
          </h2>
          <p className="mt-1 text-xs text-slate-500">Step 1 of 2</p>
        </div>
        <ShieldCheckIcon
          className="m-2 size-6 text-emerald-500"
          strokeWidth={1.75}
          aria-label="Secure verification"
        />
      </header>

      <main className="flex flex-1 flex-col items-center">
        <div className="mt-5 flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 sm:mt-7">
          <ScanFaceIcon className="size-6" strokeWidth={1.75} aria-hidden />
        </div>
        <h1 className="font-display mt-2 text-center text-2xl font-semibold tracking-[-0.035em]">
          Let&apos;s verify you
        </h1>
        <p className="mt-2 max-w-xs text-center text-sm leading-5 text-slate-500">
          Position your face in the center
          <br />
          and ensure good lighting.
        </p>

        <div className="relative mt-3 w-full max-w-[260px] sm:max-w-[270px]">
          <div className="absolute top-1/2 -left-9 flex -translate-y-1/2 items-center text-emerald-500">
            <span className="h-px w-5 bg-emerald-400" />
            <span className="-ml-2 size-3 rotate-45 border-t border-r border-emerald-500" />
          </div>
          <div className="absolute top-1/2 -right-9 flex -translate-y-1/2 items-center text-emerald-500">
            <span className="-mr-2 size-3 rotate-45 border-b border-l border-emerald-500" />
            <span className="h-px w-5 bg-emerald-400" />
          </div>
          <div className="absolute -inset-2 rounded-[46%] border border-dashed border-emerald-100" />
          <div className="relative aspect-[0.705] overflow-hidden rounded-[46%] border border-emerald-400 bg-emerald-50/40 p-2">
            <div className="relative size-full overflow-hidden rounded-[45%] border-2 border-emerald-300 bg-slate-100">
              {file ? (
                <PreviewImage
                  file={file}
                  alt="Captured preview"
                  className="size-full object-cover"
                />
              ) : (
                <video
                  ref={videoRef}
                  aria-label="Camera preview"
                  autoPlay
                  muted
                  playsInline
                  className={cn(
                    "size-full scale-x-[-1] object-cover",
                    !isActive && "opacity-0",
                  )}
                />
              )}
              {!file && !isActive ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-emerald-50 to-white text-center text-slate-400">
                  <ScanFaceIcon
                    className="size-16 text-emerald-300"
                    strokeWidth={1.25}
                  />
                  <span className="text-xs font-medium">
                    {cameraStatus === "requesting"
                      ? "Opening camera..."
                      : "Camera preview"}
                  </span>
                </div>
              ) : null}
            </div>
            <div className="pointer-events-none absolute top-3 left-1/2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-emerald-500" />
          </div>
        </div>

        {cameraError ? (
          <Alert variant="destructive" className="mt-4 max-w-sm">
            <AlertTitle>Camera unavailable</AlertTitle>
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
        ) : null}

        <ul className="mt-6 grid w-full max-w-sm grid-cols-3 divide-x divide-slate-200 text-center">
          <SelfieTip icon={SunIcon} title="Good lighting" detail="Preferred" />
          <SelfieTip
            icon={ScanFaceIcon}
            title="Face front"
            detail="Clearly visible"
          />
          <SelfieTip
            icon={GlassesIcon}
            title="No hats or glasses"
            detail="For best results"
          />
        </ul>

        <div className="mt-7 flex min-h-20 items-center justify-center">
          {file ? (
            <div className="grid w-full max-w-xs grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onStop();
                  onChange(null);
                }}
              >
                <RefreshCcwIcon data-icon="inline-start" />
                Retake
              </Button>
              <Button type="button" onClick={onContinue}>
                {continueLabel}
              </Button>
            </div>
          ) : isActive ? (
            <div className="grid w-full max-w-xs grid-cols-[1fr_auto_1fr] items-center">
              {!cameraOnly ? (
                <UploadFallback
                  inputId="upload-user"
                  acceptMime={acceptMime}
                  onChange={onChange}
                  iconOnly
                />
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={onCapture}
                aria-label={captureLabel ?? "Take selfie"}
                className="flex size-20 items-center justify-center rounded-full bg-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.18)] transition hover:bg-emerald-200 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-4 focus-visible:outline-none"
              >
                <span className="size-14 rounded-full border-[7px] border-emerald-500 bg-white" />
              </button>
              <span />
            </div>
          ) : (
            <div className="grid gap-2">
              <Button
                type="button"
                onClick={onRetry}
                disabled={
                  cameraStatus === "requesting" ||
                  cameraStatus === "unsupported"
                }
              >
                <CameraIcon data-icon="inline-start" />
                {cameraStatus === "requesting"
                  ? "Opening camera..."
                  : "Open camera"}
              </Button>
              {!cameraOnly ? (
                <UploadFallback
                  inputId="upload-user"
                  acceptMime={acceptMime}
                  onChange={onChange}
                />
              ) : null}
            </div>
          )}
        </div>
      </main>

      <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-500">
        <LockKeyholeIcon className="size-3.5" strokeWidth={1.75} aria-hidden />
        <span>Secured by</span>
        <BrandLogo variant="icon-color" className="size-4" />
        <span className="font-semibold text-slate-900">HaloKYC</span>
      </div>
    </div>
  );
}

function SelfieTip({
  icon: Icon,
  title,
  detail,
}: {
  icon: React.ElementType;
  title: string;
  detail: string;
}) {
  return (
    <li className="flex min-w-0 flex-col items-center px-2">
      <span className="text-emerald-500">
        <Icon className="size-5" strokeWidth={1.75} aria-hidden />
      </span>
      <span className="mt-2 text-[11px] leading-4 font-semibold">{title}</span>
      <span className="mt-0.5 text-[10px] leading-4 text-slate-400">
        {detail}
      </span>
    </li>
  );
}

function UploadFallback({
  acceptMime,
  iconOnly = false,
  inputId,
  onChange,
}: {
  acceptMime: string;
  iconOnly?: boolean;
  inputId: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <>
      <Button
        type="button"
        variant="outline"
        nativeButton={false}
        className={cn(
          iconOnly
            ? "size-12 rounded-full border-white/25 bg-black/35 p-0 text-white hover:bg-black/45 hover:text-white"
            : "border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white",
        )}
        render={<label htmlFor={inputId} />}
        aria-label={iconOnly ? "Choose photo" : undefined}
      >
        {iconOnly ? (
          <FileImageIcon className="size-5" strokeWidth={1.75} aria-hidden />
        ) : (
          <>
            <FileImageIcon data-icon="inline-start" />
            Choose photo
          </>
        )}
      </Button>
      <Input
        id={inputId}
        className="sr-only"
        type="file"
        accept={acceptMime}
        onChange={async (event) => {
          const next = event.target.files?.[0] ?? null;
          if (!next) {
            onChange(null);
            return;
          }
          const validation = validateVerifyFile(next);
          if (!validation.ok) {
            event.target.value = "";
            window.alert(validation.message);
            onChange(null);
            return;
          }
          const aspect = await checkImageAspect(next);
          if (!aspect.ok && aspect.message) {
            window.alert(aspect.message);
            event.target.value = "";
            onChange(null);
            return;
          }
          onChange(next);
        }}
      />
    </>
  );
}

function GuidanceList({ items }: { items: string[] }) {
  const icons = [LightbulbIcon, EyeIcon, SlashIcon];

  return (
    <ul className="flex flex-col gap-2 text-left text-sm font-medium text-white/88">
      {items.map((item, index) => {
        const Icon = icons[index] ?? ShieldCheckIcon;
        return (
          <li key={item} className="flex items-center gap-2">
            <Icon
              className="size-4 text-white/72"
              strokeWidth={1.75}
              aria-hidden
            />
            <span>{item}</span>
          </li>
        );
      })}
    </ul>
  );
}

function DocumentFrame({
  instruction,
  visible,
}: {
  instruction: string;
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pt-20">
      <div className="relative aspect-[1.58] w-[78%] max-w-[360px]">
        <div className="absolute inset-0 rounded-2xl border-[3px] border-black/85 shadow-[0_0_0_999px_rgba(0,0,0,0.18)]" />
        <div className="absolute inset-1 rounded-xl border border-white/25" />
        <div className="absolute -bottom-20 left-1/2 max-w-[112%] -translate-x-1/2">
          <span className="block max-w-[360px] truncate rounded-full bg-black/45 px-5 py-3 text-sm font-semibold text-white shadow-sm backdrop-blur-md">
            {instruction}
          </span>
        </div>
      </div>
    </div>
  );
}

function PreviewImage({
  file,
  alt,
  className = "absolute inset-0 size-full object-cover",
}: {
  file: File;
  alt: string;
  className?: string;
}) {
  const src = URL.createObjectURL(file);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onLoad={() => URL.revokeObjectURL(src)}
    />
  );
}
