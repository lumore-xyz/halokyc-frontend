"use client";

import { type FormEvent, useState } from "react";
import {
  ImagePlusIcon,
  UploadIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useUploadVerificationFiles } from "@/lib/hooks/use-upload-verification-files";

import { InlineError } from "@/components/console/console-shared";

type SessionUploadCardProps = {
  workspaceId: string;
  verificationId: string;
};

export function SessionUploadCard({
  verificationId,
}: SessionUploadCardProps) {
  const mutation = useUploadVerificationFiles();
  const [selfie, setSelfie] = useState<File | null>(null);
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);

  const ready = selfie !== null && idFront !== null;

  function handleFile(
    setter: (value: File | null) => void,
  ): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event) => {
      const file = event.target.files?.[0] ?? null;
      setter(file);
    };
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selfie || !idFront) {
      toast.error("Selfie and ID front are required.");
      return;
    }
    try {
      const result = await mutation.mutateAsync({
        verificationId,
        files: { selfie, idFront, idBack: idBack ?? undefined },
      });
      toast.success(
        result.status === "awaiting_credits"
          ? "Files uploaded. This session is waiting to resume."
          : "Files uploaded. HaloKYC is now processing this session.",
      );
      setSelfie(null);
      setIdFront(null);
      setIdBack(null);
    } catch {
      toast.error("Upload failed");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImagePlusIcon className="size-4 text-muted-foreground" aria-hidden />
          Upload documents
        </CardTitle>
        <CardDescription>
          HaloKYC accepts JPEG, PNG, or WEBP, up to 50 MB each. Images are
          compressed before upload. The ID back is optional. Once uploaded, the
          worker pipeline takes over when credits are reserved. The status flips
          to{" "}
          <code className="font-mono">processing</code> or{" "}
          <code className="font-mono">awaiting_credits</code>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          <FileRow
            label="Selfie"
            file={selfie}
            inputId={`${verificationId}-dashboard-selfie`}
            onChange={handleFile(setSelfie)}
            required
          />
          <FileRow
            label="ID front"
            file={idFront}
            inputId={`${verificationId}-dashboard-id-front`}
            onChange={handleFile(setIdFront)}
            required
          />
          <FileRow
            label="ID back"
            file={idBack}
            inputId={`${verificationId}-dashboard-id-back`}
            onChange={handleFile(setIdBack)}
          />
          {mutation.error ? (
            <InlineError
              error={mutation.error}
              title="Upload failed"
            />
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs">
              Files never leave the browser until you press Upload.
            </p>
            <Button type="submit" disabled={!ready || mutation.isPending}>
              {mutation.isPending ? (
                <Spinner data-icon="inline-start" aria-hidden />
              ) : (
                <UploadIcon data-icon="inline-start" aria-hidden />
              )}
              {mutation.isPending ? "Uploading…" : "Upload"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

type FileRowProps = {
  label: string;
  file: File | null;
  inputId: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
};

function FileRow({ label, file, inputId, onChange, required }: FileRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-foreground flex items-center justify-between text-sm font-medium"
      >
        <span>
          {label}
          {required ? (
            <span aria-hidden className="text-destructive ms-1">
              *
            </span>
          ) : (
            <span className="text-muted-foreground ms-1 text-xs font-normal">
              (optional)
            </span>
          )}
        </span>
        {file ? (
          <span className="text-muted-foreground font-mono text-xs">
            {file.name} ({Math.round(file.size / 1024)} KB)
          </span>
        ) : null}
      </label>
      <div className="border-border bg-muted/40 flex items-center gap-3 rounded-lg border border-dashed px-3 py-2">
        <ImagePlusIcon
          className="text-muted-foreground size-4"
          aria-hidden
        />
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onChange}
          className="text-foreground file:text-foreground w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-2 file:py-1 file:text-xs"
        />
      </div>
    </div>
  );
}
