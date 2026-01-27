# 커스터마이즈 가능한 메뉴 시스템 설계

## 🎯 핵심 아이디어: **모듈화된 메뉴 + 사용자 설정**

---

## 📊 사용자 시나리오별 메뉴 구성

### 시나리오 1: 어린 아이 (0-3세)
**필요한 메뉴:**
- 📸 사진첩 (단순)
- 📝 육아일기
- 🎂 성장 기록 (키, 몸무게)
- 💤 수면 기록 (선택)

**불필요한 메뉴:**
- ❌ 포트폴리오
- ❌ 작품 관리
- ❌ 학년별 분류

---

### 시나리오 2: 유치원/초등 (4-8세)
**필요한 메뉴:**
- 📸 사진첩
- 📝 일기장
- 🎨 작품 모음 (그림, 만들기)
- 🏆 상장/인증서
- 📚 독서 기록 (선택)

**추가 가능:**
- 학년별 분류 (선택)

---

### 시나리오 3: 초등 고학년/중고등 (9세+)
**필요한 메뉴:**
- 📸 사진첩
- 📝 일기장
- 🎨 작품 모음
- 🏆 상장/인증서
- 📚 독서 기록
- 📊 포트폴리오 (대입 준비)
- 🎓 학년별 분류
- 📈 활동 기록 (STEM, Art, Sports)

---

### 시나리오 4: 부모용 vs 아이용
**부모용 메뉴:**
- 📸 사진첩
- 📝 육아일기
- 💤 수면 기록
- 🍼 수유 기록
- 🏥 건강 기록
- 📊 성장 차트

**아이용 메뉴:**
- 🎨 내 작품
- 📝 내 일기
- 🏆 내 상장
- 📚 내가 읽은 책
- 🎮 내 활동

---

## 🏗️ 시스템 구조

### 1. 메뉴 모듈 정의

**`src/config/menuModules.ts` (새 파일)**
```typescript
export type MenuModuleId = 
  | "photos"           // 사진첩
  | "diary"            // 일기장
  | "artworks"         // 작품 모음
  | "awards"           // 상장/인증서
  | "books"            // 독서 기록
  | "portfolio"        // 포트폴리오
  | "growth"           // 성장 기록
  | "sleep"            // 수면 기록
  | "feeding"          // 수유 기록
  | "health"           // 건강 기록
  | "activities"       // 활동 기록
  | "timeline"         // 타임라인
  | "stats"            // 통계
  | "shared"           // 공유 앨범
  | "kids-view";       // 아이용 뷰

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
  // 기본 메뉴 (항상 활성화)
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
```

---

### 2. 사용자 설정 스키마

**`docs/supabase-user-settings.sql` (새 파일)**
```sql
-- 사용자 메뉴 설정 테이블
CREATE TABLE IF NOT EXISTS user_menu_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled_modules JSONB DEFAULT '[]'::jsonb, -- 활성화된 메뉴 ID 배열
  menu_order JSONB DEFAULT '[]'::jsonb,     -- 메뉴 순서
  role_mode TEXT DEFAULT 'parent' CHECK (role_mode IN ('parent', 'child', 'both')),
  age_in_months INTEGER,                    -- 아이 나이 (월)
  preset TEXT,                              -- 'baby', 'toddler', 'elementary', 'teen'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_menu_settings_user_id 
ON user_menu_settings(user_id);

-- RLS
ALTER TABLE user_menu_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_menu_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_menu_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_menu_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

### 3. 프리셋 정의

**`src/config/menuPresets.ts` (새 파일)**
```typescript
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
```

---

### 4. 동적 메뉴 컴포넌트

**`src/components/layout/DynamicNav.tsx` (새 파일)**
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserMenuSettings } from "@/hooks/useUserMenuSettings";
import { MENU_MODULES } from "@/config/menuModules";

export function DynamicNav() {
  const pathname = usePathname();
  const { enabledModules, menuOrder } = useUserMenuSettings();

  // 활성화된 메뉴만 필터링
  const activeModules = MENU_MODULES.filter((module) =>
    enabledModules.includes(module.id)
  );

  // 사용자 지정 순서 적용
  const sortedModules = [...activeModules].sort((a, b) => {
    const aIndex = menuOrder.indexOf(a.id);
    const bIndex = menuOrder.indexOf(b.id);
    if (aIndex === -1 && bIndex === -1) return a.order - b.order;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <nav aria-label="주요 메뉴">
      <ul className="flex items-center gap-1">
        {sortedModules.map((module) => {
          const isActive = pathname.startsWith(module.path);
          return (
            <li key={module.id}>
              <Link
                href={module.path}
                className={`rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    : "text-black/70 hover:bg-black/5 hover:text-[var(--color-text)]"
                }`}
                title={module.description}
              >
                <span className="mr-1">{module.icon}</span>
                {module.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

---

### 5. 메뉴 설정 페이지

**`src/app/settings/menu/page.tsx` (새 파일)**
```tsx
"use client";

