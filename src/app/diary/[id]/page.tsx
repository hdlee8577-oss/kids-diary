"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type DiaryItem = {
  id: string;
  title: string;
  content: string;
  entry_date: string;
  created_at: string;
};

async function fetchDiary(id: string): Promise<DiaryItem | null> {
  const res = await fetch(`/api/diary?siteId=default`);
  if (!res.ok) return null;
  const data = (await res.json()) as { items: DiaryItem[] };
  return data.items.find((item) => item.id === id) ?? null;
}

export default function DiaryDetailPage() {
  const params = useParams();
  const diaryId = params.id as string;

  const [diary, setDiary] = useState<DiaryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      const data = await fetchDiary(diaryId);
      if (!alive) return;
      if (data) {
        setDiary(data);
      }
      setIsLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [diaryId]);

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm text-black/60">불러오는 중…</p>
      </main>
    );
  }

  if (!diary) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm text-black/60">일기를 찾을 수 없어요.</p>
        <Link href="/diary" className="mt-4 text-sm text-[var(--color-primary)] hover:underline">
          일기장으로 돌아가기
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-6">
        <Link
          href="/diary"
          className="text-sm text-[var(--color-text)]/70 hover:text-[var(--color-text)]"
        >
          ← 일기장으로
        </Link>
      </div>

      <div className="mb-6">
        <p className="text-sm text-black/50">{diary.entry_date}</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
          {diary.title || "제목 없음"}
        </h1>
      </div>

      <div className="rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/70 p-6 shadow-sm">
        <p className="whitespace-pre-wrap text-base leading-7 text-[var(--color-text)]">
          {diary.content}
        </p>
      </div>
    </main>
  );
}
