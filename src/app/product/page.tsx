import type { Metadata } from "next";
import { Blocks, ClipboardCheck, ScanFace, Webhook } from "lucide-react";

import { ClientControlSection } from "@/components/landing/client-control-section";
import { FeatureGrid } from "@/components/landing/feature-grid";
import {
  MarketingCta,
  MarketingHero,
  MarketingHighlights,
  MarketingPageShell,
} from "@/components/landing/marketing-page";

export const metadata: Metadata = {
  title: "Identity verification product | HaloKYC",
  description:
    "Compose identity checks, capture evidence, review uncertain cases, and deliver signed decisions from one HaloKYC workflow.",
};

export default function ProductPage() {
  return (
    <MarketingPageShell>
      <MarketingHero
        eyebrow="Product"
        title={
          <>
            One verification record.{" "}
            <span className="text-(--landing-cyan)">Every check you need.</span>
          </>
        }
        description="Build identity checks around your risk policy, not a rigid vendor flow. HaloKYC brings capture, decisions, review, and delivery into one auditable product."
        facts={[
          { label: "Checks", value: "10 modular services" },
          { label: "Decision", value: "Approve, reject, review" },
          { label: "Delivery", value: "Signed webhook" },
        ]}
        aside={{
          label: "Verification record",
          title: "Evidence in. A readable decision out.",
          lines: [
            "Guided selfie and document capture",
            "OCR, liveness, face match, age, and duplicate checks",
            "Risk score with a human-readable reason",
            "Manual review for the cases that need judgment",
          ],
        }}
      />
      <MarketingHighlights
        eyebrow="A complete operating loop"
        title={
          <>
            From first capture to{" "}
            <span className="text-(--landing-stamp)">final callback.</span>
          </>
        }
        description="Each part of the verification lifecycle shares the same workflow and case record, so your developers and reviewers see consistent state."
        items={[
          {
            icon: Blocks,
            label: "Compose",
            title: "Workflow policies",
            description:
              "Choose checks and thresholds once, then start every session against a versioned workflow.",
          },
          {
            icon: ScanFace,
            label: "Capture",
            title: "Guided evidence",
            description:
              "Ask each user only for the selfie or document evidence that their workflow requires.",
          },
          {
            icon: ClipboardCheck,
            label: "Decide",
            title: "Human control",
            description:
              "Route uncertain outcomes to a review queue with the evidence and reason attached.",
          },
          {
            icon: Webhook,
            label: "Deliver",
            title: "Signed results",
            description:
              "Send the final status to your backend with an HMAC signature and delivery record.",
          },
        ]}
      />
      <FeatureGrid />
      <ClientControlSection />
      <MarketingCta
        title="Build the verification flow your product actually needs."
        description="Start in the sandbox, configure a workflow, and run a complete verification before you commit."
      />
    </MarketingPageShell>
  );
}
