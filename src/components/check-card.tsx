import {
  Baby,
  CopyX,
  Eye,
  Fingerprint,
  FileWarning,
  ScanFace,
  ScanText,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill";
import type {
  CheckResult,
  DocumentQualityCheckResult,
  DuplicateMatchKind,
  MetadataMatchingCheckResult,
  VerificationStatus,
} from "@/lib/api-client";
import { cn } from "@/lib/utils";

const CHECK_META: Record<
  string,
  { label: string; description: string; icon: LucideIcon }
> = {
  document_quality: {
    label: "Document quality",
    description:
      "Readability, image quality, missing regions, and tamper signal.",
    icon: FileWarning,
  },
  ocr: {
    label: "OCR",
    description:
      "Extracts document fields using a learned pattern or AI fallback.",
    icon: ScanText,
  },
  metadata_matching: {
    label: "Metadata match",
    description:
      "Compares submitted identity metadata with extracted document fields.",
    icon: UserCheck,
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
    typeof result?.score === "number" ? result.score.toFixed(2) : "-";
  const detail = result?.detail ?? result?.result;
  const quality = getDocumentQuality(checkKey, result);
  const ocr = getOcrExtraction(checkKey, result);
  const metadataMatching = getMetadataMatching(checkKey, result);
  const matchKind =
    duplicateMatchKind ??
    (checkKey === "duplicate" ? readDuplicateMatchKind(result) : null);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon className="text-muted-foreground size-4" aria-hidden />
            <CardTitle className="text-base">{meta.label}</CardTitle>
          </div>
          <StatusPill status={mapCheckStatus(status, verificationStatus)} />
        </div>
        {timedOut || matchKind || ocr || metadataMatching?.informational_only ? (
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
            {ocr ? (
              <Badge variant="outline">
                {formatExtractionSource(ocr.extraction_source)}
              </Badge>
            ) : null}
            {ocr?.document_pattern_id ? (
              <Badge variant="outline">Pattern trained</Badge>
            ) : null}
            {metadataMatching?.informational_only ? (
              <Badge variant="outline">Informational</Badge>
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
          {ocr ? <OcrExtractionMetrics ocr={ocr} /> : null}
          {metadataMatching ? (
            <MetadataMatchingMetrics metadata={metadataMatching} />
          ) : null}
          {detail ? (
            <>
              <dt className="text-muted-foreground col-span-2 pt-2">
                Detail
              </dt>
              <dd className="col-span-2">
                <CheckDetailSummary
                  checkKey={checkKey}
                  value={detail}
                />
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
): VerificationStatus {
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
    "metadata_matching",
    "face_match",
    "liveness",
    "duplicate",
    "age",
  ];
}

type OcrExtractionSummary = {
  extraction_source?: string;
  document_pattern_id?: string;
  ai_extraction?: {
    status?: string;
    provider?: string;
    model?: string | null;
    validation?: {
      status?: string;
      score?: number;
      mismatch_fields?: string[];
      reason?: string | null;
    };
  };
};

function OcrExtractionMetrics({ ocr }: { ocr: OcrExtractionSummary }) {
  return (
    <>
      <dt className="text-muted-foreground">Source</dt>
      <dd>{formatExtractionSource(ocr.extraction_source)}</dd>
      {ocr.document_pattern_id ? (
        <>
          <dt className="text-muted-foreground">Pattern</dt>
          <dd className="font-mono text-xs tabular-nums">
            {ocr.document_pattern_id.slice(0, 8)}
          </dd>
        </>
      ) : null}
      {ocr.ai_extraction?.validation?.status ? (
        <>
          <dt className="text-muted-foreground">AI validation</dt>
          <dd>{formatMachineLabel(ocr.ai_extraction.validation.status)}</dd>
        </>
      ) : null}
      {typeof ocr.ai_extraction?.validation?.score === "number" ? (
        <>
          <dt className="text-muted-foreground">AI confidence</dt>
          <dd className="font-mono tabular-nums">
            {Math.round(ocr.ai_extraction.validation.score * 100)}%
          </dd>
        </>
      ) : null}
    </>
  );
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

function MetadataMatchingMetrics({
  metadata,
}: {
  metadata: MetadataMatchingCheckResult["result"];
}) {
  return (
    <>
      <dt className="text-muted-foreground">Mismatches</dt>
      <dd>
        {metadata.mismatches.length > 0
          ? metadata.mismatches.map(formatMachineLabel).join(", ")
          : "None"}
      </dd>
      {metadata.skipped_fields.length > 0 ? (
        <>
          <dt className="text-muted-foreground">Skipped</dt>
          <dd>{metadata.skipped_fields.map(formatMachineLabel).join(", ")}</dd>
        </>
      ) : null}
      <dd className="col-span-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
        Metadata matching is recorded separately from OCR and does not affect
        automated risk scoring.
      </dd>
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

function getOcrExtraction(
  checkKey: string,
  result: CheckResult | undefined,
): OcrExtractionSummary | null {
  if (checkKey !== "ocr") return null;
  const value = result?.result ?? result?.detail;
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const extractionSource = record.extraction_source;
  const documentPatternId = record.document_pattern_id;
  const aiExtraction = record.ai_extraction;
  return {
    extraction_source:
      typeof extractionSource === "string" ? extractionSource : undefined,
    document_pattern_id:
      typeof documentPatternId === "string" ? documentPatternId : undefined,
    ai_extraction:
      aiExtraction && typeof aiExtraction === "object" && !Array.isArray(aiExtraction)
        ? (aiExtraction as OcrExtractionSummary["ai_extraction"])
        : undefined,
  };
}

function getMetadataMatching(
  checkKey: string,
  result: CheckResult | undefined,
): MetadataMatchingCheckResult["result"] | null {
  if (checkKey !== "metadata_matching") return null;
  const value = result?.result;
  if (!value || typeof value !== "object") return null;
  if (
    !Array.isArray(value.mismatches) ||
    !Array.isArray(value.skipped_fields) ||
    !Array.isArray(value.comparisons) ||
    typeof value.informational_only !== "boolean"
  ) {
    return null;
  }
  return value as MetadataMatchingCheckResult["result"];
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

function formatExtractionSource(value: string | undefined): string {
  if (value === "ai_provider") return "AI trained";
  if (value === "pattern") return "Learned pattern";
  if (value === "ocr") return "OCR heuristic";
  return "Extraction";
}

function CheckDetailSummary({
  checkKey,
  value,
}: {
  checkKey: string;
  value: Record<string, unknown>;
}) {
  const metadataMatching =
    checkKey === "metadata_matching" ? readMetadataMatching(value) : null;
  const entries = Object.entries(value).filter(
    ([key, entryValue]) =>
      ![
        "comparisons",
        "mismatches",
        "skipped_fields",
        "informational_only",
      ].includes(key) &&
      entryValue !== null &&
      entryValue !== undefined,
  );

  if (entries.length === 0) {
    return metadataMatching ? (
      <MetadataMatchingSummary metadata={metadataMatching} />
    ) : (
      <span className="text-muted-foreground text-sm">No extra detail</span>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3">
      {metadataMatching ? (
        <MetadataMatchingSummary metadata={metadataMatching} />
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

type MetadataMatchingSummaryValue = {
  status: "pass" | "fail" | "manual_review" | "pending" | "skipped";
  mismatches: string[];
  skipped_fields: string[];
  informational_only: boolean;
  comparisons: Array<{
    field: string;
    expected: unknown;
    actual: unknown;
    matched: boolean;
  }>;
};

function MetadataMatchingSummary({
  metadata,
}: {
  metadata: MetadataMatchingSummaryValue;
}) {
  const hasMismatch = metadata.mismatches.length > 0;
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">Metadata match</span>
        <Badge variant={hasMismatch ? "destructive" : "outline"}>
          {hasMismatch ? "Mismatch" : "Matched"}
        </Badge>
      </div>
      {metadata.informational_only ? (
        <p className="text-muted-foreground text-xs">
          Informational only. OCR extraction is evaluated separately.
        </p>
      ) : null}
      {metadata.comparisons.map((comparison) => (
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
      {metadata.skipped_fields.length > 0 ? (
        <p className="text-muted-foreground text-xs">
          Skipped {metadata.skipped_fields.map(formatMachineLabel).join(", ")}
        </p>
      ) : null}
    </div>
  );
}

function readMetadataMatching(
  value: Record<string, unknown>,
): MetadataMatchingSummaryValue | null {
  const status = value.status;
  const comparisons = value.comparisons;
  const mismatches = value.mismatches;
  const skippedFields = value.skipped_fields;
  const informationalOnly = value.informational_only;
  if (
    status !== "pass" &&
    status !== "fail" &&
    status !== "manual_review" &&
    status !== "pending" &&
    status !== "skipped"
  ) {
    return null;
  }
  if (
    !Array.isArray(comparisons) ||
    !Array.isArray(mismatches) ||
    !Array.isArray(skippedFields) ||
    typeof informationalOnly !== "boolean"
  ) {
    return null;
  }
  return {
    status,
    mismatches: mismatches.filter((item): item is string => typeof item === "string"),
    skipped_fields: skippedFields.filter(
      (item): item is string => typeof item === "string",
    ),
    informational_only: informationalOnly,
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
    if (
      value.every((item) =>
        ["string", "number", "boolean"].includes(typeof item),
      )
    ) {
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
