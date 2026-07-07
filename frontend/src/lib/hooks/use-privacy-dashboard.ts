"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  PRIVACY_BACKEND_STATUS,
  createPrivacyRequest,
  fetchPrivacyRequests,
  fetchPrivacySummary,
  type CreatePrivacyRequestInput,
  type PrivacyDataSummary,
  type PrivacyRequest,
} from "@/lib/privacy-dashboard";

export const PRIVACY_DASHBOARD_QUERY_KEYS = {
  summary: ["privacy-dashboard", "summary"] as const,
  requests: ["privacy-dashboard", "requests"] as const,
};

export type PrivacyDashboardError = {
  code: "REQUEST_FAILED";
  message: string;
};

export function usePrivacySummary() {
  return useQuery<PrivacyDataSummary, PrivacyDashboardError>({
    queryKey: PRIVACY_DASHBOARD_QUERY_KEYS.summary,
    queryFn: fetchPrivacySummary,
    staleTime: 30_000,
  });
}

export function usePrivacyRequests() {
  return useQuery<PrivacyRequest[], PrivacyDashboardError>({
    queryKey: PRIVACY_DASHBOARD_QUERY_KEYS.requests,
    queryFn: fetchPrivacyRequests,
    staleTime: 30_000,
  });
}

export function useCreatePrivacyRequest() {
  const queryClient = useQueryClient();
  return useMutation<
    PrivacyRequest,
    PrivacyDashboardError,
    CreatePrivacyRequestInput
  >({
    mutationFn: (input) => createPrivacyRequest(input),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: PRIVACY_DASHBOARD_QUERY_KEYS.requests,
      });
    },
  });
}

export function isPrivacyBackendLive(
  error: PrivacyDashboardError | null | undefined,
): boolean {
  return !error;
}

export function privacyBackendStatus(): PrivacyDashboardError {
  return PRIVACY_BACKEND_STATUS;
}
