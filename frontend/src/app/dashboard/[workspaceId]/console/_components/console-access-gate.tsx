"use client";

import { type FormEvent, useId, useState } from "react";
import {
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  ShieldCheckIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { NoApiKeyState } from "@/components/console/console-shared";
import { RecentSessionsCard } from "@/components/console/recent-sessions-card";
import { StartVerificationCard } from "@/components/console/start-verification-card";
import { EmptyState } from "@/components/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useApiKey } from "@/lib/hooks/use-api-key";
import { useWorkspaceApiKeys } from "@/lib/hooks/use-my-api-keys";

export function ConsoleAccessGate({ workspaceId }: { workspaceId: string }) {
  const apiKeys = useWorkspaceApiKeys(workspaceId);
  const { apiKey, setApiKey, clearApiKey } = useApiKey();
  const [configOpen, setConfigOpen] = useState(false);
  const [draftKey, setDraftKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [touched, setTouched] = useState(false);
  const apiKeyInputId = useId();

  const activeKeys = (apiKeys.data ?? []).filter(
    (key) => key.revoked_at === null,
  );
  const keyError =
    draftKey.trim().length === 0
      ? "Paste an API key to authorize the console."
      : null;
  const showKeyError = touched && keyError !== null;

  function openConfig() {
    setConfigOpen(true);
    setDraftKey("");
    setShowKey(false);
    setTouched(false);
  }

  function closeConfig() {
    setConfigOpen(false);
    setDraftKey("");
    setShowKey(false);
    setTouched(false);
  }

  function handleAuthorize(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (keyError) return;
    setApiKey(draftKey);
    closeConfig();
    toast.success("Console authorized for this browser tab.");
  }

  function handleClearApiKey() {
    clearApiKey();
    closeConfig();
    toast.success("Console API key removed from this browser tab.");
  }

  const configSheet = (
    <Sheet
      open={configOpen}
      onOpenChange={(open) => {
        if (open) {
          setConfigOpen(true);
          return;
        }
        closeConfig();
      }}
    >
      <SheetContent className="flex flex-col gap-0 p-0">
        <form
          className="flex h-full flex-col"
          onSubmit={handleAuthorize}
          aria-labelledby="console-api-key-title"
        >
          <SheetHeader className="border-b p-4">
            <SheetTitle id="console-api-key-title">
              {apiKey ? "Configure console" : "Authorize console"}
            </SheetTitle>
            <SheetDescription>
              Paste a workspace API key so this console can call the developer
              API while you test verification workflows for this workspace.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            {apiKey ? (
              <Alert>
                <KeyRoundIcon />
                <AlertTitle>Session API key is active</AlertTitle>
                <AlertDescription className="flex flex-col gap-3">
                  <span>
                    This browser tab is using a key ending in{" "}
                    <span className="font-mono">{apiKey.slice(-4)}</span>{" "}
                    bound to this workspace.
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearApiKey}
                  >
                    <Trash2Icon data-icon="inline-start" />
                    Clear session key
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null}

            <FieldGroup>
              <Field data-invalid={showKeyError || undefined}>
                <FieldLabel htmlFor={apiKeyInputId}>
                  {apiKey ? "Replace API key" : "API key"}
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id={apiKeyInputId}
                    type={showKey ? "text" : "password"}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="live_... or test_..."
                    value={draftKey}
                    aria-invalid={showKeyError ? true : undefined}
                    aria-describedby={
                      showKeyError ? `${apiKeyInputId}-error` : undefined
                    }
                    onChange={(event) => {
                      setDraftKey(event.target.value);
                      if (touched) setTouched(false);
                    }}
                    autoFocus
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      size="icon-xs"
                      aria-label={showKey ? "Hide API key" : "Show API key"}
                      onClick={() => setShowKey((value) => !value)}
                    >
                      {showKey ? <EyeOffIcon /> : <EyeIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription>
                  Paste a key issued to this workspace. The environment prefix
                  (`live_…` or `test_…`) tells the backend which bucket to
                  charge. Stored only in this browser tab on your local machine
                  via session storage and cleared when the tab closes.
                </FieldDescription>
                {showKeyError ? (
                  <FieldError id={`${apiKeyInputId}-error`}>
                    {keyError}
                  </FieldError>
                ) : null}
              </Field>
            </FieldGroup>

            {activeKeys.length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-muted-foreground text-xs uppercase tracking-wide">
                  Active workspace keys
                </p>
                <ul className="divide-y divide-[var(--dashboard-rule)] rounded-lg border border-[var(--dashboard-rule)]">
                  {activeKeys.map((key) => (
                    <li
                      key={key.api_key_id}
                      className="flex items-center justify-between gap-3 px-3 py-2"
                    >
                      <span className="truncate text-sm">{key.name}</span>
                      <Badge
                        variant={
                          key.environment === "live" ? "default" : "secondary"
                        }
                      >
                        {key.environment}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <SheetFooter className="border-t p-4">
            <SheetClose render={<Button type="button" variant="ghost" />}>
              Cancel
            </SheetClose>
            <Button type="submit">
              <KeyRoundIcon data-icon="inline-start" />
              {apiKey ? "Update key" : "Authorize console"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );

  if (apiKeys.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (apiKeys.error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load workspace API keys</AlertTitle>
        <AlertDescription>
          Refresh the page or open API Keys to confirm your client session.
        </AlertDescription>
      </Alert>
    );
  }

  if (activeKeys.length === 0) {
    return (
      <NoApiKeyState
        hideWhenApiKey={false}
        actionHref={`/dashboard/${workspaceId}/api-keys`}
        actionLabel="Open workspace API keys"
        message="Create a workspace API key before using the console. It authenticates start-session, upload, and polling requests as this workspace, and the raw key is shown only once when you create it."
      />
    );
  }

  if (!apiKey) {
    return (
      <>
        <EmptyState
          icon={ShieldCheckIcon}
          title="Authorize this console"
          description="You have active workspace API keys. Paste one raw key to continue testing workflows from this browser tab."
          action={
            <Button type="button" onClick={openConfig}>
              <KeyRoundIcon data-icon="inline-start" />
              Open config
            </Button>
          }
        />

        {configSheet}
      </>
    );
  }

  return (
    <>
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={openConfig}>
          <KeyRoundIcon data-icon="inline-start" />
          Open config
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-1">
        <StartVerificationCard workspaceId={workspaceId} />
        <RecentSessionsCard workspaceId={workspaceId} />
      </div>
      {configSheet}
    </>
  );
}
