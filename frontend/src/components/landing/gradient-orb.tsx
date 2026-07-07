/**
 * GradientOrb - soft radial glow for the hero backdrop.
 *
 * Renders a single absolutely-positioned div with a radial gradient
 * inside the parent. Decorative; aria-hidden. Paused under
 * prefers-reduced-motion by the .landing-halo class in globals.css.
 */

import { cn } from "@/lib/utils";

type GradientOrbProps = {
  /** Position class, e.g. "top-1/4 left-1/4" or "right-0 top-0". */
  position?: string;
  /** Size in Tailwind classes, e.g. "h-[520px] w-[520px]". */
  size?: string;
  /** Tailwind/CSS color override, defaults to halo cyan. */
  color?: string;
  /** Tailwind opacity class, defaults to 60%. */
  opacity?: string;
  /** Animation: orbit gives a slow vertical drift, halo gives a pulse. */
  motion?: "orbit" | "halo" | "none";
  className?: string;
};

export function GradientOrb({
  position = "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  size = "h-[640px] w-[640px]",
  color,
  opacity = "opacity-60",
  motion = "halo",
  className,
}: GradientOrbProps) {
  const bg = color
    ? { background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 65%)` }
    : {
        background:
          "radial-gradient(circle at 50% 50%, var(--landing-cyan) 0%, transparent 65%)",
      };

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute rounded-full blur-3xl",
        position,
        size,
        opacity,
        motion === "orbit" && "landing-orbit",
        motion === "halo" && "landing-halo",
        className,
      )}
      style={bg}
    />
  );
}
