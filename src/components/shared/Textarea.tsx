import type { ComponentProps } from "react";

type Props = ComponentProps<"textarea">;

export function Textarea({ className = "", ...props }: Props) {
  return (
    <textarea
      className={`min-h-[96px] w-full resize-y rounded-[var(--radius)] border border-black/10 bg-[var(--color-surface)]/70 px-3 py-2 text-sm leading-6 text-[var(--color-text)] shadow-sm outline-none transition focus:border-[var(--color-primary)]/40 focus:ring-2 focus:ring-[var(--color-primary)]/20 ${className}`}
      {...props}
    />
  );
}

