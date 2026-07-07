"use client";

import { ShieldCheckIcon } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/**
 * The version of the privacy policy the subject is consenting to.
 * Bump this whenever `/privacy` makes a material change. The
 * captured value is sent to the backend with the consent record so
 * auditors can prove the user agreed to the version that was live
 * at the time, not the version that exists today.
 */
export const CONSENT_POLICY_VERSION = "2026-07-03";

export type ConsentRecord = {
  policy_version: string;
  consent_timestamp: string;
  ip_address: string | null;
  device_id: string | null;
  session_id: string | null;
};

type ConsentCardProps = {
  sessionId?: string | null;
  onAccept: (record: ConsentRecord) => void;
  pending?: boolean;
  policyVersion?: string;
  className?: string;
};

const RETENTION_SUMMARY = {
  evidence: "Verification evidence is kept until you request deletion or your account is closed.",
  embeddings: "Face embeddings are kept until duplicate detection is no longer required, or until a ban is lifted.",
  audit: "Audit logs and final verdicts are retained permanently for compliance.",
} as const;

function appendSessionId(value: string, sessionId: string | null | undefined): string {
  if (!sessionId) return value;
  return `${value}#${sessionId}`;
}

function readDeviceId(): string | null {
  if (typeof window === "undefined") return null;
  const storageKey = "halokyc.deviceId";
  try {
    const existing = window.localStorage.getItem(storageKey);
    if (existing) return existing;
    const next = crypto.randomUUID();
    window.localStorage.setItem(storageKey, next);
    return next;
  } catch {
    return null;
  }
}

export function ConsentCard({
  sessionId,
  onAccept,
  pending,
  policyVersion = CONSENT_POLICY_VERSION,
  className,
}: ConsentCardProps) {
  const checkboxId = useId();
  const [accepted, setAccepted] = useState(false);

  function handleAccept() {
    const record: ConsentRecord = {
      policy_version: policyVersion,
      consent_timestamp: new Date().toISOString(),
      ip_address: null,
      device_id: readDeviceId(),
      session_id: sessionId ?? null,
    };
    onAccept(record);
  }

  return (
    <section
      aria-labelledby={`${checkboxId}-heading`}
      className={cn(
        "border-border/70 bg-card flex flex-col gap-4 rounded-xl border p-5 text-left",
        className,
      )}
    >
      <header className="flex items-start gap-3">
        <span
          aria-hidden
          className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        >
          <ShieldCheckIcon className="size-4" strokeWidth={1.75} />
        </span>
        <div className="flex flex-col gap-1">
          <h2
            id={`${checkboxId}-heading`}
            className="text-foreground text-base font-semibold tracking-tight"
          >
            Privacy Notice
          </h2>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Before you continue, tell us what we will collect, why we need it, how long we keep it,
            and who can see it.
          </p>
        </div>
      </header>

      <dl className="grid gap-3 text-xs">
        <ConsentRow label="What we collect" value="A photo of your face, your ID document, and basic device metadata (IP, browser, device id)." />
        <ConsentRow label="Why we collect it" value="To verify your identity, run liveness and face-match checks, and protect against duplicate and fraudulent accounts." />
        <ConsentRow label="How long we keep it" value={RETENTION_SUMMARY.evidence} />
        <ConsentRow label="Who can see it" value="The business that asked you to verify, and HaloKYC operators acting on their behalf. We do not sell biometric data." />
      </dl>

      <a
        href="/privacy"
        target="_blank"
        rel="noreferrer"
        className="text-foreground text-xs font-medium underline underline-offset-4"
      >
        Read the full Privacy Policy
      </a>

      <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/40 p-3">
        <Checkbox
          id={checkboxId}
          checked={accepted}
          onCheckedChange={(value) => setAccepted(value === true)}
          disabled={pending}
          aria-describedby={`${checkboxId}-description`}
        />
        <div className="flex flex-col gap-1">
          <Label htmlFor={checkboxId} className="text-sm font-medium leading-snug">
            I have read the Privacy Notice and consent to HaloKYC processing my biometric and
            identity data for this verification.
          </Label>
          <p
            id={`${checkboxId}-description`}
            className="text-muted-foreground text-xs leading-relaxed"
          >
            Policy version <span className="font-mono">{policyVersion}</span>.
            You can withdraw consent at any time from the{" "}
            <a href="/privacy/dashboard" className="underline underline-offset-4">
              privacy dashboard
            </a>
            .
          </p>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!accepted || pending) return;
          handleAccept();
        }}
        className="mt-auto"
      >
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!accepted || pending}
        >
          {pending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <ShieldCheckIcon data-icon="inline-start" />
          )}
          {pending ? "Saving consent..." : "I consent, continue"}
        </Button>
      </form>
    </section>
  );
}

function ConsentRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-foreground text-[11px] font-semibold uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-muted-foreground leading-relaxed">{value}</dd>
    </div>
  );
}

export function buildConsentAuditKey(sessionId: string | null | undefined): string {
  return appendSessionId("halokyc.consent", sessionId);
}
