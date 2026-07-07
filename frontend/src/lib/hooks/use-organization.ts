"use client";

import { useQuery } from "@tanstack/react-query";

import {
  apiClient,
  type Organization,
  type OrganizationMember,
} from "@/lib/api-client";
import { useClientSession } from "@/lib/hooks/use-client-session";

export function useOrganization() {
  const session = useClientSession();
  const organizationId = session.data?.organizationId ?? null;
  return useQuery<Organization | null>({
    queryKey: ["organization", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      return apiClient.getOrganization(organizationId);
    },
    enabled: Boolean(session.data?.authenticated && organizationId),
  });
}

export function useOrganizationMembers() {
  const session = useClientSession();
  const organizationId = session.data?.organizationId ?? null;
  return useQuery<OrganizationMember[]>({
    queryKey: ["organization-members", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      return apiClient.listOrganizationMembers(organizationId);
    },
    enabled: Boolean(session.data?.authenticated && organizationId),
  });
}