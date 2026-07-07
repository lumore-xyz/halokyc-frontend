"use client";

import { KeyRound, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiKey } from "@/lib/hooks/use-api-key";
import { cn } from "@/lib/utils";

export function SiteHeaderSettings() {
  const { apiKey, setApiKey, clearApiKey } = useApiKey();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputId = useId();

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiKey(draft);
    setDraft("");
    setOpen(false);
  }

  const badgeText = apiKey
    ? `•••• ${apiKey.slice(-4)}`
    : "Set API key";

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        size="sm"
        variant={apiKey ? "secondary" : "outline"}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="API key settings"
      >
        <KeyRound className="size-4" aria-hidden />
        <span className="font-mono">{badgeText}</span>
      </Button>
      {open ? (
        <div
          role="dialog"
          aria-label="API key settings"
          className={cn(
            "border-border bg-popover text-popover-foreground absolute right-0 top-full z-40 mt-2 w-80 rounded-xl border p-4 shadow-md",
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">API key</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-muted-foreground hover:text-foreground rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          {apiKey ? (
            <div className="mb-3 flex items-center justify-between rounded-md bg-muted px-3 py-2">
              <span className="font-mono text-xs">
                Current key: •••• {apiKey.slice(-4)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={clearApiKey}
                aria-label="Clear API key"
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </div>
          ) : null}
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <Label htmlFor={inputId}>
              {apiKey ? "Replace key" : "Paste a new API key"}
            </Label>
            <Input
              id={inputId}
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="live_…"
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-xs">
                Stored only in this tab.
              </p>
              <Button
                type="submit"
                size="sm"
                disabled={draft.trim().length === 0}
              >
                Save key
              </Button>
            </div>
           </form>
         </div>
       ) : null}
    </div>
  );
}
