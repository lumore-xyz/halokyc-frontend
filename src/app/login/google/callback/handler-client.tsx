"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { apiClient } from "@/lib/api-client";

export function GoogleCallbackHandlerClient() {
  const router = useRouter();
  const search = useSearchParams();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [error, setError] = useState<string | null>(null);
  const code = search.get("code");
  const gError = search.get("error");
  const immediateError = gError
    ? `Google sign-in was cancelled: ${gError}`
    : !code
      ? "Missing authorization code from Google."
      : null;

  useEffect(() => {
    if (!code || gError) return;

    let cancelled = false;
    (async () => {
      try {
        const data = await apiClient.googleAuth({ code });
        if (cancelled) return;
        sessionStorage.setItem("unified_auth", JSON.stringify(data));
        setStatus("success");
        if (data.organizations.length > 0) {
          router.push("/select-account");
        } else {
          router.push("/login/google/complete");
        }
      } catch (err: unknown) {
        if (cancelled) return;
        setStatus("error");
        setError(err instanceof Error ? err.message : "Google sign-in failed.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, gError, router]);

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <Spinner className="size-6" />
        <p className="text-sm text-[var(--landing-canvas-ink-soft)]">Signed in. Redirecting…</p>
      </div>
    );
  }

  if (immediateError || status === "error") {
    return (
      <div className="space-y-4 text-center">
        <Alert variant="destructive" className="border-[var(--landing-hair)] bg-destructive/10 text-left">
          <AlertTitle className="text-sm">Sign-in failed</AlertTitle>
          <AlertDescription className="text-xs">
            {immediateError ?? error}
          </AlertDescription>
        </Alert>
        <Button
          type="button"
          variant="link"
          className="text-sm text-[var(--landing-canvas-ink-soft)]"
          onClick={() => router.push("/login")}
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Spinner className="size-6" />
      <p className="text-sm text-[var(--landing-canvas-ink-soft)]">Completing sign-in…</p>
    </div>
  );
}
