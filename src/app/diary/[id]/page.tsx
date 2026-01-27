"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { siteConfig } from "@/Site.config";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { getAdminToken } from "@/lib/admin/clientToken";
import { Button } from "@/components/shared/Button";

type DiaryItem = {
  id: string;
  title: string;
  content: string;
  entry_date: string;
  created_at: string;
};

async function fetchDiary(id: string, siteId: string): Promise<DiaryItem | null> {
  const res = await fetch(`/api/diary?siteId=${encodeURIComponent(siteId)}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { items: DiaryItem[] };
  return data.items.find((item) => item.id === id) ?? null;
}

export default function DiaryDetailPage() {
  const params = useParams();
  const diaryId = params.id as string;
  const router = useRouter();
  const { user } = useSupabaseUser();
  const siteId = user?.id ?? siteConfig.siteId;

  const [diary, setDiary] = useState<DiaryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      const data = await fetchDiary(diaryId, siteId);
      if (!alive) return;
      if (data) {
        setDiary(data);
      }
      setIsLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [diaryId, siteId]);

  async function handleDelete() {
    if (!confirm("이 일기를 삭제하시겠어요?")) return;

    setIsDeleting(true);
    try {
      const adminToken = getAdminToken();
      const res = await fetch(`/api/diary/${diaryId}`, {
        method: "DELETE",
        headers: adminToken
          ? { "x-admin-token": adminToken }
          : {},
      });

      if (!res.ok) {
        throw new Error("삭제 실패");
      }

      router.push("/diary");
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다.");
      setIsDeleting(false);
    }
  }

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

      <div className="mt-6 flex items-center justify-end">
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "삭제 중..." : "삭제"}
        </Button>
      </div>
    </main>
  );
}
