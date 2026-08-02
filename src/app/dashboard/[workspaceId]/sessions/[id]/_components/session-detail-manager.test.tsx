import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { VerificationSessionDetail } from "@/lib/api-client";

import { SessionDetailContent } from "./session-detail-manager";

const SESSION: VerificationSessionDetail = {
  verification_id: "verification-1",
  external_user_id: "subject-1",
  metadata: {},
  status: "manual_review",
  checks: {
    ocr: { status: "pass", score: 0.98, result: {} },
  },
  risk_score: 35,
  decision_reason: "Reviewer decision required",
  created_at: "2026-08-01T10:00:00Z",
  updated_at: "2026-08-01T10:05:00Z",
  files: [],
  audit_logs: [],
  duplicate_sessions: [],
  device_context: null,
};

describe("SessionDetailContent", () => {
  it("renders the complete detail surface and a route-specific sidebar action", () => {
    render(
      <SessionDetailContent
        workspaceId="workspace-1"
        verificationId="verification-1"
        data={SESSION}
        canViewEvidence
        canViewSubject
        canUpload={false}
        canViewRawData
        onRefresh={() => undefined}
        sidebarExtra={<div>Review decision controls</div>}
      />,
    );

    for (const label of [
      "Device & network",
      "Risk assessment",
      "Check results",
      "Captured evidence",
      "Session audit log",
      "Case summary",
      "Technical payload",
      "Review decision controls",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("offers reprocessing for terminal sessions", () => {
    const onReprocess = vi.fn();
    render(
      <SessionDetailContent
        workspaceId="workspace-1"
        verificationId="verification-1"
        data={SESSION}
        canViewEvidence
        canViewSubject
        canUpload={false}
        canViewRawData
        canReprocess
        onRefresh={() => undefined}
        onReprocess={onReprocess}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reprocess" }));

    expect(onReprocess).toHaveBeenCalledOnce();
  });
});
