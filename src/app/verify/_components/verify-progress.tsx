"use client";

import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type VerifyProgressProps = {
  value: number;
  label: string;
  className?: string;
};

export function VerifyProgress({
  value,
  label,
  className,
}: VerifyProgressProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="group"
      aria-label="Verification progress"
      className={cn("flex flex-col gap-2", className)}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="text-muted-foreground font-mono tabular-nums">
          {clamped}%
        </span>
      </div>
      <Progress className="mb-4 h-1.5" value={clamped} />
    </div>
  );
}
