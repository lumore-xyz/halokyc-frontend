"use client";

import { useRouter } from "next/navigation";
import { Suspense, useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { GradientOrb } from "@/components/landing/gradient-orb";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { apiClient, type UnifiedLoginResponse } from "@/lib/api-client";

function readUnifiedAuth(): UnifiedLoginResponse | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem("unified_auth");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UnifiedLoginResponse;
  } catch {
    return null;
  }
}

function GoogleCompleteContent() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [auth] = useState<UnifiedLoginResponse | null>(() => readUnifiedAuth());
  const expiredMessage =
    "Your Google sign-in session expired. Please go back and sign in again.";

  const companyInvalid = submitted && !companyName.trim();

  const submit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitted(true);
      setError(null);
      if (!companyName.trim() || !auth?.temp_token) return;

      setIsPending(true);
      try {
        const data = await apiClient.googleCompleteSignup(auth.temp_token, {
          company_name: companyName.trim(),
        });
        sessionStorage.setItem("unified_auth", JSON.stringify(data));
        router.push("/select-account");
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Could not complete setup. Please try again.",
        );
      } finally {
        setIsPending(false);
      }
    },
    [auth, companyName, router],
  );

  if (!auth?.temp_token) {
    return (
      <Card size="sm" className="border-[var(--landing-hair)] bg-white/[0.02] backdrop-blur-md">
        <CardContent className="space-y-4 pt-0">
          <Alert variant="destructive" className="border-[var(--landing-hair)] bg-destructive/10">
            <AlertTitle className="text-sm">Invalid link</AlertTitle>
            <AlertDescription className="text-xs">
              {error ?? expiredMessage}
            </AlertDescription>
          </Alert>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-[var(--landing-canvas-ink-soft)] hover:text-[var(--landing-canvas-ink)]"
          >
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card size="sm" className="border-[var(--landing-hair)] bg-white/[0.02] backdrop-blur-md">
      <CardContent className="pt-0">
        <form onSubmit={submit} noValidate className="space-y-6">
          <FieldGroup className="space-y-2">
            <Field data-invalid={companyInvalid || undefined} className="gap-2">
              <FieldLabel htmlFor="company-name" className="text-sm font-medium text-[var(--landing-canvas-ink)]">
                Company name
              </FieldLabel>
              <Input
                id="company-name"
                type="text"
                placeholder="Acme Inc."
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                aria-invalid={companyInvalid}
                autoFocus
                className="h-11 bg-white/[0.03] backdrop-blur-md border-white/[0.1] focus-visible:ring-1 focus-visible:ring-[var(--landing-cyan)] focus-visible:border-[var(--landing-cyan)] transition-all"
              />
              {companyInvalid ? <FieldError className="text-xs font-mono">Enter your company name.</FieldError> : null}
            </Field>
          </FieldGroup>

          {error ? (
            <Alert variant="destructive" className="border-[var(--landing-hair)] bg-destructive/10">
              <AlertTitle className="text-sm">Setup failed</AlertTitle>
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button
            type="submit"
            className="h-11 w-full bg-[var(--landing-cyan)] text-[var(--landing-canvas)] hover:bg-[color-mix(in_oklch,var(--landing-cyan)_88%,white)] transition-all"
            disabled={isPending}
          >
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            {isPending ? "Creating workspace…" : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function GoogleCompletePage() {
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
          href="/login"
          className="group flex items-center gap-2 text-sm font-medium text-[var(--landing-canvas-ink-soft)] transition-colors hover:text-[var(--landing-canvas-ink)]"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to sign in
        </Link>
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center justify-center px-6 py-24">
        {/* Brand Identity */}
        <BrandLogo variant="wordmark-light" priority className="mb-10 h-9 w-36" />

        <div className="w-full space-y-8">
          <header className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl border border-[var(--landing-hair)] bg-white/[0.03] backdrop-blur-md">
              <Building2Icon className="size-5 text-[var(--landing-cyan)]" />
            </div>
            <h1 className="font-serif text-3xl font-normal tracking-tight">
              Finish setting up your account
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-[var(--landing-canvas-ink-soft)]">
              Tell us your company name so we can create your workspace.
            </p>
          </header>

          <div className="w-full" suppressHydrationWarning>
            <Suspense
              fallback={
                <div className="flex flex-col items-center gap-3 py-8">
                  <Spinner className="size-6" />
                  <p className="text-sm text-[var(--landing-canvas-ink-soft)]">Loading…</p>
                </div>
              }
            >
              <GoogleCompleteContent />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
