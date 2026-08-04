import type { Metadata } from "next";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";

export const metadata: Metadata = {
  title: "Exploded identity verification view",
  description:
    "See how HaloKYC turns identity evidence into a clear, auditable decision through one connected verification record.",
  alternates: { canonical: "/explodeview" },
  openGraph: {
    title: "Identity verification, taken apart | HaloKYC",
    description:
      "Five connected layers. One readable identity decision. Explore the HaloKYC verification stack.",
    type: "website",
    url: "/explodeview",
    siteName: "HaloKYC",
  },
};

const layers = [
  {
    number: "01",
    label: "Evidence",
    title: "Guided capture",
    detail: "Selfie and document evidence arrives in one session.",
  },
  {
    number: "02",
    label: "Signals",
    title: "Identity checks",
    detail: "OCR, liveness, face match, age and duplicate detection.",
  },
  {
    number: "03",
    label: "Policy",
    title: "Your workflow",
    detail: "Checks and thresholds run against your versioned policy.",
  },
  {
    number: "04",
    label: "Decision",
    title: "Readable outcome",
    detail: "Approve, reject or review—with the reason attached.",
  },
  {
    number: "05",
    label: "Delivery",
    title: "Signed result",
    detail: "A final webhook and audit trail reach your backend.",
  },
] as const;

function ExplodedStack() {
  return (
    <div
      className="relative mx-auto h-[610px] w-full max-w-[560px] sm:h-[650px]"
      aria-label="Five connected layers of a HaloKYC verification"
    >
      <div
        aria-hidden
        className="absolute top-10 bottom-9 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-(--landing-cyan) to-transparent opacity-70"
      />
      <div
        aria-hidden
        className="absolute top-[42%] left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--landing-cyan-soft) blur-3xl"
      />

      <article className="landing-rise absolute top-5 left-1/2 w-[88%] -translate-x-[56%] -rotate-2 border border-(--landing-hair) bg-[color-mix(in_oklch,var(--landing-canvas-edge)_94%,transparent)] p-4 shadow-[0_28px_70px_-36px_rgba(0,0,0,0.9)] backdrop-blur sm:p-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="font-mono text-[9px] tracking-[0.2em] text-(--landing-canvas-mute) uppercase">
              01 / Evidence enters
            </p>
            <p className="mt-2 text-sm font-semibold text-(--landing-canvas-ink)">
              Selfie + document
            </p>
          </div>
          <span className="mt-1 size-2 rounded-full bg-(--landing-blue,#8eb8d8)" />
        </div>
      </article>

      <article className="landing-rise absolute top-32 left-1/2 w-[92%] -translate-x-[44%] rotate-[1.5deg] border border-(--landing-hair) bg-[color-mix(in_oklch,var(--landing-canvas-soft)_92%,transparent)] p-4 shadow-[0_28px_70px_-36px_rgba(0,0,0,0.9)] backdrop-blur [animation-delay:80ms] sm:p-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="font-mono text-[9px] tracking-[0.2em] text-(--landing-canvas-mute) uppercase">
              02 / Signals extracted
            </p>
            <p className="mt-2 text-sm font-semibold text-(--landing-canvas-ink)">
              OCR · liveness · face match
            </p>
          </div>
          <span className="mt-1 size-2 rounded-full bg-(--landing-mint)" />
        </div>
      </article>

      <article className="landing-rise absolute top-[245px] left-1/2 z-10 grid w-[72%] -translate-x-1/2 place-items-center border border-(--landing-cyan-edge) bg-(--landing-cyan) px-5 py-6 text-center text-(--landing-canvas-deep) shadow-[0_34px_100px_-28px_rgba(200,230,79,0.55)] [animation-delay:160ms] sm:top-[255px] sm:py-7">
        <BrandLogo
          variant="icon-color"
          className="size-16 rounded-[1.1rem] shadow-[0_12px_28px_-14px_rgba(16,39,28,0.7)]"
          priority
        />
        <p className="mt-4 font-mono text-[9px] tracking-[0.22em] uppercase opacity-65">
          03 / Policy engine
        </p>
        <p className="mt-1 text-base font-extrabold tracking-[-0.02em]">
          Your rules decide
        </p>
      </article>

      <article className="landing-rise absolute top-[410px] left-1/2 w-[90%] -translate-x-[57%] -rotate-[1.5deg] border border-(--landing-hair) bg-[color-mix(in_oklch,var(--landing-canvas-soft)_94%,transparent)] p-4 shadow-[0_28px_70px_-36px_rgba(0,0,0,0.9)] backdrop-blur [animation-delay:240ms] sm:top-[430px] sm:p-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="font-mono text-[9px] tracking-[0.2em] text-(--landing-canvas-mute) uppercase">
              04 / Decision recorded
            </p>
            <p className="mt-2 text-sm font-semibold text-(--landing-canvas-ink)">
              Approved · review · rejected
            </p>
          </div>
          <span className="mt-1 size-2 rounded-full bg-(--landing-amber-stamp)" />
        </div>
      </article>

      <article className="landing-rise absolute top-[520px] left-1/2 w-[84%] -translate-x-[43%] rotate-2 border border-(--landing-hair) bg-[color-mix(in_oklch,var(--landing-canvas-edge)_96%,transparent)] p-4 shadow-[0_28px_70px_-36px_rgba(0,0,0,0.9)] backdrop-blur [animation-delay:320ms] sm:top-[550px] sm:p-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="font-mono text-[9px] tracking-[0.2em] text-(--landing-canvas-mute) uppercase">
              05 / Result delivered
            </p>
            <p className="mt-2 text-sm font-semibold text-(--landing-canvas-ink)">
              Signed webhook + audit trail
            </p>
          </div>
          <span className="mt-1 size-2 rounded-full bg-(--landing-cyan)" />
        </div>
      </article>
    </div>
  );
}

