"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { GradientOrb } from "@/components/landing/gradient-orb";
import { Spinner } from "@/components/ui/spinner";

import { ClientSignupForm } from "./client-signup-form";
import { GoogleSignInButton } from "./google-signin-button";
import { UnifiedLoginForm } from "./unified-login-form";

function LoginFormWrapper({ isSignup }: { isSignup: boolean }) {
  return isSignup ? (
    <ClientSignupForm />
  ) : (
    <Suspense fallback={<div className="flex h-20 items-center justify-center"><Spinner /></div>}>
      <UnifiedLoginForm />
    </Suspense>
  );
}

export default function ClientLoginPage() {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <div className="relative min-h-screen bg-[var(--landing-canvas)] text-[var(--landing-canvas-ink)] selection:bg-[var(--landing-cyan)] selection:text-[var(--landing-canvas)]">
      {/* Ambient Halo Glow */}
      <GradientOrb
        position="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        size="h-[600px] w-[600px]"
        opacity="opacity-30"
      />

      {/* Back Navigation */}
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
        {/* Brand Identity */}
        <BrandLogo variant="wordmark-light" priority className="mb-12 h-11 w-44" />

        <div className="w-full space-y-8">
          <header className="flex flex-col gap-2 text-center">
            <h1 className="font-serif text-4xl font-normal tracking-tight">
              {isSignup ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-sm leading-relaxed text-[var(--landing-canvas-ink-soft)]">
              {isSignup
                ? "Join HaloKYC to start verifying your users."
                : "Sign in to manage your API keys and view activity."}
            </p>
          </header>

          <div className="w-full" suppressHydrationWarning>
            <LoginFormWrapper isSignup={isSignup} />
          </div>

          <div className="text-center">
            <Button
              variant="link"
              className="text-sm text-[var(--landing-canvas-ink-soft)] hover:text-[var(--landing-canvas-ink)]"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? "Already have an account? Sign in" : "Don't have an account? Create one"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
