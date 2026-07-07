"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient, type Workspace } from "@/lib/api-client";
import { useClientSession } from "@/lib/hooks/use-client-session";

export function useWorkspace(workspaceId: string | null | undefined) {
  const session = useClientSession();
  return useQuery<Workspace | null>({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      return apiClient.getWorkspace(workspaceId);
    },
    enabled: Boolean(session.data?.authenticated && workspaceId),
  });
}