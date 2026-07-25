import type { Metadata } from "next";
import { productSchema } from "@/lib/structured-data";

import { ApiSection } from "@/components/landing/api-section";
import { ClientControlSection } from "@/components/landing/client-control-section";
import { CookieConsentBanner } from "@/components/landing/cookie-consent-banner";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { PricingSection } from "@/components/landing/pricing-section";
import { DecisionSection } from "@/components/landing/decision-section";
import { SecuritySection } from "@/components/landing/security-section";
import { TrustedPipeline } from "@/components/landing/trusted-pipeline";
import { UseCasesSection } from "@/components/landing/use-cases-section";
import { WorkflowSection } from "@/components/landing/workflow-section";

export const metadata: Metadata = {
  title: "Stop fake users before they cost you",
  description:
    "One API for identity verification: selfie capture, document OCR, liveness, face match, age checks, duplicate detection, risk scoring, and a review queue your team controls.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "HaloKYC — Stop fake users before they cost you",
    description:
      "One API. Practical identity checks. Your team keeps the final decision.",
    type: "website",
    url: "/",
    siteName: "HaloKYC",
  },
  other: {
    "script:ld+json": JSON.stringify(productSchema()),
  },
};

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-(--landing-canvas) text-(--landing-canvas-ink) selection:bg-(--landing-cyan) selection:text-(--landing-canvas)">
      <LandingNavbar dashboardHref="/login" />

      <main>
        <Hero />
        <TrustedPipeline />
        <DecisionSection />
        <FeatureGrid />
        <ApiSection />
        <WorkflowSection />
        <UseCasesSection />
        <ClientControlSection />
        <PricingSection />
        <SecuritySection />
        <FinalCta />
      </main>

      <LandingFooter />
      <CookieConsentBanner />
    </div>
  );
}
