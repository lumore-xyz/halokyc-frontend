/**
 * WorkflowSection - "Every verification follows the same auditable route."
 *
 * Dark canvas with a single vertical spine on the left edge and
 * 6 stops along it; each stop gets a number, an icon, and a
 * sentence. The diagonal hatching and the spine are the only
 * decoration - the section's voice comes from its typography.
 */

import {
  Camera,
  ClipboardCheck,
  FileKey2,
  Gauge,
  Route,
  Webhook,
} from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { SectionMarker } from "@/components/landing/section-marker";
import { cn } from "@/lib/utils";

type Step = readonly [string, string, string, typeof Route];

const STEPS: readonly Step[] = [
  ["01", "Design policy", "Client chooses selfie, liveness, document, age, and thresholds in a workflow.", Route],
  ["02", "Start session", "Backend sends external_user_id, workflow_id, and optional callback_url.", FileKey2],
  ["03", "Capture evidence", "User completes only the screens required by that workflow.", Camera],
  ["04", "Run checks", "Worker runs OCR, face match, liveness, duplicate, and age as needed.", Gauge],
  ["05", "Resolve decision", "Approved, rejected, or manual_review with a readable risk reason.", ClipboardCheck],
  ["06", "Notify app", "Final result is sent through a signed webhook and remains available by API.", Webhook],
];

export function WorkflowSection() {
  return (
    <section
      id="workflow"
      aria-labelledby="workflow-headline"
      className="relative isolate overflow-hidden bg-[var(--landing-canvas)] text-[var(--landing-canvas-ink)]"
    >
      <div
        aria-hidden
        className="absolute inset-0 landing-stripe opacity-[0.05]"
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-10">
        <Reveal className="grid max-w-4xl gap-6">
          <SectionMarker
            index={5}
            eyebrow="Policy → verdict"
            meta="Six steps · sequential"
          />
          <h2
            id="workflow-headline"
            className={cn(
"font-display font-medium tracking-[-0.03em]",
      "text-4xl leading-tight",
      "sm:text-5xl",
            )}
          >
            Every verification follows the same{" "}
            <span className="italic text-[var(--landing-cyan)]">auditable route.</span>
          </h2>
          <p className="text-[15.5px] leading-7 text-[var(--landing-canvas-ink-soft)]">
            The flow is sequential because accountability is sequential:
            define the rule, collect evidence, run checks, write the result,
            then notify the product that asked for it.
          </p>
        </Reveal>

        <ol className="relative mt-16 grid gap-0 border border-[var(--landing-hair)] md:grid-cols-2 lg:grid-cols-3">
          {STEPS.map(([n, title, body, Icon], index) => (
            <Reveal
              key={n}
              as="li"
              delay={0.04 * index}
              className={cn(
                "relative min-h-72 border-t border-[var(--landing-hair)] bg-[var(--landing-canvas-edge)] p-6",
                "md:border-l md:[&:nth-child(2n+1)]:border-l-0",
                "lg:[&:nth-child(-n+3)]:border-t-0 lg:[&:nth-child(2n+1)]:border-l lg:[&:nth-child(3n+1)]:border-l-0",
              )}
            >
              <article className="flex h-full flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--landing-cyan)]">
                    Step {n}
                  </span>
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-md",
                      "border border-[var(--landing-cyan-edge)] bg-[var(--landing-cyan-soft)] text-[var(--landing-cyan)]",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={1.5} />
                  </span>
                </div>
                <h3 className="font-sans text-xl font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="text-[14px] leading-6 text-[var(--landing-canvas-ink-soft)]">
                  {body}
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--landing-canvas-mute)]">
                  <span className="block size-1 rounded-full bg-[var(--landing-cyan)]" />
                  persisted event
                </span>
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
