"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  apiClient,
  type ApiKeyCreate,
  type ApiKeyCreateResponse,
  type ApiKeyListItem,
} from "@/lib/api-client";

export function useMyApiKeys() {
  return useQuery<ApiKeyListItem[]>({
    queryKey: ["my-api-keys"],
    queryFn: () => apiClient.listMyApiKeys(),
  });
}

export function useWorkspaceApiKeys(
  workspaceId: string | null,
  filters: { includeRevoked?: boolean } = {},
) {
  return useQuery<ApiKeyListItem[]>({
    queryKey: ["workspace-api-keys", workspaceId, filters.includeRevoked],
    queryFn: () =>
      apiClient.listWorkspaceApiKeys(workspaceId as string, filters),
    enabled: Boolean(workspaceId),
  });
}

export function useCreateMyApiKey() {
  const queryClient = useQueryClient();
  return useMutation<ApiKeyCreateResponse, Error, ApiKeyCreate>({
    mutationFn: apiClient.createMyApiKey,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-api-keys"] });
    },
  });
}

export function useRevokeMyApiKey() {
  const queryClient = useQueryClient();
  return useMutation<undefined, Error, string>({
    mutationFn: (apiKeyId) => apiClient.revokeMyApiKey(apiKeyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-api-keys"] });
    },
  });
}

export function useCreateWorkspaceApiKey(workspaceId: string | null) {
  const queryClient = useQueryClient();
  return useMutation<ApiKeyCreateResponse, Error, ApiKeyCreate>({
    mutationFn: (payload) =>
      apiClient.createWorkspaceApiKey(workspaceId as string, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["workspace-api-keys", workspaceId],
      });
    },
  });
}

export function useRevokeWorkspaceApiKey(workspaceId: string | null) {
  const queryClient = useQueryClient();
  return useMutation<undefined, Error, string>({
    mutationFn: (apiKeyId) =>
      apiClient.revokeWorkspaceApiKey(workspaceId as string, apiKeyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["workspace-api-keys", workspaceId],
      });
    },
  });
}
