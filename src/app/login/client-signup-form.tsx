"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlusIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useClientSignup } from "@/lib/hooks/use-client-session";

export function ClientSignupForm() {
  const router = useRouter();
  const signup = useClientSignup();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!email.trim() || !password || !companyName.trim()) return;
    try {
      await signup.mutateAsync({
        email: email.trim(),
        password,
        company_name: companyName.trim(),
      });
      router.push("/verify-email/sent");
    } catch {
      // Mutation state renders the error.
    }
  }

  const emailInvalid = submitted && !email.trim();
  const passwordInvalid = submitted && (!password || password.length < 8);
  const companyInvalid = submitted && !companyName.trim();

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <FieldGroup className="space-y-4">
        <Field data-invalid={companyInvalid || undefined}>
          <FieldLabel
            htmlFor="client-company"
            className="text-xs tracking-wider text-[var(--landing-canvas-ink-soft)] uppercase"
          >
            Company Name
          </FieldLabel>
          <Input
            id="client-company"
            type="text"
            placeholder="Acme Corp"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            aria-invalid={companyInvalid}
            className="h-11 border-white/[0.1] bg-white/[0.03] backdrop-blur-md transition-all focus-visible:border-[var(--landing-cyan)] focus-visible:ring-1 focus-visible:ring-[var(--landing-cyan)]"
          />
          {companyInvalid ? (
            <FieldError className="font-mono text-xs">
              Company name is required.
            </FieldError>
          ) : null}
        </Field>
        <Field data-invalid={emailInvalid || undefined}>
          <FieldLabel
            htmlFor="client-email"
            className="text-xs tracking-wider text-[var(--landing-canvas-ink-soft)] uppercase"
          >
            Email
          </FieldLabel>
          <Input
            id="client-email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={emailInvalid}
            className="h-11 border-white/[0.1] bg-white/[0.03] backdrop-blur-md transition-all focus-visible:border-[var(--landing-cyan)] focus-visible:ring-1 focus-visible:ring-[var(--landing-cyan)]"
          />
          {emailInvalid ? (
            <FieldError className="font-mono text-xs">
              Enter your email.
            </FieldError>
          ) : null}
        </Field>
        <Field data-invalid={passwordInvalid || undefined}>
          <FieldLabel
            htmlFor="client-password"
            className="text-xs tracking-wider text-[var(--landing-canvas-ink-soft)] uppercase"
          >
            Password
          </FieldLabel>
          <Input
            id="client-password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={passwordInvalid}
            className="h-11 border-white/[0.1] bg-white/[0.03] backdrop-blur-md transition-all focus-visible:border-[var(--landing-cyan)] focus-visible:ring-1 focus-visible:ring-[var(--landing-cyan)]"
          />
          {passwordInvalid ? (
            <FieldError className="font-mono text-xs">
              Password must be at least 8 characters.
            </FieldError>
          ) : null}
        </Field>
      </FieldGroup>

      {signup.error ? (
        <Alert
          variant="destructive"
          className="bg-destructive/10 border-[var(--landing-hair)]"
        >
          <AlertTitle className="text-sm">Signup failed</AlertTitle>
          <AlertDescription className="text-xs">
            {signup.error instanceof Error
              ? signup.error.message
              : "An error occurred. Please check your details and try again."}
          </AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="submit"
        className="h-11 w-full bg-[var(--landing-cyan)] text-[var(--landing-canvas)] transition-all hover:bg-[color-mix(in_oklch,var(--landing-cyan)_88%,white)]"
        disabled={signup.isPending}
      >
        {signup.isPending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <UserPlusIcon data-icon="inline-start" />
        )}
        {signup.isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
