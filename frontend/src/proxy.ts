import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_COOKIE,
  CLIENT_COOKIE,
  adminSessionFromToken,
  clientSessionFromToken,
} from "@/lib/auth-session";

const WORKSPACE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ORGANIZATION_SCOPED_PATHS = new Set([
  "/dashboard/workspaces",
  "/dashboard/team",
  "/dashboard/billing",
  "/dashboard/settings",
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientSession = clientSessionFromToken(
    request.cookies.get(CLIENT_COOKIE)?.value ?? null,
  );
  const adminSession = adminSessionFromToken(
    request.cookies.get(ADMIN_COOKIE)?.value ?? null,
  );

  if (pathname === "/login" && clientSession.authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/login" && adminSession.authenticated) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname === "/admin/login" && adminSession.authenticated) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname === "/admin/login" && clientSession.authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/dashboard") && !clientSession.authenticated) {
    const fallback = adminSession.authenticated ? "/admin" : "/login";
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    !adminSession.authenticated
  ) {
    const fallback = clientSession.authenticated ? "/dashboard" : "/admin/login";
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  // Workspace roll-out: any /dashboard/<segment> that is not a UUID workspace
  // id resolves to the workspace picker unless it is one of the new
  // organization-scoped routes (team, billing, workspaces, settings).
  if (pathname.startsWith("/dashboard/")) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "dashboard" && segments[1]) {
      if (!WORKSPACE_ID_PATTERN.test(segments[1])) {
        if (ORGANIZATION_SCOPED_PATHS.has(`/${segments.join("/")}`)) {
          return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login"],
};