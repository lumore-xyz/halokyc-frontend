"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "halokyc.recentSessions";
const MAX_ENTRIES = 10;
const SAME_TAB_EVENT = "halokyc:recentSessions-changed";

export type RecentSession = {
  verification_id: string;
  external_user_id: string;
  created_at: string;
};

const EMPTY_SERVER_SNAPSHOT: RecentSession[] = [];

function parseStored(raw: string | null): RecentSession[] {
  if (!raw) return EMPTY_SERVER_SNAPSHOT;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_SERVER_SNAPSHOT;
    return parsed.filter(isRecentSession);
  } catch {
    return EMPTY_SERVER_SNAPSHOT;
  }
}

function isRecentSession(value: unknown): value is RecentSession {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.verification_id === "string" &&
    typeof candidate.external_user_id === "string" &&
    typeof candidate.created_at === "string"
  );
}

let cachedRaw: string | null | undefined;
let cachedSnapshot: RecentSession[] = EMPTY_SERVER_SNAPSHOT;

function readSessions(): RecentSession[] {
  if (typeof window === "undefined") return EMPTY_SERVER_SNAPSHOT;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  cachedSnapshot = parseStored(raw);
  return cachedSnapshot;
}

function writeSessions(sessions: RecentSession[]): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(sessions);
    window.sessionStorage.setItem(STORAGE_KEY, serialized);
    cachedRaw = serialized;
    cachedSnapshot = sessions;
  } catch {
    return;
  }
  window.dispatchEvent(new Event(SAME_TAB_EVENT));
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(SAME_TAB_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SAME_TAB_EVENT, callback);
  };
}

function getSnapshot(): RecentSession[] {
  return readSessions();
}

function getServerSnapshot(): RecentSession[] {
  return EMPTY_SERVER_SNAPSHOT;
}

export function useRecentSessions() {
  const sessions = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const recordSession = useCallback((entry: RecentSession) => {
    const current = readSessions();
    const filtered = current.filter(
      (item) => item.verification_id !== entry.verification_id,
    );
    const next = [entry, ...filtered].slice(0, MAX_ENTRIES);
    writeSessions(next);
  }, []);

  const clearSessions = useCallback(() => {
    writeSessions(EMPTY_SERVER_SNAPSHOT);
  }, []);

  return { sessions, recordSession, clearSessions };
}