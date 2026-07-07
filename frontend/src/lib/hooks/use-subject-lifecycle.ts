"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  apiClient,
  type SubjectBanRequest,
  type SubjectBanStatus,
  type SubjectBanUpdateRequest,
  type SubjectDeleteRequest,
  type SubjectLifecycleResponse,
} from "@/lib/api-client";
import { useClientSession } from "@/lib/hooks/use-client-session";

export function subjectBanKey(workspaceId: string, externalUserId: string) {
  return ["workspace-subject-ban", workspaceId, externalUserId] as const;
}

export function subjectSessionsKey(workspaceId: string, externalUserId: string) {
  return ["workspace-subject-sessions", workspaceId, externalUserId] as const;
}

export function subjectAuditKey(workspaceId: string, externalUserId: string) {
  return ["workspace-subject-audit", workspaceId, externalUserId] as const;
}

export function useSubjectBanStatus(
  workspaceId: string,
  externalUserId: string,
) {
  const session = useClientSession();
  return useQuery<SubjectBanStatus | null>({
    queryKey: subjectBanKey(workspaceId, externalUserId),
    queryFn: () => apiClient.getWorkspaceSubjectBan(workspaceId, externalUserId),
    enabled: Boolean(session.data?.authenticated && workspaceId && externalUserId),
  });
}

function useSubjectLifecycleInvalidation(
  workspaceId: string,
  externalUserId: string,
) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({
      queryKey: subjectBanKey(workspaceId, externalUserId),
    });
    void queryClient.invalidateQueries({
      queryKey: subjectSessionsKey(workspaceId, externalUserId),
    });
    void queryClient.invalidateQueries({
      queryKey: subjectAuditKey(workspaceId, externalUserId),
    });
    void queryClient.invalidateQueries({
      queryKey: ["workspace-verifications", workspaceId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["workspace-verification-summary", workspaceId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["workspace-audit-logs", workspaceId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["workspace-analytics", workspaceId],
    });
  };
}

export function useResetSubjectVerification(
  workspaceId: string,
  externalUserId: string,
) {
  const invalidate = useSubjectLifecycleInvalidation(workspaceId, externalUserId);
  return useMutation<SubjectLifecycleResponse, Error, SubjectDeleteRequest>({
    mutationFn: (payload) =>
      apiClient.resetWorkspaceSubjectVerification(
        workspaceId,
        externalUserId,
        payload,
      ),
    onSuccess: invalidate,
  });
}

export function useDeleteSubject(
  workspaceId: string,
  externalUserId: string,
) {
  const invalidate = useSubjectLifecycleInvalidation(workspaceId, externalUserId);
  return useMutation<SubjectLifecycleResponse, Error, SubjectDeleteRequest>({
    mutationFn: (payload) =>
      apiClient.deleteWorkspaceSubject(workspaceId, externalUserId, payload),
    onSuccess: invalidate,
  });
}

export function useUpsertSubjectBan(
  workspaceId: string,
  externalUserId: string,
) {
  const invalidate = useSubjectLifecycleInvalidation(workspaceId, externalUserId);
  return useMutation<SubjectLifecycleResponse, Error, SubjectBanRequest>({
    mutationFn: (payload) =>
      apiClient.upsertWorkspaceSubjectBan(workspaceId, externalUserId, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateSubjectBan(
  workspaceId: string,
  externalUserId: string,
) {
  const invalidate = useSubjectLifecycleInvalidation(workspaceId, externalUserId);
  return useMutation<SubjectLifecycleResponse, Error, SubjectBanUpdateRequest>({
    mutationFn: (payload) =>
      apiClient.updateWorkspaceSubjectBan(workspaceId, externalUserId, payload),
    onSuccess: invalidate,
  });
}
