import type { ComponentProps } from "react";

type Props = ComponentProps<"select">;

export function Select({ className = "", ...props }: Props) {
  return (
    <select
      className={`h-10 w-full rounded-[var(--radius)] border border-black/10 bg-[var(--color-surface)]/70 px-3 text-sm text-[var(--color-text)] shadow-sm outline-none transition focus:border-[var(--color-primary)]/40 focus:ring-2 focus:ring-[var(--color-primary)]/20 ${className}`}
      {...props}
    />
  );
}

