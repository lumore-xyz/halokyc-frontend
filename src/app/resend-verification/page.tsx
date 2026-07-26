"use client";

import { type FormEvent, useState } from "react";
import { MailPlusIcon } from "lucide-react";

import { AccountActionShell } from "@/components/account-action-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiError, apiClient } from "@/lib/api-client";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const invalid = submitted && !/^\S+@\S+\.\S+$/.test(email.trim());

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (invalid || !email.trim()) return;
    setPending(true);
    setError(null);
    try {
      await apiClient.resendEmailVerification(email.trim().toLowerCase());
      setComplete(true);
    } catch (cause) {
      setError(
        cause instanceof ApiError && cause.status === 429
          ? "Too many requests. Wait before requesting another email."
          : "We could not submit the request. Check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AccountActionShell
      title="Resend verification"
      description="Enter the email used for your password-created HaloKYC account."
    >
      {complete ? (
        <Alert>
          <MailPlusIcon aria-hidden />
          <AlertTitle>Request received</AlertTitle>
          <AlertDescription>
            If an unverified password account exists for this email, a new link
            has been sent.
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={submit} className="space-y-5" noValidate>
          <Field data-invalid={invalid || undefined}>
            <FieldLabel htmlFor="verification-email">Email</FieldLabel>
            <Input
              id="verification-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={pending}
              aria-invalid={invalid}
            />
            {invalid ? (
              <FieldError>Enter a valid email address.</FieldError>
            ) : null}
          </Field>
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Request not sent</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            {pending ? "Requesting…" : "Send verification email"}
          </Button>
        </form>
      )}
    </AccountActionShell>
  );
}
