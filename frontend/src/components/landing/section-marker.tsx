import { cn } from "@/lib/utils";

type SectionMarkerProps = {
  index?: number;
  eyebrow: string;
  meta?: string;
  tone?: "dark" | "paper";
  className?: string;
};

export function SectionMarker({ index, eyebrow, meta, tone = "dark", className }: SectionMarkerProps) {
  const ink = tone === "paper" ? "var(--landing-ink)" : "var(--landing-canvas-ink-soft)";
  const mute =
    tone === "paper"
      ? "color-mix(in oklch, var(--landing-ink) 55%, transparent)"
      : "var(--landing-canvas-mute)";
  const accent = tone === "paper" ? "var(--landing-stamp)" : "var(--landing-cyan)";

  return (
    <div className={cn("flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em]", className)}>
      {index !== undefined && (
        <>
          <span style={{ color: accent }}>SEC.</span>
          <span className="tabular-nums" style={{ color: ink }}>
            {String(index).padStart(2, "0")}
          </span>
          <span aria-hidden className="block h-px w-8" style={{ background: accent }} />
        </>
      )}
      <span style={{ color: mute }}>{eyebrow}</span>
      {meta ? (
        <span className="hidden sm:inline" style={{ color: mute }}>
          {meta}
        </span>
      ) : null}
    </div>
  );
}
