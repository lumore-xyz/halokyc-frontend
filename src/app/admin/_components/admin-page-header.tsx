"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";

type AdminPageHeaderProps = {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
};

export function AdminPageHeader({
  icon: Icon,
  title,
  description,
  actions,
  meta,
}: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
          <Icon className="size-3.5" aria-hidden /> Operator console
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-muted-foreground max-w-2xl text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {(actions ?? meta) ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {meta ? <div className="flex flex-wrap items-center gap-2">{meta}</div> : <span />}
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
    </header>
  );
}

export function AdminPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  );
}