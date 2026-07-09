"use client";

import { ImagePlus, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUploadVerificationFiles } from "@/lib/hooks/use-upload-verification-files";

import { InlineError } from "./console-shared";

type UploadFilesCardProps = {
  verificationId: string;
};

export function UploadFilesCard({ verificationId }: UploadFilesCardProps) {
  const router = useRouter();
  const mutation = useUploadVerificationFiles();
  const [selfie, setSelfie] = useState<File | null>(null);
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);

  function handleFile(
    setter: (value: File | null) => void,
  ): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event) => {
      const file = event.target.files?.[0] ?? null;
      setter(file);
    };
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selfie || !idFront) {
      toast.error("Selfie and ID front are required.");
      return;
    }
    try {
      await mutation.mutateAsync({
        verificationId,
        files: { selfie, idFront, idBack: idBack ?? undefined },
      });
      toast.success("Files uploaded. Polling for results…");
      router.refresh();
    } catch {
      toast.error("Upload failed");
    }
  }

  const ready = selfie !== null && idFront !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload documents</CardTitle>
        <CardDescription>
          JPEG, PNG, or WEBP, up to 50 MB each. Images are compressed before
          upload. The ID back is optional. Once uploaded, the worker pipeline
          takes over and the status flips to{" "}
          <code className="font-mono">processing</code>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FileRow
            label="Selfie"
            file={selfie}
            inputId={`${verificationId}-selfie`}
            onChange={handleFile(setSelfie)}
            required
          />
          <FileRow
            label="ID front"
            file={idFront}
            inputId={`${verificationId}-id-front`}
            onChange={handleFile(setIdFront)}
            required
          />
          <FileRow
            label="ID back"
            file={idBack}
            inputId={`${verificationId}-id-back`}
            onChange={handleFile(setIdBack)}
          />
          {mutation.error ? (
            <InlineError
              error={mutation.error}
              title="Upload failed"
              onRetry={() => {
                if (ready) {
                  void onSubmit({
                    preventDefault: () => {},
                  } as React.FormEvent<HTMLFormElement>);
                }
              }}
            />
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs">
              Files never leave the browser until you press Upload.
            </p>
            <div className="flex gap-2">
              <Button
                render={
                  <Link href={`/console/verifications/${verificationId}`} />
                }
                nativeButton={false}
                variant="ghost"
                size="sm"
              >
                Skip - poll instead
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!ready || mutation.isPending}
              >
                <Upload data-icon="inline-start" aria-hidden />
                {mutation.isPending ? "Uploading…" : "Upload"}
              </Button>
            </div>
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
    <div className="space-y-1.5">
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
        <ImagePlus className="text-muted-foreground size-4" aria-hidden />
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
