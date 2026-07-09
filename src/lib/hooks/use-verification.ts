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
  enabled?: boolean;
};

export function useVerification({
  verificationId,
  enabled = true,
}: UseVerificationParams) {
  const query = useQuery({
    queryKey: ["verification", verificationId],
    queryFn: () => apiClient.getVerification(verificationId),
    enabled: Boolean(enabled && verificationId),
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
