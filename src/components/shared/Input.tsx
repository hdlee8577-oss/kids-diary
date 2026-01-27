import type { ComponentProps } from "react";

type Props = ComponentProps<"input">;

export function Input({ className = "", ...props }: Props) {
  return (
    <input
      className={`h-10 w-full rounded-[var(--radius)] border border-black/10 bg-[var(--color-surface)]/70 px-3 text-sm text-[var(--color-text)] shadow-sm outline-none transition focus:border-[var(--color-primary)]/40 focus:ring-2 focus:ring-[var(--color-primary)]/20 file:mr-3 file:rounded-[calc(var(--radius)-6px)] file:border-0 file:bg-black/5 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[var(--color-text)] ${className}`}
      {...props}
    />
  );
}

