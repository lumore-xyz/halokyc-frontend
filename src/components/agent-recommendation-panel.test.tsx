import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AgentRecommendationPanel } from "@/components/agent-recommendation-panel";
import type { AgenticReviewCheckResult } from "@/lib/api-client";

const agenticCheck: AgenticReviewCheckResult = {
  status: "manual_review",
  result: {
    verdict: {
      recommended_status: "manual_review",
      confidence: 0.82,
      reason_codes: ["ambiguous_ocr", "budget_fallback"],
      human_summary:
        "The document signals are mixed, so a reviewer should compare the OCR and face results.",
      evidence_references: ["ocr:confidence", "face:similarity"],
      requires_manual_review: true,
    },
    policy_gate: {
      should_call_model: false,
      skip_reason: "budget_cap",
      reason_codes: ["budget_fallback"],
      terminal_overrides: [],
    },
    provider: {
      provider_name: "google",
      model_name: "gemma-test",
      latency_ms: 420,
      prompt_tokens: 300,
      completion_tokens: 90,
      total_tokens: 390,
      estimated_cost_usd: 0.0123,
      fallback_reason: "budget_cap",
      model_called: false,
      output_validation_status: "valid",
    },
    thread_id: "verification:test",
    fallback_reason: "budget_cap",
    model_called: false,
    output_validation_status: "valid",
    evaluation: {
      deterministic_status: "manual_review",
      agentic_recommended_status: "manual_review",
      agreed_with_deterministic: true,
      would_deflect_manual_review: false,
      would_false_approve_against_deterministic: false,
      would_false_reject_against_deterministic: false,
    },
    reviewer_feedback: null,
  },
};

describe("AgentRecommendationPanel", () => {
  it("renders the structured verdict without provider metadata by default", () => {
    render(
      <AgentRecommendationPanel
        check={agenticCheck}
        deterministicStatus="manual_review"
      />,
    );

    expect(screen.getByText("Agent recommendation")).toBeInTheDocument();
    expect(screen.getAllByText("Needs review").length).toBeGreaterThan(0);
    expect(screen.getByText("82%")).toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByText("Ambiguous OCR")).toBeInTheDocument();
    expect(screen.getByText("Budget fallback")).toBeInTheDocument();
    expect(screen.getByText("Budget cap reached")).toBeInTheDocument();
    expect(screen.getByText("ocr:confidence")).toBeInTheDocument();
    expect(screen.queryByText("Provider metadata")).not.toBeInTheDocument();
  });

  it("shows provider metadata only for privileged reviewers", () => {
    render(
      <AgentRecommendationPanel
        check={agenticCheck}
        deterministicStatus="manual_review"
        canViewProviderMetadata
      />,
    );

    expect(screen.getByText("Provider metadata")).toBeInTheDocument();
    expect(screen.getByText("google")).toBeInTheDocument();
    expect(screen.getByText("gemma-test")).toBeInTheDocument();
    expect(screen.getByText("420 ms")).toBeInTheDocument();
  });

  it("renders a deterministic-only empty state when no agent check exists", () => {
    render(<AgentRecommendationPanel check={undefined} />);

    expect(screen.getByText("No agent recommendation")).toBeInTheDocument();
  });
});
