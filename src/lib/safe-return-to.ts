const CLIENT_RETURN_TO_KEY = "halokyc.clientReturnTo";

export function safeClientReturnTo(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  try {
    const parsed = new URL(value, "https://halokyc.invalid");
    if (parsed.origin !== "https://halokyc.invalid") return null;
    if (
      parsed.pathname !== "/dashboard" &&
      !parsed.pathname.startsWith("/dashboard/")
    ) {
      return null;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function rememberClientReturnTo(value: string | null): void {
  if (typeof window === "undefined") return;
  const safe = safeClientReturnTo(value);
  if (safe) window.sessionStorage.setItem(CLIENT_RETURN_TO_KEY, safe);
}

export function consumeClientReturnTo(): string {
  if (typeof window === "undefined") return "/dashboard";
  const safe = safeClientReturnTo(
    window.sessionStorage.getItem(CLIENT_RETURN_TO_KEY),
  );
  window.sessionStorage.removeItem(CLIENT_RETURN_TO_KEY);
  return safe ?? "/dashboard";
}

export function clearClientReturnTo(): void {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(CLIENT_RETURN_TO_KEY);
  }
}
