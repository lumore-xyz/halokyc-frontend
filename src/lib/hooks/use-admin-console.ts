"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  apiClient,
  type AdminBillingCatalogItem,
  type AdminBillingCatalogItemUpdate,
  type AdminCreditAdjustmentRequest,
  type AdminOrganizationUpdateRequest,
  type AdminSalesNoteRequest,
  type AdminSupportNoteRequest,
  type AdminSystemSettings,
  type AiModelProvider,
  type AiModelProviderCreate,
  type AiModelProviderKey,
  type AiModelProviderKeyCreate,
  type AiModelProviderKeyUpdate,
  type AiModelProviderType,
  type AiModelProviderUpdate,
  type PlatformAdminInviteRequest,
  type PlatformAdminUpdateRequest,
} from "@/lib/api-client";

export type {
  AdminBillingCatalogItem,
  AdminBillingCatalogItemUpdate,
  AiModelProvider,
  AiModelProviderCreate,
  AiModelProviderKey,
  AiModelProviderKeyCreate,
  AiModelProviderKeyUpdate,
  AiModelProviderType,
  AiModelProviderUpdate,
};

export type AiProviderKeyCreateInput = AiModelProviderKeyCreate & {
  provider_id: string;
};

export type AiProviderKeyUpdateInput = AiModelProviderKeyUpdate & {
  provider_id: string;
  key_id: string;
};

export type AiProviderKeyDeleteInput = {
  provider_id: string;
  key_id: string;
};

export function useAdminOrganizations() {
  return useQuery({
    queryKey: ["admin-organizations"],
    queryFn: apiClient.listAdminOrganizations,
  });
}

export function useAdminOrganization(organizationId: string | null) {
  return useQuery({
    queryKey: ["admin-organization", organizationId],
    queryFn: () => apiClient.getAdminOrganization(organizationId as string),
    enabled: Boolean(organizationId),
  });
}

export function useUpdateAdminOrganization(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminOrganizationUpdateRequest) =>
      apiClient.updateAdminOrganization(organizationId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
      void queryClient.invalidateQueries({
        queryKey: ["admin-organization", organizationId],
      });
    },
  });
}

export function useAdminWorkspaces() {
  return useQuery({
    queryKey: ["admin-workspaces"],
    queryFn: apiClient.listAdminWorkspaces,
  });
}

export function useAdminWorkspace(workspaceId: string | null) {
  return useQuery({
    queryKey: ["admin-workspace", workspaceId],
    queryFn: () => apiClient.getAdminWorkspace(workspaceId as string),
    enabled: Boolean(workspaceId),
  });
}

export function useAdminVerifications(
  filters: {
    organizationId?: string | null;
    workspaceId?: string | null;
    limit?: number;
    offset?: number;
  } = {},
) {
  return useQuery({
    queryKey: ["admin-verifications", filters],
    queryFn: () => apiClient.listAdminVerifications(filters),
  });
}

export function useAdminVerification(verificationId: string | null) {
  return useQuery({
    queryKey: ["admin-verification", verificationId],
    queryFn: () => apiClient.getAdminVerification(verificationId as string),
    enabled: Boolean(verificationId),
  });
}

export function useAdminBillingCredits(
  filters: {
    organizationId?: string | null;
    workspaceId?: string | null;
    limit?: number;
    offset?: number;
  } = {},
) {
  return useQuery({
    queryKey: ["admin-billing-credits", filters],
    queryFn: () => apiClient.getAdminBillingCredits(filters),
  });
}

export function useAdjustAdminBillingCredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminCreditAdjustmentRequest) =>
      apiClient.adjustAdminBillingCredits(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-billing-credits"],
      });
      void queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
    },
  });
}

export function useAdminBillingCatalog() {
  return useQuery({
    queryKey: ["admin-billing-catalog"],
    queryFn: apiClient.listAdminBillingCatalog,
  });
}

export function useUpdateAdminBillingCatalogItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      catalog_item_id,
      payload,
    }: {
      catalog_item_id: string;
      payload: AdminBillingCatalogItemUpdate;
    }) => apiClient.updateAdminBillingCatalogItem(catalog_item_id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-billing-catalog"],
      });
      void queryClient.invalidateQueries({ queryKey: ["billing-catalog"] });
    },
  });
}

