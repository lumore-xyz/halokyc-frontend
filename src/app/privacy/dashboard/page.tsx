"use client";

import { ArrowLeft, ShieldCheckIcon } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  type PrivacyDataSummary,
  type PrivacyRequest,
  type PrivacyRequestKind,
} from "@/lib/privacy-dashboard";
import {
  privacyBackendStatus,
  useCreatePrivacyRequest,
  usePrivacyRequests,
  usePrivacySummary,
} from "@/lib/hooks/use-privacy-dashboard";
import { publicEnv } from "@/lib/env";
import { cn } from "@/lib/utils";

type Pillar = "data" | "rights" | "status";

const PILLARS: Array<{ key: Pillar; title: string; body: string }> = [
  {
    key: "data",
    title: "Your data",
    body: "A read-only list of the personal data fields collected during your session and the purpose for each one.",
  },
  {
    key: "rights",
    title: "Your rights",
    body: "Request erasure, export an archive of your data, or withdraw consent for future processing.",
  },
  {
    key: "status",
    title: "Request status",
    body: "Track the progress of any data subject request (DSR) you have submitted.",
  },
];

export default function PrivacyDashboardPage() {
  const pageContent = publicEnv.enablePrivacyDashboard ? (
    <Inner />
  ) : (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-4 px-6 py-24 text-center sm:py-32">
      <ShieldCheckIcon className="text-muted-foreground size-10" aria-hidden />
      <h1 className="text-2xl font-semibold tracking-tight">Privacy dashboard</h1>
      <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
        This feature is not yet available. Check back soon or contact the
        business that requested your verification for alternative ways to
        exercise your data rights.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-border/70 bg-background/80 sticky top-0 z-10 border-b backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
          <BrandLogo variant="wordmark-dark" className="h-7 w-32" />
          <Link
            href="/privacy"
            className="text-muted-foreground hover:text-foreground text-sm font-medium underline underline-offset-4"
          >
            Privacy policy
          </Link>
        </div>
      </div>
      {pageContent}
    </div>
  );
}

function Inner() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-12 sm:py-16">
      <header className="flex flex-col items-start gap-3 text-left">
        <span className="text-muted-foreground inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
          <ShieldCheckIcon className="size-3.5" aria-hidden />
          Privacy dashboard
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Manage your data and rights
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          HaloKYC acts as a processor for the business that asked you to verify.
          You can ask them, or us, to export, erase, or stop processing your
          data. This dashboard tracks your requests end to end.
        </p>
      </header>
      <PillarGrid />
    </main>
  );
}

function PillarGrid() {
  const [active, setActive] = useState<Pillar | null>(null);
  const summary = usePrivacySummary();
  const requests = usePrivacyRequests();
  const createRequest = useCreatePrivacyRequest();

  return (
    <section
      aria-label="Privacy dashboard sections"
      className="grid gap-4 sm:grid-cols-3"
    >
      {PILLARS.map((pillar) => (
        <button
          key={pillar.key}
          type="button"
          onClick={() =>
            setActive((current) => (current === pillar.key ? null : pillar.key))
          }
          aria-expanded={active === pillar.key}
          className={cn(
            "border-border/70 bg-card hover:border-foreground/30 rounded-xl border p-5 text-left transition-colors",
            active === pillar.key && "ring-2 ring-ring/40",
          )}
        >
          <h2 className="text-base font-semibold tracking-tight">
            {pillar.title}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {pillar.body}
          </p>
        </button>
      ))}

      {active ? (
        <PillarDetail
          pillar={active}
          summary={summary.data}
          requests={requests.data ?? []}
          loading={summary.isLoading || requests.isLoading}
          error={summary.error ?? requests.error ?? null}
          creatingKind={createRequest.variables?.kind ?? null}
          onCreateRequest={(kind) => createRequest.mutate({ kind })}
          onClose={() => setActive(null)}
        />
      ) : null}
    </section>
  );
}

