"use client";

import {
  CheckCircleIcon,
  IdCardIcon,
  LightbulbIcon,
  ScanLineIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type VerifyStepDocumentInstructionProps = {
  onContinue: () => void;
  pending?: boolean;
};

export function VerifyStepDocumentInstruction({
  onContinue,
  pending,
}: VerifyStepDocumentInstructionProps) {
  return (
    <div className="verify-step-enter flex min-h-0 flex-1 flex-col gap-6">
      <header className="flex shrink-0 flex-col items-center gap-3 text-center">
        <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
          <IdCardIcon className="size-6" strokeWidth={1.75} aria-hidden />
        </span>
        <h2 className="text-2xl font-semibold">Prepare your ID document</h2>
        <p className="text-muted-foreground max-w-xs text-sm leading-6">
          Place your ID on a flat surface before opening the camera. You&apos;ll
          capture each side separately.
        </p>
      </header>

      <div className="-mr-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
        <div className="border-border/70 bg-muted/30 rounded-lg border p-4">
          <p className="text-sm font-medium">You&apos;ll need</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <SideHint title="Front" detail="Photo, name, date of birth" />
            <SideHint title="Back" detail="Barcode or address details" />
          </div>
        </div>

        <ul className="grid gap-3 text-sm" role="list">
          <PrepRow
            icon={
              <ScanLineIcon className="size-5" strokeWidth={1.75} aria-hidden />
            }
            title="Fit the full ID in frame"
            detail="Show all four corners. Do not crop the edges."
          />
          <PrepRow
            icon={
              <LightbulbIcon
                className="size-5"
                strokeWidth={1.75}
                aria-hidden
              />
            }
            title="Avoid glare"
            detail="Tilt the ID slightly if lights reflect on the surface."
          />
          <PrepRow
            icon={
              <CheckCircleIcon
                className="size-5"
                strokeWidth={1.75}
                aria-hidden
              />
            }
            title="Keep text clear"
            detail="Hold the ID by the edges and keep fingers off the text."
          />
        </ul>
      </div>

      <div className="mt-auto flex shrink-0 flex-col gap-4">
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={onContinue}
          disabled={pending}
        >
          {pending ? "Starting..." : "Open camera"}
        </Button>
      </div>
    </div>
  );
}

function SideHint({ detail, title }: { detail: string; title: string }) {
  return (
    <div className="min-w-0">
      <p className="text-foreground font-medium">{title}</p>
      <p className="text-muted-foreground mt-1 text-xs leading-5">{detail}</p>
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
