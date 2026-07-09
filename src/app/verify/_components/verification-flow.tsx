"use client";

import { useQuery } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  apiClient,
  type ApiError,
  type VerificationConfig,
  type VerificationUserAction,
} from "@/lib/api-client";
import { useUploadVerificationFiles } from "@/lib/hooks/use-upload-verification-files";
import { useVerification } from "@/lib/hooks/use-verification";

import { ConsentCard, type ConsentRecord } from "./consent-card";
import { useConsentRecord } from "../_hooks/use-consent-record";
import { useIsMobile } from "../_hooks/use-is-mobile";
import { DesktopHandoffModal } from "./desktop-handoff-modal";
import { VerifyErrorStep } from "./verify-error-step";
import { VerifyProgress } from "./verify-progress";
import { VerifyShell } from "./verify-shell";
import {
  INITIAL_VERIFY_STATE,
  canSubmit,
  getCaptureStepAfterInstruction,
  planSteps,
  progressFor,
  reduceVerify,
  type CaptureStepKey,
  type VerifyService,
  type VerifyState,
} from "./verify-state-machine";
import { VerifyDocumentStep } from "./verify-step-document";
import { VerifyStepDocumentInstruction } from "./verify-step-document-instruction";
import { VerifyStepIntro } from "./verify-step-intro";
import { VerifyProcessingStep } from "./verify-step-processing";
import { VerifyResultStep } from "./verify-step-result";
import { VerifySelfieStep } from "./verify-step-selfie";
import { VerifyStepSelfieInstruction } from "./verify-step-selfie-instruction";
import { VerifySubmittedStep } from "./verify-step-submitted";

type VerificationFlowProps = {
  initialVerificationId?: string;
};

function isVerificationConfig(value: unknown): value is VerificationConfig {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    "step_sequence" in (value as Record<string, unknown>)
  );
}

function errorMessage(error: Error | null): string | null {
  if (!error) return null;
  const status = (error as ApiError).status;
  if (status === 401)
    return "This verification link is no longer available. Ask the requesting service for a new link.";
  if (status === 403)
    return "This API key is disabled. Contact your administrator.";
  if (status === 404)
    return "The verification session was not found.";
  if (status === 413)
    return "The uploaded photo is too large. Use an image under 50 MB.";
  if (status === 409)
    return "This verification link has already been submitted.";
  if (status === 422)
    return "The requesting service did not supply a valid workflow.";
  if (status && status >= 500)
    return "The verification service is unavailable. Try again in a moment.";
  return error.message;
}

