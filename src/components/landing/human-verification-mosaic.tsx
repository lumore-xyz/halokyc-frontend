import { CheckCircle2, ShieldCheck } from "lucide-react";
import Image from "next/image";

export function HumanVerificationMosaic() {
  return (
    <figure className="relative mx-auto w-full max-w-xl pb-10 sm:pr-7">
      <div className="relative aspect-[1.18/1] overflow-hidden rounded-[1.75rem] border border-[var(--landing-hair)] bg-[var(--landing-canvas-edge)] shadow-[var(--shadow-card)]">
        <Image
          src="/assets/landing/verification-people-mosaic.png"
          alt="People completing identity checks and a product team reviewing a result"
          fill
          priority
          sizes="(min-width: 768px) 48vw, 100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[var(--landing-canvas)]/45 via-transparent to-transparent"
        />
      </div>

      <div className="absolute right-0 bottom-0 w-[82%] rounded-[1.25rem] border border-[var(--landing-hair)] bg-[color-mix(in_oklch,var(--landing-canvas-edge)_92%,transparent)] p-4 shadow-[var(--shadow-card)] backdrop-blur-xl sm:w-[72%]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-[var(--landing-cyan)] text-[var(--landing-canvas)]">
              <ShieldCheck className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--landing-canvas-mute)]">
                Verification complete
              </p>
              <p className="font-display text-base font-semibold text-[var(--landing-canvas-ink)]">
                A decision your team can explain
              </p>
            </div>
          </div>
          <CheckCircle2
            className="size-5 shrink-0 text-[var(--landing-mint)]"
            strokeWidth={1.75}
            aria-hidden
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[10px] text-[var(--landing-canvas-ink-soft)]">
          {["Liveness passed", "Face matched", "Webhook signed"].map(
            (label) => (
              <span
                key={label}
                className="rounded-full border border-[var(--landing-hair)] px-2.5 py-1"
              >
                {label}
              </span>
            ),
          )}
        </div>
      </div>
    </figure>
  );
}
