"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  apiClient,
  type Workspace,
  type WorkspaceCreate,
  type WorkspaceUpdate,
} from "@/lib/api-client";

export function useWorkspaces() {
  return useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: apiClient.listWorkspaces,
  });
}

export function useDefaultWorkspace() {
  const workspaces = useWorkspaces();
  return {
    ...workspaces,
    workspace: workspaces.data?.[0] ?? null,
  };
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation<Workspace, Error, WorkspaceCreate>({
    mutationFn: apiClient.createWorkspace,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useUpdateWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation<Workspace, Error, WorkspaceUpdate>({
    mutationFn: (payload) => apiClient.updateWorkspace(workspaceId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
