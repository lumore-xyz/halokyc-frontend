import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  ArrowRight,
  Check,
  ExternalLink,
  MoveRight,
  ShieldCheck,
} from "lucide-react";

import { MarketingPageShell } from "@/components/landing/marketing-page";
import { PricingComparison } from "@/components/landing/pricing-comparison";
import { PricingSection } from "@/components/landing/pricing-section";
import { SectionMarker } from "@/components/landing/section-marker";
import { publicEnv } from "@/lib/env";
import { faqPageSchema } from "@/lib/structured-data";
import { cn } from "@/lib/utils";

const REASONS = [
  {
    label: "A smaller operating surface",
    title: "Run verification without adopting a second operating system.",
    body: "HaloKYC keeps workflows, checks, review, webhooks, and the audit trail in one focused product. Your team can see where a decision came from without learning a sprawling identity platform first.",
  },
  {
    label: "Published entry pricing",
    title: "Know the bill before you book a sales call.",
    body: "Start in the sandbox, then choose a monthly credit plan or buy a one-off pack. The public pricing page shows the cost per completed verification and the rollover rules.",
  },
  {
    label: "Readable decisions",
    title: "Give reviewers a reason, not a mystery score.",
    body: "Each session resolves to approved, rejected, or needs review with check results, a risk reason, and an audit record. Your team keeps the final say on uncertain cases.",
  },
  {
    label: "Built for product teams",
    title: "One KYC integration for every app you ship.",
    body: "Your backend starts the session through a simple REST API. Your web, Android, or iOS app opens the hosted verification flow, then receives the result through the API or a signed webhook.",
  },
] as const;

const COMPARISON_ROWS = [
  {
    feature: "Best fit",
    halo: "Early consumer apps and product teams dealing with repeat-user abuse",
    persona: "Teams that need a broad, highly configurable identity platform",
  },
  {
    feature: "Public entry pricing",
    halo: "$0 sandbox, then published monthly credit plans",
    persona: "Confirm current package and usage pricing with Persona",
  },
  {
    feature: "App integration",
    halo: "Platform-independent REST APIs plus a hosted flow for web, Android, and iOS apps",
    persona: "Hosted, embedded, mobile SDK, and transactions-based options",
  },
  {
    feature: "Workflow model",
    halo: "Choose checks, age rules, thresholds, and decision mode",
    persona: "Inquiry templates plus conditional, parallel automation",
  },
  {
    feature: "Decision states",
    halo: "Approved, rejected, or needs review with a readable reason",
    persona: "Approved, declined, or needs review through post-inquiry logic",
  },
  {
    feature: "Manual review",
    halo: "A focused queue with evidence, check results, and audit history",
    persona: "Cases and inquiry review inside the broader platform",
  },
  {
    feature: "Duplicate and ban controls",
    halo: "Tenant-scoped duplicate checks and subject lifecycle controls",
    persona: "Accounts, reference IDs, Lists, and configurable workflows",
  },
  {
    feature: "Result delivery",
    halo: "API polling and HMAC-signed webhooks",
    persona: "Dashboard, API retrieval, and webhooks",
  },
  {
    feature: "Mobile implementation",
    halo: "Use the same backend API and hosted flow; no platform-specific KYC integration required",
    persona: "Native iOS, Android, and React Native SDKs, plus API options",
  },
] as const;

const FAQS = [
  {
    question: "Is HaloKYC a drop-in replacement for Persona?",
    answer:
      "No. The core journey maps cleanly, but the object models are different. Persona uses inquiries, templates, accounts, cases, and workflows. HaloKYC uses verification sessions, workflow IDs, review items, subjects, and signed webhooks. Plan a small integration change rather than a credential swap.",
  },
  {
    question: "When should I stay with Persona?",
    answer:
      "Stay if your product must embed Persona's platform-specific native capture SDKs, or if your team depends on its broad report catalog, complex workflow automation, or deep integrations with other business systems. Switching only makes sense when a simpler product and a clearer cost model are worth the migration.",
  },
  {
    question: "Can I test HaloKYC before moving production traffic?",
    answer:
      "Yes. Create a sandbox workspace, rebuild one representative workflow, and run test users through it. Keep Persona live while you compare completion rates, review volume, decision quality, and webhook handling.",
  },
  {
    question: "What does a HaloKYC verification include?",
    answer:
      "A workflow can combine document OCR, selfie capture, face match, liveness, age rules, duplicate detection, risk scoring, manual review, and signed result delivery. You choose the checks before the session starts.",
  },
  {
    question: "How is HaloKYC priced?",
    answer:
      "The sandbox is free. Paid plans start at $49 per month, and one completed verification uses one credit. Monthly credits can roll over within the published cap; one-off credit packs do not expire.",
  },
  {
    question: "Can I use HaloKYC in an Android or iOS app?",
    answer:
      "Yes. HaloKYC is platform independent. Your backend creates a verification session through the REST API, and your Android, iOS, or web app opens the hosted flow. The final decision is available through the API and signed webhooks. You do not need a separate HaloKYC integration for each client platform.",
  },
] as const;

