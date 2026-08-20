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
    label: "Published economics",
    title: "Price the workflow before talking to procurement.",
    body: "HaloKYC publishes its plans, monthly credits, rollover caps, one-off packs, and effective per-credit rates. Entrust directs identity-verification buyers to contact its team rather than showing a comparable self-serve price list.",
  },
  {
    label: "Repeat-user operations",
    title: "Make duplicate identities part of the decision.",
    body: "HaloKYC combines tenant-scoped duplicate matching, subject bans, manual review, readable decisions, and audit history for products dealing with repeat-account abuse.",
  },
  {
    label: "One integration",
    title: "Use the same KYC path across every app.",
    body: "Your backend creates a HaloKYC session through the REST API. Web, Android, and iOS apps open the hosted flow, then receive results through the API or signed webhooks.",
  },
] as const;

const COMPARISON_ROWS = [
  { feature: "Best fit", halo: "Early consumer apps and product teams dealing with repeat-user abuse", onfido: "Global programs needing mature document coverage, no-code orchestration, and the broader Entrust security portfolio" },
  { feature: "Public pricing", halo: "Published plans, credit grants, rollover rules, and one-off packs", onfido: "No comparable public self-serve price list; contact Entrust" },
  { feature: "Free development", halo: "1,000 Sandbox credits every month", onfido: "Confirm trial, sandbox, and production terms with Entrust" },
  { feature: "Billing unit", halo: "One completed verification uses one credit, independent of configured checks", onfido: "Confirm report, workflow, and volume pricing in the commercial quote" },
  { feature: "Identity workflow", halo: "OCR, liveness, face match, age, duplicate detection, and decision rules", onfido: "Document, biometric, data-source, and passive-fraud checks orchestrated in Workflow Studio" },
  { feature: "Global reach", halo: "Confirm current supported documents and markets before rollout", onfido: "Entrust advertises 2,500+ document types across 195 countries" },
  { feature: "Repeat-user controls", halo: "Tenant-scoped duplicate matching, subject bans, review, and audit history", onfido: "Known Faces, fraud signals, biometrics, and identity-verification reports" },
  { feature: "App integration", halo: "REST API plus hosted flow for web, Android, iOS, or any connected client", onfido: "APIs, SDKs, hosted experiences, and no-code workflow orchestration" },
] as const;

const FAQS = [
  {
    question: "Is Onfido now Entrust?",
    answer: "Yes. Entrust completed its acquisition of Onfido in April 2024. The product is now presented as Entrust Identity Verification Solutions, although Onfido names remain in parts of the developer documentation and existing integrations.",
  },
  {
    question: "Is HaloKYC a drop-in replacement for Onfido?",
    answer: "No. Onfido integrations use applicants, workflow runs, reports, SDK tokens, and webhooks. HaloKYC uses workflows, verification sessions, review items, subjects, and signed webhooks. Plan an integration change rather than swapping credentials.",
  },
  {
    question: "When should I stay with Entrust Identity Verification?",
    answer: "Stay if you depend on its advertised 2,500+ document types across 195 countries, Workflow Studio, Entrust's broader identity-security portfolio, ETSI-certified workflows, or mature enterprise support. HaloKYC is the narrower option for focused person verification and repeat-user controls.",
  },
  {
    question: "Is HaloKYC cheaper than Onfido?",
    answer: "HaloKYC publishes effective paid rates from $0.020 to $0.033 per completed verification. Entrust does not publish a directly comparable self-serve price list, so a defensible comparison requires your commercial quote and the exact reports and workflows you use.",
  },
  {
    question: "Can I run both products before switching?",
    answer: "Yes. Rebuild one representative Onfido workflow in a HaloKYC Sandbox and run the same test cohort through both. Compare completion, false rejects, manual-review volume, duplicate outcomes, webhook handling, and total quoted cost before moving production traffic.",
  },
  {
    question: "Can HaloKYC run in Android and iOS apps?",
    answer: "Yes. Your backend creates a verification session through the REST API, while your Android, iOS, or web app opens the hosted flow. Results return through the API and signed webhooks, so the KYC integration is independent of the client platform.",
  },
] as const;

const FAQ_SCHEMA = faqPageSchema([...FAQS]);

