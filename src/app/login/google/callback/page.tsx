import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { GoogleCallbackHandlerClient } from "./handler-client";

export default function GoogleCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--landing-canvas)] p-6">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3">
            <Spinner className="size-6" />
            <p className="text-sm text-[var(--landing-canvas-ink-soft)]">Completing sign-in…</p>
          </div>
        }
      >
        <GoogleCallbackHandlerClient />
      </Suspense>
    </div>
  );
}
