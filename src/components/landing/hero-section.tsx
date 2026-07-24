"use client";

/**
 * Hero - the page opener.
 *
 * Forest canvas with a Manrope display headline, direct actions,
 * operational proof points, and a human verification photo mosaic.
 */

import {
  ArrowRight,
  Braces,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

import { HumanVerificationMosaic } from "@/components/landing/human-verification-mosaic";
import { SectionMarker } from "@/components/landing/section-marker";
import { cn } from "@/lib/utils";

const DOSSIER_ROWS: ReadonlyArray<readonly [string, string]> = [
  ["workflow", "standard_kyc_v3"],
  ["services", "selfie + document + age"],
  ["decision", "approved"],
  ["webhook", "200 · signed"],
];

const CHECKS: ReadonlyArray<readonly [string, string]> = [
  ["liveness", "pass · 0.91"],
  ["face_match", "0.82"],
  ["age_rule", "18+"],
  ["duplicate", "clear"],
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
};

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section
      id="product"
      aria-labelledby="hero-headline"
      className="relative isolate overflow-hidden bg-(--landing-canvas) text-(--landing-canvas-ink)"
    >
      {/* Quiet tonal depth keeps the hero expressive without competing with the photography. */}
      <div
        aria-hidden
        className="landing-grid-soft absolute inset-0 opacity-[0.06]"
        style={{
          maskImage:
            "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="landing-halo pointer-events-none absolute top-[34%] right-[-18%] h-215 w-215 rounded-full bg-(--landing-cyan-soft) opacity-30 blur-3xl"
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative mx-auto grid w-full max-w-7xl gap-12 px-6 pt-20 pb-20 sm:px-8 md:grid-cols-[1fr_1fr] md:items-center md:gap-x-16 md:pt-28 md:pb-28 lg:px-10"
      >
        <div className="flex flex-col gap-9">
          <motion.div variants={fadeUp}>
            <SectionMarker
              index={1}
              eyebrow="The Trust Layer for your app"
              meta=""
            />
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col gap-6">
            <h1
              id="hero-headline"
              className={cn(
                "font-display max-w-5xl font-medium text-(--landing-canvas-ink)",
                "text-5xl leading-[0.95] tracking-[-0.04em]",
                "sm:text-6xl",
                "lg:text-7xl",
              )}
            >
              Stop fake users from
              <span className="block text-(--landing-cyan)">
                becoming your growth tax.
              </span>
            </h1>
            <p className="max-w-xl text-base leading-7 text-[var(--landing-canvas-ink-soft)] sm:text-lg">
              HaloKYC is the identity layer your team would have built — if you
              had the time. One API, practical AI checks, a review queue your
              team controls, and a signed result your backend trusts. Ship it
              this week.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center gap-3"
          >
            <Link
              href="/login"
              className={cn(
                "group inline-flex h-12 items-center gap-2 rounded-md px-6 text-sm font-medium",
                "bg-[var(--landing-cyan)] text-[var(--landing-canvas)]",
                "transition-colors hover:bg-[color-mix(in_oklch,var(--landing-cyan)_88%,white)]",
                "focus-visible:ring-2 focus-visible:ring-[var(--landing-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-canvas)] focus-visible:outline-none",
              )}
            >
              Start free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/console"
              className={cn(
                "inline-flex h-12 items-center gap-2 rounded-md px-5 text-sm font-medium",
                "border border-[var(--landing-hair)] bg-transparent text-[var(--landing-canvas-ink)]",
                "transition-colors hover:bg-[var(--landing-canvas-edge)]",
                "focus-visible:ring-2 focus-visible:ring-[var(--landing-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-canvas)] focus-visible:outline-none",
              )}
            >
              <Braces className="size-4" strokeWidth={1.75} />
              See how it works
            </Link>
          </motion.div>

          <motion.dl
            variants={fadeUp}
            className="grid max-w-xl grid-cols-3 gap-x-6 border-y border-[var(--landing-hair)] py-5"
          >
            {[
              ["Same day", "to first verification"],
              ["Zero vendors", "to wire and maintain"],
              ["One workflow ID", "to start"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-mono text-base font-medium text-[var(--landing-canvas-ink)] tabular-nums sm:text-lg">
                  {value}
                </dt>
                <dd className="mt-1.5 text-[11px] leading-snug text-[var(--landing-canvas-mute)]">
                  {label}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Signature poster: a "case file" typeset on dark canvas. */}
        <motion.div
          initial={
            reduce ? { opacity: 0 } : { opacity: 0, y: 22, scale: 0.985 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
          className="relative"
        >
          <HumanVerificationMosaic />
        </motion.div>
      </motion.div>
    </section>
  );
}

export function CaseFilePoster() {
  return (
    <article
      aria-label="Verification case file preview"
      className={cn(
        "relative mx-auto w-full max-w-xl overflow-hidden",
        "border border-[var(--landing-hair)] bg-[var(--landing-canvas-edge)]",
        "shadow-[0_40px_120px_-60px_rgba(0,0,0,0.85)]",
        "rounded-[1.25rem]",
      )}
    >
      {/* File header bar */}
      <header className="flex items-center justify-between border-b border-[var(--landing-hair)] px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-11 items-center justify-center rounded-md",
              "border border-[var(--landing-cyan-edge)] bg-[var(--landing-cyan-soft)] text-[var(--landing-cyan)]",
            )}
          >
            <FileCheck2 className="size-5" strokeWidth={1.5} />
          </span>
          <div>
            <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--landing-canvas-mute)] uppercase">
              Case file
            </p>
            <p className="font-sans text-sm font-medium tracking-tight">
              ver_8f41c2 · kyc_3a91
            </p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
            "border-[var(--landing-mint)] bg-[color-mix(in_oklch,var(--landing-mint)_18%,transparent)]",
            "font-mono text-[10px] tracking-[0.2em] text-[var(--landing-mint)] uppercase",
          )}
        >
          <CircleDot className="size-3" />
          approved
        </span>
      </header>

      <div className="grid md:grid-cols-[1.05fr_0.95fr]">
        {/* Policy manifest */}
        <section className="border-b border-[var(--landing-hair)] p-5 md:border-r md:border-b-0">
          <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--landing-canvas-mute)] uppercase">
            A · Policy manifest
          </p>
          <dl className="mt-4 flex flex-col gap-3">
            {DOSSIER_ROWS.map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-[80px_1fr] items-baseline gap-3 border-b border-dashed border-[var(--landing-hair)] pb-2 last:border-b-0"
              >
                <dt className="font-mono text-[10px] tracking-[0.18em] text-[var(--landing-canvas-mute)] uppercase">
                  {key}
                </dt>
                <dd className="truncate font-mono text-xs text-[var(--landing-canvas-ink)]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 rounded-md border border-[var(--landing-hair)] bg-[var(--landing-canvas)] p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--landing-canvas-mute)] uppercase">
                  B · Risk score
                </p>
                <p className="mt-1 font-mono text-5xl leading-none font-semibold text-[var(--landing-cyan)] tabular-nums">
                  18
                  <span className="ml-1 text-xs font-normal text-[var(--landing-canvas-mute)]">
                    / 100
                  </span>
                </p>
              </div>
              <ShieldCheck
                className="size-10 text-[var(--landing-mint)]"
                strokeWidth={1.5}
              />
            </div>
            <div
              aria-hidden
              className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[var(--landing-canvas-soft)]"
            >
              <span className="block h-full w-[18%] bg-[var(--landing-cyan)]" />
            </div>
          </div>
        </section>

        {/* Evidence packet */}
        <section className="p-5">
          <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--landing-canvas-mute)] uppercase">
            C · Evidence packet
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {CHECKS.map(([label, value]) => (
              <li
                key={label}
                className="flex items-center justify-between gap-3 border-b border-dashed border-[var(--landing-hair)] pb-2 last:border-b-0"
              >
                <span className="flex items-center gap-2 text-sm text-[var(--landing-canvas-ink-soft)]">
                  <CheckCircle2
                    className="size-4 text-[var(--landing-mint)]"
                    strokeWidth={2}
                  />
                  {label}
                </span>
                <span className="font-mono text-xs text-[var(--landing-canvas-ink)] tabular-nums">
                  {value}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-md border border-[var(--landing-hair)] bg-[var(--landing-canvas-soft)] p-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck
                className="size-4 text-[var(--landing-cyan)]"
                strokeWidth={1.75}
              />
              <p className="text-sm font-medium">Audit trail</p>
            </div>
            <p className="mt-2 font-mono text-[11px] leading-5 text-[var(--landing-canvas-ink-soft)]">
              workflow_selected →
              <br />
              evidence_uploaded →
              <br />
              checks_completed →
              <br />
              webhook_signed · 200
            </p>
          </div>
        </section>
      </div>

      {/* Footer with verdict stamp */}
      <footer className="relative flex items-center justify-between gap-4 border-t border-[var(--landing-hair)] px-5 py-4">
        <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--landing-canvas-mute)] uppercase">
          Issued 2026-06-29 14:02 · tenant: atlas_lab
        </p>
        <p
          className={cn(
            "inline-block -rotate-3 border-2 px-2.5 py-0.5 text-base font-bold uppercase",
            "landing-stamp tracking-[0.18em]",
            "border-[var(--landing-stamp)] text-[var(--landing-stamp)]",
          )}
        >
          approved
        </p>
      </footer>
    </article>
  );
}