import { useState } from "react";
import { useUserMenuSettings } from "@/hooks/useUserMenuSettings";
import { MENU_MODULES } from "@/config/menuModules";
import { MENU_PRESETS } from "@/config/menuPresets";
import { Button } from "@/components/shared/Button";
import { Select } from "@/components/shared/Select";

export default function MenuSettingsPage() {
  const {
    enabledModules,
    menuOrder,
    roleMode,
    ageInMonths,
    preset,
    updateSettings,
  } = useUserMenuSettings();

  const [selectedPreset, setSelectedPreset] = useState(preset || "custom");
  const [selectedModules, setSelectedModules] = useState<string[]>(enabledModules);

  // 프리셋 적용
  function applyPreset(presetId: string) {
    const preset = MENU_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPreset(presetId);
    setSelectedModules(preset.enabledModules);
  }

  // 저장
  async function handleSave() {
    await updateSettings({
      enabledModules: selectedModules,
      preset: selectedPreset,
      roleMode: preset === "custom" ? roleMode : MENU_PRESETS.find((p) => p.id === selectedPreset)?.roleMode || "parent",
    });
  }

  // 카테고리별 그룹화
  const modulesByCategory = MENU_MODULES.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, typeof MENU_MODULES>);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-semibold mb-6">메뉴 설정</h1>

      {/* 프리셋 선택 */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">빠른 설정</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {MENU_PRESETS.filter((p) => p.id !== "custom").map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className={`p-4 rounded-lg border-2 text-left transition ${
                selectedPreset === p.id
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                  : "border-black/10 hover:border-[var(--color-primary)]/30"
              }`}
            >
              <h3 className="font-semibold mb-1">{p.label}</h3>
              <p className="text-xs text-black/60">{p.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* 직접 선택 */}
      <section>
        <h2 className="text-lg font-semibold mb-4">메뉴 직접 선택</h2>
        
        {Object.entries(modulesByCategory).map(([category, modules]) => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-semibold mb-3 capitalize">{category}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {modules.map((module) => {
                const isEnabled = selectedModules.includes(module.id);
                return (
                  <label
                    key={module.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                      isEnabled
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "border-black/10 hover:border-black/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedModules([...selectedModules, module.id]);
                        } else {
                          setSelectedModules(selectedModules.filter((id) => id !== module.id));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{module.icon}</span>
                        <span className="font-medium text-sm">{module.label}</span>
                      </div>
                      <p className="text-xs text-black/60 mt-1">{module.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <div className="mt-8 flex justify-end gap-3">
        <Button variant="secondary" onClick={() => applyPreset(selectedPreset)}>
          초기화
        </Button>
        <Button onClick={handleSave}>저장</Button>
      </div>
    </main>
  );
}
```

---

### 6. Hook 구현

