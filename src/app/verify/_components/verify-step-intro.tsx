"use client";

import {
  CameraIcon,
  IdCardIcon,
  ShieldCheckIcon,
  TimerIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import type { VerifyService } from "./verify-state-machine";

type VerifyStepIntroProps = {
  services: VerifyService[];
  workflowName?: string;
  pending: boolean;
  onContinue: () => void;
};

export function VerifyStepIntro({
  services,
  workflowName,
  pending,
  onContinue,
}: VerifyStepIntroProps) {
  const wantsSelfie =
    services.includes("selfie") || services.includes("liveness");
  const wantsDocument = services.includes("document");

  return (
    <div className="verify-step-enter flex flex-1 flex-col gap-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="font-sans text-2xl font-semibold tracking-tight">
          Identity verification
        </h1>
        <p className="text-muted-foreground text-sm">
          Complete these steps to verify your identity.
        </p>
        <span className="border-border bg-secondary text-secondary-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs">
          <TimerIcon className="size-3.5" strokeWidth={1.75} aria-hidden />
          Approx. 2 min
        </span>
        {workflowName ? (
          <span className="text-muted-foreground text-xs">{workflowName}</span>
        ) : null}
      </header>

      <ul className="flex flex-col gap-3 text-sm">
        {wantsDocument ? (
          <StepRow
            icon={<IdCardIcon className="size-4" strokeWidth={1.75} />}
            label="ID verification"
          />
        ) : null}
        {wantsSelfie ? (
          <StepRow
            icon={<CameraIcon className="size-4" strokeWidth={1.75} />}
            label="Face verification"
          />
        ) : null}
        <StepRow
          icon={<ShieldCheckIcon className="size-4" strokeWidth={1.75} />}
          label="Privacy protected end to end"
        />
      </ul>

      <div className="mt-auto flex flex-col gap-4">
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={onContinue}
          disabled={pending}
        >
          {pending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <ShieldCheckIcon data-icon="inline-start" />
          )}
          {pending ? "Starting..." : "Continue"}
        </Button>
        <p className="text-muted-foreground text-center text-xs">
          By selecting &ldquo;Continue&rdquo;, you accept the{" "}
          <a className="font-medium underline underline-offset-4" href="/terms">
            End User Terms
          </a>{" "}
          and{" "}
          <a
            className="font-medium underline underline-offset-4"
            href="/privacy"
          >
            Privacy Notice
          </a>
          . HaloKYC uses facial recognition and identity checks to verify your
          identity.
        </p>
      </div>
    </div>
  );
}

function StepRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li
      className={cn(
        "border-border/70 bg-card flex items-center justify-center gap-2 rounded-lg border px-4 py-3",
      )}
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-foreground font-medium">{label}</span>
    </li>
  );
}
