import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "outline" | "destructive";

type Props = ComponentProps<"button"> & {
  variant?: Variant;
};

export function Button({ className = "", variant = "primary", ...props }: Props) {
  const base =
    "inline-flex h-10 items-center justify-center rounded-[var(--radius)] px-4 text-sm font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30";
  
  let styles = "";
  if (variant === "primary") {
    styles = "bg-[var(--color-primary)] text-white hover:opacity-95";
  } else if (variant === "secondary") {
    styles = "border border-black/10 bg-[var(--color-surface)]/70 text-[var(--color-text)] hover:bg-[var(--color-surface)]";
  } else if (variant === "outline") {
    styles = "border border-black/10 bg-transparent text-[var(--color-text)] hover:bg-black/5";
  } else if (variant === "destructive") {
    styles = "bg-red-600 text-white hover:bg-red-700";
  }

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