export function VerificationFlow({
  initialVerificationId,
}: VerificationFlowProps) {
  const uploadFiles = useUploadVerificationFiles();
  const verificationId = initialVerificationId ?? "";
  const [files, setFiles] = useState<Record<CaptureStepKey, File | null>>({
    selfie: null,
    document_front: null,
    document_back: null,
  });
  const [consentError, setConsentError] = useState<string | null>(null);
  const [consentPending, setConsentPending] = useState(false);

  const configQuery = useQuery<VerificationConfig, ApiError>({
    queryKey: ["verify-config", verificationId],
    queryFn: () => apiClient.getVerificationConfig(verificationId),
    enabled: Boolean(verificationId),
    retry: false,
  });
  const refetchConfig = configQuery.refetch;

  const services: VerifyService[] = useMemo(() => {
    if (isVerificationConfig(configQuery.data)) {
      return [...configQuery.data.services];
    }
    return [];
  }, [configQuery.data]);

  const [state, dispatch] = useReducer(
    (current: VerifyState, action: Parameters<typeof reduceVerify>[1]) =>
      reduceVerify(current, action, services),
    INITIAL_VERIFY_STATE,
  );

  const consent = useConsentRecord(verificationId || null);

  const verification = useVerification({
    verificationId,
    enabled: state.step === "polling",
  });

  const status = verification.data?.status;

  const isMobile = useIsMobile();

  const [handoffDismissed, setHandoffDismissed] = useState(false);

  const configStatusForHandoff = configQuery.data?.status;
  const handoffEligible =
    !isMobile &&
    !handoffDismissed &&
    state.step === "intro" &&
    configStatusForHandoff === "pending_upload";

  const handoffPoll = useVerification({
    verificationId,
    enabled: handoffEligible,
  });

  const handoffStatus = handoffPoll.data?.status;

  useEffect(() => {
    if (!handoffEligible) return;
    if (
      handoffStatus === "approved" ||
      handoffStatus === "rejected" ||
      handoffStatus === "manual_review"
    ) {
      dispatch({ type: "terminal", decision: handoffStatus });
    }
  }, [handoffEligible, handoffStatus]);

  useEffect(() => {
    if (!status) return;
    if (
      status === "approved" ||
      status === "rejected" ||
      status === "manual_review"
    ) {
      dispatch({ type: "terminal", decision: status });
    }
  }, [status]);

  const orderedSteps = useMemo(() => planSteps(services), [services]);

  const onCapture = useCallback((key: CaptureStepKey, file: File | null) => {
    setFiles((current) => ({ ...current, [key]: file }));
    if (file) {
      dispatch({ type: "capture_complete", step: key });
    } else {
      dispatch({ type: "retake", step: key });
    }
  }, []);

  const continueFromInstruction = useCallback(
    (captureStep: CaptureStepKey) => {
      dispatch({ type: "continue_from_instruction", step: captureStep });
    },
    [],
  );

  const advanceFrom = useCallback(
    (current: CaptureStepKey) => {
      const idx = orderedSteps.indexOf(current);
      const next = orderedSteps[idx + 1];
      if (!next) return;
      dispatch({ type: "prepare_capture", step: next });
    },
    [orderedSteps],
  );

  const submit = useCallback(async () => {
    if (!verificationId) return;
    const selfie = files.selfie;
    const documentFront = files.document_front;
    if (!selfie || !documentFront) return;
    dispatch({ type: "submit" });
    try {
      const uploadResult = await uploadFiles.mutateAsync({
        verificationId,
        files: {
          selfie,
          idFront: documentFront,
          idBack: files.document_back ?? undefined,
        },
      });
      if (uploadResult.requires_user_action?.action === "retake_document") {
        setFiles((current) => ({
          ...current,
          document_front: null,
          document_back: null,
        }));
        dispatch({ type: "document_retake" });
        void refetchConfig();
        return;
      }
      dispatch({ type: "submitted" });
    } catch {
      dispatch({ type: "error" });
    }
  }, [files, refetchConfig, uploadFiles, verificationId]);

  if (!verificationId) {
    return (
      <VerifyShell>
        <VerifyProgress value={progressFor("intro", services)} label="Getting started" />
        <VerifyErrorStep
          title="Verification session required"
          description="Open this page from the verification link generated by the requesting service."
          primaryLabel="Reload"
          onPrimary={() => window.location.reload()}
        />
      </VerifyShell>
    );
  }

  if (configQuery.isLoading) {
    return (
      <VerifyShell>
        <VerifyProgress value={5} label="Loading…" />
        <div className="flex items-center justify-center flex-1">
          <Spinner className="size-8" />
        </div>
      </VerifyShell>
    );
  }

  if (configQuery.isError) {
    return (
      <VerifyShell>
        <VerifyProgress value={5} label="Error" />
        <VerifyErrorStep
          title="Could not load verification"
          description={errorMessage(configQuery.error) ?? "Unknown error"}
          primaryLabel="Try again"
          onPrimary={() => configQuery.refetch()}
        />
      </VerifyShell>
    );
  }

  const config = configQuery.data;
  const configStatus = config?.status;
  const pendingUserAction: VerificationUserAction | null =
    state.step === "document_retake"
      ? uploadFiles.data?.requires_user_action ?? config?.requires_user_action ?? null
      : state.step === "intro"
      ? config?.requires_user_action ?? null
      : null;

  if (
    configStatus === "approved" ||
    configStatus === "rejected" ||
    configStatus === "manual_review"
  ) {
    return (
      <VerifyShell>
        <VerifyProgress value={100} label="Complete" />
        <VerifyResultStep
          status={configStatus}
          onContinue={() => {
            window.close();
          }}
        />
      </VerifyShell>
    );
  }

  if (configStatus === "processing" || configStatus === "awaiting_credits") {
    return (
      <VerifyShell>
        <VerifyProgress value={100} label="Submitted" />
        <VerifySubmittedStep
          onContinue={() => {
            window.close();
          }}
        />
      </VerifyShell>
    );
  }

  if (pendingUserAction?.action === "retake_document") {
    return (
      <VerifyShell>
        <VerifyProgress
          value={progressFor("document_retake", services)}
          label="Retake document"
        />
        <VerifyErrorStep
          title="Retake your document photo"
          description={pendingUserAction.reason}
          primaryLabel="Retake document"
          onPrimary={() => dispatch({ type: "start_document_retake" })}
        />
      </VerifyShell>
    );
  }

  if (state.step === "intro") {
    return (
      <VerifyShell>
        <VerifyProgress
          value={progressFor("intro", services)}
          label="Getting started"
        />
        <VerifyStepIntro
          services={services}
          workflowName={config?.workflow_name}
          pending={false}
          onContinue={() => dispatch({ type: "begin" })}
        />
        <DesktopHandoffModal
          open={handoffEligible}
          verificationId={verificationId}
          status={handoffStatus}
          onUseThisDevice={() => setHandoffDismissed(true)}
          onTerminal={(decision) => dispatch({ type: "terminal", decision })}
        />
      </VerifyShell>
    );
  }

  if (state.step === "consent") {
    const wantsBiometric =
      services.includes("selfie") || services.includes("liveness");
    if (!wantsBiometric) {
      dispatch({ type: "consent_skipped" });
      return null;
    }
    if (consent.record) {
      dispatch({ type: "consent_given" });
      return null;
    }
    return (
      <VerifyShell>
        <VerifyProgress
          value={progressFor("consent", services)}
          label="Privacy notice"
        />
        {consentError ? (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Consent could not be saved</AlertTitle>
            <AlertDescription>{consentError}</AlertDescription>
          </Alert>
        ) : null}
        <ConsentCard
          sessionId={verificationId || null}
          pending={consentPending}
          onAccept={(record: ConsentRecord) => {
            if (!verificationId) {
              setConsentError("The verification session is missing. Reload the verification link and try again.");
              return;
            }
            setConsentPending(true);
            setConsentError(null);
            apiClient.captureConsentPublic(verificationId, record)
              .then(() => {
                consent.accept(record);
                dispatch({ type: "consent_given" });
              })
              .catch(() => {
                setConsentError("We could not write the consent audit record. Try again in a moment.");
              })
              .finally(() => setConsentPending(false));
          }}
        />
      </VerifyShell>
    );
  }

  if (state.step === "submitting") {
    return (
      <VerifyShell>
        <VerifyProgress
          value={progressFor("submitting", services)}
          label="Uploading"
        />
        <VerifyProcessingStep
          status={status}
          errorMessage={errorMessage(uploadFiles.error)}
          onRetry={submit}
        />
      </VerifyShell>
    );
  }

  if (state.step === "submitted") {
    return (
      <VerifyShell>
        <VerifyProgress value={100} label="Submitted" />
        <VerifySubmittedStep
          onContinue={() => {
            window.close();
          }}
        />
      </VerifyShell>
    );
  }

  if (state.step === "polling") {
    if (
      status === "approved" ||
      status === "rejected" ||
      status === "manual_review"
    ) {
      return (
        <VerifyShell>
          <VerifyProgress value={100} label="Complete" />
          <VerifyResultStep
            status={status}
            onContinue={() => {
              window.close();
            }}
          />
        </VerifyShell>
      );
    }
    return (
      <VerifyShell>
        <VerifyProgress
          value={progressFor("polling", services)}
          label="Reviewing"
        />
        <VerifyProcessingStep
          status={status}
          errorMessage={errorMessage(verification.error)}
          onRetry={verification.refresh}
        />
      </VerifyShell>
    );
  }

  if (
    state.step === "approved" ||
    state.step === "rejected" ||
    state.step === "manual_review"
  ) {
    return (
      <VerifyShell>
        <VerifyProgress value={100} label="Complete" />
        <VerifyResultStep
          status={state.step}
          onContinue={() => {
            window.close();
          }}
        />
      </VerifyShell>
    );
  }

  if (state.step === "error") {
    return (
      <VerifyShell>
        <VerifyProgress
          value={progressFor("error", services)}
          label="Try again"
        />
        <VerifyErrorStep
          title="Something went wrong"
          description={
            errorMessage(uploadFiles.error) ??
            "Your photos could not be uploaded. Check that each photo is JPEG, PNG, or WEBP and no larger than 50 MB."
          }
          primaryLabel="Try again"
          onPrimary={submit}
          secondaryLabel="Start over"
          onSecondary={() => {
            setFiles({
              selfie: null,
              document_front: null,
              document_back: null,
            });
            dispatch({ type: "restart" });
          }}
        />
      </VerifyShell>
    );
  }

  const isInstructionStep =
    state.step === "selfie_instruction" ||
    state.step === "document_front_instruction" ||
    state.step === "document_back_instruction";

  if (isInstructionStep) {
    const captureStep = getCaptureStepAfterInstruction(state.step);
    if (!captureStep) return null;

    const isSelfie = captureStep === "selfie";
    const label = isSelfie ? "Face check" : captureStep === "document_front" ? "ID front" : "ID back";

    return (
      <VerifyShell>
        <VerifyProgress
          value={progressFor(state.step, services)}
          label={label}
        />
        {isSelfie ? (
          <VerifyStepSelfieInstruction
            onContinue={() => continueFromInstruction(captureStep)}
          />
        ) : (
          <VerifyStepDocumentInstruction
            onContinue={() => continueFromInstruction(captureStep)}
          />
        )}
      </VerifyShell>
    );
  }

  const captureKey: CaptureStepKey =
    state.step === "selfie_prepare" || state.step === "selfie_capture"
      ? "selfie"
      : state.step === "document_front_prepare" ||
        state.step === "document_front_capture"
      ? "document_front"
      : "document_back";

  const currentFile = files[captureKey];
  const allCaptured = canSubmit(
    {
      ...state,
      captures: { ...state.captures, [captureKey]: "captured" },
    },
    services,
  );

  const stepConfig = config?.step_sequence.find((s) => s.step === state.step);
  const cameraOnly = stepConfig?.camera_only ?? (captureKey === "selfie");
  const frameType = stepConfig?.frame_type ?? (captureKey === "selfie" ? "oval" : "rectangle");
  const instructionPill = stepConfig?.description;

  return (
    <VerifyShell immersive>
      {captureKey === "selfie" ? (
        <VerifySelfieStep
          file={currentFile}
          onChange={(file) => onCapture("selfie", file)}
          onBack={() => dispatch({ type: "back" })}
          onContinue={() => {
            if (!currentFile) return;
            advanceFrom("selfie");
          }}
          showBack={true}
          cameraOnly={cameraOnly}
          frameType={frameType}
          instructionPill={instructionPill}
        />
      ) : captureKey === "document_front" ? (
        <VerifyDocumentStep
          side="front"
          file={currentFile}
          onChange={(file) => onCapture("document_front", file)}
          onBack={() => dispatch({ type: "back" })}
          onContinue={() => {
            if (!currentFile) return;
            advanceFrom("document_front");
          }}
          showBackButton={
            services.includes("selfie") || services.includes("liveness")
          }
          frameType={frameType}
          instructionPill={instructionPill}
        />
      ) : (
        <VerifyDocumentStep
          side="back"
          file={currentFile}
          onChange={(file) => onCapture("document_back", file)}
          onBack={() => dispatch({ type: "back" })}
          onContinue={() => {
            if (!allCaptured) return;
            void submit();
          }}
          onSkip={() => void submit()}
          showBackButton
          optional
          frameType={frameType}
          instructionPill={instructionPill}
        />
      )}
      {uploadFiles.error ? (
        <Alert variant="destructive" className="absolute inset-x-4 bottom-4 z-50">
          <AlertTitle>Photos could not be uploaded</AlertTitle>
          <AlertDescription>
            {errorMessage(uploadFiles.error)} Check that each photo is JPEG,
            PNG, or WEBP and no larger than 50 MB.
          </AlertDescription>
        </Alert>
      ) : null}
    </VerifyShell>
  );
}
