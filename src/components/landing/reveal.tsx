import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type RevealProps<T extends ElementType = "div"> = {
  children: ReactNode;
  className?: string;
  as?: T;
  delay?: number;
  duration?: number;
  y?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function Reveal<T extends ElementType = "div">({
  children,
  className,
  as,
  delay,
  duration,
  y,
  ...props
}: RevealProps<T>) {
  void delay;
  void duration;
  void y;
  const Component = as ?? "div";
  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  );
}
