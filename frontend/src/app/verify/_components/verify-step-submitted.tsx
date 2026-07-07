"use client";

import {
  CheckCircle2Icon,
  Clock3Icon,
  MailCheckIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type VerifySubmittedStepProps = {
  onContinue: () => void;
};

export function VerifySubmittedStep({ onContinue }: VerifySubmittedStepProps) {
  return (
    <div className="verify-step-enter flex flex-1 flex-col text-center">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-2 py-8">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[color:var(--status-approved-bg)] blur-xl" />
          <div className="relative flex size-20 items-center justify-center rounded-full border border-[color:var(--status-approved-border)] bg-[color:var(--status-approved-bg)] text-[color:var(--status-approved-fg)]">
            <CheckCircle2Icon className="size-10" strokeWidth={1.75} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Badge
            variant="outline"
            className="border-[color:var(--status-approved-border)] bg-[color:var(--status-approved-bg)] text-[color:var(--status-approved-fg)]"
          >
            <ShieldCheckIcon data-icon="inline-start" />
            Submitted
          </Badge>
          <div className="flex max-w-sm flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Thanks, you&apos;re all set
            </h2>
            <p className="text-muted-foreground text-sm leading-6">
              We&apos;ve received your verification. We&apos;ll update you with
              your verification status soon.
            </p>
          </div>
        </div>

        <div className="grid w-full gap-3 text-left">
          <StatusRow
            icon={<CheckCircle2Icon className="size-4" strokeWidth={1.75} />}
            title="Photos received"
            description="Your selfie and ID were uploaded securely."
          />
          <StatusRow
            icon={<Clock3Icon className="size-4" strokeWidth={1.75} />}
            title="Review running"
            description="The checks continue in the background."
          />
          <StatusRow
            icon={<MailCheckIcon className="size-4" strokeWidth={1.75} />}
            title="Status update"
            description="The requesting service will receive the result when it is ready."
          />
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <Button type="button" size="lg" className="w-full" onClick={onContinue}>
          Done
        </Button>
        <p className="text-muted-foreground text-xs">
          You do not need to keep this page open or upload again.
        </p>
      </div>
    </div>
  );
}

function StatusRow({
  description,
  icon,
  title,
}: {
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="border-border/70 bg-muted/30 flex gap-3 rounded-xl border p-4">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-xs leading-5">{description}</p>
      </div>
    </div>
  );
}
