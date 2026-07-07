"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Loader2Icon, SettingsIcon } from "lucide-react";

import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { AppShell } from "@/components/dashboard/app-shell";
import { PlatformRouteGuard } from "@/components/dashboard/platform-route-guard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api-client";
import {
  useAdminSystemSettings,
  useUpdateAdminSystemSettings,
} from "@/lib/hooks/use-admin-console";

export default function AdminSystemSettingsPage() {
  return (
    <AppShell audience="admin">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
        <PlatformRouteGuard allowedRoles={["platform_owner"]} fallbackHref="/admin">
          <SystemSettingsBody />
        </PlatformRouteGuard>
      </main>
    </AppShell>
  );
}

function SystemSettingsBody() {
  const query = useAdminSystemSettings();
  const update = useUpdateAdminSystemSettings();
  const [creditCost, setCreditCost] = useState<string | null>(null);
  const [jwtTtl, setJwtTtl] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const effectiveCreditCost =
    creditCost ?? (query.data ? String(query.data.credit_cost_per_verification) : "");
  const effectiveJwtTtl =
    jwtTtl ?? (query.data ? String(query.data.jwt_access_token_expire_minutes) : "");

  const creditCostNumber = Number.parseInt(effectiveCreditCost, 10);
  const jwtTtlNumber = Number.parseInt(effectiveJwtTtl, 10);
  const creditCostError =
    submitted && (!Number.isFinite(creditCostNumber) || creditCostNumber < 1)
      ? "Must be a positive integer."
      : null;
  const jwtTtlError =
    submitted && (!Number.isFinite(jwtTtlNumber) || jwtTtlNumber < 1)
      ? "Must be a positive integer."
      : null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (creditCostError || jwtTtlError) return;
    update.mutate(
      {
        credit_cost_per_verification: creditCostNumber,
        jwt_access_token_expire_minutes: jwtTtlNumber,
      },
      {
        onSuccess: () => {
          toast.success("Settings updated");
          setSubmitted(false);
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            toast.error(`Update failed: ${err.status}`);
          } else {
            toast.error("Update failed");
          }
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        icon={SettingsIcon}
        title="System settings"
        description="Platform-wide knobs. Changes are audited and immediately visible to all customers."
      />

      <Card>
        <CardHeader>
          <CardTitle>Cost & auth</CardTitle>
          <CardDescription>
            Adjust the credit cost per verification and the JWT access
            token lifetime. Both are required to be at least 1.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <form
              onSubmit={submit}
              className="grid gap-4 sm:grid-cols-2"
              noValidate
            >
              <FieldGroup>
                <Field data-invalid={Boolean(creditCostError) || undefined}>
                  <FieldLabel htmlFor="settings-credit-cost">
                    Credit cost per verification
                  </FieldLabel>
                  <Input
                    id="settings-credit-cost"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    value={effectiveCreditCost}
                    onChange={(event) => setCreditCost(event.target.value)}
                  />
                  <FieldDescription>
                    Charged from the organization&rsquo;s wallet at verification
                    start. Existing reservations are not re-priced.
                  </FieldDescription>
                  {creditCostError ? (
                    <FieldError>{creditCostError}</FieldError>
                  ) : null}
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field data-invalid={Boolean(jwtTtlError) || undefined}>
                  <FieldLabel htmlFor="settings-jwt-ttl">
                    JWT access token TTL (minutes)
                  </FieldLabel>
                  <Input
                    id="settings-jwt-ttl"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    value={effectiveJwtTtl}
                    onChange={(event) => setJwtTtl(event.target.value)}
                  />
                  <FieldDescription>
                    Applies to client and admin tokens issued after the
                    change. Existing tokens keep their original expiry.
                  </FieldDescription>
                  {jwtTtlError ? (
                    <FieldError>{jwtTtlError}</FieldError>
                  ) : null}
                </Field>
              </FieldGroup>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" disabled={update.isPending}>
                  {update.isPending ? (
                    <Loader2Icon data-icon="inline-start" className="animate-spin" aria-hidden />
                  ) : null}
                  Save settings
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertTitle>Audit impact</AlertTitle>
        <AlertDescription>
          Updates log a <code>platform_admin_system_settings_updated</code>
          row with old + new values. Visit{" "}
          <a className="underline" href="/admin/audit-logs">
            Audit logs
          </a>{" "}
          to review the history.
        </AlertDescription>
      </Alert>
    </div>
  );
}