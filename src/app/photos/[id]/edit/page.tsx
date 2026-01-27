"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/admin/clientToken";

type PhotoItem = {
  id: string;
  title: string;
  image_url: string;
  taken_at: string | null;
  thumb_pos_x: number | null;
  thumb_pos_y: number | null;
  created_at: string;
};

async function fetchPhoto(id: string): Promise<PhotoItem | null> {
  const res = await fetch(`/api/photos?siteId=default`);
  if (!res.ok) return null;
  const data = (await res.json()) as { items: PhotoItem[] };
  return data.items.find((item) => item.id === id) ?? null;
}

async function updateThumbnailPosition(
  photoId: string,
  thumbPosX: number,
  thumbPosY: number,
): Promise<boolean> {
  const adminToken = getAdminToken();
  const res = await fetch("/api/photos", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(adminToken ? { "x-admin-token": adminToken } : {}),
    },
    body: JSON.stringify({ id: photoId, thumbPosX, thumbPosY }),
  });
  return res.ok;
}

export default function EditThumbnailPage() {
  const params = useParams();
  const router = useRouter();
  const photoId = params.id as string;

  const [photo, setPhoto] = useState<PhotoItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [thumbPosX, setThumbPosX] = useState(50.0);
  const [thumbPosY, setThumbPosY] = useState(50.0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 50.0, y: 50.0 });

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      const data = await fetchPhoto(photoId);
      if (!alive) return;
      if (data) {
        setPhoto(data);
        setThumbPosX(data.thumb_pos_x ?? 50.0);
        setThumbPosY(data.thumb_pos_y ?? 50.0);
        posRef.current = { x: data.thumb_pos_x ?? 50.0, y: data.thumb_pos_y ?? 50.0 };
      }
      setIsLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [photoId]);

  // 위치가 변경될 때마다 ref 업데이트
  useEffect(() => {
    posRef.current = { x: thumbPosX, y: thumbPosY };
  }, [thumbPosX, thumbPosY]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    setThumbPosX(clampedX);
    setThumbPosY(clampedY);
  };

  const savePosition = useCallback(async () => {
    if (!photo) return;
    const currentPos = posRef.current;
    setIsSaving(true);
    try {
      await updateThumbnailPosition(photo.id, currentPos.x, currentPos.y);
      // 저장 후 사진첩으로 이동
      router.push(`/photos`);
    } catch (err) {
      console.error("Failed to save thumbnail position:", err);
      setIsSaving(false);
    }
  }, [photo, router]);

  const handleMouseUp = async () => {
    if (!isDragging) return;
    setIsDragging(false);
  };

  // 전역 마우스 이벤트 처리
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));

      setThumbPosX(clampedX);
      setThumbPosY(clampedY);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging]);

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
      <div className="mb-6">
        <Link
          href={`/photos/${photo.id}`}
          className="text-sm text-[var(--color-text)]/70 hover:text-[var(--color-text)]"
        >
          ← 상세 페이지로
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">섬네일 수정</h1>
        <p className="mt-2 text-sm text-black/60">
          사진을 드래그해서 섬네일 위치를 조정하세요
        </p>
      </div>

      {/* 현재 섬네일과 같은 사이즈로 표시 (aspect-[4/3], 카드형 기준) */}
      <div className="mx-auto max-w-md">
        <div
          ref={containerRef}
          className={`relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius)] bg-black/5 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          } ${isSaving ? "opacity-75" : ""}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Image
            src={photo.image_url}
            alt={photo.title || "photo"}
            fill
            className="object-cover select-none"
            style={{
              objectPosition: `${thumbPosX}% ${thumbPosY}%`,
            }}
            sizes="(max-width: 640px) 50vw, 33vw"
            priority
            draggable={false}
          />
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
              <div className="bg-white/90 px-4 py-2 rounded text-sm font-medium">
                {Math.round(thumbPosX)}%, {Math.round(thumbPosY)}%
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={savePosition}
          disabled={isSaving}
          className="rounded-[var(--radius)] bg-[var(--color-primary)] px-6 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
        >
          {isSaving ? "저장 중..." : "수정 완료"}
        </button>
        <Link
          href={`/photos/${photo.id}`}
          className="rounded-[var(--radius)] border border-black/10 bg-[var(--color-surface)] px-6 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-black/5"
        >
          취소
        </Link>
      </div>
    </main>
  );
}
