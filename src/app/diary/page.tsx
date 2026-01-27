"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/Site.config";
import { useSiteSettingsStore } from "@/stores/siteSettingsStore";
import { Button } from "@/components/shared/Button";
import { Field } from "@/components/shared/Field";
import { Input } from "@/components/shared/Input";
import { Textarea } from "@/components/shared/Textarea";
import { getAdminToken } from "@/lib/admin/clientToken";

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
  const siteId = siteConfig.siteId;

  const [items, setItems] = useState<DiaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [entryDate, setEntryDate] = useState<string>("");
  const [content, setContent] = useState("");

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Record<string, true>>({});

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
      const list = await fetchDiary(siteId);
      setItems(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedCount = useMemo(
    () => Object.keys(selectedIds).length,
    [selectedIds],
  );

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      if (prev[id]) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: true };
    });
  }

  async function deleteSelected() {
    const ids = Object.keys(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`선택한 일기 ${ids.length}개를 삭제할까요?`)) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const adminToken = getAdminToken();
      const res = await fetch("/api/diary", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
        body: JSON.stringify({ siteId, ids }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || "삭제에 실패했어.");
      }
      setSelectedIds({});
      setIsSelectMode(false);
      const list = await fetchDiary(siteId);
      setItems(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했어.");
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

      <section className="mt-8 rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/70 p-5 shadow-sm backdrop-blur">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          일기 추가
        </h2>
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
            <Button type="submit" isLoading={isSubmitting}>
              저장하기
            </Button>
            <p className="text-xs text-black/50">
              * Supabase 설정이 안 되어 있으면 저장이 동작하지 않을 수 있어요.
            </p>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[var(--color-text)]">
            일기 목록
          </h2>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsSelectMode((v) => !v);
                setSelectedIds({});
              }}
              disabled={isSubmitting || isLoading}
            >
              {isSelectMode ? "선택 해제" : "선택"}
            </Button>
            {isSelectMode ? (
              <Button
                type="button"
                size="sm"
                onClick={deleteSelected}
                disabled={isSubmitting || selectedCount === 0}
              >
                선택 삭제 ({selectedCount})
              </Button>
            ) : null}
          </div>
        </div>
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
              <article
                key={it.id}
                className="rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/70 p-5 shadow-sm"
              >
                {isSelectMode ? (
                  <button
                    type="button"
                    onClick={() => toggleSelected(it.id)}
                    className="block w-full text-left"
                  >
                    <p className="text-xs text-black/50">{it.entry_date}</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                      {it.title || "제목 없음"}
                    </p>
                  </button>
                ) : (
                  <Link href={`/diary/${it.id}`} className="block">
                    <p className="text-xs text-black/50">{it.entry_date}</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                      {it.title || "제목 없음"}
                    </p>
                  </Link>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

