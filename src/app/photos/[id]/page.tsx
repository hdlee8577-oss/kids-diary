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

export default function PhotoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const photoId = params.id as string;

  const [photo, setPhoto] = useState<PhotoItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [thumbPosX, setThumbPosX] = useState(50.0);
  const [thumbPosY, setThumbPosY] = useState(50.0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
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

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditMode || e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditMode || !isDragging || !containerRef.current) return;

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
      // 사진 정보 다시 불러오기
      const updated = await fetchPhoto(photoId);
      if (updated) {
        setPhoto(updated);
        setThumbPosX(updated.thumb_pos_x ?? 50.0);
        setThumbPosY(updated.thumb_pos_y ?? 50.0);
      }
    } catch (err) {
      console.error("Failed to save thumbnail position:", err);
    } finally {
      setIsSaving(false);
    }
  }, [photo, photoId]);

  const handleMouseUp = async () => {
    if (!isDragging) return;
    setIsDragging(false);
    await savePosition();
  };

  // 전역 마우스 이벤트 처리
  useEffect(() => {
    if (!isEditMode || !isDragging) return;

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

    const handleGlobalMouseUp = async () => {
      setIsDragging(false);
      await savePosition();
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isEditMode, isDragging, savePosition]);

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
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
            aria-label="메뉴"
          >
            <svg
              className="h-5 w-5 text-[var(--color-text)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-10 z-10 min-w-[160px] rounded-[var(--radius)] border border-black/10 bg-[var(--color-surface)] shadow-lg">
              <button
                onClick={() => {
                  setIsEditMode(true);
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-[var(--color-text)] hover:bg-black/5"
              >
                섬네일 수정
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          {photo.title || "제목 없음"}
        </h1>
        {photo.taken_at && (
          <p className="mt-2 text-sm text-black/60">촬영일: {photo.taken_at}</p>
        )}
      </div>

      <div
        ref={containerRef}
        className={`relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius)] bg-black/5 ${
          isEditMode
            ? isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
            : "cursor-default"
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
          sizes="100vw"
          priority
          draggable={false}
        />
        {isEditMode && isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
            <div className="bg-white/90 px-4 py-2 rounded text-sm font-medium">
              {Math.round(thumbPosX)}%, {Math.round(thumbPosY)}%
            </div>
          </div>
        )}
        {isEditMode && !isDragging && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-sm text-white">
            사진을 드래그해서 섬네일 위치를 조정하세요
          </div>
        )}
      </div>

      {isEditMode && (
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={async () => {
              await savePosition();
              setIsEditMode(false);
            }}
            className="rounded-[var(--radius)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
          >
            저장
          </button>
          <button
            onClick={() => {
              setIsEditMode(false);
              if (photo) {
                setThumbPosX(photo.thumb_pos_x ?? 50.0);
                setThumbPosY(photo.thumb_pos_y ?? 50.0);
              }
            }}
            className="rounded-[var(--radius)] border border-black/10 bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-black/5"
          >
            취소
          </button>
        </div>
      )}
    </main>
  );
}
