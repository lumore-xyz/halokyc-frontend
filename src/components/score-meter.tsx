import { cn } from "@/lib/utils";

type ScoreMeterProps = {
  score: number | null | undefined;
  className?: string;
};

const BAND: Record<
  "low" | "medium" | "high" | "unknown",
  { from: string; to: string; label: string }
> = {
  low: {
    from: "oklch(0.62 0.15 150)",
    to: "oklch(0.55 0.15 150)",
    label: "Low risk",
  },
  medium: {
    from: "oklch(0.62 0.14 80)",
    to: "oklch(0.55 0.14 80)",
    label: "Medium risk",
  },
  high: {
    from: "oklch(0.62 0.20 27)",
    to: "oklch(0.55 0.20 27)",
    label: "High risk",
  },
  unknown: {
    from: "oklch(0.85 0 0)",
    to: "oklch(0.78 0 0)",
    label: "No score",
  },
};

export function scoreBandToVariant(
  score: number | null | undefined,
): keyof typeof BAND {
  if (score == null) return "unknown";
  if (score < 30) return "low";
  if (score < 60) return "medium";
  return "high";
}

export function ScoreMeter({ score, className }: ScoreMeterProps) {
  const variant = scoreBandToVariant(score);
  const band = BAND[variant];
  const numericScore =
    score == null ? null : Math.max(0, Math.min(100, Math.round(score)));

  const widthPct = numericScore == null ? 0 : numericScore;
  const gradient = `linear-gradient(90deg, ${band.from} 0%, ${band.to} 100%)`;

  return (
    <div
      role="group"
      aria-label={`Risk score: ${numericScore ?? "unknown"} of 100 (${band.label})`}
      className={cn("flex w-full flex-col gap-2", className)}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          Risk score
        </span>
        <span
          className="font-mono text-base font-semibold tabular-nums"
          aria-hidden
        >
          {numericScore == null ? "—" : `${numericScore}/100`}
        </span>
      </div>
      <div
        className="bg-muted relative h-2 w-full overflow-hidden rounded-full"
        aria-hidden
      >
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${widthPct}%`, background: gradient }}
        />
      </div>
      <p className="text-muted-foreground text-xs">{band.label}</p>
    </div>
  );
}