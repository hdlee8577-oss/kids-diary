"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { siteConfig } from "@/Site.config";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

type ArtworkItem = {
  id: string;
  title: string;
  description: string;
  image_url: string;
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

  const [artwork, setArtwork] = useState<ArtworkItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

      {/* 전체 이미지 표시 */}
      <div className="relative w-full overflow-hidden rounded-[var(--radius)] bg-black/5">
        <Image
          src={artwork.image_url}
          alt={artwork.title || "artwork"}
          width={1200}
          height={900}
          className="h-auto w-full object-contain"
          sizes="100vw"
          priority
        />
      </div>

      {/* 엄마의 한마디 */}
      {artwork.mom_note && (
        <div className="mt-6 rounded-[var(--radius)] border border-black/10 bg-[var(--color-surface)]/50 p-4">
          <h2 className="mb-2 text-sm font-semibold text-[var(--color-text)]">엄마의 한마디</h2>
          <p className="text-sm text-black/70 leading-relaxed">{artwork.mom_note}</p>
        </div>
      )}

      {/* 메타 정보 */}
      <div className="mt-6 text-xs text-black/50">
        <p>작성일: {new Date(artwork.created_at).toLocaleDateString("ko-KR")}</p>
      </div>
    </main>
  );
}
