export type VerifyService = "selfie" | "liveness" | "document" | "age";

export type VerifyStep =
  | "intro"
  | "consent"
  | "selfie_instruction"
  | "selfie_prepare"
  | "selfie_capture"
  | "document_front_instruction"
  | "document_front_prepare"
  | "document_front_capture"
  | "document_back_instruction"
  | "document_back_prepare"
  | "document_back_capture"
  | "submitting"
  | "document_retake"
  | "submitted"
  | "polling"
  | "approved"
  | "rejected"
  | "manual_review"
  | "error";

export type CaptureStepKey = "selfie" | "document_front" | "document_back";

export type CaptureState = "idle" | "captured";

export type VerifyState = {
  step: VerifyStep;
  captures: Record<CaptureStepKey, CaptureState>;
};

export const INITIAL_VERIFY_STATE: VerifyState = {
  step: "intro",
  captures: { selfie: "idle", document_front: "idle", document_back: "idle" },
};

export type VerifyTransition =
  | { type: "begin" }
  | { type: "consent_given" }
  | { type: "consent_skipped" }
  | { type: "continue_from_instruction"; step: CaptureStepKey }
  | { type: "prepare_capture"; step: CaptureStepKey }
  | { type: "capture_complete"; step: CaptureStepKey }
  | { type: "retake"; step: CaptureStepKey }
  | { type: "back" }
  | { type: "submit" }
  | { type: "document_retake" }
  | { type: "start_document_retake" }
  | { type: "submitted" }
  | { type: "poll_start" }
  | { type: "terminal"; decision: "approved" | "rejected" | "manual_review" }
  | { type: "error" }
  | { type: "restart" };

export type VerifyServices = ReadonlyArray<VerifyService>;

export function needsSelfie(services: VerifyServices): boolean {
  return services.includes("selfie") || services.includes("liveness");
}

export function needsDocument(services: VerifyServices): boolean {
  return services.includes("document");
}

function captureOf(step: VerifyStep): CaptureStepKey | null {
  switch (step) {
    case "selfie_capture":
      return "selfie";
    case "document_front_capture":
      return "document_front";
    case "document_back_capture":
      return "document_back";
    default:
      return null;
  }
}

function capturePrepareOf(step: VerifyStep): CaptureStepKey | null {
  switch (step) {
    case "selfie_prepare":
    case "selfie_capture":
      return "selfie";
    case "document_front_prepare":
    case "document_front_capture":
      return "document_front";
    case "document_back_prepare":
    case "document_back_capture":
      return "document_back";
    default:
      return null;
  }
}

function instructionOf(step: VerifyStep): CaptureStepKey | null {
  switch (step) {
    case "selfie_instruction":
      return "selfie";
    case "document_front_instruction":
      return "document_front";
    case "document_back_instruction":
      return "document_back";
    default:
      return null;
  }
}

export function planSteps(services: VerifyServices): CaptureStepKey[] {
  const steps: CaptureStepKey[] = [];
  if (needsSelfie(services)) steps.push("selfie");
  if (needsDocument(services)) {
    steps.push("document_front");
    steps.push("document_back");
  }
  return steps;
}

