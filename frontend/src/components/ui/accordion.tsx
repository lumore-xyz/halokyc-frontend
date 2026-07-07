import * as React from "react"

import { cn } from "@/lib/utils"

function Accordion({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="region"
      data-slot="accordion"
      className={cn("w-full", className)}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="accordion-item"
      className={cn(
        "border border-[var(--landing-paper-edge)] bg-[var(--landing-paper)] first:border-t-0",
        className
      )}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="accordion-trigger"
      className={cn(
        "group flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4",
        "text-[15.5px] font-semibold tracking-tight text-[var(--landing-ink)]",
        "transition-colors",
        "hover:bg-[var(--landing-paper-soft)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-paper)]",
        "[&[data-state=open]>svg]:rotate-45",
        className
      )}
      {...props}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 shrink-0 text-[var(--landing-ink-soft)] transition-transform duration-200"
        aria-hidden="true"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  )
}

function AccordionContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="accordion-content"
      className={cn("px-5 pb-4 pt-0", className)}
      {...props}
    />
  )
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
}
