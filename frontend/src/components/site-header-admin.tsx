"use client";

import Link from "next/link";
import { LogInIcon, LogOutIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAdminLogout, useAdminSession } from "@/lib/hooks/use-admin-session";

export function SiteHeaderAdmin() {
  const session = useAdminSession();
  const logout = useAdminLogout();

  if (session.data?.authenticated) {
    return (
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={logout.isPending}
        onClick={() => logout.mutate()}
      >
        <LogOutIcon data-icon="inline-start" />
        Sign out
      </Button>
    );
  }

  return (
    <Button render={<Link href="/admin/login" />} nativeButton={false} size="sm" variant="outline">
      <LogInIcon data-icon="inline-start" />
      Sign in
    </Button>
  );
}

