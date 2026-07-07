"use client";

import { type FormEvent, useId, useState } from "react";
import {
  EyeIcon,
  EyeOffIcon,
  ImagePlusIcon,
  KeyRoundIcon,
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
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useApiKey } from "@/lib/hooks/use-api-key";
import { useUploadVerificationFiles } from "@/lib/hooks/use-upload-verification-files";

import { InlineError } from "@/components/console/console-shared";

type SessionUploadCardProps = {
  workspaceId: string;
  verificationId: string;
};

export function SessionUploadCard({
  workspaceId,
  verificationId,
}: SessionUploadCardProps) {
  const { apiKey, setApiKey } = useApiKey();
  const mutation = useUploadVerificationFiles();
  const [selfie, setSelfie] = useState<File | null>(null);
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [draftKey, setDraftKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const apiKeyInputId = useId();

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
    if (!apiKey || !selfie || !idFront) {
      toast.error("Selfie and ID front are required.");
      return;
    }
    try {
      const result = await mutation.mutateAsync({
        verificationId,
        apiKey,
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

  function onAuthorizeKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    const trimmed = draftKey.trim();
    if (!trimmed) {
      setKeyError("Paste a workspace API key to continue.");
      return;
    }
    setApiKey(trimmed);
    setKeyError(null);
    setDraftKey("");
    setTouched(false);
  }

  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRoundIcon className="size-4 text-muted-foreground" aria-hidden />
            Authorize this session
          </CardTitle>
          <CardDescription>
            Uploaded files are sent with the workspace API key that started
            this session. Paste the same key you used to create the session,
            then upload the selfie and ID photos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={onAuthorizeKey}
            className="flex flex-col gap-4"
            noValidate
            aria-labelledby={`${apiKeyInputId}-label`}
          >
            <FieldGroup>
              <Field data-invalid={touched && keyError ? true : undefined}>
                <FieldLabel id={`${apiKeyInputId}-label`} htmlFor={apiKeyInputId}>
                  Workspace API key
                </FieldLabel>
                <div className="flex gap-2">
                  <Input
                    id={apiKeyInputId}
                    type={showKey ? "text" : "password"}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="live_... or test_..."
                    value={draftKey}
                    aria-invalid={
                      touched && keyError ? "true" : undefined
                    }
                    aria-describedby={
                      touched && keyError
                        ? `${apiKeyInputId}-error`
                        : undefined
                    }
                    onChange={(event) => {
                      setDraftKey(event.target.value);
                      if (touched) setTouched(false);
                      if (keyError) setKeyError(null);
                    }}
                    className="font-mono text-xs"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowKey((value) => !value)}
                    aria-label={
                      showKey ? "Hide API key" : "Show API key"
                    }
                  >
                    {showKey ? (
                      <EyeOffIcon className="size-4" aria-hidden />
                    ) : (
                      <EyeIcon className="size-4" aria-hidden />
                    )}
                  </Button>
                </div>
                <FieldDescription>
                  Stored only in this browser tab on your local machine via
                  session storage and cleared when the tab closes. Use a key
                  issued to workspace{" "}
                  <code className="font-mono">{workspaceId.slice(0, 8)}</code>
                  .
                </FieldDescription>
                {touched && keyError ? (
                  <FieldError id={`${apiKeyInputId}-error`}>
                    {keyError}
                  </FieldError>
                ) : null}
              </Field>
            </FieldGroup>
            <div className="flex justify-end">
              <Button type="submit">
                <KeyRoundIcon data-icon="inline-start" aria-hidden />
                Authorize key
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImagePlusIcon className="size-4 text-muted-foreground" aria-hidden />
          Upload documents
        </CardTitle>
        <CardDescription>
          HaloKYC accepts JPEG or PNG, up to 8 MB each. The ID back is
          optional. Once uploaded, the worker pipeline takes over when credits
          are reserved. The status flips to{" "}
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
          accept="image/jpeg,image/png"
          onChange={onChange}
          className="text-foreground file:text-foreground w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-2 file:py-1 file:text-xs"
        />
      </div>
    </div>
  );
}
