import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowRight, Check, ExternalLink, MoveRight, ShieldCheck } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { MarketingPageShell } from "@/components/landing/marketing-page";
import { PricingComparison } from "@/components/landing/pricing-comparison";
import { PricingSection } from "@/components/landing/pricing-section";
import { SectionMarker } from "@/components/landing/section-marker";
import { publicEnv } from "@/lib/env";
import { faqPageSchema } from "@/lib/structured-data";
import { cn } from "@/lib/utils";

const REASONS = [
  {
    label: "A permanent Sandbox",
    title: "Keep testing after the trial window closes.",
    body: "HaloKYC includes 1,000 Sandbox credits every month. Sumsub publishes a 14-day trial with 50 free checks before its monthly commitment begins.",
  },
  {
    label: "Lower paid entry",
    title: "Start production without a $149 monthly floor.",
    body: "HaloKYC paid plans start at $49 per month, with one completed verification consuming one credit. Sumsub Basic lists a $149 minimum monthly commitment.",
  },
  {
    label: "Focused operations",
    title: "Solve repeat-user abuse without adopting a full compliance suite.",
    body: "Duplicate matching, subject bans, manual review, decisions, and audit history live in one focused HaloKYC workflow for early product teams.",
  },
  {
    label: "One integration",
    title: "Use the same API from every product surface.",
    body: "Your backend creates a session through HaloKYC's REST API. Web, Android, and iOS apps open the hosted flow and receive results through the API or signed webhooks.",
  },
] as const;

const COMPARISON_ROWS = [
  {
    feature: "Best fit",
    halo: "Early consumer apps and product teams dealing with repeat-user abuse",
    sumsub: "Regulated teams needing a broad global verification and compliance platform",
  },
  {
    feature: "Free entry",
    halo: "1,000 Sandbox credits every month",
    sumsub: "50 free checks during a 14-day trial",
  },
  {
    feature: "Published paid entry",
    halo: "$49/month for 1,500 credits; effective $0.033 per credit",
    sumsub: "$1.35 per Basic verification with a $149 monthly minimum",
  },
  {
    feature: "Billing unit",
    halo: "One completed verification uses one credit, independent of configured checks",
    sumsub: "Successful user verification using the features included in the selected plan",
  },
  {
    feature: "Identity workflow",
    halo: "OCR, liveness, face match, age, duplicate detection, and decision rules",
    sumsub: "ID verification, liveness, face match, email/phone, and reusable KYC on Basic",
  },
  {
    feature: "Compliance breadth",
    halo: "Focused person verification, review, subject controls, and audit history",
    sumsub: "AML, ongoing monitoring, proof of address, KYB, transactions, and fraud products",
  },
  {
    feature: "App integration",
    halo: "REST API plus hosted flow for web, Android, iOS, or any connected client",
    sumsub: "API, verification links, WebSDK, and MobileSDK",
  },
  {
    feature: "Result delivery",
    halo: "API polling and HMAC-signed webhooks",
    sumsub: "Dashboard, API results, and webhooks",
  },
] as const;

const FAQS = [
  {
    question: "Is HaloKYC a drop-in replacement for Sumsub?",
    answer:
      "No. Sumsub centers its integration on applicants, verification levels, SDK access tokens, and review statuses. HaloKYC uses workflows, verification sessions, review items, subjects, and signed webhooks. The journey maps cleanly, but the API integration must change.",
  },
  {
    question: "When should I stay with Sumsub?",
    answer:
      "Stay if you depend on Sumsub's global compliance coverage, non-document verification, KYB, transaction monitoring, Travel Rule support, reusable KYC, or its native SDKs. HaloKYC is the narrower choice for person verification and repeat-user controls.",
  },
  {
    question: "Is HaloKYC cheaper than Sumsub?",
    answer:
      "HaloKYC paid plans publish effective rates from $0.020 to $0.033 per completed verification and start at $49 per month. Sumsub publishes Basic at $1.35 per successful verification with a $149 monthly minimum. The included checks differ, so compare the exact workflow rather than multiplying headline prices.",
  },
  {
    question: "Can I test HaloKYC before switching?",
    answer:
      "Yes. Rebuild one representative verification level as a HaloKYC workflow and run both systems side by side. Compare completion, false rejects, review volume, duplicate outcomes, webhook handling, and total cost before moving production traffic.",
  },
  {
    question: "Can HaloKYC run in an Android or iOS app?",
    answer:
      "Yes. Your backend creates a verification session through the REST API, and your Android, iOS, or web app opens the hosted flow. The final result is available through the API and signed webhooks, so the KYC integration is platform independent.",
  },
  {
    question: "What does one HaloKYC credit include?",
    answer:
      "One credit pays for one completed verification. It remains one credit whether your workflow runs one check or combines OCR, liveness, face match, age, and duplicate detection.",
  },
] as const;

