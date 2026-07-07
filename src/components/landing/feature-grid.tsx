/**
 * FeatureGrid - "Evidence primitives."
 *
 * Six "Capture", four "Decide", two "Notify" services arranged
 * on a dark canvas as a single 3x4 typographic grid. Each cell
 * carries a small symbol, a key, and a one-line body; cells sit
 * on a hairline grid that doubles as a visual texture. The first
 * row is reserved as a sticky-feeling column heading.
 */

import {
  Cake,
  ClipboardList,
  FileSignature,
  Gauge,
  IdCard,
  KeyRound,
  ScanFace,
  ScanText,
  Users,
  Webhook,
} from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { SectionMarker } from "@/components/landing/section-marker";
import { cn } from "@/lib/utils";

type Feature = readonly [string, string, typeof ScanText, string];

const FEATURES: readonly Feature[] = [
  [
    "document",
    "Document OCR",
    ScanText,
    "Name, DOB, issuing country, expiry — extracted once, structured for your review. Raw document numbers never stored in plain text.",
  ],
  [
    "selfie",
    "Selfie capture",
    ScanFace,
    "Guided camera flow with file fallback. Biometric frames are never persisted outside the session that created them.",
  ],
  [
    "face_match",
    "Face match",
    IdCard,
    "Confirms the selfie belongs to the person in the ID. Tenant-scoped. A clear path to manual review when the AI is uncertain.",
  ],
  [
    "age",
    "Age rule",
    Cake,
    "Set a minimum per workflow. Under-age results are terminal rejects with an auditable reason.",
  ],
  [
    "duplicate",
    "Duplicate search",
    Users,
    "Catches repeat faces across your verified users. Cross-workspace biometric leakage does not happen.",
  ],
  [
    "risk",
    "Risk decision",
    Gauge,
    "Collapses check outcomes into a score, a status, and a reason your team reads. Not a black box.",
  ],
  [
    "review",
    "Review queue",
    ClipboardList,
    "Resolve uncertain sessions with evidence, check results, and the ability to approve or reject with a required reason.",
  ],
  [
    "webhook",
    "Signed callback",
    Webhook,
    "Final result delivered to your backend with an HMAC signature and a retry record. Your server verifies; no trust on faith.",
  ],
  [
    "audit",
    "Audit trail",
    FileSignature,
    "Every approve, reject, and retry is logged with the actor, the evidence they saw, and the timestamp.",
  ],
  [
    "policy",
    "Workflow policy",
    KeyRound,
    "The workflow you define in the dashboard is the only source of truth the engine consults. No hidden rules. No configuration drift.",
  ],
];

export function FeatureGrid() {
  return (
    <section
      aria-labelledby="features-headline"
      className="relative bg-[var(--landing-canvas)] text-[var(--landing-canvas-ink)]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-10">
        <Reveal className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionMarker
              index={3}
              eyebrow="Evidence primitives"
              meta="10 services · 1 contract"
            />
            <h2
              id="features-headline"
      className={cn(
        "font-display font-medium text-4xl leading-tight tracking-[-0.03em]",
        "sm:text-5xl",
      )}
            >
              The checks are{" "}
              <span className="text-(--landing-cyan) italic">modular.</span> The
              record is continuous.
            </h2>
          </div>
          <p className="max-w-xl text-[15.5px] leading-7 text-[var(--landing-canvas-ink-soft)]">
            Build each verification from workflow services, then read the result
            as one audited case file. The UI and API both show the same source
            of truth: checks, score, decision, and callback status.
          </p>
        </Reveal>

        <div className="mt-14 grid border border-[var(--landing-hair)] sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(([key, title, Icon, body], index) => (
            <Reveal
              key={key}
              delay={0.035 * index}
              className={cn(
                "min-h-64 border-t border-[var(--landing-hair)] bg-[var(--landing-canvas-edge)] p-6",
                "sm:border-l sm:[&:nth-child(2n+1)]:border-l-0",
                "lg:[&:nth-child(-n+4)]:border-t-0 lg:[&:nth-child(2n+1)]:border-l lg:[&:nth-child(4n+1)]:border-l-0",
              )}
            >
              <article className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-md",
                      "border border-[var(--landing-hair)] bg-[var(--landing-canvas)] text-[var(--landing-cyan)]",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={1.5} />
                  </span>
                  <span
                    aria-hidden
                    className="font-mono text-[10px] tracking-[0.22em] text-[var(--landing-canvas-mute)] uppercase"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--landing-canvas-mute)] uppercase">
                    {key}
                  </p>
                  <h3 className="mt-1.5 text-base font-semibold tracking-tight">
                    {title}
                  </h3>
                </div>
                <p className="text-[13.5px] leading-6 text-[var(--landing-canvas-ink-soft)]">
                  {body}
                </p>
                <span className="mt-auto pt-2 font-mono text-[10px] tracking-[0.22em] text-[var(--landing-cyan)] uppercase">
                  logged in audit trail
                </span>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
