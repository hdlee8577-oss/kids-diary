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

type ArtworkItem = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  url: string | null;
  type: "image" | "video" | "writing" | "link";
  category: string | null;
  grade: string | null;
  tags: string[];
  mom_note: string | null;
  artwork_date: string | null;
  created_at: string;
};

async function fetchArtwork(id: string, siteId: string): Promise<ArtworkItem | null> {
  const res = await fetch(`/api/artworks?siteId=${encodeURIComponent(siteId)}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { items: ArtworkItem[] };
  return data.items.find((item) => item.id === id) ?? null;
}

export default function ArtworkDetailPage() {
  const params = useParams();
  const artworkId = params.id as string;
  const { user } = useSupabaseUser();
  const siteId = user?.id ?? siteConfig.siteId;

  const router = useRouter();
  const [artwork, setArtwork] = useState<ArtworkItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      const data = await fetchArtwork(artworkId, siteId);
      if (!alive) return;
      if (data) {
        setArtwork(data);
      }
      setIsLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [artworkId, siteId]);

  async function handleDelete() {
    if (!confirm("이 작품을 삭제하시겠어요?")) return;

    setIsDeleting(true);
    try {
      const adminToken = getAdminToken();
      const res = await fetch(`/api/artworks?ids=${encodeURIComponent(artworkId)}`, {
        method: "DELETE",
        headers: {
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
      });

      if (!res.ok) {
        throw new Error("삭제 실패");
      }

      router.push("/artworks");
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

  if (!artwork) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm text-black/60">작품을 찾을 수 없어요.</p>
        <Link
          href="/artworks"
          className="mt-4 text-sm text-[var(--color-primary)] hover:underline"
        >
          작품 모음으로 돌아가기
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-6">
        <Link
          href="/artworks"
          className="text-sm text-[var(--color-text)]/70 hover:text-[var(--color-text)]"
        >
          ← 작품 모음으로
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          {artwork.title || "제목 없음"}
        </h1>
        {artwork.artwork_date && (
          <p className="mt-2 text-sm text-black/60">
            작품 날짜: {new Date(artwork.artwork_date).toLocaleDateString("ko-KR")}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {artwork.category && (
            <span className="inline-flex items-center rounded-full bg-black/5 px-3 py-1 text-sm text-black/70">
              {artwork.category}
            </span>
          )}
          {artwork.grade && (
            <span className="inline-flex items-center rounded-full bg-black/5 px-3 py-1 text-sm text-black/70">
              {artwork.grade}
            </span>
          )}
        </div>
        {artwork.description && (
          <p className="mt-4 text-sm text-black/70 leading-relaxed">{artwork.description}</p>
        )}
      </div>

      {/* 이미지 또는 URL 콘텐츠 표시 */}
      {artwork.image_url ? (
        <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-[var(--radius)] bg-black/5">
          {artwork.url ? (
            <a
              href={artwork.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <Image
                src={artwork.image_url}
                alt={artwork.title || "artwork"}
                width={960}
                height={720}
                className="h-auto w-full object-contain transition-transform group-hover:scale-[1.01]"
                sizes="(max-width: 768px) 100vw, 60vw"
                priority
              />
              {artwork.type === "video" && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/70 text-white shadow-xl">
                    <svg
                      className="h-8 w-8"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </a>
          ) : (
            <Image
              src={artwork.image_url}
              alt={artwork.title || "artwork"}
              width={960}
              height={720}
              className="h-auto w-full object-contain"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
            />
          )}
        </div>
      ) : artwork.url ? (
        <div className="rounded-[var(--radius)] border border-black/10 bg-[var(--color-surface)]/50 p-8 text-center">
          <div className="mb-4 text-6xl">
            {artwork.type === "video" ? "🎥" : artwork.type === "writing" ? "✍️" : "🔗"}
          </div>
          <p className="mb-4 text-sm text-black/70">
            {artwork.type === "video"
              ? "비디오 링크"
              : artwork.type === "writing"
                ? "글쓰기 작품"
                : "외부 링크"}
          </p>
          <a
            href={artwork.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white hover:opacity-95"
          >
            링크 열기
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      ) : null}

      {/* 엄마의 한마디 */}
      {artwork.mom_note && (
        <div className="mt-6 rounded-[var(--radius)] border border-black/10 bg-[var(--color-surface)]/50 p-4">
          <h2 className="mb-2 text-sm font-semibold text-[var(--color-text)]">엄마의 한마디</h2>
          <p className="text-sm text-black/70 leading-relaxed">{artwork.mom_note}</p>
        </div>
      )}

      {/* 메타 정보 */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs text-black/50">
          <p>작성일: {new Date(artwork.created_at).toLocaleDateString("ko-KR")}</p>
        </div>
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
