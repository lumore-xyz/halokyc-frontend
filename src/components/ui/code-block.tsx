"use client";

import { Check, Copy, FileCode2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FileEntry = {
  filename: string;
  code: string;
  language?: string;
};

type MultiFileCodeBlockProps = {
  files: FileEntry[];
  showLineNumbers?: boolean;
  scrollable?: boolean;
  maxHeight?: number;
  bodyClassName?: string;
  className?: string;
};

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    if (!navigator?.clipboard) return;
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={copy}>
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

function CodeBody({
  code,
  showLineNumbers,
}: {
  code: string;
  showLineNumbers: boolean;
}) {
  const lines = code.split("\n");

  if (!showLineNumbers) {
    return <code>{code}</code>;
  }

  return (
    <>
      {lines.map((line, index) => (
        <span key={index} className="block">
          <span className="mr-4 inline-block w-6 select-none text-right text-muted-foreground">
            {index + 1}
          </span>
          <code>{line || " "}</code>
        </span>
      ))}
    </>
  );
}

export function MultiFileCodeBlock({
  files,
  showLineNumbers = false,
  scrollable = false,
  maxHeight = 400,
  bodyClassName,
  className,
}: MultiFileCodeBlockProps) {
  const [active, setActive] = useState(files[0]?.filename ?? "");
  const file = files.find((item) => item.filename === active) ?? files[0];

  if (!file) return null;

  return (
    <div className={cn("overflow-hidden rounded-lg border", className)}>
      <div className="flex items-center justify-between border-b bg-muted/50">
        <div className="flex overflow-x-auto pl-1">
          {files.map((item) => (
            <button
              key={item.filename}
              onClick={() => setActive(item.filename)}
              className={cn(
                "h-10 shrink-0 border-b-2 px-3 font-mono text-xs transition-colors",
                active === item.filename
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.filename}
            </button>
          ))}
        </div>
        <div className="pr-3">
          <CopyButton code={file.code} />
        </div>
      </div>
      <div className="flex h-10 items-center gap-2 border-b bg-muted/30 px-4 text-muted-foreground">
        <FileCode2 className="h-4 w-4 shrink-0" />
        <span className="truncate font-mono text-xs">{file.language ?? "text"}</span>
      </div>
      <pre
        className={cn(
          "overflow-x-auto p-4 text-sm leading-7",
          scrollable && "overflow-y-auto",
          bodyClassName ?? "bg-background",
        )}
        style={scrollable ? { maxHeight } : undefined}
      >
        <CodeBody code={file.code} showLineNumbers={showLineNumbers} />
      </pre>
    </div>
  );
}
