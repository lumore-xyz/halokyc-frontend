import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ArrowDown, ArrowRight, Check, MoveRight } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { MarketingPageShell } from "@/components/landing/marketing-page";
import { SectionMarker } from "@/components/landing/section-marker";
import { publicEnv } from "@/lib/env";
import { breadcrumbListSchema, itemListSchema, webPageSchema } from "@/lib/structured-data";

const ALTERNATIVES = [
  {
    name: "Didit",
    logo: "/assets/logo/didit.svg",
    href: "/switch/didit-alternative",
    category: "Developer-first IDV",
    description: "Compare free usage, billing units, product breadth, duplicate controls, and platform-independent delivery.",
  },
  {
    name: "Persona",
    logo: "/assets/logo/persona.svg",
    href: "/switch/persona-alternative",
    category: "Identity orchestration",
    description: "Compare public entry pricing, workflow flexibility, repeat-user controls, and the tradeoffs of a broader platform.",
  },
  {
    name: "Sumsub",
    logo: "/assets/logo/sumsub.svg",
    href: "/switch/sumsub-alternative",
    category: "Compliance suite",
    description: "Compare monthly minimums, verification pricing, global compliance breadth, and a focused KYC operating model.",
  },
  {
    name: "Veriff",
    logo: "/assets/logo/veriff.svg",
    href: "/switch/veriff-alternative",
    category: "Document and biometric IDV",
    description: "Compare self-serve pricing, trial access, SDK options, identity workflows, and duplicate operations.",
  },
  {
    name: "Jumio",
    logo: "/assets/logo/jumio.svg",
    href: "/switch/jumio-alternative",
    category: "Enterprise identity",
    description: "Compare pricing visibility, global coverage, native SDKs, identity intelligence, and AML breadth.",
  },
  {
    name: "Onfido",
    logo: "/assets/logo/onfido.svg",
    href: "/switch/onfido-alternative",
    category: "Entrust Identity Verification",
    description: "Compare sales-led pricing, Workflow Studio, global document coverage, duplicate controls, and integration.",
  },
  {
    name: "Entrust",
    logo: "/assets/logo/entrust.png",
    href: "/switch/entrust-alternative",
    category: "Enterprise identity",
    description: "Review the Onfido product now sold as Entrust Identity Verification and compare it with HaloKYC.",
  },
  {
    name: "iDenfy",
    logo: "/assets/logo/idenfy.svg",
    href: "/switch/idenfy-alternative",
    category: "KYC, KYB, and AML",
    description: "Compare current public pricing, trial terms, approved-only billing, compliance breadth, and SDK tradeoffs.",
  },
] as const;

const FACTS = [
  { value: String(ALTERNATIVES.length), label: "vendor comparisons" },
  { value: "$0", label: "Sandbox minimum" },
  { value: "1,000", label: "credits every month" },
  { value: "Any app", label: "web, Android, and iOS" },
] as const;

export const metadata: Metadata = {
  title: "KYC vendor alternatives and comparisons",
  description: "Compare HaloKYC with Didit, Persona, Sumsub, Veriff, Jumio, Onfido, Entrust, and iDenfy across pricing, workflows, integration, and fit.",
  metadataBase: new URL(publicEnv.siteUrl),
  alternates: { canonical: "/switch" },
  openGraph: {
    title: "Switch identity verification providers | HaloKYC",
    description: "Eight honest, side-by-side KYC vendor comparisons for teams choosing their identity verification stack.",
    type: "website",
    url: "/switch",
    siteName: "HaloKYC",
  },
};

const SEO_SCHEMA = [
  webPageSchema(
    "KYC vendor alternatives and comparisons",
    "Compare HaloKYC with eight identity verification providers across pricing, workflows, integration, and fit.",
    "/switch",
  ),
  breadcrumbListSchema([
    { name: "Home", url: "/" },
    { name: "KYC vendor comparisons", url: "/switch" },
  ]),
  itemListSchema(
    "HaloKYC vendor alternative guides",
    ALTERNATIVES.map((vendor) => ({
      name: `${vendor.name} alternative`,
      url: vendor.href,
    })),
  ),
];

