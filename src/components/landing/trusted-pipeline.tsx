"use client";

/**
 * TrustedPipeline - a horizontal "operating loop" strip.
 *
 * Three numbered stations that double as the page's table of
 * contents: account, workflow, user flow. Dark-hairline border
 * under a soft gradient, oversized numerals in mono set against
 * a tiny eyebrow so the strip reads as a single typographic
 * instrument.
 */

import { motion, useReducedMotion } from "motion/react";
import { KeyRound, RadioTower, UserRoundCheck } from "lucide-react";

import { cn } from "@/lib/utils";

type Loop = {
  index: string;
  label: string;
  title: string;
  body: string;
  icon: typeof KeyRound;
};

const LOOPS: readonly Loop[] = [
  {
    index: "01",
    label: "Your workspace",
    title: "Set the rules once",
    body: "Pick which checks run, set the age gate, and configure your review queue. The workflow you save is the policy your product enforces.",
    icon: KeyRound,
  },
  {
    index: "02",
    label: "Your user flow",
    title: "Send us the user",
    body: "One API call or a deep link sends the user through your workflow. We capture the evidence; you get a signed result back.",
    icon: RadioTower,
  },
  {
    index: "03",
    label: "Your backend",
    title: "Use the result",
    body: "A signed webhook or API call gives you approved, rejected, or needs-review — with a reason you can show your team.",
    icon: UserRoundCheck,
  },
];

export function TrustedPipeline() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-label="HaloKYC operating loop"
      className="relative border-y border-[var(--landing-hair)] bg-[var(--landing-canvas-edge)] text-[var(--landing-canvas-ink)]"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-px px-6 py-2 sm:px-8 md:grid-cols-3 lg:px-10">
        {LOOPS.map((loop, index) => {
          const Icon = loop.icon;
          return (
            <motion.article
              key={loop.label}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.5,
                delay: reduce ? 0 : index * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(
                "grid grid-cols-[56px_1fr] items-start gap-5 border-t border-[var(--landing-hair)] py-7 first:border-t-0",
                "md:border-t-0 md:border-l md:px-7 md:first:border-l-0 md:first:pl-0",
              )}
            >
              <span
                aria-hidden
                className="font-mono text-[40px] font-medium leading-none tabular-nums text-[var(--landing-canvas-mute)]"
              >
                {loop.index}
              </span>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Icon
                    className="size-4 text-[var(--landing-cyan)]"
                    strokeWidth={1.75}
                  />
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--landing-cyan)]">
                    {loop.label}
                  </p>
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-[var(--landing-canvas-ink)]">
                  {loop.title}
                </h2>
                <p className="text-sm leading-6 text-[var(--landing-canvas-ink-soft)]">
                  {loop.body}
                </p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
