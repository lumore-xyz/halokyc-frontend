import type { Metadata } from "next";
import { FileClock, Fingerprint, KeyRound, ShieldCheck } from "lucide-react";

import {
  MarketingCta,
  MarketingHero,
  MarketingHighlights,
  MarketingPageShell,
} from "@/components/landing/marketing-page";
import { SecuritySection } from "@/components/landing/security-section";

export const metadata: Metadata = {
  title: "Security and data handling | HaloKYC",
  description:
    "Learn how HaloKYC handles identity evidence, tenant isolation, audit trails, document data, and signed webhooks.",
};

export default function SecurityPage() {
  return (
    <MarketingPageShell>
      <MarketingHero
        eyebrow="Security"
        title={
          <>
            Sensitive data deserves{" "}
            <span className="text-(--landing-cyan)">
              deliberate boundaries.
            </span>
          </>
        }
        description="HaloKYC is designed around short-lived capture data, tenant-scoped identity records, traceable decisions, and callbacks your backend can authenticate."
        facts={[
          { label: "Isolation", value: "Tenant-scoped" },
          { label: "Callbacks", value: "HMAC-SHA256" },
          { label: "Decisions", value: "Actor-attributed audit" },
        ]}
        aside={{
          label: "Data boundary",
          title: "Keep only what the record needs.",
          lines: [
            "Process selfie and ID evidence inside the verification flow",
            "Avoid persisting raw document numbers in plain text",
            "Scope biometric embeddings to the tenant",
            "Log review decisions with actor, reason, and timestamp",
          ],
        }}
      />
      <MarketingHighlights
        eyebrow="Security principles"
        title={
          <>
            Controls that follow the{" "}
            <span className="text-(--landing-stamp)">identity lifecycle.</span>
          </>
        }
        description="Security is applied from browser capture through the final backend notification, with a clear boundary for each stage."
        items={[
          {
            icon: Fingerprint,
            label: "Biometrics",
            title: "Tenant isolation",
            description:
              "Biometric matching stays within a workspace so identities do not leak across customer boundaries.",
          },
          {
            icon: KeyRound,
            label: "Transport",
            title: "Signed delivery",
            description:
              "HMAC-signed webhook payloads let your backend reject unauthenticated callbacks.",
          },
          {
            icon: FileClock,
            label: "Accountability",
            title: "Audit history",
            description:
              "Review decisions and delivery attempts retain the actor, reason, status, and timestamp.",
          },
          {
            icon: ShieldCheck,
            label: "Evidence",
            title: "Private handling",
            description:
              "Capture files stay behind private storage boundaries and are not exposed through public URLs.",
          },
        ]}
      />
      <SecuritySection />
      <MarketingCta
        title="Inspect the controls before you integrate."
        description="Review the data-handling model, then use the sandbox to trace a verification from evidence to signed result."
        primaryLabel="Read the documentation"
        primaryHref="https://docs.halokyc.com/"
      />
    </MarketingPageShell>
  );
}
