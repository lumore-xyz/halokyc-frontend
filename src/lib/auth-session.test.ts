import {
  adminSessionFromToken,
  clientSessionFromToken,
} from "@/lib/auth-session";

function token(payload: Record<string, unknown>) {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `test.${encoded}.signature`;
}

describe("auth session helpers", () => {
  const now = Date.UTC(2026, 5, 27);
  const futureExp = Math.floor((now + 60_000) / 1000);

  it("accepts only unexpired tokens with the expected role", () => {
    const clientToken = token({
      exp: futureExp,
      token_type: "client",
      user_id: "user-1",
      organization_id: "org-1",
      organization_member_id: "member-1",
      organization_role: "client_owner",
    });
    const adminToken = token({ exp: futureExp, token_type: "admin" });
    const expiredClientToken = token({
      exp: Math.floor((now - 60_000) / 1000),
      token_type: "client",
    });

    expect(clientSessionFromToken(clientToken, now)).toMatchObject({
      authenticated: true,
      userId: "user-1",
      organizationId: "org-1",
      organizationMemberId: "member-1",
      organizationRole: "client_owner",
    });
    expect(clientSessionFromToken(adminToken, now)).toEqual({
      authenticated: false,
    });
    expect(adminSessionFromToken(adminToken, now)).toMatchObject({
      authenticated: true,
    });
    expect(adminSessionFromToken(clientToken, now)).toEqual({
      authenticated: false,
    });
    expect(clientSessionFromToken(expiredClientToken, now)).toEqual({
      authenticated: false,
    });
  });
});
