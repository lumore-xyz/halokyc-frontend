/**
 * Runtime configuration sourced from NEXT_PUBLIC_* environment variables.
 * Values are inlined at build time, so they are safe to read from the browser.
 */
export const publicEnv = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000",
  verificationPollMs: Number(
    process.env.NEXT_PUBLIC_VERIFICATION_POLL_MS ?? 2500,
  ),
  enableAdminConsole:
    (process.env.NEXT_PUBLIC_ENABLE_ADMIN_CONSOLE ?? "true") === "true",
  enablePrivacyDashboard:
    (process.env.NEXT_PUBLIC_ENABLE_PRIVACY_DASHBOARD ?? "false") === "true",
  googleOAuthClientId:
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID ?? "",
  googleOAuthRedirectUri:
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI ??
    "http://localhost:3000/login/google/callback",
} as const;

export function backendUrl(path: string): string {
  const base = publicEnv.apiBaseUrl;
  return `${base.replace(/\/$/, "")}${path}`;
}

export type PublicEnv = typeof publicEnv;
