import type { VerificationDeviceContext } from "@/lib/api-client";
import {
  ExternalLinkIcon,
  Globe2Icon,
  MapPinIcon,
  MonitorSmartphoneIcon,
} from "lucide-react";

type Props = {
  context: VerificationDeviceContext | null | undefined;
};

export function DeviceNetworkCard({ context }: Props) {
  const hasCoordinates =
    typeof context?.latitude === "number" &&
    typeof context.longitude === "number";
  const place = [context?.ip_city, context?.ip_region, context?.ip_country]
    .filter(Boolean)
    .join(", ");

  return (
    <section
      aria-labelledby="device-network-title"
      className="border-border bg-card overflow-hidden rounded-2xl border"
    >
      <header className="border-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
            <MonitorSmartphoneIcon className="size-4" aria-hidden />
          </span>
          <div>
            <h2 id="device-network-title" className="font-semibold">
              Device &amp; network
            </h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Context captured when the subject accepted the privacy notice.
            </p>
          </div>
        </div>
        {place ? (
          <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <MapPinIcon className="text-primary size-4" aria-hidden />
            {place}
          </span>
        ) : null}
      </header>

      <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)]">
        <dl className="grid content-start gap-x-8 gap-y-5 p-5 sm:grid-cols-2">
          <Detail label="IP address" value={context?.ip_address} />
          <Detail label="Device type" value={context?.device_type} />
          <Detail label="Platform" value={context?.platform} />
          <Detail label="Browser" value={context?.browser} />
          <Detail label="Timezone" value={context?.timezone} />
          <Detail label="Language" value={context?.language} />
          <Detail
            label="Screen"
            value={
              context?.screen_width && context.screen_height
                ? `${context.screen_width} x ${context.screen_height}`
                : null
            }
          />
          <Detail
            label="Touch input"
            value={
              typeof context?.touch_points === "number"
                ? `${context.touch_points} point${context.touch_points === 1 ? "" : "s"}`
                : null
            }
          />
          <Detail
            label="Device ID"
            value={context?.device_id}
            mono
            className="sm:col-span-2"
          />
          <Detail
            label="Browser signature"
            value={context?.user_agent}
            mono
            className="sm:col-span-2"
          />
        </dl>

        <div className="border-border bg-muted/20 min-h-72 border-t p-3 lg:border-t-0 lg:border-l">
          {hasCoordinates ? (
            <Map latitude={context.latitude!} longitude={context.longitude!} />
          ) : (
            <div className="text-muted-foreground flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-dashed text-center">
              <Globe2Icon
                className="mb-3 size-7"
                strokeWidth={1.5}
                aria-hidden
              />
              <p className="text-foreground text-sm font-medium">
                Location not shared
              </p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed">
                The session still includes server-captured network data. A map
                appears only when the subject grants location access.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Detail({
  label,
  value,
  mono = false,
  className,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd
        className={`mt-1 text-sm font-medium break-words ${mono ? "font-mono text-xs" : ""}`}
      >
        {value || "Not captured"}
      </dd>
    </div>
  );
}

function Map({ latitude, longitude }: { latitude: number; longitude: number }) {
  const delta = 0.08;
  const bbox = [
    longitude - delta,
    latitude - delta,
    longitude + delta,
    latitude + delta,
  ].join(",");
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${latitude},${longitude}`)}`;
  const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=12/${latitude}/${longitude}`;

  return (
    <div className="bg-muted relative h-full min-h-64 overflow-hidden rounded-xl border">
      <iframe
        title="Approximate subject location on OpenStreetMap"
        src={embedUrl}
        loading="lazy"
        className="absolute inset-0 h-full w-full"
      />
      <a
        href={mapUrl}
        target="_blank"
        rel="noreferrer"
        className="bg-background/95 text-foreground absolute right-3 bottom-3 flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur"
      >
        Open in OpenStreetMap
        <ExternalLinkIcon className="size-3" aria-hidden />
      </a>
    </div>
  );
}
