import { describe, expect, it } from "vitest";

import {
  INITIAL_VERIFY_STATE,
  canSubmit,
  planSteps,
  progressFor,
  reduceVerify,
  type VerifyServices,
  type VerifyState,
} from "./verify-state-machine";

const DOC_SELFIE: VerifyServices = ["document", "selfie"];
const DOC_ONLY: VerifyServices = ["document"];
const SELFIE_ONLY: VerifyServices = ["liveness"];

function start(services: VerifyServices): VerifyState {
  return reduceVerify(INITIAL_VERIFY_STATE, { type: "begin" }, services);
}

describe("verify state machine", () => {
  it("plans capture steps from workflow services", () => {
    expect(planSteps(DOC_SELFIE)).toEqual([
      "selfie",
      "document_front",
      "document_back",
    ]);
    expect(planSteps(DOC_ONLY)).toEqual(["document_front", "document_back"]);
    expect(planSteps(SELFIE_ONLY)).toEqual(["selfie"]);
    expect(planSteps(["age"])).toEqual([]);
  });

  it("moves intro to the consent step when biometric capture is required", () => {
    const state = start(DOC_SELFIE);
    expect(state.step).toBe("consent");
  });

  it("skips the consent step when the workflow does not request a biometric", () => {
    const state = reduceVerify(
      INITIAL_VERIFY_STATE,
      { type: "consent_skipped" },
      DOC_ONLY,
    );
    expect(state.step).toBe("document_front_instruction");
  });

  it("skips selfie instruction when the workflow does not request it", () => {
    const state = start(DOC_ONLY);
    expect(state.step).toBe("document_front_instruction");
  });

  it("moves instruction to prepare to capture to next instruction through the full sequence", () => {
    let state = start(DOC_SELFIE);
    expect(state.step).toBe("consent");
    state = reduceVerify(state, { type: "consent_given" }, DOC_SELFIE);
    expect(state.step).toBe("selfie_instruction");

    state = reduceVerify(
      state,
      { type: "continue_from_instruction", step: "selfie" },
      DOC_SELFIE,
    );
    expect(state.step).toBe("selfie_prepare");

    state = reduceVerify(
      state,
      { type: "capture_complete", step: "selfie" },
      DOC_SELFIE,
    );
    expect(state.step).toBe("selfie_capture");

    state = reduceVerify(state, { type: "back" }, DOC_SELFIE);
    expect(state.step).toBe("selfie_prepare");

    state = reduceVerify(
      state,
      { type: "prepare_capture", step: "selfie" },
      DOC_SELFIE,
    );
    expect(state.step).toBe("selfie_prepare");

    state = reduceVerify(
      state,
      { type: "capture_complete", step: "selfie" },
      DOC_SELFIE,
    );
    expect(state.step).toBe("selfie_capture");

    state = reduceVerify(
      state,
      { type: "prepare_capture", step: "document_front" },
      DOC_SELFIE,
    );
    expect(state.step).toBe("document_front_instruction");

    state = reduceVerify(
      state,
      { type: "continue_from_instruction", step: "document_front" },
      DOC_SELFIE,
    );
    expect(state.step).toBe("document_front_prepare");

    state = reduceVerify(
      state,
      { type: "capture_complete", step: "document_front" },
      DOC_SELFIE,
    );
    expect(state.step).toBe("document_front_capture");

    state = reduceVerify(
      state,
      { type: "prepare_capture", step: "document_back" },
      DOC_SELFIE,
    );
    expect(state.step).toBe("document_back_instruction");
    expect(canSubmit(state, DOC_SELFIE)).toBe(false);

    state = reduceVerify(
      state,
      { type: "continue_from_instruction", step: "document_back" },
      DOC_SELFIE,
    );
    expect(state.step).toBe("document_back_prepare");

    state = reduceVerify(
      state,
      { type: "capture_complete", step: "document_back" },
      DOC_SELFIE,
    );
    expect(canSubmit(state, DOC_SELFIE)).toBe(true);
  });

  it("ignores prepare_capture for steps not in the plan", () => {
    const state = reduceVerify(
      INITIAL_VERIFY_STATE,
      { type: "prepare_capture", step: "document_back" },
      SELFIE_ONLY,
    );
    expect(state).toBe(INITIAL_VERIFY_STATE);
  });

  it("ignores prepare_capture once a step is already captured", () => {
    let state = start(DOC_SELFIE);
    state = reduceVerify(
      state,
      { type: "continue_from_instruction", step: "selfie" },
      DOC_SELFIE,
    );
    state = reduceVerify(
      state,
      { type: "capture_complete", step: "selfie" },
      DOC_SELFIE,
    );
    const after = reduceVerify(
      state,
      { type: "prepare_capture", step: "selfie" },
      DOC_SELFIE,
    );
    expect(after).toBe(state);
  });

  it("retake resets the capture and returns to prepare", () => {
    let state = start(DOC_SELFIE);
    state = reduceVerify(
      state,
      { type: "continue_from_instruction", step: "selfie" },
      DOC_SELFIE,
    );
    state = reduceVerify(
      state,
      { type: "capture_complete", step: "selfie" },
      DOC_SELFIE,
    );
    state = reduceVerify(state, { type: "retake", step: "selfie" }, DOC_SELFIE);
    expect(state.step).toBe("selfie_prepare");
    expect(state.captures.selfie).toBe("idle");
  });

  it("submit to submitted transitions show the user completion state", () => {
    let state = start(DOC_SELFIE);
    state = reduceVerify(
      state,
      { type: "continue_from_instruction", step: "selfie" },
      DOC_SELFIE,
    );
    state = reduceVerify(
      state,
      { type: "capture_complete", step: "selfie" },
      DOC_SELFIE,
    );
    state = reduceVerify(
      state,
      { type: "continue_from_instruction", step: "document_front" },
      DOC_SELFIE,
    );
    state = reduceVerify(
      state,
      { type: "capture_complete", step: "document_front" },
      DOC_SELFIE,
    );
    state = reduceVerify(
      state,
      { type: "continue_from_instruction", step: "document_back" },
      DOC_SELFIE,
    );
    state = reduceVerify(
      state,
      { type: "capture_complete", step: "document_back" },
      DOC_SELFIE,
    );
    state = reduceVerify(state, { type: "submit" }, DOC_SELFIE);
    expect(state.step).toBe("submitting");
    state = reduceVerify(state, { type: "submitted" }, DOC_SELFIE);
    expect(state.step).toBe("submitted");
  });

  it("poll_start to terminal transitions remain available for status polling", () => {
    let state = reduceVerify(INITIAL_VERIFY_STATE, { type: "submit" }, DOC_SELFIE);
    state = reduceVerify(state, { type: "poll_start" }, DOC_SELFIE);
    expect(state.step).toBe("polling");
    state = reduceVerify(
      state,
      { type: "terminal", decision: "approved" },
      DOC_SELFIE,
    );
    expect(state.step).toBe("approved");
  });

  it("restart returns to the initial state", () => {
    let state = start(DOC_SELFIE);
    state = reduceVerify(
      state,
      { type: "continue_from_instruction", step: "selfie" },
      DOC_SELFIE,
    );
    state = reduceVerify(
      state,
      { type: "capture_complete", step: "selfie" },
      DOC_SELFIE,
    );
    state = reduceVerify(state, { type: "restart" }, DOC_SELFIE);
    expect(state).toBe(INITIAL_VERIFY_STATE);
  });

  it("document retake resets document captures and returns to document instruction", () => {
    let state = start(DOC_SELFIE);
    state = reduceVerify(
      state,
      { type: "continue_from_instruction", step: "selfie" },
      DOC_SELFIE,
    );
    state = reduceVerify(
      state,
      { type: "capture_complete", step: "selfie" },
      DOC_SELFIE,
    );
    state = reduceVerify(
      state,
      { type: "prepare_capture", step: "document_front" },
      DOC_SELFIE,
    );
    state = reduceVerify(
      state,
      { type: "continue_from_instruction", step: "document_front" },
      DOC_SELFIE,
    );
    state = reduceVerify(
      state,
      { type: "capture_complete", step: "document_front" },
      DOC_SELFIE,
    );

    state = reduceVerify(state, { type: "document_retake" }, DOC_SELFIE);
    expect(state.step).toBe("document_retake");
    expect(state.captures.selfie).toBe("captured");
    expect(state.captures.document_front).toBe("idle");

    state = reduceVerify(state, { type: "start_document_retake" }, DOC_SELFIE);
    expect(state.step).toBe("document_front_instruction");
  });

  it("error can occur from any capture step", () => {
    let state = start(DOC_SELFIE);
    state = reduceVerify(
      state,
      { type: "continue_from_instruction", step: "selfie" },
      DOC_SELFIE,
    );
    state = reduceVerify(
      state,
      { type: "capture_complete", step: "selfie" },
      DOC_SELFIE,
    );
    state = reduceVerify(state, { type: "error" }, DOC_SELFIE);
    expect(state.step).toBe("error");
  });

  it("progress reflects the active step with instruction steps", () => {
    expect(progressFor("intro", DOC_SELFIE)).toBe(5);
    expect(progressFor("selfie_instruction", DOC_SELFIE)).toBeGreaterThanOrEqual(20);
    expect(progressFor("selfie_prepare", DOC_SELFIE)).toBeGreaterThanOrEqual(20);
    expect(progressFor("document_front_instruction", DOC_SELFIE)).toBeGreaterThanOrEqual(40);
    expect(progressFor("document_front_prepare", DOC_SELFIE)).toBeGreaterThanOrEqual(40);
    expect(progressFor("document_front_capture", DOC_SELFIE)).toBeGreaterThanOrEqual(40);
    expect(progressFor("document_back_instruction", DOC_SELFIE)).toBeGreaterThanOrEqual(70);
    expect(progressFor("document_back_prepare", DOC_SELFIE)).toBeGreaterThanOrEqual(70);
    expect(progressFor("submitting", DOC_SELFIE)).toBe(90);
    expect(progressFor("submitted", DOC_SELFIE)).toBe(100);
    expect(progressFor("polling", DOC_SELFIE)).toBe(95);
    expect(progressFor("approved", DOC_SELFIE)).toBe(100);
  });

  it("progress for document only workflow", () => {
    expect(progressFor("document_front_instruction", DOC_ONLY)).toBeGreaterThanOrEqual(40);
    expect(progressFor("document_front_capture", DOC_ONLY)).toBeGreaterThanOrEqual(40);
    expect(progressFor("document_back_instruction", DOC_ONLY)).toBeGreaterThanOrEqual(70);
  });
});
