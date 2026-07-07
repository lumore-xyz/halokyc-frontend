"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheckIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAdminLogin } from "@/lib/hooks/use-admin-session";

export function AdminLoginForm() {
  const router = useRouter();
  const login = useAdminLogin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!username.trim() || !password) return;
    try {
      await login.mutateAsync({ username: username.trim(), password });
      router.push("/admin");
    } catch {
      // Mutation state renders the error.
    }
  }

  const usernameInvalid = submitted && !username.trim();
  const passwordInvalid = submitted && !password;

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <FieldGroup className="space-y-4">
        <Field data-invalid={usernameInvalid || undefined}>
          <FieldLabel
            htmlFor="admin-username"
            className="text-xs tracking-wider text-[var(--landing-canvas-ink-soft)] uppercase"
          >
            Username
          </FieldLabel>
          <Input
            id="admin-username"
            autoComplete="username"
            placeholder="admin"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            aria-invalid={usernameInvalid}
            className="h-11 border-white/[0.1] bg-white/[0.03] backdrop-blur-md transition-all focus-visible:border-[var(--landing-cyan)] focus-visible:ring-1 focus-visible:ring-[var(--landing-cyan)]"
          />
          {usernameInvalid ? (
            <FieldError className="text-xs font-mono">
              Enter the admin username.
            </FieldError>
          ) : null}
        </Field>
        <Field data-invalid={passwordInvalid || undefined}>
          <FieldLabel
            htmlFor="admin-password"
            className="text-xs tracking-wider text-[var(--landing-canvas-ink-soft)] uppercase"
          >
            Password
          </FieldLabel>
          <Input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={passwordInvalid}
            className="h-11 border-white/[0.1] bg-white/[0.03] backdrop-blur-md transition-all focus-visible:border-[var(--landing-cyan)] focus-visible:ring-1 focus-visible:ring-[var(--landing-cyan)]"
          />
          {passwordInvalid ? (
            <FieldError className="text-xs font-mono">
              Enter the admin password.
            </FieldError>
          ) : null}
        </Field>
      </FieldGroup>

      {login.error ? (
        <Alert
          variant="destructive"
          className="border-[var(--landing-hair)] bg-destructive/10"
        >
          <AlertTitle className="text-sm">Sign in failed</AlertTitle>
          <AlertDescription className="text-xs">
            Check the admin username and password, then try again.
          </AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="submit"
        className="h-11 w-full bg-[var(--landing-cyan)] text-[var(--landing-canvas)] transition-all hover:bg-[color-mix(in_oklch,var(--landing-cyan)_88%,white)]"
        disabled={login.isPending}
      >
        {login.isPending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <ShieldCheckIcon data-icon="inline-start" />
        )}
        {login.isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
