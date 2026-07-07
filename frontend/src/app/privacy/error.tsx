"use client";

import { RouteErrorState } from "@/components/route-error-state";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PrivacyError({ error, reset }: ErrorProps) {
  return (
    <RouteErrorState
      reset={reset}
      digest={error.digest}
      title="Privacy page unavailable"
      homeHref="/privacy"
      homeLabel="Privacy"
    />
  );
}
