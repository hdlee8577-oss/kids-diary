"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/Site.config";
import { Button } from "@/components/shared/Button";

// 타입 정의
type PhotoItem = {
  id: string;
  title: string;
  image_url: string;
  taken_at: string | null;
  thumb_pos_x: number | null;
  thumb_pos_y: number | null;
  created_at: string;
};

type DiaryItem = {
  id: string;
  title: string;
  content: string;
  entry_date: string;
  created_at: string;
};

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

type GroupedTimeline = {
  date: string; // "2024-01-15"
  displayDate: string; // "2024년 1월 15일"
  items: TimelineItem[];
};

type FilterType = "all" | "photo" | "diary";

// 유틸리티 함수
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// 데이터 가져오기
async function fetchPhotos(siteId: string): Promise<PhotoItem[]> {
  const res = await fetch(`/api/photos?siteId=${encodeURIComponent(siteId)}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { items: PhotoItem[] };
  return data.items ?? [];
}

async function fetchDiary(siteId: string): Promise<DiaryItem[]> {
  const res = await fetch(`/api/diary?siteId=${encodeURIComponent(siteId)}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { items: DiaryItem[] };
  return data.items ?? [];
}

// 타임라인 데이터 통합
async function fetchTimelineData(siteId: string): Promise<TimelineItem[]> {
  // 1. Photos와 Diary 데이터를 병렬로 가져오기
  const [photos, diary] = await Promise.all([
    fetchPhotos(siteId),
    fetchDiary(siteId),
  ]);

  // 2. Photos를 TimelineItem으로 변환
  const photoItems: TimelineItem[] = photos.map((photo) => {
    const date = photo.taken_at || photo.created_at;
    return {
      id: photo.id,
      type: "photo" as const,
      date,
      displayDate: formatDate(date),
      title: photo.title || "사진",
      imageUrl: photo.image_url,
      thumbnail:
        photo.thumb_pos_x && photo.thumb_pos_y
          ? { posX: photo.thumb_pos_x, posY: photo.thumb_pos_y }
          : undefined,
      createdAt: photo.created_at,
      link: `/photos/${photo.id}`,
    };
  });

  // 3. Diary를 TimelineItem으로 변환
  const diaryItems: TimelineItem[] = diary.map((diaryItem) => {
    const date = diaryItem.entry_date || diaryItem.created_at;
    return {
      id: diaryItem.id,
      type: "diary" as const,
      date,
      displayDate: formatDate(date),
      title: diaryItem.title || "일기",
      content: diaryItem.content,
      preview: diaryItem.content ? truncateText(diaryItem.content, 100) : undefined,
      createdAt: diaryItem.created_at,
      link: `/diary/${diaryItem.id}`,
    };
  });

  // 4. 통합 및 정렬
  const allItems = [...photoItems, ...diaryItems];
  return allItems.sort((a, b) => {
    // 날짜 기준 내림차순 (최신순)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

// 날짜별 그룹화
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
      items: items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// 필터링
function filterItems(items: TimelineItem[], filter: FilterType): TimelineItem[] {
  if (filter === "all") return items;
  return items.filter((item) => item.type === filter);
}

// 카드 컴포넌트
function PhotoCard({ item }: { item: TimelineItem }) {
  return (
    <Link href={item.link} className="block">
      <article className="group relative overflow-hidden rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)] shadow-sm transition hover:shadow-md">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={item.imageUrl!}
            alt={item.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            style={{
              objectPosition: item.thumbnail
                ? `${item.thumbnail.posX}% ${item.thumbnail.posY}%`
                : "center",
            }}
          />
        </div>
        <div className="p-3">
          <h3 className="truncate text-sm font-medium text-[var(--color-text)]">
            {item.title}
          </h3>
        </div>
      </article>
    </Link>
  );
}

function DiaryCard({ item }: { item: TimelineItem }) {
  return (
    <Link href={item.link} className="block">
      <article className="group rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)] p-4 shadow-sm transition hover:shadow-md">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-xl">
            📝
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium text-[var(--color-text)]">
              {item.title}
            </h3>
            {item.preview && (
              <p className="mt-1 line-clamp-2 text-xs text-black/60">
                {item.preview}
              </p>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

// 필터 버튼
function FilterButtons({
  filter,
  onFilterChange,
}: {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant={filter === "all" ? "primary" : "secondary"}
        onClick={() => onFilterChange("all")}
      >
        전체
      </Button>
      <Button
        type="button"
        variant={filter === "photo" ? "primary" : "secondary"}
        onClick={() => onFilterChange("photo")}
      >
        📸 사진
      </Button>
      <Button
        type="button"
        variant={filter === "diary" ? "primary" : "secondary"}
        onClick={() => onFilterChange("diary")}
      >
        📝 일기
      </Button>
    </div>
  );
}

// 날짜 그룹
function DateGroup({ group }: { group: GroupedTimeline }) {
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">
          {group.displayDate}
        </h2>
        <span className="text-sm text-black/50">({group.items.length}개)</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {group.items.map((item) =>
          item.type === "photo" ? (
            <PhotoCard key={item.id} item={item} />
          ) : (
            <DiaryCard key={item.id} item={item} />
          )
        )}
      </div>
    </section>
  );
}

// 메인 컴포넌트
export default function TimelinePage() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const siteId = siteConfig.siteId;

  // 데이터 가져오기
  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      const data = await fetchTimelineData(siteId);
      if (!alive) return;
      setItems(data);
      setIsLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [siteId]);

  // 필터링 적용
  const filteredItems = useMemo(() => filterItems(items, filter), [items, filter]);

  // 날짜별 그룹화
  const groupedItems = useMemo(() => groupByDate(filteredItems), [filteredItems]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
          타임라인
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-black/70">
          사진과 일기를 시간순으로 모아봐요
        </p>
      </div>

      {/* 필터 버튼 */}
      <div className="mb-8">
        <FilterButtons filter={filter} onFilterChange={setFilter} />
      </div>

      {/* 타임라인 그룹 */}
      {isLoading ? (
        <p className="mt-3 text-sm text-black/60">불러오는 중…</p>
      ) : groupedItems.length === 0 ? (
        <div className="mt-8 rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/70 p-8 text-center">
          <p className="text-sm text-black/60">
            {filter === "all"
              ? "아직 기록이 없어요."
              : filter === "photo"
                ? "아직 사진이 없어요."
                : "아직 일기가 없어요."}
          </p>
        </div>
      ) : (
        <div>
          {groupedItems.map((group) => (
            <DateGroup key={group.date} group={group} />
          ))}
        </div>
      )}
    </main>
  );
}
