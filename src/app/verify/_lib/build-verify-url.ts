/**
 * Builds the absolute verify URL to encode into the QR code for the
 * desktop-to-mobile handoff. The verification UUID is the only browser
 * credential needed; webhook and completion targets stay server-side.
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
