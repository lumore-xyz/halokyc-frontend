"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { useClientSession } from "@/lib/hooks/use-client-session";

import { ReviewQueue } from "./review-queue";

type ReviewerQueueViewProps = {
  workspaceId: string;
  heading: string;
  description: string;
  completedOnly?: boolean;
};

export function ReviewerQueueView({
  workspaceId,
  heading,
  description,
  completedOnly,
}: ReviewerQueueViewProps) {
  const session = useClientSession();
  const query = useQuery({
    queryKey: ["workspace-reviews", workspaceId, completedOnly ? "completed" : "assigned"],
    queryFn: async () => apiClient.listWorkspaceReviews(workspaceId),
    enabled: Boolean(session.data?.authenticated && workspaceId),
  });

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
        <p className="text-muted-foreground max-w-2xl">{description}</p>
      </header>
      <ReviewQueue workspaceId={workspaceId} reviews={query.data} />
    </>
  );
}
