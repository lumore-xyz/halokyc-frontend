import Link from "next/link";
import { MailIcon } from "lucide-react";

import { AccountActionShell } from "@/components/account-action-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function VerificationSentPage() {
  return (
    <AccountActionShell
      title="Check your inbox"
      description="Your account was created. Use the verification link we sent before performing security-sensitive actions."
    >
      <div className="space-y-6">
        <Alert>
          <MailIcon aria-hidden />
          <AlertTitle>Verification email queued</AlertTitle>
          <AlertDescription>
            Delivery can take a few minutes. Check spam or request another link
            if it does not arrive.
          </AlertDescription>
        </Alert>
        <div className="flex flex-wrap gap-3">
          <Button render={<Link href="/dashboard" />} nativeButton={false}>
            Continue to dashboard
          </Button>
          <Button
            variant="outline"
            render={<Link href="/resend-verification" />}
            nativeButton={false}
          >
            Resend verification
          </Button>
        </div>
      </div>
    </AccountActionShell>
  );
}
