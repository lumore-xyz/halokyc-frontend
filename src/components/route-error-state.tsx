"use client";

import Link from "next/link";
import { AlertTriangleIcon, HomeIcon, RefreshCwIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RouteErrorStateProps = {
  reset: () => void;
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
  digest?: string;
  className?: string;
};

export function RouteErrorState({
  reset,
  title = "Something went wrong",
  description = "This view could not load. Retry the request, or return to a stable page and continue from there.",
  homeHref = "/",
  homeLabel = "Home",
  digest,
  className,
}: RouteErrorStateProps) {
  return (
    <main
      className={cn(
        "flex min-h-dvh w-full items-center justify-center bg-background px-6 py-16 text-foreground",
        className,
      )}
    >
      <EmptyState
        icon={AlertTriangleIcon}
        title={title}
        description={description}
        className="w-full max-w-xl"
        action={
          <div className="flex flex-col items-center gap-3">
            {digest ? (
              <p className="font-mono text-xs text-muted-foreground">
                Reference {digest}
              </p>
            ) : null}
            <div className="flex flex-wrap justify-center gap-2">
              <Button type="button" onClick={reset}>
                <RefreshCwIcon data-icon="inline-start" />
                Retry
              </Button>
              <Link
                href={homeHref}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                <HomeIcon data-icon="inline-start" />
                {homeLabel}
              </Link>
            </div>
          </div>
        }
      />
    </main>
  );
}