const FAQ_SCHEMA = faqPageSchema([...FAQS]);

export const metadata: Metadata = {
  title: "Sumsub alternative for startup KYC",
  description:
    "Compare HaloKYC and Sumsub across pricing, free usage, KYC workflows, duplicate controls, compliance breadth, and web and mobile integration.",
  metadataBase: new URL(publicEnv.siteUrl),
  alternates: { canonical: "/switch/sumsub-alternative" },
  openGraph: {
    title: "A focused Sumsub alternative for startup KYC | HaloKYC",
    description:
      "An honest comparison of HaloKYC and Sumsub for product teams choosing identity verification infrastructure.",
    type: "website",
    url: "/switch/sumsub-alternative",
    siteName: "HaloKYC",
  },
};

function CtaLink({ href, children, secondary = false }: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-medium transition-colors",
        "focus-visible:ring-2 focus-visible:ring-(--landing-cyan) focus-visible:ring-offset-2 focus-visible:ring-offset-(--landing-canvas) focus-visible:outline-none",
        secondary
          ? "border border-(--landing-hair) text-(--landing-canvas-ink) hover:bg-(--landing-canvas-edge)"
          : "bg-(--landing-cyan) text-(--landing-canvas) hover:bg-[color-mix(in_oklch,var(--landing-cyan)_88%,white)]",
      )}
    >
      {children}
      <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export default function SumsubAlternativePage() {
  return (
    <MarketingPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA).replace(/</g, "\\u003c") }}
      />

      <section className="relative isolate overflow-hidden border-b border-(--landing-hair)">
        <div aria-hidden className="landing-grid-soft absolute inset-0 opacity-10" />
        <div aria-hidden className="absolute top-20 left-1/2 -z-10 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-(--landing-cyan-soft) blur-3xl" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-20 text-center sm:px-8 sm:py-28 lg:px-10 lg:py-32">
          <p className="font-mono text-[11px] tracking-[0.22em] text-(--landing-cyan) uppercase">
            Switch from Sumsub
          </p>
          <h1 className="font-display mt-7 max-w-5xl text-5xl leading-[0.98] font-medium tracking-[-0.045em] text-(--landing-canvas-ink) sm:text-6xl lg:text-7xl">
            Sumsub is comprehensive. Your first KYC stack can be simpler.
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-7 text-(--landing-canvas-ink-soft) sm:text-lg">
            HaloKYC gives early product teams identity checks, repeat-user controls,
            review, and signed results without the entry cost of a broad compliance
            platform. One REST integration works across web, Android, and iOS.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <CtaLink href="/login">Build a free workflow</CtaLink>
            <CtaLink href="#comparison" secondary>Compare the products</CtaLink>
          </div>

          <div className="mt-16 grid w-full max-w-5xl overflow-hidden rounded-xl border border-(--landing-hair) bg-(--landing-canvas-edge) text-left sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
            <div className="flex flex-col justify-between gap-8 p-6 sm:p-8">
              <BrandLogo variant="wordmark-light" className="h-9 w-36" />
              <div>
                <p className="font-display text-4xl font-medium tracking-[-0.04em] text-(--landing-cyan)">$49</p>
                <p className="mt-2 text-sm leading-6 text-(--landing-canvas-ink-soft)">monthly paid entry after a permanent Sandbox</p>
              </div>
            </div>
            <div className="flex items-center justify-center border-y border-(--landing-hair) px-6 py-3 font-mono text-[10px] tracking-[0.18em] text-(--landing-canvas-mute) uppercase sm:border-x sm:border-y-0">
              compared with
            </div>
            <div className="flex flex-col justify-between gap-8 p-6 sm:p-8">
              <Image src="/assets/logo/sumsub.svg" alt="Sumsub" width={141} height={32} className="h-9 w-auto max-w-36 object-contain brightness-0 invert" />
              <div>
                <p className="font-display text-4xl font-medium tracking-[-0.04em]">$149</p>
                <p className="mt-2 text-sm leading-6 text-(--landing-canvas-ink-soft)">minimum monthly commitment on Basic</p>
              </div>
            </div>
          </div>
          <p className="mt-5 max-w-3xl text-xs leading-5 text-(--landing-canvas-mute)">
            Product bundles are not identical. HaloKYC is not affiliated with Sumsub;
            confirm current requirements and pricing with each vendor.
          </p>
        </div>
      </section>

      <section className="bg-(--landing-paper) text-(--landing-ink)">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.72fr_1.28fr] lg:px-10">
          <div>
            <SectionMarker eyebrow="Why teams consider switching" tone="paper" />
            <h2 className="font-display mt-5 max-w-xl text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">
              Start with KYC. Add complexity when you need it.
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-7 text-(--landing-ink-soft)">
              Sumsub serves mature compliance programs. HaloKYC is the focused option
              for teams that need to verify people, stop repeat users, and keep costs
              legible while the product is still growing.
            </p>
          </div>
          <div className="border-t border-(--landing-paper-edge)">
            {REASONS.map((reason, index) => (
              <article key={reason.label} className="grid gap-4 border-b border-(--landing-paper-edge) py-7 sm:grid-cols-[3rem_1fr]">
                <span className="font-mono text-[11px] text-(--landing-stamp)">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.18em] text-(--landing-stamp) uppercase">{reason.label}</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight">{reason.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-(--landing-ink-soft)">{reason.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="comparison" aria-labelledby="sumsub-comparison-heading" className="border-t border-(--landing-hair) bg-(--landing-canvas-deep)">
        <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <SectionMarker eyebrow="Side by side" />
            <h2 id="sumsub-comparison-heading" className="font-display mt-5 text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">
              HaloKYC vs Sumsub, scope before scorecards.
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-(--landing-canvas-ink-soft)">
              Both products verify people. Sumsub extends into a wider compliance suite;
              HaloKYC keeps the operating and billing model focused on person verification.
            </p>
          </div>
          <div className="mt-12 overflow-x-auto rounded-xl border border-(--landing-hair)">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="bg-(--landing-canvas-edge)">
                  <th className="w-[22%] p-5 font-mono text-[10px] font-medium tracking-[0.2em] text-(--landing-canvas-mute) uppercase">Decision point</th>
                  <th className="w-[39%] border-l border-(--landing-hair) bg-(--landing-cyan-soft) p-5 text-sm font-semibold text-(--landing-cyan)">HaloKYC</th>
                  <th className="w-[39%] border-l border-(--landing-hair) p-5 text-sm font-semibold">Sumsub</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="border-t border-(--landing-hair)">
                    <th className="bg-(--landing-canvas) p-5 text-sm font-medium text-(--landing-canvas-ink)">{row.feature}</th>
                    <td className="border-l border-(--landing-hair) bg-[color-mix(in_oklch,var(--landing-cyan-soft)_42%,var(--landing-canvas))] p-5 align-top text-sm leading-6 text-(--landing-canvas-ink-soft)">{row.halo}</td>
                    <td className="border-l border-(--landing-hair) bg-(--landing-canvas) p-5 align-top text-sm leading-6 text-(--landing-canvas-ink-soft)">{row.sumsub}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-col gap-3 text-xs leading-5 text-(--landing-canvas-mute) sm:flex-row sm:items-center sm:justify-between">
            <p>Last reviewed against public Sumsub documentation: August 2026.</p>
            <Link href="https://sumsub.com/pricing/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 underline decoration-(--landing-hair) underline-offset-4 hover:text-(--landing-canvas-ink)">
              Read Sumsub&apos;s public pricing <ExternalLink aria-hidden className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-(--landing-paper-soft) text-(--landing-ink)">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
          <div>
            <SectionMarker eyebrow="A safer migration" tone="paper" />
            <h2 className="font-display mt-5 text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">Move one verification level first.</h2>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-(--landing-ink-soft)">
              Keep Sumsub live while HaloKYC handles a representative test cohort.
              Move production only after the outcomes meet your acceptance bar.
            </p>
          </div>
          <ol className="grid gap-px overflow-hidden rounded-xl border border-(--landing-paper-edge) bg-(--landing-paper-edge)">
            {[
              ["Map one level", "Recreate its document, liveness, age, duplicate, and review rules as a HaloKYC workflow."],
              ["Run both systems", "Compare completion, false rejects, review volume, duplicate outcomes, webhooks, and cost."],
              ["Cut over gradually", "Move one production path, watch the audit trail, and keep a rollback window."],
            ].map(([title, body], index) => (
              <li key={title} className="grid gap-5 bg-(--landing-paper) p-6 sm:grid-cols-[3rem_1fr] sm:p-8">
                <span className="flex size-10 items-center justify-center rounded-full border border-(--landing-paper-edge) font-mono text-xs text-(--landing-stamp)">{index + 1}</span>
                <div><h3 className="text-lg font-semibold tracking-tight">{title}</h3><p className="mt-2 text-sm leading-6 text-(--landing-ink-soft)">{body}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-(--landing-hair) bg-(--landing-canvas)">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-14 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-10">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-(--landing-hair) bg-(--landing-canvas-edge) text-(--landing-cyan)"><ShieldCheck aria-hidden className="size-5" strokeWidth={1.5} /></span>
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-(--landing-cyan) uppercase">The honest recommendation</p>
              <p className="mt-2 max-w-3xl text-lg leading-7">
                Choose HaloKYC for focused person verification, predictable credits,
                and repeat-user operations. Choose Sumsub when its compliance breadth,
                global program support, KYB, transactions, or native SDKs are essential.
              </p>
            </div>
          </div>
          <Link href="/product" className="group inline-flex items-center gap-2 text-sm font-medium text-(--landing-cyan) underline decoration-(--landing-hair) underline-offset-4">
            See the HaloKYC product <MoveRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <PricingSection index={4} />
      <PricingComparison />

      <section aria-labelledby="sumsub-faq-heading" className="border-t border-(--landing-hair) bg-(--landing-canvas-deep)">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.75fr_1.25fr] lg:px-10">
          <div>
            <SectionMarker eyebrow="FAQ" />
            <h2 id="sumsub-faq-heading" className="font-display mt-5 text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">Before you change vendors.</h2>
            <p className="mt-5 max-w-lg text-[15px] leading-7 text-(--landing-canvas-ink-soft)">Map the compliance products you use today before replacing the identity flow.</p>
          </div>
          <div className="border-t border-(--landing-hair)">
            {FAQS.map((item) => (
              <details key={item.question} className="group border-b border-(--landing-hair)">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-[15px] font-medium marker:hidden focus-visible:ring-2 focus-visible:ring-(--landing-cyan) focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                  {item.question}<span aria-hidden className="text-xl font-light text-(--landing-canvas-mute) transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-2xl pb-5 pr-10 text-sm leading-6 text-(--landing-canvas-ink-soft)">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-(--landing-hair) bg-(--landing-canvas)">
        <div aria-hidden className="landing-grid-soft absolute inset-0 opacity-10" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-24 text-center sm:px-8 sm:py-32 lg:px-10">
          <p className="font-mono text-[10px] tracking-[0.22em] text-(--landing-cyan) uppercase">Test the focused stack</p>
          <h2 className="font-display mt-5 max-w-4xl text-4xl leading-tight font-medium tracking-[-0.04em] sm:text-6xl">Rebuild one Sumsub level in HaloKYC.</h2>
          <p className="mt-6 max-w-2xl text-[15px] leading-7 text-(--landing-canvas-ink-soft)">Run the same cases through both products. Keep the system that gives your developers, reviewers, and budget the better result.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <CtaLink href="/login">Create a free workspace</CtaLink>
            <CtaLink href="https://docs.halokyc.com/" secondary>Read the API docs</CtaLink>
          </div>
          <div className="mt-12 grid w-full max-w-3xl gap-4 border-t border-(--landing-hair) pt-6 text-left sm:grid-cols-3">
            {["1,000 free credits / month", "No annual commitment", "Signed webhook results"].map((item) => (
              <p key={item} className="flex items-center gap-2 text-sm text-(--landing-canvas-ink-soft)"><Check aria-hidden className="size-4 shrink-0 text-(--landing-cyan)" />{item}</p>
            ))}
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
}
