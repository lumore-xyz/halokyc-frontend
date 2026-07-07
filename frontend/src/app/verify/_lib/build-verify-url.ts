/**
 * Builds the absolute verify URL to encode into the QR code for the
 * desktop-to-mobile handoff. Preserves the same query params the
 * requesting service supplied (`verification_id`, `external_user_id`,
 * `callback_url`) so the mobile navigation lands on the same session.
 *
 * Per ADR-F027 the `/verify` route ignores `callback_url` for browser
 * navigation, but we still forward it for backwards-compatible deep
 * links and because the existing page test asserts it is tolerated.
 */
export function buildVerifyUrl(
  location: Location,
  verificationId: string,
): string {
  if (!verificationId) return location.href;

  const params = new URLSearchParams(location.search);
  params.set("verification_id", verificationId);

  const path = `${location.pathname}?${params.toString()}`;
  return `${location.origin}${path}`;
}
