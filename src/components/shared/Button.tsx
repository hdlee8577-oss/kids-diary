import type { ComponentProps } from "react";

type Variant = "primary" | "secondary";

type Props = ComponentProps<"button"> & {
  variant?: Variant;
};

export function Button({ className = "", variant = "primary", ...props }: Props) {
  const base =
    "inline-flex h-10 items-center justify-center rounded-[var(--radius)] px-4 text-sm font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30";
  const styles =
    variant === "primary"
      ? "bg-[var(--color-primary)] text-white hover:opacity-95"
      : "border border-black/10 bg-[var(--color-surface)]/70 text-[var(--color-text)] hover:bg-[var(--color-surface)]";

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

