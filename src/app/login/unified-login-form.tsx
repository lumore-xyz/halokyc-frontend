"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { apiClient, type UnifiedLoginResponse } from "@/lib/api-client";
import { GoogleSignInButton } from "./google-signin-button";

export function UnifiedLoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [googleError, setGoogleError] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    const error = search.get("error");
    if (error) {
      setGoogleError(decodeURIComponent(error));
    }
    initialized.current = true;
  }, [search]);

  return (
    <div className="space-y-6">
      <GoogleSignInButton />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[var(--landing-canvas)] px-2 text-[var(--landing-canvas-ink-soft)]">
            Or continue with email
          </span>
        </div>
      </div>

      <EmailPasswordForm />
      {googleError ? (
        <p className="text-center text-xs text-red-400">{googleError}</p>
      ) : null}
    </div>
  );
}

function EmailPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const emailInvalid = submitted && !email.trim();
  const passwordInvalid = submitted && !password;

  const submit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitted(true);
      setError(null);
      if (!email.trim() || !password) return;

      setIsPending(true);
      try {
        const data = (await apiClient.unifiedLogin({
          email: email.trim(),
          password,
        })) as UnifiedLoginResponse;
        sessionStorage.setItem("unified_auth", JSON.stringify(data));
        router.push("/select-account");
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Sign in failed. Please check your credentials.",
        );
      } finally {
        setIsPending(false);
      }
    },
    [email, password, router],
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <FieldGroup className="space-y-4">
        <Field data-invalid={emailInvalid || undefined}>
          <FieldLabel htmlFor="login-email" className="text-xs uppercase tracking-wider text-[var(--landing-canvas-ink-soft)]">
            Email
          </FieldLabel>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={emailInvalid}
            className="h-11 bg-white/[0.03] backdrop-blur-md border-white/[0.1] focus-visible:ring-1 focus-visible:ring-[var(--landing-cyan)] focus-visible:border-[var(--landing-cyan)] transition-all"
          />
          {emailInvalid ? <FieldError className="text-xs font-mono">Enter your email.</FieldError> : null}
        </Field>
        <Field data-invalid={passwordInvalid || undefined}>
          <FieldLabel htmlFor="login-password" className="text-xs uppercase tracking-wider text-[var(--landing-canvas-ink-soft)]">
            Password
          </FieldLabel>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={passwordInvalid}
            className="h-11 bg-white/[0.03] backdrop-blur-md border-white/[0.1] focus-visible:ring-1 focus-visible:ring-[var(--landing-cyan)] focus-visible:border-[var(--landing-cyan)] transition-all"
          />
          {passwordInvalid ? <FieldError className="text-xs font-mono">Enter your password.</FieldError> : null}
        </Field>
      </FieldGroup>

      {error ? (
        <Alert variant="destructive" className="border-[var(--landing-hair)] bg-destructive/10">
          <AlertTitle className="text-sm">Sign in failed</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="submit"
        className="h-11 w-full bg-[var(--landing-cyan)] text-[var(--landing-canvas)] hover:bg-[color-mix(in_oklch,var(--landing-cyan)_88%,white)] transition-all"
        disabled={isPending}
      >
        {isPending ? <Spinner data-icon="inline-start" /> : <LogInIcon data-icon="inline-start" />}
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

function LogInIcon(props: { "data-icon"?: "inline-start" }) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}
