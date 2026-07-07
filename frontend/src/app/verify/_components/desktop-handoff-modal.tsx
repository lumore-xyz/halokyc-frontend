"use client";

import { MonitorIcon, SmartphoneIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import type { VerificationStatus } from "@/lib/api-client";

import { buildVerifyUrl } from "../_lib/build-verify-url";

const TERMINAL_STATUSES = new Set<VerificationStatus>([
  "approved",
  "rejected",
  "manual_review",
  "processing",
]);

type DesktopHandoffModalProps = {
  open: boolean;
  verificationId: string;
  status: VerificationStatus | undefined;
  onUseThisDevice: () => void;
  onTerminal: (decision: "approved" | "rejected" | "manual_review") => void;
};

/**
 * Desktop-to-mobile handoff modal. Renders a QR code that points at the
 * same `/verify` URL on the current domain, then polls the verification
 * status in the background through the parent. When the mobile journey
 * lands on a terminal status, `onTerminal` fires and the parent swaps to
 * the result screen.
 */
export function DesktopHandoffModal({
  open,
  verificationId,
  status,
  onUseThisDevice,
  onTerminal,
}: DesktopHandoffModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showQr, setShowQr] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !showQr || !canvasRef.current || !verificationId) return;
    const url = buildVerifyUrl(window.location, verificationId);
    QRCode.toCanvas(
      canvasRef.current,
      url,
      { width: 220, margin: 1, errorCorrectionLevel: "M" },
      (error) => {
        if (error) {
          setQrError("We could not render the QR code. Reload the page.");
        } else {
          setQrError(null);
        }
      },
    );
  }, [open, showQr, verificationId]);

  const terminalStatus =
    status && TERMINAL_STATUSES.has(status) ? status : undefined;

  useEffect(() => {
    if (!open || !terminalStatus) return;
    if (
      terminalStatus === "approved" ||
      terminalStatus === "rejected" ||
      terminalStatus === "manual_review"
    ) {
      onTerminal(terminalStatus);
    }
  }, [open, terminalStatus, onTerminal]);

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onUseThisDevice(); }}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Continue on this device or your phone?</DialogTitle>
          <DialogDescription>
            We recommend completing the identity check on a phone camera. Pick
            whichever is easier for you.
          </DialogDescription>
        </DialogHeader>

        {!showQr ? (
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={() => setShowQr(true)}
            >
              <SmartphoneIcon data-icon="inline-start" />
              Open on mobile
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="w-full"
              onClick={onUseThisDevice}
            >
              <MonitorIcon data-icon="inline-start" />
              Use this device
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              role="img"
              aria-label="QR code linking to the mobile verification page"
              className="rounded-lg border bg-white p-3"
            >
              <canvas ref={canvasRef} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">
                Scan with your phone camera
              </p>
              <p className="text-muted-foreground text-xs">
                Open the link and complete the verification there. This page
                will update automatically.
              </p>
            </div>
            {qrError ? (
              <p className="text-destructive text-sm">{qrError}</p>
            ) : (
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Spinner className="size-3" />
                Waiting for your phone…
              </div>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={onUseThisDevice}
            >
              Cancel and use this device instead
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
