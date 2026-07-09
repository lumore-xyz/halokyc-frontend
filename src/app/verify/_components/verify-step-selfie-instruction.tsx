"use client";

import { CameraIcon, LightbulbIcon, ScanFaceIcon } from "lucide-react";

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
    <div className="verify-step-enter flex flex-1 flex-col gap-7">
      <header className="flex flex-col items-center gap-3 text-center">
        <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
          <ScanFaceIcon className="size-6" strokeWidth={1.75} aria-hidden />
        </span>
        <h2 className="text-2xl font-semibold">Get ready for your selfie</h2>
        <p className="text-muted-foreground max-w-xs text-sm leading-6">
          We&apos;ll open your camera for a live photo. Center your face and hold
          still for a moment.
        </p>
      </header>

      <ul className="grid gap-3 text-sm" role="list">
        <PrepRow
          icon={<CameraIcon className="size-5" strokeWidth={1.75} aria-hidden />}
          title="Live camera"
          detail="Use the device camera, not an uploaded image."
        />
        <PrepRow
          icon={
            <ScanFaceIcon className="size-5" strokeWidth={1.75} aria-hidden />
          }
          title="Face forward"
          detail="Remove sunglasses, masks, or anything covering your face."
        />
        <PrepRow
          icon={
            <LightbulbIcon className="size-5" strokeWidth={1.75} aria-hidden />
          }
          title="Even lighting"
          detail="Face a light source and avoid a bright window behind you."
        />
      </ul>

      <div className="mt-auto flex flex-col gap-3">
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={onContinue}
          disabled={pending}
        >
          {pending ? "Starting..." : "Open camera"}
        </Button>
        <p className="text-muted-foreground text-center text-xs leading-5">
          Protected by HaloKYC. Your biometric data is used only for this
          verification.
        </p>
      </div>
    </div>
  );
}

function PrepRow({
  detail,
  icon,
  title,
}: {
  detail: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <li className="border-border/70 flex items-start gap-3 rounded-lg border bg-background/35 p-4">
      <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-medium">{title}</span>
        <span className="text-muted-foreground block text-sm leading-5">
          {detail}
        </span>
      </span>
    </li>
  );
}
