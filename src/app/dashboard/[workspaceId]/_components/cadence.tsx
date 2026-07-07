"use client";

import {
  CheckCircle2Icon,
  CircleAlertIcon,
  CircleDashedIcon,
  ClockIcon,
  ScanSearchIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  VerificationStatus,
  VerificationStatusCounts,
} from "@/lib/api-client";

type CadenceStatus = VerificationStatus;

type CadenceSession = {
  status: CadenceStatus;
};

type CadenceProps = {
  sessions: CadenceSession[];
  counts?: VerificationStatusCounts;
  /** Max number of bars to render. Defaults to 64. */
  limit?: number;
  className?: string;
};

type StatusMeta = {
  label: string;
  shortLabel: string;
  bgClass: string;
  fgClass: string;
  Icon: typeof CheckCircle2Icon;
};

const STATUS_META: Record<CadenceStatus, StatusMeta> = {
  approved: {
    label: "Approved",
    shortLabel: "Approved",
    bgClass: "bg-[var(--status-approved-bg)]",
    fgClass: "text-[var(--status-approved-fg)]",
    Icon: CheckCircle2Icon,
  },
  rejected: {
    label: "Rejected",
    shortLabel: "Rejected",
    bgClass: "bg-[var(--status-rejected-bg)]",
    fgClass: "text-[var(--status-rejected-fg)]",
    Icon: CircleAlertIcon,
  },
  manual_review: {
    label: "Needs review",
    shortLabel: "Review",
    bgClass: "bg-[var(--status-review-bg)]",
    fgClass: "text-[var(--status-review-fg)]",
    Icon: ScanSearchIcon,
  },
  processing: {
    label: "Processing",
    shortLabel: "Processing",
    bgClass: "bg-[var(--status-processing-bg)]",
    fgClass: "text-[var(--status-processing-fg)]",
    Icon: ClockIcon,
  },
  awaiting_credits: {
    label: "Awaiting credits",
    shortLabel: "Credits",
    bgClass: "bg-[var(--status-processing-bg)]",
    fgClass: "text-[var(--status-processing-fg)]",
    Icon: ClockIcon,
  },
  pending_upload: {
    label: "Awaiting upload",
    shortLabel: "Pending",
    bgClass: "bg-[var(--status-pending-bg)]",
    fgClass: "text-[var(--status-pending-fg)]",
    Icon: CircleDashedIcon,
  },
};

function emptyCounts(): VerificationStatusCounts {
  return {
    approved: 0,
    rejected: 0,
    manual_review: 0,
    awaiting_credits: 0,
    processing: 0,
    pending_upload: 0,
  };
}

export function Cadence({
  sessions,
  counts: providedCounts,
  limit = 64,
  className,
}: CadenceProps) {
  const visible = sessions.slice(-limit);
  const counts = providedCounts ? { ...providedCounts } : emptyCounts();
  if (!providedCounts) {
    for (const session of sessions) {
      counts[session.status] = (counts[session.status] ?? 0) + 1;
    }
  }
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const hidden = Math.max(total - visible.length, 0);

  return (
    <section
      className={cn(
        "app-shell-panel flex flex-col gap-5 overflow-hidden rounded-2xl border border-[var(--dashboard-rule)] p-6 ring-0",
        className,
      )}
      aria-label="Recent verification cadence"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Cadence
          </span>
          <h2 className="font-semibold text-xl tracking-tight">
            {total === 0
              ? "Waiting on the first session"
              : `${total} session${total === 1 ? "" : "s"} on file`}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-sm">
          Every bar is one verification, oldest on the left, newest on
          the right. Colour follows the decision.
        </p>
      </header>

      <div className="relative">
        {visible.length === 0 ? (
          <div
            className="flex h-24 items-center justify-center rounded-xl border border-dashed border-[var(--dashboard-rule)] bg-[var(--dashboard-canvas)]"
            role="img"
            aria-label="No verifications yet"
          >
            <p className="text-sm text-muted-foreground">
              No verifications yet. Once your integration starts sending
              sessions, each one will appear here.
            </p>
          </div>
        ) : (
          <div
            className="flex h-28 items-end gap-[3px] rounded-xl border border-[var(--dashboard-rule)] bg-[var(--dashboard-canvas)] p-3"
            role="img"
            aria-label={`${total} verification${total === 1 ? "" : "s"} shown`}
          >
            {visible.map((session, index) => {
              const meta = STATUS_META[session.status];
              return (
                <span
                  key={index}
                  className={cn(
                    "block h-full w-[7px] rounded-[2px] shadow-[0_1px_0_color-mix(in_oklch,white_70%,transparent)_inset]",
                    meta.bgClass,
                  )}
                  title={`${meta.label}`}
                />
              );
            })}
            {hidden > 0 ? (
              <span
                className="ml-3 self-end text-xs text-muted-foreground font-mono tabular-nums"
                title={`${hidden} earlier session${hidden === 1 ? "" : "s"} not shown`}
              >
                +{hidden} earlier
              </span>
            ) : null}
          </div>
        )}
        {visible.length > 0 ? (
          <div className="mt-2 flex justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 tabular-nums">
            <span>Oldest</span>
            <span>Newest</span>
          </div>
        ) : null}
      </div>

      <ul className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-5">
        {(Object.keys(STATUS_META) as CadenceStatus[]).map((status) => {
          const meta = STATUS_META[status];
          const count = counts[status] ?? 0;
          const Icon = meta.Icon;
          return (
            <li
              key={status}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg border border-transparent px-2.5 py-1.5",
                count > 0 && "border-[var(--dashboard-rule)] bg-[var(--dashboard-canvas)]",
              )}
            >
              <span
                className={cn(
                  "flex items-center gap-1.5 text-xs",
                  meta.fgClass,
                )}
              >
                <Icon className="size-3.5" />
                {meta.shortLabel}
              </span>
              <span className="text-sm font-semibold tabular-nums">
                {count}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