function PillarDetail({
  pillar,
  summary,
  requests,
  loading,
  error,
  creatingKind,
  onCreateRequest,
  onClose,
}: {
  pillar: Pillar;
  summary?: PrivacyDataSummary;
  requests: PrivacyRequest[];
  loading: boolean;
  error: { message: string } | null;
  creatingKind: PrivacyRequestKind | null;
  onCreateRequest: (kind: PrivacyRequestKind) => void;
  onClose: () => void;
}) {
  return (
    <div
      role="region"
      aria-label={`${pillar} detail`}
      className="border-border/70 bg-card col-span-full flex flex-col gap-4 rounded-xl border p-5 sm:col-span-3"
    >
      <header className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight">
          {PILLARS.find((p) => p.key === pillar)?.title}
        </h3>
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>
          Close
        </Button>
      </header>

      {error ? <BackendNotice message={error.message} /> : null}
      {loading ? <Spinner /> : null}
      {pillar === "data" ? <YourDataPanel summary={summary} /> : null}
      {pillar === "rights" ? (
        <YourRightsPanel
          creatingKind={creatingKind}
          onCreateRequest={onCreateRequest}
        />
      ) : null}
      {pillar === "status" ? <RequestStatusPanel requests={requests} /> : null}
    </div>
  );
}

function YourDataPanel({ summary }: { summary?: PrivacyDataSummary }) {
  if (!summary) {
    return <BackendNotice message={privacyBackendStatus().message} />;
  }
  return (
    <ul className="text-muted-foreground flex flex-col gap-2 text-sm">
      {summary.fields.map((field) => (
        <li
          key={field.key}
          className="rounded-lg border border-border/60 bg-background/40 p-3"
        >
          <span className="text-foreground block font-medium">
            {field.label}
          </span>
          <span>{field.purpose}</span>
        </li>
      ))}
    </ul>
  );
}

function YourRightsPanel({
  creatingKind,
  onCreateRequest,
}: {
  creatingKind: PrivacyRequestKind | null;
  onCreateRequest: (kind: PrivacyRequestKind) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <RightAction
        title="Request erasure"
        body="Initiate lifecycle deletion of the personal data HaloKYC holds for you. Confirmation is required because erasure is irreversible."
        cta="Open erasure request"
        kind="erasure"
        pending={creatingKind === "erasure"}
        onCreateRequest={onCreateRequest}
      />
      <RightAction
        title="Export my data"
        body="Generate a downloadable archive of your data. You will be notified by email or webhook when it is ready."
        cta="Start export"
        kind="export"
        pending={creatingKind === "export"}
        onCreateRequest={onCreateRequest}
      />
      <RightAction
        title="Withdraw consent"
        body="Revoke consent for future processing. Past verifications remain on file unless you also request erasure."
        cta="Withdraw consent"
        kind="withdraw_consent"
        pending={creatingKind === "withdraw_consent"}
        onCreateRequest={onCreateRequest}
      />
    </div>
  );
}

function RightAction({
  title,
  body,
  cta,
  kind,
  pending,
  onCreateRequest,
}: {
  title: string;
  body: string;
  cta: string;
  kind: PrivacyRequestKind;
  pending: boolean;
  onCreateRequest: (kind: PrivacyRequestKind) => void;
}) {
  const id = useId();
  return (
    <div className="border-border/60 bg-background/40 flex flex-col gap-3 rounded-lg border p-4">
      <div>
        <h4 id={id} className="text-sm font-semibold tracking-tight">
          {title}
        </h4>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
          {body}
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        aria-describedby={id}
        onClick={() => onCreateRequest(kind)}
      >
        {pending ? <Spinner data-icon="inline-start" /> : null}
        {cta}
      </Button>
    </div>
  );
}

function RequestStatusPanel({ requests }: { requests: PrivacyRequest[] }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-sm leading-relaxed">
        A visual timeline for active and past DSRs:
      </p>
      <ol className="border-border/60 flex flex-col gap-2 rounded-lg border bg-background/40 p-4 text-sm">
        {requests.length === 0 ? (
          <TimelineStep label="No requests yet" />
        ) : (
          requests.map((request) => (
            <TimelineStep
              key={request.id}
              label={`${request.kind.replace("_", " ")} - ${request.status}`}
            />
          ))
        )}
      </ol>
    </div>
  );
}

function BackendNotice({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-muted-foreground">
      {message}
    </p>
  );
}

function TimelineStep({ label }: { label: string }) {
  return (
    <li className="border-border/60 text-muted-foreground flex items-center justify-between rounded-md border border-dashed px-3 py-2 text-xs">
      <span className="font-medium">{label}</span>
      <span className="font-mono text-[10px]">—</span>
    </li>
  );
}
