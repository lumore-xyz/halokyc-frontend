"use client";

import { useEffect, useSyncExternalStore } from "react";

const subscribeToNothing = () => () => {};

export function useAccountActionToken(): string | null | undefined {
  const token = useSyncExternalStore(
    subscribeToNothing,
    () => new URLSearchParams(window.location.search).get("token"),
    () => undefined,
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("token")) return;
    url.searchParams.delete("token");
    window.history.replaceState(window.history.state, "", url);
  }, []);

  return token;
}
