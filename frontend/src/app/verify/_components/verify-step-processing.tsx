"use client";

import { useEffect, useState } from "react";
import { Clock3Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import type { VerificationStatus } from "@/lib/api-client";

type VerifyProcessingStepProps = {
  status: VerificationStatus | undefined;
  errorMessage: string | null;
  onRetry: () => void;
};

export function VerifyProcessingStep({
  status,
  errorMessage,
  onRetry,
}: VerifyProcessingStepProps) {
  const [slowVisible, setSlowVisible] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setSlowVisible(true), 10_000);
    return () => window.clearTimeout(timer);
  }, []);

  const title =
    status === "processing"
      ? "Checking your identity"
      : "Preparing your check";
  const description =
    status === "processing"
      ? "We're comparing your selfie and ID. This usually takes less than a minute."
      : "Your photos arrived. The identity check will begin shortly.";

  return (
    <div className="verify-step-enter flex flex-1 flex-col gap-6 text-center">
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <Spinner className="size-8 motion-reduce:animate-none" />
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {slowVisible ? (
        <Alert>
          <Clock3Icon />
          <AlertTitle>Still working</AlertTitle>
          <AlertDescription>
            Some checks take a little longer. Keep this page open — you do not
            need to upload again.
          </AlertDescription>
        </Alert>
      ) : null}
      {errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>Status could not be refreshed</AlertTitle>
          <AlertDescription>
            {errorMessage}{" "}
            <button
              type="button"
              className="font-medium underline underline-offset-4"
              onClick={onRetry}
            >
              Try again
            </button>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
