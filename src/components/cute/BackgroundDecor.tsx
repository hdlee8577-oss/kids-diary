"use client";

import { useMemo } from "react";
import { useSiteSettingsStore } from "@/stores/siteSettingsStore";

export function BackgroundDecor() {
  const pattern = useSiteSettingsStore((s) => s.theme.cute.pattern);

  const overlayStyle = useMemo(() => {
    if (pattern === "dots") {
      return {
        backgroundImage:
          "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--color-accent-a) 40%, transparent) 1px, transparent 0)",
        backgroundSize: "18px 18px",
        opacity: 0.35,
      } as const;
    }
    if (pattern === "stars") {
      return {
        backgroundImage:
          "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--color-accent-b) 40%, transparent) 1px, transparent 0), radial-gradient(circle at 70% 60%, color-mix(in oklab, var(--color-accent-a) 35%, transparent) 1px, transparent 0)",
        backgroundSize: "24px 24px",
        opacity: 0.25,
      } as const;
    }
    if (pattern === "clouds") {
      return {
        backgroundImage:
          "radial-gradient(closest-side, color-mix(in oklab, var(--color-accent-a) 30%, transparent), transparent), radial-gradient(closest-side, color-mix(in oklab, var(--color-accent-b) 25%, transparent), transparent)",
        backgroundSize: "220px 220px, 260px 260px",
        backgroundPosition: "0 0, 80px 60px",
        opacity: 0.25,
      } as const;
    }
    return null;
  }, [pattern]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-[var(--color-background)]" />
      <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-[var(--color-accent-a)]/35 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[var(--color-accent-b)]/30 blur-3xl" />
      {overlayStyle ? (
        <div className="absolute inset-0" style={overlayStyle} />
      ) : null}
    </div>
  );
}

