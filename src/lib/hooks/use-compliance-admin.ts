"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  COMPLIANCE_BACKEND_STATUS,
  decideDsrRequest,
  listDsrRequests,
  listRetentionPolicies,
  updateRetentionPolicy,
  type ComplianceBackendError,
  type DsrDecisionInput,
  type DsrRequest,
  type RetentionPolicy,
  type UpdateRetentionInput,
} from "@/lib/compliance-admin";

export const COMPLIANCE_QUERY_KEYS = {
  dsr: ["admin", "compliance", "dsr"] as const,
  retention: ["admin", "compliance", "retention"] as const,
};

export function useAdminDsrRequests(filter?: {
  status?: DsrRequest["status"];
  kind?: DsrRequest["kind"];
}) {
  return useQuery<DsrRequest[], ComplianceBackendError>({
    queryKey: [...COMPLIANCE_QUERY_KEYS.dsr, filter ?? {}] as const,
    queryFn: () => listDsrRequests(filter),
    enabled: true,
    staleTime: 30_000,
  });
}

export function useDecideDsrRequest() {
  const queryClient = useQueryClient();
  return useMutation<DsrRequest, ComplianceBackendError, DsrDecisionInput>({
    mutationFn: (input) => decideDsrRequest(input),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: COMPLIANCE_QUERY_KEYS.dsr,
      });
    },
  });
}

export function useRetentionPolicies() {
  return useQuery<RetentionPolicy[], ComplianceBackendError>({
    queryKey: COMPLIANCE_QUERY_KEYS.retention,
    queryFn: () => listRetentionPolicies(),
    enabled: true,
    staleTime: 30_000,
  });
}

export function useUpdateRetentionPolicy() {
  const queryClient = useQueryClient();
  return useMutation<RetentionPolicy, ComplianceBackendError, UpdateRetentionInput>({
    mutationFn: (input) => updateRetentionPolicy(input),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: COMPLIANCE_QUERY_KEYS.retention,
      });
    },
  });
}

export function complianceBackendStatus(): ComplianceBackendError {
  return COMPLIANCE_BACKEND_STATUS;
}
