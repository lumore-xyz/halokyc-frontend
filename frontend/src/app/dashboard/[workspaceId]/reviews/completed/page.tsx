import { AppShell } from "@/components/dashboard/app-shell";
import { RouteGuard } from "@/components/dashboard/route-guard";
import { ReviewerQueueView } from "../_components/reviewer-queue-view";

export default async function CompletedReviewsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return (
    <AppShell audience="client">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
        <RouteGuard
          workspaceId={workspaceId}
          allowedRoles={["client_reviewer"]}
          fallbackHref={`/dashboard/${workspaceId}/reviews`}
        >
          <ReviewerQueueView
            workspaceId={workspaceId}
            heading="Completed reviews"
            description="Sessions you or another reviewer in this workspace already decided. The full audit trail is in the workspace audit log."
            completedOnly
          />
        </RouteGuard>
      </main>
    </AppShell>
  );
}