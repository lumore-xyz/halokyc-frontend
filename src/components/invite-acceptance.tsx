"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2Icon,
  ClockIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { AccountActionShell } from "@/components/account-action-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  ApiError,
  apiClient,
  type InvitationInspectResponse,
  type InvitationType,
} from "@/lib/api-client";
import { useAccountActionToken } from "@/lib/hooks/use-account-action-token";

type InviteAcceptanceProps = {
  expectedType: InvitationType;
};

type InviteState = "loading" | "ready" | "missing" | "invalid" | "accepted";

const ROLE_LABELS: Record<string, string> = {
  client_owner: "Owner",
  client_admin: "Admin",
  client_reviewer: "Reviewer",
  client_developer: "Developer",
  platform_owner: "Platform owner",
  platform_business_admin: "Business admin",
  platform_support: "Support",
  platform_sales: "Sales",
};

export function InviteAcceptance({ expectedType }: InviteAcceptanceProps) {
  const token = useAccountActionToken();
  const inspected = useRef(false);
  const [state, setState] = useState<InviteState>("loading");
  const [invite, setInvite] = useState<InvitationInspectResponse | null>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token === undefined || inspected.current) return;
    if (token === null) return;
    inspected.current = true;
    apiClient.inspectInvitation(token).then(
      (result) => {
        if (result.invite_type !== expectedType) {
          setState("invalid");
          return;
        }
        setInvite(result);
        setState("ready");
      },
      () => setState("invalid"),
    );
  }, [expectedType, token]);
  const visibleState = token === null ? "missing" : state;

  const passwordInvalid =
    submitted && Boolean(invite?.requires_password) && password.length < 8;
  const confirmationInvalid =
    submitted &&
    Boolean(invite?.requires_password) &&
    confirmation !== password;

  async function accept(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!token || !invite || passwordInvalid || confirmationInvalid) return;
    if (invite.requires_password && password.length < 8) return;
    setAccepting(true);
    setError(null);
    try {
      await apiClient.acceptInvitation({
        token,
        ...(invite.requires_password ? { password } : {}),
      });
      setPassword("");
      setConfirmation("");
      setState("accepted");
    } catch (cause) {
      setError(inviteErrorMessage(cause));
    } finally {
      setAccepting(false);
    }
  }

  const isAdmin = expectedType === "platform_admin";
  return (
    <AccountActionShell
      title={isAdmin ? "Accept admin invitation" : "Join your HaloKYC team"}
      description={
        isAdmin
          ? "Review and accept your invitation to the HaloKYC operator console."
          : "Review and accept the secure invitation to your organization."
      }
      backHref={isAdmin ? "/admin/login" : "/login"}
    >
      <div aria-live="polite" className="space-y-6">
        {visibleState === "loading" ? (
          <div className="flex items-center gap-3 text-sm">
            <Spinner />
            Checking invitation…
          </div>
        ) : null}
        {visibleState === "missing" || visibleState === "invalid" ? (
          <Alert variant="destructive">
            <TriangleAlertIcon aria-hidden />
            <AlertTitle>
              {visibleState === "missing"
                ? "Invitation token missing"
                : "Invitation unavailable"}
            </AlertTitle>
            <AlertDescription>
              Open the complete link from your email. The invitation may have
              expired, been revoked, or already been used.
            </AlertDescription>
          </Alert>
        ) : null}
        {visibleState === "ready" && invite ? (
          <>
            <div className="space-y-3 rounded-xl border border-white/10 bg-black/10 p-4 text-sm">
              {invite.organization_name ? (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--landing-canvas-ink-soft)]">
                    Organization
                  </span>
                  <span className="font-medium">
                    {invite.organization_name}
                  </span>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--landing-canvas-ink-soft)]">
                  Invited by
                </span>
                <span className="font-medium">{invite.inviter_name}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--landing-canvas-ink-soft)]">
                  Role
                </span>
                <Badge variant="outline">
                  {invite.role
                    ? (ROLE_LABELS[invite.role] ?? invite.role)
                    : "Member"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 text-[var(--landing-canvas-ink-soft)]">
                  <ClockIcon className="size-4" aria-hidden />
                  Expires
                </span>
                <span>{new Date(invite.expires_at).toLocaleDateString()}</span>
              </div>
            </div>
            <form onSubmit={accept} className="space-y-5" noValidate>
              {invite.requires_password ? (
                <>
                  <Field data-invalid={passwordInvalid || undefined}>
                    <FieldLabel htmlFor="invite-password">
                      Create password
                    </FieldLabel>
                    <Input
                      id="invite-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={255}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      disabled={accepting}
                    />
                    {passwordInvalid ? (
                      <FieldError>Use at least 8 characters.</FieldError>
                    ) : null}
                  </Field>
                  <Field data-invalid={confirmationInvalid || undefined}>
                    <FieldLabel htmlFor="invite-password-confirmation">
                      Confirm password
                    </FieldLabel>
                    <Input
                      id="invite-password-confirmation"
                      type="password"
                      autoComplete="new-password"
                      value={confirmation}
                      onChange={(event) => setConfirmation(event.target.value)}
                      disabled={accepting}
                    />
                    {confirmationInvalid ? (
                      <FieldError>Passwords must match.</FieldError>
                    ) : null}
                  </Field>
                </>
              ) : (
                <Alert>
                  <ShieldCheckIcon aria-hidden />
                  <AlertTitle>
                    Your existing credentials stay unchanged
                  </AlertTitle>
                  <AlertDescription>
                    Accepting adds this access to your existing HaloKYC account.
                  </AlertDescription>
                </Alert>
              )}
              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>Invitation not accepted</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <Button type="submit" disabled={accepting}>
                {accepting ? <Spinner data-icon="inline-start" /> : null}
                {accepting ? "Accepting…" : "Accept invitation"}
              </Button>
            </form>
          </>
        ) : null}
        {visibleState === "accepted" && invite ? (
          <>
            <Alert>
              <CheckCircle2Icon aria-hidden />
              <AlertTitle>Invitation accepted</AlertTitle>
              <AlertDescription>
                Your access is active. Sign in to continue.
              </AlertDescription>
            </Alert>
            <Button
              render={<Link href={invite.login_path} />}
              nativeButton={false}
            >
              Sign in
            </Button>
          </>
        ) : null}
      </div>
    </AccountActionShell>
  );
}

function inviteErrorMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 400) {
    return "The invitation could not be accepted. It may have expired, been revoked, or already been used.";
  }
  return "Check your connection and try again.";
}
