/**
 * PricingSection - three plans, no hardcoded prices.
 *
 * Editorial 3-column layout. Each plan is a paper card with a
 * tiny section number, a name, a sub-headline, and a list of
 * included items; the 'Startup' plan is centered, has a cyan
 * border + Early-access chip, and reads as the poster card of
 * the section. Per AI rules: no 'unlimited', 'bank-grade', or
 * marketing-only superlatives.
 */

import Link from "next/link";

import { Reveal } from "@/components/landing/reveal";
import { SectionMarker } from "@/components/landing/section-marker";
import { cn } from "@/lib/utils";

type Plan = {
  number: string;
  name: string;
  blurb: string;
  bullets: readonly string[];
  cta: string;
  href: string;
  highlight: boolean;
  price: string;
  effectiveRate?: string;
  note?: string;
};

type PricingSectionProps = {
  index?: number;
};

const PLANS: readonly Plan[] = [
  {
    number: "01",
    name: "Sandbox",
    blurb: "Validate your integration at zero cost.",
    bullets: [
      "1,000 credits total (does not roll over)",
      "1 workspace",
      "1 team member",
      "Full API access",
      "Developer console",
      "Live verification sessions",
      "AI risk scoring with readable reasons",
      "Webhook testing with HMAC inspection",
    ],
    cta: "Start free",
    href: "/console",
    highlight: false,
    price: "$0/mo",
  },
  {
    number: "02",
    name: "Launch",
    blurb: "For products with real users and real risk.",
    bullets: [
      "1,500 credits per month (rolls over up to 15,000)",
      "Everything in Sandbox",
      "Live verification sessions",
      "AI risk scoring with readable reasons",
      "Your team's review queue",
      "Webhook retry delivery",
    ],
    cta: "Get started",
    href: "mailto:hello@halokyc.com",
    highlight: true,
    price: "$49/mo",
    effectiveRate: "~$0.033/verification",
    note: "Popular",
  },
  {
    number: "03",
    name: "Growth",
    blurb: "For teams that have found product-market fit.",
    bullets: [
      "6,000 credits per month (rolls over up to 60,000)",
      "Everything in Launch",
      "Higher volume throughput",
      "Priority support",
    ],
    cta: "Get started",
    href: "mailto:hello@halokyc.com",
    highlight: false,
    price: "$149/mo",
    effectiveRate: "~$0.025/verification",
  },
  {
    number: "04",
    name: "Scale",
    blurb: "For products operating at scale.",
    bullets: [
      "20,000 credits per month (rolls over up to 200,000)",
      "Everything in Growth",
      "Custom service thresholds",
      "Dedicated integration support",
      "SLA review",
      "Retention policy configuration",
    ],
    cta: "Get started",
    href: "mailto:hello@halokyc.com",
    highlight: false,
    price: "$399/mo",
    effectiveRate: "~$0.020/verification",
  },
];

export function PricingSection({ index = 8 }: PricingSectionProps = {}) {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-headline"
      className="relative bg-[var(--landing-canvas)] text-[var(--landing-canvas-ink)]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-10">
        <Reveal className="grid max-w-4xl gap-6">
          <SectionMarker
            index={index}
            eyebrow="KYC pricing"
            meta="Usage-based · 4 tiers"
          />
      <h2
        id="pricing-headline"
        className={cn(
"font-display font-medium tracking-[-0.03em]",
        "text-4xl leading-tight",
        "sm:text-5xl",
        )}
      >
        Pricing that grows with your{" "}
        <span className="italic text-(--landing-cyan)">real users.</span>
      </h2>
      <p className="max-w-2xl text-[15.5px] leading-relaxed text-[var(--landing-canvas-ink-soft)]">
        Every fake account that passes through your product costs you money
        in support, trust damage, and platform risk. HaloKYC is priced so
        that stopping one fake user pays for the whole month.
      </p>
        </Reveal>

<div className="mt-14 grid items-stretch gap-4 lg:grid-cols-4">
  {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={0.05 * i}>
              <article
                className={cn(
                  "relative flex h-full flex-col",
                  "border bg-[var(--landing-canvas-edge)] p-6",
                  "transition-shadow",
                  plan.highlight
                    ? "border-[var(--landing-cyan)] shadow-[0_20px_60px_-30px_color-mix(in_oklch,var(--landing-cyan)_70%,transparent)]"
                    : "border-[var(--landing-hair)] hover:border-[var(--landing-canvas-soft)]",
                )}
              >
                {plan.highlight ? (
                  <span
                    className={cn(
                      "absolute -top-3 right-6 inline-flex items-center rounded-sm px-2 py-0.5",
                      "border border-[var(--landing-cyan)] bg-[var(--landing-canvas)] text-[var(--landing-cyan)]",
                      "font-mono text-[10px] uppercase tracking-[0.22em]",
                    )}
                  >
                    {plan.note ?? "Early access"}
                  </span>
                ) : null}

                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--landing-canvas-mute)]">
                    Plan {plan.number}
                  </p>
                  {plan.highlight ? (
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--landing-cyan)]">
                      Featured
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 font-serif text-3xl font-normal tracking-tight text-[var(--landing-canvas-ink)]">
                  {plan.name}
                </p>
<p className="mt-2 text-sm text-[var(--landing-canvas-ink-soft)]">
  {plan.blurb}
</p>
<div className="mt-4 flex items-baseline gap-2">
  <span className="font-serif text-3xl font-normal tracking-tight text-[var(--landing-canvas-ink)]">
    {plan.price}
  </span>
  {plan.effectiveRate ? (
    <span className="text-xs text-[var(--landing-canvas-mute)]">
      {plan.effectiveRate}
    </span>
  ) : null}
</div>

                <div className="mt-6 border-t border-[var(--landing-hair)] pt-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--landing-canvas-mute)]">
                    Included
                  </p>
                  <ul className="mt-3 space-y-2">
                    {plan.bullets.map((b) => (
                      <li
                        key={b}
                        className="grid grid-cols-[18px_1fr] items-start gap-2.5 text-[13.5px] text-[var(--landing-canvas-ink-soft)]"
                      >
                        <span
                          aria-hidden
                          className="mt-2 inline-block h-px w-3 bg-[var(--landing-cyan)]"
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-6">
                  <Link
                    href={plan.href}
                    className={cn(
                      "inline-flex h-11 w-full items-center justify-center rounded-md px-4 text-sm font-medium",
                      "transition-all",
                      "focus-visible:ring-2 focus-visible:ring-[var(--landing-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-canvas)] focus-visible:outline-none",
                      plan.highlight
                        ? "bg-[var(--landing-cyan)] text-[var(--landing-canvas)] hover:bg-[color-mix(in_oklch,var(--landing-cyan)_88%,white)]"
                        : "border border-[var(--landing-hair)] bg-transparent text-[var(--landing-canvas-ink)] hover:bg-[var(--landing-canvas-soft)]",
                    )}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
<p className="mt-10 max-w-2xl border-t border-[var(--landing-hair)] pt-5 text-xs text-[var(--landing-canvas-mute)]">
  No per-check charges. No hidden overage tiers. No annual
  commitments. Buy more, pay less per verification.
</p>
        </Reveal>
      </div>
    </section>
  );
}
