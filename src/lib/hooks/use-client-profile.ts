"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

export function useClientProfile() {
  return useQuery({
    queryKey: ["client-profile"],
    queryFn: apiClient.getClientProfile,
    staleTime: 60_000,
  });
}