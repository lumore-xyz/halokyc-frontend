import { AlertTriangleIcon } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

type TimeoutRecoveryBannerProps = {
  timeoutRecovery?: boolean;
  timedOutServices?: string[];
};

export function TimeoutRecoveryBanner({
  timeoutRecovery,
  timedOutServices,
}: TimeoutRecoveryBannerProps) {
  if (!timeoutRecovery) return null;

  const services = timedOutServices?.filter(Boolean) ?? [];

  return (
    <Alert>
      <AlertTriangleIcon className="size-4" aria-hidden />
      <AlertTitle>Some AI services timed out</AlertTitle>
      <AlertDescription>
        Decision made by agent using available evidence.
        {services.length > 0 ? (
          <span className="mt-1 block">
            Timed-out services:{" "}
            <span className="font-mono">
              {services.map(formatService).join(", ")}
            </span>
          </span>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}

function formatService(service: string): string {
  return service.replaceAll("_", " ");
}
