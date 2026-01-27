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
  let fontVar = "system-ui";
  if (theme.font === "geist") {
    fontVar = "var(--font-geist-sans)";
  } else if (theme.font === "notoSansKr") {
    fontVar = "var(--font-noto-sans-kr)";
  } else if (theme.font === "comicSans") {
    fontVar = '"Comic Sans MS", "Comic Sans", cursive';
  } else if (theme.font === "nanumGothic") {
    fontVar = "var(--font-nanum-gothic)";
  } else if (theme.font === "jua") {
    fontVar = "var(--font-jua)";
  }

  r.style.setProperty("--font-family-sans", fontVar);
  r.dataset.layout = theme.layout.mode;
}

