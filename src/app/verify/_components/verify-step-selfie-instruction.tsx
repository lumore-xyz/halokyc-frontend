"use client";

import { ShieldCheckIcon, CameraIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type VerifyStepSelfieInstructionProps = {
  onContinue: () => void;
  pending?: boolean;
};

export function VerifyStepSelfieInstruction({
  onContinue,
  pending,
}: VerifyStepSelfieInstructionProps) {
  return (
    <div className="verify-step-enter flex flex-1 flex-col gap-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Prepare for face verification
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          We&apos;ll take a live selfie to confirm it&apos;s really you. No uploaded
          photos &mdash; just look at the camera.
        </p>
      </header>

      <ul className="flex flex-col gap-3 text-sm" role="list">
        <li className="flex items-center gap-3 rounded-lg border border-border/70 bg-card p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CameraIcon className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <p className="font-medium">Live camera only</p>
            <p className="text-muted-foreground">
              We&apos;ll use your camera &mdash; no file uploads.
            </p>
          </div>
        </li>
        <li className="flex items-center gap-3 rounded-lg border border-border/70 bg-card p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <SparklesIcon className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <p className="font-medium">Natural expression</p>
            <p className="text-muted-foreground">
              Look straight ahead with a neutral face.
            </p>
          </div>
        </li>
        <li className="flex items-center gap-3 rounded-lg border border-border/70 bg-card p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheckIcon className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <p className="font-medium">Good lighting</p>
            <p className="text-muted-foreground">
              Face the light source, avoid backlight.
            </p>
          </div>
        </li>
      </ul>

      <div className="mt-auto flex flex-col gap-4">
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={onContinue}
          disabled={pending}
        >
          {pending ? "Starting&hellip;" : "Continue to Camera"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          By continuing, you accept the{" "}
          <a className="font-medium underline underline-offset-4" href="/terms">
            End User Terms
          </a>{" "}
          and{" "}
          <a className="font-medium underline underline-offset-4" href="/privacy">
            Privacy Notice
          </a>
          .
        </p>
      </div>
    </div>
  );
}