export const metadata: Metadata = {
  title: "Onfido alternative for startup KYC",
  description: "Compare HaloKYC with Onfido, now Entrust Identity Verification, across pricing visibility, workflows, global coverage, duplicate controls, and integration.",
  metadataBase: new URL(publicEnv.siteUrl),
  alternates: { canonical: "/switch/onfido-alternative" },
  openGraph: {
    title: "A focused Onfido alternative for startup KYC | HaloKYC",
    description: "An honest comparison of HaloKYC and Entrust Identity Verification for product teams choosing a KYC stack.",
    type: "website",
    url: "/switch/onfido-alternative",
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

export default function OnfidoAlternativePage() {
  return (
    <MarketingPageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA).replace(/</g, "\\u003c") }} />

      <section className="relative isolate overflow-hidden border-b border-(--landing-hair)">
        <div aria-hidden className="landing-grid-soft absolute inset-0 opacity-10" />
        <div aria-hidden className="absolute top-20 left-1/2 -z-10 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-(--landing-cyan-soft) blur-3xl" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-20 text-center sm:px-8 sm:py-28 lg:px-10 lg:py-32">
          <p className="font-mono text-[11px] tracking-[0.22em] text-(--landing-cyan) uppercase">Switch from Onfido</p>
          <h1 className="font-display mt-7 max-w-5xl text-5xl leading-[0.98] font-medium tracking-[-0.045em] text-(--landing-canvas-ink) sm:text-6xl lg:text-7xl">
            Onfido became Entrust. Your KYC stack can stay focused.
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-7 text-(--landing-canvas-ink-soft) sm:text-lg">
            HaloKYC gives early product teams published per-verification economics,
            repeat-user controls, and one platform-independent integration for web,
            Android, and iOS—without adopting a broader identity-security portfolio.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3"><CtaLink href="/login">Build a free workflow</CtaLink><CtaLink href="#comparison" secondary>Compare the products</CtaLink></div>

          <div className="mt-16 grid w-full max-w-5xl overflow-hidden rounded-xl border border-(--landing-hair) bg-(--landing-canvas-edge) text-left sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
            <div className="flex flex-col justify-between gap-8 p-6 sm:p-8"><BrandLogo variant="wordmark-light" className="h-9 w-36" /><div><p className="font-display text-4xl font-medium tracking-[-0.04em] text-(--landing-cyan)">Published</p><p className="mt-2 text-sm leading-6 text-(--landing-canvas-ink-soft)">plans, credits, rollover caps, and pack prices</p></div></div>
            <div className="flex items-center justify-center border-y border-(--landing-hair) px-6 py-3 font-mono text-[10px] tracking-[0.18em] text-(--landing-canvas-mute) uppercase sm:border-x sm:border-y-0">compared with</div>
            <div className="flex flex-col justify-between gap-8 p-6 sm:p-8"><span className="inline-flex w-fit rounded-lg bg-white px-4 py-2"><Image src="/assets/logo/onfido.svg" alt="Onfido, an Entrust company" width={102} height={28} className="h-8 w-auto max-w-40 object-contain" /></span><div><p className="font-display text-4xl font-medium tracking-[-0.04em]">Contact Entrust</p><p className="mt-2 text-sm leading-6 text-(--landing-canvas-ink-soft)">commercial terms are not listed like a self-serve price page</p></div></div>
          </div>
          <p className="mt-5 max-w-3xl text-xs leading-5 text-(--landing-canvas-mute)">Entrust acquired Onfido in April 2024. HaloKYC is not affiliated with either company; confirm current product names and commercial terms with Entrust.</p>
        </div>
      </section>

      <section className="bg-(--landing-paper) text-(--landing-ink)"><div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.72fr_1.28fr] lg:px-10"><div><SectionMarker eyebrow="Why teams consider switching" tone="paper" /><h2 className="font-display mt-5 max-w-xl text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">Keep identity verification at product scale.</h2><p className="mt-5 max-w-lg text-[15px] leading-7 text-(--landing-ink-soft)">Entrust offers a deep identity-security portfolio. HaloKYC is the focused option for teams that need to verify people, stop repeat users, and understand the bill before procurement.</p></div><div className="border-t border-(--landing-paper-edge)">{REASONS.map((reason, index) => <article key={reason.label} className="grid gap-4 border-b border-(--landing-paper-edge) py-7 sm:grid-cols-[3rem_1fr]"><span className="font-mono text-[11px] text-(--landing-stamp)">{String(index + 1).padStart(2, "0")}</span><div><p className="font-mono text-[10px] tracking-[0.18em] text-(--landing-stamp) uppercase">{reason.label}</p><h3 className="mt-2 text-xl font-semibold tracking-tight">{reason.title}</h3><p className="mt-3 text-sm leading-6 text-(--landing-ink-soft)">{reason.body}</p></div></article>)}</div></div></section>

      <section id="comparison" aria-labelledby="onfido-comparison-heading" className="border-t border-(--landing-hair) bg-(--landing-canvas-deep)"><div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 sm:py-28 lg:px-10"><div className="mx-auto max-w-3xl text-center"><SectionMarker eyebrow="Side by side" /><h2 id="onfido-comparison-heading" className="font-display mt-5 text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">HaloKYC vs Onfido, now Entrust IDV.</h2><p className="mt-5 text-[15px] leading-7 text-(--landing-canvas-ink-soft)">Both products verify identity. Entrust offers greater global and enterprise depth; HaloKYC offers a smaller operating surface and public unit economics.</p></div><div className="mt-12 overflow-x-auto rounded-xl border border-(--landing-hair)"><table className="w-full min-w-[760px] border-collapse text-left"><thead><tr className="bg-(--landing-canvas-edge)"><th className="w-[22%] p-5 font-mono text-[10px] font-medium tracking-[0.2em] text-(--landing-canvas-mute) uppercase">Decision point</th><th className="w-[39%] border-l border-(--landing-hair) bg-(--landing-cyan-soft) p-5 text-sm font-semibold text-(--landing-cyan)">HaloKYC</th><th className="w-[39%] border-l border-(--landing-hair) p-5 text-sm font-semibold">Onfido / Entrust</th></tr></thead><tbody>{COMPARISON_ROWS.map((row) => <tr key={row.feature} className="border-t border-(--landing-hair)"><th className="bg-(--landing-canvas) p-5 text-sm font-medium text-(--landing-canvas-ink)">{row.feature}</th><td className="border-l border-(--landing-hair) bg-[color-mix(in_oklch,var(--landing-cyan-soft)_42%,var(--landing-canvas))] p-5 align-top text-sm leading-6 text-(--landing-canvas-ink-soft)">{row.halo}</td><td className="border-l border-(--landing-hair) bg-(--landing-canvas) p-5 align-top text-sm leading-6 text-(--landing-canvas-ink-soft)">{row.onfido}</td></tr>)}</tbody></table></div><div className="mt-6 flex flex-col gap-3 text-xs leading-5 text-(--landing-canvas-mute) sm:flex-row sm:items-center sm:justify-between"><p>Last reviewed against public Entrust documentation: August 2026.</p><Link href="https://www.entrust.com/company/onfido-is-now-entrust" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 underline decoration-(--landing-hair) underline-offset-4 hover:text-(--landing-canvas-ink)">Read the Entrust transition page <ExternalLink aria-hidden className="size-4" /></Link></div></div></section>

      <section className="border-y border-(--landing-hair) bg-(--landing-canvas)"><div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-14 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-10"><div className="flex items-start gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-(--landing-hair) bg-(--landing-canvas-edge) text-(--landing-cyan)"><ShieldCheck aria-hidden className="size-5" strokeWidth={1.5} /></span><div><p className="font-mono text-[10px] tracking-[0.2em] text-(--landing-cyan) uppercase">The honest recommendation</p><p className="mt-2 max-w-3xl text-lg leading-7">Choose HaloKYC for public pricing, predictable credits, and focused repeat-user operations. Choose Entrust Identity Verification when extensive global coverage, no-code orchestration, certified regional workflows, or the wider Entrust security portfolio are essential.</p></div></div><Link href="/product" className="group inline-flex items-center gap-2 text-sm font-medium text-(--landing-cyan) underline decoration-(--landing-hair) underline-offset-4">See the HaloKYC product <MoveRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" /></Link></div></section>

      <PricingSection index={4} />
      <PricingComparison />

      <section aria-labelledby="onfido-faq-heading" className="border-t border-(--landing-hair) bg-(--landing-canvas-deep)"><div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.75fr_1.25fr] lg:px-10"><div><SectionMarker eyebrow="FAQ" /><h2 id="onfido-faq-heading" className="font-display mt-5 text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">Before you change vendors.</h2><p className="mt-5 max-w-lg text-[15px] leading-7 text-(--landing-canvas-ink-soft)">Map the reports, Studio workflows, countries, certifications, and commercial terms your program uses today.</p></div><div className="border-t border-(--landing-hair)">{FAQS.map((item) => <details key={item.question} className="group border-b border-(--landing-hair)"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-[15px] font-medium marker:hidden focus-visible:ring-2 focus-visible:ring-(--landing-cyan) focus-visible:outline-none [&::-webkit-details-marker]:hidden">{item.question}<span aria-hidden className="text-xl font-light text-(--landing-canvas-mute) transition-transform group-open:rotate-45">+</span></summary><p className="max-w-2xl pb-5 pr-10 text-sm leading-6 text-(--landing-canvas-ink-soft)">{item.answer}</p></details>)}</div></div></section>

      <section className="relative overflow-hidden border-t border-(--landing-hair) bg-(--landing-canvas)"><div aria-hidden className="landing-grid-soft absolute inset-0 opacity-10" /><div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-24 text-center sm:px-8 sm:py-32 lg:px-10"><p className="font-mono text-[10px] tracking-[0.22em] text-(--landing-cyan) uppercase">Test the focused stack</p><h2 className="font-display mt-5 max-w-4xl text-4xl leading-tight font-medium tracking-[-0.04em] sm:text-6xl">Rebuild one Onfido workflow in HaloKYC.</h2><p className="mt-6 max-w-2xl text-[15px] leading-7 text-(--landing-canvas-ink-soft)">Run the same cases through both products. Keep the system that gives your developers, reviewers, users, and budget the better result.</p><div className="mt-9 flex flex-wrap justify-center gap-3"><CtaLink href="/login">Create a free workspace</CtaLink><CtaLink href="https://docs.halokyc.com/" secondary>Read the API docs</CtaLink></div><div className="mt-12 grid w-full max-w-3xl gap-4 border-t border-(--landing-hair) pt-6 text-left sm:grid-cols-3">{["1,000 free credits / month", "No annual commitment", "Signed webhook results"].map((item) => <p key={item} className="flex items-center gap-2 text-sm text-(--landing-canvas-ink-soft)"><Check aria-hidden className="size-4 shrink-0 text-(--landing-cyan)" />{item}</p>)}</div></div></section>
    </MarketingPageShell>
  );
}
