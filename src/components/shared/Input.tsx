import type { ComponentProps } from "react";

type Props = ComponentProps<"input">;

export function Input({ className = "", type, ...props }: Props) {
  const isFile = type === "file";
  return (
    <input
      type={type}
      className={`h-10 w-full rounded-[var(--radius)] border border-black/10 bg-[var(--color-surface)]/70 px-3 text-sm text-[var(--color-text)] shadow-sm outline-none transition focus:border-[var(--color-primary)]/40 focus:ring-2 focus:ring-[var(--color-primary)]/20 ${
        isFile 
          ? "flex items-center py-0 leading-10 file:mr-4 file:py-1.5 file:px-3 file:rounded-[var(--radius)] file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:opacity-95 file:cursor-pointer" 
          : ""
      } ${className}`}
      {...props}
    />
  );
}

