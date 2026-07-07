import Link from "next/link";

import { ArrowDownToLine, ArrowRight, Coins, CreditCard } from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { SectionMarker } from "@/components/landing/section-marker";
import { PricingFaq } from "@/components/landing/pricing-faq";
import { PricingSection } from "@/components/landing/pricing-section";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function BucketCard({
  icon: Icon,
  label,
  detail,
  accent,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  detail: string;
  accent: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--landing-hair)] bg-[var(--landing-paper)] p-5">
      <span
        className="inline-flex size-10 items-center justify-center rounded-lg border border-[var(--landing-hair)] bg-[var(--landing-paper-soft)]"
        style={{ color: accent }}
      >
        <Icon className="size-4" strokeWidth={1.5} />
      </span>
      <div>
        <p className="text-sm font-semibold tracking-tight text-[var(--landing-ink)]">{label}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-[var(--landing-ink-soft)]">{detail}</p>
      </div>
    </div>
  );
}

function PackCard({
  name,
  price,
  credits,
  effective,
  featured,
}: {
  name: string;
  price: string;
  credits: string;
  effective: string;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border p-5",
        featured
          ? "border-[var(--landing-cyan)] bg-[var(--landing-paper-soft)] shadow-[0_20px_60px_-30px_color-mix(in_oklch,var(--landing-cyan)_70%,transparent)]"
          : "border-[var(--landing-hair)] bg-[var(--landing-paper)]"
      )}
    >
      {featured && (
        <span className="absolute -top-2.5 right-4 rounded-sm border border-[var(--landing-cyan)] bg-[var(--landing-paper-soft)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--landing-cyan)]">
          Best value
        </span>
      )}
      <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--landing-ink-soft)]">{name}</p>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-serif text-3xl font-normal tracking-tight text-[var(--landing-ink)]">{price}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-mono text-lg text-[var(--landing-ink)]">{credits}</span>
        <span className="text-xs text-[var(--landing-ink-soft)]">credits</span>
      </div>
      <p className="mt-1 text-[11px] font-mono text-[var(--landing-ink-soft)]">{effective}/credit</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  return (
    <div>
      {/* ---------- HERO (dark canvas) ---------- */}
      <section
        aria-labelledby="pricing-hero-headline"
        className="relative bg-(--landing-canvas) text-(--landing-canvas-ink)"
      >
        <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 sm:py-24 lg:px-10">
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 40%, color-mix(in oklch, var(--landing-cyan) 10%, transparent), transparent)",
            }}
          />
          <Reveal className="max-w-2xl">
            <SectionMarker eyebrow="Pricing" meta="Usage-based" />
            <h1
              id="pricing-hero-headline"
              className={cn(
                "mt-4 font-display font-medium tracking-[-0.03em]",
                "text-4xl leading-[1.1]",
                "sm:text-5xl lg:text-6xl"
              )}
            >
              Credits that work{" "}
              <span className="italic text-(--landing-cyan)">the way your product does.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-[var(--landing-canvas-ink-soft)]">
              One credit equals one completed verification. Start free, scale on demand, and own every
              ledger entry. No per-check charges, no annual lock-in, no surprises.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-[13px]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--landing-cyan)] bg-[var(--landing-canvas)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--landing-cyan)]">
                $0.05 / credit
              </span>
              <span className="text-[var(--landing-canvas-ink-soft)]">
                Effective range: $0.02 – $0.05 per verification at volume
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- HOW CREDITS WORK (before plans — no section number) ---------- */}
      <section aria-labelledby="credits-how-headline" className="border-t border-[var(--landing-hair)] bg-(--landing-paper)">
        <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 sm:py-24 lg:px-10">
          <Reveal className="max-w-2xl">
            <SectionMarker eyebrow="How credits work" tone="paper" />
            <h2
              id="credits-how-headline"
              className="mt-4 font-display text-3xl font-medium tracking-[-0.03em] sm:text-4xl"
            >
              Three buckets, one wallet.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--landing-ink-soft)]">
              Every organization has a single credit wallet with three separate buckets. The ledger
              tracks every movement. Your dashboard shows one combined balance — but underneath,
              credits are accounted for independently.
            </p>
          </Reveal>

          {/* Bucket cards + flow */}
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <Reveal delay={0}>
              <BucketCard
                icon={Coins}
                label="Free"
                detail="Sandbox accounts only: 1,000 credits per month, topped up automatically. Does not roll over. Paid plans do not receive free credits."
                accent="var(--landing-cyan)"
              />
            </Reveal>
            <Reveal delay={0.06}>
              <BucketCard
                icon={CreditCard}
                label="Subscription"
                detail="Earned through your monthly plan. Rolls over up to 10x the monthly grant. Consumed after free credits."
                accent="var(--landing-ink)"
              />
            </Reveal>
            <Reveal delay={0.12}>
              <BucketCard
                icon={ArrowDownToLine}
                label="Purchased"
                detail="One-off credit packs bought through the dashboard. No expiration, no cap. Consumed last — the true top-up."
                accent="var(--landing-stamp)"
              />
            </Reveal>
          </div>

          {/* Flow arrow */}
          <Reveal delay={0.18} className="mt-6 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--landing-hair)] bg-[var(--landing-paper-soft)] px-4 py-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--landing-ink-soft)]">
              <span>Free</span>
              <ArrowRight className="size-3" strokeWidth={1.5} />
              <span>Subscription</span>
              <ArrowRight className="size-3" strokeWidth={1.5} />
              <span>Purchased</span>
            </div>
          </Reveal>

          {/* Reservation order callout */}
          <Reveal delay={0.2} className="mt-8">
            <div className="rounded-xl border border-[var(--landing-hair)] bg-[var(--landing-paper-soft)] p-6">
              <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
                <div>
                  <p className="text-[13px] font-medium uppercase tracking-[0.18em] text-[var(--landing-cyan)]">
                    Reservation order
                  </p>
                  <p className="mt-3 text-[14px] leading-relaxed text-[var(--landing-ink-soft)]">
                    When a verification starts, the system reserves credits in this order:
                  </p>
                  <p className="mt-2 text-lg font-medium tracking-tight text-[var(--landing-ink)]">
                    free → subscription → purchased
                  </p>
                  <p className="mt-3 text-[14px] leading-relaxed text-[var(--landing-ink-soft)]">
                    If the total is insufficient, the session enters an awaiting_credits queue and drains
                    automatically when credits are added. Your users never see a credit error.
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--landing-hair)] bg-[var(--landing-paper)] p-5">
                  <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--landing-ink-soft)]">
                    Example: Launch plan
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-serif font-normal text-[var(--landing-ink)]">1,000</p>
                      <p className="mt-1 text-[11px] text-[var(--landing-ink-soft)]">free/mo</p>
                    </div>
                    <div>
                      <p className="text-2xl font-serif font-normal text-[var(--landing-ink)]">1,500</p>
                      <p className="mt-1 text-[11px] text-[var(--landing-ink-soft)]">subscription</p>
                    </div>
                    <div>
                      <p className="text-2xl font-serif font-normal text-[var(--landing-ink)]">15,000</p>
                      <p className="mt-1 text-[11px] text-[var(--landing-ink-soft)]">rollover cap</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- PLANS (SEC. 01 — first numbered section after credits context) ---------- */}
      <PricingSection index={1} />

      {/* ---------- BUY MORE CREDITS ---------- */}
      <section aria-labelledby="packs-headline" className="border-t border-[var(--landing-hair)] bg-(--landing-paper-soft)">
        <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 sm:py-24 lg:px-10">
          <Reveal className="max-w-2xl">
            <SectionMarker eyebrow="Buy credits" tone="paper" />
            <h2
              id="packs-headline"
              className="mt-4 font-display text-3xl font-medium tracking-[-0.03em] sm:text-4xl"
            >
              Top up without touching your subscription.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--landing-ink-soft)]">
              Purchased credits are a one-off pack that lands directly in your wallet. No monthly
              commitment, no renewal, no cap. Buy once, hold indefinitely, consume when you need them
              — after free and subscription credits are exhausted.
            </p>
          </Reveal>

          {/* Minimum purchase banner */}
          <Reveal delay={0.06} className="mt-10">
            <div className="flex flex-col gap-4 rounded-xl border border-[var(--landing-hair)] bg-[var(--landing-paper)] p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--landing-ink-soft)]">
                  Minimum purchase
                </p>
                <p className="mt-2 text-3xl font-serif font-normal tracking-tight text-[var(--landing-ink)]">
                  $25
                </p>
                <p className="mt-1.5 text-[13px] text-[var(--landing-ink-soft)]">
                  Payment processing carries a fixed fee component, so anything below $25 is
                  uneconomical. The smallest pack delivers 500 credits at $0.050 each.
                </p>
              </div>
              <div className="rounded-lg border border-[var(--landing-hair)] bg-[var(--landing-paper-soft)] px-4 py-3">
                <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--landing-ink-soft)]">
                  Do purchased credits expire?
                </p>
                <p className="mt-1.5 text-[13px] text-[var(--landing-ink)]">No. Once bought, they persist until consumed.</p>
              </div>
            </div>
          </Reveal>

          {/* Pack grid */}
          <Reveal delay={0.08} className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <PackCard name="Starter" price="$25" credits="500" effective="$0.050" />
              <PackCard name="Build" price="$49" credits="1,250" effective="$0.039" />
              <PackCard name="Growth" price="$99" credits="3,000" effective="$0.033" />
              <PackCard name="Scale" price="$249" credits="10,000" effective="$0.025" featured />
              <PackCard name="Volume" price="$499" credits="25,000" effective="$0.020" />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="mt-8">
            <Link
              href="mailto:hello@halokyc.com"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--landing-hair)] bg-[var(--landing-paper)] px-5 text-sm font-medium text-[var(--landing-ink)] transition-all hover:bg-[var(--landing-paper-soft)] focus-visible:ring-2 focus-visible:ring-[var(--landing-cyan)] focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Request a pack
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section
        aria-labelledby="faq-headline"
        className="border-t border-[var(--landing-hair)] bg-(--landing-canvas) text-(--landing-canvas-ink)"
      >
        <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-5">
            <Reveal className="lg:col-span-2">
              <SectionMarker eyebrow="FAQ" />
              <h2
                id="faq-headline"
                className="mt-4 font-display text-3xl font-medium tracking-[-0.03em] sm:text-4xl"
              >
                Common credit questions.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--landing-canvas-ink-soft)]">
                If your question isn&apos;t here, reach out directly. Billing queries go to{" "}
                <Link
                  href="mailto:billing@halokyc.com"
                  className="underline decoration-[var(--landing-cyan)] underline-offset-4 hover:text-[var(--landing-cyan)]"
                >
                  billing@halokyc.com
                </Link>
                .
              </p>
            </Reveal>

            <Reveal delay={0.08} className="lg:col-span-3">
              <PricingFaq />
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
