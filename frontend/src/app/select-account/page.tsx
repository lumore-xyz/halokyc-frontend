"use client";

import { Building2Icon, ShieldCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { apiClient, type UnifiedLoginResponse } from "@/lib/api-client";

type AuthState =
  | { status: "loading" }
  | { status: "ready"; data: UnifiedLoginResponse }
  | { status: "missing" };

function readAuth(): UnifiedLoginResponse | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem("unified_auth");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UnifiedLoginResponse;
  } catch {
    return null;
  }
}

export default function SelectAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [auth] = useState<AuthState>(() => {
    const data = readAuth();
    if (!data) return { status: "missing" };
    return { status: "ready", data };
  });

  const firedRef = useRef(false);
  useEffect(() => {
    if (auth.status !== "ready") return;
    if (firedRef.current) return;
    const data = auth.data;
    const hasAdmin = data.is_platform_admin;
    const organizations = data.organizations ?? [];
    if (hasAdmin && organizations.length === 0) {
      firedRef.current = true;
      apiClient
        .selectAdmin(data.temp_token)
        .then(async (res) => {
          const response = await fetch("/api/admin/login/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: res.access_token }),
          });
  if (!response.ok) {
  toast.error("Failed to set admin session. Please try again.");
  return;
}
          window.sessionStorage.removeItem("unified_auth");
          router.push("/admin");
        })
  .catch(() => {
  toast.error("Failed to sign in as admin. Please try again.");
});
      return;
    }
    if (!hasAdmin && organizations.length === 1) {
      firedRef.current = true;
      const orgId = organizations[0].organization_id;
      apiClient
        .selectClient(data.temp_token, orgId)
        .then(async (res) => {
          const response = await fetch("/api/client/login/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: res.access_token }),
          });
  if (!response.ok) {
  toast.error("Failed to set client session. Please try again.");
  return;
}
          window.sessionStorage.removeItem("unified_auth");
          router.push("/dashboard");
        })
  .catch(() => {
  toast.error("Failed to sign in. Please try again.");
});
    }
  }, [auth, router]);

async function handleSelectAdmin() {
  if (auth.status !== "ready") return;
  if (firedRef.current) return;
  firedRef.current = true;
  setLoading(true);
  try {
    const res = await apiClient.selectAdmin(auth.data.temp_token);
    const response = await fetch("/api/admin/login/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: res.access_token }),
    });
    if (!response.ok) {
      toast.error("Failed to set admin session. Please try again.");
      return;
    }
    window.sessionStorage.removeItem("unified_auth");
    router.push("/admin");
  } catch {
    toast.error("Failed to sign in as admin. Please try again.");
  } finally {
    setLoading(false);
  }
}

async function handleSelectClient(orgId: string) {
  if (auth.status !== "ready") return;
  if (firedRef.current) return;
  firedRef.current = true;
  setLoading(true);
  try {
    const res = await apiClient.selectClient(auth.data.temp_token, orgId);
    const response = await fetch("/api/client/login/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: res.access_token }),
    });
    if (!response.ok) {
      toast.error("Failed to set client session. Please try again.");
      return;
    }
    window.sessionStorage.removeItem("unified_auth");
    router.push("/dashboard");
  } catch {
    toast.error("Failed to sign in. Please try again.");
  } finally {
    setLoading(false);
  }
}

  if (auth.status !== "ready") {
    if (auth.status === "missing" && typeof window !== "undefined") {
      router.replace("/login");
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--landing-canvas)] text-[var(--landing-canvas-ink)]">
        <Spinner />
      </div>
    );
  }

  const { data } = auth;
  const hasAdmin = data.is_platform_admin;
  const organizations = data.organizations ?? [];
  const showPicker = hasAdmin && organizations.length > 0;
  const noOptions = !hasAdmin && organizations.length === 0;

  if (noOptions) {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("unified_auth");
      router.replace("/login");
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--landing-canvas)] text-[var(--landing-canvas-ink)]">
        <Spinner />
      </div>
    );
  }

  if (!showPicker) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--landing-canvas)] text-[var(--landing-canvas-ink)]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--landing-canvas)] p-6 text-[var(--landing-canvas-ink)]">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Select Account
          </h1>
          <p className="text-sm text-[var(--landing-canvas-ink-soft)]">
            Choose where you want to sign in.
          </p>
        </div>

        <div className="grid gap-4">
          <Card
            className="group cursor-pointer border-[var(--landing-canvas-edge)] p-4 transition-all hover:border-[var(--landing-cyan)]"
            onClick={handleSelectAdmin}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-[var(--landing-cyan)]/10 p-2 text-[var(--landing-cyan)]">
                  <ShieldCheckIcon className="size-5" aria-hidden />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Platform Admin</p>
                  <p className="text-xs text-[var(--landing-canvas-ink-soft)]">
                    Manage the SaaS infrastructure
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" disabled={loading}>
                {loading ? (
                  <Spinner className="size-3.5" aria-hidden />
                ) : (
                  "Select"
                )}
              </Button>
            </div>
          </Card>

          {organizations.map((org) => (
            <Card
              key={org.organization_id}
              className="group cursor-pointer border-[var(--landing-canvas-edge)] p-4 transition-all hover:border-[var(--landing-cyan)]"
              onClick={() => handleSelectClient(org.organization_id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-[var(--landing-cyan)]/10 p-2 text-[var(--landing-cyan)]">
                    <Building2Icon className="size-5" aria-hidden />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{org.name}</p>
                    <p className="text-xs text-[var(--landing-canvas-ink-soft)]">
                      {org.role}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" disabled={loading}>
                  {loading ? (
                    <Spinner className="size-3.5" aria-hidden />
                  ) : (
                    "Select"
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
