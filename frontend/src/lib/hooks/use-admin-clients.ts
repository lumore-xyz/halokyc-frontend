"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  apiClient,
  type ClientUpdate,
  type Phase,
} from "@/lib/api-client";

export function useAdminClients() {
  return useQuery({
    queryKey: ["admin-clients"],
    queryFn: apiClient.listAdminClients,
  });
}

export function useAdminClient(clientId: string) {
  return useQuery({
    queryKey: ["admin-client", clientId],
    queryFn: () => apiClient.getAdminClient(clientId),
    enabled: Boolean(clientId),
  });
}

export function useCreateAdminClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.createAdminClient,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
    },
  });
}

export function useUpdateAdminClient(clientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClientUpdate) =>
      apiClient.updateAdminClient(clientId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-client", clientId] });
    },
  });
}

export function useUpdateAdminClientPhase(clientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (phase: Phase) =>
      apiClient.updateAdminClientPhase(clientId, phase),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-client", clientId] });
    },
  });
}

export function useAdminClientApiKeys(clientId: string) {
  return useQuery({
    queryKey: ["admin-client-api-keys", clientId],
    queryFn: () => apiClient.listAdminClientApiKeys(clientId),
    enabled: Boolean(clientId),
  });
}

export function useCreateAdminClientApiKey(clientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.createAdminClientApiKey(clientId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-client-api-keys", clientId],
      });
      void queryClient.invalidateQueries({ queryKey: ["admin-client", clientId] });
    },
  });
}
