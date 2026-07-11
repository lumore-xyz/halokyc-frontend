/**
 * Builds the absolute verify URL to encode into the QR code for the
 * desktop-to-mobile handoff. Preserves the same query params the
 * requesting service supplied (`verification_id`, `external_user_id`,
 * `callback_url`) so the mobile navigation lands on the same session.
 *
 * The verify page uses the session callback URL returned by the API for the
 * final Done/Continue navigation; preserving query params keeps older links
 * and QR handoffs pointed at the same session.
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
