"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient, type VerificationDetail } from "@/lib/api-client";
import { publicEnv } from "@/lib/env";

const TERMINAL_STATUSES = new Set<VerificationDetail["status"]>([
  "approved",
  "rejected",
  "manual_review",
]);

export type UseVerificationParams = {
  verificationId: string;
  apiKey: string | null;
  enabled?: boolean;
};

export function useVerification({
  verificationId,
  apiKey,
  enabled = true,
}: UseVerificationParams) {
  const query = useQuery({
    queryKey: ["verification", verificationId],
    queryFn: () => {
      if (!apiKey) {
        throw new Error("API key is required to fetch a verification.");
      }
      return apiClient.getVerification(verificationId, apiKey);
    },
    enabled: Boolean(enabled && verificationId && apiKey),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && TERMINAL_STATUSES.has(status)) {
        return false;
      }
      if (typeof document !== "undefined" && document.hidden) {
        return false;
      }
      return publicEnv.verificationPollMs;
    },
    refetchIntervalInBackground: false,
  });

  const isPolling = query.isFetching && !TERMINAL_STATUSES.has(
    query.data?.status ?? "pending_upload",
  );

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPolling,
    refresh: () => {
      void query.refetch();
    },
  };
}

export function isTerminalStatus(status: VerificationDetail["status"]): boolean {
  return TERMINAL_STATUSES.has(status);
}