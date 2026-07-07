"use client";

import { RouteErrorState } from "@/components/route-error-state";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DataRetentionError({ error, reset }: ErrorProps) {
  return (
    <RouteErrorState
      reset={reset}
      digest={error.digest}
      title="Data retention page unavailable"
      homeHref="/data-retention"
      homeLabel="Data retention"
    />
  );
}
