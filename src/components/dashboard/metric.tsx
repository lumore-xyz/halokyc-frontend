import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "success" | "info" | "warning" | "danger";
};

const variantStyles = {
  default: "bg-secondary text-muted-foreground",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

export function Metric({ label, value, icon: Icon, description, variant = "default" }: MetricProps) {
  return (
    <Card className="app-shell-panel border border-[var(--dashboard-rule)] ring-0">
      <CardContent className="p-6 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <div className={cn("rounded-lg border border-[var(--dashboard-rule)] p-2", variantStyles[variant])}>
            <Icon className="size-4" />
          </div>
        </div>
        <div className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-[var(--dashboard-ink)]">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
