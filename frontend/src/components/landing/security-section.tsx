"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Reveal } from "@/components/landing/reveal";
import { SectionMarker } from "@/components/landing/section-marker";

interface AccordionItem {
  id: string;
  q: string;
  a: string;
}

const FAQ: readonly AccordionItem[] = [
  {
    id: "bans",
    q: "Can a rejected user silently re-verify later?",
    a: "Soft and permanent bans keep a face embedding on file so a new selfie does not restart the process without your team noticing.",
  },
  {
    id: "biometrics",
    q: "Where do selfie and ID images go after processing?",
    a: "Selfie and ID images are processed, checked, then discarded. Biometric embeddings are tenant-scoped and never cross workspaces.",
  },
  {
    id: "storage",
    q: "Are identity files accessible via a public URL?",
    a: "Evidence lives under a private storage layer. Object URLs are revoked on unmount. The file path is never exposed to the browser.",
  },
  {
    id: "data",
    q: "Are raw document numbers stored in plain text?",
    a: "Only a verified hash and the extracted fields needed for the check are stored. Raw document numbers are never persisted or surfaced in any API response.",
  },
  {
    id: "audit",
    q: "Can you trace who made a review decision?",
    a: "Every approve, reject, and override is logged with the reviewer's identity, the evidence they saw, and the reason they wrote.",
  },
  {
    id: "webhooks",
    q: "Can a webhook callback be spoofed?",
    a: "Every webhook is signed with HMAC-SHA256. Your backend fails closed on any payload that does not verify — no exceptions.",
  },
  {
    id: "async",
    q: "Do long-running verifications block the API?",
    a: "Verification work runs asynchronously. Long-processing sessions do not block your API, and sessions queued while credits are empty show a neutral waiting state to the user.",
  },
  {
    id: "billing",
    q: "Who owns the credit and billing records?",
    a: "Wallet, ledger, and reservation records are taggable and auditable. Compliance exports include every credit movement without manual reconstruction.",
  },
];

function AccordionItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: (id: string) => void;
  index: number;
}) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen]);

  return (
    <div
      className={cn(
        "border border-[var(--landing-paper-edge)] bg-[var(--landing-paper)]",
        "first:border-t-0",
      )}
    >
      <button
        onClick={() => onToggle(item.id)}
        aria-expanded={isOpen}
        className={cn(
          "group flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4",
          "text-[15.5px] font-semibold tracking-tight text-[var(--landing-ink)]",
          "transition-colors",
          "hover:bg-[var(--landing-paper-soft)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-paper)]",
        )}
      >
        <span className="flex items-center gap-3">
          <span
            aria-hidden
            className="font-mono text-[10px] tracking-[0.22em] text-[var(--landing-stamp)]"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          {item.q}
        </span>
        <span
          aria-hidden
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-sm border border-[var(--landing-rule)] text-[var(--landing-ink-soft)]",
            "transition-transform duration-200",
            isOpen && "rotate-45",
          )}
        >
          {isOpen ? <X className="size-3.5" strokeWidth={1.75} /> : <Plus className="size-3.5" strokeWidth={1.75} />}
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-200 ease-out"
        style={{ height: isOpen ? height : 0, opacity: isOpen ? 1 : 0 }}
      >
        <div ref={contentRef} className="px-5 pb-4 pt-0">
          <p className="pl-7 text-[14px] leading-relaxed text-[color-mix(in_oklch,var(--landing-ink)_72%,var(--landing-paper))]">
            {item.a}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SecuritySection() {
  const [openId, setOpenId] = React.useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="security"
      aria-labelledby="security-headline"
      className="relative bg-[var(--landing-paper)] text-[var(--landing-ink)]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal className="flex flex-col gap-6">
            <SectionMarker
              index={9}
              eyebrow="Data handling"
              meta="FAQ · eight answers"
              tone="paper"
            />
            <h2
              id="security-headline"
              className={cn(
                "font-display font-medium tracking-[-0.03em]",
                "text-4xl leading-tight",
                "sm:text-5xl",
              )}
            >
              We take your users&apos;
              <span className="italic text-[var(--landing-stamp)]">
                {" "}
                data personally.
              </span>
            </h2>
            <p className="max-w-md text-[15.5px] leading-relaxed text-[color-mix(in_oklch,var(--landing-ink)_78%,var(--landing-paper))]">
              Identity files are the most sensitive data your product touches.
              We designed the system around what gets deleted, who can see
              what, and why the audit trail exists — before the first line of
              AI code was written.
            </p>

            <dl className="mt-2 grid grid-cols-2 gap-4 border-t border-[var(--landing-rule)] pt-5 text-sm">
              {[
                ["ISO-aligned", "Construction, not certification"],
                ["Tenant-scoped", "Data isolated per workspace"],
                ["Ephemeral", "Object URLs revoked on unmount"],
                ["Signed", "HMAC-SHA256 · SHA-256"],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color-mix(in_oklch,var(--landing-ink)_55%,transparent)]">
                    {k}
                  </dt>
                  <dd className="text-[13.5px] leading-relaxed text-[color-mix(in_oklch,var(--landing-ink)_78%,var(--landing-paper))]">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.08} className="flex flex-col gap-3">
            {FAQ.map((item, i) => (
              <AccordionItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={handleToggle}
                index={i}
              />
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
