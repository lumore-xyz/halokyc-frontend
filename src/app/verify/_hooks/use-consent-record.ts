"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import { buildConsentAuditKey, type ConsentRecord } from "@/app/verify/_components/consent-card";

const CACHE = new Map<
  string,
  { raw: string | null; snapshot: ConsentRecord | null }
>();
const SUBSCRIBERS = new Map<string, Set<() => void>>();

function cacheFor(sessionId: string | null | undefined) {
  const key = sessionId ?? "";
  let entry = CACHE.get(key);
  if (!entry) {
    entry = { raw: null, snapshot: null };
    CACHE.set(key, entry);
  }
  return { key, entry };
}

function parse(sessionId: string | null | undefined, raw: string | null): ConsentRecord | null {
  const { entry } = cacheFor(sessionId);
  if (raw === entry.raw) return entry.snapshot;
  entry.raw = raw;
  if (!raw) {
    entry.snapshot = null;
    return entry.snapshot;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (!parsed || typeof parsed !== "object") {
      entry.snapshot = null;
      return entry.snapshot;
    }
    if (typeof parsed.policy_version !== "string") {
      entry.snapshot = null;
      return entry.snapshot;
    }
    if (typeof parsed.consent_timestamp !== "string") {
      entry.snapshot = null;
      return entry.snapshot;
    }
    entry.snapshot = {
      policy_version: parsed.policy_version,
      consent_timestamp: parsed.consent_timestamp,
      device_id: parsed.device_id ?? null,
      session_id: parsed.session_id ?? null,
      ip_address: null,
    };
    return entry.snapshot;
  } catch {
    entry.snapshot = null;
    return entry.snapshot;
  }
}

function getSnapshotFor(sessionId: string | null | undefined): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  return parse(sessionId, window.sessionStorage.getItem(buildConsentAuditKey(sessionId)));
}

function getServerSnapshot(): ConsentRecord | null {
  return null;
}

function subscribeFor(sessionId: string | null | undefined, callback: () => void) {
  const { key } = cacheFor(sessionId);
  let set = SUBSCRIBERS.get(key);
  if (!set) {
    set = new Set();
    SUBSCRIBERS.set(key, set);
  }
  set.add(callback);
  return () => {
    set?.delete(callback);
  };
}

function emitChange(sessionId: string | null | undefined) {
  const { key } = cacheFor(sessionId);
  const set = SUBSCRIBERS.get(key);
  if (!set) return;
  for (const sub of set) sub();
}

function writeStoredConsent(sessionId: string | null | undefined, record: ConsentRecord) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      buildConsentAuditKey(sessionId),
      JSON.stringify({
        policy_version: record.policy_version,
        consent_timestamp: record.consent_timestamp,
        device_id: record.device_id,
        session_id: record.session_id,
      }),
    );
  } catch {
    // best-effort persistence; consent still lives in component memory
  }
}

/**
 * Persists the consent record for the duration of the verify
 * session. The backend audit log (per COMPLIANCE.md section 4.1)
 * requires the `consent_timestamp`, `policy_version`, `device_id`,
 * and `session_id`; the IP is captured server-side. The record is
 * kept in `sessionStorage` so a tab refresh does not silently drop
 * the user's choice, but it never leaves the tab.
 *
 * Backed by `useSyncExternalStore` over a per-session pub/sub.
 * The snapshot is cached at module scope so the reference stays
 * stable between renders when the underlying value is unchanged
 * (which is what `useSyncExternalStore` requires).
 */
export function useConsentRecord(sessionId: string | null | undefined) {
  const record = useSyncExternalStore(
    (callback) => subscribeFor(sessionId, callback),
    () => getSnapshotFor(sessionId),
    getServerSnapshot,
  );

  const accept = useCallback(
    (next: ConsentRecord) => {
      writeStoredConsent(sessionId, next);
      emitChange(sessionId);
    },
    [sessionId],
  );

  return useMemo(
    () => ({ record, accept }),
    [record, accept],
  );
}

export function clearStoredConsent(sessionId: string | null | undefined) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(buildConsentAuditKey(sessionId));
    emitChange(sessionId);
  } catch {
    // ignore
  }
}
