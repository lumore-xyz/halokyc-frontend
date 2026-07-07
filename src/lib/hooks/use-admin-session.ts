"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

export function useAdminSession() {
  return useQuery({
    queryKey: ["admin-session"],
    queryFn: apiClient.getAdminSession,
    staleTime: 30_000,
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.adminLogin,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-session"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.adminLogout,
    onSuccess: () => {
      queryClient.setQueryData(["admin-session"], { authenticated: false });
      void queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });
}

