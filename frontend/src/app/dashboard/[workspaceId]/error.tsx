"use client";

import { RouteErrorState } from "@/components/route-error-state";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: ErrorProps) {
  return (
    <RouteErrorState
      reset={reset}
      digest={error.digest}
      title="Dashboard unavailable"
      description="The client workspace could not load. Retry the request, or return to the dashboard overview."
      homeHref="/dashboard"
      homeLabel="Dashboard"
      className="app-shell"
    />
  );
}
