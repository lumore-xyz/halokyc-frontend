"use client";

import {
  CameraIcon,
  CheckCircle2Icon,
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
  const steps = [
    wantsSelfie
      ? {
          icon: <CameraIcon className="size-4" strokeWidth={1.75} />,
          label: "Live face check",
          detail: "Use your camera for a quick selfie.",
        }
      : null,
    wantsDocument
      ? {
          icon: <IdCardIcon className="size-4" strokeWidth={1.75} />,
          label: "Document photos",
          detail: "Capture the front and back of your ID.",
        }
      : null,
    {
      icon: <ShieldCheckIcon className="size-4" strokeWidth={1.75} />,
      label: "Secure review",
      detail: "Your result is sent to the requesting service.",
    },
  ].filter(Boolean) as Array<{
    icon: React.ReactNode;
    label: string;
    detail: string;
  }>;

  return (
    <div className="verify-step-enter flex flex-1 flex-col gap-7">
      <header className="flex flex-col items-center gap-4 text-center">
        <span className="border-border bg-secondary text-secondary-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs">
          <TimerIcon className="size-3.5" strokeWidth={1.75} aria-hidden />
          About 2 minutes
        </span>
        <div className="flex max-w-sm flex-col gap-2">
          <h1 className="font-sans text-2xl font-semibold">
            Let&apos;s verify it&apos;s you
        </h1>
          <p className="text-muted-foreground text-sm leading-6">
            We&apos;ll guide you through each step. Keep your ID nearby and use
            a well-lit place.
        </p>
        </div>
        {workflowName ? (
          <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs">
            {workflowName}
          </span>
        ) : null}
      </header>

      <ul className="flex flex-col text-sm">
        {steps.map((step, index) => (
          <StepRow
            key={step.label}
            icon={step.icon}
            index={index + 1}
            label={step.label}
            detail={step.detail}
            done={false}
          />
        ))}
      </ul>

      <div className="mt-auto flex flex-col gap-3">
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
        <p className="text-muted-foreground text-center text-xs leading-5">
          By continuing, you accept the{" "}
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
          . We use identity and biometric checks only for this verification.
        </p>
      </div>
    </div>
  );
}

function StepRow({
  detail,
  done,
  icon,
  index,
  label,
}: {
  detail: string;
  done: boolean;
  icon: React.ReactNode;
  index: number;
  label: string;
}) {
  return (
    <li
      className={cn(
        "border-border/70 flex items-center gap-3 border-b py-4 first:border-t",
      )}
    >
      <span className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
        {done ? (
          <CheckCircle2Icon className="size-4" strokeWidth={1.75} />
        ) : (
          <span className="text-xs font-semibold tabular-nums">{index}</span>
        )}
      </span>
      <span className="text-muted-foreground flex size-9 shrink-0 items-center justify-center">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-foreground block font-medium">{label}</span>
        <span className="text-muted-foreground block text-xs leading-5">
          {detail}
        </span>
      </span>
    </li>
  );
}