export function reduceVerify(
  state: VerifyState,
  transition: VerifyTransition,
  services: VerifyServices,
): VerifyState {
  switch (transition.type) {
    case "begin": {
      const next = nextStepAfterIntro(services);
      return { ...state, step: next };
    }

    case "consent_given":
    case "consent_skipped": {
      if (needsSelfie(services)) return { ...state, step: "selfie_instruction" };
      if (needsDocument(services)) return { ...state, step: "document_front_instruction" };
      return { ...state, step: "submitting" };
    }

    case "continue_from_instruction": {
      const order = planSteps(services);
      if (!order.includes(transition.step)) return state;
      if (state.captures[transition.step] === "captured") return state;
      return { ...state, step: `${transition.step}_prepare` as VerifyStep };
    }

    case "prepare_capture": {
      const order = planSteps(services);
      if (!order.includes(transition.step)) return state;
      if (state.captures[transition.step] === "captured") return state;
      // If this is a new step (not yet seen), go to instruction first
      // If it's a retake (was in prepare or capture), go to prepare
      const isNewStep = state.captures[transition.step] === "idle";
      const targetStep = isNewStep
        ? `${transition.step}_instruction`
        : `${transition.step}_prepare`;
      return { ...state, step: targetStep as VerifyStep };
    }

    case "capture_complete": {
      const captures = { ...state.captures, [transition.step]: "captured" as const };
      return { ...state, captures, step: `${transition.step}_capture` as VerifyStep };
    }

    case "retake": {
      const captures = { ...state.captures, [transition.step]: "idle" as const };
      return { ...state, captures, step: `${transition.step}_prepare` as VerifyStep };
    }

    case "back": {
      const prepareKey = capturePrepareOf(state.step);
      const instructionKey = instructionOf(state.step);
      if (state.step === "consent") return { ...state, step: "intro" };
      if (prepareKey && state.step === `${prepareKey}_prepare`) {
        if (prepareKey === "selfie") return { ...state, step: "intro" };
        const order = planSteps(services);
        const idx = order.indexOf(prepareKey);
        if (idx <= 0) return { ...state, step: "intro" };
        const previous = order[idx - 1]!;
        return { ...state, step: `${previous}_capture` as VerifyStep };
      }
      if (instructionKey) {
        if (instructionKey === "selfie") return { ...state, step: "intro" };
        const order = planSteps(services);
        const idx = order.indexOf(instructionKey);
        if (idx <= 0) return { ...state, step: "intro" };
        const previous = order[idx - 1]!;
        return { ...state, step: `${previous}_capture` as VerifyStep };
      }
      if (state.step === "selfie_capture") return { ...state, step: "selfie_prepare" };
      if (state.step === "document_front_capture") {
        return { ...state, step: "document_front_prepare" };
      }
      if (state.step === "document_back_capture") {
        return { ...state, step: "document_back_prepare" };
      }
      return state;
    }

    case "submit":
      return { ...state, step: "submitting" };

    case "document_retake":
      return {
        ...state,
        step: "document_retake",
        captures: {
          ...state.captures,
          document_front: "idle",
          document_back: "idle",
        },
      };

    case "start_document_retake":
      return {
        ...state,
        step: "document_front_instruction",
        captures: {
          ...state.captures,
          document_front: "idle",
          document_back: "idle",
        },
      };

    case "submitted":
      return { ...state, step: "submitted" };

    case "poll_start":
      return { ...state, step: "polling" };

    case "terminal":
      return { ...state, step: transition.decision };

    case "error":
      return { ...state, step: "error" };

    case "restart":
      return INITIAL_VERIFY_STATE;
  }
}

function nextStepAfterIntro(services: VerifyServices): VerifyStep {
  if (needsConsent(services)) return "consent";
  if (needsSelfie(services)) return "selfie_instruction";
  if (needsDocument(services)) return "document_front_instruction";
  return "submitting";
}

function needsConsent(services: VerifyServices): boolean {
  return services.includes("selfie") || services.includes("liveness");
}

export function progressFor(step: VerifyStep, services: VerifyServices): number {
  const order = planSteps(services);
  const totalSteps = order.length * 2; // Each capture has an instruction step
  const captureStep = captureOf(step);

  switch (step) {
    case "intro":
      return Math.round((5 / 100) * 100);
    case "consent":
      return Math.round((10 / 100) * 100);
    case "selfie_instruction":
    case "selfie_prepare":
    case "selfie_capture":
      return Math.round(((1 + 2) / totalSteps) * 90) + 5;
    case "document_front_instruction":
    case "document_front_prepare":
    case "document_front_capture":
      if (order.includes("document_back")) {
        return Math.round(((3 + 4) / totalSteps) * 90) + 5;
      }
      return Math.round(((3 + 4) / totalSteps) * 90) + 5;
    case "document_back_instruction":
    case "document_back_prepare":
    case "document_back_capture":
      return Math.round(((5 + 6) / totalSteps) * 90) + 5;
    case "submitting":
      return 90;
    case "document_retake":
      return 65;
    case "submitted":
      return 100;
    case "polling":
      return 95;
    case "approved":
    case "rejected":
    case "manual_review":
      return 100;
    case "error":
      return captureStep
        ? order.indexOf(captureStep) <= 0
          ? 25
          : order.indexOf(captureStep) === order.length - 1
          ? 75
          : 50
        : 25;
  }
}

export function canSubmit(
  state: VerifyState,
  services: VerifyServices,
): boolean {
  const order = planSteps(services);
  return order.every((step) => state.captures[step] === "captured");
}

export function getInstructionStepForCapture(
  captureStep: CaptureStepKey,
): VerifyStep {
  switch (captureStep) {
    case "selfie":
      return "selfie_instruction";
    case "document_front":
      return "document_front_instruction";
    case "document_back":
      return "document_back_instruction";
  }
}

export function getCaptureStepAfterInstruction(
  instructionStep: VerifyStep,
): CaptureStepKey | null {
  switch (instructionStep) {
    case "selfie_instruction":
      return "selfie";
    case "document_front_instruction":
      return "document_front";
    case "document_back_instruction":
      return "document_back";
    default:
      return null;
  }
}
