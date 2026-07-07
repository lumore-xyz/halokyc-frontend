"use client";

import { Button } from "@/components/ui/button";

type VerifyErrorStepProps = {
  title: string;
  description: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export function VerifyErrorStep({
  title,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: VerifyErrorStepProps) {
  return (
    <div className="verify-step-enter flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex w-full flex-col gap-2">
        <Button type="button" size="lg" onClick={onPrimary}>
          {primaryLabel}
        </Button>
        {secondaryLabel && onSecondary ? (
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={onSecondary}
          >
            {secondaryLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}