export default function SwitchPage() {
  return (
    <MarketingPageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SEO_SCHEMA).replace(/</g, "\\u003c") }} />
      <section className="relative isolate overflow-hidden border-b border-(--landing-hair)">
        <div aria-hidden className="landing-grid-soft absolute inset-0 opacity-10" />
        <div aria-hidden className="absolute top-8 left-1/2 -z-10 h-80 w-[54rem] -translate-x-1/2 rounded-full bg-(--landing-cyan-soft) blur-3xl" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-20 text-center sm:px-8 sm:py-28 lg:px-10 lg:py-32">
          <SectionMarker eyebrow="Switch identity providers" className="justify-center" />
          <h1 className="font-display mt-7 max-w-5xl text-5xl leading-[0.98] font-medium tracking-[-0.045em] text-(--landing-canvas-ink) sm:text-6xl lg:text-7xl">
            Compare the KYC stack you have with the one you need.
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-7 text-(--landing-canvas-ink-soft) sm:text-lg">
            Eight evidence-led comparisons across pricing, workflow depth,
            duplicate controls, and integration. See where HaloKYC is the
            better fit—and where your current provider still wins.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="#comparisons" className="group inline-flex h-12 items-center justify-center gap-2 rounded-md bg-(--landing-cyan) px-5 text-sm font-medium text-(--landing-canvas) transition-colors hover:bg-[color-mix(in_oklch,var(--landing-cyan)_88%,white)] focus-visible:ring-2 focus-visible:ring-(--landing-cyan) focus-visible:outline-none">
              Find your provider <ArrowDown aria-hidden className="size-4 transition-transform group-hover:translate-y-0.5" />
            </Link>
            <Link href="/pricing" className="inline-flex h-12 items-center justify-center rounded-md border border-(--landing-hair) px-5 text-sm font-medium transition-colors hover:bg-(--landing-canvas-edge) focus-visible:ring-2 focus-visible:ring-(--landing-cyan) focus-visible:outline-none">
              See HaloKYC pricing
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Comparison summary" className="border-b border-(--landing-hair) bg-(--landing-canvas-deep)">
        <dl className="mx-auto grid w-full max-w-7xl grid-cols-2 px-6 sm:px-8 lg:grid-cols-4 lg:px-10">
          {FACTS.map((fact) => (
            <div key={fact.label} className="border-l border-(--landing-hair) px-5 py-8 last:border-r sm:px-7 sm:py-10">
              <dt className="font-mono text-[10px] tracking-[0.18em] text-(--landing-canvas-mute) uppercase">{fact.label}</dt>
              <dd className="font-display mt-2 text-3xl font-medium tracking-[-0.035em] text-(--landing-canvas-ink) sm:text-4xl">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="comparisons" aria-labelledby="comparison-list-heading" className="bg-(--landing-paper) text-(--landing-ink)">
        <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <SectionMarker eyebrow="Identity verification vendors" tone="paper" />
              <h2 id="comparison-list-heading" className="font-display mt-5 text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">
                Start with the provider you know.
              </h2>
            </div>
            <p className="max-w-2xl text-[15px] leading-7 text-(--landing-ink-soft)">
              Each guide compares the public facts, names the migration
              tradeoffs, and tells you when staying put makes more sense.
              No invented savings. No universal “best” vendor.
            </p>
          </div>

          <div className="relative mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div aria-hidden className="absolute top-0 bottom-0 left-4 hidden w-px bg-(--landing-paper-edge) lg:block" />
            {ALTERNATIVES.map((vendor, index) => (
              <Link
                key={vendor.name}
                href={vendor.href}
                className="group relative flex min-h-80 flex-col overflow-hidden rounded-xl border border-(--landing-paper-edge) bg-(--landing-paper) transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-(--landing-rule) hover:shadow-[0_24px_60px_-34px_rgba(10,44,32,0.35)] focus-visible:ring-2 focus-visible:ring-(--landing-stamp) focus-visible:outline-none"
              >
                <div className="relative flex h-36 items-center justify-center overflow-hidden border-b border-(--landing-paper-edge) bg-[linear-gradient(135deg,color-mix(in_oklch,var(--landing-stamp)_12%,var(--landing-paper)),var(--landing-paper))]">
                  <div aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-(--landing-paper-edge)" />
                  <span className="relative inline-flex min-h-16 min-w-40 items-center justify-center rounded-lg border border-(--landing-paper-edge) bg-white px-6 py-4 shadow-[0_18px_40px_-24px_rgba(10,44,32,0.45)]">
                    <Image src={vendor.logo} alt={vendor.name} width={200} height={64} className="h-8 w-auto max-w-32 object-contain" />
                  </span>
                  <span className="absolute top-4 left-4 rounded-full border border-(--landing-paper-edge) bg-(--landing-paper) px-2.5 py-1 font-mono text-[9px] tracking-[0.16em] text-(--landing-stamp) uppercase">
                    Route {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="font-mono text-[10px] tracking-[0.18em] text-(--landing-stamp) uppercase">{vendor.category}</p>
                  <h3 className="font-display mt-3 text-2xl font-medium tracking-[-0.025em]">{vendor.name} alternative</h3>
                  <p className="mt-3 text-sm leading-6 text-(--landing-ink-soft)">{vendor.description}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-semibold text-(--landing-stamp)">
                    Read the comparison <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-(--landing-hair) bg-(--landing-canvas-deep)">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-10">
          <div>
            <SectionMarker eyebrow="One integration path" />
            <h2 className="font-display mt-5 max-w-xl text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">Your client platform does not choose your KYC vendor.</h2>
          </div>
          <div className="border-t border-(--landing-hair)">
            {["Create verification sessions from your backend through the REST API.", "Open the hosted flow from web, Android, iOS, or another connected client.", "Consume decisions through the API and signed webhooks."].map((step, index) => (
              <p key={step} className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-(--landing-hair) py-5 text-sm leading-6 text-(--landing-canvas-ink-soft)">
                <span className="font-mono text-[10px] text-(--landing-cyan)">{String(index + 1).padStart(2, "0")}</span>{step}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-(--landing-canvas)">
        <div aria-hidden className="landing-grid-soft absolute inset-0 opacity-10" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-24 text-center sm:px-8 sm:py-32 lg:px-10">
          <BrandLogo variant="wordmark-light" className="h-9 w-36" />
          <h2 className="font-display mt-7 max-w-4xl text-4xl leading-tight font-medium tracking-[-0.04em] sm:text-6xl">Test the alternative before you migrate.</h2>
          <p className="mt-6 max-w-2xl text-[15px] leading-7 text-(--landing-canvas-ink-soft)">Build one representative workflow, run the same cases through both systems, and compare completion, review volume, duplicate outcomes, and total cost.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="group inline-flex h-12 items-center justify-center gap-2 rounded-md bg-(--landing-cyan) px-5 text-sm font-medium text-(--landing-canvas) transition-colors hover:bg-[color-mix(in_oklch,var(--landing-cyan)_88%,white)] focus-visible:ring-2 focus-visible:ring-(--landing-cyan) focus-visible:outline-none">Create a free workspace <MoveRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" /></Link>
            <Link href="https://docs.halokyc.com/" className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-(--landing-hair) px-5 text-sm font-medium transition-colors hover:bg-(--landing-canvas-edge) focus-visible:ring-2 focus-visible:ring-(--landing-cyan) focus-visible:outline-none"><Check aria-hidden className="size-4 text-(--landing-cyan)" />Read the API docs</Link>
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
}
