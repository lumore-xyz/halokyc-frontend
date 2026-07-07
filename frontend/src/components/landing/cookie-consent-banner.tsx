"use client";

import { CookieIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { useCookieConsent } from "./cookie-consent";

const CATEGORY_DESCRIPTIONS: Record<
  "essential" | "analytics",
  { label: string; description: string; required: boolean }
> = {
  essential: {
    label: "Essential",
    description:
      "Required for the site to work: security, session management, and load balancing. Always on.",
    required: true,
  },
  analytics: {
    label: "Analytics",
    description:
      "Anonymized usage metrics that help us improve the product. We never share this with advertisers.",
    required: false,
  },
};

type CookieConsentBannerProps = {
  className?: string;
};

export function CookieConsentBanner({ className }: CookieConsentBannerProps) {
  const { showBanner, decide } = useCookieConsent();
  const [analytics, setAnalytics] = useState(false);
  const [details, setDetails] = useState(false);
  const analyticsId = useId();
  const headingId = useId();

  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={headingId}
      data-slot="cookie-consent-banner"
      className={cn(
        "border-border/70 bg-popover text-popover-foreground fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-xl border p-4 shadow-lg sm:bottom-6 sm:p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="bg-primary/10 text-primary hidden h-9 w-9 shrink-0 items-center justify-center rounded-full sm:flex"
        >
          <CookieIcon className="size-4" strokeWidth={1.75} />
        </span>
        <div className="flex flex-1 flex-col gap-3">
          <header className="flex items-start justify-between gap-3">
            <h2
              id={headingId}
              className="text-base font-semibold tracking-tight"
            >
              Cookies on HaloKYC
            </h2>
            <button
              type="button"
              aria-label="Dismiss cookie notice"
              onClick={() => decide(false)}
              className="text-muted-foreground hover:text-foreground -mr-1 -mt-1 inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors"
            >
              <XIcon className="size-4" />
            </button>
          </header>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We use essential cookies to keep HaloKYC secure and reliable.
            Non-essential cookies (analytics) require your explicit opt-in.
            See our{" "}
            <Link href="/privacy" className="underline underline-offset-4">
              Privacy Policy
            </Link>{" "}
            for the full breakdown.
          </p>

          {details ? (
            <ul className="flex flex-col gap-2 text-sm">
              {Object.entries(CATEGORY_DESCRIPTIONS).map(([key, info]) => {
                const id = `${analyticsId}-${key}`;
                const checked = key === "essential" ? true : analytics;
                return (
                  <li
                    key={key}
                    className="border-border/60 flex items-start gap-3 rounded-lg border bg-background/40 p-3"
                  >
                    <Checkbox
                      id={id}
                      checked={checked}
                      disabled={info.required}
                      onCheckedChange={(value) => {
                        if (key === "analytics") {
                          setAnalytics(value === true);
                        }
                      }}
                    />
                    <div className="flex flex-col gap-0.5">
                      <Label
                        htmlFor={id}
                        className="text-sm font-medium leading-snug"
                      >
                        {info.label}
                        {info.required ? (
                          <span className="text-muted-foreground ml-1 text-xs font-normal">
                            (always on)
                          </span>
                        ) : null}
                      </Label>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {info.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => decide(details ? analytics : true)}
            >
              Accept all
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => decide(false)}
            >
              Essential only
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setDetails((value) => !value)}
              aria-expanded={details}
              aria-controls={`${analyticsId}-details`}
            >
              {details ? "Hide details" : "Customize"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
