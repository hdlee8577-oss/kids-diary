import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary";
type Size = "sm" | "md";

type Props = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: ReactNode;
};

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
      />
    </svg>
  );
}

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  disabled,
  children,
  ...props
}: Props) {
  const base =
    "inline-flex select-none items-center justify-center gap-2 rounded-[var(--radius)] font-semibold shadow-sm transition active:translate-y-[0.5px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30 disabled:cursor-not-allowed disabled:opacity-60";
  const sizes =
    size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-5 text-sm";
  const styles =
    variant === "primary"
      ? "bg-gradient-to-b from-[var(--color-primary)]/95 to-[var(--color-primary)] text-white hover:brightness-[1.03]"
      : "border border-black/10 bg-[var(--color-surface)]/70 text-[var(--color-text)] hover:bg-[var(--color-surface)]";

  return (
    <button
      className={`${base} ${sizes} ${styles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner /> : leftIcon ? leftIcon : null}
      <span>{children}</span>
    </button>
  );
}

