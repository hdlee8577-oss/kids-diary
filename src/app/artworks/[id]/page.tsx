"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Calendar, ExternalLink, Play, Tag, MessageSquare, Palette } from "lucide-react";
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 헤더: 뒤로가기 + 액션 버튼 */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/artworks">
            <motion.div
              whileHover={{ x: -4 }}
              className="inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              작품 모음으로
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
            background: 'color-mix(in srgb, var(--color-accent) 5%, transparent)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            <h1 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
              {artwork.title || "제목 없음"}
            </h1>
          </div>
          {artwork.artwork_date && (
            <div className="flex items-center gap-2 text-sm text-black/70 mt-2">
              <Calendar className="w-4 h-4" />
              <span>작품 날짜: {new Date(artwork.artwork_date).toLocaleDateString("ko-KR")}</span>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {artwork.category && (
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium"
                style={{
                  background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)',
                  color: 'var(--color-accent)'
                }}>
                <Tag className="w-3 h-3" />
                {artwork.category}
              </span>
            )}
            {artwork.grade && (
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium"
                style={{
                  background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                  color: 'var(--color-primary)'
                }}>
                {artwork.grade}
              </span>
            )}
          </div>
          {artwork.description && (
            <p className="mt-4 text-sm text-black/70 leading-relaxed">{artwork.description}</p>
          )}
        </motion.div>

      {/* 이미지 또는 URL 콘텐츠 표시 */}
      {artwork.image_url ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl"
          style={{ background: 'rgba(0,0,0,0.02)' }}
        >
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
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-black/70 text-white shadow-2xl"
                  >
                    <Play className="h-10 w-10 fill-current" />
                  </motion.div>
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
        </motion.div>
      ) : artwork.url ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="rounded-2xl border p-8 text-center"
          style={{
            borderColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
            background: 'var(--color-surface)'
          }}
        >
          <div className="mb-4">
            <Palette className="w-16 h-16 mx-auto" style={{ color: 'var(--color-accent)' }} />
          </div>
          <p className="mb-4 text-sm text-black/70 font-medium">
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
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white"
              style={{
                background: 'linear-gradient(to right, var(--color-accent), var(--color-accent-light))',
                boxShadow: '0 4px 14px 0 color-mix(in srgb, var(--color-accent) 40%, transparent)'
              }}
            >
              링크 열기
              <ExternalLink className="h-4 w-4" />
            </motion.button>
          </a>
        </motion.div>
      ) : null}

      {/* 엄마의 한마디 */}
      {artwork.mom_note && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6 rounded-2xl p-6"
          style={{
            background: 'color-mix(in srgb, var(--color-secondary) 5%, transparent)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'color-mix(in srgb, var(--color-secondary) 10%, transparent)'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} />
            <h2 className="text-sm font-bold text-[var(--color-text)]">엄마의 한마디</h2>
          </div>
          <p className="text-sm text-black/70 leading-relaxed">{artwork.mom_note}</p>
        </motion.div>
      )}
      </motion.div>
    </main>
  );
}
