"use client";

import { useMemo, useState } from "react";
import {
  ActivityIcon,
  CoinsIcon,
  CreditCardIcon,
  ListFilterIcon,
  PackageIcon,
  ScrollTextIcon,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { Metric } from "@/components/dashboard/metric";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CreditLedgerEntryType } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import {
  useBillingCatalog,
  useBillingSubscription,
  useCreateCreditPackCheckout,
  useCreateSubscriptionCheckout,
} from "@/lib/hooks/use-billing";
import { useMyCreditLedger } from "@/lib/hooks/use-credit-ledger";
import { useClientSession } from "@/lib/hooks/use-client-session";
import { useWorkspaces } from "@/lib/hooks/use-workspaces";
import { cn } from "@/lib/utils";

const ENTRY_TYPE_LABEL: Record<CreditLedgerEntryType, string> = {
  signup_bonus: "Signup bonus",
  free_top_up: "Free top-up",
  subscription_grant: "Subscription grant",
  purchase: "Purchase",
  reservation: "Reservation",
  settlement: "Settlement",
  release: "Release",
  adjustment: "Adjustment",
};

const ENTRY_TYPE_DESCRIPTION: Record<CreditLedgerEntryType, string> = {
  signup_bonus: "One-time grant awarded when the organization joined.",
  free_top_up: "Monthly grant for free-tier organizations.",
  subscription_grant: "Monthly grant tied to your subscription plan.",
  purchase: "Credits added after a successful top-up purchase.",
  reservation: "Credits held while a verification is in flight.",
  settlement: "Reservation converted to a charge when a session completes.",
  release: "Reservation returned when a session is abandoned or fails.",
  adjustment: "Manual adjustment from HaloKYC support or your admin.",
};

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

function formatDelta(value: number) {
  if (value === 0) return "0";
  const sign = value > 0 ? "+" : "−";
  return `${sign}${Math.abs(value).toLocaleString()}`;
}

