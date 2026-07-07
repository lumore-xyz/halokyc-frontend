import { AppShell } from "@/components/dashboard/app-shell";
import { RouteGuard } from "@/components/dashboard/route-guard";
import { ReviewerQueueView } from "../_components/reviewer-queue-view";

export default async function AssignedReviewsPage({
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
            heading="Assigned reviews"
            description="Sessions routed to your queue specifically. Owners and admins decide which sessions you receive; this page filters to those."
          />
        </RouteGuard>
      </main>
    </AppShell>
  );
}