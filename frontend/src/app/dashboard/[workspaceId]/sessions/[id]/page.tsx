import { Suspense } from "react";
import { AppShell } from "@/components/dashboard/app-shell";
import { RouteGuard } from "@/components/dashboard/route-guard";
import { Skeleton } from "@/components/ui/skeleton";

import { SessionDetailManager } from "./_components/session-detail-manager";

export default async function Page({
  params,
}: {
  params: Promise<{ workspaceId: string; id: string }>;
}) {
  const { workspaceId, id } = await params;
  return (
    <AppShell audience="client">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
        <RouteGuard
          workspaceId={workspaceId}
          allowedRoles={[
            "client_owner",
            "client_admin",
            "client_reviewer",
            "client_developer",
          ]}
          fallbackHref={`/dashboard/${workspaceId}/sessions`}
        >
          <Suspense fallback={<SessionDetailFallback />}>
            <SessionDetailManager
              workspaceId={workspaceId}
              verificationId={id}
            />
          </Suspense>
        </RouteGuard>
      </main>
    </AppShell>
  );
}

function SessionDetailFallback() {
  return (
    <>
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-64 rounded-2xl md:col-span-2" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </>
  );
}