"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { siteConfig } from "@/Site.config";
import { useSiteSettingsStore } from "@/stores/siteSettingsStore";
import { Button } from "@/components/shared/Button";
import { Field } from "@/components/shared/Field";
import { Input } from "@/components/shared/Input";
import { Textarea } from "@/components/shared/Textarea";
import { Select } from "@/components/shared/Select";
import { getAdminToken } from "@/lib/admin/clientToken";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

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

async function fetchArtworks(siteId: string): Promise<ArtworkItem[]> {
  const res = await fetch(`/api/artworks?siteId=${encodeURIComponent(siteId)}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { items: ArtworkItem[] };
  return data.items ?? [];
}

export default function ArtworksPage() {
  const layoutMode = useSiteSettingsStore((s) => s.theme.layout.mode);
  const thumbnailSize = useSiteSettingsStore((s) => s.theme.layout.thumbnailSize || "medium");
  const { user, loading: userLoading } = useSupabaseUser();
  const siteId = user?.id ?? siteConfig.siteId;

  const [items, setItems] = useState<ArtworkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [grade, setGrade] = useState<string>("");
  const [artworkDate, setArtworkDate] = useState<string>("");
  const [momNote, setMomNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");
  const [inputType, setInputType] = useState<"file" | "url">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 검증 상수
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

  function validateFile(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return {
        valid: false,
        error: `지원하지 않는 파일 형식입니다.\n지원 형식: JPG, PNG, GIF, WEBP\n선택한 파일: ${file.name}`,
      };
    }
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `파일 크기가 너무 큽니다.\n최대 크기: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB\n선택한 파일: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      };
    }
    return { valid: true };
  }

  useEffect(() => {
    // 사용자 로딩이 완료된 후에만 데이터 조회
    if (userLoading) {
      setIsLoading(true);
      return;
    }

    let alive = true;
    (async () => {
      setIsLoading(true);
      console.log("[Artworks] Fetching with siteId:", siteId, "user:", user?.id);
      const data = await fetchArtworks(siteId);
      if (!alive) return;
      console.log("[Artworks] Fetched items:", data.length);
      setItems(data);
      setIsLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [siteId, userLoading, user?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inputType === "file" && !file) {
      setError("이미지 파일을 선택해주세요.");
      return;
    }
    if (inputType === "url" && !url.trim()) {
      setError("URL을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const adminToken = getAdminToken();
      const formData = new FormData();
      formData.append("siteId", siteId);
      formData.append("title", title || "작품");
      formData.append("description", description);
      formData.append("category", category);
      formData.append("grade", grade);
      formData.append("artworkDate", artworkDate);
      formData.append("momNote", momNote);
      formData.append("tags", JSON.stringify([]));
      
      if (inputType === "file" && file) {
        formData.append("file", file);
      } else if (inputType === "url" && url.trim()) {
        formData.append("url", url.trim());
      }

      const res = await fetch("/api/artworks", {
        method: "POST",
        headers: {
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "업로드 실패");
      }

      // 폼 리셋
      setTitle("");
      setDescription("");
      setCategory("");
      setGrade("");
      setArtworkDate("");
      setMomNote("");
      setFile(null);
      setUrl("");
      setInputType("file");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsAddFormOpen(false);

      // 목록 새로고침
      const newItems = await fetchArtworks(siteId);
      setItems(newItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteSelected() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    if (!confirm(`선택한 ${ids.length}개의 작품을 삭제하시겠어요?`)) {
      return;
    }

    try {
      const adminToken = getAdminToken();
      const idsParam = ids.join(",");
      const res = await fetch(`/api/artworks?ids=${encodeURIComponent(idsParam)}`, {
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
      const newItems = await fetchArtworks(siteId);
      setItems(newItems);
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  }

  async function handleDeleteSingle(id: string) {
    if (!confirm("이 작품을 삭제하시겠어요?")) {
      return;
    }

    try {
      const adminToken = getAdminToken();
      const res = await fetch(`/api/artworks?ids=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
      });

      if (!res.ok) {
        throw new Error("삭제 실패");
      }

      const newItems = await fetchArtworks(siteId);
      setItems(newItems);
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  }

  const modeLabel = useMemo(
    () => (layoutMode === "timeline" ? "타임라인형" : "카드형"),
    [layoutMode],
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">작품 모음</h1>
          <p className="mt-1 text-sm text-black/60">
            아이가 만든 그림, 만들기를 모아요
          </p>
        </div>
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
                onClick={handleDeleteSelected}
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
              <Button onClick={() => setIsAddFormOpen(!isAddFormOpen)}>
                {isAddFormOpen ? "닫기" : "작품 추가"}
              </Button>
            </>
          )}
        </div>
      </div>

      {isAddFormOpen && (
        <section className="mb-10 rounded-[var(--radius)] border border-black/10 bg-[var(--color-surface)] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">작품 추가</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="제목" required>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="작품 제목"
              />
            </Field>
            <Field label="설명">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="작품에 대한 설명을 입력해주세요"
                rows={3}
              />
            </Field>
            <Field label="작품 날짜">
              <Input
                type="date"
                value={artworkDate}
                onChange={(e) => setArtworkDate(e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="카테고리">
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">선택 안 함</option>
                  <option value="Art">Art</option>
                  <option value="STEM">STEM</option>
                  <option value="Writing">Writing</option>
                  <option value="Music">Music</option>
                  <option value="Other">Other</option>
                </Select>
              </Field>
              <Field label="학년">
                <Select value={grade} onChange={(e) => setGrade(e.target.value)}>
                  <option value="">선택 안 함</option>
                  <option value="Pre-K">Pre-K</option>
                  <option value="K">K</option>
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                  <option value="3rd">3rd</option>
                  <option value="4th">4th</option>
                  <option value="5th">5th</option>
                  <option value="6th">6th</option>
                  <option value="7th">7th</option>
                  <option value="8th">8th</option>
                  <option value="9th">9th</option>
                  <option value="10th">10th</option>
                  <option value="11th">11th</option>
                  <option value="12th">12th</option>
                </Select>
              </Field>
            </div>
            <Field label="엄마의 한마디">
              <Textarea
                value={momNote}
                onChange={(e) => setMomNote(e.target.value)}
                placeholder="이 작품에 대한 생각이나 느낌을 남겨주세요"
                rows={2}
              />
            </Field>
            <Field label="작품 타입" required>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="inputType"
                    value="file"
                    checked={inputType === "file"}
                    onChange={(e) => {
                      setInputType("file");
                      setUrl("");
                    }}
                    className="text-[var(--color-primary)]"
                  />
                  <span className="text-sm">이미지 파일</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="inputType"
                    value="url"
                    checked={inputType === "url"}
                    onChange={(e) => {
                      setInputType("url");
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="text-[var(--color-primary)]"
                  />
                  <span className="text-sm">URL 링크 (유튜브 등)</span>
                </label>
              </div>
            </Field>
            {inputType === "file" ? (
              <Field label="이미지 파일" required>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => {
                    const selectedFile = e.currentTarget.files?.[0];
                    if (!selectedFile) {
                      setFile(null);
                      return;
                    }
                    const validation = validateFile(selectedFile);
                    if (!validation.valid) {
                      alert(validation.error);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                      setFile(null);
                    } else {
                      setFile(selectedFile);
                    }
                  }}
                  className="cursor-pointer"
                />
                {file && (
                  <p className="mt-2 text-xs text-black/60">
                    선택된 파일: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </Field>
            ) : (
              <Field label="URL 링크" required>
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... 또는 이미지 URL"
                />
                <p className="mt-1 text-xs text-black/50">
                  유튜브, 이미지 URL 등을 입력하세요. 유튜브는 자동으로 썸네일을 가져옵니다.
                </p>
              </Field>
            )}
            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
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
          <p className="mt-3 text-sm text-black/60">아직 작품이 없어요.</p>
        ) : (
          <div
            className={
              layoutMode === "timeline"
                ? "mt-4 grid gap-4"
                : thumbnailSize === "small"
                  ? "mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4"
                  : thumbnailSize === "large"
                    ? "mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
                    : "mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3"
            }
          >
            {items.map((it) => (
              <ArtworkCard
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
                onDelete={() => handleDeleteSingle(it.id)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function ArtworkCard({
  item,
  layoutMode,
  thumbnailSize,
  isSelectionMode,
  isSelected,
  onToggleSelect,
  onDelete,
}: {
  item: ArtworkItem;
  layoutMode: "timeline" | "cards";
  thumbnailSize: "small" | "medium" | "large";
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
}) {
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
      <Link href={`/artworks/${item.id}`} onClick={(e) => isSelectionMode && e.preventDefault()}>
        <div className="relative aspect-[4/3] bg-black/5 overflow-hidden rounded-t-[var(--radius)]">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.title || "artwork"}
              fill
              className="object-cover select-none"
              sizes="(max-width: 640px) 50vw, 33vw"
              draggable={false}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-black/5 to-black/10">
              <div className="text-center">
                <span className="text-4xl">
                  {item.type === "video" ? "🎥" : item.type === "writing" ? "✍️" : "🔗"}
                </span>
                <p className="mt-2 text-xs text-black/60">
                  {item.type === "video" ? "비디오" : item.type === "writing" ? "글쓰기" : "링크"}
                </p>
              </div>
            </div>
          )}
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
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--color-text)] truncate">
              {item.title || "제목 없음"}
            </p>
            {item.artwork_date && (
              <p className="mt-1 text-xs text-black/50">
                {new Date(item.artwork_date).toLocaleDateString("ko-KR")}
              </p>
            )}
            {item.description && (
              <p className="mt-1 text-xs text-black/60 line-clamp-2">{item.description}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-1">
              {item.type !== "image" && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                  {item.type === "video" ? "🎥 비디오" : item.type === "writing" ? "✍️ 글쓰기" : "🔗 링크"}
                </span>
              )}
              {item.category && (
                <span className="inline-flex items-center rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/70">
                  {item.category}
                </span>
              )}
              {item.grade && (
                <span className="inline-flex items-center rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/70">
                  {item.grade}
                </span>
              )}
            </div>
          </div>
          {!isSelectionMode && (
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
                    href={`/artworks/${item.id}/edit`}
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full px-4 py-2 text-left text-sm text-[var(--color-text)] hover:bg-black/5 first:rounded-t-[var(--radius)]"
                  >
                    수정
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
          )}
        </div>
      </div>
    </article>
  );
}
