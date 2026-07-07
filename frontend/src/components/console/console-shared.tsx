"use client";

import { KeyRound, RefreshCw } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useApiKey } from "@/lib/hooks/use-api-key";

type NoApiKeyStateProps = {
  message?: string;
  title?: string;
  actionHref?: string;
  actionLabel?: string;
  hideWhenApiKey?: boolean;
};

export function NoApiKeyState({
  message,
  title = "Create an API key to begin",
  actionHref = "/dashboard/api-keys",
  actionLabel = "Open API keys",
  hideWhenApiKey = true,
}: NoApiKeyStateProps) {
  const { apiKey } = useApiKey();
  if (hideWhenApiKey && apiKey) return null;
  return (
    <EmptyState
      icon={KeyRound}
      title={title}
      description={
        message ??
        "The console calls the HaloKYC API on your behalf, so it needs a client API key to start sessions and upload evidence."
      }
      action={
        <Button
          render={<Link href={actionHref} />}
          nativeButton={false}
          variant="outline"
          size="sm"
        >
          <KeyRound data-icon="inline-start" /> {actionLabel}
        </Button>
      }
    />
  );
}

type InlineErrorProps = {
  error: unknown;
  title?: string;
  onRetry?: () => void;
};

export function InlineError({ error, title, onRetry }: InlineErrorProps) {
  const message = extractErrorMessage(error);
  return (
    <div
      role="alert"
      className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-semibold">{title ?? "Something went wrong"}</p>
          <p className="text-destructive/90">{message}</p>
        </div>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            aria-label="Retry"
          >
            <RefreshCw className="size-4" aria-hidden /> Retry
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const body = (error as Error & { body?: unknown }).body;
    if (body && typeof body === "object" && "detail" in body) {
      const detail = (body as { detail: unknown }).detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail) && detail.length > 0) {
        const first = detail[0];
        if (first && typeof first === "object" && "msg" in first) {
          return String((first as { msg: unknown }).msg);
        }
        return JSON.stringify(first);
      }
    }
    return error.message;
  }
  return "Unknown error.";
}
