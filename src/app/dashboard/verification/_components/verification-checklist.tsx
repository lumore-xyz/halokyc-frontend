"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  CheckIcon,
  LockKeyholeIcon,
  MailCheckIcon,
  ScanFaceIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  useAccountVerification,
  useStartAccountVerification,
} from "@/lib/hooks/use-account-verification";
import { useClientSession } from "@/lib/hooks/use-client-session";
import { cn } from "@/lib/utils";

export function VerificationChecklist() {
  const session = useClientSession();
  const emailVerified = session.data?.emailVerified === true;
  const verification = useAccountVerification(
    session.data?.authenticated === true && emailVerified,
  );
  const start = useStartAccountVerification();
  const status = verification.data?.status ?? null;
  const identityVerified = status === "approved";
  const complete = emailVerified && identityVerified;

  async function startIdentityVerification() {
    try {
      const result = await start.mutateAsync();
      if (result.verify_url) window.location.assign(result.verify_url);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Identity verification could not start.",
      );
    }
  }

  if (session.isLoading) {
    return <Spinner className="mt-8" />;
  }
  if (!session.data?.authenticated) {
    return (
      <Alert>
        <LockKeyholeIcon aria-hidden />
        <AlertTitle>Sign in required</AlertTitle>
        <AlertDescription>
          Sign in to view your account verification status.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <section className="space-y-5" aria-label="Account verification steps">
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium",
          complete
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "bg-muted/40 text-muted-foreground",
        )}
      >
        {complete ? (
          <CheckIcon className="size-4" aria-hidden />
        ) : (
          <LockKeyholeIcon className="size-4" aria-hidden />
        )}
        {complete
          ? "Account verification complete — sensitive actions are unlocked."
          : "Sensitive actions stay locked until both steps are complete."}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <VerificationStep
            number="01"
            icon={MailCheckIcon}
            title="Verify email"
            description={
              emailVerified
                ? `${session.data.email ?? "Your email"} has been confirmed.`
                : "Confirm the email address used to create your HaloKYC account."
            }
            state={emailVerified ? "complete" : "current"}
            action={
              emailVerified ? null : (
                <Button
                  variant="outline"
                  render={<Link href="/resend-verification" />}
                  nativeButton={false}
                >
                  Send verification email
                  <ArrowRightIcon aria-hidden />
                </Button>
              )
            }
          />
          <VerificationStep
            number="02"
            icon={ScanFaceIcon}
            title="Identity verification"
            description={identityDescription(status, emailVerified)}
            state={
              identityVerified
                ? "complete"
                : emailVerified
                  ? "current"
                  : "locked"
            }
            action={identityAction({
              emailVerified,
              configured: verification.data?.configured,
              status,
              pending: start.isPending,
              onStart: startIdentityVerification,
            })}
          />
        </CardContent>
      </Card>
      <p className="text-muted-foreground max-w-2xl text-xs leading-5">
        Verification protects API credentials, billing, team access, workflows,
        review decisions, webhooks, and subject-management actions.
      </p>
    </section>
  );
}

type StepState = "complete" | "current" | "locked";

function VerificationStep({
  number,
  icon: Icon,
  title,
  description,
  state,
  action,
}: {
  number: string;
  icon: typeof MailCheckIcon;
  title: string;
  description: string;
  state: StepState;
  action: React.ReactNode;
}) {
  return (
    <div className="relative grid gap-5 border-b p-5 last:border-b-0 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
      <div className="flex items-center gap-4">
        <span
          className={cn(
            "relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border",
            state === "complete" &&
              "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
            state === "current" &&
              "border-primary/30 bg-primary/10 text-primary",
            state === "locked" && "bg-muted text-muted-foreground",
          )}
        >
          {state === "complete" ? (
            <CheckIcon aria-hidden />
          ) : (
            <Icon aria-hidden />
          )}
        </span>
        <span className="text-muted-foreground font-mono text-xs">
          {number}
        </span>
      </div>
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold tracking-tight">{title}</h2>
          <Badge variant={state === "complete" ? "default" : "secondary"}>
            {state === "complete"
              ? "Verified"
              : state === "locked"
                ? "Locked"
                : "Action required"}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm leading-6">{description}</p>
      </div>
      <div className="sm:justify-self-end">{action}</div>
    </div>
  );
}

function identityDescription(status: string | null, emailVerified: boolean) {
  if (!emailVerified) return "Available after your email address is verified.";
  if (status === "approved") return "Your identity has been confirmed.";
  if (status === "manual_review")
    return "Your submission is awaiting a manual decision.";
  if (status === "rejected")
    return "We could not approve this submission. Contact support for the next step.";
  if (status === "processing" || status === "awaiting_credits")
    return "Your evidence was submitted. This status updates automatically.";
  if (status === "pending_upload")
    return "Continue the secure ID document and selfie check.";
  return "Confirm it is really you with an ID document and a selfie.";
}

function identityAction({
  emailVerified,
  configured,
  status,
  pending,
  onStart,
}: {
  emailVerified: boolean;
  configured: boolean | undefined;
  status: string | null;
  pending: boolean;
  onStart: () => void;
}) {
  if (
    !emailVerified ||
    status === "approved" ||
    status === "manual_review" ||
    status === "rejected" ||
    status === "processing" ||
    status === "awaiting_credits"
  )
    return null;
  if (configured === false)
    return (
      <span className="text-muted-foreground text-xs">
        Unavailable on this deployment
      </span>
    );
  return (
    <Button type="button" onClick={onStart} disabled={pending}>
      {pending ? <Spinner data-icon="inline-start" /> : null}
      {status === "pending_upload"
        ? "Continue verification"
        : "Verify identity"}
      {!pending ? <ArrowRightIcon aria-hidden /> : null}
    </Button>
  );
}
