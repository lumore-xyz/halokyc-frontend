import { ShieldCheckIcon } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

type VerifyShellProps = {
  children: React.ReactNode;
  className?: string;
  immersive?: boolean;
};

export function VerifyShell({
  children,
  className,
  immersive = false,
}: VerifyShellProps) {
  return (
    <div
      data-slot="verify-shell"
      className={cn(
        "verify-shell relative flex h-[100dvh] max-h-[100dvh] flex-col items-center justify-start overflow-hidden bg-background",
        immersive ? "p-0 sm:p-4" : "px-4 py-4 sm:px-6 sm:py-6",
        className,
      )}
    >
      <div
        aria-hidden
        className="verify-shell-backdrop pointer-events-none absolute inset-0 -z-10"
      />
      <div
        className={cn(
          "flex min-h-0 w-full max-w-[460px] flex-1 flex-col",
          immersive && "max-w-[460px]",
        )}
      >
        {!immersive ? (
        <div className="flex justify-center pb-4">
          <BrandLogo
            variant="wordmark-dark"
            priority
            className="h-9 w-36"
          />
        </div>
        ) : null}
<div
    className={cn(
      "verify-card flex min-h-0 flex-1 flex-col overflow-y-auto border bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_80px_rgba(15,23,42,0.08)]",
            immersive
              ? "!p-0 rounded-none border-0 sm:rounded-2xl sm:border"
              : "rounded-2xl border-border",
          )}
        >
          {children}
        </div>
        {!immersive ? (
        <div className="flex items-center justify-center gap-1.5 pt-4 text-xs text-muted-foreground">
          <ShieldCheckIcon className="size-3.5" strokeWidth={1.75} aria-hidden />
          <span>Secured by</span>
          <BrandLogo variant="icon-color" className="size-4" />
          <span className="font-medium text-foreground">HaloKYC</span>
        </div>
        ) : null}
      </div>
    </div>
  );
}
