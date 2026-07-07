"use client";

import { RouteErrorState } from "@/components/route-error-state";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LoginError({ error, reset }: ErrorProps) {
  return (
    <RouteErrorState
      reset={reset}
      digest={error.digest}
      title="Login unavailable"
      description="The sign-in surface could not load. Retry the request, or return home."
      homeHref="/"
      homeLabel="Home"
    />
  );
}
