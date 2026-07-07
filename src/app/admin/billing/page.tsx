"use client";

import {
  CircleDollarSignIcon,
  FilterIcon,
  PackageIcon,
  RefreshCwIcon,
  SaveIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { AppShell } from "@/components/dashboard/app-shell";
import { PlatformRouteGuard } from "@/components/dashboard/platform-route-guard";
import { EmptyState } from "@/components/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type AdminBillingCatalogItem,
  type AdminBillingCatalogItemUpdate,
  type CreditLedgerEntry,
  type CreditLedgerEntryType,
} from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import {
  useAdminBillingCatalog,
  useAdminBillingCredits,
  useAdminOrganizations,
  useUpdateAdminBillingCatalogItem,
} from "@/lib/hooks/use-admin-console";
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
  signup_bonus: "Initial credit grant awarded on first signup.",
  free_top_up: "Monthly refresh of the free credit bucket.",
  subscription_grant: "Monthly subscription grant credited to the wallet.",
  purchase: "Top-up purchase applied to the purchased bucket.",
  reservation: "Credit held against an in-flight verification.",
  settlement: "Reserved credit cleared against a settled verification.",
  release: "Reserved credit returned after a processing failure.",
  adjustment: "Operator-driven manual credit change.",
};

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export default function AdminBillingPage() {
  return (
    <AppShell audience="admin">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
        <PlatformRouteGuard
          allowedRoles={["platform_owner", "platform_business_admin"]}
          fallbackHref="/admin"
        >
          <BillingPage />
        </PlatformRouteGuard>
      </main>
    </AppShell>
  );
}

