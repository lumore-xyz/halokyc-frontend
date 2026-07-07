import { VerifyCameraCanvas } from "./verify-camera-canvas";

type Side = "front" | "back";

type VerifyDocumentStepProps = {
  file: File | null;
  side: Side;
  onChange: (file: File | null) => void;
  onBack: () => void;
  onContinue: () => void;
  onSkip?: () => void;
  showBackButton: boolean;
  optional?: boolean;
  cameraOnly?: boolean;
  frameType?: "oval" | "rectangle";
  instructionPill?: string;
};

export function VerifyDocumentStep({
  file,
  side,
  onChange,
  onBack,
  onContinue,
  onSkip,
  showBackButton,
  optional = false,
  cameraOnly = false,
  frameType = "rectangle",
  instructionPill,
}: VerifyDocumentStepProps) {
  const title =
    side === "front"
      ? file
        ? "Front side captured"
        : "Front of your document"
      : file
      ? "Back side captured"
      : "Back of your document";
  const ctaLabel = side === "back" && !file && optional ? "Skip" : "Continue";

  return (
    <VerifyCameraCanvas
      facing="environment"
      file={file}
      frameType={frameType}
      instructionPill={instructionPill}
      cameraOnly={cameraOnly}
      title={title}
      captureLabel={`Take picture of ${side} side`}
      continueLabel={ctaLabel}
      skipLabel={side === "back" && optional && !file ? "Skip back side" : undefined}
      showBack={showBackButton}
      onBack={onBack}
      onChange={onChange}
      onContinue={onContinue}
      onSkip={onSkip}
    />
  );
}
