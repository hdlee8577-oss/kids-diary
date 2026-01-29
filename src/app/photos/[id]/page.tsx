"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Calendar, Edit3 } from "lucide-react";
import { siteConfig } from "@/Site.config";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { getAdminToken } from "@/lib/admin/clientToken";
import { Button } from "@/components/shared/Button";

type PhotoItem = {
  id: string;
  title: string;
  image_url: string;
  taken_at: string | null;
  thumb_pos_x: number | null;
  thumb_pos_y: number | null;
  created_at: string;
};

async function fetchPhoto(id: string, siteId: string): Promise<PhotoItem | null> {
  const res = await fetch(`/api/photos?siteId=${encodeURIComponent(siteId)}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { items: PhotoItem[] };
  return data.items.find((item) => item.id === id) ?? null;
}

export default function PhotoDetailPage() {
  const params = useParams();
  const photoId = params.id as string;
  const router = useRouter();
  const { user } = useSupabaseUser();
  const siteId = user?.id ?? siteConfig.siteId;

  const [photo, setPhoto] = useState<PhotoItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      const data = await fetchPhoto(photoId, siteId);
      if (!alive) return;
      if (data) {
        setPhoto(data);
      }
      setIsLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [photoId, siteId]);

  async function handleDelete() {
    if (!confirm("이 사진을 삭제하시겠어요?")) return;

    setIsDeleting(true);
    try {
      const adminToken = getAdminToken();
      const res = await fetch(`/api/photos?ids=${encodeURIComponent(photoId)}`, {
        method: "DELETE",
        headers: {
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
      });

      if (!res.ok) {
        throw new Error("삭제 실패");
      }

      router.push("/photos");
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

  if (!photo) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm text-black/60">사진을 찾을 수 없어요.</p>
        <Link href="/photos" className="mt-4 text-sm text-[var(--color-primary)] hover:underline">
          사진첩으로 돌아가기
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
          <Link href="/photos">
            <motion.div
              whileHover={{ x: -4 }}
              className="inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: 'var(--color-primary)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              사진첩으로
            </motion.div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`/photos/${photoId}/edit`}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline">
                  <Edit3 className="w-4 h-4 mr-2" />
                  섬네일 수정
                </Button>
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
        </div>

        {/* 제목 및 메타 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6 rounded-2xl p-6"
          style={{
            background: 'color-mix(in srgb, var(--color-primary) 5%, transparent)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
          }}
        >
          <h1 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
            {photo.title || "제목 없음"}
          </h1>
          {photo.taken_at && (
            <div className="mt-3 flex items-center gap-2 text-sm text-black/70">
              <Calendar className="w-4 h-4" />
              <span>촬영일: {photo.taken_at}</span>
            </div>
          )}
        </motion.div>

        {/* 이미지 표시 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative w-full overflow-hidden rounded-2xl shadow-2xl"
          style={{
            background: 'rgba(0,0,0,0.02)',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
          }}
        >
          <Image
            src={photo.image_url}
            alt={photo.title || "photo"}
            width={1200}
            height={900}
            className="h-auto w-full object-contain"
            sizes="100vw"
            priority
          />
        </motion.div>
      </motion.div>
    </main>
  );
}
