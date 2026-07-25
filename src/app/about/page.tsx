import type { Metadata } from "next";
import { ArrowLeft, Building2, FileText, MapPin, Shield, Users } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { publicEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "About HaloKYC",
  description:
    "Learn about HaloKYC's mission, team, and approach to building trustworthy identity verification infrastructure for developers.",
  metadataBase: new URL(publicEnv.siteUrl),
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About HaloKYC | HaloKYC",
    description:
      "Learn about HaloKYC's mission, team, and approach to building trustworthy identity verification infrastructure for developers.",
    type: "website",
    url: "/about",
    siteName: "HaloKYC",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--landing-canvas)] text-[var(--landing-canvas-ink)] selection:bg-[var(--landing-cyan)] selection:text-[var(--landing-canvas)]">
      <div className="absolute top-8 left-8 z-10">
        <Link
          href="/"
          className="group flex items-center gap-2 text-sm font-medium text-[var(--landing-canvas-ink-soft)] transition-colors hover:text-[var(--landing-canvas-ink)]"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to home
        </Link>
      </div>

      <main className="mx-auto max-w-4xl px-6 py-24 sm:px-8 lg:py-32">
        <header className="mb-16 text-center">
          <BrandLogo variant="wordmark-light" className="mx-auto mb-6 h-10 w-44" />
          <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">
            About HaloKYC
          </h1>
          <p className="mt-4 text-[var(--landing-canvas-ink-soft)] max-w-2xl mx-auto">
            We build identity verification infrastructure that developers trust and users
            barely notice.
          </p>
        </header>

        <div className="space-y-16">
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-medium text-[var(--landing-canvas-ink)]">
              Why we exist
            </h2>
            <div className="prose prose-invert max-w-none text-[var(--landing-canvas-ink-soft)]">
              <p>
                Identity verification has become a bottleneck for modern products. The
                choices used to be: integrate a complex enterprise vendor with
                months-long procurement, or build it yourself and take on compliance,
                fraud, and operational risk you didn&apos;t sign up for.
              </p>
              <p>
                HaloKYC was created to give developers a third option: a practical,
                developer-first API that handles the hard parts of verification&mdash;document
                OCR, liveness detection, face matching, duplicate detection, risk
                scoring&mdash;while keeping your team in control of the final decision.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-medium text-[var(--landing-canvas-ink)]">
              Our principles
            </h2>
            <ul className="grid gap-6 sm:grid-cols-2">
              <li className="rounded-xl border border-[var(--landing-hair)] bg-[var(--landing-paper)] p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-[var(--landing-cyan)]/10 p-2 text-[var(--landing-cyan)]">
                    <Shield className="size-5" aria-hidden />
                  </div>
                  <h3 className="font-semibold text-[var(--landing-canvas-ink)]">
                    Developer experience first
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-[var(--landing-canvas-ink-soft)]">
                  One API, clear documentation, sandbox environment, and no sales calls
                  required to start testing. You should be able to ship verification in
                  an afternoon, not a quarter.
                </p>
              </li>
              <li className="rounded-xl border border-[var(--landing-hair)] bg-[var(--landing-paper)] p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-[var(--landing-cyan)]/10 p-2 text-[var(--landing-cyan)]">
                    <FileText className="size-5" aria-hidden />
                  </div>
                  <h3 className="font-semibold text-[var(--landing-canvas-ink)]">
                    Human control over automation
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-[var(--landing-canvas-ink-soft)]">
                  Our AI handles the repetitive checks. Your team makes the judgment calls.
                  Every decision is auditable, attributable, and reversible.
                </p>
              </li>
              <li className="rounded-xl border border-[var(--landing-hair)] bg-[var(--landing-paper)] p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-[var(--landing-cyan)]/10 p-2 text-[var(--landing-cyan)]">
                    <Building2 className="size-5" aria-hidden />
                  </div>
                  <h3 className="font-semibold text-[var(--landing-canvas-ink)]">
                    Transparent pricing
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-[var(--landing-canvas-ink-soft)]">
                  One credit = one completed verification. No per-check fees, no annual
                  contracts, no surprise invoices. Start free, scale on demand.
                </p>
              </li>
              <li className="rounded-xl border border-[var(--landing-hair)] bg-[var(--landing-paper)] p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-[var(--landing-cyan)]/10 p-2 text-[var(--landing-cyan)]">
                    <Users className="size-5" aria-hidden />
                  </div>
                  <h3 className="font-semibold text-[var(--landing-canvas-ink)]">
                    Privacy by design
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-[var(--landing-canvas-ink-soft)]">
                  Biometric data never leaves your workspace boundary. We process
                  evidence in-memory, store only what&apos;s necessary, and delete
                  automatically on schedule.
                </p>
              </li>
            </ul>
          </section>

          <section className="space-y-6 pt-8 border-t border-[var(--landing-hair)]">
            <h2 className="font-serif text-2xl font-medium text-[var(--landing-canvas-ink)]">
              Company details
            </h2>
            <dl className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <dt className="font-mono text-[10px] tracking-[0.22em] text-[var(--landing-canvas-mute)] uppercase">
                  Legal entity
                </dt>
                <dd className="text-[var(--landing-canvas-ink)]">HaloKYC Technologies Pvt. Ltd.</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-mono text-[10px] tracking-[0.22em] text-[var(--landing-canvas-mute)] uppercase">
                  Registered address
                </dt>
                <dd className="text-[var(--landing-canvas-ink)]">
                  Mumbai, Maharashtra, India
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="font-mono text-[10px] tracking-[0.22em] text-[var(--landing-canvas-mute)] uppercase">
                  Founded
                </dt>
                <dd className="text-[var(--landing-canvas-ink)]">2025</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-mono text-[10px] tracking-[0.22em] text-[var(--landing-canvas-mute)] uppercase">
                  Team size
                </dt>
                <dd className="text-[var(--landing-canvas-ink)]">8 (and growing)</dd>
              </div>
            </dl>
          </section>

          <section className="space-y-6 pt-8 border-t border-[var(--landing-hair)]">
            <h2 className="font-serif text-2xl font-medium text-[var(--landing-canvas-ink)]">
              Contact
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <a
                href="mailto:hello@halokyc.com"
                className="p-4 rounded-lg border border-[var(--landing-canvas-ink-soft)] opacity-80 hover:opacity-100 transition-opacity"
              >
                <p className="font-medium text-[var(--landing-canvas-ink)]">General & Business</p>
                <p className="mt-1 text-sm text-[var(--landing-canvas-ink-soft)]">hello@halokyc.com</p>
              </a>
              <a
                href="mailto:privacy@halokyc.com"
                className="p-4 rounded-lg border border-[var(--landing-canvas-ink-soft)] opacity-80 hover:opacity-100 transition-opacity"
              >
                <p className="font-medium text-[var(--landing-canvas-ink)]">Privacy & Data Rights</p>
                <p className="mt-1 text-sm text-[var(--landing-canvas-ink-soft)]">privacy@halokyc.com</p>
              </a>
              <a
                href="mailto:security@halokyc.com"
                className="p-4 rounded-lg border border-[var(--landing-canvas-ink-soft)] opacity-80 hover:opacity-100 transition-opacity"
              >
                <p className="font-medium text-[var(--landing-canvas-ink)]">Security</p>
                <p className="mt-1 text-sm text-[var(--landing-canvas-ink-soft)]">security@halokyc.com</p>
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}