# 타임라인 모듈 구현 예상안

## 📋 개요

기존 `photos`와 `diary` 데이터를 시간순으로 통합하여 표시하는 타임라인 페이지를 구현합니다.

**특징:**
- ✅ DB 스키마 불필요 (기존 데이터 활용)
- ✅ API 불필요 (기존 API 재사용)
- ✅ 빠른 구현 (1-2일)
- ✅ 사용자 경험 향상 (모든 기록을 한눈에)

---

## 🎯 기능 요구사항

### 1. 데이터 통합
- Photos와 Diary 데이터를 하나의 타임라인으로 통합
- 날짜 기준으로 내림차순 정렬 (최신순)
- 각 아이템에 타입 표시 (사진/일기)

### 2. 날짜별 그룹화
- 같은 날짜의 아이템들을 그룹으로 묶어 표시
- 날짜 헤더 표시 (예: "2024년 1월 15일")
- 날짜별 아이템 개수 표시

### 3. 필터링
- 전체 보기
- 사진만 보기
- 일기만 보기

### 4. UI/UX
- 카드형 레이아웃
- 각 아이템 클릭 시 상세 페이지로 이동
- 무한 스크롤 또는 페이지네이션 (선택)
- 로딩 상태 표시

---

## 📁 파일 구조

```
src/app/timeline/
  └── page.tsx          # 타임라인 메인 페이지
```

**필요한 파일:**
- `/app/timeline/page.tsx` (새로 생성)

**재사용하는 파일:**
- `/app/api/photos/route.ts` (GET)
- `/app/api/diary/route.ts` (GET)
- `/app/photos/[id]/page.tsx` (상세 페이지 링크)
- `/app/diary/[id]/page.tsx` (상세 페이지 링크)

---

## 🔧 구현 상세

### 1. 타입 정의

```typescript
// 타임라인 아이템 타입
type TimelineItem = {
  id: string;
  type: "photo" | "diary";
  date: string; // ISO date string (정렬용)
  displayDate: string; // 표시용 날짜 (예: "2024-01-15")
  title: string;
  // Photo 전용
  imageUrl?: string;
  thumbnail?: {
    posX: number;
    posY: number;
  };
  // Diary 전용
  content?: string;
  preview?: string; // 일기 미리보기 (첫 100자)
  // 공통
  createdAt: string;
  link: string; // 상세 페이지 링크
};
```

### 2. 데이터 가져오기 및 통합

```typescript
async function fetchTimelineData(siteId: string): Promise<TimelineItem[]> {
  // 1. Photos와 Diary 데이터를 병렬로 가져오기
  const [photosRes, diaryRes] = await Promise.all([
    fetch(`/api/photos?siteId=${encodeURIComponent(siteId)}`),
    fetch(`/api/diary?siteId=${encodeURIComponent(siteId)}`),
  ]);

  const photosData = (await photosRes.json()) as { items: PhotoItem[] };
  const diaryData = (await diaryRes.json()) as { items: DiaryItem[] };

  // 2. Photos를 TimelineItem으로 변환
  const photoItems: TimelineItem[] = (photosData.items || []).map((photo) => ({
    id: photo.id,
    type: "photo" as const,
    date: photo.taken_at || photo.created_at, // taken_at 우선, 없으면 created_at
    displayDate: formatDate(photo.taken_at || photo.created_at),
    title: photo.title || "사진",
    imageUrl: photo.image_url,
    thumbnail: photo.thumb_pos_x && photo.thumb_pos_y
      ? { posX: photo.thumb_pos_x, posY: photo.thumb_pos_y }
      : undefined,
    createdAt: photo.created_at,
    link: `/photos/${photo.id}`,
  }));

  // 3. Diary를 TimelineItem으로 변환
  const diaryItems: TimelineItem[] = (diaryData.items || []).map((diary) => ({
    id: diary.id,
    type: "diary" as const,
    date: diary.entry_date || diary.created_at, // entry_date 우선, 없으면 created_at
    displayDate: formatDate(diary.entry_date || diary.created_at),
    title: diary.title || "일기",
    content: diary.content,
    preview: diary.content ? truncateText(diary.content, 100) : undefined,
    createdAt: diary.created_at,
    link: `/diary/${diary.id}`,
  }));

  // 4. 통합 및 정렬
  const allItems = [...photoItems, ...diaryItems];
  return allItems.sort((a, b) => {
    // 날짜 기준 내림차순 (최신순)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}
```

### 3. 날짜별 그룹화

```typescript
type GroupedTimeline = {
  date: string; // "2024-01-15"
  displayDate: string; // "2024년 1월 15일"
  items: TimelineItem[];
};

function groupByDate(items: TimelineItem[]): GroupedTimeline[] {
  const groups = new Map<string, TimelineItem[]>();

  items.forEach((item) => {
    const dateKey = item.displayDate; // "2024-01-15"
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(item);
  });

  // Map을 배열로 변환하고 날짜순 정렬
  return Array.from(groups.entries())
    .map(([dateKey, items]) => ({
      date: dateKey,
      displayDate: formatDisplayDate(dateKey), // "2024년 1월 15일"
      items: items.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
```

### 4. 유틸리티 함수

```typescript
// 날짜 포맷팅 (ISO → "2024-01-15")
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

// 표시용 날짜 포맷팅 ("2024-01-15" → "2024년 1월 15일")
function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

// 텍스트 자르기 (미리보기용)
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
```

### 5. 필터링 로직

```typescript
type FilterType = "all" | "photo" | "diary";

function filterItems(
  items: TimelineItem[],
  filter: FilterType
): TimelineItem[] {
  if (filter === "all") return items;
  return items.filter((item) => item.type === filter);
}
```

### 6. UI 컴포넌트 구조

