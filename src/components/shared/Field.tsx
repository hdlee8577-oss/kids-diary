import type { ReactNode } from "react";

type Props = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function Field({ label, hint, children }: Props) {
  return (
    <div className="grid gap-2">
      <div className="grid gap-0.5">
        <label className="text-sm font-semibold text-[var(--color-text)]">
          {label}
        </label>
        {hint ? (
          <p className="text-xs leading-5 text-black/50">{hint}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

