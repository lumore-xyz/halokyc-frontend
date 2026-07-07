"use client";

import { useEffect, useState } from "react";
import { EyeOffIcon, ImageOffIcon } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VerificationSessionDetail } from "@/lib/api-client";

type EvidenceViewerProps = {
  workspaceId: string;
  session: VerificationSessionDetail;
  canViewEvidence: boolean;
};

const FILE_TYPE_LABEL: Record<string, string> = {
  selfie: "Selfie",
  id_front: "ID front",
  id_back: "ID back",
};

export function EvidenceViewer({
  workspaceId,
  session,
  canViewEvidence,
}: EvidenceViewerProps) {
  if (!canViewEvidence) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Captured evidence</CardTitle>
          <CardDescription>
            Sensitive KYC evidence is hidden from the developer role. Each
            access from an owner, admin, or reviewer is recorded in the
            workspace audit log.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <EyeOffIcon />
            <AlertTitle>Hidden by role</AlertTitle>
            <AlertDescription>
              Your current role does not include access to biometric evidence.
              Request a workspace owner grant you an admin or reviewer role to
              inspect the captured selfie and ID images. Backend 403 responses
              on the evidence endpoint are enforced even if a developer attempts
              a direct request.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (session.files.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Captured evidence</CardTitle>
          <CardDescription>
            Files uploaded during this verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No files have been uploaded for this session yet, or they have been
            purged by the retention policy.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Captured evidence</CardTitle>
        <CardDescription>
          Each image is streamed over the workspace BFF. Viewing the image
          creates an audit-log entry for your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {session.files.map((file) => (
            <EvidenceTile
              key={file.id}
              workspaceId={workspaceId}
              verificationId={session.verification_id}
              file={file}
            />
          ))}
        </div>
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>File</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>MIME</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {session.files.map((file) => (
              <TableRow key={`${file.id}-meta`}>
                <TableCell className="font-mono text-xs">
                  {file.id.slice(0, 8)}
                </TableCell>
                <TableCell className="text-sm">
                  {FILE_TYPE_LABEL[file.file_type] ?? file.file_type}
                </TableCell>
                <TableCell className="text-sm tabular-nums">
                  {Math.round(file.file_size / 1024)} KB
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {file.mime_type}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function EvidenceTile({
  workspaceId,
  verificationId,
  file,
}: {
  workspaceId: string;
  verificationId: string;
  file: VerificationSessionDetail["files"][number];
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;
    async function load() {
      try {
        const response = await fetch(
          `/api/client/workspaces/${workspaceId}/verifications/${verificationId}/files/${file.id}`,
          { credentials: "include" },
        );
        if (!response.ok) {
          if (active) setFailed(true);
          return;
        }
        const blob = await response.blob();
        createdUrl = URL.createObjectURL(blob);
        if (active) setSrc(createdUrl);
      } catch {
        if (active) setFailed(true);
      }
    }
    void load();
    return () => {
      active = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [workspaceId, verificationId, file.id]);

  return (
    <figure className="flex flex-col gap-2 rounded-xl border border-[var(--dashboard-rule)] bg-[var(--dashboard-canvas)] p-3">
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-muted">
        {failed ? (
          <ImageOffIcon
            className="text-muted-foreground size-8"
            aria-label="Evidence could not be loaded"
          />
        ) : src ? (
          // Render via object URL only; never via server <img> per security
          // rules for biometric evidence.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`Captured ${FILE_TYPE_LABEL[file.file_type] ?? file.file_type}`}
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-muted-foreground text-xs">Loading...</span>
        )}
      </div>
      <figcaption className="text-muted-foreground text-xs">
        {FILE_TYPE_LABEL[file.file_type] ?? file.file_type} -{" "}
        {Math.round(file.file_size / 1024)} KB
      </figcaption>
    </figure>
  );
}