```tsx
export default function TimelinePage() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const siteId = siteConfig.siteId;

  // 데이터 가져오기
  useEffect(() => {
    fetchTimelineData(siteId).then((data) => {
      setItems(data);
      setIsLoading(false);
    });
  }, [siteId]);

  // 필터링 적용
  const filteredItems = useMemo(
    () => filterItems(items, filter),
    [items, filter]
  );

  // 날짜별 그룹화
  const groupedItems = useMemo(
    () => groupByDate(filteredItems),
    [filteredItems]
  );

  return (
    <main>
      {/* 필터 버튼 */}
      <FilterButtons filter={filter} onFilterChange={setFilter} />

      {/* 타임라인 그룹 */}
      {groupedItems.map((group) => (
        <DateGroup key={group.date} group={group} />
      ))}
    </main>
  );
}
```

### 7. 카드 컴포넌트

```tsx
// 사진 카드
function PhotoCard({ item }: { item: TimelineItem }) {
  return (
    <Link href={item.link}>
      <article className="card">
        <div className="image-container">
          <Image
            src={item.imageUrl!}
            alt={item.title}
            fill
            style={{
              objectPosition: item.thumbnail
                ? `${item.thumbnail.posX}% ${item.thumbnail.posY}%`
                : "center",
            }}
          />
        </div>
        <div className="content">
          <h3>{item.title}</h3>
          <time>{item.displayDate}</time>
        </div>
      </article>
    </Link>
  );
}

// 일기 카드
function DiaryCard({ item }: { item: TimelineItem }) {
  return (
    <Link href={item.link}>
      <article className="card">
        <div className="icon">📝</div>
        <div className="content">
          <h3>{item.title}</h3>
          {item.preview && <p>{item.preview}</p>}
          <time>{item.displayDate}</time>
        </div>
      </article>
    </Link>
  );
}
```

---

## 🎨 UI 디자인

### 레이아웃
```
┌─────────────────────────────────────┐
│  [전체] [사진] [일기]  (필터 버튼)   │
├─────────────────────────────────────┤
│  📅 2024년 1월 15일 (3개)            │
│  ┌─────┐  ┌─────┐  ┌─────┐          │
│  │사진 │  │일기 │  │사진 │          │
│  └─────┘  └─────┘  └─────┘          │
├─────────────────────────────────────┤
│  📅 2024년 1월 14일 (2개)            │
│  ┌─────┐  ┌─────┐                   │
│  │일기 │  │사진 │                   │
│  └─────┘  └─────┘                   │
└─────────────────────────────────────┘
```

### 스타일링
- 날짜 헤더: 큰 글씨, 회색 배경
- 카드: 둥근 모서리, 그림자, 호버 효과
- 사진 카드: 썸네일 이미지 표시
- 일기 카드: 아이콘 + 제목 + 미리보기

---

## 📝 구현 단계

### Step 1: 기본 페이지 생성
1. `/app/timeline/page.tsx` 파일 생성
2. 기본 레이아웃 구조 작성
3. 데이터 가져오기 함수 구현

### Step 2: 데이터 통합
1. Photos와 Diary API 호출
2. 타입 변환 로직 구현
3. 날짜 기준 정렬

### Step 3: 날짜별 그룹화
1. 그룹화 함수 구현
2. 날짜 헤더 표시
3. 그룹 내 아이템 정렬

### Step 4: 필터링
1. 필터 버튼 UI
2. 필터링 로직 구현
3. 상태 관리

### Step 5: 카드 컴포넌트
1. PhotoCard 컴포넌트
2. DiaryCard 컴포넌트
3. 공통 스타일링

### Step 6: 최적화 및 개선
1. 로딩 상태 개선
2. 에러 처리
3. 빈 상태 처리

---

## ⚠️ 주의사항

### 1. 날짜 처리
- Photos: `taken_at` 우선, 없으면 `created_at`
- Diary: `entry_date` 우선, 없으면 `created_at`
- 타임존 고려 (모두 UTC 기준)

### 2. 성능
- 초기 로딩 시 모든 데이터를 가져오므로, 데이터가 많으면 페이지네이션 고려
- 현재는 limit 100 (photos), 200 (diary)로 제한됨

### 3. 이미지 최적화
- Next.js Image 컴포넌트 사용
- 썸네일 포지셔닝 적용

### 4. 링크 처리
- 사진: `/photos/[id]`
- 일기: `/diary/[id]`
- 새 탭에서 열지 않고 같은 페이지에서 이동

---

## 🚀 예상 소요 시간

- **기본 구현**: 2-3시간
- **스타일링 및 개선**: 1-2시간
- **테스트 및 버그 수정**: 1시간

**총 예상 시간: 4-6시간 (반나절)**

---

## 📦 필요한 패키지

기존 프로젝트에 이미 포함된 것들만 사용:
- ✅ Next.js (이미 설치됨)
- ✅ React (이미 설치됨)
- ✅ Tailwind CSS (이미 설치됨)
- ✅ next/image (이미 사용 중)

**추가 패키지 불필요!**

---

## 🎯 다음 단계

구현이 완료되면:
1. 메뉴 설정에서 "타임라인" 메뉴 활성화
2. 테스트 (사진/일기 데이터가 있는지 확인)
3. 사용자 피드백 수집
4. 필요시 개선 (무한 스크롤, 검색 등)

---

## 💡 향후 개선 아이디어

1. **무한 스크롤**: 데이터가 많을 때 성능 개선
2. **검색 기능**: 제목/내용으로 검색
3. **기간 필터**: 특정 기간만 보기
4. **통계 표시**: 총 사진 수, 일기 수
5. **다른 모듈 통합**: 작품 모음, 상장 등이 추가되면 함께 표시