const FAQ_SCHEMA = faqPageSchema([...FAQS]);

export const metadata: Metadata = {
  title: "Persona alternative for startup KYC",
  description:
    "Compare HaloKYC and Persona across pricing, workflows, review, and integration. Use one HaloKYC API from web, Android, iOS, or any connected application.",
  metadataBase: new URL(publicEnv.siteUrl),
  alternates: {
    canonical: "/switch/persona-alternative",
  },
  openGraph: {
    title: "A focused Persona alternative for startup KYC | HaloKYC",
    description:
      "A practical, honest comparison of HaloKYC and Persona for product teams choosing an identity verification stack.",
    type: "website",
    url: "/switch/persona-alternative",
    siteName: "HaloKYC",
  },
};

function CtaLink({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-medium",
        "transition-colors focus-visible:ring-2 focus-visible:ring-(--landing-cyan) focus-visible:ring-offset-2 focus-visible:ring-offset-(--landing-canvas) focus-visible:outline-none",
        secondary
          ? "border border-(--landing-hair) text-(--landing-canvas-ink) hover:bg-(--landing-canvas-edge)"
          : "bg-(--landing-cyan) text-(--landing-canvas) hover:bg-[color-mix(in_oklch,var(--landing-cyan)_88%,white)]",
      )}
    >
      {children}
      <ArrowRight
        data-icon="inline-end"
        aria-hidden
        className="transition-transform group-hover:translate-x-0.5"
        strokeWidth={1.75}
      />
    </Link>
  );
}