export default function ExplodeViewPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-(--landing-canvas) text-(--landing-canvas-ink) selection:bg-(--landing-cyan) selection:text-(--landing-canvas)">
      <LandingNavbar dashboardHref="/login" />

      <main>
        <section className="relative isolate overflow-hidden border-b border-(--landing-hair)">
          <div
            aria-hidden
            className="landing-grid-soft absolute inset-0 opacity-[0.11]"
          />
          <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl gap-12 px-6 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-6 lg:px-10 lg:py-24">
            <div className="landing-rise relative z-20">
              <div className="flex items-center gap-3">
                <BrandLogo variant="icon" className="size-8" />
                <p className="font-mono text-[10px] tracking-[0.22em] text-(--landing-cyan) uppercase">
                  HaloKYC / Exploded view
                </p>
              </div>
              <h1 className="font-display mt-8 max-w-3xl text-5xl leading-[0.94] font-semibold tracking-[-0.055em] sm:text-6xl lg:text-[5.3rem]">
                Identity verification,
                <span className="block text-(--landing-cyan)">taken apart.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-(--landing-canvas-ink-soft) sm:text-lg">
                Evidence goes in. A decision your team can explain comes out.
                Every layer stays connected in one verification record.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center rounded-md bg-(--landing-cyan) px-5 text-sm font-semibold text-(--landing-canvas) transition-colors hover:bg-[color-mix(in_oklch,var(--landing-cyan)_88%,white)] focus-visible:ring-2 focus-visible:ring-(--landing-cyan) focus-visible:ring-offset-2 focus-visible:ring-offset-(--landing-canvas) focus-visible:outline-none"
                >
                  Start a verification
                </Link>
                <Link
                  href="/workflow"
                  className="inline-flex h-12 items-center rounded-md border border-(--landing-hair) px-5 text-sm font-medium transition-colors hover:bg-(--landing-canvas-edge) focus-visible:ring-2 focus-visible:ring-(--landing-cyan) focus-visible:outline-none"
                >
                  Explore the workflow →
                </Link>
              </div>

              <dl className="mt-12 grid max-w-lg grid-cols-3 border-y border-(--landing-hair) py-5">
                <div>
                  <dt className="font-mono text-[9px] tracking-[0.18em] text-(--landing-canvas-mute) uppercase">
                    Record
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">One</dd>
                </div>
                <div className="border-l border-(--landing-hair) pl-5">
                  <dt className="font-mono text-[9px] tracking-[0.18em] text-(--landing-canvas-mute) uppercase">
                    Layers
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">Five</dd>
                </div>
                <div className="border-l border-(--landing-hair) pl-5">
                  <dt className="font-mono text-[9px] tracking-[0.18em] text-(--landing-canvas-mute) uppercase">
                    Outcome
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">Clear</dd>
                </div>
              </dl>
            </div>

            <ExplodedStack />
          </div>
        </section>

        <section className="bg-(--landing-paper) text-(--landing-ink)">
          <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 sm:py-28 lg:px-10">
            <div className="grid gap-8 border-b border-(--landing-paper-edge) pb-10 lg:grid-cols-[1fr_0.7fr] lg:items-end">
              <div>
                <p className="font-mono text-[10px] tracking-[0.22em] text-(--landing-stamp) uppercase">
                  One record / Five connected layers
                </p>
                <h2 className="font-display mt-5 max-w-3xl text-4xl leading-[1.02] font-semibold tracking-[-0.045em] sm:text-5xl">
                  Nothing disappears inside a black box.
                </h2>
              </div>
              <p className="max-w-xl text-[15px] leading-7 text-(--landing-ink-soft)">
                Each stage leaves behind evidence, a status and a reason. Your
                developers get one integration; your reviewers get the context
                they need.
              </p>
            </div>

            <ol className="divide-y divide-(--landing-paper-edge)">
              {layers.map((layer) => (
                <li
                  key={layer.number}
                  className="group grid gap-4 py-7 sm:grid-cols-[72px_0.7fr_1.3fr] sm:items-baseline sm:gap-8"
                >
                  <span className="font-mono text-[11px] text-(--landing-stamp)">
                    {layer.number}
                  </span>
                  <div>
                    <p className="font-mono text-[9px] tracking-[0.2em] text-(--landing-ink-soft) uppercase">
                      {layer.label}
                    </p>
                    <h3 className="mt-1 text-lg font-bold tracking-[-0.02em]">
                      {layer.title}
                    </h3>
                  </div>
                  <p className="max-w-2xl text-sm leading-6 text-(--landing-ink-soft)">
                    {layer.detail}
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-12 flex flex-col gap-6 border border-(--landing-paper-edge) bg-(--landing-paper-soft) p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-center gap-5">
                <BrandLogo variant="icon-color" className="size-14 rounded-xl" />
                <div>
                  <p className="font-mono text-[9px] tracking-[0.2em] text-(--landing-stamp) uppercase">
                    The whole stack
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    One API. Your final decision.
                  </p>
                </div>
              </div>
              <Link
                href="https://docs.halokyc.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-(--landing-cyan) px-5 text-sm font-semibold text-(--landing-canvas) focus-visible:ring-2 focus-visible:ring-(--landing-stamp) focus-visible:outline-none"
              >
                Read the API docs →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
