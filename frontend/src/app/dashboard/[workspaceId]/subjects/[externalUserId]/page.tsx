import { AppShell } from "@/components/dashboard/app-shell";
import { RouteGuard } from "@/components/dashboard/route-guard";
import { SubjectLifecyclePanel } from "./_components/subject-lifecycle-panel";

export default async function Page({
  params,
}: {
  params: Promise<{ workspaceId: string; externalUserId: string }>;
}) {
  const { workspaceId, externalUserId } = await params;
  const decodedExternalUserId = decodeURIComponent(externalUserId);

  return (
    <AppShell audience="client">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
        <RouteGuard
          workspaceId={workspaceId}
          allowedRoles={["client_owner", "client_admin", "client_reviewer"]}
          fallbackHref={`/dashboard/${workspaceId}`}
        >
          <SubjectLifecyclePanel
            workspaceId={workspaceId}
            externalUserId={decodedExternalUserId}
          />
        </RouteGuard>
      </main>
    </AppShell>
  );
}
