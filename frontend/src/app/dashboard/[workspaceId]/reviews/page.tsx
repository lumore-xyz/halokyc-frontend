import { RouteGuard } from "@/components/dashboard/route-guard";

import { ReviewQueue } from "./_components/review-queue";

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return (
    <RouteGuard
      workspaceId={workspaceId}
      allowedRoles={["client_owner", "client_admin", "client_reviewer"]}
      fallbackHref={`/dashboard/${workspaceId}`}
    >
      <ReviewQueue workspaceId={workspaceId} />
    </RouteGuard>
  );
}
