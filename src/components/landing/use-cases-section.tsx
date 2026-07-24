/**
 * UseCasesSection - "Made for products where fake users are expensive."
 *
 * Warm-paper section with a 3-column 6-cell grid of use cases.
 * Each card uses a top-edge accent rule, a section number in
 * tiny mono caps on the top-right, and a single line of body
 * copy under a short title.
 */

import {
  Heart,
  Store,
  Banknote,
  Coins,
  Users,
  Shield,
} from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { SectionMarker } from "@/components/landing/section-marker";
import { cn } from "@/lib/utils";

type UseCase = {
  icon: typeof Heart;
  number: string;
  title: string;
  body: string;
  accent?: "stamp" | "signal" | "paper-edge";
};

const CASES: readonly UseCase[] = [
  {
    icon: Heart,
    number: "01",
    title: "Dating and social",
    body: "Block duplicate profiles, age-restricted users, and suspicious identity patterns before they reach your community.",
    accent: "stamp",
  },
  {
    icon: Store,
    number: "02",
    title: "Marketplaces",
    body: "Verify sellers, freelancers, delivery partners, and high-risk counterparties without slowing the funnel.",
    accent: "paper-edge",
  },
  {
    icon: Banknote,
    number: "03",
    title: "Fintech MVPs",
    body: "Add practical KYC before scaling into deeper compliance workflows. Start with the basics, swap in heavier vendors later.",
    accent: "stamp",
  },
  {
    icon: Coins,
    number: "04",
    title: "Web3 and crypto apps",
    body: "Reduce sybil abuse and duplicate accounts without standing up an identity stack of your own.",
    accent: "signal",
  },
  {
    icon: Users,
    number: "05",
    title: "Communities",
    body: "Keep private or age-gated communities safer with human verification and an audit trail of every check.",
    accent: "paper-edge",
  },
{
  icon: Shield,
  number: "06",
  title: "Free-tier protection",
  body: "Gate your AI product or service to genuine users. Stop malicious actors from stacking your infrastructure bill and draining your compute credits.",
  accent: "signal",
},
];

const ACCENT_LINE: Record<NonNullable<UseCase["accent"]>, string> = {
  stamp: "var(--landing-stamp)",
  signal: "var(--landing-signal)",
  "paper-edge": "var(--landing-cyan)",
};

export function UseCasesSection() {
  return (
    <section
      id="use-cases"
      aria-labelledby="use-cases-headline"
      className="relative bg-[var(--landing-paper)] text-[var(--landing-ink)]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-10">
        <Reveal className="grid max-w-4xl gap-5">
          <SectionMarker
            index={6}
            eyebrow="Where HaloKYC fits"
            meta="Five surfaces · one contract"
            tone="paper"
          />
          <h2
            id="use-cases-headline"
      className={cn(
        "font-display font-medium tracking-[-0.03em]",
        "text-4xl leading-tight",
        "sm:text-5xl",
      )}
          >
            Made for products where{" "}
            <span className="text-[var(--landing-stamp)]">fake users</span>{" "}
            are expensive.
          </h2>
          <p className="max-w-2xl text-[15.5px] leading-relaxed text-[color-mix(in_oklch,var(--landing-ink)_78%,var(--landing-paper))]">
            The integration does not change shape between industries. The
            checks you turn on and the threshold you set do.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CASES.map((c, i) => {
            const Icon = c.icon;
            const lineColor = ACCENT_LINE[c.accent ?? "paper-edge"];
            return (
              <Reveal key={c.title} delay={0.04 * i}>
                <article
                  className={cn(
                    "group relative flex h-full flex-col gap-3",
                    "border border-[var(--landing-paper-edge)] bg-[var(--landing-paper)] p-6",
                    "transition-shadow hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.18)]",
                  )}
                >
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-px"
                    style={{ background: lineColor }}
                  />
                  <div className="flex items-start justify-between">
                    <span
                      aria-hidden
className={cn(
  "flex size-10 items-center justify-center rounded-md",
  "border border-[var(--landing-paper-edge)] bg-[var(--landing-paper)] text-[var(--landing-ink-soft)]",
)}
                    >
                      <Icon className="size-4" strokeWidth={1.5} />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color-mix(in_oklch,var(--landing-ink)_55%,transparent)]">
                      Use case {c.number}
                    </span>
                  </div>
                  <p className="font-sans text-lg font-semibold tracking-tight text-[var(--landing-ink)]">
                    {c.title}
                  </p>
                  <p className="text-[14px] leading-relaxed text-[color-mix(in_oklch,var(--landing-ink)_72%,var(--landing-paper))]">
                    {c.body}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
