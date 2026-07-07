import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--landing-canvas)] text-[var(--landing-canvas-ink)] selection:bg-[var(--landing-cyan)] selection:text-[var(--landing-canvas)]">
      <div className="absolute top-8 left-8 z-10">
        <Link
          href="/"
          className="group flex items-center gap-2 text-sm font-medium text-[var(--landing-canvas-ink-soft)] transition-colors hover:text-[var(--landing-canvas-ink)]"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to home
        </Link>
      </div>

      <main className="mx-auto max-w-3xl px-6 py-24 sm:px-8 lg:py-32">
        <header className="mb-16 text-center">
          <BrandLogo
            variant="wordmark-light"
            className="mx-auto mb-6 h-10 w-44"
          />
          <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-[var(--landing-canvas-ink-soft)]">Last updated: June 27, 2026</p>
        </header>

        <div className="space-y-12 text-sm leading-relaxed text-[var(--landing-canvas-ink-soft)]">
          <section className="space-y-4">
            <p>
              This Privacy Policy explains how <strong className="text-[var(--landing-canvas-ink)]">HaloKYC</strong> collects, uses, stores, shares, and protects personal data when you visit our website, contact us, create an account, use our dashboard, integrate our API, or complete an identity verification flow powered by HaloKYC.
            </p>
            <p>
              HaloKYC provides identity verification, liveness detection, face matching, document OCR, duplicate detection, risk scoring, manual review, and related compliance tools for businesses.
            </p>
            <p>
              When an end user completes verification for one of our customers, that customer usually decides why verification is required and how the result is used. In those cases, HaloKYC acts as a processor or service provider. For our own website, business operations, security, fraud prevention, billing, and support activities, HaloKYC may act as a controller.
            </p>
            <p className="italic">
              Note: This Privacy Policy is not legal advice. It should be reviewed with a qualified lawyer before publishing.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">1. Who we are</h2>
            <div className="space-y-1">
              <p><strong className="text-[var(--landing-canvas-ink)]">Company name:</strong> [Insert Legal Entity Name]</p>
              <p><strong className="text-[var(--landing-canvas-ink)]">Registered address:</strong> [Insert Address]</p>
              <p><strong className="text-[var(--landing-canvas-ink)]">Email:</strong> privacy@halokyc.com</p>
              <p><strong className="text-[var(--landing-canvas-ink)]">Security contact:</strong> security@halokyc.com</p>
              <p><strong className="text-[var(--landing-canvas-ink)]">General contact:</strong> hello@halokyc.com</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">2. Scope and our role</h2>
            <p>This Privacy Policy applies when you visit our website, request a demo, manage a business account, use our API, or complete an identity verification flow powered by HaloKYC.</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--landing-canvas-ink-soft)] opacity-70">
                    <th className="py-2 font-medium text-[var(--landing-canvas-ink)]">Context</th>
                    <th className="py-2 font-medium text-[var(--landing-canvas-ink)]">Role</th>
                    <th className="py-2 font-medium text-[var(--landing-canvas-ink)]">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--landing-canvas-ink-soft)] opacity-80">
                  <tr>
                    <td className="py-3 pr-4">Website, sales, billing, direct accounts</td>
                    <td className="py-3 pr-4 font-medium">Controller</td>
                    <td className="py-3">We decide why and how this data is processed.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Verification flows for customers</td>
                    <td className="py-3 pr-4 font-medium">Processor</td>
                    <td className="py-3">The customer decides why verification is needed.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Security, fraud prevention, audit logs</td>
                    <td className="py-3 pr-4 font-medium">Independent Controller</td>
                    <td className="py-3">Limited processing to protect the platform and comply with law.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">3. Personal data we process</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-medium text-[var(--landing-canvas-ink)]">3.1 Identity & Contact</h3>
                <p>Name, email, phone, DOB, address, nationality, and government ID information.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-[var(--landing-canvas-ink)]">3.2 Business & Account</h3>
                <p>Company name, billing details, login credentials, API keys, and usage records.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-[var(--landing-canvas-ink)]">3.3 Verification Data</h3>
                <p>ID document images, extracted OCR data, selfie images, and verification status.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-[var(--landing-canvas-ink)]">3.4 Biometrics & Liveness</h3>
                <p>Face images, liveness frames, anti-spoofing signals, and face embeddings.</p>
              </div>
            </div>
            <p className="text-xs italic">We also process device/network data (IP, browser) and communications (support tickets) as needed for platform security and operation.</p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">4. How we use personal data</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide and operate the HaloKYC website, dashboard, and API.</li>
              <li>Perform identity document OCR, liveness checks, and face matching.</li>
              <li>Detect duplicate accounts and prevent fraud, spoofing, and identity theft.</li>
              <li>Secure our platform and monitor system integrity.</li>
              <li>Comply with legal, regulatory, tax, and security obligations.</li>
              <li>Improve verification accuracy using anonymized or pseudonymized data.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">5. Legal bases for processing</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-[var(--landing-canvas-ink)]">Contract:</strong> To provide requested services.</li>
              <li><strong className="text-[var(--landing-canvas-ink)]">Consent:</strong> For biometric processing and non-essential cookies.</li>
              <li><strong className="text-[var(--landing-canvas-ink)]">Legitimate Interests:</strong> Platform security, fraud prevention, and reliability.</li>
              <li><strong className="text-[var(--landing-canvas-ink)]">Legal Obligation:</strong> Compliance with applicable laws and audits.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">6. How we share personal data</h2>
            <p>We may share data with the customer requesting verification, trusted infrastructure providers, professional advisers, and public authorities when required by law.</p>
            <p className="font-medium text-[var(--landing-canvas-ink)]">We do not sell biometric identifiers or biometric information.</p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">7. International transfers</h2>
            <p>
              HaloKYC may process data in countries other than where it was collected. We use appropriate safeguards, such as standard contractual clauses, to ensure lawful transfers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">8. Retention</h2>
            <p>We retain personal data only as long as reasonably necessary.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--landing-canvas-ink-soft)] opacity-70">
                    <th className="py-2 font-medium text-[var(--landing-canvas-ink)]">Data Type</th>
                    <th className="py-2 font-medium text-[var(--landing-canvas-ink)]">Retention Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--landing-canvas-ink-soft)] opacity-80">
                  <tr>
                    <td className="py-3 pr-4">Session Metadata</td>
                    <td className="py-3">Until account closure or customer deletion.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">ID & Selfie Media</td>
                    <td className="py-3">30 days by default (configurable).</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Face Embeddings</td>
                    <td className="py-3">Until duplicate detection is no longer required.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Audit Logs</td>
                    <td className="py-3">1 to 7 years based on compliance needs.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">9. User rights</h2>
            <p>
              Depending on your location (GDPR, CCPA, DPDP), you may have rights to access, correct, or delete your data.
            </p>
            <p>
              If you verified via a business, contact that business first. For HaloKYC-direct requests, email <strong className="text-[var(--landing-canvas-ink)]">privacy@halokyc.com</strong>, or use the <a className="font-medium underline underline-offset-4" href="/privacy/dashboard">privacy dashboard</a> to track an active DSR.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">10. Cookies</h2>
            <p>
              We use essential cookies for security and session management. Non-essential cookies (analytics) require your explicit opt-in via our consent banner.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">11. AI & Model Improvement</h2>
            <p>
              We may use anonymized or pseudonymized data to improve OCR, liveness, and fraud detection. We do not use identifiable biometric data for advertising.
            </p>
            <p>
              To opt-out of future model-improvement datasets, contact <strong className="text-[var(--landing-canvas-ink)]">privacy@halokyc.com</strong>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">12. Security</h2>
            <p>
              We employ encryption in transit and at rest, role-based access controls, and rigorous audit logging to protect your data.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">13. Children</h2>
            <p>
              HaloKYC is not for general use by children. Customers performing age verification are responsible for obtaining necessary parental consent.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">14. Customer Responsibilities</h2>
            <p>
              Customers must provide their own privacy notices to end users, obtain required consents, and use verification results lawfully.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">15. Changes</h2>
            <p>
              We may update this policy periodically. The &ldquo;Last updated&rdquo; date at the top reflects the most recent change.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">16. Contact</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 rounded-lg border border-[var(--landing-canvas-ink-soft)] opacity-80">
                <p className="font-medium text-[var(--landing-canvas-ink)]">Privacy</p>
                <p>privacy@halokyc.com</p>
              </div>
              <div className="p-4 rounded-lg border border-[var(--landing-canvas-ink-soft)] opacity-80">
                <p className="font-medium text-[var(--landing-canvas-ink)]">Security</p>
                <p>security@halokyc.com</p>
              </div>
              <div className="p-4 rounded-lg border border-[var(--landing-canvas-ink-soft)] opacity-80">
                <p className="font-medium text-[var(--landing-canvas-ink)]">General</p>
                <p>hello@halokyc.com</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
