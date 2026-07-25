import type { Metadata } from "next";
import { BellRing, FileCheck2, GitBranch, ListChecks } from "lucide-react";
import { publicEnv } from "@/lib/env";

import { ApiSection } from "@/components/landing/api-section";
import {
  MarketingCta,
  MarketingHero,
  MarketingHighlights,
  MarketingPageShell,
} from "@/components/landing/marketing-page";
import { WorkflowSection } from "@/components/landing/workflow-section";

export const metadata: Metadata = {
  title: "Identity verification workflow | HaloKYC",
  description:
    "See how a HaloKYC verification moves from policy design and evidence capture to checks, review, and a signed webhook.",
  metadataBase: new URL(publicEnv.siteUrl),
  alternates: {
    canonical: "/workflow",
  },
  openGraph: {
    title: "Identity verification workflow | HaloKYC",
    description:
      "See how a HaloKYC verification moves from policy design and evidence capture to checks, review, and a signed webhook.",
    type: "website",
    url: "/workflow",
    siteName: "HaloKYC",
  },
};

export default function WorkflowPage() {
  return (
    <MarketingPageShell>
      <MarketingHero
        eyebrow="Workflow"
        title={
          <>
            Define the policy once.{" "}
            <span className="text-(--landing-cyan)">Run it consistently.</span>
          </>
        }
        description="A HaloKYC workflow connects the checks you choose, the evidence users provide, and the decision your product receives."
        facts={[
          { label: "Route", value: "6 auditable steps" },
          { label: "Contract", value: "REST + JSON" },
          { label: "Callback", value: "HMAC-SHA256" },
        ]}
        aside={{
          label: "standard_kyc_v3",
          title: "Policy becomes product behavior.",
          lines: [
            "Choose evidence and check requirements",
            "Start a session with an external user ID",
            "Resolve pass, reject, or manual review",
            "Notify your backend with a signed result",
          ],
        }}
      />
      <MarketingHighlights
        eyebrow="One source of truth"
        title={
          <>
            Every stage leaves a{" "}
            <span className="text-(--landing-stamp)">usable record.</span>
          </>
        }
        description="The workflow is more than a sequence of screens. It is the policy reference that ties capture, processing, review, and delivery together."
        items={[
          {
            icon: GitBranch,
            label: "Policy",
            title: "Versioned intent",
            description:
              "The selected workflow determines required evidence, enabled checks, and decision thresholds.",
          },
          {
            icon: FileCheck2,
            label: "Evidence",
            title: "Adaptive capture",
            description:
              "The user flow requests only what the selected workflow needs for that verification.",
          },
          {
            icon: ListChecks,
            label: "Decision",
            title: "Readable outcome",
            description:
              "Check results resolve to a status, score, and reason your team can act on.",
          },
          {
            icon: BellRing,
            label: "Delivery",
            title: "Verified callback",
            description:
              "Your backend receives the outcome through a signed webhook with retry visibility.",
          },
        ]}
      />
      <WorkflowSection />
      <ApiSection />
      <MarketingCta
        title="Turn your identity policy into a working flow."
        description="Configure the checks, start a session, and follow the result from capture through callback."
      />
    </MarketingPageShell>
  );
}
