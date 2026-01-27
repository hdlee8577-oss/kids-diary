export type MenuModuleId =
  | "photos" // 사진첩
  | "diary" // 일기장
  | "artworks" // 작품 모음
  | "awards" // 상장/인증서
  | "books" // 독서 기록
  | "portfolio" // 포트폴리오
  | "growth" // 성장 기록
  | "sleep" // 수면 기록
  | "feeding" // 수유 기록
  | "health" // 건강 기록
  | "activities" // 활동 기록
  | "timeline" // 타임라인
  | "stats" // 통계
  | "shared" // 공유 앨범
  | "kids-view"; // 아이용 뷰

export type MenuModule = {
  id: MenuModuleId;
  label: string;
  icon: string;
  path: string;
  description: string;
  category: "basic" | "growth" | "portfolio" | "health" | "social";
  ageRange?: {
    min?: number; // 최소 나이 (월)
    max?: number; // 최대 나이 (월)
  };
  roles: ("parent" | "child")[];
  requiresSubscription?: boolean;
  order: number;
};

export const MENU_MODULES: MenuModule[] = [
  // 기본 메뉴 (항상 활성화 가능)
  {
    id: "photos",
    label: "사진첩",
    icon: "📸",
    path: "/photos",
    description: "아이의 사진을 저장하고 관리해요",
    category: "basic",
    roles: ["parent", "child"],
    order: 1,
  },
  {
    id: "diary",
    label: "일기장",
    icon: "📝",
    path: "/diary",
    description: "육아 일기나 아이의 일기를 기록해요",
    category: "basic",
    roles: ["parent", "child"],
    order: 2,
  },

  // 성장 기록
  {
    id: "growth",
    label: "성장 기록",
    icon: "📏",
    path: "/growth",
    description: "키, 몸무게, 발자국 등 성장을 기록해요",
    category: "growth",
    ageRange: { min: 0, max: 144 }, // 0-12세
    roles: ["parent"],
    order: 10,
  },
  {
    id: "sleep",
    label: "수면 기록",
    icon: "💤",
    path: "/sleep",
    description: "아이의 수면 패턴을 기록해요",
    category: "health",
    ageRange: { min: 0, max: 36 }, // 0-3세
    roles: ["parent"],
    order: 11,
  },
  {
    id: "feeding",
    label: "수유 기록",
    icon: "🍼",
    path: "/feeding",
    description: "수유 시간과 양을 기록해요",
    category: "health",
    ageRange: { min: 0, max: 24 }, // 0-2세
    roles: ["parent"],
    order: 12,
  },
  {
    id: "health",
    label: "건강 기록",
    icon: "🏥",
    path: "/health",
    description: "예방접종, 병원 기록을 관리해요",
    category: "health",
    roles: ["parent"],
    order: 13,
  },

  // 작품/활동
  {
    id: "artworks",
    label: "작품 모음",
    icon: "🎨",
    path: "/artworks",
    description: "아이가 만든 그림, 만들기를 모아요",
    category: "portfolio",
    ageRange: { min: 24 }, // 2세 이상
    roles: ["parent", "child"],
    order: 20,
  },
  {
    id: "awards",
    label: "상장/인증서",
    icon: "🏆",
    path: "/awards",
    description: "받은 상장과 인증서를 보관해요",
    category: "portfolio",
    ageRange: { min: 36 }, // 3세 이상
    roles: ["parent", "child"],
    order: 21,
  },
  {
    id: "books",
    label: "독서 기록",
    icon: "📚",
    path: "/books",
    description: "읽은 책을 기록하고 리뷰를 남겨요",
    category: "portfolio",
    ageRange: { min: 48 }, // 4세 이상
    roles: ["parent", "child"],
    order: 22,
  },
  {
    id: "activities",
    label: "활동 기록",
    icon: "🎯",
    path: "/activities",
    description: "STEM, Art, Sports 등 활동을 기록해요",
    category: "portfolio",
    ageRange: { min: 60 }, // 5세 이상
    roles: ["parent", "child"],
    requiresSubscription: true,
    order: 23,
  },

  // 포트폴리오
  {
    id: "portfolio",
    label: "포트폴리오",
    icon: "📊",
    path: "/portfolio",
    description: "대입 준비용 포트폴리오를 만들어요",
    category: "portfolio",
    ageRange: { min: 108 }, // 9세 이상
    roles: ["parent", "child"],
    requiresSubscription: true,
    order: 30,
  },

  // 기타
  {
    id: "timeline",
    label: "타임라인",
    icon: "📅",
    path: "/timeline",
    description: "모든 기록을 시간순으로 보여요",
    category: "basic",
    roles: ["parent", "child"],
    order: 40,
  },
  {
    id: "stats",
    label: "통계",
    icon: "📈",
    path: "/stats",
    description: "기록 통계를 한눈에 봐요",
    category: "basic",
    roles: ["parent"],
    order: 41,
  },
  {
    id: "shared",
    label: "공유 앨범",
    icon: "🔗",
    path: "/shared",
    description: "가족과 공유하는 앨범이에요",
    category: "social",
    roles: ["parent", "child"],
    order: 50,
  },
  {
    id: "kids-view",
    label: "아이용 뷰",
    icon: "👶",
    path: "/kids",
    description: "아이가 직접 볼 수 있는 간단한 화면이에요",
    category: "social",
    roles: ["child"],
    order: 60,
  },
];

// 헬퍼 함수
export function getModuleById(id: MenuModuleId): MenuModule | undefined {
  return MENU_MODULES.find((m) => m.id === id);
}

export function getModulesByCategory(
  category: MenuModule["category"]
): MenuModule[] {
  return MENU_MODULES.filter((m) => m.category === category);
}

export function getModulesByRole(role: "parent" | "child"): MenuModule[] {
  return MENU_MODULES.filter((m) => m.roles.includes(role));
}