function BillingPage() {
  const orgs = useAdminOrganizations();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const credits = useAdminBillingCredits({
    organizationId: organizationId ?? null,
    limit: 200,
  });

  const selectedOrg = useMemo(
    () => orgs.data?.find((org) => org.organization_id === organizationId) ?? null,
    [orgs.data, organizationId],
  );

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        icon={CircleDollarSignIcon}
        title="Billing & credits"
        description="Inspect the organization-level credit wallet and its ledger rows. Adjustments live in a separate drawer."
      />

      <BillingCatalogManager />

      <Card>
        <CardHeader>
          <CardTitle>Pick an organization</CardTitle>
          <CardDescription>
            Use the filter to scope the ledger to one tenant. No filter
            returns the global aggregate view.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-muted-foreground flex items-center gap-2 text-sm">
              <FilterIcon data-icon="inline-start" aria-hidden /> Organization
              <select
                className="border-input bg-background text-foreground focus-visible:ring-ring/50 h-9 rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px]"
                value={organizationId ?? ""}
                onChange={(event) =>
                  setOrganizationId(event.target.value || null)
                }
              >
                <option value="">All organizations (global)</option>
                {orgs.data?.map((org) => (
                  <option key={org.organization_id} value={org.organization_id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => credits.refetch()}
            >
              <RefreshCwIcon data-icon="inline-start" aria-hidden /> Refresh
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOrganizationId(null)}
            >
              Clear filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedOrg ? (
        <CreditAdjustmentCallout organizationId={selectedOrg.organization_id} />
      ) : null}

      <BalanceGrid
        balance={credits.data?.balance ?? null}
        loading={credits.isLoading}
      />

      <Card>
        <CardHeader>
          <CardTitle>Ledger</CardTitle>
          <CardDescription>
            Newest first. Operators can record a manual adjustment below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {credits.isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (credits.data?.entries.length ?? 0) === 0 ? (
            <EmptyState
              icon={CircleDollarSignIcon}
              title="No ledger rows"
              description="No credit activity yet for this scope."
            />
          ) : (
            <LedgerTable entries={credits.data?.entries ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BillingCatalogManager() {
  const catalog = useAdminBillingCatalog();
  const update = useUpdateAdminBillingCatalogItem();

  async function saveItem(
    item: AdminBillingCatalogItem,
    payload: AdminBillingCatalogItemUpdate,
  ) {
    try {
      await update.mutateAsync({
        catalog_item_id: item.catalog_item_id,
        payload,
      });
      toast.success(`${item.name} updated.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  }

  const subscriptions =
    catalog.data?.filter((item) => item.kind === "subscription") ?? [];
  const creditPacks =
    catalog.data?.filter((item) => item.kind === "credit_pack") ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment catalog</CardTitle>
        <CardDescription>
          Manage Dodo product IDs, subscription plans, credit packs, prices,
          credits, rollover caps, and availability from the admin panel.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {catalog.isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <>
            <CatalogGroup
              title="Subscriptions"
              items={subscriptions}
              pending={update.isPending}
              onSave={saveItem}
            />
            <CatalogGroup
              title="Credit packs"
              items={creditPacks}
              pending={update.isPending}
              onSave={saveItem}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CatalogGroup({
  title,
  items,
  pending,
  onSave,
}: {
  title: string;
  items: AdminBillingCatalogItem[];
  pending: boolean;
  onSave: (
    item: AdminBillingCatalogItem,
    payload: AdminBillingCatalogItemUpdate,
  ) => Promise<void>;
}) {
  return (
    <section className="flex flex-col gap-3" aria-label={title}>
      <div className="flex items-center gap-2">
        <PackageIcon className="text-muted-foreground size-4" aria-hidden />
        <h3 className="font-medium">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No catalog rows.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-32">Name</TableHead>
                <TableHead className="min-w-56">Dodo product ID</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Rollover</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Save</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <CatalogRow
                  key={item.catalog_item_id}
                  item={item}
                  pending={pending}
                  onSave={onSave}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

function CatalogRow({
  item,
  pending,
  onSave,
}: {
  item: AdminBillingCatalogItem;
  pending: boolean;
  onSave: (
    item: AdminBillingCatalogItem,
    payload: AdminBillingCatalogItemUpdate,
  ) => Promise<void>;
}) {
  const [name, setName] = useState(item.name);
  const [productId, setProductId] = useState(item.dodo_product_id ?? "");
  const [price, setPrice] = useState(String(item.price_usd_cents));
  const [credits, setCredits] = useState(String(item.credits));
  const [rollover, setRollover] = useState(
    item.rollover_cap === null ? "" : String(item.rollover_cap),
  );
  const [sortOrder, setSortOrder] = useState(String(item.sort_order));
  const [active, setActive] = useState(item.is_active);

  const priceNumber = Number(price);
  const creditsNumber = Number(credits);
  const sortNumber = Number(sortOrder);
  const rolloverNumber = rollover.trim() ? Number(rollover) : null;
  const invalid =
    !name.trim() ||
    !Number.isInteger(priceNumber) ||
    priceNumber < 0 ||
    !Number.isInteger(creditsNumber) ||
    creditsNumber < 1 ||
    !Number.isInteger(sortNumber) ||
    sortNumber < 0 ||
    (rolloverNumber !== null &&
      (!Number.isInteger(rolloverNumber) || rolloverNumber < 0));

  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col gap-1">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="min-w-32"
          />
          <span className="text-muted-foreground font-mono text-xs">
            {item.key}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Input
          value={productId}
          onChange={(event) => setProductId(event.target.value)}
          placeholder="pdt_..."
          className="min-w-56 font-mono text-xs"
        />
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <Input
            type="number"
            min={0}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="w-28"
          />
          <span className="text-muted-foreground text-xs">
            {Number.isFinite(priceNumber) ? formatUsd(priceNumber) : "Invalid"}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={1}
          value={credits}
          onChange={(event) => setCredits(event.target.value)}
          className="w-28"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          value={rollover}
          onChange={(event) => setRollover(event.target.value)}
          placeholder="None"
          className="w-28"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
          className="w-20"
        />
      </TableCell>
      <TableCell>
        <Checkbox
          checked={active}
          onCheckedChange={(checked) => setActive(checked === true)}
          aria-label={`Toggle ${item.name}`}
        />
      </TableCell>
      <TableCell className="text-right">
        <Button
          type="button"
          size="sm"
          disabled={pending || invalid}
          onClick={() =>
            onSave(item, {
              name: name.trim(),
              dodo_product_id: productId.trim() || null,
              price_usd_cents: priceNumber,
              credits: creditsNumber,
              rollover_cap: rolloverNumber,
              sort_order: sortNumber,
              is_active: active,
            })
          }
        >
          <SaveIcon data-icon="inline-start" aria-hidden /> Save
        </Button>
      </TableCell>
    </TableRow>
  );
}

function CreditAdjustmentCallout({
  organizationId,
}: {
  organizationId: string;
}) {
  return (
    <Alert>
      <AlertTitle>Manual adjustments</AlertTitle>
      <AlertDescription>
        To add or remove credits for{" "}
        <span className="font-mono">{organizationId}</span>, open the
        organization and use the credit-adjust action. Adjustments are
        recorded in <code>credit_ledger_entries</code> with actor
        attribution.
        <div className="mt-2">
          <Button
            render={<Link href={`/admin/organizations/${organizationId}`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            Open organization
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

function BalanceGrid({
  balance,
  loading,
}: {
  balance: {
    available_credits: number;
    reserved_credits: number;
    total_credits: number;
    free_credits: number;
    subscription_credits: number;
    purchased_credits: number;
  } | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }
  if (!balance) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <BalanceCard
        label="Available"
        value={balance.available_credits}
        accent="success"
      />
      <BalanceCard
        label="Reserved"
        value={balance.reserved_credits}
        accent="warning"
      />
      <BalanceCard label="Total" value={balance.total_credits} accent="info" />
      <BalanceCard
        label="Free + Subscription + Purchased"
        value={
          balance.free_credits +
          balance.subscription_credits +
          balance.purchased_credits
        }
        accent="default"
        breakdown={{
          Free: balance.free_credits,
          Subscription: balance.subscription_credits,
          Purchased: balance.purchased_credits,
        }}
      />
    </div>
  );
}

function BalanceCard({
  label,
  value,
  accent,
  breakdown,
}: {
  label: string;
  value: number;
  accent: "success" | "warning" | "info" | "default";
  breakdown?: Record<string, number>;
}) {
  const accentClass = {
    success: "bg-emerald-100 text-emerald-900",
    warning: "bg-amber-100 text-amber-900",
    info: "bg-sky-100 text-sky-900",
    default: "bg-muted text-foreground",
  }[accent];
  return (
    <div className={cn("rounded-xl border p-4", accentClass)}>
      <span className="text-xs font-medium uppercase tracking-wide">
        {label}
      </span>
      <div className="mt-2 text-2xl font-semibold">
        {value.toLocaleString()}
      </div>
      {breakdown ? (
        <ul className="mt-2 flex flex-wrap gap-3 text-xs">
          {Object.entries(breakdown).map(([bucket, val]) => (
            <li key={bucket} className="flex flex-col">
              <span className="font-medium uppercase tracking-wide opacity-70">
                {bucket}
              </span>
              <span className="font-mono text-sm">{val.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function LedgerTable({ entries }: { entries: CreditLedgerEntry[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Free</TableHead>
          <TableHead>Subscription</TableHead>
          <TableHead>Purchased</TableHead>
          <TableHead>Reserved</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.ledger_entry_id}>
            <TableCell>
              <div className="flex flex-col gap-1">
                <Badge variant="outline">{ENTRY_TYPE_LABEL[entry.entry_type]}</Badge>
                <span className="text-muted-foreground text-xs">
                  {ENTRY_TYPE_DESCRIPTION[entry.entry_type]}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {entry.description}
            </TableCell>
            <DeltaCell value={entry.free_delta} />
            <DeltaCell value={entry.subscription_delta} />
            <DeltaCell value={entry.purchased_delta} />
            <DeltaCell
              value={
                entry.reserved_free_delta +
                entry.reserved_subscription_delta +
                entry.reserved_purchased_delta
              }
            />
            <TableCell className="font-mono text-xs">
              {entry.balance_after.toLocaleString()}
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {formatDate(entry.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function DeltaCell({ value }: { value: number }) {
  const positive = value > 0;
  const negative = value < 0;
  return (
    <TableCell
      className={cn(
        "font-mono text-xs",
        positive && "text-emerald-700",
        negative && "text-rose-700",
      )}
    >
      {positive ? "+" : ""}
      {value.toLocaleString()}
    </TableCell>
  );
}
