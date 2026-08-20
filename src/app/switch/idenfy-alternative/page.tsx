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
    label: "Lower public entry",
    title: "Start without a monthly minimum.",
    body: "HaloKYC includes 1,000 Sandbox credits each month and publishes paid rates from $0.020 to $0.033 per completed verification. iDenfy currently lists $1.35 per verification with a $135 monthly minimum on its pay-as-you-go plan.",
  },
  {
    label: "Repeat-user controls",
    title: "Treat duplicate identity as an operating workflow.",
    body: "HaloKYC combines duplicate matching, reusable subjects, subject bans, manual review, decisions, webhooks, and audit history for teams managing repeat-account abuse.",
  },
  {
    label: "Platform-independent delivery",
    title: "Use one backend integration across every app.",
    body: "Your backend creates a HaloKYC session through the REST API. Web, Android, and iOS apps open the hosted flow, then receive results through the API or signed webhooks.",
  },
] as const;

const COMPARISON_ROWS = [
  { feature: "Best fit", halo: "Early consumer apps and product teams dealing with repeat-user abuse", idenfy: "Compliance teams needing broad KYC, KYB, AML, fraud tooling, and human review" },
  { feature: "Public entry", halo: "$0 Sandbox; 1,000 credits every month", idenfy: "$1.35 per verification; $135 monthly minimum" },
  { feature: "Trial", halo: "Ongoing Sandbox grant", idenfy: "14 days with 10 identity verification checks" },
  { feature: "Billing unit", halo: "One completed verification uses one credit, independent of configured checks", idenfy: "Base verification plus separately priced extras; approved-only billing is an add-on" },
  { feature: "Identity workflow", halo: "OCR, liveness, face match, age, duplicate detection, and decision rules", idenfy: "Document, face match, liveness, manual review, and configurable fraud checks" },
  { feature: "Document reach", halo: "Confirm current supported documents and markets before rollout", idenfy: "Advertises 3,000+ document types in 200+ countries and territories" },
  { feature: "App integration", halo: "REST API plus hosted flow for web, Android, iOS, or any connected client", idenfy: "API, mobile SDKs, web, iFrame, plugins, and no-code options" },
  { feature: "Compliance breadth", halo: "Focused person verification, review, subject controls, and audit history", idenfy: "Identity verification, KYB, AML screening and monitoring, bank verification, and fraud prevention" },
] as const;

const FAQS = [
  {
    question: "Is HaloKYC a drop-in replacement for iDenfy?",
    answer: "No. The products use different session, workflow, status, callback, and review models. Rebuild one representative flow and map the results your application consumes before moving production traffic.",
  },
  {
    question: "When should I stay with iDenfy?",
    answer: "Stay if you depend on iDenfy's advertised global document coverage, native SDKs, 24/7 human review, KYB, AML monitoring, bank verification, eIDAS trust services, or its pay-per-approved option. HaloKYC is the narrower choice for focused person verification and repeat-user controls.",
  },
  {
    question: "Is HaloKYC cheaper than iDenfy?",
    answer: "At the published entry point, HaloKYC lists effective paid rates from $0.020 to $0.033 per completed verification, while iDenfy lists $1.35 with a $135 monthly minimum. The units and included checks differ, so compare your complete workflow, add-ons, approval rate, and enterprise quote rather than headline prices alone.",
  },
  {
    question: "How does iDenfy's pay-per-approved pricing compare?",
    answer: "It is a meaningful advantage when many attempts fail or are abandoned. iDenfy's current pay-as-you-go page lists approved-only charging as a $0.50 per-verification add-on. Model that option against HaloKYC's completed-verification credits using your actual approval rate.",
  },
  {
    question: "Can HaloKYC run in Android and iOS apps?",
    answer: "Yes. Your backend creates the session through the REST API, while your Android, iOS, or web app opens the hosted flow. Results return through the API and signed webhooks, so the integration is independent of the client platform.",
  },
  {
    question: "Does HaloKYC offer native mobile SDKs?",
    answer: "HaloKYC currently uses a platform-independent REST API and hosted verification flow instead of separate native capture SDKs. Choose iDenfy if embedding a vendor-maintained native SDK is a firm requirement.",
  },
] as const;

