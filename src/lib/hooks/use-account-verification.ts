"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

const QUERY_KEY = ["account-identity-verification"] as const;

export function useAccountVerification(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: apiClient.getAccountIdentityVerification,
    enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "processing" || status === "awaiting_credits"
        ? 5_000
        : false;
    },
  });
}

export function useStartAccountVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.startAccountIdentityVerification,
    onSuccess: (verification) => {
      queryClient.setQueryData(QUERY_KEY, verification);
    },
  });
}
