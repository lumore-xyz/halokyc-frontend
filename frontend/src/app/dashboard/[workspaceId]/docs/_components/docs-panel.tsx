"use client";

import NextLink from "next/link";
import {
  BookOpenIcon,
  KeyRoundIcon,
  WebhookIcon,
  WorkflowIcon,
  Code2Icon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DocsPanel({ workspaceId }: { workspaceId: string }) {
  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Docs</h1>
        <p className="text-muted-foreground max-w-2xl">
          Practical guides and reference material for wiring HaloKYC into your
          product. Owners and admins can also reach this page from the sidebar.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Where to start</CardTitle>
          <CardDescription>
            Build a working integration in five steps. Each link opens an
            internal reference page in this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-3 text-sm">
            <li className="flex items-start gap-3">
              <KeyRoundIcon className="mt-0.5 size-4 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <span className="font-medium">Issue a workspace API key</span>
                <p className="text-muted-foreground">
                  Open{" "}
                  <NextLink
                    className="underline"
                    href={`/dashboard/${workspaceId}/api-keys`}
                  >
                    API keys
                  </NextLink>{" "}
                  and copy the live key. We show the raw value exactly once.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <WorkflowIcon className="mt-0.5 size-4 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <span className="font-medium">Define a workflow</span>
                <p className="text-muted-foreground">
                  Build a policy bundle of checks (selfie, liveness, document,
                  age) under{" "}
                  <NextLink
                    className="underline"
                    href={`/dashboard/${workspaceId}/workflows`}
                  >
                    Workflows
                  </NextLink>
                  .
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Code2Icon className="mt-0.5 size-4 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <span className="font-medium">Test from the console</span>
                <p className="text-muted-foreground">
                  Use the{" "}
                  <NextLink
                    className="underline"
                    href={`/dashboard/${workspaceId}/console`}
                  >
                    API console
                  </NextLink>{" "}
                  to start a verification, upload evidence, and watch the
                  pipeline land on a decision.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <WebhookIcon className="mt-0.5 size-4 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <span className="font-medium">Wire a webhook</span>
                <p className="text-muted-foreground">
                  Add a URL under{" "}
                  <NextLink
                    className="underline"
                    href={`/dashboard/${workspaceId}/webhooks`}
                  >
                    Webhooks
                  </NextLink>{" "}
                  to receive HMAC-signed status updates.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <BookOpenIcon className="mt-0.5 size-4 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <span className="font-medium">Monitor from the activity log</span>
                <p className="text-muted-foreground">
                  Open{" "}
                  <NextLink
                    className="underline"
                    href={`/dashboard/${workspaceId}/sessions`}
                  >
                    Verifications
                  </NextLink>{" "}
                  to inspect sessions, status counts, and audit history.
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reference</CardTitle>
          <CardDescription>
            The full contract lives in the API_CONTRACTS docs in this
            repository. Every new endpoint ships with a typed wrapper in
            <code className="ml-1 rounded bg-muted px-1 font-mono text-xs">
              src/lib/api-client.ts
            </code>
            .
          </CardDescription>
        </CardHeader>
      </Card>
    </>
  );
}