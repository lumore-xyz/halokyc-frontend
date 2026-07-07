"use client";

import { useMutation } from "@tanstack/react-query";

import {
  apiClient,
  type StartVerificationRequest,
  type StartVerificationResponse,
} from "@/lib/api-client";

type StartVerificationInput = StartVerificationRequest & {
  apiKey: string;
};

export function useStartVerification() {
  return useMutation<
    StartVerificationResponse,
    Error,
    StartVerificationInput
  >({
    mutationFn: ({ apiKey, ...payload }) =>
      apiClient.startVerification(payload, apiKey),
  });
}