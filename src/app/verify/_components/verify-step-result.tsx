"use client";

import {
  ArrowRightIcon,
  CheckCircle2Icon,
  Clock3Icon,
  XCircleIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill";
import type { VerificationStatus } from "@/lib/api-client";

type VerifyResultStepProps = {
  status: Extract<VerificationStatus, "approved" | "rejected" | "manual_review">;
  onContinue: () => void;
};

type ResultContent = {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  cta: string;
  variant: "default" | "outline";
};

const CONTENT: Record<VerifyResultStepProps["status"], ResultContent> = {
  approved: {
    Icon: CheckCircle2Icon,
    title: "You've been verified",
    description: "That's all, no further action needed.",
    cta: "Continue",
    variant: "default",
  },
  manual_review: {
    Icon: Clock3Icon,
    title: "Submitted for review",
    description:
      "Your verification is under review. You will be notified once it is complete.",
    cta: "Continue",
    variant: "default",
  },
  rejected: {
    Icon: XCircleIcon,
    title: "We couldn't verify your identity",
    description:
      "Return to the service that requested this check for help with the next step.",
    cta: "Return to service",
    variant: "outline",
  },
};

export function VerifyResultStep({
  status,
  onContinue,
}: VerifyResultStepProps) {
  const content = CONTENT[status];
  const Icon = content.Icon;

  return (
    <div className="verify-step-enter flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <div
        className={
          status === "approved"
            ? "flex size-16 items-center justify-center rounded-full bg-[color:var(--status-approved-bg)] text-[color:var(--status-approved-fg)]"
            : status === "manual_review"
              ? "flex size-16 items-center justify-center rounded-full bg-[color:var(--status-review-bg)] text-[color:var(--status-review-fg)]"
              : "flex size-16 items-center justify-center rounded-full bg-[color:var(--status-rejected-bg)] text-[color:var(--status-rejected-fg)]"
        }
      >
        <Icon className="size-8" strokeWidth={1.75} />
      </div>
      <StatusPill status={status} />
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          {content.title}
        </h2>
        <p className="text-sm text-muted-foreground">{content.description}</p>
      </div>
      <Button
        type="button"
        size="lg"
        variant={content.variant}
        className="w-full"
        onClick={onContinue}
      >
        {content.cta}
        {status !== "rejected" ? (
          <ArrowRightIcon data-icon="inline-end" />
        ) : null}
      </Button>
    </div>
  );
}
