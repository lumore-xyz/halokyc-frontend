import { NextResponse } from "next/server";

import {
  clientSessionFromToken,
  getClientToken,
} from "@/lib/client-proxy";
import { backendUrl } from "@/lib/env";

type OrganizationRead = {
  name: string;
  billing_email: string | null;
  contact_person_name: string | null;
  contact_phone: string | null;
  status: "active" | "suspended" | "disabled";
};

type OrganizationMemberRead = {
  user_id: string;
  email: string;
};

export async function GET() {
  const token = await getClientToken();
  const session = clientSessionFromToken(token);
  if (!token || !session.authenticated || !session.organizationId) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 },
    );
  }

  const headers = { Authorization: `Bearer ${token}` };
  const organizationResponse = await fetch(
    backendUrl(`/api/v1/organizations/${session.organizationId}`),
    { headers, cache: "no-store" },
  );
  if (!organizationResponse.ok) {
    return mirrorBackendError(organizationResponse);
  }

  const membersResponse = await fetch(
    backendUrl(`/api/v1/organizations/${session.organizationId}/members`),
    { headers, cache: "no-store" },
  );
  if (!membersResponse.ok) {
    return mirrorBackendError(membersResponse);
  }

  const organization = (await organizationResponse.json()) as OrganizationRead;
  const members = (await membersResponse.json()) as OrganizationMemberRead[];
  const currentMember = members.find((member) => member.user_id === session.userId);

  return NextResponse.json({
    email: currentMember?.email ?? organization.billing_email ?? "",
    company_name: organization.name,
    contact_person_name: organization.contact_person_name,
    contact_phone: organization.contact_phone,
    phase: organization.status === "active" ? "production" : "suspended",
    is_active: organization.status === "active",
  });
}

export async function PATCH(request: Request) {
  const token = await getClientToken();
  const session = clientSessionFromToken(token);
  if (!token || !session.authenticated || !session.organizationId) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 },
    );
  }

  const response = await fetch(
    backendUrl(`/api/v1/organizations/${session.organizationId}`),
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: await request.text(),
      cache: "no-store",
    },
  );
  if (!response.ok) {
    return mirrorBackendError(response);
  }

  const organization = (await response.json()) as OrganizationRead;
  return NextResponse.json({
    email: organization.billing_email ?? "",
    company_name: organization.name,
    contact_person_name: organization.contact_person_name,
    contact_phone: organization.contact_phone,
    phase: organization.status === "active" ? "production" : "suspended",
    is_active: organization.status === "active",
  });
}

async function mirrorBackendError(response: Response) {
  let error = response.statusText || "Request failed";
  try {
    const body = (await response.json()) as { detail?: unknown };
    if (typeof body.detail === "string") error = body.detail;
  } catch {
    // Keep status text fallback.
  }
  return NextResponse.json({ ok: false, error }, { status: response.status });
}
