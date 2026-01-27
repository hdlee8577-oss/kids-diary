# 구현 가이드: Pathfinder Kids 기능 추가

## 🎯 즉시 시작 가능한 작업 (우선순위 순)

---

## 1️⃣ DB 스키마 확장 (가장 먼저!)

### 마이그레이션 SQL 파일 생성

**파일:** `docs/supabase-migration-v2.sql`

```sql
-- photos 테이블 확장
ALTER TABLE photos 
ADD COLUMN IF NOT EXISTS grade TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS mom_note TEXT,
ADD COLUMN IF NOT EXISTS ocr_text TEXT;

-- diary_entries 테이블 확장
ALTER TABLE diary_entries
ADD COLUMN IF NOT EXISTS grade TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS mom_note TEXT,
ADD COLUMN IF NOT EXISTS ocr_text TEXT;

-- 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_photos_grade ON photos(grade);
CREATE INDEX IF NOT EXISTS idx_photos_category ON photos(category);
CREATE INDEX IF NOT EXISTS idx_photos_tags ON photos USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_diary_grade ON diary_entries(grade);
CREATE INDEX IF NOT EXISTS idx_diary_category ON diary_entries(category);
CREATE INDEX IF NOT EXISTS idx_diary_tags ON diary_entries USING GIN(tags);

-- 공유 링크 테이블 생성
CREATE TABLE IF NOT EXISTS share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('photo', 'diary', 'album')),
  item_id UUID NOT NULL,
  token TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(token);
CREATE INDEX IF NOT EXISTS idx_share_links_site_id ON share_links(site_id);
```

---

## 2️⃣ 타입 정의 업데이트

### `src/Site.config.ts` 수정

```typescript
// 추가할 타입들
export type Grade = 
  | "Pre-K" 
  | "K" 
  | "1st" 
  | "2nd" 
  | "3rd" 
  | "4th" 
  | "5th" 
  | "6th" 
  | "7th" 
  | "8th" 
  | "9th" 
  | "10th" 
  | "11th" 
  | "12th";

export type Category = 
  | "STEM" 
  | "Art" 
  | "Sports" 
  | "Writing" 
  | "Music" 
  | "Other";

// PhotoItem 타입 확장
export type PhotoItem = {
  id: string;
  title: string;
  image_url: string;
  taken_at: string | null;
  thumb_pos_x: number | null;
  thumb_pos_y: number | null;
  created_at: string;
  // 새 필드들
  grade?: Grade;
  category?: Category;
  tags?: string[];
  mom_note?: string;
  ocr_text?: string;
};

// DiaryItem 타입 확장
export type DiaryItem = {
  id: string;
  title: string;
  content: string;
  entry_date: string;
  created_at: string;
  // 새 필드들
  grade?: Grade;
  category?: Category;
  tags?: string[];
  mom_note?: string;
  ocr_text?: string;
};
```

---

## 3️⃣ 업로드 폼 개선

### `src/app/photos/page.tsx` 수정

**추가할 state:**
```typescript
const [grade, setGrade] = useState<Grade | "">("");
const [category, setCategory] = useState<Category | "">("");
const [tags, setTags] = useState<string[]>([]);
const [tagInput, setTagInput] = useState("");
const [momNote, setMomNote] = useState("");
```

**추가할 UI 컴포넌트:**
```tsx
<Field label="학년">
  <Select
    value={grade}
    onChange={(e) => setGrade(e.currentTarget.value as Grade)}
  >
    <option value="">선택 안함</option>
    <option value="Pre-K">Pre-K</option>
    <option value="K">K</option>
    <option value="1st">1학년</option>
    <option value="2nd">2학년</option>
    {/* ... 12th까지 */}
  </Select>
</Field>

<Field label="분야">
  <div className="grid grid-cols-3 gap-2">
    {["STEM", "Art", "Sports", "Writing", "Music", "Other"].map((cat) => (
      <Button
        key={cat}
        type="button"
        variant={category === cat ? "primary" : "secondary"}
        onClick={() => setCategory(cat as Category)}
      >
        {cat}
      </Button>
    ))}
  </div>
</Field>

<Field label="태그">
  <div className="flex flex-wrap gap-2 mb-2">
    {tags.map((tag, i) => (
      <span
        key={i}
        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--color-primary)]/10 text-sm"
      >
        {tag}
        <button
          type="button"
          onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
          className="text-[var(--color-primary)]"
        >
          ×
        </button>
      </span>
    ))}
  </div>
  <Input
    value={tagInput}
    onChange={(e) => setTagInput(e.currentTarget.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter" && tagInput.trim()) {
        e.preventDefault();
        setTags([...tags, tagInput.trim()]);
        setTagInput("");
      }
    }}
    placeholder="태그 입력 후 Enter"
  />
</Field>

<Field label="엄마의 한마디">
  <Textarea
    value={momNote}
    onChange={(e) => setMomNote(e.currentTarget.value)}
    placeholder="이 작품에 대한 특별한 기억이나 코멘트를 남겨주세요..."
    rows={3}
  />
</Field>
```

**업로드 시 데이터 포함:**
```typescript
fd.set("grade", grade);
fd.set("category", category);
fd.set("tags", JSON.stringify(tags));
fd.set("momNote", momNote);
```

