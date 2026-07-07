"use client";

import { RouteErrorState } from "@/components/route-error-state";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function VerifyError({ error, reset }: ErrorProps) {
  return (
    <RouteErrorState
      reset={reset}
      digest={error.digest}
      title="Verification flow unavailable"
      description="The identity-check flow could not load. Retry the request, or ask the requesting service for a fresh verification link."
      homeHref="/"
      homeLabel="Home"
    />
  );
}
