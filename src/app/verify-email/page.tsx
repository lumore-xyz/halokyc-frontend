"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2Icon,
  MailCheckIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { AccountActionShell } from "@/components/account-action-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { apiClient } from "@/lib/api-client";
import { useAccountActionToken } from "@/lib/hooks/use-account-action-token";

type VerifyState = "processing" | "complete" | "error" | "missing";

export default function VerifyEmailPage() {
  const token = useAccountActionToken();
  const submitted = useRef(false);
  const [state, setState] = useState<VerifyState>("processing");

  useEffect(() => {
    if (token === undefined || submitted.current) return;
    if (token === null) return;
    submitted.current = true;
    apiClient.verifyEmail(token).then(
      () => setState("complete"),
      () => setState("error"),
    );
  }, [token]);
  const visibleState = token === null ? "missing" : state;

  return (
    <AccountActionShell
      title="Verify your email"
      description="We are processing the secure verification link for your HaloKYC account."
    >
      <div aria-live="polite" className="space-y-6">
        {visibleState === "processing" ? (
          <div className="flex items-center gap-3 text-sm">
            <Spinner />
            Processing verification request…
          </div>
        ) : null}
        {visibleState === "complete" ? (
          <Alert>
            <CheckCircle2Icon aria-hidden />
            <AlertTitle>Verification request processed</AlertTitle>
            <AlertDescription>
              If the link was valid, your account is now verified. Continue to
              HaloKYC to refresh your account status.
            </AlertDescription>
          </Alert>
        ) : null}
        {visibleState === "missing" ? (
          <Alert>
            <MailCheckIcon aria-hidden />
            <AlertTitle>Verification token missing</AlertTitle>
            <AlertDescription>
              Open the complete link from your email or request another one.
            </AlertDescription>
          </Alert>
        ) : null}
        {visibleState === "error" ? (
          <Alert variant="destructive">
            <TriangleAlertIcon aria-hidden />
            <AlertTitle>Could not process the link</AlertTitle>
            <AlertDescription>
              Check your connection and try the email link again, or request a
              new verification email.
            </AlertDescription>
          </Alert>
        ) : null}
        {visibleState !== "processing" ? (
          <div className="flex flex-wrap gap-3">
            <Button render={<Link href="/dashboard" />} nativeButton={false}>
              Continue to dashboard
            </Button>
            <Button
              variant="outline"
              render={<Link href="/resend-verification" />}
              nativeButton={false}
            >
              Request another link
            </Button>
          </div>
        ) : null}
      </div>
    </AccountActionShell>
  );
}
