"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, Trash2, Edit3, MoreVertical, ImagePlus, X } from "lucide-react";
import { siteConfig } from "@/Site.config";
import { useSiteSettingsStore } from "@/stores/siteSettingsStore";
import { Button } from "@/components/shared/Button";
import { Field } from "@/components/shared/Field";
import { Input } from "@/components/shared/Input";
import { Textarea } from "@/components/shared/Textarea";
import { getAdminToken } from "@/lib/admin/clientToken";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

type DiaryItem = {
  id: string;
  title: string;
  content: string;
  entry_date: string;
  photos: string[];
  created_at: string;
};

async function fetchDiary(siteId: string): Promise<DiaryItem[]> {
  const res = await fetch(`/api/diary?siteId=${encodeURIComponent(siteId)}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { items: DiaryItem[] };
  return data.items ?? [];
}

export default function DiaryPage() {
  const layoutMode = useSiteSettingsStore((s) => s.theme.layout.mode);
  const { user } = useSupabaseUser();
  const siteId = user?.id ?? siteConfig.siteId;

  const [items, setItems] = useState<DiaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [entryDate, setEntryDate] = useState<string>("");
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const modeLabel = useMemo(
    () => (layoutMode === "timeline" ? "타임라인형" : "카드형"),
    [layoutMode],
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      const list = await fetchDiary(siteId);
      if (!alive) return;
      setItems(list);
      setIsLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [siteId]);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const remaining = 4 - photos.length;
    if (remaining <= 0) {
      alert("사진은 최대 4개까지만 첨부할 수 있어요.");
      return;
    }

    setUploadingPhotos(true);
    try {
      const adminToken = getAdminToken();
      const uploadedUrls: string[] = [];

      for (let i = 0; i < Math.min(files.length, remaining); i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("siteId", siteId);

        const res = await fetch("/api/photos", {
          method: "POST",
          headers: {
            ...(adminToken ? { "x-admin-token": adminToken } : {}),
          },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json() as { imageUrl: string };
          uploadedUrls.push(data.imageUrl);
        }
      }

      setPhotos([...photos, ...uploadedUrls]);
    } catch (err) {
      alert("사진 업로드에 실패했어요.");
    } finally {
      setUploadingPhotos(false);
    }
  }

  function removePhoto(index: number) {
    setPhotos(photos.filter((_, i) => i !== index));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError("내용을 입력해줘.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const adminToken = getAdminToken();
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
        body: JSON.stringify({
          siteId,
          title,
          content,
          entryDate: entryDate || undefined,
          photos,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || "저장에 실패했어.");
      }

      setTitle("");
      setEntryDate("");
      setContent("");
      setPhotos([]);
      setIsAddFormOpen(false);
      const list = await fetchDiary(siteId);
      setItems(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl" style={{ background: 'color-mix(in srgb, var(--color-secondary) 10%, transparent)' }}>
            <BookOpen className="w-6 h-6" style={{ color: 'var(--color-secondary)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
              일기장
            </h1>
            <p className="mt-1 text-sm text-black/60">
              현재 레이아웃: <span className="font-semibold">{modeLabel}</span>
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          일기 목록
        </h2>
        <div className="flex items-center gap-2">
          {isSelectionMode ? (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedIds(new Set());
                    setIsSelectionMode(false);
                  }}
                >
                  취소
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (selectedIds.size === 0) return;
                    if (!confirm(`${selectedIds.size}개의 일기를 삭제하시겠어요?`)) {
                      return;
                    }
                    const adminToken = getAdminToken();
                    try {
                      for (const id of selectedIds) {
                        const res = await fetch(`/api/diary/${id}`, {
                          method: "DELETE",
                          headers: adminToken
                            ? { "x-admin-token": adminToken }
                            : {},
                        });
                        if (!res.ok) {
                          throw new Error("삭제 실패");
                        }
                      }
                      setSelectedIds(new Set());
                      setIsSelectionMode(false);
                      const list = await fetchDiary(siteId);
                      setItems(list);
                    } catch (err) {
                      console.error("삭제 실패:", err);
                      alert("일부 일기 삭제에 실패했어요.");
                    }
                  }}
                  disabled={selectedIds.size === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  선택 삭제 ({selectedIds.size})
                </Button>
              </motion.div>
            </>
          ) : (
            <>
              {items.length > 0 && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" onClick={() => setIsSelectionMode(true)}>
                    선택
                  </Button>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="button"
                  onClick={() => setIsAddFormOpen(!isAddFormOpen)}
                  variant={isAddFormOpen ? "secondary" : "primary"}
                >
                  {isAddFormOpen ? "닫기" : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      일기 추가
                    </>
                  )}
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {isAddFormOpen && (
        <section className="mt-4 rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/70 p-5 shadow-sm backdrop-blur">
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            일기 추가
          </h3>
          <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
            <Field label="제목 (선택)">
              <Input
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
                placeholder="예: 오늘의 한 마디"
              />
            </Field>
            <Field label="날짜 (선택)">
              <Input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.currentTarget.value)}
              />
            </Field>
            <Field label="내용">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.currentTarget.value)}
                placeholder="오늘 있었던 일을 짧게라도 남겨봐요."
              />
            </Field>

            {/* 사진 업로드 */}
            <Field label="사진 (최대 4개)">
              <div className="space-y-3">
                {/* 사진 미리보기 그리드 */}
                {photos.length > 0 && (
                  <div className={`grid gap-2 ${
                    photos.length === 1 ? 'grid-cols-1' :
                    photos.length === 2 ? 'grid-cols-2' :
                    photos.length === 3 ? 'grid-cols-2' :
                    'grid-cols-2'
                  }`}>
                    {photos.map((url, index) => (
                      <div
                        key={index}
                        className={`relative group rounded-lg overflow-hidden ${
                          photos.length === 3 && index === 2 ? 'col-span-2' : ''
                        }`}
                        style={{ aspectRatio: photos.length === 1 ? '16/9' : '1/1' }}
                      >
                        <Image
                          src={url}
                          alt={`사진 ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* 사진 추가 버튼 */}
                {photos.length < 4 && (
                  <label className="flex items-center justify-center gap-2 h-32 rounded-lg border-2 border-dashed cursor-pointer transition-colors hover:border-[var(--color-secondary)] hover:bg-black/5"
                    style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhotos}
                      className="hidden"
                    />
                    {uploadingPhotos ? (
                      <span className="text-sm text-black/60">업로드 중...</span>
                    ) : (
                      <>
                        <ImagePlus className="w-5 h-5 text-black/40" />
                        <span className="text-sm text-black/60">
                          사진 추가 ({photos.length}/4)
                        </span>
                      </>
                    )}
                  </label>
                )}
              </div>
            </Field>

            {error ? (
              <p className="text-sm font-medium text-red-600">{error}</p>
            ) : null}
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "저장 중..." : "저장하기"}
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
          <p className="mt-3 text-sm text-black/60">아직 일기가 없어요.</p>
        ) : (
          <div
            className={
              layoutMode === "timeline"
                ? "mt-4 grid gap-4"
                : "mt-4 grid gap-4 sm:grid-cols-2"
            }
          >
            {items.map((it) => (
              <DiaryCard
                key={it.id}
                item={it}
                isSelected={selectedIds.has(it.id)}
                isSelectionMode={isSelectionMode}
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
                  if (!confirm("이 일기를 삭제하시겠어요?")) return;
                  try {
                    const adminToken = getAdminToken();
                    const res = await fetch(`/api/diary/${it.id}`, {
                      method: "DELETE",
                      headers: adminToken
                        ? { "x-admin-token": adminToken }
                        : {},
                    });
                    if (!res.ok) {
                      throw new Error("삭제 실패");
                    }
                    const list = await fetchDiary(siteId);
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

function DiaryCard({
  item,
  isSelected,
  isSelectionMode,
  onToggleSelect,
  onDelete,
}: {
  item: DiaryItem;
  isSelected: boolean;
  isSelectionMode: boolean;
  onToggleSelect: () => void;
  onDelete: () => void | Promise<void>;
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

  if (isSelectionMode) {
    return (
      <motion.article
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={onToggleSelect}
        className="cursor-pointer rounded-[var(--radius)] border-2 p-5 shadow-sm transition"
        style={{
          borderColor: isSelected ? 'var(--color-secondary)' : 'rgba(0,0,0,0.05)',
          background: isSelected ? 'color-mix(in srgb, var(--color-secondary) 10%, transparent)' : 'color-mix(in srgb, var(--color-surface) 70%, transparent)',
        }}
      >
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 h-4 w-4 rounded border-black/20 focus:ring-[var(--color-secondary)]/20"
            style={{ accentColor: 'var(--color-secondary)' }}
          />
          <div className="flex-1">
            <p className="text-xs text-black/50">{item.entry_date}</p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
              {item.title || "제목 없음"}
            </p>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative rounded-[var(--radius)] border p-5 shadow-sm transition"
      style={{
        borderColor: 'rgba(0,0,0,0.05)',
        background: 'color-mix(in srgb, var(--color-surface) 70%, transparent)'
      }}
    >
      <Link href={`/diary/${item.id}`}>
        <p className="text-xs text-black/50">{item.entry_date}</p>
        <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
          {item.title || "제목 없음"}
        </p>
        
        {/* 사진 미리보기 */}
        {item.photos && item.photos.length > 0 && (
          <div className={`mt-3 grid gap-1.5 ${
            item.photos.length === 1 ? 'grid-cols-1' :
            item.photos.length === 2 ? 'grid-cols-2' :
            item.photos.length === 3 ? 'grid-cols-3' :
            'grid-cols-2'
          }`}>
            {item.photos.slice(0, 4).map((url, index) => (
              <div
                key={index}
                className={`relative rounded-lg overflow-hidden ${
                  item.photos.length === 3 && index === 2 ? 'col-span-3' : ''
                }`}
                style={{ aspectRatio: '1/1' }}
              >
                <Image
                  src={url}
                  alt={`사진 ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="150px"
                />
              </div>
            ))}
          </div>
        )}
      </Link>
      <div className="absolute top-4 right-4" ref={menuRef}>
        <motion.button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
          aria-label="메뉴"
        >
          <MoreVertical className="h-5 w-5 text-[var(--color-text)]" />
        </motion.button>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 top-full mt-2 z-50 min-w-[160px] rounded-[var(--radius)] border border-black/10 bg-[var(--color-surface)] shadow-lg"
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen(false);
                onDelete();
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-[var(--radius)]"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>
          </motion.div>
        )}
      </div>
    </motion.article>
  );
}

