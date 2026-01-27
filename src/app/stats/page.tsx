"use client";

import { useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/Site.config";

type PhotoItem = {
  id: string;
  created_at: string;
  taken_at: string | null;
};

type DiaryItem = {
  id: string;
  created_at: string;
  entry_date: string;
};

type StatsSummary = {
  totalPhotos: number;
  totalDiary: number;
  photosLast30Days: number;
  diaryLast30Days: number;
};

type MonthlyPoint = {
  month: string; // YYYY-MM
  photos: number;
  diary: number;
};

async function fetchPhotos(siteId: string): Promise<PhotoItem[]> {
  const res = await fetch(`/api/photos?siteId=${encodeURIComponent(siteId)}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { items: any[] };
  return (
    data.items?.map((p) => ({
      id: p.id as string,
      created_at: p.created_at as string,
      taken_at: (p.taken_at as string | null) ?? null,
    })) ?? []
  );
}

async function fetchDiary(siteId: string): Promise<DiaryItem[]> {
  const res = await fetch(`/api/diary?siteId=${encodeURIComponent(siteId)}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { items: any[] };
  return (
    data.items?.map((d) => ({
      id: d.id as string,
      created_at: d.created_at as string,
      entry_date: d.entry_date as string,
    })) ?? []
  );
}

function getStatsSummary(photos: PhotoItem[], diary: DiaryItem[]): StatsSummary {
  const now = new Date();
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const photosLast30Days = photos.filter((p) => {
    const date = new Date(p.taken_at || p.created_at);
    return date >= last30 && date <= now;
  }).length;

  const diaryLast30Days = diary.filter((d) => {
    const date = new Date(d.entry_date || d.created_at);
    return date >= last30 && date <= now;
  }).length;

  return {
    totalPhotos: photos.length,
    totalDiary: diary.length,
    photosLast30Days,
    diaryLast30Days,
  };
}

function getMonthlyPoints(photos: PhotoItem[], diary: DiaryItem[]): MonthlyPoint[] {
  const map = new Map<string, { photos: number; diary: number }>();

  const add = (month: string, key: "photos" | "diary") => {
    const current = map.get(month) ?? { photos: 0, diary: 0 };
    current[key] += 1;
    map.set(month, current);
  };

  photos.forEach((p) => {
    const date = new Date(p.taken_at || p.created_at);
    if (Number.isNaN(date.getTime())) return;
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    add(month, "photos");
  });

  diary.forEach((d) => {
    const date = new Date(d.entry_date || d.created_at);
    if (Number.isNaN(date.getTime())) return;
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    add(month, "diary");
  });

  return Array.from(map.entries())
    .map(([month, value]) => ({
      month,
      photos: value.photos,
      diary: value.diary,
    }))
    .sort((a, b) => (a.month < b.month ? -1 : 1));
}

export default function StatsPage() {
  const siteId = siteConfig.siteId;
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [diary, setDiary] = useState<DiaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [p, d] = await Promise.all([fetchPhotos(siteId), fetchDiary(siteId)]);
        if (!alive) return;
        setPhotos(p);
        setDiary(d);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "통계를 불러오지 못했어요.");
      } finally {
        if (alive) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [siteId]);

  const summary = useMemo(() => getStatsSummary(photos, diary), [photos, diary]);
  const monthly = useMemo(() => getMonthlyPoints(photos, diary), [photos, diary]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
          통계
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-black/70">
          지금까지 기록한 사진과 일기를 한눈에 볼 수 있는 간단한 통계예요.
        </p>
      </header>

      {error && (
        <div className="mb-6 rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="mt-3 text-sm text-black/60">불러오는 중…</p>
      ) : (
        <>
          {/* 요약 카드 */}
          <section className="mb-10 grid gap-4 rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/80 p-4 sm:grid-cols-2">
            <div className="rounded-[var(--radius)] bg-white/70 p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-black/50">
                전체 사진
              </p>
              <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
                {summary.totalPhotos.toLocaleString()}장
              </p>
              <p className="mt-1 text-xs text-black/50">
                최근 30일:{" "}
                <span className="font-semibold text-[var(--color-text)]">
                  {summary.photosLast30Days.toLocaleString()}장
                </span>
              </p>
            </div>

            <div className="rounded-[var(--radius)] bg-white/70 p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-black/50">
                전체 일기
              </p>
              <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
                {summary.totalDiary.toLocaleString()}편
              </p>
              <p className="mt-1 text-xs text-black/50">
                최근 30일:{" "}
                <span className="font-semibold text-[var(--color-text)]">
                  {summary.diaryLast30Days.toLocaleString()}편
                </span>
              </p>
            </div>
          </section>

          {/* 월별 추이 (간단한 텍스트 차트) */}
          <section className="rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/80 p-4">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">
              월별 기록 추이
            </h2>
            {monthly.length === 0 ? (
              <p className="mt-3 text-sm text-black/60">아직 통계를 만들 수 있는 기록이 없어요.</p>
            ) : (
              <div className="mt-4 space-y-3 text-xs text-black/70">
                {monthly.map((m) => {
                  const total = m.photos + m.diary;
                  const photoRatio = total === 0 ? 0 : (m.photos / total) * 100;
                  const diaryRatio = total === 0 ? 0 : (m.diary / total) * 100;
                  return (
                    <div key={m.month}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-medium">
                          {m.month.slice(0, 4)}년 {Number(m.month.slice(5))}월
                        </span>
                        <span className="text-black/50">
                          총 {total.toLocaleString()}개 (사진 {m.photos.toLocaleString()} / 일기{" "}
                          {m.diary.toLocaleString()})
                        </span>
                      </div>
                      <div className="flex h-2 overflow-hidden rounded-full bg-black/5">
                        <div
                          className="bg-[var(--color-primary)]/40"
                          style={{ width: `${photoRatio}%` }}
                        />
                        <div
                          className="bg-[var(--color-primary)]"
                          style={{ width: `${diaryRatio}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

