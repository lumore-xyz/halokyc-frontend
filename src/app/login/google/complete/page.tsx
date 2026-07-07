"use client";

import { useRouter } from "next/navigation";
import { Suspense, useCallback, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
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
      <div className="space-y-4 text-center">
        <Alert variant="destructive" className="border-[var(--landing-hair)] bg-destructive/10 text-left">
          <AlertTitle className="text-sm">Invalid link</AlertTitle>
          <AlertDescription className="text-xs">
            {error ?? expiredMessage}
          </AlertDescription>
        </Alert>
        <a
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-[var(--landing-canvas-ink-soft)] hover:text-[var(--landing-canvas-ink)]"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <FieldGroup className="space-y-4">
        <Field data-invalid={companyInvalid || undefined}>
          <FieldLabel htmlFor="company-name" className="text-xs uppercase tracking-wider text-[var(--landing-canvas-ink-soft)]">
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
  );
}

export default function GoogleCompletePage() {
  return (
    <div className="relative min-h-screen bg-[var(--landing-canvas)] text-[var(--landing-canvas-ink)] selection:bg-[var(--landing-cyan)] selection:text-[var(--landing-canvas)]">
      <main className="mx-auto flex w-full max-w-md flex-col items-center justify-center px-6 py-24">
        <header className="mb-8 flex flex-col gap-2 text-center">
          <h1 className="font-serif text-4xl font-normal tracking-tight">
            Finish setting up your account
          </h1>
          <p className="text-sm leading-relaxed text-[var(--landing-canvas-ink-soft)]">
            Tell us your company name so we can create your workspace.
          </p>
        </header>
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-3">
              <Spinner className="size-6" />
              <p className="text-sm text-[var(--landing-canvas-ink-soft)]">Loading…</p>
            </div>
          }
        >
          <GoogleCompleteContent />
        </Suspense>
      </main>
    </div>
  );
}
