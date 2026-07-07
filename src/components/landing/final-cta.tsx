/**
 * FinalCta - "Add identity verification to your product before next week."
 *
 * A poster-style dark canvas with a large serif headline set
 * intentionally tight against the page margin. A small block
 * of metadata (deadline / audience / status) sits below; two
 * CTAs sit below that. The single accent is the cyan italic
 * phrase on the headline. No decorative orbs.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionMarker } from "@/components/landing/section-marker";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

export function FinalCta() {
  return (
    <section
      aria-labelledby="cta-headline"
      className="relative isolate overflow-hidden bg-[var(--landing-canvas)] text-[var(--landing-canvas-ink)]"
    >
      <div
        aria-hidden
        className="absolute inset-0 landing-grid-soft opacity-[0.14]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[8%] top-[58%] h-[480px] w-[480px] rounded-full bg-[var(--landing-cyan-soft)] opacity-35 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-28 sm:px-8 sm:py-40 lg:px-10">
        <Reveal className="flex flex-col gap-6">
          <SectionMarker
            index={10}
            eyebrow="Ship before fraud becomes your growth tax"
            meta="Sign-up · Dev → live in one session"
          />
        </Reveal>

        <Reveal delay={0.08}>
          <h2
            id="cta-headline"
className={cn(
        "mt-8 max-w-5xl font-display font-medium tracking-[-0.04em]",
        "text-6xl leading-[0.95]",
        "sm:text-7xl",
        "lg:text-8xl",
      )}
          >
            Add identity verification to your product{" "}
            <span className="italic text-[var(--landing-cyan)]">before next week.</span>
          </h2>
        </Reveal>

    <Reveal delay={0.16}>
      <p className="mt-8 max-w-2xl text-[15.5px] leading-relaxed text-[var(--landing-canvas-ink-soft)] sm:text-base">
        Use the sandbox with your own workflow. Run your first real
        verification with a test key. Hand the review queue to your
        support lead. No procurement, no four-vendor stack, no
        compliance consultant required.
      </p>
    </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className={cn(
                "group inline-flex h-12 items-center gap-2 rounded-md px-6 text-sm font-medium",
                "bg-[var(--landing-cyan)] text-[var(--landing-canvas)]",
                "transition-colors hover:bg-[color-mix(in_oklch,var(--landing-cyan)_88%,white)]",
                "focus-visible:ring-2 focus-visible:ring-[var(--landing-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-canvas)] focus-visible:outline-none",
              )}
            >
              Start building with HaloKYC
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </Link>
            <Link
              href="/console"
              className={cn(
                "inline-flex h-12 items-center gap-2 rounded-md px-5 text-sm font-medium",
                "border border-[var(--landing-hair)] bg-transparent text-[var(--landing-canvas-ink)]",
                "transition-colors hover:bg-[var(--landing-canvas-edge)]",
                "focus-visible:ring-2 focus-visible:ring-[var(--landing-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-canvas)] focus-visible:outline-none",
              )}
            >
              Read the docs
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.32}>
          <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-[var(--landing-hair)] pt-6 sm:grid-cols-4">
            {[
              ["First call", "15 minutes"],
              ["First session", "same day"],
              ["First review", "next morning"],
              ["Pricing", "no quotes"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1">
                <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--landing-canvas-mute)]">
                  {k}
                </dt>
                <dd className="font-sans text-base font-medium tabular-nums text-[var(--landing-canvas-ink)] sm:text-lg">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
