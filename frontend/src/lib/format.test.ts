import { describe, expect, it } from "vitest";

import {
  agentFallbackLabel,
  agentReasonLabel,
  formatConfidence,
  formatDate,
  scoreBand,
  scoreLabel,
  statusLabel,
} from "@/lib/format";

describe("statusLabel", () => {
  it("maps every VerificationStatus to a human-readable label", () => {
    expect(statusLabel("pending_upload")).toBe("Pending upload");
    expect(statusLabel("awaiting_credits")).toBe("Awaiting credits");
    expect(statusLabel("processing")).toBe("Processing");
    expect(statusLabel("approved")).toBe("Approved");
    expect(statusLabel("rejected")).toBe("Rejected");
    expect(statusLabel("manual_review")).toBe("Needs review");
  });
});

describe("formatDate", () => {
  it("formats an ISO string", () => {
    const out = formatDate("2026-06-23T10:00:00Z");
    expect(out).not.toBe("—");
    expect(out).toMatch(/2026|Jun/);
  });

  it("formats a Date object", () => {
    const out = formatDate(new Date("2026-01-02T03:04:00Z"));
    expect(out).not.toBe("—");
  });

  it("returns an em dash for invalid input", () => {
    expect(formatDate("not-a-date")).toBe("—");
    expect(formatDate(new Date("not-a-date"))).toBe("—");
  });
});

describe("scoreBand", () => {
  it("classifies below 30 as low", () => {
    expect(scoreBand(0)).toBe("low");
    expect(scoreBand(29.9)).toBe("low");
  });

  it("classifies 30 to 59 as medium", () => {
    expect(scoreBand(30)).toBe("medium");
    expect(scoreBand(59.9)).toBe("medium");
  });

  it("classifies 60 and above as high", () => {
    expect(scoreBand(60)).toBe("high");
    expect(scoreBand(100)).toBe("high");
  });

  it("classifies null/undefined as unknown", () => {
    expect(scoreBand(null)).toBe("unknown");
    expect(scoreBand(undefined)).toBe("unknown");
  });
});

describe("scoreLabel", () => {
  it("maps bands to labels", () => {
    expect(scoreLabel(10)).toBe("Low risk");
    expect(scoreLabel(45)).toBe("Medium risk");
    expect(scoreLabel(80)).toBe("High risk");
    expect(scoreLabel(null)).toBe("No score");
  });
});

describe("agentReasonLabel", () => {
  it("maps known reason codes and humanizes unknown ones", () => {
    expect(agentReasonLabel("ambiguous_ocr")).toBe("Ambiguous OCR");
    expect(agentReasonLabel("face_liveness_conflict")).toBe(
      "Face/liveness conflict",
    );
    expect(agentReasonLabel("future_signal_code")).toBe("Future Signal Code");
  });
});

describe("agentFallbackLabel", () => {
  it("maps fallback reasons to reviewer-facing labels", () => {
    expect(agentFallbackLabel("provider_outage")).toBe("Provider unavailable");
    expect(agentFallbackLabel("budget_cap")).toBe("Budget cap reached");
    expect(agentFallbackLabel(null)).toBe("No fallback");
    expect(agentFallbackLabel("future_fallback")).toBe("Future Fallback");
  });
});

describe("formatConfidence", () => {
  it("formats model confidence as a percentage", () => {
    expect(formatConfidence(0.874)).toBe("87%");
    expect(formatConfidence(1)).toBe("100%");
    expect(formatConfidence(null)).toBe("-");
    expect(formatConfidence(Number.NaN)).toBe("-");
  });
});