**`src/hooks/useUserMenuSettings.ts` (새 파일)**
```tsx
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { MENU_PRESETS } from "@/config/menuPresets";

type UserMenuSettings = {
  enabledModules: string[];
  menuOrder: string[];
  roleMode: "parent" | "child" | "both";
  ageInMonths?: number;
  preset: string;
};

export function useUserMenuSettings() {
  const { user } = useUser();
  const [settings, setSettings] = useState<UserMenuSettings>({
    enabledModules: ["photos", "diary"], // 기본값
    menuOrder: [],
    roleMode: "parent",
    preset: "custom",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // DB에서 설정 불러오기
    fetch(`/api/user/menu-settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings(data.settings);
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function updateSettings(updates: Partial<UserMenuSettings>) {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    await fetch(`/api/user/menu-settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSettings),
    });
  }

  return {
    ...settings,
    loading,
    updateSettings,
  };
}
```

---

## 🎯 사용자 플로우

### 초기 설정
1. 회원가입 후 `/settings/menu` 접속
2. 아이 나이 입력
3. 프리셋 선택 또는 직접 선택
4. 저장

### 메뉴 표시
- 선택한 메뉴만 헤더에 표시
- 사용자 지정 순서 적용
- 역할 모드에 따라 다른 메뉴 표시

### 나중에 변경
- 설정 페이지에서 언제든 변경
- 프리셋 재적용 가능
- 개별 메뉴 on/off

---

## 📋 구현 체크리스트

### Phase 1: 기본 구조 ✅ 완료
- [x] 메뉴 모듈 정의 (`menuModules.ts`)
- [x] 프리셋 정의 (`menuPresets.ts`)
- [x] DB 스키마 생성 (`user_menu_settings`)
- [x] API 라우트 생성 (`/api/user/menu-settings`)

### Phase 2: UI 구현 ✅ 완료
- [x] 동적 네비게이션 컴포넌트 (`DynamicNav`)
- [x] 메뉴 설정 페이지 (`/settings/menu`)
- [x] Hook 구현 (`useUserMenuSettings`)

### Phase 3: 각 모듈 상세 페이지 구현 🚀 다음 단계
**현재 완성:** ✅ 사진첩, ✅ 일기장

**구현 필요:**
- [x] 타임라인 모듈 (`/timeline`)
- [x] 통계 모듈 (`/stats`)
- [ ] 작품 모음 모듈 (`/artworks`)
- [ ] 상장/인증서 모듈 (`/awards`)
- [ ] 성장 기록 모듈 (`/growth`)
- [ ] 수면 기록 모듈 (`/sleep`)
- [ ] 수유 기록 모듈 (`/feeding`)
- [ ] 건강 기록 모듈 (`/health`)
- [ ] 독서 기록 모듈 (`/books`)
- [ ] 활동 기록 모듈 (`/activities`)
- [ ] 포트폴리오 모듈 (`/portfolio`)
- [ ] 공유 앨범 모듈 (`/shared`)
- [ ] 아이용 뷰 모듈 (`/kids`)

**자세한 우선순위는 `IMPLEMENTATION_PRIORITY.md` 참고**

### Phase 4: 기능 추가
- [ ] 나이 기반 자동 추천 (이미 구현됨)
- [ ] 메뉴 순서 드래그 앤 드롭
- [ ] 역할 모드 전환

---

## 💡 추가 아이디어

### 스마트 추천
- 아이 나이 입력 시 자동으로 적합한 프리셋 추천
- "이 나이에는 이런 메뉴를 많이 사용해요" 안내

### 메뉴 순서 커스터마이즈
- 드래그 앤 드롭으로 순서 변경
- 자주 쓰는 메뉴를 위로

### 역할 전환
- 부모 모드 ↔ 아이 모드 전환 버튼
- 각각 다른 메뉴 표시

---

어떤 것부터 시작할까요?
