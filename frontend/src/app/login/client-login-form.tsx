"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogInIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useClientLogin } from "@/lib/hooks/use-client-session";

export function ClientLoginForm() {
  const router = useRouter();
  const login = useClientLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!email.trim() || !password) return;
    try {
      await login.mutateAsync({ email: email.trim(), password });
      router.push("/dashboard");
    } catch {
      // Mutation state renders the error.
    }
  }

  const emailInvalid = submitted && !email.trim();
  const passwordInvalid = submitted && !password;

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <FieldGroup className="space-y-4">
        <Field data-invalid={emailInvalid || undefined}>
          <FieldLabel htmlFor="client-email" className="text-xs uppercase tracking-wider text-[var(--landing-canvas-ink-soft)]">Email</FieldLabel>
            <Input
              id="client-email"
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
          <FieldLabel htmlFor="client-password" className="text-xs uppercase tracking-wider text-[var(--landing-canvas-ink-soft)]">Password</FieldLabel>
            <Input
              id="client-password"
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

      {login.error ? (
        <Alert variant="destructive" className="border-[var(--landing-hair)] bg-destructive/10">
          <AlertTitle className="text-sm">Sign in failed</AlertTitle>
          <AlertDescription className="text-xs">Check the email and password, then try again.</AlertDescription>
        </Alert>
      ) : null}

      <Button 
        type="submit" 
        className="h-11 w-full bg-[var(--landing-cyan)] text-[var(--landing-canvas)] hover:bg-[color-mix(in_oklch,var(--landing-cyan)_88%,white)] transition-all" 
        disabled={login.isPending}
      >
        {login.isPending ? <Spinner data-icon="inline-start" /> : <LogInIcon data-icon="inline-start" />}
        {login.isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
