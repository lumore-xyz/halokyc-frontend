/**
 * Landing page.
 *
 * The only fully static route in the app.
 *
 * Visual rhythm — dark and light sections alternate intentionally:
 *   Hero (dark) → Pipeline (light) → Problem (dark) → Features (light)
 *   → API proof (dark) → Workflow (light) → Use cases (light)
 *   → Controls (light) → Pricing (dark) → Security (light) → CTA (dark)
 */

import type { Metadata } from "next";
import { cookies } from "next/headers";

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
import {
  ADMIN_COOKIE,
  CLIENT_COOKIE,
  adminSessionFromToken,
  clientSessionFromToken,
} from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "HaloKYC — Stop fake users before they cost you",
  description:
    "One API for identity verification: selfie capture, document OCR, liveness, face match, age checks, duplicate detection, risk scoring, and a review queue your team controls. Ship verification this week.",
  openGraph: {
    title: "HaloKYC — Stop fake users before they cost you",
    description:
      "One API. Practical identity checks. Your team keeps the final decision. No enterprise procurement cycle.",
    type: "website",
  },
};

export default async function Home() {
  const cookieStore = await cookies();
  const clientSession = clientSessionFromToken(
    cookieStore.get(CLIENT_COOKIE)?.value ?? null,
  );
  const adminSession = adminSessionFromToken(
    cookieStore.get(ADMIN_COOKIE)?.value ?? null,
  );

  const dashboardHref = clientSession.authenticated
    ? "/dashboard"
    : adminSession.authenticated
      ? "/admin"
      : undefined;

  return (
    <div className="min-h-screen overflow-x-hidden bg-(--landing-canvas) text-(--landing-canvas-ink) selection:bg-(--landing-cyan) selection:text-(--landing-canvas)">
      <LandingNavbar dashboardHref={dashboardHref} />

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
