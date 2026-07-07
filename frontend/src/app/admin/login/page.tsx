import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { GradientOrb } from "@/components/landing/gradient-orb";

import { AdminLoginForm } from "./admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--landing-canvas)] text-[var(--landing-canvas-ink)] selection:bg-[var(--landing-cyan)] selection:text-[var(--landing-canvas)]">
      <GradientOrb
        position="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        size="h-[600px] w-[600px]"
        opacity="opacity-30"
      />

      <div className="absolute top-8 left-8 z-10">
        <Link
          href="/"
          className="group flex items-center gap-2 text-sm font-medium text-[var(--landing-canvas-ink-soft)] transition-colors hover:text-[var(--landing-canvas-ink)]"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to home
        </Link>
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center justify-center px-6 py-24">
        <BrandLogo variant="wordmark-light" priority className="mb-12 h-11 w-44" />

        <div className="w-full space-y-8">
          <header className="flex flex-col gap-2 text-center">
            <p className="font-mono text-xs tracking-[0.24em] text-[var(--landing-cyan)] uppercase">
              Platform admin
            </p>
            <h1 className="font-serif text-4xl font-normal tracking-tight">
              Admin sign in
            </h1>
            <p className="text-sm leading-relaxed text-[var(--landing-canvas-ink-soft)]">
              Sign in to manage clients, review unclear sessions, and keep the
              verification pipeline moving.
            </p>
          </header>

          <div className="w-full">
            <AdminLoginForm />
          </div>
        </div>
      </main>
    </div>
  );
}
