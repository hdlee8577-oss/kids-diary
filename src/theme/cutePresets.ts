import type { CutePresetId, ThemeSettings } from "@/Site.config";

export type CutePreset = {
  id: CutePresetId;
  label: string;
  theme: ThemeSettings;
};

export const cutePresets: CutePreset[] = [
  {
    id: "warmBear",
    label: "따뜻한 곰돌이",
    theme: {
      colors: {
        primary: "#7C2D12",
        background: "#FFF7ED",
        surface: "#FFFFFF",
        text: "#1C1917",
      },
      accents: { a: "#FDE68A", b: "#FDBA74" },
      radiusPx: 26,
      font: "notoSansKr",
      layout: { mode: "cards" },
      gallery: { thumbnailSize: "md" },
      cute: { presetId: "warmBear", mascot: "bear", pattern: "dots" },
    },
  },
  {
    id: "rainbowBunny",
    label: "무지개 토끼",
    theme: {
      colors: {
        primary: "#6D28D9",
        background: "#FDF2F8",
        surface: "#FFFFFF",
        text: "#111827",
      },
      accents: { a: "#A7F3D0", b: "#93C5FD" },
      radiusPx: 28,
      font: "geist",
      layout: { mode: "cards" },
      gallery: { thumbnailSize: "md" },
      cute: { presetId: "rainbowBunny", mascot: "bunny", pattern: "clouds" },
    },
  },
  {
    id: "mintDino",
    label: "민트 공룡",
    theme: {
      colors: {
        primary: "#065F46",
        background: "#ECFDF5",
        surface: "#FFFFFF",
        text: "#064E3B",
      },
      accents: { a: "#99F6E4", b: "#FDE68A" },
      radiusPx: 22,
      font: "notoSansKr",
      layout: { mode: "cards" },
      gallery: { thumbnailSize: "md" },
      cute: { presetId: "mintDino", mascot: "dino", pattern: "stars" },
    },
  },
  {
    id: "starlitCat",
    label: "별빛 고양이",
    theme: {
      colors: {
        primary: "#0F172A",
        background: "#EEF2FF",
        surface: "#FFFFFF",
        text: "#0F172A",
      },
      accents: { a: "#FBCFE8", b: "#BFDBFE" },
      radiusPx: 24,
      font: "geist",
      layout: { mode: "cards" },
      gallery: { thumbnailSize: "md" },
      cute: { presetId: "starlitCat", mascot: "cat", pattern: "stars" },
    },
  },
];

export function getCutePreset(id: CutePresetId) {
  return cutePresets.find((p) => p.id === id) ?? cutePresets[0];
}

