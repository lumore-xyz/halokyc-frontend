import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { apiClient, type SubjectLifecycleResponse } from "@/lib/api-client";
import {
  subjectBanKey,
  subjectSessionsKey,
  useResetSubjectVerification,
} from "@/lib/hooks/use-subject-lifecycle";

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useSubjectLifecycle", () => {
  it("resets a subject and invalidates lifecycle caches", async () => {
    const workspaceId = "11111111-1111-1111-1111-111111111111";
    const externalUserId = "user_123";
    const client = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const response: SubjectLifecycleResponse = {
      external_user_id: externalUserId,
      organization_id: "22222222-2222-2222-2222-222222222222",
      workspace_id: workspaceId,
      action: "verification_reset",
      deleted_verification_count: 1,
      deleted_face_embedding_count: 1,
      deleted_file_count: 2,
      retained_face_embedding_count: 0,
      ban: null,
      audit_log_id: "33333333-3333-3333-3333-333333333333",
    };
    const reset = vi
      .spyOn(apiClient, "resetWorkspaceSubjectVerification")
      .mockResolvedValue(response);

    const { result } = renderHook(
      () => useResetSubjectVerification(workspaceId, externalUserId),
      { wrapper: createWrapper(client) },
    );

    await act(async () => {
      await result.current.mutateAsync({ reason: "profile changed" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reset).toHaveBeenCalledWith(workspaceId, externalUserId, {
      reason: "profile changed",
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: subjectBanKey(workspaceId, externalUserId),
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: subjectSessionsKey(workspaceId, externalUserId),
    });
  });
});
