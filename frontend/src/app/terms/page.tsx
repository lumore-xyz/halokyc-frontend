import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";

export default function TermsPage() {
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
          <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">Business Terms and Conditions</h1>
          <p className="mt-4 text-[var(--landing-canvas-ink-soft)]">Last updated: June 27, 2026</p>
        </header>

        <div className="space-y-12 text-sm leading-relaxed text-[var(--landing-canvas-ink-soft)]">
          <section className="space-y-4">
            <p>
              These Business Terms and Conditions govern access to and use of the HaloKYC platform, dashboard, APIs, SDKs, documentation, verification flows, fraud-prevention tools, and related services.
            </p>
            <p>
              By creating a HaloKYC account, using the dashboard, integrating our APIs, purchasing credits, signing an order form, or otherwise using the services, you agree to these Terms on behalf of the company, organization, or legal entity you represent.
            </p>
            <p className="italic">
              Note: These Terms are intended for business customers. They are not legal advice and should be reviewed by a qualified lawyer before publication.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">1. Parties</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <h3 className="font-medium text-[var(--landing-canvas-ink)]">Service Provider</h3>
                <p>HaloKYC</p>
                <p>[Insert Legal Entity Name]</p>
                <p>[Insert Address]</p>
                <p>legal@halokyc.com</p>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-[var(--landing-canvas-ink)]">Client</h3>
                <p>The company, business, developer, organization, or legal entity that creates an account or uses HaloKYC services.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">2. Agreement Structure</h2>
            <p>The agreement between HaloKYC and the Client may include signed order forms, a Data Processing Agreement (DPA), these Business Terms, and our Service Level Agreement (SLA). In case of conflict, the signed order form takes priority.</p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">3. Definitions</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <dt className="font-medium text-[var(--landing-canvas-ink)]">Account</dt>
                <dd>The Client&apos;s HaloKYC business account.</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-medium text-[var(--landing-canvas-ink)]">Client Data</dt>
                <dd>Data submitted by the Client, including End User verification media and API payloads.</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-medium text-[var(--landing-canvas-ink)]">Credits</dt>
                <dd>Prepaid or subscription-based units used to pay for chargeable verification events.</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-medium text-[var(--landing-canvas-ink)]">Chargeable State</dt>
                <dd>Final outcomes (approved, rejected, needs_review) for which credits are deducted.</dd>
              </div>
            </dl>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">4. Account Security</h2>
            <p>
              The Client is responsible for maintaining the confidentiality of API keys, passwords, and tokens. HaloKYC is not responsible for losses caused by failure to secure account credentials or authorized user access.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">5. License & Use</h2>
            <p>
              HaloKYC grants a limited, non-exclusive license to use the Services for internal business purposes. Reselling, white-labeling, or commercially redistributing the services without written permission is prohibited.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">6. Acceptable Use</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>No unlawful, fraudulent, or discriminatory use of verification results.</li>
              <li>No reverse engineering of HaloKYC models, APIs, or algorithms.</li>
              <li>No bypass of rate limits or credit controls.</li>
              <li>No processing of children&apos;s data without legal authorization.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">7. Client Responsibilities</h2>
            <p>
              The Client is responsible for obtaining all required consents (including biometric consent), providing privacy notices to End Users, and ensuring compliance with KYC, AML, and data protection laws.
            </p>
            <p className="font-medium text-[var(--landing-canvas-ink)]">
              HaloKYC provides decision-support tools; the Client remains responsible for the final business decision to approve or reject a user.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">8. Verification Results</h2>
            <p>
              Verification is probabilistic. HaloKYC does not guarantee that all fraudulent users will fail or that all legitimate users will pass. Results should be used as part of a broader risk management process.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">9. Billing & Credits</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-[var(--landing-canvas-ink-soft)] opacity-80">
                <h3 className="font-medium text-[var(--landing-canvas-ink)]">Credit Types</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong className="text-[var(--landing-canvas-ink)]">Free:</strong> Discretionary, non-stacking.</li>
                  <li><strong className="text-[var(--landing-canvas-ink)]">Subscription:</strong> Monthly credits with a rollover cap.</li>
                  <li><strong className="text=&quot;[var(--landing-canvas-ink)]&quot;">Purchased:</strong> Non-refundable, persistent units.</li>
                </ul>
              </div>
              <p>
                Credits are deducted only upon reaching a <strong className="text-[var(--landing-canvas-ink)]">Chargeable State</strong> (Approved, Rejected, or Needs Review). Sessions that are abandoned or fail due to system errors do not consume credits.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">10. Intellectual Property</h2>
            <p>
              HaloKYC owns all rights to the platform, APIs, models, and algorithms. The Client owns their Client Data but grants HaloKYC a limited license to process it to provide the services and ensure security.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">11. Data Protection</h2>
            <p>
              Where HaloKYC processes personal data on behalf of the Client, HaloKYC acts as a Processor. Clients are responsible for the lawful basis of collecting data and providing notices to users.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">12. Security & Confidentiality</h2>
            <p>
              HaloKYC employs industry-standard encryption and access controls. Both parties agree to protect non-public information received from the other using reasonable care.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">13. Service Availability (SLA)</h2>
            <p>
              HaloKYC targets 99.0% monthly uptime for paid business plans. This excludes scheduled maintenance and force majeure events.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">14. Disclaimer & Liability</h2>
            <p>
              Services are provided <strong className="text-[var(--landing-canvas-ink)]">&ldquo;as is&rdquo;</strong>. HaloKYC disclaims all warranties of merchantability or fitness for a particular purpose.
            </p>
            <p>
              Total liability is limited to the amount paid by the Client in the 12 months preceding the event giving rise to the claim.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">15. Indemnification</h2>
            <p>
              The Client agrees to indemnify HaloKYC against claims arising from the Client&apos;s breach of terms, unlawful use of services, or failure to obtain user consent.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">16. Termination</h2>
            <p>
              HaloKYC may suspend or terminate access for breach of terms, payment failure, or security threats. Upon termination, access stops and unpaid amounts become due.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">17. Governing Law</h2>
            <p>
              These Terms are governed by the laws of India. Disputes will be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra, India.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-[var(--landing-canvas-ink)]">18. Contact</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 rounded-lg border border-[var(--landing-canvas-ink-soft)] opacity-80">
                <p className="font-medium text-[var(--landing-canvas-ink)]">Legal</p>
                <p>legal@halokyc.com</p>
              </div>
              <div className="p-4 rounded-lg border border-[var(--landing-canvas-ink-soft)] opacity-80">
                <p className="font-medium text-[var(--landing-canvas-ink)]">Privacy</p>
                <p>privacy@halokyc.com</p>
              </div>
              <div className="p-4 rounded-lg border border-[var(--landing-canvas-ink-soft)] opacity-80">
                <p className="font-medium text-[var(--landing-canvas-ink)]">Security</p>
                <p>security@halokyc.com</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
