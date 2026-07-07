"use client";

/**
 * Reveal - viewport-triggered fade-up wrapper for landing sections.
 * Wraps children in a motion.div that animates once when scrolled into
 * view. Honors prefers-reduced-motion by skipping the y offset.
 */

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Delay in seconds. */
  delay?: number;
  /** Y offset in px. */
  y?: number;
  /** Override the duration in seconds. */
  duration?: number;
  className?: string;
  /** Render as a different element. */
  as?: "div" | "section" | "article" | "li" | "span";
};

export function Reveal({
  children,
  delay = 0,
  y = 24,
  duration = 0.55,
  className,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: reduce ? 0.2 : duration,
        ease: [0.22, 1, 0.36, 1],
        delay,
      }}
    >
      {children}
    </MotionTag>
  );
}
