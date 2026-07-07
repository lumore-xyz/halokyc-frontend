"use client";

/**
 * LandingNavbar - the marketing-only top navigation.
 *
 * Sticky, with a hairline that intensifies on scroll. Center
 * nav links to in-page anchors; the right side carries the
 * docs link and an auth-aware primary CTA.
 *
 * On small screens the central nav collapses behind a button
 * that opens a side sheet (the design system Drawer isn't used
 * here because we want a minimal CSS-only reveal that fits the
 * page palette).
 */

import { LayoutDashboard, Menu, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#developers", label: "Developers" },
  { href: "#workflow", label: "Workflow" },
  { href: "#security", label: "Security" },
  { href: "/pricing", label: "Pricing" },
] as const;

type LandingNavbarProps = {
  dashboardHref?: "/dashboard" | "/admin";
};

export function LandingNavbar({ dashboardHref }: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const primaryHref = dashboardHref ?? "/login";
  const primaryLabel =
    dashboardHref === "/admin"
      ? "Admin"
      : dashboardHref
        ? "Dashboard"
        : "Get started";
  const PrimaryIcon = dashboardHref ? LayoutDashboard : UserPlus;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-colors",
  scrolled
    ? "border-b border-(--landing-hair) bg-[color-mix(in_oklch,var(--landing-canvas)_88%,transparent)] backdrop-blur-xl"
    : "border-b border-transparent bg-[color-mix(in_oklch,var(--landing-canvas)_92%,transparent)]",
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-6 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="flex items-center"
            aria-label="HaloKYC home"
          >
            <BrandLogo variant="wordmark-light" priority className="h-9 w-36" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm text-[var(--landing-canvas-ink-soft)]",
                  "transition-colors hover:bg-[var(--landing-canvas-soft)] hover:text-[var(--landing-canvas-ink)]",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/console"
              className={cn(
                "hidden h-9 items-center rounded-md px-3.5 text-sm font-medium sm:inline-flex",
                "border border-[var(--landing-hair)] bg-transparent text-[var(--landing-canvas-ink)]",
                "transition-colors hover:bg-[var(--landing-canvas-soft)]",
              )}
            >
              Read the docs
            </Link>
            <Link
              href={primaryHref}
              className={cn(
                "hidden h-9 items-center gap-1.5 rounded-md px-3.5 text-sm font-medium md:inline-flex",
                "bg-[var(--landing-cyan)] text-[var(--landing-canvas)]",
                "transition-all hover:bg-[color-mix(in_oklch,var(--landing-cyan)_88%,white)]",
                "focus-visible:ring-2 focus-visible:ring-[var(--landing-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-canvas)] focus-visible:outline-none",
              )}
            >
              <PrimaryIcon className="size-4" aria-hidden />
              {primaryLabel}
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-md md:hidden",
                "border border-[var(--landing-hair)] bg-transparent text-[var(--landing-canvas-ink)]",
                "transition-colors hover:bg-[var(--landing-canvas-soft)]",
                "focus-visible:ring-2 focus-visible:ring-[var(--landing-cyan)] focus-visible:outline-none",
              )}
              aria-label="Open navigation"
              aria-expanded={open}
            >
              <Menu className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav sheet */}
      <div
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-60 md:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-[color-mix(in_oklch,var(--landing-canvas)_70%,transparent)] backdrop-blur-sm",
            "transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <nav
          className={cn(
            "absolute top-0 right-0 flex h-full w-[78%] max-w-sm flex-col",
            "border-l border-(--landing-hair) bg-(--landing-canvas)",
            "p-6 shadow-[-20px_0_60px_-20px_rgba(0,0,0,0.6)]",
            "transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between">
            <BrandLogo variant="wordmark-light" className="h-8 w-32" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-md",
                "border border-(--landing-hair) text-[var(--landing-canvas-ink)]",
                "transition-colors hover:bg-[var(--landing-canvas-soft)]",
                "focus-visible:ring-2 focus-visible:ring-[var(--landing-cyan)] focus-visible:outline-none",
              )}
              aria-label="Close navigation"
            >
              <X className="size-4" strokeWidth={1.75} />
            </button>
          </div>

          <ul className="mt-10 flex flex-col gap-1">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-md px-3 py-3 text-base text-[var(--landing-canvas-ink-soft)]",
                    "transition-colors hover:bg-[var(--landing-canvas-soft)] hover:text-[var(--landing-canvas-ink)]",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/console"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-3 text-base text-[var(--landing-canvas-ink-soft)] transition-colors hover:bg-[var(--landing-canvas-soft)] hover:text-[var(--landing-canvas-ink)]"
              >
                Read the docs
              </Link>
            </li>
          </ul>

          <Link
            href={primaryHref}
            onClick={() => setOpen(false)}
            className={cn(
              "mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-md px-6 text-sm font-medium",
              "bg-[var(--landing-cyan)] text-[var(--landing-canvas)]",
              "transition-colors hover:bg-[color-mix(in_oklch,var(--landing-cyan)_88%,white)]",
              "focus-visible:ring-2 focus-visible:ring-[var(--landing-cyan)] focus-visible:outline-none",
            )}
          >
            <PrimaryIcon className="size-4" aria-hidden />
            {primaryLabel}
          </Link>
        </nav>
      </div>
    </>
  );
}
