"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

export function useBillingCatalog() {
  return useQuery({
    queryKey: ["billing-catalog"],
    queryFn: () => apiClient.getBillingCatalog(),
  });
}

export function useBillingSubscription() {
  return useQuery({
    queryKey: ["billing-subscription"],
    queryFn: () => apiClient.getBillingSubscription(),
  });
}

export function useBillingEntitlements() {
  return useQuery({
    queryKey: ["billing-entitlements"],
    queryFn: () => apiClient.getBillingEntitlements(),
  });
}

export function useCreateSubscriptionCheckout() {
  return useMutation({
    mutationFn: (catalogKey: string) =>
      apiClient.createSubscriptionCheckout(catalogKey),
  });
}

export function useCreateCreditPackCheckout() {
  return useMutation({
    mutationFn: (catalogKey: string) =>
      apiClient.createCreditPackCheckout(catalogKey),
  });
}
