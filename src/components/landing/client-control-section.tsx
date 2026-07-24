/**
 * ClientControlSection - "Keep control of how verification works in your product."
 *
 * Dark canvas with a serif editorial headline on the left and a
 * receipt-style 'Client Workspace' preview on the right. The
 * preview is a single paper-toned card with three sections
 * (policy / review decision / actions) and a verdict stamp at
 * the bottom-right that reads 'REVIEW'.
 */

"use client";

import { Check, KeyRound, SlidersHorizontal, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Reveal } from "@/components/landing/reveal";
import { SectionMarker } from "@/components/landing/section-marker";
import { cn } from "@/lib/utils";

const CONTROLS: ReadonlyArray<readonly [string, string]> = [
  ["workflow", "standard_kyc_v3"],
  ["services", "selfie + document + age"],
  ["minimum_age", "21"],
  ["decision_mode", "review if uncertain"],
];

const EVIDENCE: ReadonlyArray<readonly [string, string]> = [
  ["OCR", "Passed"],
  ["Liveness", "Passed"],
  ["Face match", "Needs decision"],
  ["Duplicate", "Clear"],
];

export function ClientControlSection() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-labelledby="control-headline"
      className="relative bg-[var(--landing-canvas)] text-[var(--landing-canvas-ink)]"
    >
      <div
        aria-hidden
        className="landing-grid-soft absolute inset-0 opacity-[0.12]"
      />
      <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-6 py-24 sm:px-8 sm:py-32 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:px-10">
        <Reveal className="flex flex-col gap-6">
          <SectionMarker
            index={7}
            eyebrow="Your rules, your decisions"
            meta="Workspace · tenant-scoped"
          />
          <h2
            id="control-headline"
            className={cn(
"font-display font-medium tracking-[-0.03em]",
      "text-4xl leading-tight",
      "sm:text-5xl",
            )}
          >
            Keep control of how{" "}
            <span className="text-[var(--landing-cyan)]">
              verification works
            </span>{" "}
            in your product.
          </h2>
          <p className="max-w-xl text-[15.5px] leading-relaxed text-[var(--landing-canvas-ink-soft)]">
            Define which checks run, set the age gate, issue your own API keys,
            and decide the edge cases from your workspace. HaloKYC supplies the
            evidence and audit trail; your team keeps the final operating
            control.
          </p>

          <ul className="grid grid-cols-1 gap-3 border-t border-[var(--landing-hair)] pt-6">
            {[
              "Choose the verification workflow before a session starts",
              "Turn checks on or off without changing the capture code",
              "Approve or reject unclear sessions from your review queue",
              "Receive signed results your backend can verify",
            ].map((line, i) => (
              <li
                key={line}
                className="flex items-start gap-3 text-[14.5px] leading-relaxed text-[var(--landing-canvas-ink-soft)]"
              >
                <span
                  className={cn(
                    "mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full",
                    "border border-[var(--landing-cyan-edge)] bg-[var(--landing-cyan-soft)] text-[var(--landing-cyan)]",
                  )}
                >
                  <span className="font-mono text-[10px] leading-none font-medium">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <motion.article
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative mx-auto w-full max-w-md",
              "border border-[var(--landing-paper-edge)] bg-[var(--landing-paper)]",
              "font-mono text-[12.5px] leading-relaxed text-[var(--landing-ink)]",
              "shadow-[0_28px_70px_-32px_rgba(0,0,0,0.7)]",
              "rounded-[1.25rem]",
            )}
            aria-label="Client workspace preview"
          >
            <header className="flex items-baseline justify-between border-b border-dashed border-[var(--landing-rule)] px-5 pt-5 pb-2.5">
              <div>
                <p className="text-[10px] tracking-[0.22em] text-[color-mix(in_oklch,var(--landing-ink)_55%,transparent)] uppercase">
                  Client workspace
                </p>
                <p className="mt-0.5 font-sans text-sm font-semibold tracking-tight">
                  Verification controls
                </p>
              </div>
              <SlidersHorizontal
                className="size-5 text-[var(--landing-stamp)]"
                strokeWidth={1.5}
              />
            </header>

            <section className="border-b border-dashed border-[var(--landing-rule)] px-5 py-4">
              <div className="flex items-center gap-2">
                <KeyRound
                  className="size-4 text-[var(--landing-stamp)]"
                  strokeWidth={1.5}
                />
                <p className="text-[10px] tracking-[0.22em] text-[color-mix(in_oklch,var(--landing-ink)_55%,transparent)] uppercase">
                  A · Policy settings
                </p>
              </div>
              <dl className="mt-3 space-y-2.5">
                {CONTROLS.map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[1fr_auto] items-baseline gap-4"
                  >
                    <dt className="text-[11px] tracking-[0.18em] text-[color-mix(in_oklch,var(--landing-ink)_55%,transparent)] uppercase">
                      {label}
                    </dt>
                    <dd className="text-right text-[11px] font-semibold tabular-nums">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="px-5 py-4">
              <p className="text-[10px] tracking-[0.22em] text-[color-mix(in_oklch,var(--landing-ink)_55%,transparent)] uppercase">
                B · Review decision
              </p>
              <ul className="mt-2.5 space-y-2">
                {EVIDENCE.map(([key, status]) => (
                  <li
                    key={key}
                    className="flex items-center justify-between border-b border-dashed border-[var(--landing-rule)] pb-1.5 text-[11px] last:border-b-0"
                  >
                    <span className="tracking-[0.14em] uppercase">{key}</span>
                    <span
                      className={cn(
                        "font-semibold tracking-[0.12em] uppercase",
                        status === "Needs decision"
                          ? "text-[var(--landing-signal)]"
                          : "text-[var(--landing-stamp)]",
                      )}
                    >
                      {status}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <footer className="grid grid-cols-2 gap-3 border-t border-dashed border-[var(--landing-rule)] p-4">
              <button
                type="button"
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-full text-sm font-medium",
                  "border border-[var(--landing-cyan-edge)] bg-[var(--landing-cyan)] text-[var(--landing-canvas)]",
                  "transition-colors hover:bg-[var(--landing-cyan-hover,var(--landing-cyan-edge))]",
                  "focus-visible:ring-2 focus-visible:ring-[var(--landing-stamp)] focus-visible:outline-none",
                )}
              >
                <Check className="size-4" strokeWidth={2} />
                Approve
              </button>
              <button
                type="button"
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-full text-sm font-medium",
                  "border border-[color-mix(in_oklch,var(--landing-ink)_25%,transparent)] bg-transparent text-[var(--landing-ink)]",
                  "transition-colors hover:bg-[var(--landing-rule)]",
                  "focus-visible:ring-2 focus-visible:ring-[var(--landing-ink)] focus-visible:outline-none",
                )}
              >
                <X className="size-4" strokeWidth={2} />
                Reject
              </button>
              <span
                aria-hidden
                className={cn(
                  "col-span-2 mt-1 inline-block -rotate-3 self-end justify-self-end",
                  "landing-stamp border-2 px-2 py-0.5 text-base font-bold tracking-[0.16em] uppercase",
                  "border-[var(--landing-signal)] text-[var(--landing-signal)]",
                )}
              >
                review
              </span>
            </footer>
          </motion.article>
        </Reveal>
      </div>
    </section>
  );
}
