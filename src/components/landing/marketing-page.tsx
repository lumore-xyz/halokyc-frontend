import type { LucideIcon } from "lucide-react";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { cn } from "@/lib/utils";

type MarketingPageShellProps = {
  children: ReactNode;
};

type MarketingHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  primaryCta?: {
    href: string;
    label: string;
  };
  secondaryCta?: {
    href: string;
    label: string;
    external?: boolean;
  };
  facts: readonly {
    label: string;
    value: string;
  }[];
  aside: {
    label: string;
    title: string;
    lines: readonly string[];
  };
};

type Highlight = {
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
};

type MarketingHighlightsProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  items: readonly Highlight[];
};

type MarketingCtaProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryLabel?: string;
  primaryHref?: string;
};

export function MarketingPageShell({ children }: MarketingPageShellProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-(--landing-canvas) text-(--landing-canvas-ink) selection:bg-(--landing-cyan) selection:text-(--landing-canvas)">
      <LandingNavbar />
      <main>{children}</main>
      <LandingFooter />
    </div>
  );
}

export function MarketingHero({
  eyebrow,
  title,
  description,
  primaryCta = { href: "/login", label: "Start building" },
  secondaryCta = {
    href: "https://docs.halokyc.com/",
    label: "Read the docs",
    external: true,
  },
  facts,
  aside,
}: MarketingHeroProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-(--landing-hair)">
      <div
        aria-hidden
        className="landing-grid-soft absolute inset-0 opacity-[0.12]"
      />
      <div
        aria-hidden
        className="absolute -top-52 right-[-10rem] size-[34rem] rounded-full bg-(--landing-cyan-soft) blur-3xl"
      />

      <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:px-10 lg:py-32">
        <div className="landing-rise">
          <p className="font-mono text-[11px] tracking-[0.22em] text-(--landing-cyan) uppercase">
            HaloKYC / {eyebrow}
          </p>
          <h1 className="font-display mt-7 max-w-4xl text-5xl leading-[0.98] font-medium tracking-[-0.045em] text-(--landing-canvas-ink) sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-(--landing-canvas-ink-soft) sm:text-lg">
            {description}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={primaryCta.href}
              className="group inline-flex h-12 items-center gap-2 rounded-md bg-(--landing-cyan) px-5 text-sm font-medium text-(--landing-canvas) transition-colors hover:bg-[color-mix(in_oklch,var(--landing-cyan)_88%,white)] focus-visible:ring-2 focus-visible:ring-(--landing-cyan) focus-visible:ring-offset-2 focus-visible:ring-offset-(--landing-canvas) focus-visible:outline-none"
            >
              {primaryCta.label}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </Link>
            <Link
              href={secondaryCta.href}
              target={secondaryCta.external ? "_blank" : undefined}
              rel={secondaryCta.external ? "noreferrer" : undefined}
              className="inline-flex h-12 items-center rounded-md border border-(--landing-hair) px-5 text-sm font-medium text-(--landing-canvas-ink) transition-colors hover:bg-(--landing-canvas-edge) focus-visible:ring-2 focus-visible:ring-(--landing-cyan) focus-visible:outline-none"
            >
              {secondaryCta.label}
            </Link>
          </div>

          <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-5 border-t border-(--landing-hair) pt-6 sm:grid-cols-3">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="font-mono text-[10px] tracking-[0.2em] text-(--landing-canvas-mute) uppercase">
                  {fact.label}
                </dt>
                <dd className="mt-1 text-sm font-medium text-(--landing-canvas-ink)">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="landing-rise border border-(--landing-hair) bg-(--landing-canvas-edge) p-5 shadow-[0_30px_90px_-45px_rgba(0,0,0,0.8)] [animation-delay:120ms] sm:p-7">
          <div className="flex items-center justify-between gap-4 border-b border-(--landing-hair) pb-4">
            <p className="font-mono text-[10px] tracking-[0.22em] text-(--landing-canvas-mute) uppercase">
              {aside.label}
            </p>
            <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-(--landing-cyan) uppercase">
              <span className="size-1.5 rounded-full bg-(--landing-cyan)" />
              ready
            </span>
          </div>
          <h2 className="font-display mt-6 text-3xl leading-tight font-medium tracking-[-0.03em]">
            {aside.title}
          </h2>
          <ul className="mt-7 space-y-3">
            {aside.lines.map((line, index) => (
              <li
                key={line}
                className="grid grid-cols-[24px_1fr] gap-3 text-sm leading-6 text-(--landing-canvas-ink-soft)"
              >
                <span className="font-mono text-[10px] text-(--landing-cyan)">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {line}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

export function MarketingHighlights({
  eyebrow,
  title,
  description,
  items,
}: MarketingHighlightsProps) {
  return (
    <section className="bg-(--landing-paper) text-(--landing-ink)">
      <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="font-mono text-[10px] tracking-[0.22em] text-(--landing-stamp) uppercase">
              {eyebrow}
            </p>
            <h2 className="font-display mt-5 max-w-3xl text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">
              {title}
            </h2>
          </div>
          <p className="max-w-xl text-[15px] leading-7 text-[color-mix(in_oklch,var(--landing-ink)_75%,var(--landing-paper))]">
            {description}
          </p>
        </div>

        <div className="mt-12 grid border border-(--landing-paper-edge) md:grid-cols-2 lg:grid-cols-4">
          {items.map(
            (
              { icon: Icon, label, title: itemTitle, description: body },
              index,
            ) => (
              <article
                key={itemTitle}
                className={cn(
                  "min-h-64 border-t border-(--landing-paper-edge) bg-(--landing-paper) p-6",
                  "md:border-l md:[&:nth-child(2n+1)]:border-l-0",
                  "lg:border-l lg:[&:nth-child(-n+4)]:border-t-0 lg:[&:nth-child(4n+1)]:border-l-0",
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="flex size-10 items-center justify-center rounded-md border border-(--landing-rule) text-(--landing-stamp)">
                    <Icon className="size-4" strokeWidth={1.5} />
                  </span>
                  <span className="font-mono text-[10px] text-[color-mix(in_oklch,var(--landing-ink)_50%,transparent)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-7 font-mono text-[10px] tracking-[0.2em] text-(--landing-stamp) uppercase">
                  {label}
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">
                  {itemTitle}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[color-mix(in_oklch,var(--landing-ink)_72%,var(--landing-paper))]">
                  {body}
                </p>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

export function MarketingCta({
  eyebrow = "Ready when you are",
  title,
  description,
  primaryLabel = "Create your workspace",
  primaryHref = "/login",
}: MarketingCtaProps) {
  return (
    <section className="relative overflow-hidden border-t border-(--landing-hair) bg-(--landing-canvas-deep)">
      <div
        aria-hidden
        className="landing-grid-soft absolute inset-0 opacity-10"
      />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-20 sm:px-8 sm:py-24 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div>
          <p className="font-mono text-[10px] tracking-[0.22em] text-(--landing-cyan) uppercase">
            {eyebrow}
          </p>
          <h2 className="font-display mt-5 max-w-3xl text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">
            {title}
          </h2>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-(--landing-canvas-ink-soft)">
            {description}
          </p>
        </div>
        <Link
          href={primaryHref}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-(--landing-cyan) px-6 text-sm font-medium text-(--landing-canvas) transition-colors hover:bg-[color-mix(in_oklch,var(--landing-cyan)_88%,white)] focus-visible:ring-2 focus-visible:ring-(--landing-cyan) focus-visible:outline-none"
        >
          <Check className="size-4" strokeWidth={1.75} />
          {primaryLabel}
        </Link>
      </div>
    </section>
  );
}
