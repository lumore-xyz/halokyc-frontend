import type { Metadata } from "next";
import {
  CircleDollarSign,
  Layers3,
  RefreshCcw,
  WalletCards,
} from "lucide-react";
import { publicEnv } from "@/lib/env";

import {
  MarketingCta,
  MarketingHero,
  MarketingHighlights,
  MarketingPageShell,
} from "@/components/landing/marketing-page";
import { PricingFaq } from "@/components/landing/pricing-faq";

export const metadata: Metadata = {
  title: "Verification credits | HaloKYC",
  description:
    "Understand how HaloKYC credits work, including completed-verification pricing, rollover, top-ups, and credit reservations.",
  metadataBase: new URL(publicEnv.siteUrl),
  alternates: {
    canonical: "/credits",
  },
  openGraph: {
    title: "Verification credits | HaloKYC",
    description:
      "Understand how HaloKYC credits work, including completed-verification pricing, rollover, top-ups, and credit reservations.",
    type: "website",
    url: "/credits",
    siteName: "HaloKYC",
  },
};

export default function CreditsPage() {
  return (
    <MarketingPageShell>
      <MarketingHero
        eyebrow="Credits"
        title={
          <>
            One completed verification.{" "}
            <span className="text-(--landing-cyan)">One credit.</span>
          </>
        }
        description="Run the checks your policy needs without calculating a different bill for every service. Credits make verification costs visible before a session starts."
        primaryCta={{ href: "/pricing", label: "See plans" }}
        secondaryCta={{ href: "/login", label: "Open a workspace" }}
        facts={[
          { label: "Unit", value: "1 completed verification" },
          { label: "Free wallet", value: "1,000 credits" },
          { label: "Top-ups", value: "Do not expire" },
        ]}
        aside={{
          label: "Credit lifecycle",
          title: "Reserve. Complete. Settle.",
          lines: [
            "A credit is reserved when processing begins",
            "The same credit covers the enabled workflow checks",
            "Queued sessions wait safely if the wallet is empty",
            "Purchased credits remain available until used",
          ],
        }}
      />
      <MarketingHighlights
        eyebrow="Predictable by design"
        title={
          <>
            A wallet model you can{" "}
            <span className="text-(--landing-stamp)">reason about.</span>
          </>
        }
        description="Credits separate verification policy from billing complexity. You can strengthen a workflow without introducing a new per-check fee."
        items={[
          {
            icon: CircleDollarSign,
            label: "Simple unit",
            title: "One completion",
            description:
              "A completed verification consumes one credit, regardless of how many enabled checks it runs.",
          },
          {
            icon: Layers3,
            label: "Consumption",
            title: "Clear ordering",
            description:
              "Free credits are used first, followed by subscription credits and then purchased credits.",
          },
          {
            icon: RefreshCcw,
            label: "Continuity",
            title: "Safe queueing",
            description:
              "Sessions awaiting credits retain their place and resume in FIFO order when the wallet is funded.",
          },
          {
            icon: WalletCards,
            label: "Top-up",
            title: "Durable balance",
            description:
              "One-off credit packs do not expire and sit outside subscription rollover limits.",
          },
        ]}
      />
      <section className="bg-(--landing-canvas) text-(--landing-canvas-ink)">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.75fr_1.25fr] lg:px-10">
          <div>
            <p className="font-mono text-[10px] tracking-[0.22em] text-(--landing-cyan) uppercase">
              Credit questions
            </p>
            <h2 className="font-display mt-5 text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">
              The details, without the billing maze.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-7 text-(--landing-canvas-ink-soft)">
              Rollover, reservations, plan changes, and top-ups are defined
              before you ship, so usage does not turn into a surprise invoice.
            </p>
          </div>
          <PricingFaq />
        </div>
      </section>
      <MarketingCta
        eyebrow="Start with free credits"
        title="Prove the workflow before you pay for scale."
        description="Create a workspace, run live verification sessions, and see the complete credit ledger from the dashboard."
      />
    </MarketingPageShell>
  );
}
