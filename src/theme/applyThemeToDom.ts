import type { ThemeSettings } from "@/Site.config";

export function applyThemeToDom(theme: ThemeSettings) {
  if (typeof document === "undefined") return;

  const r = document.documentElement;

  r.style.setProperty("--color-primary", theme.colors.primary);
  r.style.setProperty("--color-background", theme.colors.background);
  r.style.setProperty("--color-surface", theme.colors.surface);
  r.style.setProperty("--color-text", theme.colors.text);

  r.style.setProperty("--radius", `${theme.radiusPx}px`);

  // next/font variable names are defined on <body> class, but we can still reference them from :root
  const fontVar =
    theme.font === "geist"
      ? "var(--font-geist-sans)"
      : theme.font === "notoSansKr"
        ? "var(--font-noto-sans-kr)"
        : "system-ui";

  r.style.setProperty("--font-family-sans", fontVar);
  r.dataset.layout = theme.layout.mode;
}