export function BillingPanel() {
  const session = useClientSession();
  const workspaces = useWorkspaces();
  const [workspaceFilter, setWorkspaceFilter] = useState<string>("all");
  const [checkoutKey, setCheckoutKey] = useState<string | null>(null);

  const filter = workspaceFilter === "all" ? null : workspaceFilter;
  const ledger = useMyCreditLedger({ workspaceId: filter });
  const catalog = useBillingCatalog();
  const subscription = useBillingSubscription();
  const subscriptionCheckout = useCreateSubscriptionCheckout();
  const creditPackCheckout = useCreateCreditPackCheckout();
  const balance = ledger.data?.balance;
  const entries = ledger.data?.entries ?? [];
  const reservedSessions = ledger.data?.reserved_sessions ?? [];

  const workspaceNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const workspace of workspaces.data ?? []) {
      map.set(workspace.workspace_id, workspace.name);
    }
    return map;
  }, [workspaces.data]);

  const isLoading = ledger.isLoading || workspaces.isLoading;

  async function startCheckout(
    kind: "subscription" | "credit_pack",
    key: string,
  ) {
    setCheckoutKey(`${kind}:${key}`);
    try {
      const result =
        kind === "subscription"
          ? await subscriptionCheckout.mutateAsync(key)
          : await creditPackCheckout.mutateAsync(key);
      window.location.assign(result.checkout_url);
    } catch (error) {
      setCheckoutKey(null);
      toast.error(
        error instanceof Error ? error.message : "Could not start checkout",
      );
    }
  }

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Billing</h1>
        <p className="text-muted-foreground max-w-2xl">
          Organization-level credit balance. Every verification is reserved
          before processing and settled only when the session reaches approved,
          rejected, or needs review. Processing failures and abandoned sessions
          release the reservation instead of charging.
        </p>
      </header>

      {ledger.isLoading ? (
        <Card>
          <CardContent className="flex justify-center py-12">
            <Spinner />
          </CardContent>
        </Card>
      ) : balance ? (
        <section
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Balance"
        >
          <Metric
            label="Available"
            value={balance.available_credits}
            icon={CoinsIcon}
            description="Ready to spend on verifications"
          />
          <Metric
            label="Reserved"
            value={balance.reserved_credits}
            icon={ActivityIcon}
            description="Held for sessions in progress"
          />
          <Metric
            label="Free"
            value={balance.free_credits}
            icon={CoinsIcon}
            description="Granted credits (signup bonus and monthly top-ups)"
          />
          <Metric
            label="Subscription + purchased"
            value={balance.subscription_credits + balance.purchased_credits}
            icon={CoinsIcon}
            description="Subscription grants and purchased credits"
          />
        </section>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              Could not load the credit balance.
            </p>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-4 lg:grid-cols-3" aria-label="Plans">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Current plan</CardTitle>
            <CardDescription>
              Credits from subscriptions land in HaloKYC&apos;s ledger after Dodo
              confirms the subscription event.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-32 flex-col justify-center gap-2">
            {subscription.isLoading ? (
              <Spinner />
            ) : subscription.data ? (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{subscription.data.status}</Badge>
                  <span className="text-lg font-semibold capitalize">
                    {subscription.data.plan_key}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  {subscription.data.monthly_credits.toLocaleString()} credits
                  per month
                </p>
                {subscription.data.current_period_end ? (
                  <p className="text-muted-foreground text-xs">
                    Renews {formatDate(subscription.data.current_period_end)}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                No active subscription is mirrored yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly subscriptions</CardTitle>
            <CardDescription>
              Choose a recurring credit grant. Existing wallet balances stay in
              HaloKYC and continue to be consumed by the ledger.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {catalog.isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {(catalog.data?.subscriptions ?? []).map((plan) => {
                  const loading = checkoutKey === `subscription:${plan.key}`;
                  return (
                    <div
                      key={plan.key}
                      className="flex min-h-44 flex-col justify-between rounded-lg border border-[var(--dashboard-rule)] p-4"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold">{plan.name}</h3>
                          <CreditCardIcon
                            className="text-muted-foreground size-4"
                            aria-hidden
                          />
                        </div>
                        <p className="text-2xl font-semibold">
                          {formatUsd(plan.price_usd_cents)}
                          <span className="text-muted-foreground text-sm font-normal">
                            /mo
                          </span>
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {plan.credits.toLocaleString()} credits monthly
                        </p>
                        {plan.rollover_cap ? (
                          <p className="text-muted-foreground text-xs">
                            Rollover cap {plan.rollover_cap.toLocaleString()}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        className="mt-4 w-full"
                        disabled={!plan.dodo_configured || Boolean(checkoutKey)}
                        onClick={() => startCheckout("subscription", plan.key)}
                      >
                        {loading ? <Spinner /> : "Subscribe"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>One-time credit packs</CardTitle>
          <CardDescription>
            Purchased credits are added to the purchased bucket after a
            successful Dodo payment webhook.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {catalog.isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {(catalog.data?.credit_packs ?? []).map((pack) => {
                const loading = checkoutKey === `credit_pack:${pack.key}`;
                return (
                  <div
                    key={pack.key}
                    className="flex min-h-36 flex-col justify-between rounded-lg border border-[var(--dashboard-rule)] p-4"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold">{pack.name}</h3>
                        <PackageIcon
                          className="text-muted-foreground size-4"
                          aria-hidden
                        />
                      </div>
                      <p className="text-xl font-semibold">
                        {formatUsd(pack.price_usd_cents)}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {pack.credits.toLocaleString()} credits
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 w-full"
                      disabled={!pack.dodo_configured || Boolean(checkoutKey)}
                      onClick={() => startCheckout("credit_pack", pack.key)}
                    >
                      {loading ? <Spinner /> : "Buy"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reserved sessions</CardTitle>
          <CardDescription>
            Credits currently held for active verification sessions. Stalled
            sessions release automatically after the timeout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : reservedSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No credits are reserved right now.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Reserved</TableHead>
                  <TableHead>Reserved at</TableHead>
                  <TableHead>Auto-release</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservedSessions.map((item) => (
                  <TableRow key={item.verification_id}>
                    <TableCell className="font-mono text-xs">
                      {item.verification_id}
                    </TableCell>
                    <TableCell className="text-xs">
                      {item.workspace_id ? (
                        <span className="font-mono">
                          {workspaceNameById.get(item.workspace_id) ??
                            item.workspace_id.slice(0, 8)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Organisation
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.reserved_credits.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(item.reserved_at)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(item.timeout_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>Credit ledger</CardTitle>
            <CardDescription>
              Newest first. Workspace attribution is recorded for every
              verification settlement, reservation, and release so usage can be
              attributed per workspace.
            </CardDescription>
          </div>
          <WorkspaceFilter
            value={workspaceFilter}
            onChange={setWorkspaceFilter}
            options={workspaces.data ?? []}
            disabled={workspaces.isLoading}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : entries.length === 0 ? (
            <EmptyState
              icon={ScrollTextIcon}
              title={
                filter
                  ? "No ledger records for this workspace"
                  : "No ledger records yet"
              }
              description={
                filter
                  ? "Switch back to All workspaces to see organisation-wide grants, reservations, and settlements."
                  : "Signup bonuses, monthly top-ups, and verification settlements will appear here as soon as your team runs its first session."
              }
              action={
                filter ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setWorkspaceFilter("all")}
                  >
                    Clear filter
                  </Button>
                ) : null
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Free</TableHead>
                  <TableHead className="text-right">Subscription</TableHead>
                  <TableHead className="text-right">Purchased</TableHead>
                  <TableHead className="text-right">Reserved</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const reservedTotal =
                    entry.reserved_free_delta +
                    entry.reserved_subscription_delta +
                    entry.reserved_purchased_delta;
                  return (
                    <TableRow key={entry.ledger_entry_id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {ENTRY_TYPE_LABEL[entry.entry_type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {entry.workspace_id ? (
                          <span className="font-mono">
                            {workspaceNameById.get(entry.workspace_id) ??
                              entry.workspace_id.slice(0, 8)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            Organisation
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm">{entry.description}</span>
                          <span className="text-muted-foreground text-xs">
                            {ENTRY_TYPE_DESCRIPTION[entry.entry_type]}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right tabular-nums",
                          entry.free_delta === 0 && "text-muted-foreground",
                        )}
                      >
                        {formatDelta(entry.free_delta)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right tabular-nums",
                          entry.subscription_delta === 0 &&
                            "text-muted-foreground",
                        )}
                      >
                        {formatDelta(entry.subscription_delta)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right tabular-nums",
                          entry.purchased_delta === 0 &&
                            "text-muted-foreground",
                        )}
                      >
                        {formatDelta(entry.purchased_delta)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right tabular-nums",
                          reservedTotal === 0 && "text-muted-foreground",
                        )}
                      >
                        {formatDelta(reservedTotal)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {entry.balance_after.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {!session.data?.authenticated ? null : null}
    </>
  );
}

type WorkspaceFilterProps = {
  value: string;
  onChange: (value: string) => void;
  options: { workspace_id: string; name: string }[];
  disabled: boolean;
};

function WorkspaceFilter({
  value,
  onChange,
  options,
  disabled,
}: WorkspaceFilterProps) {
  const [open, setOpen] = useState(false);
  const currentLabel =
    value === "all"
      ? "All workspaces"
      : options.find((option) => option.workspace_id === value)?.name ??
        "Unknown workspace";

  return (
    <div className="flex flex-col gap-2 sm:max-w-xs sm:items-end">
      <span className="text-muted-foreground text-xs uppercase tracking-wide">
        Filter
      </span>
      <div className="relative w-full">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen((prev) => !prev)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2 truncate">
            <ListFilterIcon className="size-4" aria-hidden />
            {currentLabel}
          </span>
          <span className="text-muted-foreground text-xs">▾</span>
        </Button>
        {open ? (
          <ul
            role="listbox"
            aria-label="Workspace filter"
            className="absolute right-0 z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-[var(--dashboard-rule)] bg-background p-1 shadow-lg"
          >
            <WorkspaceFilterOption
              label="All workspaces"
              hint="Organisation-wide ledger"
              selected={value === "all"}
              onSelect={() => {
                onChange("all");
                setOpen(false);
              }}
            />
            {options.map((option) => (
              <WorkspaceFilterOption
                key={option.workspace_id}
                label={option.name}
                hint={option.workspace_id.slice(0, 8)}
                selected={value === option.workspace_id}
                onSelect={() => {
                  onChange(option.workspace_id);
                  setOpen(false);
                }}
              />
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

type WorkspaceFilterOptionProps = {
  label: string;
  hint: string;
  selected: boolean;
  onSelect: () => void;
};

function WorkspaceFilterOption({
  label,
  hint,
  selected,
  onSelect,
}: WorkspaceFilterOptionProps) {
  return (
    <li role="option" aria-selected={selected}>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm",
          selected
            ? "bg-[var(--accent)]/10 text-[var(--accent)]"
            : "hover:bg-muted",
        )}
      >
        <span className="flex flex-col">
          <span className="font-medium">{label}</span>
          <span className="text-muted-foreground text-xs">{hint}</span>
        </span>
        {selected ? (
          <span className="text-xs font-medium uppercase tracking-wide">
            Selected
          </span>
        ) : null}
      </button>
    </li>
  );
}
