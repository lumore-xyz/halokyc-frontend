"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  apiClient,
  type AdminDecisionResponse,
  type VerificationSessionDetail,
} from "@/lib/api-client";

const VERIFICATION_LIST_KEY = ["my-verifications"] as const;
const VERIFICATION_SUMMARY_KEY = ["my-verification-summary"] as const;

export function myVerificationKey(verificationId: string) {
  return ["my-verification", verificationId] as const;
}

export function useMyVerification(verificationId: string) {
  return useQuery<VerificationSessionDetail>({
    queryKey: myVerificationKey(verificationId),
    queryFn: () => apiClient.getMyVerification(verificationId),
    enabled: Boolean(verificationId),
  });
}

type MutationContext = { previous: VerificationSessionDetail | undefined };

export function useApproveMyVerification(verificationId: string) {
  const queryClient = useQueryClient();
  return useMutation<AdminDecisionResponse, Error, void, MutationContext>({
    mutationFn: () => apiClient.approveMyReview(verificationId),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: myVerificationKey(verificationId),
      });
      const previous = queryClient.getQueryData<VerificationSessionDetail>(
        myVerificationKey(verificationId),
      );
      if (previous) {
        queryClient.setQueryData<VerificationSessionDetail>(
          myVerificationKey(verificationId),
          { ...previous, status: "approved" },
        );
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          myVerificationKey(verificationId),
          context.previous,
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: VERIFICATION_LIST_KEY });
      void queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      void queryClient.invalidateQueries({ queryKey: VERIFICATION_SUMMARY_KEY });
      void queryClient.invalidateQueries({
        queryKey: myVerificationKey(verificationId),
      });
    },
  });
}

export function useRejectMyVerification(verificationId: string) {
  const queryClient = useQueryClient();
  return useMutation<AdminDecisionResponse, Error, string, MutationContext>({
    mutationFn: (reason) => apiClient.rejectMyReview(verificationId, reason),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: myVerificationKey(verificationId),
      });
      const previous = queryClient.getQueryData<VerificationSessionDetail>(
        myVerificationKey(verificationId),
      );
      if (previous) {
        queryClient.setQueryData<VerificationSessionDetail>(
          myVerificationKey(verificationId),
          { ...previous, status: "rejected" },
        );
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          myVerificationKey(verificationId),
          context.previous,
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: VERIFICATION_LIST_KEY });
      void queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      void queryClient.invalidateQueries({ queryKey: VERIFICATION_SUMMARY_KEY });
      void queryClient.invalidateQueries({
        queryKey: myVerificationKey(verificationId),
      });
    },
  });
}
