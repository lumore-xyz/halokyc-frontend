import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";

export default function RetentionPage() {
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

      <main className="mx-auto max-w-3xl px-6 py-24 sm:px-8 lg:py-32">
        <header className="mb-16 text-center">
          <BrandLogo
            variant="wordmark-light"
            className="mx-auto mb-6 h-10 w-44"
          />
          <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">Data Retention Policy</h1>
          <p className="mt-4 text-[var(--landing-canvas-ink-soft)]">Last updated: June 24, 2026</p>
        </header>

        <div className="space-y-12 text-sm leading-relaxed text-[var(--landing-canvas-ink-soft)]">
          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">1. Retention Philosophy</h2>
            <p>
              We adhere to the principle of data minimization. We only store verification artifacts for as long as 
               necessary to fulfill the verification request and support the Client&apos;s compliance requirements.

            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">2. Storage Timelines</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg border border-[var(--landing-hair)] bg-white/[0.02]">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--landing-canvas-mute)] mb-2">Temporary Storage</p>
                <p className="text-[var(--landing-canvas-ink)] font-medium">30 Days</p>
                <p className="text-xs mt-1">Verification artifacts are kept for 30 days to allow Clients to review results.</p>
              </div>
              <div className="p-4 rounded-lg border border-[var(--landing-hair)] bg-white/[0.02]">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--landing-canvas-mute)] mb-2">Compliance Archive</p>
                <p className="text-[var(--landing-canvas-ink)] font-medium">Optional / Per Request</p>
                <p className="text-xs mt-1">Extended storage is available upon request for regulatory compliance (KYC/AML).</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">3. Deletion Process</h2>
            <p>
              Once the retention period expires, data is cryptographically erased from our primary databases 
              and marked for deletion in backups. Clients may request the immediate deletion of specific 
              verification sessions via the API.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">4. Legal Holds</h2>
            <p>
              Notwithstanding the above, we may retain data longer if required by a valid legal order, 
              court subpoena, or to prevent fraud and security threats.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
