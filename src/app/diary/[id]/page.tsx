"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Calendar, BookOpen } from "lucide-react";
import { siteConfig } from "@/Site.config";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { getAdminToken } from "@/lib/admin/clientToken";
import { Button } from "@/components/shared/Button";

type DiaryItem = {
  id: string;
  title: string;
  content: string;
  entry_date: string;
  photos: string[];
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 헤더: 뒤로가기 + 액션 버튼 */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/diary">
            <motion.div
              whileHover={{ x: -4 }}
              className="inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: 'var(--color-secondary)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              일기장으로
            </motion.div>
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </motion.div>
        </div>

        {/* 제목 및 메타 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6 rounded-2xl p-6"
          style={{
            background: 'color-mix(in srgb, var(--color-secondary) 5%, transparent)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'color-mix(in srgb, var(--color-secondary) 10%, transparent)'
          }}
        >
          <div className="flex items-center gap-2 text-sm text-black/70 mb-2">
            <Calendar className="w-4 h-4" />
            <span>{diary.entry_date}</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
            {diary.title || "제목 없음"}
          </h1>
        </motion.div>

        {/* 사진 콜라주 */}
        {diary.photos && diary.photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6 flex justify-center"
          >
            <div className={`w-full max-w-md grid gap-2 ${
              diary.photos.length === 1 ? 'grid-cols-1' :
              diary.photos.length === 2 ? 'grid-cols-2' :
              diary.photos.length === 3 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}>
              {diary.photos.map((url, index) => (
                <div
                  key={index}
                  className={`relative rounded-xl overflow-hidden shadow-lg bg-gray-100 ${
                    diary.photos.length === 3 && index === 2 ? 'col-span-2' : ''
                  }`}
                >
                  <img
                    src={url}
                    alt={`사진 ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{ 
                      aspectRatio: diary.photos.length === 1 ? '16/9' : '1/1'
                    }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 일기 본문 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="rounded-2xl p-8 shadow-xl"
          style={{
            background: 'var(--color-surface)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'rgba(0,0,0,0.05)'
          }}
        >
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-black/5">
            <div className="p-2 rounded-lg" style={{ background: 'color-mix(in srgb, var(--color-secondary) 10%, transparent)' }}>
              <BookOpen className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} />
            </div>
            <span className="text-sm font-semibold text-black/60">일기 내용</span>
          </div>
          <p className="whitespace-pre-wrap text-base leading-8 text-[var(--color-text)]">
            {diary.content}
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}
