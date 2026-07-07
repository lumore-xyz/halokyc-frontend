"use client";

import { ClockIcon } from "lucide-react";
import type { FormEvent } from "react";

import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { AppShell } from "@/components/dashboard/app-shell";
import { PlatformRouteGuard } from "@/components/dashboard/platform-route-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  useRetentionPolicies,
  useUpdateRetentionPolicy,
} from "@/lib/hooks/use-compliance-admin";

export default function AdminRetentionPage() {
  return (
    <AppShell audience="admin">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
        <PlatformRouteGuard
          allowedRoles={["platform_owner", "platform_business_admin"]}
          fallbackHref="/admin"
        >
          <AdminRetentionBody />
        </PlatformRouteGuard>
      </main>
    </AppShell>
  );
}

function AdminRetentionBody() {
  const policies = useRetentionPolicies();
  const updatePolicy = useUpdateRetentionPolicy();
  const globalPolicy = policies.data?.find((policy) => policy.scope === "global");

  function submitRetention(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    updatePolicy.mutate({
      scope: "global",
      evidence_retention_days: Number(data.get("evidence_retention_days")),
      embedding_retention_days: nullableNumber(data.get("embedding_retention_days")),
      webhook_log_retention_days: nullableNumber(data.get("webhook_log_retention_days")),
      audit_log_retention_days: null,
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        icon={ClockIcon}
        title="Retention configuration"
        description="Configure global evidence retention. The scheduled retention job reads these settings on its next run and removes expired evidence files, eligible face embeddings, and webhook logs."
      />

      <Card>
        <CardHeader>
          <CardTitle>Evidence retention</CardTitle>
          <CardDescription>
            Number of days to retain verification evidence (selfies, ID
            images, and uploaded document files) before the engine purges
            file storage and evidence-file rows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6" onSubmit={submitRetention}>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="evidence-retention-days">Global default (days)</FieldLabel>
              <div className="flex flex-col gap-2">
                <Input
                  id="evidence-retention-days"
                  name="evidence_retention_days"
                  type="number"
                  min={1}
                  max={3650}
                  defaultValue={globalPolicy?.evidence_retention_days ?? 30}
                  aria-describedby="evidence-retention-help"
                />
                <FieldDescription id="evidence-retention-help">
                  Falls back to this value for any organisation that does
                  not override it.
                </FieldDescription>
              </div>
            </Field>

            <Field orientation="horizontal">
              <FieldLabel htmlFor="embedding-retention-days">Face embedding retention (days)</FieldLabel>
              <div className="flex flex-col gap-2">
                <Input
                  id="embedding-retention-days"
                  name="embedding_retention_days"
                  type="number"
                  min={0}
                  max={3650}
                  defaultValue={globalPolicy?.embedding_retention_days ?? 365}
                />
                <FieldDescription>
                  Set to 0 to purge face embeddings the moment a verification
                  reaches the retention window. Set to empty to keep
                  duplicate-detection embeddings unless explicit subject
                  lifecycle deletion removes them. Active ban-match embeddings
                  are retained while the ban is active.
                </FieldDescription>
              </div>
            </Field>

            <Field orientation="horizontal">
              <FieldLabel htmlFor="webhook-retention-days">Webhook log retention (days)</FieldLabel>
              <div className="flex flex-col gap-2">
                <Input
                  id="webhook-retention-days"
                  name="webhook_log_retention_days"
                  type="number"
                  min={1}
                  max={365}
                  defaultValue={globalPolicy?.webhook_log_retention_days ?? 90}
                />
                <FieldDescription>
                  Webhook delivery attempts older than this window are
                  pruned by the existing <code className="font-mono">purge-webhook-logs</code>{" "}
                  CLI job.
                </FieldDescription>
              </div>
            </Field>

            {policies.error ? (
              <div className="bg-warning/10 text-warning-foreground border-warning/30 rounded-lg border p-3 text-xs leading-relaxed">
                {policies.error.message}
              </div>
            ) : null}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={policies.isLoading || updatePolicy.isPending}
                className="bg-primary text-primary-foreground inline-flex h-8 items-center justify-center rounded-lg border border-transparent px-3 text-sm font-medium disabled:opacity-50"
              >
                {updatePolicy.isPending ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scoped overrides</CardTitle>
          <CardDescription>
            Organization and workspace policies can be stored for future
            policy resolution. The scheduled purge currently applies the
            global policy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-muted-foreground flex flex-col gap-2 text-sm">
            {(policies.data ?? []).map((policy) => (
              <li
                key={policy.id}
                className="flex items-center justify-between rounded-md border border-dashed border-border/60 px-3 py-2"
              >
                <span>
                  {policy.scope}
                  {policy.scope_id ? ` / ${policy.scope_id}` : ""}
                </span>
                <code className="font-mono text-xs">
                  evidence {policy.evidence_retention_days} days
                </code>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function nullableNumber(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
