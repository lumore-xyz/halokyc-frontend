"use client";

import { useEffect, useState } from "react";

const MOBILE_UA_PATTERN =
  /Android|iPhone|iPad|iPod|Windows Phone|BlackBerry|SymbianOS|Opera Mini|IEMobile|Mobile|webOS|Kindle|Silk/i;

/**
 * SSR-safe mobile detection. Returns `false` during SSR and the first
 * client render to avoid hydration mismatches, then recomputes on mount
 * from `navigator.userAgent` plus a coarse-pointer media query.
 *
 * False positives are recoverable because every handoff surface offers a
 * "Use This Device" action, so the heuristic only needs to be good enough
 * to default desktops into the desktop journey.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent ?? "";
    const uaHit = MOBILE_UA_PATTERN.test(ua);
    const touchPoints =
      typeof navigator.maxTouchPoints === "number"
        ? navigator.maxTouchPoints
        : 0;
    const coarsePointer =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(pointer: coarse)").matches
        : false;

    // Tablets like iPad report a Mac UA in Safari on iPadOS 13+, so the
    // coarse-pointer check catches the desktop-impersonating case.
    const mobile = uaHit || (coarsePointer && touchPoints > 0);
    // setState on mount is the canonical SSR-safe detection escape hatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(mobile);
  }, []);

  return isMobile;
}
