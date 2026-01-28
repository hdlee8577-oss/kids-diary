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
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

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
  const thumbnailSize = useSiteSettingsStore((s) => s.theme.layout.thumbnailSize || "medium");
  const { user } = useSupabaseUser();
  const siteId = user?.id ?? siteConfig.siteId;

  const [items, setItems] = useState<PhotoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [title, setTitle] = useState("");
  const [takenAt, setTakenAt] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 검증 상수
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

  function validateFile(file: File): { valid: boolean; error?: string } {
    // 파일 형식 검증
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return {
        valid: false,
        error: `지원하지 않는 파일 형식입니다.\n지원 형식: JPG, PNG, GIF, WEBP\n선택한 파일: ${file.name}`,
      };
    }

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `파일 크기가 너무 큽니다.\n최대 크기: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB\n선택한 파일: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      };
    }

    return { valid: true };
  }

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
        setIsAddFormOpen(false);
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

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          사진 목록
        </h2>
        <div className="flex items-center gap-2">
          {isSelectionMode ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedIds(new Set());
                  setIsSelectionMode(false);
                }}
              >
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (selectedIds.size === 0) return;
                  if (!confirm(`선택한 ${selectedIds.size}개의 사진을 삭제하시겠어요?`)) {
                    return;
                  }
                  try {
                    const adminToken = getAdminToken();
                    const ids = Array.from(selectedIds).join(",");
                    const res = await fetch(`/api/photos?ids=${encodeURIComponent(ids)}`, {
                      method: "DELETE",
                      headers: {
                        ...(adminToken ? { "x-admin-token": adminToken } : {}),
                      },
                    });
                    if (!res.ok) {
                      throw new Error("삭제 실패");
                    }
                    setSelectedIds(new Set());
                    setIsSelectionMode(false);
                    const list = await fetchPhotos(siteId);
                    setItems(list);
                  } catch (err) {
                    alert("삭제 중 오류가 발생했습니다.");
                  }
                }}
                disabled={selectedIds.size === 0}
              >
                선택 삭제 ({selectedIds.size})
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsSelectionMode(true)}>
                선택
              </Button>
              <Button
                type="button"
                onClick={() => setIsAddFormOpen(!isAddFormOpen)}
                variant={isAddFormOpen ? "secondary" : "primary"}
              >
                {isAddFormOpen ? "닫기" : "사진 추가"}
              </Button>
            </>
          )}
        </div>
      </div>

      {isAddFormOpen && (
        <section className="mt-4 rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/70 p-5 shadow-sm backdrop-blur">
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            사진 추가
          </h3>
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
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              multiple
              onChange={(e) => {
                const selectedFiles = Array.from(e.currentTarget.files || []);
                
                // 각 파일 검증
                const invalidFiles: string[] = [];
                const validFiles: File[] = [];
                
                for (const file of selectedFiles) {
                  const validation = validateFile(file);
                  if (!validation.valid) {
                    invalidFiles.push(validation.error || file.name);
                  } else {
                    validFiles.push(file);
                  }
                }
                
                // 검증 실패한 파일이 있으면 팝업 표시
                if (invalidFiles.length > 0) {
                  alert(invalidFiles.join("\n\n"));
                  // input 리셋
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                  // 유효한 파일만 설정
                  setFiles(validFiles);
                } else {
                  setFiles(validFiles);
                }
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
      )}

      <section className="mt-10">
        {isLoading ? (
          <p className="mt-3 text-sm text-black/60">불러오는 중…</p>
        ) : items.length === 0 ? (
          <p className="mt-3 text-sm text-black/60">아직 사진이 없어요.</p>
        ) : (
          <div
            className={
              layoutMode === "timeline"
                ? "mt-4 grid gap-4"
                : thumbnailSize === "small"
                  ? "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
                  : thumbnailSize === "large"
                    ? "mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
                    : "mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3"
            }
          >
            {items.map((it) => (
              <PhotoCard
                key={it.id}
                item={it}
                layoutMode={layoutMode}
                thumbnailSize={thumbnailSize}
                isSelectionMode={isSelectionMode}
                isSelected={selectedIds.has(it.id)}
                onToggleSelect={() => {
                  const newSet = new Set(selectedIds);
                  if (newSet.has(it.id)) {
                    newSet.delete(it.id);
                  } else {
                    newSet.add(it.id);
                  }
                  setSelectedIds(newSet);
                }}
                onDelete={async () => {
                  if (!confirm("이 사진을 삭제하시겠어요?")) return;
                  try {
                    const adminToken = getAdminToken();
                    const res = await fetch(`/api/photos?ids=${encodeURIComponent(it.id)}`, {
                      method: "DELETE",
                      headers: {
                        ...(adminToken ? { "x-admin-token": adminToken } : {}),
                      },
                    });
                    if (!res.ok) {
                      throw new Error("삭제 실패");
                    }
                    const list = await fetchPhotos(siteId);
                    setItems(list);
                  } catch (err) {
                    alert("삭제 중 오류가 발생했습니다.");
                  }
                }}
              />
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
  thumbnailSize,
  isSelectionMode,
  isSelected,
  onToggleSelect,
  onDelete,
}: {
  item: PhotoItem;
  layoutMode: "timeline" | "cards";
  thumbnailSize: "small" | "medium" | "large";
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
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
    <article
      className={`relative rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/70 shadow-sm transition hover:shadow-md overflow-visible ${
        isSelectionMode ? "cursor-pointer" : ""
      } ${isSelected ? "ring-2 ring-[var(--color-primary)]" : ""}`}
      onClick={isSelectionMode ? onToggleSelect : undefined}
    >
      <Link href={`/photos/${item.id}`} onClick={(e) => isSelectionMode && e.preventDefault()}>
        <div className="relative aspect-[4/3] bg-black/5 overflow-hidden rounded-t-[var(--radius)]">
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
          {isSelectionMode && (
            <div className="absolute top-2 right-2">
              <div
                className={`h-6 w-6 rounded-full border-2 ${
                  isSelected
                    ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                    : "bg-white border-black/20"
                } flex items-center justify-center`}
              >
                {isSelected && (
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>
      <div className="relative p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--color-text)] truncate">
              {item.title || "제목 없음"}
            </p>
            <p className="mt-1 text-xs text-black/50">
              {item.taken_at ? `촬영일 ${item.taken_at}` : "촬영일 없음"}
            </p>
          </div>
          <div className="relative ml-2 flex-shrink-0" ref={menuRef}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
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
              <div className="absolute right-0 bottom-full mb-2 z-50 min-w-[160px] rounded-[var(--radius)] border border-black/10 bg-[var(--color-surface)] shadow-lg">
                <Link
                  href={`/photos/${item.id}/edit`}
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full px-4 py-2 text-left text-sm text-[var(--color-text)] hover:bg-black/5 first:rounded-t-[var(--radius)]"
                >
                  섬네일 수정
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onDelete();
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 last:rounded-b-[var(--radius)]"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

