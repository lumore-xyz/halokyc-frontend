"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

export function useApproveAdminReview(verificationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.approveAdminReview(verificationId),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-verification", verificationId],
      });
      void queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
    },
  });
}

export function useRejectAdminReview(verificationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => apiClient.rejectAdminReview(verificationId, reason),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-verification", verificationId],
      });
      void queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
    },
  });
}