const FAQ_SCHEMA = faqPageSchema([...FAQS]);

export const metadata: Metadata = {
  title: "iDenfy alternative for startup KYC",
  description: "Compare HaloKYC and iDenfy across public pricing, free usage, identity workflows, repeat-user controls, compliance breadth, and app integration.",
  metadataBase: new URL(publicEnv.siteUrl),
  alternates: { canonical: "/switch/idenfy-alternative" },
  openGraph: {
    title: "A focused iDenfy alternative for startup KYC | HaloKYC",
    description: "An honest comparison of HaloKYC and iDenfy for teams choosing identity verification infrastructure.",
    type: "website",
    url: "/switch/idenfy-alternative",
    siteName: "HaloKYC",
  },
};

function CtaLink({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <Link href={href} className={cn(
    "group inline-flex h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-medium transition-colors",
    "focus-visible:ring-2 focus-visible:ring-(--landing-cyan) focus-visible:ring-offset-2 focus-visible:ring-offset-(--landing-canvas) focus-visible:outline-none",
    secondary ? "border border-(--landing-hair) text-(--landing-canvas-ink) hover:bg-(--landing-canvas-edge)" : "bg-(--landing-cyan) text-(--landing-canvas) hover:bg-[color-mix(in_oklch,var(--landing-cyan)_88%,white)]",
  )}>{children}<ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" /></Link>;
}

export default function IdenfyAlternativePage() {
  return (
    <MarketingPageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA).replace(/</g, "\\u003c") }} />

      <section className="relative isolate overflow-hidden border-b border-(--landing-hair)">
        <div aria-hidden className="landing-grid-soft absolute inset-0 opacity-10" />
        <div aria-hidden className="absolute top-20 left-1/2 -z-10 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-(--landing-cyan-soft) blur-3xl" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-20 text-center sm:px-8 sm:py-28 lg:px-10 lg:py-32">
          <p className="font-mono text-[11px] tracking-[0.22em] text-(--landing-cyan) uppercase">Switch from iDenfy</p>
          <h1 className="font-display mt-7 max-w-5xl text-5xl leading-[0.98] font-medium tracking-[-0.045em] text-(--landing-canvas-ink) sm:text-6xl lg:text-7xl">
            An iDenfy alternative for focused KYC and repeat-user abuse.
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-7 text-(--landing-canvas-ink-soft) sm:text-lg">
            Choose HaloKYC when you need a low-cost identity layer, persistent
            duplicate controls, and one platform-independent integration. Choose
            iDenfy when its broader compliance suite and human review matter more.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3"><CtaLink href="/login">Build a free workflow</CtaLink><CtaLink href="#comparison" secondary>Compare the products</CtaLink></div>

          <div className="mt-16 grid w-full max-w-5xl overflow-hidden rounded-xl border border-(--landing-hair) bg-(--landing-canvas-edge) text-left sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
            <div className="flex flex-col justify-between gap-8 p-6 sm:p-8"><BrandLogo variant="wordmark-light" className="h-9 w-36" /><div><p className="font-display text-4xl font-medium tracking-[-0.04em] text-(--landing-cyan)">$0 minimum</p><p className="mt-2 text-sm leading-6 text-(--landing-canvas-ink-soft)">1,000 Sandbox credits every month</p></div></div>
            <div className="flex items-center justify-center border-y border-(--landing-hair) px-6 py-3 font-mono text-[10px] tracking-[0.18em] text-(--landing-canvas-mute) uppercase sm:border-x sm:border-y-0">compared with</div>
            <div className="flex flex-col justify-between gap-8 p-6 sm:p-8"><span className="inline-flex w-fit rounded-lg bg-white px-4 py-2"><Image src="/assets/logo/idenfy.svg" alt="iDenfy" width={120} height={44} className="h-8 w-auto max-w-32 object-contain" /></span><div><p className="font-display text-4xl font-medium tracking-[-0.04em]">$135 minimum</p><p className="mt-2 text-sm leading-6 text-(--landing-canvas-ink-soft)">$1.35 per verification on the current pay-as-you-go plan</p></div></div>
          </div>
          <p className="mt-5 max-w-3xl text-xs leading-5 text-(--landing-canvas-mute)">Prices and terms checked 20 August 2026. HaloKYC is not affiliated with iDenfy; verify current terms before purchasing.</p>
        </div>
      </section>

      <section className="bg-(--landing-paper) text-(--landing-ink)">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.72fr_1.28fr] lg:px-10">
          <div><SectionMarker eyebrow="Why teams consider switching" tone="paper" /><h2 className="font-display mt-5 max-w-xl text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">Pick the operating model that fits your team.</h2><p className="mt-5 max-w-lg text-[15px] leading-7 text-(--landing-ink-soft)">iDenfy is a mature KYC, KYB, AML, and fraud platform. HaloKYC is the focused option for early products that need person verification and durable repeat-user controls.</p></div>
          <div className="border-t border-(--landing-paper-edge)">{REASONS.map((reason, index) => <article key={reason.label} className="grid gap-4 border-b border-(--landing-paper-edge) py-7 sm:grid-cols-[3rem_1fr]"><span className="font-mono text-[11px] text-(--landing-stamp)">{String(index + 1).padStart(2, "0")}</span><div><p className="font-mono text-[10px] tracking-[0.18em] text-(--landing-stamp) uppercase">{reason.label}</p><h3 className="mt-2 text-xl font-semibold tracking-tight">{reason.title}</h3><p className="mt-3 text-sm leading-6 text-(--landing-ink-soft)">{reason.body}</p></div></article>)}</div>
        </div>
      </section>

      <section id="comparison" aria-labelledby="idenfy-comparison-heading" className="border-t border-(--landing-hair) bg-(--landing-canvas-deep)">
        <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="mx-auto max-w-3xl text-center"><SectionMarker eyebrow="Side by side" /><h2 id="idenfy-comparison-heading" className="font-display mt-5 text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">HaloKYC vs iDenfy, line by line.</h2><p className="mt-5 text-[15px] leading-7 text-(--landing-canvas-ink-soft)">Both verify identity across web and mobile. The meaningful choice is focused repeat-user operations versus a broader compliance platform.</p></div>
          <div className="mt-12 overflow-x-auto rounded-xl border border-(--landing-hair)"><table className="w-full min-w-[760px] border-collapse text-left"><thead><tr className="bg-(--landing-canvas-edge)"><th className="w-[22%] p-5 font-mono text-[10px] font-medium tracking-[0.2em] text-(--landing-canvas-mute) uppercase">Decision point</th><th className="w-[39%] border-l border-(--landing-hair) bg-(--landing-cyan-soft) p-5 text-sm font-semibold text-(--landing-cyan)">HaloKYC</th><th className="w-[39%] border-l border-(--landing-hair) p-5 text-sm font-semibold">iDenfy</th></tr></thead><tbody>{COMPARISON_ROWS.map((row) => <tr key={row.feature} className="border-t border-(--landing-hair)"><th className="bg-(--landing-canvas) p-5 text-sm font-medium text-(--landing-canvas-ink)">{row.feature}</th><td className="border-l border-(--landing-hair) bg-[color-mix(in_oklch,var(--landing-cyan-soft)_42%,var(--landing-canvas))] p-5 align-top text-sm leading-6 text-(--landing-canvas-ink-soft)">{row.halo}</td><td className="border-l border-(--landing-hair) bg-(--landing-canvas) p-5 align-top text-sm leading-6 text-(--landing-canvas-ink-soft)">{row.idenfy}</td></tr>)}</tbody></table></div>
          <div className="mt-6 flex flex-col gap-3 text-xs leading-5 text-(--landing-canvas-mute) sm:flex-row sm:items-center sm:justify-between"><p>iDenfy prices, trial, and document coverage come from its public pricing page.</p><Link href="https://idenfy.com/pricing-plans-v4/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 underline decoration-(--landing-hair) underline-offset-4 hover:text-(--landing-canvas-ink)">Read iDenfy&apos;s pricing page <ExternalLink aria-hidden className="size-4" /></Link></div>
        </div>
      </section>

      <section className="border-y border-(--landing-hair) bg-(--landing-canvas)"><div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-14 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-10"><div className="flex items-start gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-(--landing-hair) bg-(--landing-canvas-edge) text-(--landing-cyan)"><ShieldCheck aria-hidden className="size-5" strokeWidth={1.5} /></span><div><p className="font-mono text-[10px] tracking-[0.2em] text-(--landing-cyan) uppercase">The honest recommendation</p><p className="mt-2 max-w-3xl text-lg leading-7">Choose HaloKYC for a zero-minimum entry, predictable credits, and focused duplicate operations. Choose iDenfy for broader global documents, native SDKs, human review, KYB, AML, or eIDAS trust services.</p></div></div><Link href="/product" className="group inline-flex items-center gap-2 text-sm font-medium text-(--landing-cyan) underline decoration-(--landing-hair) underline-offset-4">See the HaloKYC product <MoveRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" /></Link></div></section>

      <PricingSection index={4} />
      <PricingComparison />

      <section aria-labelledby="idenfy-faq-heading" className="border-t border-(--landing-hair) bg-(--landing-canvas-deep)"><div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.75fr_1.25fr] lg:px-10"><div><SectionMarker eyebrow="FAQ" /><h2 id="idenfy-faq-heading" className="font-display mt-5 text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">Before you change vendors.</h2><p className="mt-5 max-w-lg text-[15px] leading-7 text-(--landing-canvas-ink-soft)">Compare complete workflows, not just the first number on a pricing page.</p></div><div className="border-t border-(--landing-hair)">{FAQS.map((item) => <details key={item.question} className="group border-b border-(--landing-hair)"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-[15px] font-medium marker:hidden focus-visible:ring-2 focus-visible:ring-(--landing-cyan) focus-visible:outline-none [&::-webkit-details-marker]:hidden">{item.question}<span aria-hidden className="text-xl font-light text-(--landing-canvas-mute) transition-transform group-open:rotate-45">+</span></summary><p className="max-w-2xl pb-5 pr-10 text-sm leading-6 text-(--landing-canvas-ink-soft)">{item.answer}</p></details>)}</div></div></section>

      <section className="relative overflow-hidden border-t border-(--landing-hair) bg-(--landing-canvas)"><div aria-hidden className="landing-grid-soft absolute inset-0 opacity-10" /><div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-24 text-center sm:px-8 sm:py-32 lg:px-10"><p className="font-mono text-[10px] tracking-[0.22em] text-(--landing-cyan) uppercase">Test the focused stack</p><h2 className="font-display mt-5 max-w-4xl text-4xl leading-tight font-medium tracking-[-0.04em] sm:text-6xl">Rebuild one iDenfy workflow in HaloKYC.</h2><p className="mt-6 max-w-2xl text-[15px] leading-7 text-(--landing-canvas-ink-soft)">Run the same cases through both products. Keep the system that gives your developers, reviewers, users, and budget the better result.</p><div className="mt-9 flex flex-wrap justify-center gap-3"><CtaLink href="/login">Create a free workspace</CtaLink><CtaLink href="https://docs.halokyc.com/" secondary>Read the API docs</CtaLink></div><div className="mt-12 grid w-full max-w-3xl gap-4 border-t border-(--landing-hair) pt-6 text-left sm:grid-cols-3">{["1,000 free credits / month", "No annual commitment", "Signed webhook results"].map((item) => <p key={item} className="flex items-center gap-2 text-sm text-(--landing-canvas-ink-soft)"><Check aria-hidden className="size-4 shrink-0 text-(--landing-cyan)" />{item}</p>)}</div></div></section>
    </MarketingPageShell>
  );
}
