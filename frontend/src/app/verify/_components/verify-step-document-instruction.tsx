"use client";

import { IdCardIcon, AlertTriangleIcon, CheckCircleIcon } from "lucide-react";
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
    <div className="verify-step-enter flex min-h-0 flex-1 flex-col gap-5">
      <header className="flex shrink-0 flex-col items-center gap-3 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Prepare your ID document
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          We&apos;ll capture the front and back of your government-issued ID. Have
          it on a dark, flat surface.
        </p>
      </header>

      <div className="-mr-1 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/70 bg-card p-4">
            <p className="font-medium flex items-center gap-2">
              <IdCardIcon className="size-4 text-primary" strokeWidth={1.75} aria-hidden />
              Front side
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Photo, name, DOB, expiry</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-card p-4">
            <p className="font-medium flex items-center gap-2">
              <IdCardIcon className="size-4 text-primary" strokeWidth={1.75} aria-hidden />
              Back side
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Barcode, address, details</p>
          </div>
        </div>

        <ul className="flex flex-col gap-3 text-sm" role="list">
          <li className="flex items-center gap-3 rounded-lg border border-border/70 bg-card p-4">
            <CheckCircleIcon className="size-5 text-green-600 flex-shrink-0" strokeWidth={1.75} aria-hidden />
            <div>
              <p className="font-medium">All four corners visible</p>
              <p className="text-muted-foreground">
                Don&apos;t crop edges &mdash; show the full document.
              </p>
            </div>
          </li>
          <li className="flex items-center gap-3 rounded-lg border border-border/70 bg-card p-4">
            <CheckCircleIcon className="size-5 text-green-600 flex-shrink-0" strokeWidth={1.75} aria-hidden />
            <div>
              <p className="font-medium">No glare or reflections</p>
              <p className="text-muted-foreground">
                Tilt slightly if lights reflect.
              </p>
            </div>
          </li>
          <li className="flex items-center gap-3 rounded-lg border border-border/70 bg-card p-4">
            <AlertTriangleIcon className="size-5 text-amber-600 flex-shrink-0" strokeWidth={1.75} aria-hidden />
            <div>
              <p className="font-medium">No fingers on text</p>
              <p className="text-muted-foreground">
                Hold by edges only.
              </p>
            </div>
          </li>
          <li className="flex items-center gap-3 rounded-lg border border-border/70 bg-card p-4">
            <CheckCircleIcon className="size-5 text-green-600 flex-shrink-0" strokeWidth={1.75} aria-hidden />
            <div>
              <p className="font-medium">Dark, flat surface</p>
              <p className="text-muted-foreground">
                Black paper or table works best.
              </p>
            </div>
          </li>
        </ul>
      </div>

      <div className="mt-auto flex shrink-0 flex-col gap-4">
        <Button type="button" size="lg" className="w-full" onClick={onContinue} disabled={pending}>
          {pending ? "Starting&hellip;" : "Start Document Capture"}
        </Button>
      </div>
    </div>
  );
}
