"use client";

import { useEffect, useRef, useState } from "react";

export function useAccountActionToken(): string | null | undefined {
  const initialized = useRef(false);
  const [token, setToken] = useState<string | null>();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const url = new URL(window.location.href);
    setToken(url.searchParams.get("token"));
    if (!url.searchParams.has("token")) return;
    url.searchParams.delete("token");
    window.history.replaceState(window.history.state, "", url);
  }, []);

  return token;
}
