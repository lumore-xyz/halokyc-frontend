"use client";

import Link from "next/link";
import { MailWarningIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAccountVerification } from "@/lib/hooks/use-account-verification";
import { useClientSession } from "@/lib/hooks/use-client-session";

export function EmailVerificationBanner() {
  const session = useClientSession();
  const emailVerified = session.data?.emailVerified === true;
  const verification = useAccountVerification(
    session.data?.authenticated === true && emailVerified,
  );
  const identityVerified = verification.data?.status === "approved";

  if (
    !session.data?.authenticated ||
    (emailVerified && (verification.isLoading || identityVerified))
  ) {
    return null;
  }

  return (
    <div className="px-4 pt-4">
      <Alert>
        <MailWarningIcon aria-hidden />
        <AlertTitle>Complete account verification</AlertTitle>
        <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {emailVerified
              ? "Your email is verified. Complete identity verification to unlock sensitive actions."
              : "Verify your email, then complete identity verification to unlock sensitive actions."}
          </span>
          <Button
            size="sm"
            variant="outline"
            render={<Link href="/dashboard/verification" />}
            nativeButton={false}
          >
            Continue verification
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
