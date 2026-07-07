export const ADMIN_COOKIE = "halokyc_admin";
export const CLIENT_COOKIE = "halokyc_client";

type DecodedJwtPayload = {
  exp?: number;
  user_id?: unknown;
  organization_id?: unknown;
  organization_member_id?: unknown;
  organization_role?: unknown;
  platform_admin_id?: unknown;
  platform_role?: unknown;
  token_type?: unknown;
};

export type ClientSessionPayload = {
  authenticated: boolean;
  userId?: string;
  organizationId?: string;
  organizationMemberId?: string;
  organizationRole?:
    | "client_owner"
    | "client_admin"
    | "client_reviewer"
    | "client_developer";
  expiresAt?: string;
};

export type PlatformRole =
  | "platform_owner"
  | "platform_business_admin"
  | "platform_support"
  | "platform_sales";

export type AdminSessionPayload = {
  authenticated: boolean;
  userId?: string;
  platformAdminId?: string;
  platformRole?: PlatformRole;
  expiresAt?: string;
};

export function clientSessionFromToken(
  token: string | null,
  now: number = Date.now(),
): ClientSessionPayload {
  if (!token) return { authenticated: false };
  const payload = decodeJwtPayload(token);
  if (
    !payload?.exp ||
    payload.exp * 1000 <= now ||
    payload.token_type !== "client"
  ) {
    return { authenticated: false };
  }
  const role =
    typeof payload.organization_role === "string" &&
    isClientRole(payload.organization_role)
      ? payload.organization_role
      : undefined;
  return {
    authenticated: true,
    userId: typeof payload.user_id === "string" ? payload.user_id : undefined,
    organizationId:
      typeof payload.organization_id === "string"
        ? payload.organization_id
        : undefined,
    organizationMemberId:
      typeof payload.organization_member_id === "string"
        ? payload.organization_member_id
        : undefined,
    organizationRole: role,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  };
}

export function adminSessionFromToken(
  token: string | null,
  now: number = Date.now(),
): AdminSessionPayload {
  if (!token) return { authenticated: false };
  const payload = decodeJwtPayload(token);
  if (
    !payload?.exp ||
    payload.exp * 1000 <= now ||
    payload.token_type !== "admin"
  ) {
    return { authenticated: false };
  }
  const role =
    typeof payload.platform_role === "string" && isPlatformRole(payload.platform_role)
      ? payload.platform_role
      : undefined;
  return {
    authenticated: true,
    userId: typeof payload.user_id === "string" ? payload.user_id : undefined,
    platformAdminId:
      typeof payload.platform_admin_id === "string"
        ? payload.platform_admin_id
        : undefined,
    platformRole: role,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  };
}

function decodeJwtPayload(token: string): DecodedJwtPayload | null {
  const encoded = token.split(".")[1];
  if (!encoded) return null;
  try {
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    return JSON.parse(atob(padded)) as DecodedJwtPayload;
  } catch {
    return null;
  }
}

function isClientRole(value: string): value is NonNullable<ClientSessionPayload["organizationRole"]> {
  return (
    value === "client_owner" ||
    value === "client_admin" ||
    value === "client_reviewer" ||
    value === "client_developer"
  );
}

function isPlatformRole(value: string): value is PlatformRole {
  return (
    value === "platform_owner" ||
    value === "platform_business_admin" ||
    value === "platform_support" ||
    value === "platform_sales"
  );
}