export default function PersonaAlternativePage() {
  return (
    <MarketingPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(FAQ_SCHEMA).replace(/</g, "\\u003c"),
        }}
      />
      <section className="relative isolate overflow-hidden border-b border-(--landing-hair)">
        <div aria-hidden className="landing-grid-soft absolute inset-0 opacity-10" />
        <div
          aria-hidden
          className="absolute top-20 left-1/2 -z-10 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-(--landing-cyan-soft) blur-3xl"
        />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-20 text-center sm:px-8 sm:py-28 lg:px-10 lg:py-32">
          <p className="font-mono text-[11px] tracking-[0.22em] text-(--landing-cyan) uppercase">
            Switch from Persona
          </p>
          <h1 className="font-display mt-7 max-w-5xl text-5xl leading-[0.98] font-medium tracking-[-0.045em] text-(--landing-canvas-ink) sm:text-6xl lg:text-7xl">
            Persona is powerful. Your KYC stack may not need to be.
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-7 text-(--landing-canvas-ink-soft) sm:text-lg">
            HaloKYC gives product teams configurable identity checks, a clear
            review queue, and one platform-independent API for web, Android,
            and iOS apps. Start with the workflow you need now, without taking
            on a broader identity platform first.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <CtaLink href="/login">Build a free workflow</CtaLink>
            <CtaLink href="#comparison" secondary>
              Compare the products
            </CtaLink>
          </div>

          <div className="mt-16 grid w-full max-w-4xl border border-(--landing-hair) bg-(--landing-canvas-edge) text-left sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
            <div className="flex flex-col justify-between gap-7 p-6 sm:p-8">
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-(--landing-cyan) uppercase">
                  HaloKYC
                </p>
                <p className="font-display mt-3 text-3xl font-medium tracking-[-0.035em]">
                  Focused KYC infrastructure
                </p>
              </div>
              <p className="text-sm leading-6 text-(--landing-canvas-ink-soft)">
                Best when you want one backend integration for every app, an
                operator review path, and costs your team can model from the
                public page.
              </p>
            </div>
            <div className="flex items-center justify-center border-y border-(--landing-hair) px-6 py-3 font-mono text-[10px] tracking-[0.18em] text-(--landing-canvas-mute) uppercase sm:border-x sm:border-y-0">
              compared with
            </div>
            <div className="flex flex-col justify-between gap-7 p-6 sm:p-8">
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-(--landing-canvas-mute) uppercase">
                  Persona
                </p>
                <p className="font-display mt-3 text-3xl font-medium tracking-[-0.035em]">
                  Broad identity platform
                </p>
              </div>
              <p className="text-sm leading-6 text-(--landing-canvas-ink-soft)">
                Best when you need several integration modes, mature mobile
                SDKs, and complex automation across identity operations.
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-3xl text-xs leading-5 text-(--landing-canvas-mute)">
            HaloKYC is not affiliated with Persona. Product details should be
            confirmed with each vendor before purchase.
          </p>
        </div>
      </section>

      <section className="bg-(--landing-paper) text-(--landing-ink)">
        <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <SectionMarker eyebrow="Why teams consider switching" tone="paper" />
              <h2 className="font-display mt-5 max-w-xl text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">
                Less platform. More control over the decision.
              </h2>
              <p className="mt-5 max-w-lg text-[15px] leading-7 text-(--landing-ink-soft)">
                Persona can support a wide identity program. HaloKYC is the
                narrower choice for teams that need to verify people, resolve
                uncertain sessions, and move on with their product.
              </p>
            </div>

            <div className="border-t border-(--landing-paper-edge)">
              {REASONS.map((reason, index) => (
                <article
                  key={reason.label}
                  className="grid gap-4 border-b border-(--landing-paper-edge) py-7 sm:grid-cols-[3rem_1fr]"
                >
                  <span className="font-mono text-[11px] text-(--landing-stamp)">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.18em] text-(--landing-stamp) uppercase">
                      {reason.label}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight">
                      {reason.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-(--landing-ink-soft)">
                      {reason.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="comparison"
        aria-labelledby="comparison-heading"
        className="border-t border-(--landing-hair) bg-(--landing-canvas-deep)"
      >
        <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <SectionMarker eyebrow="Side by side" />
            <h2
              id="comparison-heading"
              className="font-display mt-5 text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl"
            >
              HaloKYC vs Persona, without the scorecard theatre.
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-(--landing-canvas-ink-soft)">
              Both products can verify identity. The practical difference is
              how much platform, configuration, and integration surface your
              team wants to own.
            </p>
          </div>

          <div className="mt-12 overflow-x-auto rounded-xl border border-(--landing-hair)">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="bg-(--landing-canvas-edge)">
                  <th className="w-[22%] p-5 font-mono text-[10px] font-medium tracking-[0.2em] text-(--landing-canvas-mute) uppercase">
                    Decision point
                  </th>
                  <th className="w-[39%] border-l border-(--landing-hair) bg-(--landing-cyan-soft) p-5 text-sm font-semibold text-(--landing-cyan)">
                    HaloKYC
                  </th>
                  <th className="w-[39%] border-l border-(--landing-hair) p-5 text-sm font-semibold">
                    Persona
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="border-t border-(--landing-hair)">
                    <th className="bg-(--landing-canvas) p-5 text-sm font-medium text-(--landing-canvas-ink)">
                      {row.feature}
                    </th>
                    <td className="border-l border-(--landing-hair) bg-[color-mix(in_oklch,var(--landing-cyan-soft)_42%,var(--landing-canvas))] p-5 align-top text-sm leading-6 text-(--landing-canvas-ink-soft)">
                      {row.halo}
                    </td>
                    <td className="border-l border-(--landing-hair) bg-(--landing-canvas) p-5 align-top text-sm leading-6 text-(--landing-canvas-ink-soft)">
                      {row.persona}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col gap-3 text-xs leading-5 text-(--landing-canvas-mute) sm:flex-row sm:items-center sm:justify-between">
            <p>Last reviewed against public Persona documentation: August 2026.</p>
            <Link
              href="https://docs.withpersona.com/how-persona-works"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 underline decoration-(--landing-hair) underline-offset-4 hover:text-(--landing-canvas-ink)"
            >
              Read Persona&apos;s product overview
              <ExternalLink aria-hidden className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-(--landing-paper-soft) text-(--landing-ink)">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
          <div>
            <SectionMarker eyebrow="A safer migration" tone="paper" />
            <h2 className="font-display mt-5 text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">
              Switch one workflow, not your whole program.
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-(--landing-ink-soft)">
              A clean migration runs both systems side by side. Start with one
              representative flow, compare the outcomes, then move traffic only
              when your team trusts the result.
            </p>
          </div>

          <ol className="grid gap-px overflow-hidden rounded-xl border border-(--landing-paper-edge) bg-(--landing-paper-edge)">
            {[
              [
                "Rebuild one policy",
                "Match the checks, minimum age, and review threshold for one production workflow.",
              ],
              [
                "Run a parallel sample",
                "Compare completion, review volume, false rejects, and webhook handling with the same test cohort.",
              ],
              [
                "Move traffic deliberately",
                "Cut over that workflow, watch the audit trail, and keep a rollback window before migrating the next one.",
              ],
            ].map(([title, body], index) => (
              <li
                key={title}
                className="grid gap-5 bg-(--landing-paper) p-6 sm:grid-cols-[3rem_1fr] sm:p-8"
              >
                <span className="flex size-10 items-center justify-center rounded-full border border-(--landing-paper-edge) font-mono text-xs text-(--landing-stamp)">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-(--landing-ink-soft)">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-(--landing-hair) bg-(--landing-canvas)">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-14 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-10">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-(--landing-hair) bg-(--landing-canvas-edge) text-(--landing-cyan)">
              <ShieldCheck aria-hidden className="size-5" strokeWidth={1.5} />
            </span>
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-(--landing-cyan) uppercase">
                The honest recommendation
              </p>
              <p className="mt-2 max-w-3xl text-lg leading-7">
                Choose HaloKYC for a focused, platform-independent KYC stack.
                Choose Persona when platform-specific native capture tooling or
                broad identity automation matters more than a smaller operating
                surface.
              </p>
            </div>
          </div>
          <Link
            href="/product"
            className="group inline-flex items-center gap-2 text-sm font-medium text-(--landing-cyan) underline decoration-(--landing-hair) underline-offset-4"
          >
            See the HaloKYC product
            <MoveRight
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </section>

      <PricingSection index={4} />

      <PricingComparison />

      <section
        aria-labelledby="persona-faq-heading"
        className="border-t border-(--landing-hair) bg-(--landing-canvas-deep)"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.75fr_1.25fr] lg:px-10">
          <div>
            <SectionMarker eyebrow="FAQ" />
            <h2
              id="persona-faq-heading"
              className="font-display mt-5 text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl"
            >
              Before you change vendors.
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-7 text-(--landing-canvas-ink-soft)">
              The right answer depends on the workflows you already run and the
              integration modes your product cannot give up.
            </p>
          </div>

          <div className="border-t border-(--landing-hair)">
            {FAQS.map((item) => (
              <details
                key={item.question}
                className="group border-b border-(--landing-hair)"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-[15px] font-medium marker:hidden focus-visible:ring-2 focus-visible:ring-(--landing-cyan) focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span
                    aria-hidden
                    className="text-xl font-light text-(--landing-canvas-mute) transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pb-5 pr-10 text-sm leading-6 text-(--landing-canvas-ink-soft)">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-(--landing-hair) bg-(--landing-canvas)">
        <div aria-hidden className="landing-grid-soft absolute inset-0 opacity-10" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-24 text-center sm:px-8 sm:py-32 lg:px-10">
          <p className="font-mono text-[10px] tracking-[0.22em] text-(--landing-cyan) uppercase">
            Test the smaller stack
          </p>
          <h2 className="font-display mt-5 max-w-4xl text-4xl leading-tight font-medium tracking-[-0.04em] sm:text-6xl">
            Rebuild one Persona flow in HaloKYC.
          </h2>
          <p className="mt-6 max-w-2xl text-[15px] leading-7 text-(--landing-canvas-ink-soft)">
            Use the free sandbox, run the same test cases, and compare what your
            developers and reviewers actually have to operate.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <CtaLink href="/login">Create a free workspace</CtaLink>
            <CtaLink href="https://docs.halokyc.com/" secondary>
              Read the API docs
            </CtaLink>
          </div>
          <div className="mt-12 grid w-full max-w-3xl gap-4 border-t border-(--landing-hair) pt-6 text-left sm:grid-cols-3">
            {["1,000 free credits / month", "No annual commitment", "Signed webhook results"].map(
              (item) => (
                <p
                  key={item}
                  className="flex items-center gap-2 text-sm text-(--landing-canvas-ink-soft)"
                >
                  <Check
                    aria-hidden
                    className="size-4 shrink-0 text-(--landing-cyan)"
                  />
                  {item}
                </p>
              ),
            )}
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
}
