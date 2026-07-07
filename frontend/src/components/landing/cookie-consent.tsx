"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "halokyc.cookieConsent";
const SUBSCRIBERS = new Set<() => void>();
let lastRaw: string | null = null;
let lastSnapshot: CookieConsent | null = null;

export type CookieCategory = "essential" | "analytics";

export type CookieConsent = {
  essential: true;
  analytics: boolean;
  decided_at: string;
  policy_version: string;
};

/**
 * Current policy version for cookie consent. Bump when the
 * `CookieConsent` shape or the cookie notice text changes
 * materially so the banner re-prompts existing visitors.
 */
export const COOKIE_CONSENT_VERSION = "2026-07-03";

function emitChange() {
  for (const sub of SUBSCRIBERS) sub();
}

function parse(raw: string | null): CookieConsent | null {
  if (raw === lastRaw) return lastSnapshot;
  lastRaw = raw;
  if (!raw) {
    lastSnapshot = null;
    return lastSnapshot;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (!parsed || typeof parsed !== "object") {
      lastSnapshot = null;
      return lastSnapshot;
    }
    if (parsed.policy_version !== COOKIE_CONSENT_VERSION) {
      lastSnapshot = null;
      return lastSnapshot;
    }
    if (parsed.essential !== true) {
      lastSnapshot = null;
      return lastSnapshot;
    }
    if (typeof parsed.analytics !== "boolean") {
      lastSnapshot = null;
      return lastSnapshot;
    }
    if (typeof parsed.decided_at !== "string") {
      lastSnapshot = null;
      return lastSnapshot;
    }
    lastSnapshot = {
      essential: true,
      analytics: parsed.analytics,
      decided_at: parsed.decided_at,
      policy_version: COOKIE_CONSENT_VERSION,
    };
    return lastSnapshot;
  } catch {
    lastSnapshot = null;
    return lastSnapshot;
  }
}

function getSnapshot(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  return parse(window.localStorage.getItem(STORAGE_KEY));
}

function getServerSnapshot(): CookieConsent | null {
  return null;
}

function subscribe(callback: () => void) {
  SUBSCRIBERS.add(callback);
  return () => {
    SUBSCRIBERS.delete(callback);
  };
}

function writeStoredConsent(next: CookieConsent) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage may be unavailable; consent still lives in state
  }
}

/**
 * Reads, decides, and persists the visitor's cookie preference.
 * Returns the resolved consent plus `decide` / `reset` actions.
 * The banner is shown whenever the stored value is `null` (never
 * decided) or the stored version is older than the current one.
 *
 * Backed by `useSyncExternalStore` over a small pub/sub that
 * listens for direct `localStorage` writes from this tab. The
 * snapshot is cached at module scope so the reference stays
 * stable between renders when the underlying value is unchanged
 * (which is what `useSyncExternalStore` requires).
 */
export function useCookieConsent() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const decide = useCallback((analytics: boolean) => {
    const next: CookieConsent = {
      essential: true,
      analytics,
      decided_at: new Date().toISOString(),
      policy_version: COOKIE_CONSENT_VERSION,
    };
    writeStoredConsent(next);
    emitChange();
  }, []);

  const reset = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    emitChange();
  }, []);

  return useMemo(
    () => ({ consent, showBanner: consent === null, decide, reset }),
    [consent, decide, reset],
  );
}
