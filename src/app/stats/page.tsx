"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Camera, BookOpen, TrendingUp, Calendar } from "lucide-react";
import { siteConfig } from "@/Site.config";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

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
  const { user } = useSupabaseUser();
  const siteId = user?.id ?? siteConfig.siteId;
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
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl" style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
            <BarChart3 className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
              통계
            </h1>
            <p className="mt-1 text-sm text-black/60">
              지금까지 기록한 사진과 일기를 한눈에 볼 수 있는 간단한 통계예요.
            </p>
          </div>
        </div>
      </motion.header>

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
          <section className="mb-10 grid gap-4 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="rounded-2xl p-6 shadow-xl"
              style={{
                background: 'linear-gradient(135deg, white, color-mix(in srgb, var(--color-primary) 5%, transparent))',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)'
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                  <Camera className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wide text-black/60">
                  전체 사진
                </p>
              </div>
              <p className="text-3xl font-bold text-[var(--color-text)]">
                {summary.totalPhotos.toLocaleString()}<span className="text-xl text-black/50">장</span>
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-black/60">
                <TrendingUp className="w-3 h-3" />
                최근 30일:{" "}
                <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                  {summary.photosLast30Days.toLocaleString()}장
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="rounded-2xl p-6 shadow-xl"
              style={{
                background: 'linear-gradient(135deg, white, color-mix(in srgb, var(--color-secondary) 5%, transparent))',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: 'color-mix(in srgb, var(--color-secondary) 20%, transparent)'
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ background: 'color-mix(in srgb, var(--color-secondary) 10%, transparent)' }}>
                  <BookOpen className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wide text-black/60">
                  전체 일기
                </p>
              </div>
              <p className="text-3xl font-bold text-[var(--color-text)]">
                {summary.totalDiary.toLocaleString()}<span className="text-xl text-black/50">편</span>
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-black/60">
                <TrendingUp className="w-3 h-3" />
                최근 30일:{" "}
                <span className="font-bold" style={{ color: 'var(--color-secondary)' }}>
                  {summary.diaryLast30Days.toLocaleString()}편
                </span>
              </div>
            </motion.div>
          </section>

          {/* 월별 추이 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="rounded-2xl p-6 shadow-xl"
            style={{
              background: 'var(--color-surface)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'rgba(0,0,0,0.05)'
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              <h2 className="text-base font-bold text-[var(--color-text)]">
                월별 기록 추이
              </h2>
            </div>
            {monthly.length === 0 ? (
              <p className="mt-3 text-sm text-black/60">아직 통계를 만들 수 있는 기록이 없어요.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {monthly.map((m, index) => {
                  const total = m.photos + m.diary;
                  const photoRatio = total === 0 ? 0 : (m.photos / total) * 100;
                  const diaryRatio = total === 0 ? 0 : (m.diary / total) * 100;
                  return (
                    <motion.div
                      key={m.month}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
                    >
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-bold text-[var(--color-text)]">
                          {m.month.slice(0, 4)}년 {Number(m.month.slice(5))}월
                        </span>
                        <span className="text-xs text-black/60">
                          총 <span className="font-bold text-[var(--color-text)]">{total.toLocaleString()}</span>개 
                          <span className="mx-1">·</span>
                          사진 <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{m.photos.toLocaleString()}</span> 
                          <span className="mx-1">·</span>
                          일기 <span className="font-bold" style={{ color: 'var(--color-secondary)' }}>{m.diary.toLocaleString()}</span>
                        </span>
                      </div>
                      <div className="flex h-3 overflow-hidden rounded-full bg-black/5 shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${photoRatio}%` }}
                          transition={{ delay: 0.5 + index * 0.05, duration: 0.8, ease: "easeOut" }}
                          className="transition-all duration-300"
                          style={{ 
                            background: 'linear-gradient(to right, var(--color-primary), var(--color-primary-light))'
                          }}
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${diaryRatio}%` }}
                          transition={{ delay: 0.5 + index * 0.05, duration: 0.8, ease: "easeOut" }}
                          className="transition-all duration-300"
                          style={{ 
                            background: 'linear-gradient(to right, var(--color-secondary), var(--color-secondary-light))'
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.section>
        </>
      )}
    </main>
  );
}

