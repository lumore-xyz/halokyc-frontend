/**
 * LandingFooter - the marketing-only footer.
 *
 * Dark canvas, four columns on desktop (Product / Developers /
 * Company / Legal) plus a masthead strip on top. Stacks on
 * mobile. A small 'system status' ticker row at the very bottom
 * (decorative status text - no fake metrics).
 */

import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Product overview", href: "/product" },
      { label: "Workflow", href: "/workflow" },
      { label: "Security", href: "/security" },
      // { label: "Review controls", href: "/product" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Credits", href: "/developers" },
      { label: "Documentation", href: "https://docs.halokyc.com/" },
      // { label: "API reference", href: "https://docs.halokyc.com/" },
      // { label: "Quickstart", href: "https://docs.halokyc.com/" },
      // { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "mailto:hello@halokyc.dev" },
      // { label: "About", href: "/about" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Data retention", href: "/data-retention" },
    ],
  },
] as const;

const TICKER = [
  "workflow · standard_kyc_v3",
  "checks · 10 services online",
  "webhook · HMAC-SHA256",
  "audit · JSONL · 30-day retention",
  "policy · ISO-aligned construction",
  "support · founders@ inbox",
];

export function LandingFooter() {
  return (
    <footer className="relative border-t border-[var(--landing-hair)] bg-[var(--landing-canvas)] text-[var(--landing-canvas-ink-soft)]">
      <div className="overflow-hidden border-b border-[var(--landing-hair)]">
        <div className="landing-ticker flex w-max gap-12 py-3 font-mono text-[11px] tracking-[0.22em] whitespace-nowrap text-[var(--landing-canvas-mute)] uppercase">
          {[...TICKER, ...TICKER].map((line, i) => (
            <span key={i} className="flex items-center gap-3">
              <span className="block size-1 rounded-full bg-[var(--landing-cyan)]" />
              {line}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_3fr]">
          <div>
            <Link
              href="/"
              className="flex items-center"
              aria-label="HaloKYC home"
            >
              <BrandLogo variant="wordmark-light" className="h-9 w-36" />
            </Link>
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-[var(--landing-canvas-ink-soft)]">
              Low-cost identity verification for startups that need trust, not
              enterprise complexity.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
              {[["Built in", "Mumbai, India"]].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5">
                  <dt className="font-mono text-[10px] tracking-[0.22em] text-[var(--landing-canvas-mute)] uppercase">
                    {k}
                  </dt>
                  <dd className="text-[13px] text-[var(--landing-canvas-ink)]">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {COLUMNS.map((col, i) => (
              <div key={col.title}>
                <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--landing-canvas-mute)] uppercase">
                  {String(i + 1).padStart(2, "0")} · {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className={cn(
                          "text-sm text-[var(--landing-canvas-ink-soft)]",
                          "transition-colors hover:text-[var(--landing-canvas-ink)]",
                        )}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--landing-hair)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--landing-canvas-mute)] uppercase">
            (c) 2026 HaloKYC — Built for developers who need trust
            infrastructure without enterprise drag
          </p>
          <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--landing-canvas-mute)]">
            v0.1.0 · halokyc.com
          </p>
        </div>
      </div>
    </footer>
  );
}
