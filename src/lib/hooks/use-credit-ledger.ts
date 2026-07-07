"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

export type UseMyCreditLedgerFilters = {
  workspaceId?: string | null;
  limit?: number;
  offset?: number;
};

export function useMyCreditLedger(filters: UseMyCreditLedgerFilters = {}) {
  const { workspaceId = null, limit = 100, offset = 0 } = filters;
  return useQuery({
    queryKey: ["my-credit-ledger", workspaceId ?? "all", limit, offset],
    queryFn: () =>
      apiClient.getMyCreditLedger({ workspaceId, limit, offset }),
  });
}

export function useAdminCreditLedger(organizationId?: string) {
  return useQuery({
    queryKey: ["admin-credit-ledger", organizationId ?? "all"],
    queryFn: () => apiClient.getAdminCreditLedger({ organizationId }),
  });
}