export function useAdminSupportWebhookLogs(
  filters: { limit?: number; offset?: number } = {},
) {
  return useQuery({
    queryKey: ["admin-support-webhook-logs", filters],
    queryFn: () => apiClient.listAdminSupportWebhookLogs(filters),
  });
}

export function useAdminSupportErrorLogs() {
  return useQuery({
    queryKey: ["admin-support-error-logs"],
    queryFn: apiClient.listAdminSupportErrorLogs,
  });
}

export function useAdminSupportNotes(
  filters: { verificationId?: string | null; limit?: number } = {},
) {
  return useQuery({
    queryKey: ["admin-support-notes", filters],
    queryFn: () => apiClient.listAdminSupportNotes(filters),
  });
}

export function useCreateAdminSupportNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminSupportNoteRequest) =>
      apiClient.createAdminSupportNote(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-support-notes"] });
    },
  });
}

export function useAdminSalesCustomers() {
  return useQuery({
    queryKey: ["admin-sales-customers"],
    queryFn: apiClient.listAdminSalesCustomers,
  });
}

export function useCreateAdminSalesNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminSalesNoteRequest) =>
      apiClient.createAdminSalesNote(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-sales-customers"],
      });
    },
  });
}

export function useAdminPlatformAdmins() {
  return useQuery({
    queryKey: ["admin-platform-admins"],
    queryFn: apiClient.listAdminPlatformAdmins,
  });
}

export function useInviteAdminPlatformAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PlatformAdminInviteRequest) =>
      apiClient.inviteAdminPlatformAdmin(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-platform-admins"],
      });
    },
  });
}

export function useUpdateAdminPlatformAdmin(platformAdminId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PlatformAdminUpdateRequest) =>
      apiClient.updateAdminPlatformAdmin(platformAdminId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-platform-admins"],
      });
    },
  });
}

export function useAdminAuditLogs(
  filters: { limit?: number; offset?: number } = {},
) {
  return useQuery({
    queryKey: ["admin-audit-logs", filters],
    queryFn: () => apiClient.listAdminAuditLogs(filters),
  });
}

export function useAdminSystemSettings() {
  return useQuery({
    queryKey: ["admin-system-settings"],
    queryFn: apiClient.getAdminSystemSettings,
  });
}

export function useUpdateAdminSystemSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminSystemSettings) =>
      apiClient.updateAdminSystemSettings(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-system-settings"],
      });
    },
  });
}

export function useAdminAiProviders() {
  return useQuery({
    queryKey: ["admin-ai-providers"],
    queryFn: apiClient.listAdminAiProviders,
  });
}

export function useCreateAdminAiProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AiModelProviderCreate) =>
      apiClient.createAdminAiProvider(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-ai-providers"] });
    },
  });
}

export function useUpdateAdminAiProvider(providerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AiModelProviderUpdate) =>
      apiClient.updateAdminAiProvider(providerId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-ai-providers"] });
    },
  });
}

export function useDeleteAdminAiProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (providerId: string) =>
      apiClient.deleteAdminAiProvider(providerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-ai-providers"] });
    },
  });
}

export function useCreateAdminAiProviderKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ provider_id, ...payload }: AiProviderKeyCreateInput) =>
      apiClient.createAdminAiProviderKey(provider_id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-ai-providers"] });
    },
  });
}

export function useDeleteAdminAiProviderKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ provider_id, key_id }: AiProviderKeyDeleteInput) =>
      apiClient.deleteAdminAiProviderKey(provider_id, key_id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-ai-providers"] });
    },
  });
}

export function useTestAdminAiProviderKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ provider_id, key_id }: AiProviderKeyDeleteInput) =>
      apiClient.testAdminAiProviderKey(provider_id, key_id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-ai-providers"] });
    },
  });
}

export function useUpdateAdminAiProviderKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      provider_id,
      key_id,
      ...payload
    }: AiProviderKeyUpdateInput) =>
      apiClient.updateAdminAiProviderKey(provider_id, key_id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-ai-providers"] });
    },
  });
}
