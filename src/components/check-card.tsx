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
                <pre className="bg-muted text-foreground max-h-48 overflow-auto rounded-md p-3 font-mono text-xs leading-relaxed">
                  {JSON.stringify(detail, null, 2)}
                </pre>
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
