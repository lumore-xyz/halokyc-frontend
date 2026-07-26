"use client";

import Link from "next/link";
import { MailWarningIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useClientSession } from "@/lib/hooks/use-client-session";

export function EmailVerificationBanner() {
  const session = useClientSession();
  if (!session.data?.authenticated || session.data.emailVerified !== false) {
    return null;
  }

  return (
    <div className="px-4 pt-4">
      <Alert>
        <MailWarningIcon aria-hidden />
        <AlertTitle>Verify your email to unlock sensitive actions</AlertTitle>
        <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Check your inbox. Invites, API keys, and billing changes remain
            restricted until verification is complete.
          </span>
          <Button
            size="sm"
            variant="outline"
            render={<Link href="/resend-verification" />}
            nativeButton={false}
          >
            Resend email
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
