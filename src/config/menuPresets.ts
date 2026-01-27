import type { MenuModuleId } from "./menuModules";

export type MenuPreset = {
  id: string;
  label: string;
  description: string;
  ageRange: { min: number; max: number }; // 월 단위
  enabledModules: MenuModuleId[];
  roleMode: "parent" | "child" | "both";
};

export const MENU_PRESETS: MenuPreset[] = [
  {
    id: "baby",
    label: "아기 (0-1세)",
    description: "신생아부터 돌까지, 단순한 기록 중심",
    ageRange: { min: 0, max: 12 },
    enabledModules: [
      "photos",
      "diary",
      "growth",
      "sleep",
      "feeding",
      "health",
      "timeline",
    ],
    roleMode: "parent",
  },
  {
    id: "toddler",
    label: "유아 (1-3세)",
    description: "걸음마부터 유치원 전까지",
    ageRange: { min: 13, max: 36 },
    enabledModules: [
      "photos",
      "diary",
      "growth",
      "artworks",
      "timeline",
      "stats",
    ],
    roleMode: "parent",
  },
  {
    id: "preschool",
    label: "유치원 (4-5세)",
    description: "유치원 시기, 작품 관리 시작",
    ageRange: { min: 37, max: 60 },
    enabledModules: [
      "photos",
      "diary",
      "artworks",
      "awards",
      "books",
      "timeline",
      "stats",
      "kids-view",
    ],
    roleMode: "both",
  },
  {
    id: "elementary",
    label: "초등학교 (6-12세)",
    description: "초등 시기, 활동 기록 시작",
    ageRange: { min: 61, max: 144 },
    enabledModules: [
      "photos",
      "diary",
      "artworks",
      "awards",
      "books",
      "activities",
      "timeline",
      "stats",
      "shared",
      "kids-view",
    ],
    roleMode: "both",
  },
  {
    id: "teen",
    label: "중고등 (13세+)",
    description: "대입 준비, 포트폴리오 중심",
    ageRange: { min: 145, max: 216 },
    enabledModules: [
      "photos",
      "diary",
      "artworks",
      "awards",
      "books",
      "activities",
      "portfolio",
      "timeline",
      "stats",
      "shared",
      "kids-view",
    ],
    roleMode: "both",
  },
  {
    id: "custom",
    label: "직접 설정",
    description: "원하는 메뉴만 선택해서 사용해요",
    ageRange: { min: 0, max: 999 },
    enabledModules: [],
    roleMode: "both",
  },
];

// 헬퍼 함수
export function getPresetById(id: string): MenuPreset | undefined {
  return MENU_PRESETS.find((p) => p.id === id);
}

export function getPresetByAge(ageInMonths: number): MenuPreset | undefined {
  return MENU_PRESETS.find(
    (p) => ageInMonths >= p.ageRange.min && ageInMonths <= p.ageRange.max
  );
}

export function getRecommendedPreset(
  ageInMonths?: number
): MenuPreset | undefined {
  if (ageInMonths === undefined) return undefined;
  return getPresetByAge(ageInMonths);
}
