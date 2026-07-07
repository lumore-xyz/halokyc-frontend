import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoVariant =
  | "wordmark-dark"
  | "wordmark-light"
  | "icon"
  | "icon-color";

type BrandLogoProps = {
  variant?: BrandLogoVariant;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

const LOGO_META: Record<
  BrandLogoVariant,
  { src: string; alt: string; width: number; height: number }
> = {
  "wordmark-dark": {
    src: "/assets/logo/halokyc-hr-dark.png",
    alt: "HaloKYC",
    width: 1774,
    height: 887,
  },
  "wordmark-light": {
    src: "/assets/logo/halokyc-hr-light.png",
    alt: "HaloKYC",
    width: 1774,
    height: 887,
  },
  icon: {
    src: "/assets/logo/halokyc-icon.png",
    alt: "HaloKYC",
    width: 2000,
    height: 2000,
  },
  "icon-color": {
    src: "/assets/logo/halokyc-icon.png",
    alt: "HaloKYC",
    width: 2000,
    height: 2000,
  },
};

export function BrandLogo({
  variant = "wordmark-dark",
  className,
  imageClassName,
  priority,
}: BrandLogoProps) {
  const logo = LOGO_META[variant];
  const isWordmark = variant.startsWith("wordmark");

  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden",
        isWordmark ? "h-8 w-32" : "size-9 rounded-xl",
        className,
      )}
    >
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        priority={priority}
        className={cn(
          "select-none",
          isWordmark
            ? "absolute top-1/2 left-1/2 h-auto w-[168%] -translate-x-1/2 -translate-y-1/2"
            : "h-full w-full object-cover",
          imageClassName,
        )}
      />
    </span>
  );
}
