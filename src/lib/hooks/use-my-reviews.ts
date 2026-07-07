"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  apiClient,
  type AdminDecisionResponse,
  type AdminReviewDetail,
  type AdminReviewItem,
} from "@/lib/api-client";

const REVIEW_LIST_KEY = ["my-reviews"] as const;
const VERIFICATION_SUMMARY_KEY = ["my-verification-summary"] as const;

function reviewKey(verificationId: string) {
  return ["my-review", verificationId] as const;
}

export function useMyReviews() {
  return useQuery<AdminReviewItem[]>({
    queryKey: REVIEW_LIST_KEY,
    queryFn: apiClient.listMyReviews,
  });
}

export function useMyReview(verificationId: string) {
  return useQuery<AdminReviewDetail>({
    queryKey: reviewKey(verificationId),
    queryFn: () => apiClient.getMyReview(verificationId),
    enabled: Boolean(verificationId),
  });
}

type MutationContext = { previous: AdminReviewDetail | undefined };

export function useApproveMyReview(verificationId: string) {
  const queryClient = useQueryClient();
  return useMutation<AdminDecisionResponse, Error, void, MutationContext>({
    mutationFn: () => apiClient.approveMyReview(verificationId),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: reviewKey(verificationId),
      });
      const previous = queryClient.getQueryData<AdminReviewDetail>(
        reviewKey(verificationId),
      );
      if (previous) {
        queryClient.setQueryData<AdminReviewDetail>(
          reviewKey(verificationId),
          { ...previous, status: "approved" },
        );
      }
      queryClient.setQueryData<AdminReviewItem[]>(
        REVIEW_LIST_KEY,
        (current) =>
          current?.filter((item) => item.verification_id !== verificationId) ??
          current,
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          reviewKey(verificationId),
          context.previous,
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: REVIEW_LIST_KEY });
      void queryClient.invalidateQueries({ queryKey: VERIFICATION_SUMMARY_KEY });
      void queryClient.invalidateQueries({
        queryKey: reviewKey(verificationId),
      });
    },
  });
}

export function useRejectMyReview(verificationId: string) {
  const queryClient = useQueryClient();
  return useMutation<AdminDecisionResponse, Error, string, MutationContext>({
    mutationFn: (reason) => apiClient.rejectMyReview(verificationId, reason),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: reviewKey(verificationId),
      });
      const previous = queryClient.getQueryData<AdminReviewDetail>(
        reviewKey(verificationId),
      );
      if (previous) {
        queryClient.setQueryData<AdminReviewDetail>(
          reviewKey(verificationId),
          { ...previous, status: "rejected" },
        );
      }
      queryClient.setQueryData<AdminReviewItem[]>(
        REVIEW_LIST_KEY,
        (current) =>
          current?.filter((item) => item.verification_id !== verificationId) ??
          current,
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          reviewKey(verificationId),
          context.previous,
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: REVIEW_LIST_KEY });
      void queryClient.invalidateQueries({ queryKey: VERIFICATION_SUMMARY_KEY });
      void queryClient.invalidateQueries({
        queryKey: reviewKey(verificationId),
      });
    },
  });
}
