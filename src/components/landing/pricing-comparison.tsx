import Image from "next/image";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { Reveal } from "@/components/landing/reveal";
import { SectionMarker } from "@/components/landing/section-marker";
import { cn } from "@/lib/utils";

type Provider = {
  name: string;
  logo: string;
  logoWidth: number;
  logoHeight: number;
  source: string;
  featured?: boolean;
};

type ComparisonRow = {
  label: string;
  values: readonly string[];
  notes?: readonly (string | undefined)[];
};

const PROVIDERS: readonly Provider[] = [
  {
    name: "HaloKYC",
    logo: "/assets/logo/halokyc-hr-dark.svg",
    logoWidth: 1774,
    logoHeight: 887,
    source: "/pricing",
    featured: true,
  },
  {
    name: "Didit",
    logo: "/assets/logo/didit.svg",
    logoWidth: 795,
    logoHeight: 265,
    source: "https://didit.me/pricing/",
  },
  {
    name: "Persona",
    logo: "/assets/logo/persona.svg",
    logoWidth: 113,
    logoHeight: 28,
    source: "https://help.withpersona.com/articles/6oZbzp7jb7AWGClF5vpY3K/",
  },
  {
    name: "Veriff",
    logo: "/assets/logo/veriff.svg",
    logoWidth: 102,
    logoHeight: 28,
    source: "https://www.veriff.com/plans/self-serve",
  },
  {
    name: "Alloy",
    logo: "/assets/logo/alloy.svg",
    logoWidth: 300,
    logoHeight: 69,
    source: "https://www.alloy.com/",
  },
  {
    name: "Sumsub",
    logo: "/assets/logo/sumsub.svg",
    logoWidth: 141,
    logoHeight: 32,
    source: "https://sumsub.com/pricing/",
  },
] as const;

const ROWS: readonly ComparisonRow[] = [
  {
    label: "Monthly minimum",
    values: ["$0", "$0", "$250", "$49", "Sales quote", "$149"],
    notes: [
      "Sandbox",
      "Usage based",
      "Essential",
      "Essential",
      "Not publicly listed",
      "Basic",
    ],
  },
  {
    label: "Included or free usage",
    values: [
      "1,000 / month",
      "500 / month",
      "500 / month",
      "50 trial checks",
      "Not public",
      "50 trial checks",
    ],
    notes: [
      "Free Sandbox credits",
      "Free KYC bundles",
      "Included with Essential",
      "Free live verifications",
      undefined,
      "14-day trial",
    ],
  },
  {
    label: "Core identity verification",
    values: [
      "$0.020-$0.033",
      "$0.33",
      "$1.50",
      "$0.80",
      "Sales quote",
      "$1.35",
    ],
    notes: [
      "Per completed verification on paid plans",
      "Full KYC bundle after free tier",
      "Per additional Essential service",
      "Essential full-auto IDV",
      "Not publicly listed",
      "Basic user verification",
    ],
  },
  {
    label: "Commitment",
    values: [
      "None",
      "None",
      "12 months",
      "Monthly minimum",
      "Custom contract",
      "Monthly minimum",
    ],
  },
  {
    label: "Pricing visibility",
    values: [
      "Published",
      "Published",
      "Essential published",
      "Self-serve published",
      "Sales-led",
      "Self-serve published",
    ],
  },
] as const;

export function PricingComparison() {
  return (
    <section
      aria-labelledby="public-pricing-comparison"
      className="border-t border-(--landing-hair) bg-(--landing-canvas-deep) text-(--landing-canvas-ink)"
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 sm:py-28 lg:px-10">
        <Reveal className="mx-auto max-w-3xl text-center">
          <SectionMarker
            eyebrow="Pricing comparison"
            className="justify-center"
          />
          <h2
            id="public-pricing-comparison"
            className="font-display mt-5 text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl"
          >
            Public pricing, line by line.
          </h2>
          <p className="mt-5 text-[15px] leading-7 text-(--landing-canvas-ink-soft)">
            HaloKYC prices come from the plans above. Competitor figures come
            from each vendor&apos;s public pricing or plan documentation. When a
            vendor does not publish a number, the table says so.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-12">
          <div className="overflow-x-auto rounded-xl border border-(--paper-edge) bg-[var(--paper)] shadow-[var(--shadow-card)]">
            <table className="w-full min-w-[1080px] border-collapse text-left text-[var(--primary-foreground)]">
              <caption className="sr-only">
                Public pricing comparison for HaloKYC, Didit, Persona, Veriff,
                Alloy, and Sumsub
              </caption>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-10 w-52 border-b border-r border-(--paper-edge) bg-[var(--paper)] p-5 font-mono text-[10px] font-medium tracking-[0.18em] uppercase"
                  >
                    Price point
                  </th>
                  {PROVIDERS.map((provider) => (
                    <th
                      key={provider.name}
                      scope="col"
                      className={cn(
                        "min-w-36 border-b border-l border-(--paper-edge) p-5 text-center",
                        provider.featured &&
                          "bg-[color-mix(in_oklch,var(--landing-cyan)_13%,var(--paper))]",
                      )}
                    >
                      <Link
                        href={provider.source}
                        target={provider.source.startsWith("http") ? "_blank" : undefined}
                        rel={provider.source.startsWith("http") ? "noreferrer" : undefined}
                        className={cn(
                          "inline-flex h-10 items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-(--landing-cyan) focus-visible:outline-none",
                          provider.featured &&
                            "bg-(--landing-canvas-deep) px-3 shadow-sm",
                        )}
                        aria-label={`${provider.name} pricing source`}
                      >
                        {provider.featured ? (
                          <BrandLogo
                            variant="wordmark-light"
                            className="h-7 w-24"
                          />
                        ) : (
                          <Image
                            src={provider.logo}
                            alt={provider.name}
                            width={provider.logoWidth}
                            height={provider.logoHeight}
                            className="h-7 w-auto max-w-28 object-contain"
                          />
                        )}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label} className="border-t border-(--paper-edge)">
                    <th
                      scope="row"
                      className="sticky left-0 z-10 border-r border-(--paper-edge) bg-[var(--paper)] p-5 text-sm font-semibold"
                    >
                      {row.label}
                    </th>
                    {row.values.map((value, index) => {
                      const provider = PROVIDERS[index];
                      const note = row.notes?.[index];

                      return (
                        <td
                          key={provider.name}
                          className={cn(
                            "border-l border-(--paper-edge) p-5 text-center align-top text-sm",
                            provider.featured &&
                              "bg-[color-mix(in_oklch,var(--landing-cyan)_13%,var(--paper))]",
                          )}
                        >
                          <span
                            className={cn(
                              "font-medium tabular-nums",
                              provider.featured &&
                                "text-[color-mix(in_oklch,var(--primary-foreground)_58%,var(--landing-cyan))]",
                            )}
                          >
                            {value}
                          </span>
                          {note ? (
                            <span className="mt-1 block text-[11px] leading-4 text-[color-mix(in_oklch,var(--primary-foreground)_58%,transparent)]">
                              {note}
                            </span>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-6 grid gap-3 text-xs leading-5 text-(--landing-canvas-mute) sm:grid-cols-[1fr_auto] sm:items-start">
            <p>
              Checked 20 August 2026. Prices are shown in USD and exclude
              taxes, add-ons, volume discounts, and custom enterprise terms.
              &quot;Service&quot; and &quot;verification&quot; are vendor-defined units, so compare
              the included checks before comparing the headline number.
            </p>
            <p className="font-mono text-[10px] tracking-[0.16em] uppercase">
              Published / Included / Sales quote
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
