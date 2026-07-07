"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "halokyc.apiKey";
const SAME_TAB_EVENT = "halokyc:apiKey-changed";

function readStored(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener("storage", callback);
  window.addEventListener(SAME_TAB_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SAME_TAB_EVENT, callback);
  };
}

function getSnapshot(): string | null {
  return readStored();
}

function getServerSnapshot(): string | null {
  return null;
}

function writeStored(value: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (value && value.length > 0) {
      window.sessionStorage.setItem(STORAGE_KEY, value);
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // sessionStorage may throw in private mode or when disabled; treat as no-op.
    return;
  }
  window.dispatchEvent(new Event(SAME_TAB_EVENT));
}

export type ApiKeyApi = {
  apiKey: string | null;
  setApiKey: (value: string) => void;
  clearApiKey: () => void;
};

export function useApiKey(): ApiKeyApi {
  const apiKey = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setApiKey = useCallback((value: string) => {
    const trimmed = value.trim();
    writeStored(trimmed.length > 0 ? trimmed : null);
  }, []);

  const clearApiKey = useCallback(() => {
    writeStored(null);
  }, []);

  return { apiKey, setApiKey, clearApiKey };
}