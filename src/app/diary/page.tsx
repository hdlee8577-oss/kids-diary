"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || "저장에 실패했어.");
      }

      setTitle("");
      setEntryDate("");
      setContent("");
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
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
        일기장
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-black/70">
        현재 레이아웃: <span className="font-semibold">{modeLabel}</span>
      </p>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          일기 목록
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
                선택 삭제 ({selectedIds.size})
              </Button>
            </>
          ) : (
            <>
              {items.length > 0 && (
                <Button variant="outline" onClick={() => setIsSelectionMode(true)}>
                  선택
                </Button>
              )}
              <Button
                type="button"
                onClick={() => setIsAddFormOpen(!isAddFormOpen)}
                variant={isAddFormOpen ? "secondary" : "primary"}
              >
                {isAddFormOpen ? "닫기" : "일기 추가"}
              </Button>
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
}: {
  item: DiaryItem;
  isSelected: boolean;
  isSelectionMode: boolean;
  onToggleSelect: () => void;
}) {
  if (isSelectionMode) {
    return (
      <article
        onClick={onToggleSelect}
        className={`cursor-pointer rounded-[var(--radius)] border-2 p-5 shadow-sm transition ${
          isSelected
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
            : "border-black/5 bg-[var(--color-surface)]/70 hover:border-[var(--color-primary)]/30"
        }`}
      >
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 h-4 w-4 rounded border-black/20 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/20"
          />
          <div className="flex-1">
            <p className="text-xs text-black/50">{item.entry_date}</p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
              {item.title || "제목 없음"}
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="relative rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/70 p-5 shadow-sm transition hover:shadow-md">
      <Link href={`/diary/${item.id}`}>
        <p className="text-xs text-black/50">{item.entry_date}</p>
        <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
          {item.title || "제목 없음"}
        </p>
      </Link>
      <div className="absolute top-4 right-4" ref={menuRef}>
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
          <div className="absolute right-0 top-full mt-2 z-50 min-w-[160px] rounded-[var(--radius)] border border-black/10 bg-[var(--color-surface)] shadow-lg">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen(false);
                onDelete();
              }}
              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-[var(--radius)]"
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

