import type { ThemeSettings } from "@/Site.config";

// 색상 밝기 조정 함수
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function applyThemeToDom(theme: ThemeSettings) {
  if (typeof document === "undefined") return;

  const r = document.documentElement;

  // 기본 색상
  r.style.setProperty("--color-primary", theme.colors.primary);
  r.style.setProperty("--color-background", theme.colors.background);
  r.style.setProperty("--color-surface", theme.colors.surface);
  r.style.setProperty("--color-text", theme.colors.text);

  // Primary 색상 변형
  const primaryLight = adjustColor(theme.colors.primary, 30);
  const primaryDark = adjustColor(theme.colors.primary, -30);
  r.style.setProperty("--color-primary-light", primaryLight);
  r.style.setProperty("--color-primary-dark", primaryDark);

  // Secondary 색상 (Primary의 보색 계열)
  const secondary = theme.homeMood?.accentColor1 || "#ec4899";
  const secondaryLight = adjustColor(secondary, 30);
  const secondaryDark = adjustColor(secondary, -30);
  r.style.setProperty("--color-secondary", secondary);
  r.style.setProperty("--color-secondary-light", secondaryLight);
  r.style.setProperty("--color-secondary-dark", secondaryDark);

  // Accent 색상
  const accent = theme.homeMood?.accentColor2 || "#f59e0b";
  const accentLight = adjustColor(accent, 30);
  r.style.setProperty("--color-accent", accent);
  r.style.setProperty("--color-accent-light", accentLight);

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

