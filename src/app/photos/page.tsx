"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const [files, setFiles] = useState<File[]>([]);

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
    if (files.length === 0) {
      setError("사진 파일을 선택해줘.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const adminToken = getAdminToken();
      let successCount = 0;
      let failCount = 0;
      
      // 여러 파일을 순차적으로 업로드
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fd = new FormData();
        fd.set("siteId", siteId);
        // 여러 파일일 때는 파일명을 제목으로 사용 (제목이 없으면)
        const fileTitle = files.length > 1 && !title 
          ? file.name.replace(/\.[^/.]+$/, "") 
          : title || "";
        fd.set("title", fileTitle);
        if (takenAt) fd.set("takenAt", takenAt);
        fd.set("file", file);

        try {
          const res = await fetch("/api/photos", {
            method: "POST",
            headers: adminToken ? { "x-admin-token": adminToken } : undefined,
            body: fd,
          });
          
          if (!res.ok) {
            const j = (await res.json().catch(() => null)) as { error?: string } | null;
            throw new Error(j?.error || "업로드에 실패했어.");
          }
          successCount++;
        } catch (err) {
          failCount++;
          console.error(`파일 ${file.name} 업로드 실패:`, err);
          // 마지막 파일이 아니면 계속 진행
          if (i === files.length - 1) {
            throw err;
          }
        }
      }

      if (successCount > 0) {
        setTitle("");
        setTakenAt("");
        setFiles([]);
        const list = await fetchPhotos(siteId);
        setItems(list);
        
        if (failCount > 0) {
          setError(`${successCount}개 업로드 성공, ${failCount}개 실패`);
        }
      }
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
              multiple
              onChange={(e) => {
                const selectedFiles = Array.from(e.currentTarget.files || []);
                setFiles(selectedFiles);
              }}
              className="cursor-pointer"
            />
            {files.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-black/60">
                  {files.length}개의 파일이 선택되었습니다.
                </p>
                <div className="mt-1 max-h-32 overflow-y-auto">
                  <ul className="space-y-1 text-xs text-black/50">
                    {files.map((file, index) => (
                      <li key={index} className="truncate">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <article className="group relative overflow-hidden rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/70 shadow-sm transition hover:shadow-md">
      <Link href={`/photos/${item.id}`}>
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
      </Link>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {item.title || "제목 없음"}
            </p>
            <p className="mt-1 text-xs text-black/50">
              {item.taken_at ? `촬영일 ${item.taken_at}` : "촬영일 없음"}
            </p>
          </div>
          <div className="relative ml-2" ref={menuRef}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full opacity-0 transition-opacity hover:bg-black/5 group-hover:opacity-100"
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
              <div className="absolute right-0 top-10 z-20 min-w-[160px] rounded-[var(--radius)] border border-black/10 bg-[var(--color-surface)] shadow-lg">
                <Link
                  href={`/photos/${item.id}/edit`}
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full px-4 py-2 text-left text-sm text-[var(--color-text)] hover:bg-black/5"
                >
                  섬네일 수정
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

