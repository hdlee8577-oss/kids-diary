"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/Site.config";
import { useSiteSettingsStore } from "@/stores/siteSettingsStore";
import { Button } from "@/components/shared/Button";
import { Field } from "@/components/shared/Field";
import { Input } from "@/components/shared/Input";
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

async function fetchPhotos(siteId: string): Promise<PhotoItem[]> {
  const res = await fetch(`/api/photos?siteId=${encodeURIComponent(siteId)}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { items: PhotoItem[] };
  return data.items ?? [];
}


export default function PhotosPage() {
  const layoutMode = useSiteSettingsStore((s) => s.theme.layout.mode);
  const siteId = siteConfig.siteId;

  const [items, setItems] = useState<PhotoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [takenAt, setTakenAt] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const modeLabel = useMemo(
    () => (layoutMode === "timeline" ? "타임라인형" : "카드형"),
    [layoutMode],
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      const list = await fetchPhotos(siteId);
      if (!alive) return;
      setItems(list);
      setIsLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [siteId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("사진 파일을 선택해줘.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.set("siteId", siteId);
      fd.set("title", title);
      if (takenAt) fd.set("takenAt", takenAt);
      fd.set("file", file);

      const adminToken = getAdminToken();
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: adminToken ? { "x-admin-token": adminToken } : undefined,
        body: fd,
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || "업로드에 실패했어.");
      }

      setTitle("");
      setTakenAt("");
      setFile(null);
      const list = await fetchPhotos(siteId);
      setItems(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드에 실패했어.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
        사진첩
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-black/70">
        현재 레이아웃: <span className="font-semibold">{modeLabel}</span>
      </p>

      <section className="mt-8 rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/70 p-5 shadow-sm backdrop-blur">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          사진 추가
        </h2>
        <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
          <Field label="제목">
            <Input
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              placeholder="예: 첫 눈 오는 날"
            />
          </Field>
          <Field label="촬영일 (비워두면 사진정보에서 자동으로 추출)">
            <Input
              type="date"
              value={takenAt}
              onChange={(e) => setTakenAt(e.currentTarget.value)}
            />
          </Field>
          <Field label="사진 파일">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.currentTarget.files?.[0] ?? null)}
            />
          </Field>
          {error ? (
            <p className="text-sm font-medium text-red-600">{error}</p>
          ) : null}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "업로드 중..." : "추가하기"}
            </Button>
            <p className="text-xs text-black/50">
              * Supabase 설정이 안 되어 있으면 저장이 동작하지 않을 수 있어요.
            </p>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          사진 목록
        </h2>
        {isLoading ? (
          <p className="mt-3 text-sm text-black/60">불러오는 중…</p>
        ) : items.length === 0 ? (
          <p className="mt-3 text-sm text-black/60">아직 사진이 없어요.</p>
        ) : (
          <div
            className={
              layoutMode === "timeline"
                ? "mt-4 grid gap-4"
                : "mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3"
            }
          >
            {items.map((it) => (
              <PhotoCard key={it.id} item={it} layoutMode={layoutMode} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function PhotoCard({
  item,
  layoutMode,
}: {
  item: PhotoItem;
  layoutMode: "timeline" | "cards";
}) {
  const thumbPosX = item.thumb_pos_x ?? 50.0;
  const thumbPosY = item.thumb_pos_y ?? 50.0;

  return (
    <Link href={`/photos/${item.id}`}>
      <article className="overflow-hidden rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/70 shadow-sm transition hover:shadow-md">
        <div className="relative aspect-[4/3] bg-black/5">
          <Image
            src={item.image_url}
            alt={item.title || "photo"}
            fill
            className="object-cover select-none"
            style={{
              objectPosition: `${thumbPosX}% ${thumbPosY}%`,
            }}
            sizes="(max-width: 640px) 50vw, 33vw"
            draggable={false}
          />
        </div>
        <div className="p-4">
          <p className="text-sm font-semibold text-[var(--color-text)]">
            {item.title || "제목 없음"}
          </p>
          <p className="mt-1 text-xs text-black/50">
            {item.taken_at ? `촬영일 ${item.taken_at}` : "촬영일 없음"}
          </p>
        </div>
      </article>
    </Link>
  );
}

