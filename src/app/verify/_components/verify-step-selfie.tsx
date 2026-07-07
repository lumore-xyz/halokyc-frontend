import { VerifyCameraCanvas } from "./verify-camera-canvas";

type VerifySelfieStepProps = {
  file: File | null;
  onChange: (file: File | null) => void;
  onBack: () => void;
  onContinue: () => void;
  showBack: boolean;
  cameraOnly?: boolean;
  frameType?: "oval" | "rectangle";
  instructionPill?: string;
};

export function VerifySelfieStep({
  file,
  onChange,
  onBack,
  onContinue,
  showBack,
  cameraOnly = true,
  frameType = "oval",
  instructionPill,
}: VerifySelfieStepProps) {
  return (
    <VerifyCameraCanvas
      facing="user"
      file={file}
      frameType={frameType}
      instructionPill={instructionPill}
      cameraOnly={cameraOnly}
      title={file ? "Selfie captured" : "Selfie capture"}
      captureLabel="Take selfie"
      continueLabel="Continue"
      showBack={showBack}
      onBack={onBack}
      onChange={onChange}
      onContinue={onContinue}
    />
  );
}
