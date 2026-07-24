/**
 * ApiSection - "Start with a workflow ID. Finish with a signed decision."
 *
 * Warm paper "documentation" spread: an editorial headline on the
 * left, an annotated code block + JSON payload + signed-fields
 * card on the right. Header rows sit on a thin rule; the verdict
 * stamp at the bottom of the right column carries the section's
 * tonal weight.
 */

import { MultiFileCodeBlock } from "@/components/ui/code-block";
import { Reveal } from "@/components/landing/reveal";
import { SectionMarker } from "@/components/landing/section-marker";
import { cn } from "@/lib/utils";

const FILES = [
  {
    filename: "start-verification.ts",
    language: "typescript",
    code: `const session = await fetch("/api/v1/verifications/start", {
  method: "POST",
  headers: {
    "X-API-Key": process.env.HALOKYC_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    external_user_id: "user_123",
    workflow_id: "wf_standard_kyc",
    callback_url: "https://app.example.com/hooks/kyc",
    metadata: {
      source: "onboarding",
      signup_date: "2026-07-01",
      account_age_days: 2,
    },
  }),
});

const { verification_id } = await session.json();
// → send user to /verify?verification_id=<id>
// → wait for signed webhook, or poll GET /verifications/{id}`,
  },
  {
    filename: "response.json",
    language: "json",
    code: `{
  "verification_id": "ver_8f41c2",
  "external_user_id": "user_123",
  "status": "approved",
  "risk_score": 18,
  "decision_reason": "All required checks passed",
  "checks": {
    "ocr":        { "status": "pass" },
    "face_match": { "status": "pass", "score": 0.82 },
    "liveness":   { "status": "pass", "score": 0.91 },
    "age":        { "status": "pass" },
    "duplicate":  { "status": "pass" }
  }
}`,
  },
  {
    filename: "webhook-headers.txt",
    language: "text",
    code: `X-HaloKYC-Event:   verification.completed
X-HaloKYC-Sig:    sha256=9e2b…07c
X-HaloKYC-Delivery: 4f7a…21b`,
  },
];

export function ApiSection() {
  return (
    <section
      id="developers"
      aria-labelledby="api-headline"
      className="relative bg-(--landing-paper) text-[var(--landing-ink)]"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-24 sm:px-8 sm:py-32 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:px-10">
        <Reveal className="flex flex-col gap-6">
          <SectionMarker
            index={4}
            eyebrow="Current contract"
            meta="REST · JSON · HMAC"
            tone="paper"
          />
          <h2
            id="api-headline"
            className={cn(
              "font-display font-medium tracking-[-0.03em]",
              "text-4xl leading-tight",
              "sm:text-5xl",
            )}
          >
            Start with a{" "}
            <span className="text-[var(--landing-stamp)]">
              workflow ID.
            </span>{" "}
            Finish with a signed decision.
          </h2>
          <p className="max-w-xl text-[15.5px] leading-7 text-[color-mix(in_oklch,var(--landing-ink)_78%,var(--landing-paper))]">
            HaloKYC is policy-driven: your dashboard defines the workflow, the
            API starts a session against that workflow, and the user capture
            flow adapts to the enabled services.
          </p>
          <ul className="grid grid-cols-1 gap-2 border-t border-[var(--landing-rule)] pt-6 text-sm sm:grid-cols-3">
            {[
              ["POST", "/verifications/start"],
              ["GET", "/verifications/{id}"],
              ["WEBHOOK", "POST signed"],
            ].map(([verb, route]) => (
              <li
                key={route}
                className="flex flex-col gap-0.5 border-l border-[var(--landing-rule)] pl-3 first:border-l-0 first:pl-0"
              >
                <span className="font-mono text-[10px] tracking-[0.22em] text-[color-mix(in_oklch,var(--landing-ink)_55%,transparent)] uppercase">
                  {verb}
                </span>
                <span className="font-mono text-xs">{route}</span>
              </li>
            ))}
          </ul>
        </Reveal>

<Reveal delay={0.08} className="flex flex-col gap-4 min-w-0">
  <MultiFileCodeBlock
        files={FILES}
        showLineNumbers
        scrollable
        maxHeight={380}
        theme="light"
        bodyClassName="bg-[#fbf8ef] text-[#173426]"
        className="border border-[var(--landing-paper-edge)]"
      />
    </Reveal>
      </div>
    </section>
  );
}
