"use client";

import { RouteErrorState } from "@/components/route-error-state";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: ErrorProps) {
  return (
    <RouteErrorState
      reset={reset}
      digest={error.digest}
      title="Admin view unavailable"
      description="The admin workspace could not load. Retry the request, or return to client operations."
      homeHref="/admin"
      homeLabel="Admin"
      className="app-shell"
    />
  );
}
