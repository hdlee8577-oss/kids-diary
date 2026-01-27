"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/photos"
          className="text-sm text-[var(--color-text)]/70 hover:text-[var(--color-text)]"
        >
          ← 사진첩으로
        </Link>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "삭제 중..." : "삭제"}
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          {photo.title || "제목 없음"}
        </h1>
        {photo.taken_at && (
          <p className="mt-2 text-sm text-black/60">촬영일: {photo.taken_at}</p>
        )}
      </div>

      {/* 전체 이미지 표시 */}
      <div className="relative w-full overflow-hidden rounded-[var(--radius)] bg-black/5">
        <Image
          src={photo.image_url}
          alt={photo.title || "photo"}
          width={1200}
          height={900}
          className="h-auto w-full object-contain"
          sizes="100vw"
          priority
        />
      </div>
    </main>
  );
}
