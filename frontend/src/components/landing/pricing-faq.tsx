"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type FaqItem = {
  q: string;
  a: string;
};

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    q: "What is a credit?",
    a: "One credit equals one completed verification. Whether you run a single face-match check or a full liveness + OCR + duplicate workflow, it costs the same — one credit. This keeps pricing predictable and removes any incentive to strip checks to save money.",
  },
  {
    q: "Can purchased credits expire?",
    a: "No. Credits you buy as a one-off pack stay in your wallet until you use them. They are not subject to the subscription rollover cap and do not expire at any calendar boundary.",
  },
  {
    q: "How does rollover work?",
    a: "Subscription credits carry over month to month, up to 10x the monthly plan grant. Launch — 1,500/month — can accumulate up to 15,000. Growth caps at 60,000. Scale caps at 200,000. Credits beyond the cap are not granted.",
  },
  {
    q: "What happens when I run out of credits?",
    a: "Sessions that cannot reserve credits queue in an awaiting_credits state. As soon as new credits land in your wallet — monthly grant, purchased pack, or admin credit — sessions drain in FIFO order. Your users never see a credit error.",
  },
  {
    q: "Which credits get consumed first?",
    a: "Reservations always consume free first, then subscription, then purchased. Free credits reset to 1,000 each month. Subscription credits accrue from your plan. Purchased credits are a true top-up for when both others are dry.",
  },
  {
    q: "What is the minimum credit purchase?",
    a: "$25, which buys 500 credits at $0.050 each. Payment processing has a fixed cost component, so smaller transactions are uneconomical. Every pack above the minimum reduces the per-credit cost.",
  },
  {
    q: "Can I switch plans?",
    a: "Yes. Plan changes apply at the next billing cycle. Upgrades are immediate — you get the higher entitlement right away. Downgrades apply to the following cycle so your existing credits are not stranded mid-month.",
  },
  {
    q: "Are there per-check or overage fees?",
    a: "No. There are no per-type charges, no hidden overage tiers, and no annual commitments required. The price listed per plan is the price you pay each month.",
  },
];

function FaqItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[var(--landing-hair)] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="pr-8 text-[15px] font-medium tracking-tight text-[var(--landing-canvas-ink)]">
          {item.q}
        </span>
        <span
          aria-hidden
          className={cn(
            "shrink-0 text-[var(--landing-canvas-mute)] transition-transform",
            isOpen ? "rotate-45" : ""
          )}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M8 3v10M3 8h10" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="pb-5 pr-12 text-[14px] leading-relaxed text-[var(--landing-canvas-ink-soft)]">
          {item.a}
        </div>
      )}
    </div>
  );
}

export function PricingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      {FAQ_ITEMS.map((item, i) => (
        <FaqItem
          key={item.q}
          item={item}
          isOpen={openIndex === i}
          onToggle={() =>
            setOpenIndex(openIndex === i ? null : i)
          }
        />
      ))}
    </div>
  );
}
