/**
 * DecisionSection - "The build vs. buy question."
 *
 * Warm paper section with an editorial double-page spread:
 * oversized serif headline on the left, a pull-quote callout on the
 * right, and four numbered argument cards below. The cards close
 * four specific objections: timeline, maintenance contract, hidden
 * costs, and switching cost. The cyan hairline on the first card is
 * retained as the visual entry point.
 */

"use client";

import { Reveal } from "@/components/landing/reveal";
import { SectionMarker } from "@/components/landing/section-marker";
import { cn } from "@/lib/utils";

type DecisionCard = {
  k: string;
  t: string;
  b: string;
};

const CARDS: readonly DecisionCard[] = [
  {
    k: "01",
    t: "The timeline",
    b: "A five-engineer team runs $1.2M–$1.8M to reach v1. That does not include infrastructure, model costs, security audits, or legal review. And it still needs an owner in year two, three, and four.",
  },
  {
    k: "02",
    t: "The maintenance contract",
    b: "Once identity verification is in your codebase, every future change lands on your team. New ID types, new regulations, model updates. You do not own the build. You own maintaining it forever.",
  },
  {
    k: "03",
    t: "The hidden costs you won't budget for",
    b: "Teams that build it describe the same arc: six months of excitement, twelve of debugging low-quality photos from untested regions, then compliance requests no one planned for.",
  },
  {
    k: "04",
    t: "The switching cost",
    b: "The in-house solution you launch this year still needs an owner in year five. By then, the engineer who built it has moved on. The documentation is thin. The models are stale. You are paying to maintain infrastructure you never wanted to own.",
  },
];

export function DecisionSection() {
  return (
    <section
      aria-labelledby="decision-headline"
      className="relative bg-[var(--landing-paper)] text-[var(--landing-ink)]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-10">
        <div className="grid gap-14 md:grid-cols-[1.05fr_1fr] md:gap-16">
          <Reveal className="flex flex-col gap-6">
            <SectionMarker
              index={2}
              eyebrow="Why not to rebuild the wheel."
              meta=""
              tone="paper"
            />
            <h2
              id="decision-headline"
              className={cn(
                "font-display font-semibold tracking-[-0.035em]",
                "text-4xl leading-tight",
                "sm:text-5xl",
              )}
            >
              You can verify users yourself.
              <span className="text-[color-mix(in_oklch,var(--landing-ink)_55%,transparent)]">
                {" "}
                The question is what it costs to get there.
              </span>
            </h2>
          </Reveal>

          <Reveal
            delay={0.08}
            className="flex flex-col gap-5 self-end text-[15.5px] leading-[1.7] text-[color-mix(in_oklch,var(--landing-ink)_78%,var(--landing-paper))]"
          >
            <p>
              Most early-stage products need basic trust signals before they
              need enterprise compliance platforms. Existing KYC tools come with
              per-check pricing that punishes experimentation, days of
              integration, and dashboards designed for large compliance teams.
            </p>
            <p className="font-display border-l-2 border-[var(--landing-stamp)] pl-5 text-[1.35rem] leading-snug font-semibold text-[var(--landing-ink)] sm:text-[1.5rem]">
              HaloKYC is the first version of your trust stack — one API,
              practical checks, clear decisions, and a review queue your team
              controls.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((p, i) => (
            <Reveal key={p.k} delay={0.05 * i}>
              <article
                className={cn(
                  "relative flex h-full flex-col gap-3",
                  "border border-[var(--landing-paper-edge)] bg-[var(--landing-paper)] p-6",
                  "transition-shadow hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.18)]",
                )}
              >
                {i === 0 && (
                  <span
                    aria-hidden
                    className="absolute inset-x-6 top-0 h-px bg-[var(--landing-cyan)]"
                  />
                )}
                <p className="font-mono text-[11px] tracking-[0.22em] text-[var(--landing-stamp)] uppercase">
                  Argument {p.k}
                </p>
                <p className="font-sans text-xl font-semibold tracking-tight text-[var(--landing-ink)]">
                  {p.t}
                </p>
                <p className="text-[14px] leading-relaxed text-[color-mix(in_oklch,var(--landing-ink)_72%,var(--landing-paper))]">
                  {p.b}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
