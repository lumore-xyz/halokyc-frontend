"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

export function useClientSession() {
  return useQuery({
    queryKey: ["client-session"],
    queryFn: apiClient.getClientSession,
    staleTime: 30_000,
  });
}

export function useClientLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.clientLogin,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["client-session"] });
      void queryClient.invalidateQueries({ queryKey: ["my-api-keys"] });
    },
  });
}

export function useClientSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.clientSignup,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["client-session"] });
      void queryClient.invalidateQueries({ queryKey: ["my-api-keys"] });
    },
  });
}

export function useClientLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.clientLogout,
    onSuccess: () => {
      queryClient.setQueryData(["client-session"], { authenticated: false });
      queryClient.setQueryData(["my-api-keys"], []);
      void queryClient.invalidateQueries({ queryKey: ["client-session"] });
      void queryClient.invalidateQueries({ queryKey: ["my-api-keys"] });
    },
  });
}