---

## 4️⃣ API 라우트 업데이트

### `src/app/api/photos/route.ts` 수정

**GET 요청:**
```typescript
// 필터링 파라미터 추가
const grade = searchParams.get("grade");
const category = searchParams.get("category");
const tag = searchParams.get("tag");

let query = supabase
  .from(siteConfig.data.photos.table)
  .select("id, site_id, title, image_url, taken_at, thumb_pos_x, thumb_pos_y, grade, category, tags, mom_note, created_at")
  .eq("site_id", siteId);

if (grade) query = query.eq("grade", grade);
if (category) query = query.eq("category", category);
if (tag) query = query.contains("tags", [tag]);
```

**POST 요청:**
```typescript
const grade = fd.get("grade")?.toString();
const category = fd.get("category")?.toString();
const tags = JSON.parse(fd.get("tags")?.toString() || "[]");
const momNote = fd.get("momNote")?.toString();

// DB 저장 시 포함
const { data, error } = await supabase
  .from(siteConfig.data.photos.table)
  .insert({
    site_id: siteId,
    title: title || "",
    image_path: filePath,
    image_url: publicUrl,
    taken_at: takenAt || null,
    grade: grade || null,
    category: category || null,
    tags: tags,
    mom_note: momNote || null,
  });
```

---

## 5️⃣ 필터링 UI 추가

### `src/components/photos/FilterSidebar.tsx` (새 파일)

```tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Select } from "@/components/shared/Select";
import type { Grade, Category } from "@/Site.config";

const GRADES: Grade[] = ["Pre-K", "K", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
const CATEGORIES: Category[] = ["STEM", "Art", "Sports", "Writing", "Music", "Other"];

export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentGrade = searchParams.get("grade") || "";
  const currentCategory = searchParams.get("category") || "";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/photos?${params.toString()}`);
  }

  return (
    <aside className="w-64 border-r border-black/10 p-4">
      <h3 className="text-sm font-semibold mb-4">필터</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium mb-2 block">학년</label>
          <Select
            value={currentGrade}
            onChange={(e) => updateFilter("grade", e.currentTarget.value)}
          >
            <option value="">전체</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium mb-2 block">분야</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                type="button"
                variant={currentCategory === cat ? "primary" : "secondary"}
                onClick={() => updateFilter("category", currentCategory === cat ? "" : cat)}
                className="text-xs"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/photos")}
          className="w-full text-xs"
        >
          필터 초기화
        </Button>
      </div>
    </aside>
  );
}
```

---

## 6️⃣ 검색 기능 추가

### `src/components/shared/SearchBar.tsx` (새 파일)

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/shared/Input";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex-1 max-w-md">
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        placeholder="작품, 일기, 태그 검색..."
        className="w-full"
      />
    </form>
  );
}
```

### `src/app/api/search/route.ts` (새 파일)

```typescript
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { siteConfig } from "@/Site.config";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const siteId = searchParams.get("siteId") || siteConfig.siteId;

  if (!query) {
    return NextResponse.json({ items: [] });
  }

  const supabase = getSupabaseAdmin();

  // 사진 검색
  const { data: photos } = await supabase
    .from(siteConfig.data.photos.table)
    .select("*")
    .eq("site_id", siteId)
    .or(`title.ilike.%${query}%,mom_note.ilike.%${query}%,ocr_text.ilike.%${query}%`)
    .limit(20);

  // 일기 검색
  const { data: diary } = await supabase
    .from(siteConfig.data.diary.table)
    .select("*")
    .eq("site_id", siteId)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,mom_note.ilike.%${query}%,ocr_text.ilike.%${query}%`)
    .limit(20);

  return NextResponse.json({
    photos: photos || [],
    diary: diary || [],
  });
}
```

---

## 7️⃣ 상세 페이지에 Mom's Note 추가

### `src/app/photos/[id]/page.tsx` 수정

```tsx
{photo.mom_note && (
  <div className="mt-6 p-4 rounded-[var(--radius)] bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20">
    <h3 className="text-sm font-semibold mb-2">💝 엄마의 한마디</h3>
    <p className="text-sm text-[var(--color-text)]/80 whitespace-pre-wrap">
      {photo.mom_note}
    </p>
  </div>
)}
```

---

## 📋 체크리스트

### Phase 1 (즉시 시작)
- [ ] DB 마이그레이션 SQL 실행
- [ ] 타입 정의 업데이트
- [ ] 업로드 폼에 새 필드 추가
- [ ] API 라우트 업데이트
- [ ] 필터링 UI 추가
- [ ] 검색 기능 추가

### Phase 2 (다음 단계)
- [ ] 성장 타임라인 비교 페이지
- [ ] OCR 기능 통합
- [ ] PDF 내보내기
- [ ] 공유 기능

---

## 🚀 다음 명령어로 시작

1. **DB 마이그레이션:**
   ```bash
   # Supabase Dashboard → SQL Editor에서 실행
   # docs/supabase-migration-v2.sql 파일 내용 복사
   ```

2. **타입 업데이트:**
   ```bash
   # src/Site.config.ts 수정
   ```

3. **컴포넌트 생성:**
   ```bash
   # 위의 코드를 참고하여 파일 생성
   ```

어떤 것부터 시작할까요?
