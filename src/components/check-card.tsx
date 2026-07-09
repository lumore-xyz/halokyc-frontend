import {
  Baby,
  CopyX,
  Eye,
  Fingerprint,
  FileWarning,
  ScanFace,
  ScanText,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/status-pill";
import type {
  CheckResult,
  DocumentQualityCheckResult,
  DuplicateMatchKind,
  VerificationStatus,
} from "@/lib/api-client";
import { cn } from "@/lib/utils";

const CHECK_META: Record<
  string,
  { label: string; description: string; icon: LucideIcon }
> = {
  ocr: {
    label: "OCR",
    description: "Extracted name, DOB, and document number from the ID image.",
    icon: ScanText,
  },
  face_match: {
    label: "Face match",
    description: "Cosine similarity between selfie and ID photo.",
    icon: ScanFace,
  },
  liveness: {
    label: "Liveness",
    description: "Passive liveness score on the selfie.",
    icon: Eye,
  },
  duplicate: {
    label: "Duplicate",
    description: "Search for the same face across this client's history.",
    icon: Fingerprint,
  },
  document_quality: {
    label: "Document quality",
    description:
      "Readability, image quality, missing regions, and tamper signal.",
    icon: FileWarning,
  },
  age: {
    label: "Age",
    description: "Age check derived from OCR DOB.",
    icon: Baby,
  },
};

type CheckCardProps = {
  checkKey: string;
  result: CheckResult | undefined;
  verificationStatus?: VerificationStatus;
  timedOut?: boolean;
  duplicateSessionHref?: string;
  duplicateMatchKind?: DuplicateMatchKind | null;
  className?: string;
};

export function CheckCard({
  checkKey,
  result,
  verificationStatus,
  timedOut = false,
  duplicateSessionHref,
  duplicateMatchKind,
  className,
}: CheckCardProps) {
  const meta = CHECK_META[checkKey] ?? {
    label: checkKey,
    description: "",
    icon: CopyX,
  };
  const Icon = meta.icon;
  const status = result?.status ?? "pending";
  const score =
    typeof result?.score === "number" ? result.score.toFixed(2) : "—";
  const detail = result?.detail ?? result?.result;
  const quality = getDocumentQuality(checkKey, result);
  const matchKind =
    duplicateMatchKind ??
    (checkKey === "duplicate" ? readDuplicateMatchKind(result) : null);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon
              className="text-muted-foreground size-4"
              aria-hidden
            />
            <CardTitle className="text-base">{meta.label}</CardTitle>
          </div>
          <StatusPill status={mapCheckStatus(status, verificationStatus)} />
        </div>
        {timedOut || matchKind ? (
          <div className="flex flex-wrap gap-1.5">
            {timedOut ? (
              <Badge variant="outline">
                Timed out - agent decided on available evidence
              </Badge>
            ) : null}
            {matchKind ? (
              <Badge
                variant={matchKind === "ban_match" ? "destructive" : "outline"}
              >
                {formatDuplicateMatchKind(matchKind)}
              </Badge>
            ) : null}
          </div>
        ) : null}
        {meta.description ? (
          <p className="text-muted-foreground text-xs">{meta.description}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Score</dt>
          <dd className="font-mono tabular-nums">{score}</dd>
          {duplicateSessionHref ? (
            <>
              <dt className="text-muted-foreground">Previous session</dt>
              <dd>
                <Link
                  href={duplicateSessionHref}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Open match
                </Link>
              </dd>
            </>
          ) : null}
          {quality ? <DocumentQualityMetrics quality={quality} /> : null}
          {detail ? (
            <>
              <dt className="text-muted-foreground col-span-2 pt-2">
                Detail
              </dt>
              <dd className="col-span-2">
                <CheckDetailSummary value={detail} />
              </dd>
            </>
          ) : null}
        </dl>
      </CardContent>
    </Card>
  );
}

function mapCheckStatus(
  status: CheckResult["status"] | "pending",
  verificationStatus?: VerificationStatus,
): import("@/lib/api-client").VerificationStatus {
  if (status === "pending" || status === "skipped") {
    return verificationStatus === "processing" ? "processing" : "pending_upload";
  }
  if (status === "pass") return "approved";
  if (status === "fail") return "rejected";
  return "manual_review";
}

export function orderedCheckKeys(): Array<keyof typeof CHECK_META> {
  return [
    "document_quality",
    "ocr",
    "face_match",
    "liveness",
    "duplicate",
    "age",
  ];
}

function DocumentQualityMetrics({
  quality,
}: {
  quality: DocumentQualityCheckResult["result"];
}) {
  return (
    <>
      <dt className="text-muted-foreground">Readability</dt>
      <dd>{formatQualityValue(quality.readability)}</dd>
      <dt className="text-muted-foreground">Image quality</dt>
      <dd>{formatQualityValue(quality.image_quality)}</dd>
      <dt className="text-muted-foreground">Missing regions</dt>
      <dd>
        {quality.missing_regions.length > 0
          ? quality.missing_regions.map(formatMachineLabel).join(", ")
          : "None"}
      </dd>
      <dt className="text-muted-foreground">Tampering</dt>
      <dd>{quality.suspected_tampering ? "Suspected" : "Not suspected"}</dd>
      <dt className="text-muted-foreground">Confidence</dt>
      <dd className="font-mono tabular-nums">
        {Math.round(quality.quality_confidence * 100)}%
      </dd>
      <dt className="text-muted-foreground">Provider</dt>
      <dd>{formatMachineLabel(quality.provider)}</dd>
      {quality.retry_recommended ? (
        <dd className="col-span-2 rounded-md border border-border bg-[color:var(--status-review-bg)] px-3 py-2 text-sm">
          <span className="font-medium">Retake document.</span>{" "}
          The uploaded ID was not clear enough for confident automated review.
        </dd>
      ) : null}
    </>
  );
}

function getDocumentQuality(
  checkKey: string,
  result: CheckResult | undefined,
): DocumentQualityCheckResult["result"] | null {
  if (checkKey !== "document_quality") return null;
  const value = result?.result;
  if (!value || typeof value !== "object") return null;
  if (
    typeof value.readability !== "string" ||
    typeof value.image_quality !== "string" ||
    !Array.isArray(value.missing_regions) ||
    typeof value.suspected_tampering !== "boolean" ||
    typeof value.retry_recommended !== "boolean" ||
    typeof value.quality_confidence !== "number" ||
    typeof value.provider !== "string"
  ) {
    return null;
  }
  return value as DocumentQualityCheckResult["result"];
}

function readDuplicateMatchKind(
  result: CheckResult | undefined,
): DuplicateMatchKind | null {
  const matchKind = result?.result?.match_kind;
  if (
    matchKind === "ban_match" ||
    matchKind === "same_external_user" ||
    matchKind === "ambiguous"
  ) {
    return matchKind;
  }
  return null;
}

function formatDuplicateMatchKind(kind: DuplicateMatchKind): string {
  if (kind === "ban_match") return "Ban match";
  if (kind === "same_external_user") return "Same external user";
  return "Ambiguous duplicate";
}

function formatQualityValue(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatMachineLabel(value: string): string {
  return value.replaceAll("_", " ");
}

function CheckDetailSummary({ value }: { value: Record<string, unknown> }) {
  const reconciliation = readMetadataReconciliation(value);
  const entries = Object.entries(value).filter(
    ([key, entryValue]) =>
      key !== "metadata_reconciliation" &&
      entryValue !== null &&
      entryValue !== undefined,
  );

  if (entries.length === 0) {
    return reconciliation ? (
      <MetadataReconciliationSummary reconciliation={reconciliation} />
    ) : (
      <span className="text-muted-foreground text-sm">No extra detail</span>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3">
      {reconciliation ? (
        <MetadataReconciliationSummary reconciliation={reconciliation} />
      ) : null}
      {entries.slice(0, 6).map(([key, entryValue]) => (
        <div
          key={key}
          className="grid gap-1 text-sm sm:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]"
        >
          <span className="text-muted-foreground">
            {formatMachineLabel(key)}
          </span>
          <span className="min-w-0 break-words font-medium">
            {formatDetailValue(entryValue)}
          </span>
        </div>
      ))}
      {entries.length > 6 ? (
        <span className="text-muted-foreground text-xs">
          {entries.length - 6} more detail fields available to admins.
        </span>
      ) : null}
    </div>
  );
}

type MetadataReconciliation = {
  status: "matched" | "mismatch";
  mismatches: string[];
  comparisons: Array<{
    field: string;
    expected: unknown;
    actual: unknown;
    matched: boolean;
  }>;
};

function MetadataReconciliationSummary({
  reconciliation,
}: {
  reconciliation: MetadataReconciliation;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">
          Metadata match
        </span>
        <Badge variant={reconciliation.status === "mismatch" ? "destructive" : "outline"}>
          {reconciliation.status === "mismatch" ? "Needs review" : "Matched"}
        </Badge>
      </div>
      {reconciliation.comparisons.map((comparison) => (
        <div
          key={comparison.field}
          className="grid gap-1 text-sm sm:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)]"
        >
          <span className="text-muted-foreground">
            {formatMachineLabel(comparison.field)}
          </span>
          <span className="min-w-0 break-words">
            <span className="font-medium">
              {formatDetailValue(comparison.actual)}
            </span>
            <span className="text-muted-foreground">
              {" "}
              expected {formatDetailValue(comparison.expected)}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

function readMetadataReconciliation(
  value: Record<string, unknown>,
): MetadataReconciliation | null {
  const raw = value.metadata_reconciliation;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  const status = record.status;
  const comparisons = record.comparisons;
  const mismatches = record.mismatches;
  if (
    status !== "matched" &&
    status !== "mismatch"
  ) {
    return null;
  }
  if (!Array.isArray(comparisons) || !Array.isArray(mismatches)) return null;
  return {
    status,
    mismatches: mismatches.filter((item): item is string => typeof item === "string"),
    comparisons: comparisons.flatMap((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return [];
      const comparison = item as Record<string, unknown>;
      if (
        typeof comparison.field !== "string" ||
        typeof comparison.matched !== "boolean"
      ) {
        return [];
      }
      return [
        {
          field: comparison.field,
          expected: comparison.expected,
          actual: comparison.actual,
          matched: comparison.matched,
        },
      ];
    }),
  };
}

function formatDetailValue(value: unknown): string {
  if (value === null || value === undefined) return "Not provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (value >= 0 && value <= 1) return `${Math.round(value * 100)}%`;
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  if (typeof value === "string") return formatMachineLabel(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "None";
    if (value.every((item) => ["string", "number", "boolean"].includes(typeof item))) {
      return value.map(formatDetailValue).join(", ");
    }
    return `${value.length} item${value.length === 1 ? "" : "s"}`;
  }
  if (typeof value === "object") {
    const fieldCount = Object.keys(value).length;
    return `${fieldCount} field${fieldCount === 1 ? "" : "s"}`;
  }
  return String(value);
}
