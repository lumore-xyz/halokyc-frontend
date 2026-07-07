"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient, type AdminReviewDetail, type AdminReviewItem } from "@/lib/api-client";

export function useAdminReviews() {
  return useQuery<AdminReviewItem[]>({
    queryKey: ["admin-reviews"],
    queryFn: apiClient.listAdminReviews,
  });
}

export function useAdminReview(verificationId: string) {
  return useQuery<AdminReviewDetail>({
    queryKey: ["admin-review", verificationId],
    queryFn: () => apiClient.getAdminReview(verificationId),
    enabled: Boolean(verificationId),
  });
}

export function useApproveAdminReview(verificationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.approveAdminReview(verificationId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["admin-review", verificationId] });
      const previous = queryClient.getQueryData<AdminReviewDetail>(["admin-review", verificationId]);
      if (previous) {
        queryClient.setQueryData<AdminReviewDetail>(["admin-review", verificationId], {
          ...previous,
          status: "approved",
        });
      }
      queryClient.setQueryData<AdminReviewItem[]>(["admin-reviews"], (current) =>
        current?.filter((item) => item.verification_id !== verificationId) ?? current,
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["admin-review", verificationId], context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-review", verificationId] });
    },
  });
}

export function useRejectAdminReview(verificationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => apiClient.rejectAdminReview(verificationId, reason),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["admin-review", verificationId] });
      const previous = queryClient.getQueryData<AdminReviewDetail>(["admin-review", verificationId]);
      if (previous) {
        queryClient.setQueryData<AdminReviewDetail>(["admin-review", verificationId], {
          ...previous,
          status: "rejected",
        });
      }
      queryClient.setQueryData<AdminReviewItem[]>(["admin-reviews"], (current) =>
        current?.filter((item) => item.verification_id !== verificationId) ?? current,
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["admin-review", verificationId], context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-review", verificationId] });
    },
  });
}

