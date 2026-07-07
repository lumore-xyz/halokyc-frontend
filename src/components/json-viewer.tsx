"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type JsonViewerProps = {
  value: unknown;
  className?: string;
  initiallyCollapsed?: boolean;
  title?: string;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function JsonViewer({
  value,
  className,
  initiallyCollapsed = false,
  title = "Raw response",
}: JsonViewerProps) {
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
  const [copied, setCopied] = useState(false);

  const serialized = JSON.stringify(value, null, 2);
  const lines = serialized.split("\n");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(serialized);
      setCopied(true);
      toast.success("Copied JSON to clipboard");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  return (
    <div
      className={cn(
        "border-border bg-card overflow-hidden rounded-xl border",
        className,
      )}
    >
      <div className="border-border flex items-center justify-between border-b px-4 py-2">
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
          className="text-foreground hover:text-foreground/80 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
        >
          {title}
        </button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy JSON"}
        >
          {copied ? (
            <Check className="size-4" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )}
        </Button>
      </div>
      {collapsed ? null : (
        <pre className="text-foreground max-h-96 overflow-auto px-4 py-3 font-mono text-xs leading-relaxed">
          <code>{lines.join("\n")}</code>
        </pre>
      )}
    </div>
  );
}

export function describeJson(value: unknown): string {
  if (value == null) return "Empty";
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? "" : "s"}`;
  if (isObject(value)) return `${Object.keys(value).length} field${Object.keys(value).length === 1 ? "" : "s"}`;
  return typeof value;
}