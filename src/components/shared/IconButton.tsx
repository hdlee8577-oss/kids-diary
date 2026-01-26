import type { ComponentProps, ReactNode } from "react";

type Props = Omit<ComponentProps<"button">, "children"> & {
  label: string;
  children: ReactNode;
};

export function IconButton({ className = "", label, children, ...props }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius)] border border-black/10 bg-white/70 text-[var(--color-text)] shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

