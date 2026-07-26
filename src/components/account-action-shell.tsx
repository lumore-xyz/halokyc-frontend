import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";

type AccountActionShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
};

export function AccountActionShell({
  title,
  description,
  children,
  backHref = "/login",
  backLabel = "Back to sign in",
}: AccountActionShellProps) {
  return (
    <div className="min-h-screen bg-[var(--landing-canvas)] text-[var(--landing-canvas-ink)]">
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-16">
        <Link
          href={backHref}
          className="mb-10 inline-flex w-fit items-center gap-2 text-sm text-[var(--landing-canvas-ink-soft)] transition-colors hover:text-[var(--landing-canvas-ink)]"
        >
          <ArrowLeftIcon className="size-4" aria-hidden />
          {backLabel}
        </Link>
        <BrandLogo
          variant="wordmark-light"
          priority
          className="mb-10 h-11 w-44"
        />
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <header className="mb-6 space-y-2">
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {title}
            </h1>
            <p className="text-sm leading-6 text-[var(--landing-canvas-ink-soft)]">
              {description}
            </p>
          </header>
          {children}
        </section>
      </main>
    </div>
  );
}
