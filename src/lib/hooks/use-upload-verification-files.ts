"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  apiClient,
  type UploadVerificationFilesInput,
  type UploadVerificationResponse,
} from "@/lib/api-client";

type UploadVerificationInput = {
  verificationId: string;
  files: UploadVerificationFilesInput;
};

export function useUploadVerificationFiles() {
  const queryClient = useQueryClient();

  return useMutation<
    UploadVerificationResponse,
    Error,
    UploadVerificationInput
  >({
    mutationFn: ({ verificationId, files }) =>
      apiClient.uploadVerificationFiles(verificationId, files),
    onSuccess: (_data, { verificationId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["verification", verificationId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["workspace-verification", verificationId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["workspace-verifications"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["workspace-verification-summary"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["workspace-analytics"],
      });
    },
  });
}
