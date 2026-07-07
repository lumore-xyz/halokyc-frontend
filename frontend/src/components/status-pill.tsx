import type { VerificationStatus } from "@/lib/api-client";
import { statusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_CLASS: Record<VerificationStatus, string> = {
  pending_upload:
    "bg-[color:var(--status-pending-bg)] text-[color:var(--status-pending-fg)]",
  awaiting_credits:
    "bg-[color:var(--status-processing-bg)] text-[color:var(--status-processing-fg)]",
  processing:
    "bg-[color:var(--status-processing-bg)] text-[color:var(--status-processing-fg)]",
  approved:
    "bg-[color:var(--status-approved-bg)] text-[color:var(--status-approved-fg)]",
  rejected:
    "bg-[color:var(--status-rejected-bg)] text-[color:var(--status-rejected-fg)]",
  manual_review:
    "bg-[color:var(--status-review-bg)] text-[color:var(--status-review-fg)]",
};

type StatusPillProps = {
  status: VerificationStatus;
  className?: string;
};

export function StatusPill({ status, className }: StatusPillProps) {
  return (
    <span
      data-status={status}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_CLASS[status],
        className,
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
